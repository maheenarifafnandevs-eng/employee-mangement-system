'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle, Timer } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface AttendanceRecord {
    id: string;
    date: string;
    clockIn: string; // Changed from checkIn to match backend
    clockOut?: string; // Changed from checkOut to match backend
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
    const [currentTime, setCurrentTime] = useState(new Date());
    const [workDuration, setWorkDuration] = useState<string>('00:00:00');

    // Current month for summary
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toISOString().slice(0, 7) // YYYY-MM
    );

    // Update real-time clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Calculate work duration timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (todayRecord && todayRecord.clockIn && !todayRecord.clockOut) {
            timer = setInterval(() => {
                const start = new Date(todayRecord.clockIn).getTime();
                const now = new Date().getTime();
                const diff = now - start;

                if (diff > 0) {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    setWorkDuration(
                        `${hours.toString().padStart(2, '0')}:${minutes
                            .toString()
                            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                    );
                }
            }, 1000);
        } else if (todayRecord && todayRecord.clockIn && todayRecord.clockOut) {
            const start = new Date(todayRecord.clockIn).getTime();
            const end = new Date(todayRecord.clockOut).getTime();
            const diff = end - start;

            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setWorkDuration(
                    `${hours.toString().padStart(2, '0')}:${minutes
                        .toString()
                        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        } else {
            setWorkDuration('00:00:00');
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [todayRecord]);

    const fetchAttendance = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/attendance/summary/${selectedMonth}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAttendance(data.data.attendance);

                // Check for today's record (using local date comparison)
                const today = new Date();
                const year = today.getFullYear();
                const month = (today.getMonth() + 1).toString().padStart(2, '0');
                const day = today.getDate().toString().padStart(2, '0');
                const localToday = `${year}-${month}-${day}`;

                const todays = data.data.attendance.find((a: any) => a.date.startsWith(localToday));
                setTodayRecord(todays || null);
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    }, [selectedMonth]);

    const fetchSummary = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/attendance/summary/${selectedMonth}`, {
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
    }, [selectedMonth]);

    useEffect(() => {
        fetchAttendance();
        fetchSummary();
    }, [fetchAttendance, fetchSummary]);

    const handleClockIn = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/attendance/clock-in', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Successfully clocked in!');
                fetchAttendance();
                fetchSummary();
            } else {
                toast.error(data.message || 'Failed to clock in');
            }
        } catch (error) {
            console.error('Failed to clock in:', error);
            toast.error('Unable to connect to server');
        }
    };

    const handleClockOut = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/attendance/clock-out', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Successfully clocked out!');
                fetchAttendance();
                fetchSummary();
            } else {
                toast.error(data.message || 'Failed to clock out');
            }
        } catch (error) {
            console.error('Failed to clock out:', error);
            toast.error('Unable to connect to server');
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                    <p className="text-muted-foreground">Manage your daily attendance</p>
                </div>

                <div className="flex items-center gap-6 p-4 bg-card rounded-xl border shadow-sm">
                    <div className="text-center md:text-right border-r pr-6">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Time</p>
                        <p className="text-2xl font-bold font-mono text-primary">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                    </div>

                    <div className="text-center md:text-right pr-6 border-r">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Work Duration</p>
                        <div className="flex items-center gap-2 text-2xl font-bold font-mono text-blue-600">
                            <Timer className="h-5 w-5 animate-pulse" />
                            {workDuration}
                        </div>
                    </div>

                    <div className="flex items-center">
                        {!todayRecord ? (
                            <Button onClick={handleClockIn} size="lg" className="bg-green-600 hover:bg-green-700 h-14 px-8 text-lg font-bold">
                                <Clock className="mr-2 h-5 w-5" />
                                Clock In
                            </Button>
                        ) : !todayRecord.clockOut ? (
                            <Button onClick={handleClockOut} size="lg" variant="destructive" className="h-14 px-8 text-lg font-bold">
                                <Clock className="mr-2 h-5 w-5" />
                                Clock Out
                            </Button>
                        ) : (
                            <Button disabled variant="outline" size="lg" className="h-14 px-8 text-lg font-bold">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                Completed
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Calendar Card */}
                <Card className="md:col-span-8 shadow-md">
                    <CardHeader className="border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Attendance History</CardTitle>
                                <CardDescription>Track your attendance across the month</CardDescription>
                            </div>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-48 bg-muted/50 border-none">
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
                    <CardContent className="flex justify-center p-6 bg-muted/5">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-xl border shadow-lg bg-white p-4"
                            modifiers={getModifiers()}
                            modifiersStyles={modifiersStyles}
                        />
                    </CardContent>
                </Card>

                {/* Stats Column */}
                <div className="space-y-6 md:col-span-4">
                    {/* Today's Status */}
                    <Card className="shadow-md border-primary/10">
                        <CardHeader className="bg-primary/5 pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Today's Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {todayRecord ? (
                                <div className="space-y-6">
                                    <div className="relative pl-6 border-l-2 border-primary/20 space-y-4">
                                        <div className="relative">
                                            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-green-500 border-4 border-white shadow-sm" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">Clock In</span>
                                                <span className="text-xl font-mono font-bold text-navy-800">
                                                    {new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-white shadow-sm ${todayRecord.clockOut ? 'bg-red-500' : 'bg-gray-200'}`} />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">Clock Out</span>
                                                <span className="text-xl font-mono font-bold text-navy-800">
                                                    {todayRecord.clockOut
                                                        ? new Date(todayRecord.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                        : '--:--:--'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t flex justify-between items-center">
                                        <span className="text-sm font-medium text-muted-foreground">Daily Status</span>
                                        <Badge
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${todayRecord.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                                    todayRecord.status === 'LATE' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {todayRecord.status}
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">No record found for today</p>
                                    <p className="text-xs text-muted-foreground mt-1">Please clock in to start tracking</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Monthly Summary */}
                    {summary && (
                        <Card className="shadow-md">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-lg">Monthly Overview</CardTitle>
                                <CardDescription className="capitalize">
                                    {new Date(selectedMonth).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Days</p>
                                        <p className="text-2xl font-bold">{summary.totalDays}</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <p className="text-xs font-bold text-green-600 uppercase mb-1">Rating</p>
                                        <p className="text-2xl font-bold text-green-700">
                                            {Math.round(summary.attendanceRate)}%
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs font-bold text-blue-600 uppercase mb-1">Present</p>
                                        <p className="text-2xl font-bold text-blue-700">{summary.presentDays}</p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <p className="text-xs font-bold text-red-600 uppercase mb-1">Issues</p>
                                        <p className="text-2xl font-bold text-red-700">
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
