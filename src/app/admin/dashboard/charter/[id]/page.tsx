"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, User, Car, Calendar, DollarSign, Edit, CheckCircle2, CreditCard, Milestone } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from "@/firebase";
import { Booking, Vehicle } from "@/lib/data";
import { Preloader } from "@/components/preloader";
import { SubHeader } from "@/components/sub-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription as AlertDialogDescriptionComponent, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useDoc } from "@/firebase/firestore/use-collection";


const DetailRow = ({ label, value, icon: Icon }: { label: string, value: string, icon: React.ElementType }) => (
    <div className="flex items-start gap-4">
        <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
)

export default function AdminCharterDetailPage() {
    const params = useParams();
    const bookingId = params.id as string;
    const { firestore } = useAuth();
    
    const { data: booking, loading } = useDoc<Booking>(firestore ? `bookings/${bookingId}` : null);
    const { data: vehicle } = useDoc<Vehicle>(booking?.vehicleId ? `vehicles/${booking.vehicleId}` : null);
    
    const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);

    const handleCollectPayment = async () => {
        if (!booking || !vehicle) {
            toast.error("Missing Information", { description: "Cannot collect payment without an assigned vehicle."});
            return;
        }

        const bookingRef = doc(firestore, 'bookings', booking.id);
        
        try {
             await updateDoc(bookingRef, {
                status: 'Confirmed',
                wifiPassword: vehicle.wifiPassword || null,
                wifiSSID: vehicle.wifiId || null
            });
             if (booking.userId) {
                await fetch('/api/notifications/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: booking.userId,
                        payload: {
                            title: "Charter Booking Confirmed!",
                            description: `Your booking for ${booking.title} is confirmed. View details for your assigned driver and vehicle.`,
                            type: "booking",
                            href: `/dashboard/trip/${booking.id}`
                        }
                    })
                });
             }
            toast.success("Payment Collected!", { description: "The booking is now confirmed and the user has been notified." });
            setIsPaymentConfirmOpen(false);
        } catch(e) {
            console.error("Error confirming payment:", e);
            toast.error("Update Failed", { description: "Could not confirm the payment." });
        }
    }


    if (loading) return <Preloader />;

    if (!booking) {
        return (
            <div className="flex flex-col h-full">
                <SubHeader title="Charter Not Found" />
                <main className="flex-1 flex items-center justify-center p-4">
                    <p className="text-muted-foreground">The requested booking could not be found.</p>
                </main>
            </div>
        )
    }

    const travelDate = booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    }) : 'Not Set';
    
    const isAssigned = booking.driverId && booking.vehicleId;

    return (
        <div className="flex flex-col h-full">
            <SubHeader title={`Charter: ${booking.title}`}>
                <div className="flex items-center gap-2">
                    {booking.status === "Quoted" && (
                        <AlertDialog open={isPaymentConfirmOpen} onOpenChange={setIsPaymentConfirmOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="default"><CreditCard className="mr-2 h-4 w-4"/> Collect Payment</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Payment Collection</AlertDialogTitle>
                                    <AlertDialogDescriptionComponent>
                                        This will mark the booking as confirmed, finalize the invoice, and notify the user. This action cannot be undone.
                                    </AlertDialogDescriptionComponent>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCollectPayment}>Yes, Confirm Payment</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {booking.status === "Confirmed" && (
                         <Button onClick={() => updateDoc(doc(firestore, 'bookings', booking.id), { status: 'On Progress' })}>
                            <Milestone className="mr-2 h-4 w-4" />
                            Start Charter
                        </Button>
                    )}
                </div>
            </SubHeader>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                 <Card>
                    <CardHeader>
                        <CardTitle>Booking Summary</CardTitle>
                        <CardDescription>
                            Status: <span className="font-semibold text-primary">{booking.status}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DetailRow label="Customer" value={booking.passengerName} icon={User} />
                        <DetailRow label="Start Date" value={travelDate} icon={Calendar} />
                        <DetailRow label="Total Fare" value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN'}).format(booking.price)} icon={DollarSign} />
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Assignment Details</CardTitle>
                         <CardDescription>A vehicle must be assigned before payment can be collected.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        {isAssigned ? (
                           <>
                             <DetailRow label="Assigned Driver" value={booking.driverName || 'N/A'} icon={User} />
                             <DetailRow label="Assigned Vehicle" value={`${vehicle?.make || ''} ${vehicle?.model || ''} (${vehicle?.licensePlate || ''})`} icon={Car} />
                           </>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                <p>No driver or vehicle has been assigned to this charter yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
