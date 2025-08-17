import { emailService } from './email-service-new'
import { useNotificationStore } from './notification-preferences'
import { useAuthStore } from './store'
import { sql } from './database'

export class NotificationService {
  async sendTaskAssignmentNotification(taskId: number, assigneeId: string, assignedById: string) {
    try {
      // Get task and user details
      const taskResult = await sql`
        SELECT t.title, t.description, t.due_date, u.email, u.name as assignee_name
        FROM tasks t
        JOIN users_sync u ON t.assigned_to = u.id
        WHERE t.id = ${taskId}
      `

      if (taskResult.length === 0) return

      const task = taskResult[0]
      const { preferences } = useNotificationStore.getState()
      
      if (!preferences.emailNotifications || !preferences.emailAddress) return

      // Get assigned by user name
      const assignedByResult = await sql`
        SELECT name FROM users_sync WHERE id = ${assignedById}
      `
      const assignedByName = assignedByResult[0]?.name || 'System'

      await emailService.sendTaskAssignment(preferences.emailAddress, {
        taskTitle: task.title,
        assigneeName: task.assignee_name,
        assignedBy: assignedByName,
        taskUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`
      })

    } catch (error) {
      console.error('Error sending task assignment notification:', error)
    }
  }

  async sendTaskReminder(taskId: number) {
    try {
      const taskResult = await sql`
        SELECT t.title, t.due_date, u.email, u.name as assignee_name
        FROM tasks t
        JOIN users_sync u ON t.assigned_to = u.id
        WHERE t.id = ${taskId} AND t.status != 'completed'
      `

      if (taskResult.length === 0) return

      const task = taskResult[0]
      const { preferences } = useNotificationStore.getState()
      
      if (!preferences.taskReminders || !preferences.emailAddress) return

      const dueDate = new Date(task.due_date)
      const formattedDueDate = dueDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      await emailService.sendTaskReminder(preferences.emailAddress, {
        taskTitle: task.title,
        dueDate: formattedDueDate,
        assigneeName: task.assignee_name,
        taskUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`
      })

    } catch (error) {
      console.error('Error sending task reminder:', error)
    }
  }

  async sendWeeklyReport(userId: string) {
    try {
      const userResult = await sql`
        SELECT email, name FROM users_sync WHERE id = ${userId}
      `

      if (userResult.length === 0) return

      const user = userResult[0]
      const { preferences } = useNotificationStore.getState()
      
      if (!preferences.weeklyReports || !preferences.emailAddress) return

      // Calculate date range for the past week
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      // Get task statistics
      const statsResult = await sql`
        SELECT 
          COUNT(CASE WHEN status = 'completed' AND updated_at >= ${startDate.toISOString()} THEN 1 END) as completed,
          COUNT(CASE WHEN status != 'completed' THEN 1 END) as pending,
          COUNT(CASE WHEN status != 'completed' AND due_date < ${endDate.toISOString()} THEN 1 END) as overdue
        FROM tasks
        WHERE assigned_to = ${userId}
      `

      const stats = statsResult[0]

      const formattedStartDate = startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      const formattedEndDate = endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })

      await emailService.sendWeeklyReport(preferences.emailAddress, {
        userName: user.name,
        completedTasks: parseInt(stats.completed) || 0,
        pendingTasks: parseInt(stats.pending) || 0,
        overdueTasks: parseInt(stats.overdue) || 0,
        weekStart: formattedStartDate,
        weekEnd: formattedEndDate
      })

    } catch (error) {
      console.error('Error sending weekly report:', error)
    }
  }

  async checkUpcomingDeadlines() {
    try {
      const { preferences } = useNotificationStore.getState()
      
      if (!preferences.taskReminders || !preferences.emailAddress) return

      const now = new Date()
      const reminderTime = new Date(now.getTime() + (preferences.reminderHoursBefore * 60 * 60 * 1000))
      
      // Find tasks due within the reminder window
      const upcomingTasks = await sql`
        SELECT t.id, t.title, t.due_date, u.email, u.name as assignee_name
        FROM tasks t
        JOIN users_sync u ON t.assigned_to = u.id
        WHERE t.due_date <= ${reminderTime.toISOString()}
          AND t.due_date > ${now.toISOString()}
          AND t.status != 'completed'
      `

      for (const task of upcomingTasks) {
        await this.sendTaskReminder(task.id)
      }

    } catch (error) {
      console.error('Error checking upcoming deadlines:', error)
    }
  }
}

export const notificationService = new NotificationService()
