const cron = require('node-cron');
const { updatePrices } = require('./update-prices');

console.log('⏰ One Piece TCG Price Tracker Scheduler');
console.log('=====================================\n');

// Schedule daily update at 3:00 AM
const job = cron.schedule('0 3 * * *', async () => {
    console.log('\n🌅 Running scheduled price update...');
    await updatePrices();
}, {
    scheduled: true,
    timezone: 'Asia/Shanghai'
});

console.log('✅ Scheduled: Daily at 3:00 AM (Asia/Shanghai)');
console.log('📝 Cron expression: 0 3 * * *');
console.log('\nPress Ctrl+C to stop\n');

// Run once on startup
console.log('🚀 Running initial update...\n');
updatePrices().then(() => {
    console.log('\n⏳ Waiting for next scheduled run...\n');
});

// Keep process alive
process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping scheduler...');
    job.stop();
    process.exit(0);
});
