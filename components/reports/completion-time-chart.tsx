"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
interface CompletionTimeChartProps {
  data: Array<{
    priority: string
    avg_days: number
  }>
}
const chartConfig = {
  avg_days: {
    label: "Average Days",
    color: "hsl(var(--chart-1))",
  },
}
export function CompletionTimeChart({ data }: CompletionTimeChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
    avg_days: Math.round(Number.parseFloat(item.avg_days.toString()) * 10) / 10,
  }))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Completion Time</CardTitle>
        <CardDescription>Average days to complete tasks by priority level</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`${value} days`, "Average Completion Time"]}
              />
              <Bar dataKey="avg_days" fill="var(--color-avg_days)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
