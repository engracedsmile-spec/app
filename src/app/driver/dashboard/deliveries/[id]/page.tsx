
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, User, CheckCircle2, Phone, Car, Armchair } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch, onSnapshot } from 'firebase/firestore';
import { useAuth } from "@/firebase";
import { ScheduledTrip, Booking, ScheduledTripPassenger } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Preloader } from "@/components/preloader";

const PassengerRow = ({ passenger, onToggleBoarded, isTripCompleted }: { passenger: ScheduledTripPassenger, onToggleBoarded: (passengerName: string, seat: number, boarded: boolean) => void, isTripCompleted: boolean }) => {
    // This component might need to be stateful if you want to reflect boarding status
    // For now, let's assume it gets boarding status from parent.
    // A better approach would be to manage boarding status inside the ScheduledTrip document itself.
    const [isChecked, setIsChecked] = useState(false);

    const handleToggle = (checked: boolean) => {
        if (isTripCompleted) return;
        setIsChecked(checked);
        onToggleBoarded(passenger.name, passenger.seat, checked);
    }
    
    return (
        <div className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg">
            <Checkbox id={`passenger-${passenger.name}-${passenger.seat}`} checked={isChecked} onCheckedChange={(checked) => handleToggle(checked as boolean)} disabled={isTripCompleted} />
            <div className="flex-1 flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground"/>
                <p className="font-semibold">{passenger.name}</p>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <Armchair className="h-4 w-4"/>
                <p className="font-semibold">{passenger.seat}</p>
            </div>
        </div>
    )
}

export default function DriverDepartureDetailPage() {
    const router = useRouter();
    const params = useParams();
    const departureId = params.id as string;
    
    const [departure, setDeparture] = useState<ScheduledTrip | null>(null);
    const [loading, setLoading] = useState(true);
    const { firestore } = useAuth();

    useEffect(() => {
        if (!departureId || !firestore) return;

        setLoading(true);
        const departureRef = doc(firestore, "scheduledTrips", departureId);
        
        const unsubscribe = onSnapshot(departureRef, (docSnap) => {
            if (docSnap.exists()) {
                const departureData = { id: docSnap.id, ...docSnap.data() } as ScheduledTrip;
                setDeparture(departureData);
            } else {
                toast.error("Error", { description: "Departure not found." });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching departure data:", error);
            toast.error("Error", { description: "Could not load trip details." });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [departureId, firestore]);


    const handleToggleBoarded = (passengerName: string, seat: number, boarded: boolean) => {
        // This is a UI-only operation for now. For a real app, you would
        // update a 'boarded' field in your database.
        toast.info(`${passengerName} in seat ${seat} marked as ${boarded ? 'boarded' : 'not boarded'}.`);
    }

    const handleUpdateDepartureStatus = async (newStatus: "In Transit" | "Completed") => {
        if (!departure) return;
        
        const departureRef = doc(firestore, 'scheduledTrips', departure.id);
        const batch = writeBatch(firestore);

        batch.update(departureRef, { status: newStatus });
        
        // Find all passenger bookings for this trip to update their status
        const bookingsQuery = query(collection(firestore, 'bookings'), where('scheduledTripId', '==', departure.id));
        const bookingsSnap = await getDocs(bookingsQuery);
        
        bookingsSnap.forEach(doc => {
             if (doc.data().status !== 'Cancelled') {
                const newBookingStatus = newStatus === 'In Transit' ? 'In Transit' : 'Completed';
                batch.update(doc.ref, { status: newBookingStatus });
            }
        });

        try {
            await batch.commit();
            // The onSnapshot listener will update the local state automatically.
            toast.success("Trip Status Updated!", {
                description: `The trip is now ${newStatus}.`,
            });
        } catch (error) {
            console.error("Failed to update trip status:", error);
            toast.error("Update Failed", { description: "Could not update trip status."});
        }
    }
    
    if (loading) {
        return <Preloader />;
    }

    if (!departure) {
        return (
            <div className="flex flex-col h-full bg-background text-foreground">
                 <header className="flex items-center p-4 sticky top-0 bg-background z-10 border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Departure Not Found</h1>
                </header>
                <main className="flex-1 p-6 flex items-center justify-center">
                    <p>The departure with ID "{departureId}" could not be found.</p>
                </main>
            </div>
        )
    }

    const boardedCount = 0; // This would need to be calculated from state if you manage it
    const totalPassengers = departure.passengers?.length || 0;
    const isTripCompleted = departure.status === 'Completed' || departure.status === 'Cancelled';
    
    const renderFooterActions = () => {
        switch (departure.status) {
            case "Provisional":
            case "Scheduled":
            case "Boarding":
                 return (
                    <div className="p-4 border-t border-border/50">
                        <Button size="lg" className="h-14 w-full text-lg" onClick={() => handleUpdateDepartureStatus("In Transit")}>
                            Start Trip
                        </Button>
                    </div>
                );
            case "In Transit":
                 return (
                    <div className="p-4 border-t border-border/50">
                        <Button size="lg" className="h-14 w-full text-lg" onClick={() => handleUpdateDepartureStatus("Completed")}>
                            Complete Trip
                        </Button>
                    </div>
                );
            case "Completed":
            case "Cancelled":
                 return (
                    <div className="p-4 border-t border-border/50 text-center">
                        <div className="flex items-center justify-center gap-2 text-green-500">
                           <CheckCircle2 className="h-6 w-6"/>
                           <p className="font-semibold text-lg">Trip {departure.status}</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <header className="flex items-center justify-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 absolute left-4">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Departure Manifest</h1>
            </header>

            <main className="flex-1 space-y-4 p-4 md:p-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-primary"/>
                            {departure.routeName}
                        </CardTitle>
                        <CardDescription>
                             {new Date(departure.departureDate).toLocaleDateString('en-US', { dateStyle: 'full' })} - {departure.departurePeriod}
                        </CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span>Status: <span className="text-primary">{departure.status}</span></span>
                            <span>Passengers: {totalPassengers}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Passenger Manifest</CardTitle>
                        <CardDescription>Check passengers in as they board the vehicle.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-border/50">
                             {(departure.passengers || []).length > 0 ? (
                                departure.passengers.map((p, index) => (
                                    <PassengerRow key={index} passenger={p} onToggleBoarded={handleToggleBoarded} isTripCompleted={isTripCompleted} />
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No passengers have boarded this trip yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>

            <footer>
                {renderFooterActions()}
            </footer>
        </div>
    );
}
