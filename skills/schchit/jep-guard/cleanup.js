/**
 * JEP Guard - Cleanup on uninstall
 */

module.exports = async function onUninstall(context) {
  // Ask user if they want to keep audit logs
  const choice = await context.ui.confirm({
    title: '🗑️ JEP Guard Uninstall',
    message: 'Do you want to keep your audit logs?',
    buttons: ['✅ Keep Logs', '🗑️ Delete Logs']
  });
  
  if (choice === '🗑️ Delete Logs') {
    try {
      await fs.unlink(process.env.HOME + '/.jep-guard-audit.log');
    } catch (e) {
      // File might not exist
    }
  }
  
  await context.ui.notify('JEP Guard removed. Thanks for trying!');
  return true;
};
