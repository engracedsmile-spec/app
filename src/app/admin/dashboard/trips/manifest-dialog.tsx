
"use client"

import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { useAuth } from "@/firebase";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerHeader, DrawerTitle, DrawerBody } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePreloader } from "@/context/preloader-context";
import { useRouter } from "next/navigation";
import type { Booking, ScheduledTrip } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export const ManifestDialog = ({ departureId, trigger }: { departureId: string, trigger: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [passengers, setPassengers] = useState<Booking[]>([]);
    const [departure, setDeparture] = useState<ScheduledTrip | null>(null);
    const [loading, setLoading] = useState(false);
    const { firestore } = useAuth();
    const router = useRouter();
    const { showPreloader } = usePreloader();

    useEffect(() => {
        if (!open || !departureId || !firestore) return;

        setLoading(true);
        const departureRef = doc(firestore, "scheduledTrips", departureId);
        const unsubDeparture = onSnapshot(departureRef, (snap) => {
            if (snap.exists()) setDeparture({ id: snap.id, ...snap.data() } as ScheduledTrip);
        });

        const passengersQuery = query(collection(firestore, "bookings"), where("scheduledTripId", "==", departureId));
        const unsubPassengers = onSnapshot(passengersQuery, (snap) => {
            setPassengers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
            setLoading(false);
        });

        return () => {
            unsubDeparture();
            unsubPassengers();
        };

    }, [open, departureId, firestore]);
    
    const handleLinkClick = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        setOpen(false);
        showPreloader();
        router.push(href);
    };

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={trigger}>
            <DrawerHeader>
                <DrawerTitle>Passenger Manifest</DrawerTitle>
                <CardDescription>{departure?.routeName}</CardDescription>
            </DrawerHeader>
            <DrawerBody>
                {loading ? <Skeleton className="h-48 w-full" /> : (
                    <div className="space-y-3">
                         {passengers.length > 0 ? passengers.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                                <div>
                                    <p className="font-semibold">{p.passengerName}</p>
                                    <p className="text-xs text-muted-foreground">{p.itemDescription}</p>
                                </div>
                                <Badge variant="outline">{p.status}</Badge>
                            </div>
                        )) : <p className="text-center text-muted-foreground py-8">No passengers for this trip yet.</p>}
                    </div>
                )}
                 <Button asChild className="w-full mt-6">
                    <Link href={`/admin/dashboard/departures/${departureId}`} onClick={(e) => handleLinkClick(e, `/admin/dashboard/departures/${departureId}`)}>
                        Go to Full Manifest
                    </Link>
                </Button>
            </DrawerBody>
        </ResponsiveDialog>
    );
};
