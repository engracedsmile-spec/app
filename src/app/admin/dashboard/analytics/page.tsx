
"use client"

import { BarChart as RechartsBarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Package, Car, Activity, ArrowLeft, BellRing } from 'lucide-react';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminHelp } from '../help';
import { useEffect, useState, useMemo } from 'react';
import type { Booking, User as UserData, AppNotification } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Timestamp, collectionGroup, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import useSWR from 'swr';
import { useFirestore } from '@/firebase';


const fetcher = async (url: string, idToken: string | undefined) => {
    if (!idToken) {
        throw new Error("Not authorized: No ID token provided.");
    }
    const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` }});
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `An error occurred on the server (${res.status}).` }));
        const error = new Error(errorData.message || 'An error occurred while fetching data.');
        throw error;
    }
    
    return res.json();
}

const EmptyState = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-full py-12">
        <p className="text-sm text-muted-foreground">{message}</p>
    </div>
);


export default function AdminAnalyticsPage() {
    const router = useRouter();
    const { firebaseUser, firestore } = useAuth();
    const [idToken, setIdToken] = useState<string | undefined>();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);

    useEffect(() => {
        if (firebaseUser) {
            firebaseUser.getIdToken().then(setIdToken);
        }
    }, [firebaseUser]);
    
    const { data, error, isLoading: loading } = useSWR(
        idToken ? ['/api/admin/data', idToken] : null, 
        ([url, token]) => fetcher(url, token),
        { revalidateOnFocus: false, revalidateOnReconnect: false }
    );

     useEffect(() => {
        if (!firestore) return;
        setLoadingNotifications(true);
        const notificationsQuery = query(
            collectionGroup(firestore, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            const fetchedNotifs = snapshot.docs.map(doc => doc.data() as AppNotification);
            setNotifications(fetchedNotifs);
            setLoadingNotifications(false);
        }, (err) => {
            console.error("Error fetching notifications:", err);
            setLoadingNotifications(false);
        });
        return () => unsubscribe();
    }, [firestore]);
    
    if (error) {
        // Re-throw the error to be caught by the Next.js error boundary
        throw error;
    }
    
    const bookings = data?.bookings || [];
    const users = data?.users || [];
    

    const stats = useMemo(() => {
        const totalRevenue = bookings.reduce((acc: number, s: Booking) => acc + (s.price || 0), 0);
        const newUsers = users.length;
        const totalBookings = bookings.length;
        const activeDrivers = users.filter((u: UserData) => u.userType === 'driver' && u.status === 'Online').length;
        return { totalRevenue, newUsers, totalBookings, activeDrivers };
    }, [bookings, users]);

    const toDate = (timestamp: any): Date | null => {
        if (!timestamp) return null;
        if (timestamp instanceof Timestamp) return timestamp.toDate();
        if(typeof timestamp === 'object' && timestamp.seconds) return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
        if (typeof timestamp === 'string' && !isNaN(Date.parse(timestamp))) return new Date(timestamp);
        return null;
    }

    const revenueData = useMemo(() => {
        if (!bookings) return [];
        const dailyRevenue: { [key: string]: number } = {};
        bookings.forEach((s: Booking) => {
            const date = toDate(s.createdAt);
            if (!date) return;

            const dateStr = date.toISOString().split('T')[0];

            if (s.price) {
                dailyRevenue[dateStr] = (dailyRevenue[dateStr] || 0) + s.price;
            }
        });
        return Object.keys(dailyRevenue).map(date => ({
            date,
            revenue: dailyRevenue[date]
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);
    }, [bookings]);
    
    const bookingStatusData = useMemo(() => {
        if (!bookings || bookings.length === 0) return [];
        const statusCounts = bookings.reduce((acc: any, s: Booking) => {
            const status = s.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
         return [
            { name: 'Completed', value: (statusCounts['Completed'] || 0) + (statusCounts['Delivered'] || 0), fill: 'hsl(var(--chart-2))' },
            { name: 'In Progress', value: (statusCounts['On Progress'] || 0) + (statusCounts['In Transit'] || 0) + (statusCounts['Boarding'] || 0), fill: 'hsl(var(--chart-1))' },
            { name: 'Pending', value: statusCounts['Pending'] || 0, fill: 'hsl(var(--chart-4))'},
            { name: 'Cancelled', value: statusCounts['Cancelled'] || 0, fill: 'hsl(var(--destructive))' },
        ];
    }, [bookings]);
    
    const topDrivers = useMemo(() => {
        if (!users || !bookings) return [];
        const drivers = users.filter((u: UserData) => u.userType === 'driver');
        return drivers.map((driver: UserData) => {
            const driverShipments = bookings.filter((s: Booking) => s.scheduledTripId && s.status === 'Completed' || s.status === 'Delivered');
            const earnings = driverShipments.reduce((acc: number, s: Booking) => acc + (s.price || 0), 0);
            return {
                id: driver.id,
                name: driver.name,
                phone: driver.phone,
                avatar: driver.profilePictureUrl || `https://i.pravatar.cc/150?u=${driver.email}`,
                deliveries: driverShipments.length,
                earnings: earnings,
            }
        }).sort((a,b) => b.earnings - a.earnings).slice(0, 5);
    }, [users, bookings]);


    const revenueConfig: ChartConfig = { revenue: { label: "Revenue (₦)", color: 'hsl(var(--primary))' } };

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold truncate">Analytics Overview</h1>
                </div>
                 <div className="flex items-center gap-2">
                    <AdminHelp page="analytics" />
                </div>
            </header>
            <ScrollArea className="flex-1">
                <main className="p-4 md:p-6 space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {loading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stats.totalRevenue)}</div>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">New Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">+{stats.newUsers}</div>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">+{stats.totalBookings}</div>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                                    <Car className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{stats.activeDrivers}</div>}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="col-span-1 lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Revenue Over Time</CardTitle>
                                    <CardDescription>Revenue trends for the last 7 days.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={revenueConfig} className="h-[300px] w-full">
                                        {loading || revenueData.length === 0 ? <EmptyState message="No revenue data for this period." /> :
                                        <ResponsiveContainer>
                                            <RechartsBarChart data={revenueData}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short'})} />
                                                <YAxis tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
                                                <Tooltip cursor={false} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                                                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4}/>
                                            </RechartsBarChart>
                                        </ResponsiveContainer>
                                        }
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Booking Status</CardTitle>
                                    <CardDescription>Breakdown of all booking statuses.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={{}} className="h-[300px] w-full">
                                        {loading || bookingStatusData.every(d => d.value === 0) ? <EmptyState message="No booking data to display." /> :
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={bookingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label />
                                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        }
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="col-span-1 lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Top Drivers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[300px]">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Driver</TableHead>
                                                    <TableHead className="text-right">Deliveries</TableHead>
                                                    <TableHead className="text-right">Total Earnings</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? Array.from({length: 3}).map((_, i) => (
                                                    <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-16 w-full" /></TableCell></TableRow>
                                                )) : topDrivers && topDrivers.length > 0 ? topDrivers.map((driver: any) => (
                                                    <TableRow key={driver.id}>
                                                        <TableCell className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={driver.avatar} />
                                                                <AvatarFallback>{driver.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{driver.name}</p>
                                                                <p className="text-xs text-muted-foreground">{driver.phone}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">{driver.deliveries}</TableCell>
                                                        <TableCell className="text-right font-medium">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(driver.earnings)}</TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">No driver data yet.</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <ScrollArea className="h-[300px]">
                                        {loadingNotifications ? <Skeleton className="h-full w-full" /> : (
                                            notifications.length > 0 ? (
                                                <div className="space-y-4">
                                                    {notifications.map((notif) => (
                                                        <div key={notif.id} className="flex items-start gap-3 text-xs">
                                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted flex-shrink-0">
                                                                <BellRing className="h-4 w-4 text-muted-foreground"/>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">{notif.title}</p>
                                                                <p className="text-muted-foreground">{notif.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center text-muted-foreground py-8">No system activity yet.</p>
                                            )
                                        )}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                </main>
            </ScrollArea>
        </div>
    );
}

    