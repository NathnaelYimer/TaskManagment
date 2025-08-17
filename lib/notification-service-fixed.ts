import { emailService } from './email-service-new'
import { sql } from './database'

export class NotificationService {
  async sendTaskAssignmentNotification(taskId: number, assigneeId: string, assignedById: string) {
    try {
      const task = await sql`
        SELECT t.title, u.email, u.name as assignee_name
        FROM tasks t
        JOIN users_sync u ON t.assigned_to = u.id
        WHERE t.id = ${taskId}
      `

      const taskArray = Array.isArray(task) ? task : [];
      if (taskArray.length === 0) return;

      const taskData = taskArray[0] as { title: string; email: string; assignee_name: string };
      const userEmail = taskData.email;
      if (!userEmail) return;

      await emailService.sendTaskAssignment(userEmail, {
        taskTitle: taskData.title,
        assigneeName: taskData.assignee_name,
        assignedBy: 'System',
        taskUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`
      })
    } catch (error) {
      console.error('Error sending task assignment notification:', error)
    }
  }

  async sendTaskReminder(taskId: number) {
    try {
      const task = await sql`
        SELECT t.title, t.due_date, u.email, u.name as assignee_name
        FROM tasks t
        JOIN users_sync u ON t.assigned_to = u.id
        WHERE t.id = ${taskId} AND t.status != 'completed'
      `

      const taskArray = Array.isArray(task) ? task : [];
      if (taskArray.length === 0) return;

      const taskData = taskArray[0] as { title: string; due_date: string; email: string; assignee_name: string };
      const userEmail = taskData.email;
      if (!userEmail) return;

      await emailService.sendTaskReminder(userEmail, {
        taskTitle: taskData.title,
        dueDate: taskData.due_date,
        assigneeName: taskData.assignee_name,
        taskUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`
      })
    } catch (error) {
      console.error('Error sending task reminder:', error)
    }
  }

  async sendWeeklyReport(userId: string) {
    try {
      const user = await sql`
        SELECT email, name FROM users_sync WHERE id = ${userId}
      `

      const userArray = Array.isArray(user) ? user : [];
      if (userArray.length === 0) return;

      const userData = userArray[0] as { email: string; name: string };
      const userEmail = userData.email;
      if (!userEmail) return;

      await emailService.sendWeeklyReport(userEmail, {
        userName: userData.name,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        weekStart: '2024-01-01',
        weekEnd: '2024-01-07'
      })
    } catch (error) {
      console.error('Error sending weekly report:', error)
    }
  }
}

export const notificationService = new NotificationService()
