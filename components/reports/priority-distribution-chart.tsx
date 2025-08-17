"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface PriorityDistributionChartProps {
  data: Array<{
    priority: string
    count: number
  }>
}

const chartConfig = {
  high: {
    label: "High Priority",
    color: "hsl(var(--destructive))",
  },
  medium: {
    label: "Medium Priority",
    color: "hsl(var(--chart-1))",
  },
  low: {
    label: "Low Priority",
    color: "hsl(var(--chart-2))",
  },
}

export function PriorityDistributionChart({ data }: PriorityDistributionChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
    fill: chartConfig[item.priority as keyof typeof chartConfig]?.color || "hsl(var(--chart-4))",
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Distribution</CardTitle>
        <CardDescription>Task breakdown by priority level</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
