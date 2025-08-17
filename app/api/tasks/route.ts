import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api-auth"
import { sql } from "@/lib/database"
import { broadcastEventServer } from "@/lib/realtime-server"

// GET /api/tasks - List tasks with filtering
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")
  const assignedTo = searchParams.get("assignedTo")
  const search = searchParams.get("search")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const offset = (page - 1) * limit

  try {
    let query = `
      SELECT t.*, 
             u1.name as assigned_to_name,
             u2.name as created_by_name
      FROM tasks t
      LEFT JOIN users_sync u1 ON t.assigned_to = u1.id
      LEFT JOIN users_sync u2 ON t.created_by = u2.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    // Apply filters
    if (status) {
      query += ` AND t.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (priority) {
      query += ` AND t.priority = $${paramIndex}`
      params.push(priority)
      paramIndex++
    }

    if (assignedTo) {
      query += ` AND t.assigned_to = $${paramIndex}`
      params.push(assignedTo)
      paramIndex++
    }

    if (search) {
      query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Non-admin users can only see their own tasks
    if (auth.user?.role !== "admin") {
      query += ` AND (t.assigned_to = $${paramIndex} OR t.created_by = $${paramIndex})`
      params.push(auth.user?.id)
      paramIndex++
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const tasks = await sql.query(query, params)

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM tasks t WHERE 1=1`
    const countParams: any[] = []
    let countParamIndex = 1

    if (status) {
      countQuery += ` AND t.status = $${countParamIndex}`
      countParams.push(status)
      countParamIndex++
    }

    if (priority) {
      countQuery += ` AND t.priority = $${countParamIndex}`
      countParams.push(priority)
      countParamIndex++
    }

    if (assignedTo) {
      countQuery += ` AND t.assigned_to = $${countParamIndex}`
      countParams.push(assignedTo)
      countParamIndex++
    }

    if (search) {
      countQuery += ` AND (t.title ILIKE $${countParamIndex} OR t.description ILIKE $${countParamIndex})`
      countParams.push(`%${search}%`)
      countParamIndex++
    }

    if (auth.user?.role !== "admin") {
      countQuery += ` AND (t.assigned_to = $${countParamIndex} OR t.created_by = $${countParamIndex})`
      countParams.push(auth.user?.id)
    }

    const countResult = await sql.query(countQuery, countParams)
    const total = Number.parseInt((countResult as any[])[0]?.count || '0')

    return NextResponse.json({
      tasks: Array.isArray(tasks) ? tasks : [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    // Return empty array instead of error for better UX
    return NextResponse.json({
      tasks: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    })
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { title, description, priority, due_date, assigned_to } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Validate assigned_to if provided
    let validAssignedTo = null
    if (assigned_to && assigned_to !== "unassigned" && assigned_to !== "" && assigned_to !== null) {
      // Check if the user exists
      const userCheck = await sql.query(
        "SELECT id FROM users_sync WHERE id = $1 AND deleted_at IS NULL",
        [assigned_to]
      )
      if ((userCheck as any[]).length > 0) {
        validAssignedTo = assigned_to
      }
    }

    const tasks = await sql.query(`
      INSERT INTO tasks (title, description, priority, due_date, assigned_to, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description || null, priority || "medium", due_date || null, validAssignedTo, auth.user?.id])

    const newTask = (tasks as any[])[0]

    await broadcastEventServer({
      type: "task_created",
      data: newTask,
      userId: auth.user?.id,
    })

    return NextResponse.json({ task: newTask }, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
