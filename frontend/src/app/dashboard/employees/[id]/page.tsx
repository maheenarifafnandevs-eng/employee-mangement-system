'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Building2 } from 'lucide-react';

interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    position: string;
    department: {
        name: string;
    };
    salary: string;
    hireDate: string;
    employmentType: string;
    status: string;
}

export default function EmployeeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const fetchEmployee = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setEmployee(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch employee:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            ACTIVE: 'default',
            INACTIVE: 'secondary',
            ON_LEAVE: 'secondary',
            TERMINATED: 'destructive',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    if (!employee) {
        return <div className="flex items-center justify-center h-96">Employee not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {employee.firstName} {employee.lastName}
                        </h1>
                        <p className="text-muted-foreground">{employee.position}</p>
                    </div>
                </div>
                <Button onClick={() => router.push(`/dashboard/employees/${id}/edit`)}>
                    Edit Employee
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{employee.email}</p>
                            </div>
                        </div>
                        {employee.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{employee.phone}</p>
                                </div>
                            </div>
                        )}
                        {employee.address && (
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="font-medium">
                                        {employee.address}
                                        {employee.city && `, ${employee.city}`}
                                        {employee.country && `, ${employee.country}`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Employee ID</p>
                            <p className="font-medium">{employee.employeeId}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Department</p>
                                <p className="font-medium">{employee.department.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Position</p>
                                <p className="font-medium">{employee.position}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Hire Date</p>
                                <p className="font-medium">
                                    {new Date(employee.hireDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Employment Type</p>
                            <p className="font-medium">{employee.employmentType.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            {getStatusBadge(employee.status)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
