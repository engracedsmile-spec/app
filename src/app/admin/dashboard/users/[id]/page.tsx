"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Status, UserStatus, Booking, Terminal } from "@/lib/data";
import { ArrowLeft, Wallet, Package, UserX, Edit, Car, TerminalSquare } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Role } from "@/lib/permissions";
import { Timestamp, getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Preloader } from "@/components/preloader";
import useSWR from 'swr';
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerBody, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { SubHeader } from "@/components/sub-header";
import { PhoneInput } from "@/components/ui/phone-input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { usePreloader } from "@/context/preloader-context";


const fetcher = async (url: string, idToken: string | undefined) => {
    if (!idToken) throw new Error("Not authorized");
    const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` }});
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `An error occurred on the server (${res.status}).` }));
        const error = new Error(errorData.message || 'An error occurred while fetching data.');
        throw error;
    }
    return res.json();
}

const editFormSchema = z.object({
    name: z.string().min(2, "Name is required."),
    email: z.string().email("Invalid email address."),
    phone: z.string().min(10, "Invalid phone number."),
    role: z.string(),
    status: z.string() as z.ZodType<UserStatus>,
    terminalId: z.string().optional(),
    vehicle: z.string().optional(),
    licensePlate: z.string().optional(),
});

const EditUserDialog = ({ user, onUserUpdated, terminals }: { user: User, onUserUpdated: (user: User) => void, terminals: Terminal[] }) => {
    const [open, setOpen] = useState(false);
    const { firebaseUser } = useAuth();
    const form = useForm<z.infer<typeof editFormSchema>>({
        resolver: zodResolver(editFormSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role || user.userType,
            status: user.status,
            terminalId: user.terminalId || '',
            vehicle: user.vehicle || '',
            licensePlate: user.licensePlate || '',
        },
    });

    const isDriver = form.watch('role') === 'driver';

    const onSubmit = async (data: z.infer<typeof editFormSchema>) => {
        if (!firebaseUser) return;
        
        try {
            const idToken = await firebaseUser.getIdToken();
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update user.");
            }

            const updatedUser = await response.json();
            toast.success("User Updated", { description: `${updatedUser.name}'s details have been saved.` });
            onUserUpdated(updatedUser);
            setOpen(false);
        } catch (error: any) {
             throw new Error(error.message || "Could not save user details.");
        }
    };

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={<Button variant="outline"><Edit className="mr-2 h-4 w-4"/> Edit User</Button>}>
            <DrawerHeader>
                <DrawerTitle>Edit User Details</DrawerTitle>
                <DrawerDescription>Make changes to the user's profile below.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
                <div className="p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} id="edit-user-form" className="space-y-4 pt-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input type="text" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Phone</FormLabel><FormControl><PhoneInput control={form.control} {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem><FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="customer">Customer</SelectItem>
                                            <SelectItem value="driver">Driver</SelectItem>
                                            <SelectItem value="Manager">Manager (Admin)</SelectItem>
                                            <SelectItem value="Support">Support (Admin)</SelectItem>
                                            <SelectItem value="Finance">Finance (Admin)</SelectItem>
                                            <SelectItem value="Marketing">Marketing (Admin)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )} />
                             {isDriver && (
                                <>
                                    <FormField control={form.control} name="terminalId" render={({ field }) => (
                                        <FormItem><FormLabel>Home Terminal</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Assign a home terminal"/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {terminals.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        <FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="vehicle" render={({ field }) => (
                                        <FormItem><FormLabel>Vehicle Model</FormLabel><FormControl><Input {...field} placeholder="e.g. Toyota Sienna"/></FormControl><FormMessage/></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="licensePlate" render={({ field }) => (
                                        <FormItem><FormLabel>License Plate</FormLabel><FormControl><Input {...field} placeholder="e.g. ABC-123-XY"/></FormControl><FormMessage/></FormItem>
                                    )}/>
                                </>
                            )}
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                            <SelectItem value="Suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )} />
                        </form>
                    </Form>
                </div>
            </DrawerBody>
             <DrawerFooter>
                 <Button type="submit" form="edit-user-form">Save Changes</Button>
            </DrawerFooter>
        </ResponsiveDialog>
    )
}

const StatCard = ({ title, value, icon: Icon, loading }: { title: string, value: string, icon: React.ElementType, loading: boolean }) => (
    <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
        </CardContent>
    </Card>
);

