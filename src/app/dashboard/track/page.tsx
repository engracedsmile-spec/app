
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, ScanLine, Search, Car, ShieldOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseApp from "@/firebase/config";
import { getOperationsSettings, type OperationsSettings } from "@/lib/settings";

export default function TrackTripPage() {
    const router = useRouter();
    const [bookingId, setBookingId] = useState('');
    const [opsSettings, setOpsSettings] = useState<OperationsSettings | null>(null);

    useEffect(() => {
        getOperationsSettings().then(setOpsSettings);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = bookingId.trim();
        if (!code) return;

        const db = getFirestore(firebaseApp);
        const tripRef = doc(db, "shipments", code);
        const tripSnap = await getDoc(tripRef);

        if (tripSnap.exists()) {
            router.push(`/dashboard/trip/${code}`);
        } else {
            toast.error("Not Found", {
                description: `Trip with ID ${code} was not found.`,
            });
        }
    };
    
    if (opsSettings && !opsSettings.charterBookingEnabled && !opsSettings.seatBookingEnabled) {
        return (
            <div className="flex flex-col h-full bg-background text-foreground">
                <header className="flex items-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Feature Not Available</h1>
                </header>
                 <main className="flex-1 p-4 flex items-center justify-center">
                    <Card className="max-w-md w-full text-center">
                        <CardContent className="p-8">
                            <ShieldOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-xl font-bold">Live Tracking is Disabled</h2>
                            <p className="text-muted-foreground mt-2">
                                The administrator has not enabled live map tracking for trips.
                            </p>
                             <Button onClick={() => router.back()} className="mt-6">Go Back</Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <header className="flex items-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Track Your Trip</h1>
            </header>

            <main className="flex-1 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                <Car className="h-24 w-24 text-primary/20 mb-8" />
                <h2 className="text-2xl font-bold">Enter Your Trip ID</h2>
                <p className="text-muted-foreground max-w-sm mt-2 mb-8">
                    Enter your unique tracking ID below to see the live status and location of your trip.
                </p>
                <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value)}
                            placeholder="Enter Booking/Tracking ID"
                            className="w-full h-12 pl-10 pr-4 rounded-lg bg-card border-border/50"
                        />
                    </div>
                    <Link href="/dashboard/scan">
                      <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
                          <ScanLine className="h-6 w-6" />
                      </Button>
                    </Link>
                </form>
            </main>
        </div>
    );
}
