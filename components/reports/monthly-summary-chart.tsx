"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface MonthlySummaryChartProps {
  data: Array<{
    month: string
    total_tasks: number
    completed_tasks: number
    in_progress_tasks: number
    pending_tasks: number
  }>
}

const chartConfig = {
  total_tasks: {
    label: "Total Tasks",
    color: "hsl(var(--chart-1))",
  },
  completed_tasks: {
    label: "Completed",
    color: "hsl(var(--chart-2))",
  },
  in_progress_tasks: {
    label: "In Progress",
    color: "hsl(var(--chart-3))",
  },
  pending_tasks: {
    label: "Pending",
    color: "hsl(var(--chart-4))",
  },
}

export function MonthlySummaryChart({ data }: MonthlySummaryChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    month: new Date(item.month).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Task Summary</CardTitle>
        <CardDescription>Task volume and status breakdown by month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="completed_tasks"
                stackId="1"
                stroke="var(--color-completed_tasks)"
                fill="var(--color-completed_tasks)"
              />
              <Area
                type="monotone"
                dataKey="in_progress_tasks"
                stackId="1"
                stroke="var(--color-in_progress_tasks)"
                fill="var(--color-in_progress_tasks)"
              />
              <Area
                type="monotone"
                dataKey="pending_tasks"
                stackId="1"
                stroke="var(--color-pending_tasks)"
                fill="var(--color-pending_tasks)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
