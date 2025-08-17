// Database types - safe for client-side import
export interface Task {
  id: number
  title: string
  description?: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  due_date?: string
  assigned_to?: string
  created_by?: string
  created_at: string
  updated_at: string
}
export interface TaskComment {
  id: number
  task_id: number
  user_id: string
  comment: string
  created_at: string
}
export interface UserRole {
  id: number
  user_id: string
  role: "admin" | "user"
  created_at: string
}
export interface User {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}
