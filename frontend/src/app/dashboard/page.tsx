'use client';

import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// Mock data - will be replaced with API calls
const attendanceData = [
    { date: 'Mon', present: 85, absent: 15 },
    { date: 'Tue', present: 88, absent: 12 },
    { date: 'Wed', present: 82, absent: 18 },
    { date: 'Thu', present: 90, absent: 10 },
    { date: 'Fri', present: 87, absent: 13 },
    { date: 'Sat', present: 45, absent: 55 },
    { date: 'Sun', present: 20, absent: 80 },
];

const departmentData = [
    { name: 'Engineering', value: 45, color: '#7CB8E8' },
    { name: 'HR', value: 12, color: '#A8D5F2' },
    { name: 'Sales', value: 28, color: '#FDB813' },
    { name: 'Marketing', value: 15, color: '#6C7278' },
];

const performanceData = [
    { department: 'Engineering', score: 85 },
    { department: 'HR', score: 92 },
    { department: 'Sales', score: 78 },
    { department: 'Marketing', score: 88 },
];

const recentActivity = [
    { id: 1, employee: 'John Doe', action: 'Marked attendance', time: '10 minutes ago' },
    { id: 2, employee: 'Jane Smith', action: 'Submitted leave request', time: '1 hour ago' },
    { id: 3, employee: 'Mike Johnson', action: 'Updated profile', time: '2 hours ago' },
    { id: 4, employee: 'Sarah Williams', action: 'Completed goal', time: '3 hours ago' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's what's happening today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Employees"
                    value="100"
                    icon={Users}
                    description="Active employees"
                    trend={{ value: 12, isPositive: true }}
                />
                <StatsCard
                    title="Present Today"
                    value="87"
                    icon={UserCheck}
                    description="87% attendance rate"
                    trend={{ value: 5, isPositive: true }}
                />
                <StatsCard
                    title="On Leave"
                    value="8"
                    icon={UserX}
                    description="Approved leaves"
                />
                <StatsCard
                    title="Pending Requests"
                    value="5"
                    icon={Clock}
                    description="Awaiting approval"
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Attendance Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Trend</CardTitle>
                        <CardDescription>Last 7 days attendance overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="present"
                                    stroke="#7CB8E8"
                                    strokeWidth={2}
                                    name="Present"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="absent"
                                    stroke="#FDB813"
                                    strokeWidth={2}
                                    name="Absent"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Department Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Department Distribution</CardTitle>
                        <CardDescription>Employee distribution by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={departmentData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {departmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Average performance score by department</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="department" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="score" fill="#7CB8E8" name="Performance Score" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest employee actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                            >
                                <div>
                                    <p className="font-medium">{activity.employee}</p>
                                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
