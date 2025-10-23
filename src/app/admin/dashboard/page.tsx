
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, DollarSign, Activity, CheckCircle, Clock, Truck, Car, Package, ArrowRight, Loader2, BarChart, LineChart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Booking, FundRequest, Expense } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useSWR from 'swr';
import { Timestamp } from 'firebase/firestore';
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { ChartContainer } from '@/components/ui/chart';
import { Bar, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import { AdminHeader } from './header';
import { usePreloader } from '@/context/preloader-context';
import { useRouter } from 'next/navigation';

const fetcher = async (url: string, idToken: string | undefined) => {
    if (!idToken) {
        throw new Error("Not authorized: No ID token provided.");
    }
    const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` }});

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `An error occurred on the server (${res.status}).` }));
        throw new Error(errorData.message || 'An error occurred while fetching data.');
    }
    
    return res.json();
}

const StatusBadge = ({ status }: { status: Booking['status'] }) => {
    const variants: Record<Booking['status'], string> = {
        'On Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Delayed': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Delivered': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Pending': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        'Completed': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Boarding': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        'In Transit': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return <Badge variant="outline" className={`text-xs font-medium border-0 ${variants[status]}`}>{status}</Badge>;
};

const StatCard = ({ title, value, icon: Icon, href, loading }: { title: string, value: string, icon: React.ElementType, href?: string, loading: boolean }) => {
    const { showPreloader } = usePreloader();
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!href) return;
        e.preventDefault();
        showPreloader();
        router.push(href);
    };

    const cardContent = (
        <Card className="bg-card hover:bg-muted/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
            </CardContent>
        </Card>
    );
    
    return href ? <Link href={href} onClick={handleClick} className="block h-full">{cardContent}</Link> : <div className="h-full">{cardContent}</div>;
};

const OperationsView = ({ bookings, loading }: { bookings: Booking[], loading: boolean }) => {
    const operationalStats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const toDate = (timestamp: any): Date | null => {
             if (!timestamp) return null;
            if (timestamp instanceof Timestamp) return timestamp.toDate();
            if(typeof timestamp === 'object' && timestamp.seconds) return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
            if (typeof timestamp === 'string' && !isNaN(Date.parse(timestamp))) return new Date(timestamp);
            return null;
        }
        const todaysTrips = bookings.filter((s: Booking) => toDate(s.createdAt)?.toISOString().split('T')[0] === today);

        return {
            todaysTrips: todaysTrips.length,
            inProgress: bookings.filter((s: Booking) => s.status === 'On Progress' || s.status === 'In Transit').length,
            completedToday: todaysTrips.filter((s: Booking) => s.status === 'Completed' || s.status === 'Delivered').length,
        };
    }, [bookings]);

    return (
        <div className="space-y-6">
             <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <StatCard title="Today's Trips" value={(operationalStats.todaysTrips || 0).toString()} icon={Car} href="/admin/dashboard/departures" loading={loading} />
                <StatCard title="In Progress" value={(operationalStats.inProgress || 0).toString()} icon={Truck} href="/admin/dashboard/departures" loading={loading} />
                <StatCard title="Completed Today" value={(operationalStats.completedToday || 0).toString()} icon={CheckCircle} href="/admin/dashboard/departures" loading={loading} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Trips</CardTitle>
                </CardHeader>
                <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Passenger</TableHead><TableHead>Route</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {loading ? Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-12 w-full"/></TableCell></TableRow>
                                )) : bookings && bookings.length > 0 ? (
                                bookings.slice(0, 10).map((trip: Booking) => (
                                     <TableRow key={trip.id}>
                                        <TableCell><p className="font-medium">{trip.passengerName}</p><p className="text-xs text-muted-foreground font-mono">{trip.id.slice(0,10)}...</p></TableCell>
                                        <TableCell><p className="font-medium">{trip.pickupAddress.split(',')[0]} to {trip.destinationAddress.split(',')[0]}</p></TableCell>
                                        <TableCell><StatusBadge status={trip.status} /></TableCell>
                                        <TableCell className="text-right"><Button asChild variant="ghost" size="sm"><Link href={`/admin/dashboard/departures/${trip.scheduledTripId}`}>View</Link></Button></TableCell>
                                    </TableRow>
                                ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24">No trips yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                </CardContent>
            </Card>
        </div>
    );
};

const FinancialsView = ({ bookings, expenses, loading }: { bookings: Booking[], expenses: Expense[], loading: boolean }) => {
    const financialStats = useMemo(() => {
        const totalRevenue = bookings.filter(s => s.status === 'Completed' || s.status === 'Delivered').reduce((acc, s) => acc + (s.price || 0), 0);
        const totalExpenses = expenses.filter(e => e.status === 'approved').reduce((acc, e) => acc + e.amount, 0);
        const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((acc, e) => acc + e.amount, 0);
        return { totalRevenue, totalExpenses, pendingExpenses };
    }, [bookings, expenses]);

    return (
         <div className="space-y-6">
             <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <StatCard title="Total Revenue" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(financialStats.totalRevenue)} icon={DollarSign} loading={loading} />
                <StatCard title="Total Expenses" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(financialStats.totalExpenses)} icon={CheckCircle} loading={loading} />
                <StatCard title="Pending Expenses" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(financialStats.pendingExpenses)} icon={Clock} href="/admin/dashboard/payouts" loading={loading} />
            </div>
             <Card>
                <CardHeader><CardTitle>Recent Expenses</CardTitle></CardHeader>
                <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Driver</TableHead><TableHead>Amount</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {loading ? Array.from({length: 3}).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-12 w-full"/></TableCell></TableRow>
                                )) : expenses.length > 0 ? expenses.slice(0,10).map((exp: Expense) => (
                                    <TableRow key={exp.id}>
                                        <TableCell>{exp.driverName}</TableCell>
                                        <TableCell>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(exp.amount)}</TableCell>
                                        <TableCell>{exp.type}</TableCell>
                                        <TableCell>{(exp.date as any)?.toDate().toLocaleDateString()}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">No expenses logged yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                </CardContent>
             </Card>
        </div>
    );
};

const AnalyticsView = ({ bookings, users, loading }: { bookings: Booking[], users: any[], loading: boolean }) => {
    const analyticsData = useMemo(() => {
        if (!bookings) return { bookingStatusData: [], topDrivers: [] };
        
        const statusCounts = bookings.reduce((acc: any, s: Booking) => {
            const status = s.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
        
        const topDrivers = users.filter((u) => u.userType === 'driver').map((driver) => {
            const completedTrips = bookings.filter((s) => s.driverId === driver.id && (s.status === 'Completed' || s.status === 'Delivered'));
            return {
                id: driver.id, name: driver.name,
                trips: completedTrips.length
            }
        }).sort((a,b) => b.trips - a.trips).slice(0, 5);

        return {
            bookingStatusData: [
                { name: 'Completed', value: (statusCounts['Completed'] || 0) + (statusCounts['Delivered'] || 0), fill: 'hsl(var(--chart-2))' },
                { name: 'In Progress', value: (statusCounts['On Progress'] || 0) + (statusCounts['In Transit'] || 0) + (statusCounts['Boarding'] || 0), fill: 'hsl(var(--chart-1))' },
                { name: 'Pending', value: statusCounts['Pending'] || 0, fill: 'hsl(var(--chart-4))'},
                { name: 'Cancelled', value: statusCounts['Cancelled'] || 0, fill: 'hsl(var(--destructive))' },
            ],
            topDrivers
        };
    }, [bookings, users]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Booking Status Breakdown</CardTitle></CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-[250px] w-full">
                        {loading || analyticsData.bookingStatusData.every(d => d.value === 0) ? <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div> :
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={analyticsData.bookingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        }
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Top Drivers by Trips Completed</CardTitle></CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Driver</TableHead><TableHead className="text-right">Completed Trips</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {loading ? Array.from({length: 3}).map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={2}><Skeleton className="h-12 w-full"/></TableCell></TableRow>
                            )) : analyticsData.topDrivers.map((driver) => (
                                <TableRow key={driver.id}>
                                    <TableCell>{driver.name}</TableCell>
                                    <TableCell className="text-right font-bold">{driver.trips}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};


export default function AdminDashboardPage() {
    const { firebaseUser } = useAuth();
    const [idToken, setIdToken] = React.useState<string | undefined>();
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)

    useEffect(() => {
        firebaseUser?.getIdToken().then(setIdToken);
    }, [firebaseUser]);
    
    const { data, error, isLoading } = useSWR(idToken ? ['/api/admin/data', idToken] : null, ([url, token]) => fetcher(url, token), { 
        onError: (err) => {
            toast.error("Data Fetching Error", { description: err.message || 'An error occurred while fetching data.'});
        }
    });
    
    useEffect(() => {
        if (!api) return;
        setCurrent(api.selectedScrollSnap());
        api.on("select", () => setCurrent(api.selectedScrollSnap()));
    }, [api]);
    
    const views = [
        { key: 'operations', title: 'Operations', icon: Activity, component: <OperationsView bookings={data?.bookings || []} loading={isLoading} /> },
        { key: 'financials', title: 'Financials', icon: DollarSign, component: <FinancialsView bookings={data?.bookings || []} expenses={data?.expenses || []} loading={isLoading} /> },
        { key: 'analytics', title: 'Analytics', icon: BarChart, component: <AnalyticsView bookings={data?.bookings || []} users={data?.users || []} loading={isLoading} /> },
    ];
    
    return (
        <>
            <AdminHeader />
            <div className="p-4 md:p-6 space-y-6">
                <div className="w-full flex justify-center">
                    <div className="flex items-center gap-2 p-1 rounded-full bg-muted">
                        {views.map((view, index) => (
                            <Button
                                key={view.key}
                                variant={current === index ? 'default' : 'ghost'}
                                size="sm"
                                className="rounded-full h-9 px-4"
                                onClick={() => api?.scrollTo(index)}
                            >
                                <view.icon className="mr-2 h-4 w-4" />
                                {view.title}
                            </Button>
                        ))}
                    </div>
                </div>
                <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {views.map((view) => (
                            <CarouselItem key={view.key}>{view.component}</CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </>
    )
}
