'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    Building2,
    Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/dashboard/employees', icon: Users },
    { name: 'Departments', href: '/dashboard/departments', icon: Building2 },
    { name: 'Shifts', href: '/dashboard/shifts', icon: Clock },
    { name: 'Attendance', href: '/dashboard/attendance', icon: Calendar },
    { name: 'Attendance Reports', href: '/dashboard/attendance/reports', icon: BarChart3 },
    { name: 'Leave Requests', href: '/dashboard/leaves', icon: FileText },
    { name: 'Performance', href: '/dashboard/performance', icon: BarChart3 },
    { name: 'Performance Reviews', href: '/dashboard/performance/reviews', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // Clear cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
    };

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold text-primary">EMS</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="border-t p-3">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}
