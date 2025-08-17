"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
interface UserPerformanceTableProps {
  data: Array<{
    name: string
    email: string
    total_tasks: number
    completed_tasks: number
    overdue_tasks: number
    completion_rate: number
  }>
}
export function UserPerformanceTable({ data }: UserPerformanceTableProps) {
  const getPerformanceBadge = (rate: number) => {
    if (rate >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (rate >= 60) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    if (rate >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Performance</CardTitle>
        <CardDescription>Task completion rates and performance metrics by user</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Total Tasks</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Overdue</TableHead>
              <TableHead>Completion Rate</TableHead>
              <TableHead>Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{(user.name || user.email).charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name || "—"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.total_tasks}</TableCell>
                <TableCell>{user.completed_tasks}</TableCell>
                <TableCell>
                  {user.overdue_tasks > 0 ? (
                    <Badge variant="destructive">{user.overdue_tasks}</Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={user.completion_rate} className="w-16" />
                    <span className="text-sm font-medium">{user.completion_rate}%</span>
                  </div>
                </TableCell>
                <TableCell>{getPerformanceBadge(user.completion_rate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
