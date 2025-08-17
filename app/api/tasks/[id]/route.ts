import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { authenticateRequest } from "@/lib/api-auth"
import { broadcastEventServer } from "@/lib/realtime-server"
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  try {
    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }
    const tasks = await sql`
      SELECT t.*, 
             u1.name as assigned_to_name,
             u2.name as created_by_name
      FROM tasks t
      LEFT JOIN users_sync u1 ON t.assigned_to = u1.id
      LEFT JOIN users_sync u2 ON t.created_by = u2.id
      WHERE t.id = ${taskId}
    `
    if ((tasks as any[]).length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
    const task = (tasks as any[])[0]
    if (auth.user?.role !== "admin" && task.assigned_to !== auth.user?.id && task.created_by !== auth.user?.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  try {
    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }
    const body = await request.json()
    const { title, description, status, priority, due_date, assigned_to } = body
    const existingTasks = await sql`
      SELECT * FROM tasks WHERE id = ${taskId}
    `
    if ((existingTasks as any[]).length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
    const existingTask = (existingTasks as any[])[0]
    if (
      auth.user?.role !== "admin" &&
      existingTask.assigned_to !== auth.user?.id &&
      existingTask.created_by !== auth.user?.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    const tasks = await sql`
      UPDATE tasks 
      SET 
        title = ${title || existingTask.title},
        description = ${description !== undefined ? description : existingTask.description},
        status = ${status || existingTask.status},
        priority = ${priority || existingTask.priority},
        due_date = ${due_date !== undefined ? due_date : existingTask.due_date},
        assigned_to = ${assigned_to !== undefined ? assigned_to : existingTask.assigned_to},
        updated_at = NOW()
      WHERE id = ${taskId}
      RETURNING *
    `
    const updatedTask = (tasks as any[])[0]
    await broadcastEventServer({
      type: "task_updated",
      data: updatedTask,
      userId: auth.user?.id,
    })
    if (assigned_to && assigned_to !== existingTask.assigned_to) {
      await broadcastEventServer({
        type: "task_assigned",
        data: updatedTask,
        userId: auth.user?.id,
      })
    }
    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  try {
    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }
    const existingTasks = await sql`
      SELECT * FROM tasks WHERE id = ${taskId}
    `
    if ((existingTasks as any[]).length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
    const existingTask = (existingTasks as any[])[0]
    if (auth.user?.role !== "admin" && existingTask.created_by !== auth.user?.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    await sql`DELETE FROM tasks WHERE id = ${taskId}`
    await broadcastEventServer({
      type: "task_deleted",
      data: { id: taskId, title: existingTask.title },
      userId: auth.user?.id,
    })
    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
