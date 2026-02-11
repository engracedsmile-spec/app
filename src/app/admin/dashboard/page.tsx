
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, DollarSign, Activity, CheckCircle, Clock, Truck, Car, Package, ArrowRight, Loader2, BarChart, LineChart, RefreshCw, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Booking, FundRequest, Expense } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useSWR, { useSWRConfig } from 'swr';
import { Timestamp } from 'firebase/firestore';
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { ChartContainer } from '@/components/ui/chart';
import { Bar, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import { AdminHeader } from './header';
import { usePreloader } from '@/context/preloader-context';
import { useRouter } from 'next/navigation';
import { LoyaltySystem } from './components/loyalty-system';
import { AdvancedBooking } from './components/advanced-booking';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/error-boundary';

const UIImprovements = dynamic(
  () => import('./components/ui-improvements').then(mod => ({ default: mod.UIImprovements })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }
);

// Error boundary wrapper for UIImprovements
const UIImprovementsWrapper = () => {
  // Since UIImprovements is already dynamically imported with ssr: false,
  // we can render it directly. The dynamic import handles the loading state.
  return (
    <React.Suspense
      fallback={
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      }
    >
      <UIImprovements />
    </React.Suspense>
  );
};

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

const FinancialsView = ({ bookings, expenses, payments, transfers, loading, isSyncing, handleSyncPaystack }: { bookings: Booking[], expenses: Expense[], payments: any[], transfers: any[], loading: boolean, isSyncing: boolean, handleSyncPaystack: () => void }) => {
    const financialStats = useMemo(() => {
        const totalRevenue = bookings.filter(s => s.status === 'Completed' || s.status === 'Delivered').reduce((acc, s) => acc + (s.price || 0), 0);
        const totalExpenses = expenses.filter(e => e.status === 'approved').reduce((acc, e) => acc + e.amount, 0);
        const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((acc, e) => acc + e.amount, 0);
        
        // Add Paystack payment data
        const totalPaystackPayments = payments
            .filter(p => p.status === 'success')
            .reduce((acc, p) => acc + Number(p.amount || 0), 0);
        const totalTransfers = transfers
            .filter(t => t.status === 'success')
            .reduce((acc, t) => acc + Number(t.amount || 0), 0);
        
        return { totalRevenue, totalExpenses, pendingExpenses, totalPaystackPayments, totalTransfers };
    }, [bookings, expenses, payments, transfers]);

    return (
         <div className="space-y-6">
             <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Revenue" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(financialStats.totalRevenue)} icon={DollarSign} loading={loading} />
                <StatCard title="Paystack Payments" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(financialStats.totalPaystackPayments)} icon={DollarSign} loading={loading} />
                <StatCard title="Total Expenses" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(financialStats.totalExpenses)} icon={CheckCircle} loading={loading} />
                <StatCard title="Pending Expenses" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(financialStats.pendingExpenses)} icon={Clock} href="/admin/dashboard/payouts" loading={loading} />
            </div>
             <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                 <Card>
                    <CardHeader><CardTitle>Recent Expenses</CardTitle></CardHeader>
                    <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Driver</TableHead><TableHead>Amount</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {loading ? Array.from({length: 3}).map((_, i) => (
                                        <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-12 w-full"/></TableCell></TableRow>
                                    )) : expenses.length > 0 ? expenses.slice(0,5).map((exp: Expense) => (
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
                 
                 <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Paystack Payments</CardTitle>
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={handleSyncPaystack}
                                disabled={isSyncing}
                            >
                                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                {isSyncing ? 'Syncing...' : 'Sync Paystack'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {loading ? Array.from({length: 3}).map((_, i) => (
                                        <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-12 w-full"/></TableCell></TableRow>
                                    )) : payments.length > 0 ? payments.slice(0,5).map((payment: any) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {(() => {
                                                    const name = typeof payment.customerName === 'string' ? payment.customerName.trim() : '';
                                                    return name || payment.customerEmail || 'Unknown';
                                                })()}
                                            </TableCell>
                                            <TableCell>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(payment.amount)}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    payment.status === 'success' ? 'bg-green-100 text-green-800' : 
                                                    payment.status === 'failed' ? 'bg-red-100 text-red-800' : 
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {payment.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const toDate = (value: any): Date | null => {
                                                        if (!value) return null;
                                                        if (value instanceof Date) return value;
                                                        if (typeof value === 'string' || typeof value === 'number') {
                                                            const parsed = new Date(value);
                                                            return isNaN(parsed.getTime()) ? null : parsed;
                                                        }
                                                        if (typeof value === 'object') {
                                                            if (typeof value.toDate === 'function') {
                                                                try {
                                                                    return value.toDate();
                                                                } catch (error) {
                                                                    console.error('Failed to convert timestamp with toDate():', error);
                                                                }
                                                            }
                                                            const seconds = typeof value.seconds === 'number' ? value.seconds : typeof value._seconds === 'number' ? value._seconds : null;
                                                            if (seconds !== null) {
                                                                const nanos = typeof value.nanoseconds === 'number' ? value.nanoseconds : typeof value._nanoseconds === 'number' ? value._nanoseconds : 0;
                                                                return new Date(seconds * 1000 + nanos / 1_000_000);
                                                            }
                                                        }
                                                        return null;
                                                    };
                                                    const resolved = toDate(payment.originalDate) || toDate(payment.date);
                                                    return resolved ? resolved.toLocaleDateString() : 'N/A';
                                                })()}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={4} className="text-center h-24">No Paystack payments yet. Click "Sync Paystack" to import existing payments.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                    </CardContent>
                 </Card>
             </div>
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
            // For driver trips, we need to look at scheduled trips or bookings associated with vehicles
            // Since Booking doesn't have driverId, we'll count based on user association or skip for now
            const completedTrips = bookings.filter((s) => (s.status === 'Completed' || s.status === 'Delivered'));
            return {
                id: driver.id, name: driver.name,
                trips: 0 // TODO: Implement proper driver trip counting when driverId is added to bookings
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
    const [isSyncing, setIsSyncing] = React.useState(false)
    const { mutate } = useSWRConfig();

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
        
        const updateCurrent = () => {
            try {
                setCurrent(api.selectedScrollSnap());
            } catch (error) {
                console.error('Error updating carousel current index:', error);
            }
        };
        
        setCurrent(api.selectedScrollSnap());
        api.on("select", updateCurrent);
        
        // Cleanup function
        return () => {
            try {
                api.off("select", updateCurrent);
            } catch (error) {
                console.error('Error cleaning up carousel listener:', error);
            }
        };
    }, [api]);

    const handleSyncPaystack = React.useCallback(async () => {
        if (!idToken) return;
        
        setIsSyncing(true);
        try {
            // Get date range for last 30 days
            const response = await fetch('/api/admin/sync-paystack', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullSync: true }),
            });

            const result = await response.json();
            
            if (response.ok) {
                toast.success("Sync Complete", { 
                    description: `Synced ${result.syncedCount} payments, skipped ${result.skippedCount} existing payments.` 
                });
                // Refresh the dashboard data – fall back to full reload if revalidation fails
                const key: [string, string] = ['/api/admin/data', idToken];
                try {
                    await mutate(key, () => fetcher('/api/admin/data', idToken), { revalidate: false, throwOnError: true });
                } catch (mutationError) {
                    console.error('Dashboard data revalidation failed, falling back to hard reload:', mutationError);
                    window.location.reload();
                }
            } else {
                toast.error("Sync Failed", { description: result.message });
            }
        } catch (error) {
            console.error('Sync error:', error);
            toast.error("Sync Failed", { description: "An error occurred while syncing Paystack data." });
        } finally {
            setIsSyncing(false);
        }
    }, [idToken, mutate]);
    
    // Define view configuration - separate data from rendering
    const viewsConfig = useMemo(() => [
        { key: 'operations', title: 'Operations', icon: Activity },
        { key: 'financials', title: 'Financials', icon: DollarSign },
        { key: 'analytics', title: 'Analytics', icon: BarChart },
        { key: 'loyalty', title: 'Loyalty Program', icon: Users },
        { key: 'advanced-booking', title: 'Advanced Booking', icon: Package },
        // Temporarily disabled to isolate the error
        // { key: 'ui-improvements', title: 'UI Improvements', icon: Settings },
    ], []);
    
    // Render component function - this avoids creating JSX in useMemo
    const renderView = React.useCallback((viewKey: string) => {
        switch (viewKey) {
            case 'operations':
                return <OperationsView bookings={data?.bookings || []} loading={isLoading} />;
            case 'financials':
                return <FinancialsView bookings={data?.bookings || []} expenses={data?.expenses || []} payments={data?.payments || []} transfers={data?.transfers || []} loading={isLoading} isSyncing={isSyncing} handleSyncPaystack={handleSyncPaystack} />;
            case 'analytics':
                return <AnalyticsView bookings={data?.bookings || []} users={data?.users || []} loading={isLoading} />;
            case 'loyalty':
                return <LoyaltySystem users={data?.users || []} bookings={data?.bookings || []} loading={isLoading} />;
            case 'advanced-booking':
                return <AdvancedBooking bookings={data?.bookings || []} scheduledTrips={data?.scheduledTrips || []} loading={isLoading} />;
            case 'ui-improvements':
                // Temporarily return placeholder to isolate error
                return <div className="p-4 text-center">UI Improvements temporarily disabled</div>;
            default:
                return null;
        }
    }, [data?.bookings, data?.expenses, data?.payments, data?.transfers, data?.users, data?.vehicles, data?.scheduledTrips, isLoading, isSyncing, handleSyncPaystack]);
    
    return (
        <ErrorBoundary>
            <AdminHeader />
            <div className="p-4 md:p-6 space-y-6">
                <div className="w-full flex justify-center">
                    <div className="flex items-center gap-2 p-1 rounded-full bg-muted">
                        {viewsConfig.map((view, index) => {
                            const Icon = view.icon;
                            return (
                                <Button
                                    key={view.key}
                                    variant={current === index ? 'default' : 'ghost'}
                                    size="sm"
                                    className="rounded-full h-9 px-4"
                                    onClick={() => api?.scrollTo(index)}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {view.title}
                                </Button>
                            );
                        })}
                    </div>
                </div>
                <ErrorBoundary>
                    <Carousel setApi={setApi} className="w-full">
                        <CarouselContent>
                            {viewsConfig.map((view) => (
                                <CarouselItem key={view.key}>
                                    <ErrorBoundary fallback={
                                        <div className="p-4 text-center text-muted-foreground">
                                            Error loading {view.title}. Please try refreshing.
                                        </div>
                                    }>
                                        {renderView(view.key)}
                                    </ErrorBoundary>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </ErrorBoundary>
            </div>
        </ErrorBoundary>
    )
}
