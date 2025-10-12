
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScheduledTrip } from "@/lib/data";
import { ArrowRight, Route, DollarSign, Car, Fuel, User, Loader2, Power, PowerOff, Clock, Wallet, Headset } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { getFirestore, doc, updateDoc, onSnapshot, query, collection, where } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import firebaseApp from '@/firebase/config';
import { useCountdown } from "@/hooks/use-countdown";

const RiderHeader = () => {
    const { user, setUser, firestore } = useAuth();
    const [isOnline, setIsOnline] = useState(user?.status === 'Online');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setIsOnline(user?.status === 'Online');
    }, [user?.status]);

    const handleStatusToggle = async (online: boolean) => {
        if (!user || !firestore) return;
        setIsUpdating(true);
        setIsOnline(online); // Optimistic UI update
        const newStatus = online ? 'Online' : 'Offline';
        const userRef = doc(firestore, 'users', user.id);
        try {
            await updateDoc(userRef, { status: newStatus });
            setUser({ ...user, status: newStatus }); 
            toast.success(`You are now ${newStatus}`);
        } catch (error) {
            toast.error("Error", { description: "Could not update your status."});
            // Revert UI state on failure
            setIsOnline(!online);
        } finally {
            setIsUpdating(false);
        }
    }


    return (
        <header className="flex items-center gap-4 p-4 sticky top-0 bg-background z-10 border-b">
            <Link href="/driver/dashboard/account">
                <Avatar className="h-12 w-12 border-2 border-primary/50">
                    <AvatarImage src={user?.profilePictureUrl || `https://i.pravatar.cc/150?u=${user?.email}`} alt={user?.name} />
                    <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
            </Link>
            <div>
                <p className="text-sm font-medium">{user?.name}</p>
                 <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-muted-foreground'}`}></div>
                    <p className="text-sm text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</p>
                 </div>
            </div>
            <div className="flex-1 flex justify-end items-center gap-2">
                <Switch checked={isOnline} onCheckedChange={handleStatusToggle} disabled={isUpdating} />
            </div>
        </header>
    );
}

const CountdownDisplay = ({ time, label }: { time: number, label: string }) => (
    <div className="flex flex-col items-center">
        <span className="text-2xl font-bold tracking-tight">{String(time).padStart(2, '0')}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
    </div>
);

const TripCountdown = ({ departureDate, departurePeriod }: { departureDate: string | Date, departurePeriod: 'Morning' | 'Evening' }) => {
    const targetDate = new Date(departureDate);
    if(departurePeriod === 'Morning') {
        targetDate.setHours(6, 0, 0, 0); // Assuming morning is 6 AM
    } else {
        targetDate.setHours(18, 0, 0, 0); // Assuming evening is 6 PM
    }

    const countdown = useCountdown(targetDate);
    return (
        <div className="grid grid-cols-4 gap-4 text-center">
            <CountdownDisplay time={countdown.days} label="Days" />
            <CountdownDisplay time={countdown.hours} label="Hours" />
            <CountdownDisplay time={countdown.minutes} label="Mins" />
            <CountdownDisplay time={countdown.seconds} label="Secs" />
        </div>
    );
};

const NextDepartureCard = () => {
    const { user, firestore } = useAuth();
    const [nextTrip, setNextTrip] = useState<ScheduledTrip | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const tripsRef = collection(firestore, 'scheduledTrips');
        const q = query(
            tripsRef, 
            where("driverId", "==", user.id),
            where("status", "in", ["Scheduled", "Boarding"])
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const trips: ScheduledTrip[] = [];
            snapshot.forEach(doc => {
                trips.push({ id: doc.id, ...doc.data() } as ScheduledTrip);
            });
            const sortedTrips = trips.sort((a,b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
            setNextTrip(sortedTrips[0] || null);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching next departure:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, firestore]);


    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Searching for Next Trip...</CardTitle>
                    <CardDescription>Checking for your next assigned departure.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8">
                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                </CardContent>
            </Card>
        )
    }

    if (!nextTrip) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Upcoming Departures</CardTitle>
                    <CardDescription>You have no scheduled trips at the moment. You'll be notified when a new trip is assigned.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/driver/dashboard/deliveries">View Job History</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card className="overflow-hidden bg-primary/5 border-primary/20">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 text-primary"/>
                    Your Next Departure
                </CardTitle>
                <CardDescription>
                    {nextTrip.routeName}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-6">
                {nextTrip.departureDate && <TripCountdown departureDate={nextTrip.departureDate} departurePeriod={nextTrip.departurePeriod} />}
                <Button asChild className="w-full h-12 text-base">
                    <Link href={`/driver/dashboard/deliveries/${nextTrip.id}`}>
                        View Manifest & Start Trip <ArrowRight className="ml-2 h-5 w-5"/>
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};

export default function DriverDashboardPage() {
    
    return (
        <>
            <RiderHeader />
            <div className="space-y-6 p-4 md:p-6">
                <NextDepartureCard />
            </div>
        </>
    );
}
