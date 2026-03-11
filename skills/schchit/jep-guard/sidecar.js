/**
 * JEP Guard for OpenClaw
 * Sidecar - Intercepts high-risk commands and requires user approval
 * Now with JEP Receipt generation and config command
 */

const HIGH_RISK_COMMANDS = [
  'rm', 'rmdir', 'mv', 'cp', 'format', 'dd', 'truncate'
];

const LOG_PATH = process.env.HOME + '/.jep-guard-audit.log';
const CONFIG_PATH = process.env.HOME + '/.jep-guard-config.json';

// Try to load JEP SDK
let jepSdk;
try {
  jepSdk = require('@jep-eth/sdk');
} catch (e) {
  // SDK not available, will use fallback
  console.log('JEP SDK not found, using basic logging');
}

/**
 * Read user configuration
 */
async function readConfig() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    // Default config if file doesn't exist
    return { 
      enabled: true, 
      autoApprove: [],
      logLevel: 'verbose',
      jepEnabled: true
    };
  }
}

/**
 * Save user configuration
 */
async function saveConfig(config) {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

/**
 * Generate UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate JEP Receipt for an action
 */
async function generateJEPReceipt(command, args, context, auth) {
  if (!jepSdk || !context.config?.jepEnabled) {
    return { hash: 'pending-' + generateUUID() };
  }
  
  try {
    const decisionData = {
      command,
      args,
      user: context.user,
      timestamp: new Date().toISOString(),
      auth: auth
    };
    
    const receipt = jepSdk.createReceipt({
      actor: context.user,
      decisionHash: await jepSdk.hashReceipt(decisionData),
      authorityScope: 'clawbot-command',
      valid: {
        from: Math.floor(Date.now() / 1000),
        until: Math.floor(Date.now() / 1000) + 86400 * 365 // 1 year
      }
    });
    
    // In production, user would provide their private key
    const signed = await jepSdk.signReceipt(receipt, 'dev-key-placeholder');
    const hash = await jepSdk.hashReceipt(receipt);
    
    return {
      receipt: signed,
      hash: hash
    };
  } catch (e) {
    console.error('Failed to generate JEP receipt:', e);
    return { hash: 'error-' + generateUUID() };
  }
}

/**
 * Log action to audit file with JEP Receipt
 */
async function logAction(command, args, auth, context) {
  // Generate JEP Receipt
  const { receipt, hash } = await generateJEPReceipt(command, args, context, auth);
  
  const logEntry = {
    id: generateUUID(),
    timestamp: new Date().toISOString(),
    command: command,
    args: args,
    user: context.user,
    auth: auth,
    jep: {
      version: '1.0',
      receiptHash: hash,
      receipt: receipt,
      verifyUrl: `https://jep-verify.vercel.app/verify/${hash}`
    }
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  
  try {
    await fs.appendFile(LOG_PATH, logLine);
  } catch (e) {
    console.error('Failed to write audit log:', e.message);
  }
  
  return logEntry;
}

/**
 * Handle config command
 */
async function handleConfigCommand(args, context) {
  const config = await readConfig();
  
  if (args.length === 0) {
    // Show current config
    return {
      output: JSON.stringify(config, null, 2),
      mimeType: 'application/json'
    };
  }
  
  const subCommand = args[0];
  
  if (subCommand === 'toggle') {
    config.enabled = !config.enabled;
    await saveConfig(config);
    await context.ui.notify(`JEP Guard ${config.enabled ? 'enabled' : 'disabled'}`);
    return { allow: true };
  }
  
  if (subCommand === 'set' && args[1] && args[2]) {
    const key = args[1];
    const value = args[2];
    
    if (key === 'logLevel') {
      config.logLevel = value;
    } else if (key === 'jepEnabled') {
      config.jepEnabled = value === 'true';
    }
    
    await saveConfig(config);
    await context.ui.notify(`Config updated: ${key}=${value}`);
    return { allow: true };
  }
  
  return {
    output: 'Usage: claw run jep-guard config [toggle|set <key> <value>]',
    mimeType: 'text/plain'
  };
}

/**
 * Main hook function - called before every command
 */
module.exports = async function beforeCommand(command, args, context) {
  // Handle jep-guard internal commands
  if (command === 'jep-guard') {
    if (args[0] === 'config') {
      return await handleConfigCommand(args.slice(1), context);
    }
    if (args[0] === 'export') {
      // This will be handled by export.js
      return { allow: true };
    }
  }
  
  // 1. Read config
  const config = await readConfig();
  context.config = config;
  
  // 2. Check if it's a high-risk command
  if (!HIGH_RISK_COMMANDS.includes(command)) {
    // Still log low-risk commands if logLevel is verbose
    if (config.logLevel === 'verbose') {
      await logAction(command, args, { autoLogged: true }, context);
    }
    return { allow: true };
  }

  // 3. Check if JEP Guard is enabled
  if (!config.enabled) {
    return { allow: true };
  }

  // 4. Check for temporary auth token
  const tempAuth = context.env.JEP_TEMP_AUTH;
  if (tempAuth) {
    const now = Math.floor(Date.now() / 1000);
    if (tempAuth.expires > now) {
      await logAction(command, args, tempAuth, context);
      return { allow: true };
    }
  }

  // 5. Check auto-approve list
  const commandLine = command + ' ' + args.join(' ');
  if (config.autoApprove.includes(commandLine)) {
    await logAction(command, args, { autoApproved: true }, context);
    return { allow: true };
  }

  // 6. No valid auth - ask user
  const userChoice = await context.ui.confirm({
    title: '⚠️ High-Risk Operation',
    message: `Clawbot wants to execute:\n\n${commandLine}\n\nAllow this one time?`,
    buttons: ['✅ Allow Once', '🚫 Deny', '⚙️ Settings', '🔓 Always Allow'],
    timeout: 30000
  });

  // 7. Handle user choice
  if (userChoice === '✅ Allow Once') {
    const tempAuth = {
      id: generateUUID(),
      expires: Math.floor(Date.now() / 1000) + 300, // 5 minutes
      command: commandLine,
      approvedAt: new Date().toISOString()
    };
    
    await logAction(command, args, tempAuth, context);
    
    return {
      allow: true,
      env: { JEP_TEMP_AUTH: tempAuth }
    };
  } 
  else if (userChoice === '🔓 Always Allow') {
    // Add to auto-approve list
    config.autoApprove.push(commandLine);
    await saveConfig(config);
    
    await logAction(command, args, { autoApproved: true }, context);
    await context.ui.notify(`✅ Added to auto-approve list`);
    
    return { allow: true };
  }
  else if (userChoice === '⚙️ Settings') {
    // Show settings menu
    const settingChoice = await context.ui.confirm({
      title: 'JEP Guard Settings',
      message: `Current: ${config.enabled ? 'Enabled' : 'Disabled'}\nLog level: ${config.logLevel}`,
      buttons: ['Toggle On/Off', 'Change Log Level', 'Back']
    });
    
    if (settingChoice === 'Toggle On/Off') {
      config.enabled = !config.enabled;
      await saveConfig(config);
      await context.ui.notify(`JEP Guard ${config.enabled ? 'enabled' : 'disabled'}`);
    } else if (settingChoice === 'Change Log Level') {
      config.logLevel = config.logLevel === 'verbose' ? 'minimal' : 'verbose';
      await saveConfig(config);
    }
    
    return { allow: false };
  }
  else {
    // User denied
    await logAction(command, args, { denied: true }, context);
    return { allow: false, reason: 'User denied' };
  }
};
