'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Award, Users, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Goal {
    id: string;
    title: string;
    progress: number;
    status: string;
    dueDate: string;
}

export default function PerformanceDashboard() {
    const router = useRouter();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/performance/goals', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setGoals(data.data.slice(0, 5)); // Show only first 5
            }
        } catch (error) {
            console.error('Failed to fetch goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalGoals: goals.length,
        completed: goals.filter(g => g.status === 'COMPLETED').length,
        inProgress: goals.filter(g => g.status === 'IN_PROGRESS').length,
        avgProgress: goals.length > 0
            ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
            : 0,
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
                    <p className="text-muted-foreground">Track your goals, reviews, and feedback</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalGoals}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.inProgress}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgProgress}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer hover:bg-accent" onClick={() => router.push('/dashboard/performance/goals')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Goals
                        </CardTitle>
                        <CardDescription>Manage your performance goals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            View All Goals
                        </Button>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-accent opacity-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Reviews
                        </CardTitle>
                        <CardDescription>Performance reviews and feedback</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" disabled>
                            Coming Soon
                        </Button>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-accent opacity-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Feedback
                        </CardTitle>
                        <CardDescription>360-degree feedback system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" disabled>
                            Coming Soon
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Goals */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Goals</CardTitle>
                            <CardDescription>Your latest performance goals</CardDescription>
                        </div>
                        <Button onClick={() => router.push('/dashboard/performance/goals/add')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Goal
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {goals.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No goals yet. Create your first goal to get started!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {goals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                                    onClick={() => router.push(`/dashboard/performance/goals/${goal.id}`)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{goal.title}</h4>
                                            <Badge variant={goal.status === 'COMPLETED' ? 'outline' : 'default'}>
                                                {goal.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>Progress</span>
                                                <span>{goal.progress}%</span>
                                            </div>
                                            <Progress value={goal.progress} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {goals.length > 0 && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push('/dashboard/performance/goals')}
                                >
                                    View All Goals
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
