
"use client"

import { useAuth } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Loader2, Plus, Car, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { getOperationsSettings } from "@/lib/settings";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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


export const Header = () => {
    const { user, firestore } = useAuth();
    const [greeting, setGreeting] = useState("Welcome Back");
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [isCheckingSettings, setIsCheckingSettings] = useState(false);
    const { showPreloader } = usePreloader();

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

    useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) return "Good Morning";
            if (hour < 18) return "Good Afternoon";
            return "Good Evening";
        };
        setGreeting(getGreeting());
    }, []);

    useEffect(() => {
        if (!user) return;
        const notifsRef = collection(firestore, `users/${user.id}/notifications`);
        const q = query(notifsRef, where("read", "==", false));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUnreadCount(snapshot.size);
        });
        return () => unsubscribe();
    }, [user, firestore]);
    
    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        showPreloader();
        router.push(href);
    };

    return (
        <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b">
            <div className="flex items-center gap-4">
                <Link href="/driver/dashboard/account" onClick={(e) => handleLinkClick(e, "/driver/dashboard/account")}>
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={user?.profilePictureUrl || `https://i.pravatar.cc/150?u=${user?.email}`} alt={user?.name} />
                        <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Link>
                <div>
                    <p className="text-sm text-muted-foreground">{greeting}</p>
                    <h1 className="text-lg md:text-2xl font-bold">{user?.name}</h1>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <ResponsiveDialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                     <Button onClick={handleBookingClick} disabled={isCheckingSettings}>
                        {isCheckingSettings ? <Loader2 className="animate-spin mr-2"/> : <Plus className="mr-2 h-4 w-4"/>}
                        New Booking
                    </Button>
                    <BookingTypeDialog onSelect={onDialogSelect} closeDialog={() => setIsBookingDialogOpen(false)} />
                </ResponsiveDialog>
                <ThemeSwitcher />
                <Link href="/dashboard/notifications" onClick={(e) => handleLinkClick(e, "/dashboard/notifications")}>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-6 w-6"/>
                        {unreadCount > 0 && <span className={cn("absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background", unreadCount > 0 && "blinking-dot")}></span>}
                    </Button>
                </Link>
            </div>
        </header>
    );
}
