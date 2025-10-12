
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Package, Car, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { getOperationsSettings } from "@/lib/settings";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { usePreloader } from "@/context/preloader-context";

const BookingTypeDialog = ({ onSelect, closeDialog }: { onSelect: (type: 'seat_booking' | 'charter') => void, closeDialog: () => void }) => {
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
                        <Users className="h-8 w-8 text-primary mb-2"/>
                        <p className="font-bold">Book a Seat</p>
                        <p className="text-xs text-muted-foreground">Join other passengers on a scheduled trip.</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors" onClick={() => handleSelect('charter')}>
                    <CardContent className="p-6 text-center flex flex-col items-center justify-center gap-2">
                        <Car className="h-8 w-8 text-primary mb-2"/>
                        <p className="font-bold">Charter Vehicle</p>
                        <p className="text-xs text-muted-foreground">Reserve the entire vehicle for your private group.</p>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}


export function HeroAction() {
    const router = useRouter();
    const { showPreloader } = usePreloader();
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [isCheckingSettings, setIsCheckingSettings] = useState(false);

    const handleBookingClick = async () => {
        setIsCheckingSettings(true);
        try {
            const opsSettings = await getOperationsSettings();
            const seatBookingEnabled = opsSettings?.seatBookingEnabled ?? true;
            const charterBookingEnabled = opsSettings?.charterBookingEnabled ?? false;

            if (seatBookingEnabled && charterBookingEnabled) {
                setIsBookingDialogOpen(true);
            } else if (seatBookingEnabled) {
                onDialogSelect('seat_booking');
            } else if (charterBookingEnabled) {
                onDialogSelect('charter');
            } else {
                 toast.info("Under Maintenance", {
                    description: "Booking services are temporarily unavailable. Please check back later."
                });
            }
        } catch (error) {
            toast.error("Error", { description: "Could not load booking settings. Please try again." });
        } finally {
            setIsCheckingSettings(false);
        }
    }
    
    const onDialogSelect = (type: 'seat_booking' | 'charter') => {
        showPreloader();
        router.push(`/book-trip?bookingType=${type}`);
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
             <Button 
                onClick={handleBookingClick}
                disabled={isCheckingSettings}
                size="lg" 
                className="w-full h-14 text-lg font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
                 {isCheckingSettings ? <Loader2 className="animate-spin mr-2"/> : "Book a Trip"}
            </Button>
            <ResponsiveDialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <BookingTypeDialog
                    onSelect={onDialogSelect}
                    closeDialog={() => setIsBookingDialogOpen(false)}
                />
            </ResponsiveDialog>
            <p className="text-sm text-center text-white/60">
                Already have an account?{" "}
                <Link href="/signin" className="font-bold text-primary hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    );
}
