/**
 * JEP Guard - Export audit logs with JEP Receipts
 * Users can run: claw run jep-guard export
 */

// 动态引入 JEP SDK（如果可用）
let jepSdk;
try {
  jepSdk = require('@jep-eth/sdk');
} catch (e) {
  // SDK not available, will use fallback
}

/**
 * Generate a JEP Receipt for an action
 */
async function generateJEPReceipt(action, context) {
  // If SDK is available, use it
  if (jepSdk) {
    const receipt = jepSdk.createReceipt({
      actor: context.user,
      decisionHash: await jepSdk.hashReceipt({
        action: action.command,
        args: action.args,
        timestamp: action.timestamp
      }),
      authorityScope: 'clawbot-command',
      validUntil: Math.floor(Date.now() / 1000) + 86400 * 365 // 1 year
    });
    
    // Sign with a default key (in production, user would provide their own)
    const signed = await jepSdk.signReceipt(receipt, 'default-key-placeholder');
    const hash = await jepSdk.hashReceipt(receipt);
    
    return {
      receipt: signed,
      hash: hash
    };
  }
  
  // Fallback: generate a simple hash
  return {
    receipt: null,
    hash: 'pending-' + Math.random().toString(36).substring(2)
  };
}

/**
 * Main export function
 */
module.exports = async function exportLogs(context) {
  const LOG_PATH = process.env.HOME + '/.jep-guard-audit.log';
  
  try {
    // Read audit logs
    const logs = await fs.readFile(LOG_PATH, 'utf8');
    const entries = logs.split('\n').filter(l => l).map(JSON.parse);
    
    // Generate JEP Receipts for each entry (if not already present)
    const enhancedEntries = await Promise.all(entries.map(async (entry) => {
      if (!entry.receiptHash) {
        const { receipt, hash } = await generateJEPReceipt(entry, context);
        entry.receipt = receipt;
        entry.receiptHash = hash;
        entry.jepVersion = '1.0';
      }
      return entry;
    }));
    
    // Generate a summary Receipt for the entire export
    const exportReceipt = jepSdk ? jepSdk.createReceipt({
      actor: context.user,
      decisionHash: await jepSdk.hashReceipt({
        exportTime: new Date().toISOString(),
        count: enhancedEntries.length
      }),
      authorityScope: 'jep-guard-export'
    }) : null;
    
    const output = {
      exportedAt: new Date().toISOString(),
      user: context.user,
      totalEntries: enhancedEntries.length,
      jepVersion: '1.0',
      exportReceipt: exportReceipt ? await jepSdk.hashReceipt(exportReceipt) : null,
      logs: enhancedEntries,
      verifyInstructions: 'You can verify any receipt at https://jep-verify.vercel.app/verify'
    };
    
    // Save a copy with receipts
    const exportPath = process.env.HOME + `/jep-audit-${Date.now()}.json`;
    await fs.writeFile(exportPath, JSON.stringify(output, null, 2));
    
    return {
      output: JSON.stringify(output, null, 2),
      mimeType: 'application/json',
      message: `✅ Exported ${enhancedEntries.length} entries with JEP receipts to ${exportPath}`
    };
  } catch (e) {
    return {
      output: JSON.stringify({ 
        error: 'No audit logs found',
        hint: 'Run some commands first to generate logs'
      }, null, 2),
      mimeType: 'application/json'
    };
  }
};
