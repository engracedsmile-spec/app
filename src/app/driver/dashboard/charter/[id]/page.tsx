
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, User, CheckCircle2, Phone, Car, Calendar, Hash, Milestone } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth, useDoc } from "@/firebase";
import { Booking } from "@/lib/data";
import { Preloader } from "@/components/preloader";
import { SubHeader } from "@/components/sub-header";
import { Badge } from "@/components/ui/badge";

const DetailRow = ({ label, value, icon: Icon, action }: { label: string; value: string | React.ReactNode; icon: React.ElementType, action?: React.ReactNode }) => (
    <div className="flex items-center gap-4">
        <Icon className="h-5 w-5 text-primary flex-shrink-0"/>
        <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="font-semibold">{value}</div>
        </div>
        {action}
    </div>
)


export default function DriverCharterDetailPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.id as string;
    
    const { firestore } = useAuth();
    const { data: booking, loading } = useDoc<Booking>(`bookings/${bookingId}`);

    const handleUpdateStatus = async (newStatus: "On Progress" | "Completed") => {
        if (!booking) return;
        
        const bookingRef = doc(firestore, 'bookings', booking.id);
        
        try {
            await updateDoc(bookingRef, { status: newStatus });
            toast.success("Charter Status Updated!", {
                description: `This charter is now marked as ${newStatus}.`,
            });
        } catch (error) {
            toast.error("Update Failed", { description: "Could not update the charter status." });
        }
    }
    
    if (loading) return <Preloader />;

    if (!booking) {
        return (
            <div className="flex flex-col h-full">
                <SubHeader title="Charter Not Found" />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <p>The charter booking with ID "{bookingId}" could not be found.</p>
                </main>
            </div>
        )
    }

    const travelDate = booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    }) : 'N/A';
    
    const renderFooterActions = () => {
        switch (booking.status) {
            case "Confirmed":
                 return (
                    <div className="p-4 border-t">
                        <Button size="lg" className="h-14 w-full text-lg" onClick={() => handleUpdateStatus("On Progress")}>
                           <Milestone className="mr-2 h-5 w-5"/> Start Charter
                        </Button>
                    </div>
                );
            case "On Progress":
                 return (
                    <div className="p-4 border-t">
                        <Button size="lg" className="h-14 w-full text-lg" onClick={() => handleUpdateStatus("Completed")}>
                           <CheckCircle2 className="mr-2 h-5 w-5"/> Complete Charter
                        </Button>
                    </div>
                );
            case "Completed":
            case "Cancelled":
                 return (
                    <div className="p-4 border-t text-center">
                        <div className="flex items-center justify-center gap-2 text-green-500">
                           <CheckCircle2 className="h-6 w-6"/>
                           <p className="font-semibold text-lg">Charter {booking.status}</p>
                        </div>
                    </div>
                );
            default:
                return (
                     <div className="p-4 border-t text-center">
                        <Badge variant="secondary" className="text-base p-3">{booking.status}</Badge>
                    </div>
                );
        }
    }

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <SubHeader title={`Charter: ${booking.title}`} />
            
            <main className="flex-1 space-y-4 p-4 md:p-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DetailRow label="Name" value={booking.passengerName} icon={User} />
                        <DetailRow 
                            label="Phone Number" 
                            value={booking.passengerPhone} 
                            icon={Phone} 
                            action={
                                <a href={`tel:${booking.passengerPhone}`}>
                                    <Button variant="outline" size="sm">Call</Button>
                                </a>
                            }
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Trip Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DetailRow label="Package" value={booking.charterPackageName || 'N/A'} icon={Car} />
                        <DetailRow label="Start Date" value={travelDate} icon={Calendar} />
                        <DetailRow label="Duration" value={`${booking.charterDays} day(s)`} icon={Hash} />
                    </CardContent>
                </Card>
            </main>
            
            <footer>
                {renderFooterActions()}
            </footer>
        </div>
    );
}
