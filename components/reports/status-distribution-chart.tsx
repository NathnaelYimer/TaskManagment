"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface StatusDistributionChartProps {
  data: Array<{
    status: string
    count: number
  }>
}

const chartConfig = {
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-3))",
  },
  "in-progress": {
    label: "In Progress",
    color: "hsl(var(--chart-1))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-2))",
  },
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    name: item.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    fill: chartConfig[item.status as keyof typeof chartConfig]?.color || "hsl(var(--chart-4))",
  }))

  const total = data.reduce((sum, item) => sum + Number.parseInt(item.count.toString()), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Status Distribution</CardTitle>
        <CardDescription>Breakdown of tasks by current status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">Total Tasks: {total}</div>
      </CardContent>
    </Card>
  )
}
