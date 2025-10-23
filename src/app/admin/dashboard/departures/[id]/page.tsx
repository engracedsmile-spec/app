
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, User, CheckCircle2, Phone, Car } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { useAuth } from "@/firebase";
import { ScheduledTrip, Booking } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Preloader } from "@/components/preloader";

const PassengerRow = ({ passenger, onToggleBoarded, isTripCompleted }: { passenger: Booking, onToggleBoarded: (passengerId: string, boarded: boolean) => void, isTripCompleted: boolean }) => {
    const isChecked = ['Boarding', 'In Transit', 'Completed'].includes(passenger.status);

    const handleToggle = (checked: boolean) => {
        if (isTripCompleted) return; // Don't allow changes if trip is done
        onToggleBoarded(passenger.id, checked);
    }
    
    const seatCount = passenger.seats?.length || 0;
    
    return (
        <div className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg">
            <Checkbox id={`passenger-${passenger.id}`} checked={isChecked} onCheckedChange={(checked) => handleToggle(checked as boolean)} disabled={isTripCompleted} />
            <div className="flex-1">
                <p className="font-semibold">{passenger.passengerName}</p>
                <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">{seatCount} Seat{seatCount > 1 ? 's' : ''}</span>
                    {passenger.itemDescription && ` (${passenger.itemDescription})`}
                </p>
            </div>
            <a href={`tel:${passenger.passengerPhone}`}>
                <Button variant="ghost" size="icon" disabled={isTripCompleted}>
                    <Phone className="h-5 w-5 text-primary" />
                </Button>
            </a>
        </div>
    )
}

export default function DepartureManifestPage() {
    const router = useRouter();
    const params = useParams();
    const departureId = params.id as string;
    
    const [departure, setDeparture] = useState<ScheduledTrip | null>(null);
    const [passengers, setPassengers] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { firestore } = useAuth();

    useEffect(() => {
        if (!departureId) return;

        const fetchDepartureData = async () => {
            setLoading(true);
            try {
                const departureRef = doc(firestore, "scheduledTrips", departureId);
                const departureSnap = await getDoc(departureRef);

                if (departureSnap.exists()) {
                    const departureData = { id: departureSnap.id, ...departureSnap.data() } as ScheduledTrip;
                    setDeparture(departureData);

                    const passengersRef = collection(firestore, "bookings");
                    const q = query(passengersRef, where("scheduledTripId", "==", departureId));
                    const passengersSnap = await getDocs(q);
                    const passengerList = passengersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
                    setPassengers(passengerList);

                } else {
                    toast.error("Error", { description: "Departure not found." });
                }
            } catch (error) {
                console.error("Error fetching departure data:", error);
                toast.error("Error", { description: "Could not load trip details." });
            } finally {
                setLoading(false);
            }
        }
        
        fetchDepartureData();

    }, [departureId, firestore]);


    const handleToggleBoarded = (passengerId: string, boarded: boolean) => {
        const passengerRef = doc(firestore, "bookings", passengerId);
        const newStatus = boarded ? "Boarding" : "Pending";
        updateDoc(passengerRef, { status: newStatus });
        setPassengers(prev => prev.map(p => p.id === passengerId ? { ...p, status: newStatus } : p));
    }

    const handleUpdateDepartureStatus = async (newStatus: "In Transit" | "Completed") => {
        if (!departure) return;
        
        const departureRef = doc(firestore, 'scheduledTrips', departure.id);
        const batch = writeBatch(firestore);

        // Update departure status
        batch.update(departureRef, { status: newStatus });
        
        // Update status for all associated passenger bookings
        passengers.forEach(p => {
            if (p.status !== 'Cancelled') { // Don't update cancelled bookings
                const passengerRef = doc(firestore, 'bookings', p.id);
                const newBookingStatus = newStatus === 'In Transit' ? 'In Transit' : 'Completed';
                batch.update(passengerRef, { status: newBookingStatus });
            }
        });

        await batch.commit();

        setDeparture(prev => prev ? { ...prev, status: newStatus } : null);
        setPassengers(prev => prev.map(p => {
            if (p.status !== 'Cancelled') {
                 const newBookingStatus = newStatus === 'In Transit' ? 'In Transit' : 'Completed';
                return { ...p, status: newBookingStatus };
            }
            return p;
        }));
        
        toast.success("Trip Status Updated!", {
            description: `The trip is now ${newStatus}.`,
        });
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

    const boardedCount = passengers.filter(p => p.status === 'Boarding' || p.status === 'In Transit' || p.status === 'Completed').length;
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
                            <span>Boarded: {boardedCount}/{passengers.length}</span>
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
                             {passengers.length > 0 ? (
                                passengers.map(p => (
                                    <PassengerRow key={p.id} passenger={p} onToggleBoarded={handleToggleBoarded} isTripCompleted={isTripCompleted} />
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No passengers have booked this trip yet.</p>
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
