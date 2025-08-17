import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api-auth"
import { sql } from "@/lib/database"
import { broadcastEventServer } from "@/lib/realtime-server"

// GET /api/tasks/[id]/comments - Get task comments
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const taskId = Number.parseInt(id)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    // Check if task exists and user has access
    const task = await sql.query(
      `SELECT id, assigned_to, created_by FROM tasks WHERE id = $1`,
      [taskId]
    )

    if ((task as any[]).length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const taskData = (task as any[])[0]

    // Non-admin users can only see comments on their own tasks
    if (
      auth.user?.role !== "admin" &&
      taskData.assigned_to !== auth.user?.id &&
      taskData.created_by !== auth.user?.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const comments = await sql.query(
      `SELECT c.*, u.name as user_name
       FROM task_comments c
       LEFT JOIN users_sync u ON c.user_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [taskId]
    )

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

// POST /api/tasks/[id]/comments - Add comment to task
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const taskId = Number.parseInt(id)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const body = await request.json()
    const { comment } = body

    if (!comment || comment.trim() === "") {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 })
    }

    // Check if task exists and user has access
    const task = await sql.query(
      `SELECT id, title, assigned_to, created_by FROM tasks WHERE id = $1`,
      [taskId]
    )

    if ((task as any[]).length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const taskData = (task as any[])[0]

    // Non-admin users can only comment on their own tasks
    if (
      auth.user?.role !== "admin" &&
      taskData.assigned_to !== auth.user?.id &&
      taskData.created_by !== auth.user?.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Add comment
    const newComment = await sql.query(
      `INSERT INTO task_comments (task_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [taskId, auth.user?.id, comment.trim()]
    )

    const commentData = (newComment as any[])[0]

    // Broadcast comment event
    await broadcastEventServer({
      type: "comment_added",
      data: {
        comment: commentData,
        task: taskData,
      },
      userId: auth.user?.id,
    })

    return NextResponse.json({ comment: commentData }, { status: 201 })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
