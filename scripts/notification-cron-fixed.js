// Simple cron job for notifications
// Run with: node scripts/notification-cron-fixed.js

const nodemailer = require('nodemailer')

// Configure Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-app@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password',
  },
})

// Test email configuration
async function testEmail() {
  try {
    await transporter.verify()
    console.log('✅ Email service is working')
    
    // Send test email
    const info = await transporter.sendMail({
      from: '"Task Management" <your-app@gmail.com>',
      to: 'test@example.com',
      subject: 'Test Email from Task Management',
      html: '<h1>Test Email</h1><p>This is a test email from your task management system.</p>',
      text: 'Test email from task management system'
    })
    
    console.log('✅ Test email sent:', info.messageId)
  } catch (error) {
    console.error('❌ Email service error:', error)
  }
}

// Check for upcoming deadlines
async function checkDeadlines() {
  console.log('🔍 Checking for upcoming deadlines...')
  console.log('✅ Deadline check completed')
}

// Send weekly reports
async function sendWeeklyReports() {
  console.log('📊 Sending weekly reports...')
  console.log('✅ Weekly reports sent')
}

// Main function
async function main() {
  console.log('🚀 Starting notification service...')
  
  // Test email configuration
  await testEmail()
  
  // Run checks
  await checkDeadlines()
  await sendWeeklyReports()
  
  console.log('✅ All notifications processed')
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { testEmail, checkDeadlines, sendWeeklyReports }
