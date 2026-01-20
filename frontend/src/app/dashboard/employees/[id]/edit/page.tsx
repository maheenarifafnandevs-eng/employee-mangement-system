'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Department {
    id: string;
    name: string;
}

interface Shift {
    id: string;
    name: string;
}

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
    departmentId: string;
    managerId: string;
    salary: string;
    hireDate: string;
    employmentType: string;
    status: string;
}

export default function EditEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        position: '',
        departmentId: '',
        managerId: '',
        salary: '',
        hireDate: '',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        shiftId: '',
    });
    const [shifts, setShifts] = useState<Shift[]>([]);

    useEffect(() => {
        fetchDepartments();
        fetchShifts();
        fetchEmployee();
    }, [id]);

    const fetchShifts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/shifts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setShifts(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch shifts', err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/departments', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setDepartments(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch departments', err);
        }
    };

    const fetchEmployee = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/employees/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                const emp = data.data;
                setFormData({
                    firstName: emp.firstName || '',
                    lastName: emp.lastName || '',
                    email: emp.email || '',
                    phone: emp.phone || '',
                    dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
                    gender: emp.gender || '',
                    address: emp.address || '',
                    city: emp.city || '',
                    country: emp.country || '',
                    postalCode: emp.postalCode || '',
                    position: emp.position || '',
                    departmentId: emp.departmentId || '',
                    managerId: emp.managerId || '',
                    salary: emp.salary || '',
                    hireDate: emp.hireDate ? emp.hireDate.split('T')[0] : '',
                    employmentType: emp.employmentType || 'FULL_TIME',
                    status: emp.status || 'ACTIVE',
                    shiftId: emp.shiftId || '',
                });
            }
        } catch (err) {
            console.error('Failed to fetch employee', err);
            setError('Failed to load employee data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/employees/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Employee updated successfully!');
                router.push('/dashboard/employees');
            } else {
                setError(data.message || 'Failed to update employee');
                toast.error(data.message || 'Failed to update employee');
            }
        } catch (err) {
            setError('Unable to connect to server');
            toast.error('Unable to connect to server');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Employee</h1>
                    <p className="text-muted-foreground">Update employee information</p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Basic employee details</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="position">Position *</Label>
                            <Input
                                id="position"
                                required
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="department">Department *</Label>
                            <Select
                                value={formData.departmentId}
                                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="shift">Assign Shift</Label>
                            <Select
                                value={formData.shiftId}
                                onValueChange={(value) => setFormData({ ...formData, shiftId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select shift (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Shift</SelectItem>
                                    {shifts.map((shift) => (
                                        <SelectItem key={shift.id} value={shift.id}>
                                            {shift.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="hireDate">Hire Date *</Label>
                            <Input
                                id="hireDate"
                                type="date"
                                required
                                value={formData.hireDate}
                                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="employmentType">Employment Type *</Label>
                            <Select
                                value={formData.employmentType}
                                onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                                    <SelectItem value="CONTRACT">Contract</SelectItem>
                                    <SelectItem value="INTERN">Intern</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="status">Status *</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
