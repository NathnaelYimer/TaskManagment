"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskForm } from "@/components/tasks/task-form"
import { useAuthStore } from "@/lib/store"
import type { Task } from "@/lib/types"
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    assignedTo: "all",
  })
  const { user: currentUser } = useAuthStore()
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.search) params.append("search", filters.search)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.priority !== "all") params.append("priority", filters.priority)
      if (filters.assignedTo !== "all") params.append("assignedTo", filters.assignedTo)
      const response = await fetch(`/api/tasks?${params}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.id}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchTasks()
  }, [filters, currentUser?.id])
  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.id}`,
        },
        body: JSON.stringify(taskData),
      })
      if (!response.ok) {
        throw new Error("Failed to create task")
      }
      fetchTasks()
    } catch (error) {
      throw error
    }
  }
  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!selectedTask) return
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.id}`,
        },
        body: JSON.stringify(taskData),
      })
      if (!response.ok) {
        throw new Error("Failed to update task")
      }
      fetchTasks()
      setSelectedTask(null)
    } catch (error) {
      throw error
    }
  }
  const handleStatusChange = async (taskId: number, status: Task["status"]) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.id}`,
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error("Failed to update task status")
      }
      fetchTasks()
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentUser?.id}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to delete task")
      }
      fetchTasks()
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }
  const openEditForm = (task: Task) => {
    setSelectedTask(task)
    setIsTaskFormOpen(true)
  }
  const openCreateForm = () => {
    setSelectedTask(null)
    setIsTaskFormOpen(true)
  }
  return (
    <DashboardLayout
      title="Tasks"
      description="Manage and track all your tasks"
      action={
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      }
    >
      <div className="space-y-6">
        {}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditForm}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto max-w-md">
              <Filter className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
              <p className="mt-2 text-muted-foreground">
                {Object.values(filters).some(Boolean)
                  ? "Try adjusting your filters or search terms."
                  : "Get started by creating your first task."}
              </p>
              <Button onClick={openCreateForm} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>
        )}
      </div>
      <TaskForm
        task={selectedTask}
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
      />
    </DashboardLayout>
  )
}
