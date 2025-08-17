"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, Users, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TaskCompletionChart } from "@/components/reports/task-completion-chart"
import { StatusDistributionChart } from "@/components/reports/status-distribution-chart"
import { PriorityDistributionChart } from "@/components/reports/priority-distribution-chart"
import { UserPerformanceTable } from "@/components/reports/user-performance-table"
import { CompletionTimeChart } from "@/components/reports/completion-time-chart"
import { MonthlySummaryChart } from "@/components/reports/monthly-summary-chart"
import { useAuthStore } from "@/lib/store"

interface ReportData {
  completionTrends: Array<{ date: string; created: number; completed: number }>
  statusDistribution: Array<{ status: string; count: number }>
  priorityDistribution: Array<{ priority: string; count: number }>
  userPerformance: Array<{
    name: string
    email: string
    total_tasks: number
    completed_tasks: number
    overdue_tasks: number
    completion_rate: number
  }>
  taskFlow: Array<{ date: string; created: number; completed: number }>
  avgCompletionTime: Array<{ priority: string; avg_days: number }>
  monthlySummary: Array<{
    month: string
    total_tasks: number
    completed_tasks: number
    in_progress_tasks: number
    pending_tasks: number
  }>
  period: number
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")

  const { user: currentUser, userRole } = useAuthStore()

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports?period=${period}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.id}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [period, currentUser?.id])

  if (loading) {
    return (
      <DashboardLayout title="Reports" description="Analytics and insights for task management">
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!reportData) {
    return (
      <DashboardLayout title="Reports" description="Analytics and insights for task management">
        <div className="text-center p-8">
          <p className="text-gray-600 dark:text-gray-400">Failed to load reports. Please try again.</p>
          <Button onClick={fetchReports} className="mt-4">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Reports & Analytics"
      description="Comprehensive insights into task management performance"
      action={
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Report Period</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{period} days</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Data analysis period</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {reportData.statusDistribution?.reduce((sum, item) => sum + Number.parseInt(item.count.toString()), 0) || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">In selected period</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Avg Completion</CardTitle>
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {reportData.avgCompletionTime.length > 0
                  ? Math.round(
                      reportData.avgCompletionTime.reduce(
                        (sum, item) => sum + Number.parseFloat(item.avg_days.toString()),
                        0,
                      ) / reportData.avgCompletionTime.length,
                    )
                  : 0}{" "}
                days
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Average time to complete</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reportData.userPerformance.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Users with tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
            <TaskCompletionChart data={reportData.taskFlow || []} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
            <StatusDistributionChart data={reportData.statusDistribution || []} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
            <PriorityDistributionChart data={reportData.priorityDistribution || []} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
            <CompletionTimeChart data={reportData.avgCompletionTime || []} />
          </div>
        </div>

        {/* Monthly Summary */}
        {reportData.monthlySummary?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
            <MonthlySummaryChart data={reportData.monthlySummary || []} />
          </div>
        )}

        {/* User Performance (Admin Only) */}
        {userRole?.role === "admin" && reportData.userPerformance?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
            <UserPerformanceTable data={reportData.userPerformance || []} />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
