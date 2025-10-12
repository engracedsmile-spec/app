
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduledTrip } from "@/lib/data";
import { ArrowLeft, Car } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { SubHeader } from "@/components/sub-header";

const DepartureCard = ({ trip }: { trip: ScheduledTrip }) => {
    return (
        <Link href={`/driver/dashboard/deliveries/${trip.id}`} className="block">
            <Card className="bg-card hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <Car className="h-5 w-5 text-primary" />
                        <span>{trip.routeName}</span>
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground">Departure</p>
                            <p className="font-semibold">{new Date(trip.departureDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})} - {trip.departurePeriod}</p>
                        </div>
                        <div>
                             <p className="text-sm text-muted-foreground text-right">Status</p>
                            <p className="font-semibold text-right">{trip.status}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
};

const DepartureList = ({ trips, type, loading }: { trips: ScheduledTrip[], type: string, loading: boolean }) => {
    const router = useRouter();

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                ))}
            </div>
        )
    }
    if (trips.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                 <Car className="h-16 w-16 mx-auto text-primary/20"/>
                 <p className="text-lg font-semibold mt-4">No {type} trips</p>
                <p className="mt-1">Your assigned trips will appear here.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {trips.map((trip) => (
                <DepartureCard key={trip.id} trip={trip} />
            ))}
        </div>
    );
};


export default function DriverDeliveriesPage() {
    const router = useRouter();
    const { user, firestore } = useAuth();
    const [allTrips, setAllTrips] = useState<ScheduledTrip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const tripsRef = collection(firestore, 'scheduledTrips');
        const q = query(tripsRef, where("driverId", "==", user.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as ScheduledTrip));
            setAllTrips(fetchedTrips);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching driver trips:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, firestore]);
    
    const activeTrips = useMemo(() => allTrips?.filter(t => t.status === "Scheduled" || t.status === "Boarding" || t.status === "In Transit") || [], [allTrips]);
    const completedTrips = useMemo(() => allTrips?.filter(t => t.status === "Completed" || t.status === "Cancelled") || [], [allTrips]);


    return (
        <>
            <SubHeader title="My Departures" />
            <div className="p-4 md:p-6">
                 <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="active">Upcoming & Active</TabsTrigger>
                        <TabsTrigger value="completed">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="mt-6">
                        <DepartureList trips={activeTrips} type="active" loading={loading} />
                    </TabsContent>
                    <TabsContent value="completed" className="mt-6">
                        <DepartureList trips={completedTrips} type="completed" loading={loading} />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

    