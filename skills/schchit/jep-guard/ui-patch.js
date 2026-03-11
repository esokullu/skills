/**
 * JEP Guard - Installation UI
 * Shows welcome message when plugin is installed
 */

module.exports = async function onInstall(context) {
  await context.ui.notify({
    title: '🛡️ JEP Guard Installed',
    message: 'JEP Guard is now protecting your Clawbot.\n\n' +
             'High-risk commands like rm will now require your confirmation.\n\n' +
             'Check README for more features.',
    duration: 8000
  });
  
  // Create default config
  const config = {
    enabled: true,
    autoApprove: [],
    createdAt: new Date().toISOString()
  };
  
  await fs.writeFile(
    process.env.HOME + '/.jep-guard-config.json',
    JSON.stringify(config, null, 2)
  );
  
  return true;
};
