'use client';

import { useState, useEffect } from 'react';
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
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
    totalEmployees: number;
    presentToday: number;
    onLeave: number;
    pendingRequests: number;
}

interface Activity {
    id: string;
    employee: string;
    action: string;
    time: string;
}

interface DepartmentStat {
    name: string;
    value: number;
}

interface AttendanceTrend {
    date: string;
    present: number;
    absent: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [attendanceTrend, setAttendanceTrend] = useState<AttendanceTrend[]>([]);
    const [departmentDist, setDepartmentDist] = useState<DepartmentStat[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const headers = { Authorization: `Bearer ${token}` };

                const [statsRes, trendRes, distRes, activityRes] = await Promise.all([
                    fetch('/api/dashboard/stats', { headers }),
                    fetch('/api/dashboard/attendance-trend', { headers }),
                    fetch('/api/dashboard/department-distribution', { headers }),
                    fetch('/api/dashboard/recent-activity', { headers })
                ]);

                const [statsData, trendData, distData, activityData] = await Promise.all([
                    statsRes.json(),
                    trendRes.json(),
                    distRes.json(),
                    activityRes.json()
                ]);

                if (statsData.success) setStats(statsData.data);
                if (trendData.success) setAttendanceTrend(trendData.data);
                if (distData.success) setDepartmentDist(distData.data);
                if (activityData.success) setActivities(activityData.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading dashboard...</div>;
    }

    // Default stats if none found
    const displayStats = stats || {
        totalEmployees: 0,
        presentToday: 0,
        onLeave: 0,
        pendingRequests: 0
    };

    const attendanceRate = displayStats.totalEmployees > 0
        ? Math.round((displayStats.presentToday / displayStats.totalEmployees) * 100)
        : 0;

    const COLORS = ['#7CB8E8', '#A8D5F2', '#FDB813', '#6C7278', '#4F46E5', '#10B981'];
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
                    value={displayStats.totalEmployees.toString()}
                    icon={Users}
                    description="Active employees"
                />
                <StatsCard
                    title="Present Today"
                    value={displayStats.presentToday.toString()}
                    icon={UserCheck}
                    description={`${attendanceRate}% attendance rate`}
                />
                <StatsCard
                    title="On Leave"
                    value={displayStats.onLeave.toString()}
                    icon={UserX}
                    description="Approved leaves"
                />
                <StatsCard
                    title="Pending Requests"
                    value={displayStats.pendingRequests.toString()}
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
                            <LineChart data={attendanceTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                                />
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
                                    data={departmentDist}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {departmentDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    <CardDescription>Average performance score by department (Mock Data)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                            { department: 'Engineering', score: 85 },
                            { department: 'HR', score: 92 },
                            { department: 'Sales', score: 78 },
                            { department: 'Marketing', score: 88 }
                        ]}>
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
                        {activities.length > 0 ? activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                            >
                                <div>
                                    <p className="font-medium">{activity.employee}</p>
                                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                                </span>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No recent activity found</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
