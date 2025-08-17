"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Clock, AlertTriangle, TrendingUp } from "lucide-react"
interface StatsCardsProps {
  stats: {
    totalStats: {
      total_tasks: number
      completed_tasks: number
      in_progress_tasks: number
      pending_tasks: number
    }
    overdueCount: number
  }
}
export function StatsCards({ stats }: StatsCardsProps) {
  const completionRate =
    stats.totalStats.total_tasks > 0
      ? Math.round((stats.totalStats.completed_tasks / stats.totalStats.total_tasks) * 100)
      : 0
  const cards = [
    {
      title: "Total Tasks",
      value: stats.totalStats.total_tasks,
      description: "All tasks in the system",
      icon: CheckSquare,
      color: "text-blue-600",
    },
    {
      title: "In Progress",
      value: stats.totalStats.in_progress_tasks,
      description: "Currently active tasks",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Completed",
      value: stats.totalStats.completed_tasks,
      description: "Successfully finished",
      icon: CheckSquare,
      color: "text-green-600",
    },
    {
      title: "Overdue",
      value: stats.overdueCount,
      description: "Past due date",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ]
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Completion Rate
          </CardTitle>
          <CardDescription>Overall task completion percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">{completionRate}%</div>
            <div className="flex-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
            <Badge variant={completionRate >= 70 ? "default" : completionRate >= 40 ? "secondary" : "destructive"}>
              {completionRate >= 70 ? "Excellent" : completionRate >= 40 ? "Good" : "Needs Improvement"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