const StatusBadge = ({ status }: { status: Status }) => {
    const variants: Record<Status, string> = {
        'On Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Delayed': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Pending': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        'Completed': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Boarding': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        'In Transit': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return <Badge variant="outline" className={`text-xs font-medium border-0 ${variants[status]}`}>{status}</Badge>;
};

const UserStatusBadge = ({ status }: { status: UserStatus }) => {
    const variants: Record<UserStatus, string> = {
        'Active': 'text-green-500 border-green-500/50 bg-green-500/10',
        'Online': 'text-green-500 border-green-500/50 bg-green-500/10',
        'Offline': 'text-muted-foreground border-border bg-card',
        'Inactive': 'text-muted-foreground border-border bg-card',
        'Suspended': 'text-red-500 border-red-500/50 bg-red-500/10',
    };
    return <Badge variant="outline" className={variants[status]}>{status}</Badge>;
};


export default function UserDetailPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const { firebaseUser, firestore } = useAuth();
    const [idToken, setIdToken] = useState<string | undefined>();
    const [terminals, setTerminals] = useState<Terminal[]>([]);

    useEffect(() => {
        firebaseUser?.getIdToken().then(setIdToken);
    }, [firebaseUser]);
    
    useEffect(() => {
        const terminalsUnsub = onSnapshot(collection(firestore, 'terminals'), (snapshot) => {
            setTerminals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Terminal)));
        });
        return () => terminalsUnsub();
    }, [firestore]);

    const { data: user, isLoading: loadingUser, error: userError, mutate: mutateUser } = useSWR<User>(
        idToken ? [`/api/admin/users/${userId}`, idToken] : null, 
        ([url, token]) => fetcher(url, token),
        { revalidateOnFocus: false, revalidateOnReconnect: false }
    );
    
    const { data: userBookings, isLoading: loadingBookings, error: bookingsError } = useSWR<Booking[]>(
        idToken && userId ? [`/api/admin/users/${userId}/bookings`, idToken] : null, 
        ([url, token]) => fetcher(url, token),
        { revalidateOnFocus: false, revalidateOnReconnect: false }
    );
    
    if (userError) throw userError;
    if (bookingsError) throw bookingsError;

    const loading = loadingUser || loadingBookings;

    const handleUserUpdated = (updatedUser: User) => {
        mutateUser(updatedUser);
    }
    
    const handleDeleteUser = async () => {
        if (!user || !firebaseUser) return;
        
        try {
            const idToken = await firebaseUser.getIdToken();
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete user.");
            }

            toast.success("User Deleted", { description: `${user.name} has been removed from the system.` });
            router.push("/admin/dashboard/users");
        } catch (error: any) {
            throw new Error(error.message || 'Could not delete user.');
        }
    }

    if (loading) {
        return <Preloader />
    }

    if (!user) {
        return (
            <div className="flex flex-col h-full">
                <SubHeader title="User Not Found" />
                <main className="flex-1 flex items-center justify-center p-4 md:p-6">
                    <p>Could not find details for this user.</p>
                </main>
            </div>
        );
    }
    
    const isDriver = user.userType === 'driver';

    return (
         <>
            <SubHeader title="User Details">
                <div className="flex items-center gap-2">
                    <EditUserDialog user={user} onUserUpdated={handleUserUpdated} terminals={terminals} />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive"><UserX className="mr-2 h-4 w-4"/> Delete User</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                             <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user's profile and authentication record.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteUser}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </SubHeader>
            <div className="p-4 md:p-6 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                         <Avatar className="h-16 w-16">
                            <AvatarImage src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user?.email}`} />
                            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{user?.name}</CardTitle>
                            <div className="text-muted-foreground space-x-4">
                                <span>{user?.phone}</span>
                                <span>{user?.email}</span>
                            </div>
                        </div>
                    </CardHeader>
                    {user && (
                        <CardContent>
                             <div className="flex items-center gap-4">
                                <UserStatusBadge status={user.status} />
                                {isDriver && user.vehicle && <Badge variant="secondary" className="flex items-center gap-2"><Car className="h-4 w-4"/> {user.vehicle} ({user.licensePlate})</Badge>}
                                {isDriver && user.terminalId && <Badge variant="secondary" className="flex items-center gap-2"><TerminalSquare className="h-4 w-4"/> {terminals.find(t => t.id === user.terminalId)?.name}</Badge>}
                            </div>
                        </CardContent>
                    )}
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                    <StatCard loading={loading} title="Wallet Balance" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(user?.walletBalance || 0)} icon={Wallet} />
                    <StatCard loading={loading} title="Total Bookings" value={userBookings?.length.toString() || '0'} icon={Package} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Booking History</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : userBookings && userBookings.length > 0 ? userBookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-mono text-xs">{booking.id.slice(0, 10)}</TableCell>
                                        <TableCell className="capitalize">{booking.bookingType?.replace('_', ' ')}</TableCell>
                                        <TableCell><StatusBadge status={booking.status as Status} /></TableCell>
                                        <TableCell>{(booking.createdAt as Timestamp)?.toDate().toLocaleDateString() || 'N/A'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">No bookings found for this user.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
