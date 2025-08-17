"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, User, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task } from "@/lib/types"
interface TaskCardProps {
  task: Task & {
    assigned_to_name?: string
    created_by_name?: string
  }
  onEdit?: (task: Task) => void
  onDelete?: (taskId: number) => void
  onStatusChange?: (taskId: number, status: Task["status"]) => void
}
export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"
  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue ? "border-destructive" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
            {task.description && <CardDescription className="line-clamp-2">{task.description}</CardDescription>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>Edit Task</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange?.(task.id, "in-progress")}
                disabled={task.status === "in-progress"}
              >
                Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange?.(task.id, "completed")}
                disabled={task.status === "completed"}
              >
                Mark Complete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(task.id)} className="text-destructive">
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
            {task.priority}
          </Badge>
          <Badge className={`text-xs ${getStatusColor(task.status)}`}>{task.status}</Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          {task.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className={isOverdue ? "text-destructive" : ""}>
                Due {new Date(task.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
          </div>
          {task.assigned_to_name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Assigned to {task.assigned_to_name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
