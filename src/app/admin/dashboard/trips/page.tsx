
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Booking, Status, User, Vehicle } from "@/lib/data";
import { MoreHorizontal, Search, CheckCircle2, Car, Users, XCircle, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useFirestore } from '@/firebase';
import { AdminHelp } from '../help';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { SubHeader } from '@/components/sub-header';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { usePreloader } from '@/context/preloader-context';
import { DatePickerWithRange } from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays, format, subDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter } from '@/components/ui/drawer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from 'sonner';
import { doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { Checkbox } from '@/components/ui/checkbox';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from 'react-hook-form';
import { ManifestDialog } from './manifest-dialog';


const fetcher = async (url: string, idToken: string | undefined) => {
    if (!idToken) throw new Error("Not authorized");
    const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` }});
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `An error occurred on the server (${res.status}).` }));
        throw new Error(errorData.message || 'An error occurred while fetching data.');
    }
    return res.json();
}

const assignFormSchema = z.object({
  driverId: z.string().min(1, "Please select a driver."),
  vehicleId: z.string().min(1, "Please select a vehicle."),
});

const AssignDialog = ({ booking, onComplete, drivers, vehicles, trigger }: { booking: Booking, onComplete: () => void, drivers: User[], vehicles: Vehicle[], trigger: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const { firestore } = useAuth();
    
    const form = useForm({
        resolver: zodResolver(assignFormSchema),
        defaultValues: { driverId: booking.driverId || "", vehicleId: booking.vehicleId || "" },
    });

    const onSubmit = async (data: z.infer<typeof assignFormSchema>) => {
        const driver = drivers?.find(d => d.id === data.driverId);
        if (!driver) {
            toast.error("Selected driver not found.");
            return;
        }

        const bookingRef = doc(firestore, 'bookings', booking.id);
        
        try {
            await updateDoc(bookingRef, {
                driverId: data.driverId,
                vehicleId: data.vehicleId,
                driverName: driver.name,
                status: 'Confirmed'
            });
            toast.success("Charter Assigned!", { description: `${driver.name} has been assigned.`});
            onComplete();
            setOpen(false);
        } catch (error) {
            toast.error("Assignment Failed", { description: "Could not update the charter record."});
        }
    };
    
    const activeDrivers = drivers.filter(d => d.status === 'Active');
    const charterVehicles = vehicles.filter(v => v.status === 'Active' && (v.serviceType === 'charter' || v.serviceType === 'all'));

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={trigger}>
            <DrawerHeader>
                <DrawerTitle>Assign Charter</DrawerTitle>
                <DrawerDescription>Select a driver and vehicle for this booking.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
                <Form {...form}>
                    <form id="charter-assignment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField control={form.control} name="driverId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Driver</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a driver"/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {activeDrivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="vehicleId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vehicle</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a vehicle"/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {charterVehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </form>
                </Form>
            </DrawerBody>
            <DrawerFooter>
                <Button type="submit" form="charter-assignment-form">Confirm Assignment</Button>
            </DrawerFooter>
        </ResponsiveDialog>
    )
}

const StatusBadge = ({ status }: { status: Status }) => {
    const variants: Record<Status, string> = {
        'On Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Boarding': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        'In Transit': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Delayed': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Completed': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Pending': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        'Quoted': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        'Closed': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        'Delivered': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Confirmed': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
     const icon: Record<Status, React.ReactNode> = {
        'On Progress': <CheckCircle2 className="h-3 w-3" />,
        'Completed': <CheckCircle2 className="h-3 w-3" />,
        'Pending': <AlertTriangle className="h-3 w-3" />,
        'Cancelled': <XCircle className="h-3 w-3" />,
        'Delayed': <AlertTriangle className="h-3 w-3 animate-pulse" />,
        'Boarding': <CheckCircle2 className="h-3 w-3" />,
        'In Transit': <Car className="h-3 w-3" />,
        'Quoted': <CheckCircle2 className="h-3 w-3" />,
        'Closed': <CheckCircle2 className="h-3 w-3" />,
        'Delivered': <CheckCircle2 className="h-3 w-3" />,
        'Confirmed': <CheckCircle2 className="h-3 w-3" />,
    };
    return (
        <Badge variant="outline" className={cn("text-xs font-medium border-0 gap-1.5", variants[status])}>
            {status}
            {icon[status]}
        </Badge>
    );
};

export const TripCard = ({ booking, drivers, vehicles, onUpdate, isSelected, onSelect }: { booking: Booking, drivers: User[], vehicles: Vehicle[], onUpdate: () => void, isSelected: boolean, onSelect: (id: string, checked: boolean) => void }) => {
    const router = useRouter();
    const { firestore } = useAuth();
    const { showPreloader } = usePreloader();
    
    const handleLinkClick = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        showPreloader();
        router.push(href);
    };
    
    const handleTripAction = async (action: 'cancel' | 'delete') => {
        const docRef = doc(firestore, 'bookings', booking.id);
        try {
            if (action === 'cancel') {
                await updateDoc(docRef, { status: 'Cancelled' });
                toast.success("Trip Cancelled");
            } else {
                await deleteDoc(docRef);
                toast.success("Trip Record Deleted");
            }
            onUpdate();
        } catch (error) {
            toast.error("Action Failed", { description: "Could not update the trip record."});
        }
    };


    const isCharter = booking.bookingType === 'charter';
    const href = isCharter ? `/admin/dashboard/charter/${booking.id}` : `/admin/dashboard/departures/edit/${booking.scheduledTripId}`;
    const Icon = isCharter ? Car : Users;
    
    const isCompletedOrCancelled = booking.status === 'Completed' || booking.status === 'Cancelled';


    return (
        <Card className={cn("transition-shadow duration-300 flex flex-col", isSelected && "ring-2 ring-primary border-primary", (isCharter && booking.status === 'Quoted') && "bg-teal-500/5")}>
            <CardHeader className="flex flex-row items-start gap-4 pb-3">
                 <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(booking.id, !!checked)} className="mt-1" />
                 <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                        <StatusBadge status={booking.status} />
                        <p className="text-sm font-semibold">{booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('en-US', {weekday: 'short', month: 'long', day: 'numeric'}) : 'N/A'}</p>
                    </div>
                     <p className="font-bold text-lg">{booking.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                       <Icon className="h-4 w-4" /> {booking.passengerName}
                    </p>
                 </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2 text-sm pt-3 border-t">
                    <div className="flex justify-between items-center">
                        <p>Driver:</p>
                        {isCharter && booking.status === 'Quoted' ? (
                            <AssignDialog 
                                booking={booking} 
                                onComplete={onUpdate} 
                                drivers={drivers} 
                                vehicles={vehicles}
                                trigger={<Button variant="outline" size="sm">Assign & Confirm</Button>}
                            />
                        ) : (
                            <span className="font-semibold">{booking.driverName || 'Unassigned'}</span>
                        )}
                    </div>
                    <p className="font-semibold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN'}).format(booking.price)}</p>
                </div>
                 <div className="flex gap-2">
                    {isCharter ? (
                         <Button className="w-full" asChild>
                            <Link href={href} onClick={(e) => handleLinkClick(e, href)}>View Details</Link>
                        </Button>
                    ) : (
                        <>
                           <Button className="w-full" asChild variant="outline">
                                <Link href={`/admin/dashboard/departures/edit/${booking.scheduledTripId}`} onClick={(e) => handleLinkClick(e, `/admin/dashboard/departures/edit/${booking.scheduledTripId}`)}>Manage Departure</Link>
                           </Button>
                           <ManifestDialog 
                                departureId={booking.scheduledTripId!}
                                trigger={<Button className="w-full">View Manifest</Button>}
                            />
                        </>
                    )}
                   
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon"><MoreHorizontal /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                             <DropdownMenuItem asChild>
                                <Link href={href} onClick={(e) => handleLinkClick(e, href)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit / View
                                </Link>
                            </DropdownMenuItem>
                             {!isCompletedOrCancelled ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive focus:text-destructive">
                                            <XCircle className="mr-2 h-4 w-4"/> Cancel Trip
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This action will cancel the trip for the user. It cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleTripAction('cancel')}>Yes, Cancel Trip</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                             ) : (
                                <AlertDialog>
                                     <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4"/> Delete Record
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                         <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete this booking record. This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleTripAction('delete')}>Yes, Delete Permanently</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                             )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
};

export default function TripManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState<DateRange | undefined>({ from: subDays(new Date(), 20), to: addDays(new Date(), 20)});
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
    const { firebaseUser, firestore } = useAuth();
    const [idToken, setIdToken] = useState<string | undefined>();
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    useEffect(() => {
        firebaseUser?.getIdToken().then(setIdToken);
    }, [firebaseUser]);

    const { data, isLoading: loading, error, mutate } = useSWR(
        idToken ? ['/api/admin/users', idToken] : null, // Re-use the users endpoint to get all necessary data
        ([url, token]) => fetcher(url, token),
        { revalidateOnFocus: false }
    );
    
    // Note: The API endpoint needs to be updated to return all data, or use multiple SWR hooks.
    // For now, let's assume `data` contains bookings, users, and vehicles.
    const bookings: Booking[] = data?.bookings || [];
    const users: User[] = data || []; // Assuming the endpoint returns users directly now.
    const vehicles: Vehicle[] = data?.vehicles || [];

    if (error) {
        throw error;
    }

    const filteredBookings = useMemo(() => {
        if (!bookings) return [];
        let filtered = [...bookings];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.status.toLowerCase() === statusFilter);
        }

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(booking =>
                booking.passengerName.toLowerCase().includes(lowercasedFilter) ||
                booking.id.toLowerCase().includes(lowercasedFilter) ||
                (booking.driverName && booking.driverName.toLowerCase().includes(lowercasedFilter)) ||
                (booking.pickupAddress && booking.pickupAddress.toLowerCase().includes(lowercasedFilter)) ||
                (booking.destinationAddress && booking.destinationAddress.toLowerCase().includes(lowercasedFilter))
            );
        }

        if (date?.from) {
            const fromDate = new Date(date.from.setHours(0,0,0,0));
            filtered = filtered.filter(booking => {
                if (!booking.travelDate) return false;
                const travelDate = new Date(booking.travelDate);
                return travelDate >= fromDate;
            });
        }
        if (date?.to) {
            const toDate = new Date(date.to.setHours(23,59,59,999));
             filtered = filtered.filter(booking => {
                if (!booking.travelDate) return false;
                const travelDate = new Date(booking.travelDate);
                return travelDate <= toDate;
            });
        }
        
        return filtered;
    }, [searchTerm, statusFilter, bookings, date]);
    
     const paginatedBookings = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredBookings, currentPage]);
    
    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

    const handleSelectBooking = (id: string, checked: boolean) => {
        setSelectedBookings(prev => 
            checked ? [...prev, id] : prev.filter(bId => bId !== id)
        );
    };
    
    const handleSelectAll = (checked: boolean) => {
        if(checked) {
            setSelectedBookings(filteredBookings.map(b => b.id));
        } else {
            setSelectedBookings([]);
        }
    };
    
     const handleBatchAction = async (action: 'cancel' | 'delete') => {
        const batch = writeBatch(firestore);
        selectedBookings.forEach(id => {
            const docRef = doc(firestore, 'bookings', id);
            if (action === 'cancel') {
                batch.update(docRef, { status: 'Cancelled' });
            } else if (action === 'delete') {
                batch.delete(docRef);
            }
        });

        try {
            await batch.commit();
            toast.success("Batch Action Successful", {
                description: `${selectedBookings.length} trip(s) have been ${action === 'cancel' ? 'cancelled' : 'deleted'}.`,
            });
            setSelectedBookings([]);
            mutate(); // Re-fetch data
        } catch (err) {
            toast.error("Batch Action Failed", { description: "Could not complete the batch operation."});
        }
    };

    const renderGrid = (data: Booking[]) => (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
                 Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={`skeleton-card-${i}`} className="h-72 w-full" />
                ))
            ) : data.length > 0 ? (
                data.map((booking) => <TripCard key={booking.id} booking={booking} drivers={users} vehicles={vehicles} onUpdate={mutate} isSelected={selectedBookings.includes(booking.id)} onSelect={handleSelectBooking} />)
            ) : (
                 <div className="col-span-full text-center text-muted-foreground py-16">
                    <p className="text-lg">No records found for the current filters.</p>
                </div>
            )}
        </div>
    );
    
    const passengerBookings = paginatedBookings.filter(b => b.bookingType === 'seat_booking');
    const charterBookings = paginatedBookings.filter(b => b.bookingType === 'charter');

    return (
        <div className="flex flex-col h-full">
            <SubHeader title="Trip Management"><AdminHelp page="trips" /></SubHeader>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24">
                <Card>
                    <CardHeader>
                        <CardTitle>All Records</CardTitle>
                        <CardDescription>Search, filter, and manage all passenger trips and charters.</CardDescription>
                         <div className="pt-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    type="text"
                                    placeholder="Search by passenger, ID, driver, etc..." 
                                    className="pl-10 h-12"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DatePickerWithRange date={date} onDateChange={setDate} />
                                <Select onValueChange={setStatusFilter} defaultValue="all">
                                    <SelectTrigger className="h-12"><SelectValue placeholder="Filter by status"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="quoted">Quoted</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="boarding">Boarding</SelectItem>
                                        <SelectItem value="in transit">In Transit</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="select-all" 
                                    checked={selectedBookings.length > 0 && selectedBookings.length === filteredBookings.length}
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                />
                                <label htmlFor="select-all" className="text-sm font-medium leading-none">Select all ({filteredBookings.length})</label>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Tabs defaultValue="all" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-muted p-1 h-12 rounded-lg">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="bookings">Passenger</TabsTrigger>
                                <TabsTrigger value="charters">Charters</TabsTrigger>
                            </TabsList>
                            <TabsContent value="all" className="mt-6">
                                {renderGrid(paginatedBookings)}
                            </TabsContent>
                            <TabsContent value="bookings" className="mt-6">
                                {renderGrid(passengerBookings)}
                            </TabsContent>
                             <TabsContent value="charters" className="mt-6">
                                {renderGrid(charterBookings)}
                            </TabsContent>
                         </Tabs>
                    </CardContent>
                    {totalPages > 1 && (
                        <CardFooter className="justify-center">
                            <div className="flex items-center justify-center space-x-4 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
             {selectedBookings.length > 0 && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50">
                     <Card className="bg-card/90 backdrop-blur-sm shadow-2xl border-primary/50">
                        <CardContent className="p-3 flex justify-between items-center">
                            <p className="font-semibold text-sm">{selectedBookings.length} selected</p>
                             <div className="flex gap-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm"><XCircle className="mr-2 h-4 w-4"/> Cancel</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will cancel {selectedBookings.length} trip(s). This action marks them as cancelled but does not delete them.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleBatchAction('cancel')}>Yes, Cancel Trips</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button variant="destructive" size="sm" className="bg-red-800 hover:bg-red-900"><Trash2 className="mr-2 h-4 w-4"/> Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Danger: Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete {selectedBookings.length} record(s). This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleBatchAction('delete')} className="bg-red-700 hover:bg-red-800">Yes, Delete Permanently</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

    