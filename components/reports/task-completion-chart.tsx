"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
interface TaskCompletionChartProps {
  data: Array<{
    date: string
    created: number
    completed: number
  }>
}
const chartConfig = {
  created: {
    label: "Created",
    color: "hsl(var(--chart-1))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-2))",
  },
}
export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Flow Trends</CardTitle>
        <CardDescription>Daily task creation vs completion over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="created"
                stroke="var(--color-created)"
                strokeWidth={2}
                dot={{ fill: "var(--color-created)" }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="var(--color-completed)"
                strokeWidth={2}
                dot={{ fill: "var(--color-completed)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
