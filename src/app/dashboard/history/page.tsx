"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CheckCircle2, Copy, RefreshCw, Car, FileText, Users, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import { Booking, Status } from "@/lib/data";
import { toast } from "sonner";
import { useAuth, useCollection } from "@/firebase";
import { Timestamp, updateDoc, doc, where, orderBy } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubHeader } from "@/components/sub-header";
import { usePreloader } from "@/context/preloader-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle as AlertDialogTitleComponent,
    AlertDialogDescription,
    AlertDialogFooter
} from "@/components/ui/alert-dialog";


// --- BOOKING TYPE DIALOG ---
const BookingTypeDialogContent = ({ closeDialog }: { closeDialog: () => void }) => {
    const router = useRouter();
    const { showPreloader } = usePreloader();

    const handleSelect = (type: 'seat_booking' | 'charter') => {
        closeDialog();
        showPreloader();
        router.push(`/book-trip?bookingType=${type}`);
    }

    return (
        <>
            <DrawerHeader className="text-left sm:text-center">
                <DrawerTitle>New Booking</DrawerTitle>
                <DrawerDescription>
                    How would you like to travel? Book a single seat or charter the entire vehicle for a private trip.
                </DrawerDescription>
            </DrawerHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                <Card className="cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors" onClick={() => handleSelect('seat_booking')}>
                    <CardContent className="p-6 text-center flex flex-col items-center justify-center gap-2">
                        <Users className="h-8 w-8 text-primary mb-2" />
                        <p className="font-bold">Book a Seat</p>
                        <p className="text-xs text-muted-foreground">Join other passengers on a scheduled trip.</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors" onClick={() => handleSelect('charter')}>
                    <CardContent className="p-6 text-center flex flex-col items-center justify-center gap-2">
                        <Car className="h-8 w-8 text-primary mb-2" />
                        <p className="font-bold">Charter Vehicle</p>
                        <p className="text-xs text-muted-foreground">Reserve the entire vehicle for your private group.</p>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

// --- STATUS BADGE ---
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
        'Closed': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    const icon: Record<Status, React.ReactNode> = {
        'On Progress': <RefreshCw className="h-3 w-3 animate-spin" />,
        'Completed': <CheckCircle2 className="h-3 w-3" />,
        'Pending': <RefreshCw className="h-3 w-3 animate-spin" />,
        'Cancelled': <XCircle className="h-3 w-3" />,
        'Delayed': <AlertTriangle className="h-3 w-3 animate-pulse" />,
        'Boarding': <RefreshCw className="h-3 w-3 animate-spin" />,
        'In Transit': <Car className="h-3 w-3" />,
        'Quoted': <RefreshCw className="h-3 w-3 animate-spin" />,
        'Closed': <CheckCircle2 className="h-3 w-3" />,
    };
    return (
        <Badge variant="outline" className={cn("text-xs font-medium border-0 gap-1.5", variants[status])}>
            {status}
            {icon[status]}
        </Badge>
    );
};

// --- CANCEL TRIP DIALOG ---
const CancelTripDialog = ({ bookingId, onCancelSuccess, setOpen }: { bookingId: string, onCancelSuccess: () => void, setOpen: (open: boolean) => void }) => {
    const [reason, setReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const { firestore } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCancel = async () => {
        if (!reason) {
            toast.error("Please select a reason for cancellation.");
            return;
        }
        const finalReason = reason === 'Other' ? otherReason : reason;
        if (!finalReason) {
            toast.error("Please specify your reason for cancellation.");
            return;
        }

        setIsSubmitting(true);
        const tripRef = doc(firestore, "bookings", bookingId);
        try {
            await updateDoc(tripRef, {
                status: 'Cancelled',
                cancellationReason: finalReason
            });
            toast.success("Trip Cancelled", { description: "Your trip has been successfully cancelled." });
            onCancelSuccess();
            setOpen(false);
        } catch (error) {
            console.error("Error cancelling trip:", error);
            toast.error("Error", { description: "Could not cancel your trip. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    }

    const reasons = ["Change of plans", "Booked by mistake", "Found a better option", "Other"];

    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitleComponent>Are you sure you want to cancel?</AlertDialogTitleComponent>
                <AlertDialogDescription>
                    This action cannot be undone. Please note that cancelling a trip does not guarantee an automatic refund. You may need to contact support.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="p-4 space-y-4">
                <Select onValueChange={setReason} value={reason}>
                    <SelectTrigger><SelectValue placeholder="Select a reason for cancellation" /></SelectTrigger>
                    <SelectContent>
                        {reasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
                {reason === 'Other' && (
                    <Textarea placeholder="Please specify your reason..." value={otherReason} onChange={(e) => setOtherReason(e.target.value)} />
                )}
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <Button variant="destructive" onClick={handleCancel} disabled={isSubmitting}>
                    {isSubmitting ? 'Cancelling...' : 'Yes, Cancel Trip'}
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}

// --- BOOKING CARD ---
const BookingCard = ({ booking, onUpdate }: { booking: Booking, onUpdate: () => void }) => {
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const { showPreloader } = usePreloader();
    const router = useRouter();

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(booking.id);
        toast("Copied!", {
            description: `Booking ID ${booking.id.slice(0, 10)} copied to clipboard.`,
        });
    };

    const isCharter = booking.bookingType === 'charter';
    const title = booking.title || (isCharter ? `${booking.charterPackageName}` : `Trip to ${booking.destinationAddress?.split(',')[0]}`);
    const description = booking.itemDescription || (isCharter ? `${booking.charterDays} day(s) hire` : (booking.passengers || []).join(', '));
    const Icon: React.ElementType = isCharter ? Car : Users;

    const getJsDate = (timestamp: any): Date | null => {
        if (!timestamp) return null;
        if (timestamp instanceof Date) return timestamp;
        if (timestamp instanceof Timestamp) return timestamp.toDate();
        if (typeof timestamp.toDate === 'function') return timestamp.toDate();
        if (typeof timestamp === 'string' || typeof timestamp === 'number') {
            const d = new Date(timestamp);
            if (!isNaN(d.getTime())) return d;
        }
        return null;
    }

    const createdAt = getJsDate(booking.createdAt) ?? new Date();

    const canCancel = ['Pending', 'On Progress', 'Boarding', 'Quoted'].includes(booking.status);

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        showPreloader();
        router.push(href);
    };

    return (
        <Card className="bg-card hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <StatusBadge status={booking.status} />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                        {booking.id.slice(0, 10)}
                        <Copy
                            className="h-4 w-4 cursor-pointer hover:text-foreground"
                            onClick={handleCopy}
                        />
                    </div>
                </div>

                <Link href={`/dashboard/trip/${booking.id}`} onClick={(e) => handleLinkClick(e, `/dashboard/trip/${booking.id}`)} className="block space-y-2">
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="font-bold text-lg">{title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <Icon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                </Link>
                <div className="flex justify-between items-center border-t border-border/50 pt-3">
                    <p className="text-primary font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(booking.price as number)} <span className="text-xs text-muted-foreground font-normal">• {createdAt.toLocaleDateString()}</span></p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/invoice/${booking.id}`}>
                             <FileText className="mr-2 h-4 w-4" /> Invoice
                           </Link>
                        </Button>
                        {(booking.status === 'Completed') ? (
                            <Button size="sm" asChild>
                                <Link href={`/book-trip?pickup=${encodeURIComponent(booking.pickupAddress || '')}&destination=${encodeURIComponent(booking.destinationAddress || '')}&bookingType=${booking.bookingType}`}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Rebook
                                </Link>
                            </Button>
                        ) : canCancel ? (
                             <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">Cancel</Button>
                                </AlertDialogTrigger>
                                <CancelTripDialog bookingId={booking.id} onCancelSuccess={onUpdate} setOpen={setIsCancelOpen} />
                            </AlertDialog>
                        ) : null}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// --- BOOKING LIST ---
const BookingList = ({ bookings, loading, emptyMessage, emptyIcon: Icon, onUpdate, error, mutate }: { bookings: Booking[], loading: boolean, emptyMessage: string, emptyIcon: React.ElementType, onUpdate: () => void, error: Error | null, mutate: () => void }) => {
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Failed to Load Trips</AlertTitle>
                <AlertDescription className="mt-2">
                    <p className="mb-4">{error.message}</p>
                    <Button onClick={() => mutate()}>Try Again</Button>
                </AlertDescription>
            </Alert>
        );
    }

    if (bookings.length === 0) {
        return (
            <ResponsiveDialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <div className="text-center py-16 text-muted-foreground">
                    <Icon className="h-16 w-16 mx-auto text-primary/20" />
                    <p className="text-lg font-semibold mt-4">No Bookings Yet</p>
                    <p className="mt-1">{emptyMessage}</p>
                    <Button onClick={() => setIsBookingDialogOpen(true)} className="mt-4">Book Your First Trip</Button>
                </div>
                <BookingTypeDialogContent closeDialog={() => setIsBookingDialogOpen(false)} />
            </ResponsiveDialog>
        )
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onUpdate={onUpdate} />
            ))}
        </div>
    );
};

// --- TRIP HISTORY PAGE ---
export default function TripHistoryPage() {
    const { user } = useAuth();
    
    const queryConstraints = useMemo(() => user ? [
        where("userId", "==", user.id),
        orderBy('createdAt', 'desc')
    ] : [], [user]);

    const { data: allUserBookings, loading, error, mutate } = useCollection<Booking>(
        user ? 'bookings' : null,
        { queryConstraints }
    );

    const activeBookings = useMemo(() => allUserBookings?.filter(s => ['On Progress', 'Pending', 'Delayed', 'Boarding', 'In Transit', 'Quoted'].includes(s.status)) || [], [allUserBookings]);
    const completedBookings = useMemo(() => allUserBookings?.filter(s => ['Completed', 'Cancelled', 'Closed'].includes(s.status)) || [], [allUserBookings]);

    return (
        <>
            <SubHeader title="My Trips" />
            <div className="p-4 md:p-6">
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-card p-1 mb-6">
                        <TabsTrigger value="all">
                            All ({allUserBookings?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="active">
                            Active ({activeBookings.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            Completed ({completedBookings.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="overflow-y-auto">
                        <BookingList bookings={allUserBookings || []} loading={loading} emptyMessage="Your past and present bookings will appear here." emptyIcon={Car} onUpdate={mutate} error={error} mutate={mutate} />
                    </TabsContent>
                    <TabsContent value="active" className="overflow-y-auto">
                        <BookingList bookings={activeBookings} loading={loading} emptyMessage="You have no active bookings." emptyIcon={Car} onUpdate={mutate} error={error} mutate={mutate} />
                    </TabsContent>
                    <TabsContent value="completed" className="overflow-y-auto">
                        <BookingList bookings={completedBookings} loading={loading} emptyMessage="You have no completed bookings." emptyIcon={CheckCircle2} onUpdate={mutate} error={error} mutate={mutate} />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}