# Notification System Setup Guide

## Overview
This guide will help you set up the complete email notification system for task management.

## Features Implemented
✅ **Task Deadline Reminders** - Get notified before task deadlines
✅ **Task Assignment Notifications** - Receive emails when assigned new tasks
✅ **Weekly Summary Reports** - Get weekly progress reports via email
✅ **Configurable Preferences** - Customize notification settings

## Setup Instructions

### 1. Email Configuration (Gmail - Free)

1. **Create Gmail App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-factor authentication
   - Generate an App Password for "Mail"
   - Copy the 16-character password

2. **Update Environment Variables**:
   ```bash
   # Copy .env.example to .env.local
   cp .env.example .env.local
   
   # Edit .env.local with your credentials
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-char-app-password
   ```

### 2. Database Setup (Already Done)
The system uses your existing PostgreSQL database with the `users_sync` and `tasks` tables.

### 3. Notification Preferences
The settings page now includes fully functional notification preferences:
- Email address configuration
- Toggle task reminders
- Toggle email notifications for assignments
- Toggle weekly reports
- Configure reminder timing (1-48 hours before deadline)

### 4. Testing the System

#### Test Email Configuration
```bash
node scripts/notification-cron.js
```

#### Manual Testing
1. Go to Settings page (`/settings`)
2. Configure your email address
3. Enable desired notifications
4. Create a task with a due date
5. Check your email for notifications

### 5. Automated Notifications

#### Cron Job Setup (Linux/Mac)
Add to crontab:
```bash
# Check deadlines every hour
0 * * * * cd /path/to/project && node scripts/notification-cron.js

# Send weekly reports every Monday at 9 AM
0 9 * * 1 cd /path/to/project && node scripts/notification-cron.js weekly
```

#### Windows Task Scheduler
1. Open Task Scheduler
2. Create new task
3. Set trigger: Daily at 9 AM
4. Set action: `node scripts/notification-cron.js`

### 6. API Integration

The task API now automatically triggers notifications when:
- A task is assigned to a user
- A task deadline is approaching
- Weekly reports are generated

### 7. Troubleshooting

#### Common Issues

**"Email not sending"**:
- Check Gmail app password is correct
- Ensure "Less secure apps" is enabled in Gmail
- Verify environment variables are set

**"No notifications received"**:
- Check notification preferences in Settings
- Ensure email address is configured
- Verify task has due date and assigned user

**"TypeScript errors"**:
- Run `pnpm build` to check for type issues
- Ensure all dependencies are installed

### 8. Customization

#### Email Templates
Edit `lib/email-service-new.ts` to customize:
- Email subject lines
- HTML email templates
- Plain text versions

#### Notification Timing
Modify `lib/notification-preferences.ts` to change:
- Default reminder hours
- Available reminder options
- Default notification settings

### 9. Production Deployment

For production, consider:
- Using a transactional email service (SendGrid, AWS SES)
- Setting up proper email queues
- Adding unsubscribe links
- Implementing rate limiting

## Usage Examples

### Send Task Assignment Notification
```javascript
import { notificationService } from '@/lib/notification-service-fixed'

await notificationService.sendTaskAssignmentNotification(taskId, assigneeId, assignedById)
```

### Check Upcoming Deadlines
```javascript
await notificationService.checkUpcomingDeadlines()
```

### Send Weekly Report
```javascript
await notificationService.sendWeeklyReport(userId)
```

## Support
If you encounter issues, check the browser console for error messages and ensure your Gmail app password is correctly configured.
