import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api-auth"
import { sql } from "@/lib/database"
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "30"
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - Number.parseInt(period))
  try {
    let whereClause = ""
    const params: any[] = [startDate.toISOString()]
    if (auth.user?.role !== "admin") {
      whereClause = "AND (assigned_to = $2 OR created_by = $2)"
      params.push(auth.user?.id)
    }
    const completionTrends = await sql.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM tasks
      WHERE created_at >= $1
      ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date
    `, params)
    const userPerformance = await sql.query(`
      SELECT 
        u.name,
        u.email,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        AVG(CASE WHEN t.status = 'completed' THEN EXTRACT(EPOCH FROM (t.updated_at - t.created_at))/86400 END) as avg_completion_days
      FROM users_sync u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      WHERE u.deleted_at IS NULL
      GROUP BY u.id, u.name, u.email
      ORDER BY completed_tasks DESC
    `)
    const priorityDistribution = await sql.query(`
      SELECT 
        priority,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tasks), 2) as percentage
      FROM tasks
      GROUP BY priority
      ORDER BY count DESC
    `)
    const overdueByUser = await sql.query(`
      SELECT 
        u.name,
        COUNT(t.id) as overdue_count
      FROM users_sync u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      WHERE t.due_date < NOW() AND t.status != 'completed'
      GROUP BY u.id, u.name
      ORDER BY overdue_count DESC
    `)
    const monthlySummary = await sql.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks
      FROM tasks
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `)
    const statusDistribution = await sql.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM tasks
      WHERE created_at >= $1
      ${whereClause}
      GROUP BY status
      ORDER BY count DESC
    `, params)
    const getRows = (result: any): any[] => {
      if (Array.isArray(result)) {
        return result
      }
      if (result && typeof result === 'object' && 'rows' in result) {
        return result.rows || []
      }
      return []
    }
    const completionTrendsData = getRows(completionTrends).map((row: any) => ({
      date: row.date,
      created: Number(row.total || 0),
      completed: Number(row.completed || 0)
    }))
    const userPerformanceData = getRows(userPerformance).map((row: any) => ({
      name: row.name || '',
      email: row.email || '',
      total_tasks: Number(row.total_tasks || 0),
      completed_tasks: Number(row.completed_tasks || 0),
      overdue_tasks: Number(getRows(overdueByUser).find((u: any) => u.name === row.name)?.overdue_count || 0),
      completion_rate: Number(row.total_tasks || 0) > 0 ? Math.round((Number(row.completed_tasks || 0) / Number(row.total_tasks || 0)) * 100) : 0
    }))
    const priorityDistributionData = getRows(priorityDistribution).map((row: any) => ({
      priority: row.priority || 'unknown',
      count: Number(row.count || 0)
    }))
    const monthlySummaryData = getRows(monthlySummary).map((row: any) => ({
      month: row.month || '',
      total_tasks: Number(row.total_tasks || 0),
      completed_tasks: Number(row.completed_tasks || 0),
      in_progress_tasks: Number(row.in_progress_tasks || 0),
      pending_tasks: Number(row.pending_tasks || 0)
    }))
    const completionTimeByPriority = await sql.query(`
      SELECT 
        priority,
        AVG(CASE WHEN status = 'completed' THEN EXTRACT(EPOCH FROM (updated_at - created_at))/86400 END) as avg_days
      FROM tasks
      WHERE created_at >= $1
      ${whereClause}
      AND status = 'completed'
      GROUP BY priority
      ORDER BY priority
    `, params)
    const avgCompletionTimeData = getRows(completionTimeByPriority)
      .filter((row: any) => row.avg_days)
      .map((row: any) => ({
        priority: row.priority || 'unknown',
        avg_days: Math.round(Number(row.avg_days || 0) * 10) / 10
      }))
    const taskFlowData = completionTrendsData
    return NextResponse.json({
      completionTrends: completionTrendsData,
      statusDistribution: getRows(statusDistribution).map((row: any) => ({
        status: row.status || 'unknown',
        count: Number(row.count || 0)
      })),
      priorityDistribution: priorityDistributionData,
      userPerformance: userPerformanceData,
      avgCompletionTime: avgCompletionTimeData,
      monthlySummary: monthlySummaryData,
      taskFlow: taskFlowData,
      period: Number.parseInt(period),
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({
      completionTrends: [],
      statusDistribution: [],
      priorityDistribution: [],
      userPerformance: [],
      avgCompletionTime: [],
      monthlySummary: [],
      taskFlow: [],
      period: Number.parseInt(period),
    })
  }
}
