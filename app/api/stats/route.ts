import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api-auth"
import { sql } from "@/lib/database"

// GET /api/stats - Get task statistics for dashboard
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    let whereClause = ""
    const params: any[] = []

    // Non-admin users can only see their own task stats
    if (auth.user?.role !== "admin") {
      whereClause = "WHERE (assigned_to = $1 OR created_by = $1)"
      params.push(auth.user?.id)
    }

    // Get task counts by status
    const statusStats = await sql.query(
      `
      SELECT status, COUNT(*) as count
      FROM tasks
      ${whereClause}
      GROUP BY status
    `,
      params,
    )

    // Get task counts by priority
    const priorityStats = await sql.query(
      `
      SELECT priority, COUNT(*) as count
      FROM tasks
      ${whereClause}
      GROUP BY priority
    `,
      params,
    )

    // Get overdue tasks count
    const overdueStats = await sql.query(
      `
      SELECT COUNT(*) as count
      FROM tasks
      ${whereClause}
      ${whereClause ? "AND" : "WHERE"} due_date < NOW() AND status != 'completed'
    `,
      params,
    )

    // Get tasks created in the last 7 days
    const recentStats = await sql.query(
      `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM tasks
      ${whereClause}
      ${whereClause ? "AND" : "WHERE"} created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `,
      params,
    )

    // Get total counts
    const totalStats = await sql.query(
      `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks
      FROM tasks
      ${whereClause}
    `,
      params,
    )

    return NextResponse.json({
      statusStats,
      priorityStats,
      overdueCount: Number.parseInt((overdueStats as any[])[0]?.count || '0'),
      recentStats,
      totalStats: (totalStats as any[])[0] || {},
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
