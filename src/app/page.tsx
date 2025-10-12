
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogoFull } from "@/components/icons/logo-full";
import { Car, User, Loader2 } from "lucide-react";
import { Preloader } from "@/components/preloader";
import { Card, CardContent } from "@/components/ui/card";
import { DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { getOperationsSettings, type OperationsSettings } from "@/lib/settings";
import { toast } from "sonner";
import placeholderImages from "@/lib/placeholder-images.json";
import { Users } from "lucide-react";

type LandingPageContent = {
    headline: string;
    subHeadline: string;
    heroImageUrl: string;
    ctaButtonText: string;
    signInButtonText: string;
}

const BookingTypeDialog = ({ onSelect, closeDialog }: { onSelect: (type: 'seat_booking' | 'charter') => void, closeDialog: () => void }) => {
    const router = useRouter();

    const handleSelect = (type: 'seat_booking' | 'charter') => {
        closeDialog();
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

function WelcomePageComponent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [isCheckingSettings, setIsCheckingSettings] = useState(false);
    
    const content: LandingPageContent = {
        headline: "Travel with Grace, Arrive with a Smile",
        subHeadline: "Your trusted partner for premium passenger trips across Nigeria.",
        heroImageUrl: placeholderImages.hero.src,
        ctaButtonText: "Book a Trip",
        signInButtonText: "Sign In",
    };
    
    useEffect(() => {
        if (!authLoading && user) {
             const redirectPath = user.userType === 'admin' ? '/admin/dashboard' : user.userType === 'driver' ? '/driver/dashboard' : '/dashboard';
             router.replace(redirectPath);
        }
    }, [user, authLoading, router]);
    
    if (authLoading || user) {
        return <Preloader />; 
    }
    
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
        router.push(`/book-trip?bookingType=${type}`);
    }

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        router.push(href);
    };

    return (
        <div className="relative flex flex-col min-h-dvh items-center justify-between bg-black text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src={content.heroImageUrl}
                    alt="Luxury car background"
                    fill
                    className="object-cover"
                    quality={100}
                    unoptimized={true}
                    data-ai-hint={placeholderImages.hero.hint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30"></div>
            </div>
            
            <main className="relative z-10 flex flex-1 flex-col items-center justify-center w-full p-8 text-center">
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <LogoFull className="h-16 w-auto" />
                    <div className="max-w-xl">
                        <h1 className="text-4xl font-bold tracking-tight">{content.headline}</h1>
                        <p className="mt-4 text-lg text-white/80">{content.subHeadline}</p>
                    </div>
                </div>

                <div className="w-full max-w-sm pb-4 space-y-4">
                    <Button
                        onClick={handleBookingClick}
                        size="lg"
                        className="w-full h-14 text-lg font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isCheckingSettings}
                    >
                        {isCheckingSettings ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            content.ctaButtonText
                        )}
                    </Button>
                    <ResponsiveDialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                        <BookingTypeDialog
                            onSelect={onDialogSelect}
                            closeDialog={() => setIsBookingDialogOpen(false)}
                        />
                    </ResponsiveDialog>
                    <p className="text-sm text-white/60">
                        Already have an account?{" "}
                        <Link href="/signin" onClick={(e) => handleLinkClick(e, "/signin")} className="font-bold text-primary hover:underline">
                            {content.signInButtonText}
                        </Link>
                    </p>
                </div>
            </main>
            <footer className="relative z-10 p-4 w-full text-center text-xs text-white/50">
                <Link href="/about" onClick={(e) => handleLinkClick(e, "/about")} className="hover:underline">About Us</Link>
                <span className="mx-2">|</span>
                <Link href="/privacy-policy" onClick={(e) => handleLinkClick(e, "/privacy-policy")} className="hover:underline">Privacy Policy</Link>
                <span className="mx-2">|</span>
                <Link href="/terms-of-service" onClick={(e) => handleLinkClick(e, "/terms-of-service")} className="hover:underline">Terms of Service</Link>
            </footer>
        </div>
    );
}


export default function WelcomePage() {
    return (
        <Suspense fallback={<Preloader />}>
            <WelcomePageComponent />
        </Suspense>
    );
}
