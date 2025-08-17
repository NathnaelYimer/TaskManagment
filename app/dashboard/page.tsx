"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskForm } from "@/components/tasks/task-form"
import { useAuthStore } from "@/lib/store"
import { useRealtime } from "@/lib/realtime"
import type { Task } from "@/lib/types"

interface DashboardStats {
  statusStats: Array<{ status: string; count: string }>
  priorityStats: Array<{ priority: string; count: string }>
  overdueCount: number
  recentStats: Array<{ date: string; count: string }>
  totalStats: {
    total_tasks: number
    completed_tasks: number
    in_progress_tasks: number
    pending_tasks: number
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const { user: currentUser } = useAuthStore()

  useRealtime()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch stats
      const statsResponse = await fetch("/api/stats", {
        headers: {
          Authorization: `Bearer ${currentUser?.id}`,
        },
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent tasks
      const tasksResponse = await fetch("/api/tasks?limit=6", {
        headers: {
          Authorization: `Bearer ${currentUser?.id}`,
        },
      })

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setRecentTasks(tasksData.tasks)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [currentUser?.id])

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

      fetchDashboardData()
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

      fetchDashboardData()
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

      fetchDashboardData()
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

      fetchDashboardData()
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

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" description="Overview of your tasks and progress">
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Dashboard"
      description="Overview of your tasks and progress"
      action={
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Recent Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Tasks</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          {recentTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentTasks.map((task) => (
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
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks found. Create your first task to get started!</p>
            </div>
          )}
        </div>
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
