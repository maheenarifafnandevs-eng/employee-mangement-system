'use client';

import { useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface AttendanceRecord {
    id: string;
    date: string;
    checkIn: string;
    checkOut?: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
}

interface MonthlySummary {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: number;
}

export default function AttendancePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

    // Current month for summary
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toISOString().slice(0, 7) // YYYY-MM
    );

    useEffect(() => {
        fetchAttendance();
        fetchSummary();
    }, [selectedMonth]);

    const fetchAttendance = async () => {
        // Fetch monthly attendance to populate calendar
        // Reusing the summary endpoint which returns attandance list
        // In a real app you might have a separate list endpoint
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/attendance/summary/${selectedMonth}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAttendance(data.data.attendance);

                // Check for today's record
                const today = new Date().toISOString().split('T')[0];
                const todays = data.data.attendance.find((a: any) => a.date.startsWith(today));
                setTodayRecord(todays || null);
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    };

    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/attendance/summary/${selectedMonth}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSummary(data.data.summary);
            }
        } catch (error) {
            console.error('Failed to fetch summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockIn = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/attendance/clock-in', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchAttendance();
                fetchSummary();
            }
        } catch (error) {
            console.error('Failed to clock in:', error);
        }
    };

    const handleClockOut = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/attendance/clock-out', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchAttendance();
                fetchSummary();
            }
        } catch (error) {
            console.error('Failed to clock out:', error);
        }
    };

    // Helper to get modifiers for calendar
    const getModifiers = () => {
        const present: Date[] = [];
        const absent: Date[] = [];
        const late: Date[] = [];

        attendance.forEach(record => {
            const d = new Date(record.date);
            if (record.status === 'PRESENT') present.push(d);
            else if (record.status === 'ABSENT') absent.push(d);
            else if (record.status === 'LATE') late.push(d);
        });

        return { present, absent, late };
    };

    const modifiersStyles = {
        present: { color: 'green', fontWeight: 'bold' },
        absent: { color: 'red', fontWeight: 'bold' },
        late: { color: 'orange', fontWeight: 'bold' },
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                    <p className="text-muted-foreground">Manage your daily attendance</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Current Time</p>
                        <p className="text-2xl font-bold font-mono">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    {!todayRecord ? (
                        <Button onClick={handleClockIn} className="bg-green-600 hover:bg-green-700">
                            <Clock className="mr-2 h-4 w-4" />
                            Clock In
                        </Button>
                    ) : !todayRecord.checkOut ? (
                        <Button onClick={handleClockOut} variant="destructive">
                            <Clock className="mr-2 h-4 w-4" />
                            Clock Out
                        </Button>
                    ) : (
                        <Button disabled variant="outline">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Completed
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Calendar Card */}
                <Card className="md:col-span-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Attendance Calendar</CardTitle>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Generate last 12 months */}
                                    {Array.from({ length: 12 }).map((_, i) => {
                                        const d = new Date();
                                        d.setMonth(d.getMonth() - i);
                                        const value = d.toISOString().slice(0, 7);
                                        const label = d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
                                        return <SelectItem key={value} value={value}>{label}</SelectItem>;
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow"
                            modifiers={getModifiers()}
                            modifiersStyles={modifiersStyles}
                        />
                    </CardContent>
                </Card>

                {/* Stats Column */}
                <div className="space-y-6 md:col-span-4">
                    {/* Today's Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Today's Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {todayRecord ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Clock In</span>
                                        <span className="font-mono font-medium">
                                            {new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Clock Out</span>
                                        <span className="font-mono font-medium">
                                            {todayRecord.checkOut
                                                ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : '--:--'}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <Badge variant={todayRecord.status === 'PRESENT' ? 'default' : 'destructive'}>
                                            {todayRecord.status}
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No record for today
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Monthly Summary */}
                    {summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Monthly Summary</CardTitle>
                                <CardDescription>
                                    {new Date(selectedMonth).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Total Days</p>
                                        <p className="text-2xl font-bold">{summary.totalDays}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Attendance</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {Math.round(summary.attendanceRate)}%
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Present</p>
                                        <p className="text-xl font-bold text-blue-600">{summary.presentDays}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Absent/Late</p>
                                        <p className="text-xl font-bold text-red-600">
                                            {summary.absentDays + summary.lateDays}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
