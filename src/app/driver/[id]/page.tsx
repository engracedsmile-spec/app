/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/lib/data";
import { ArrowLeft, Car, Star } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import { Preloader } from "@/components/preloader";

export default function DriverPublicProfilePage() {
    const router = useRouter();
    const params = useParams();
    const driverId = params.id as string;

    const [driver, setDriver] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!driverId) return;

        const fetchDriverData = async () => {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const driverRef = doc(db, "users", driverId);
            const driverSnap = await getDoc(driverRef);

            if (driverSnap.exists()) {
                setDriver({ id: driverSnap.id, ...driverSnap.data() } as User);
            } else {
                toast.error("Error", { description: "Driver not found." });
            }
            setLoading(false);
        };

        fetchDriverData();
    }, [driverId]);
    
    if (loading) {
        return <Preloader />;
    }

    if (!driver) {
        return (
             <div className="flex flex-col h-full">
                <header className="flex items-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Driver Not Found</h1>
                </header>
                <main className="flex-1 flex items-center justify-center">
                    <p>Could not find details for this driver.</p>
                </main>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold ml-2">Meet Your Driver</h1>
            </header>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                <Card>
                    <CardContent className="p-6 text-center">
                        <Avatar className="h-24 w-24 mx-auto border-4 border-primary/50">
                            <AvatarImage src={driver.profilePictureUrl || `https://ui-avatars.com/api/?name=${driver.name.replace(' ', '+')}&background=random`} />
                            <AvatarFallback className="text-3xl">{driver.name[0]}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-2xl mt-4">{driver.name}</CardTitle>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-primary"/>
                            Vehicle Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-lg">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Model:</span>
                            <span className="font-semibold">{driver.vehicle || 'Toyota Sienna'}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">License Plate:</span>
                            <span className="font-semibold">{driver.licensePlate || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>
                 <Button className="w-full h-14 text-lg" onClick={() => router.back()}>Go Back</Button>
            </main>
        </div>
    );
}

/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
    
