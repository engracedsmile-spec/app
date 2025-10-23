"use client"

import { useAuth } from "@/hooks/use-auth";
import { Home, Package, Users, Car, MoreHorizontal, Settings, MessageSquare, Plus, Fuel, BarChart, CalendarPlus, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { DrawerDescription, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { ResponsiveDialog } from "./responsive-dialog";
import { getOperationsSettings } from "@/lib/settings";
import { AdminMoreSheet } from "@/app/admin/dashboard/more-sheet";
import { PERMISSIONS } from "@/lib/permissions";
import { toast } from "sonner";
import Link from "next/link";
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

const customerNavItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/history", icon: Car, label: "Trips" },
    { id: "book-trip", icon: Plus, label: "Book", isCentral: true },
    { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
    { href: "/dashboard/account", icon: Settings, label: "Account" },
];

const adminNavItems = [
    { href: "/admin/dashboard", label: "Home", requiredPermission: "viewDashboard", icon: Home },
    { href: "/admin/dashboard/departures", label: "Departures", requiredPermission: "manageShipments", icon: CalendarPlus },
    { href: "/admin/dashboard/users", label: "Users", requiredPermission: "manageUsers", icon: Users },
    { id: "admin-more", icon: MoreHorizontal, label: "More", isSheet: true, requiredPermission: "viewDashboard" },
];

const driverNavItems = [
    { href: "/driver/dashboard", icon: Home, label: "Home" },
    { href: "/driver/dashboard/deliveries", icon: Car, label: "Trips" },
    { href: "/driver/dashboard/expenses", icon: Fuel, label: "Expenses" },
    { href: "/driver/dashboard/account", icon: User, label: "Account" },
];

const HIDDEN_PATHS = [
    '/dashboard/messages',
    '/admin/dashboard/support'
];

export const Docker = () => {
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
    const [opsSettings, setOpsSettings] = useState<any>(null);
    const { showPreloader } = usePreloader();

    useEffect(() => {
        getOperationsSettings().then(setOpsSettings);
    }, []);
    
    const shouldShowDocker = user && !HIDDEN_PATHS.some(path => pathname.startsWith(path));

    if (!shouldShowDocker) return null;

    let navItems = [];
    const userRole = user.role || 'Support';
    const userPermissions = PERMISSIONS[userRole] || [];

    if (user.userType === 'admin') {
         navItems = adminNavItems.filter(item => !item.requiredPermission || userPermissions.includes(item.requiredPermission as any));
    } else if (user.userType === 'driver') {
        navItems = driverNavItems;
    } else {
        navItems = customerNavItems;
    }
    
    const handleBookingTypeSelect = (type: 'seat_booking' | 'charter') => {
        setIsBookingDialogOpen(false);
        showPreloader();
        router.push(`/book-trip?bookingType=${type}`);
    }

    const handleCentralButtonClick = () => {
        if (!opsSettings) {
            toast.info("Loading settings, please wait...");
            return;
        };

        const seatBookingEnabled = opsSettings.seatBookingEnabled ?? true;
        const charterBookingEnabled = opsSettings.charterBookingEnabled ?? false;

        if (seatBookingEnabled && charterBookingEnabled) {
            setIsBookingDialogOpen(true);
        } else if (seatBookingEnabled) {
            handleBookingTypeSelect('seat_booking');
        } else if (charterBookingEnabled) {
            handleBookingTypeSelect('charter');
        } else {
            toast.info("Under Maintenance", {
                description: "Booking services are temporarily unavailable. Please check back later."
            });
        }
    }
    
    const isSubPath = (href: string | undefined) => {
        if (!href) return false;
        if (href === '/dashboard' || href === '/admin/dashboard' || href === '/driver/dashboard') {
            return pathname === href;
        }
        return pathname.startsWith(href) && href !== '/';
    }
    
    const NavLink = ({ item }: { item: any }) => {
        const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            if (item.href) {
                e.preventDefault();
                showPreloader();
                router.push(item.href);
            }
        };

        if (item.isSheet) {
            return (
                <AdminMoreSheet open={isMoreSheetOpen} onOpenChange={setIsMoreSheetOpen}>
                    <div className="w-16 cursor-pointer" onClick={() => setIsMoreSheetOpen(true)}>
                        <div className="flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary whitespace-nowrap">
                            <item.icon className="h-6 w-6" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </div>
                    </div>
                </AdminMoreSheet>
            );
        }
        
        if (item.isCentral) {
            return (
                 <div className="-mt-6 cursor-pointer" onClick={handleCentralButtonClick}>
                     <div className="flex items-center justify-center w-14 h-14 bg-primary rounded-full text-primary-foreground shadow-lg shadow-primary/30 transform transition-transform hover:scale-110">
                         <item.icon className="h-7 w-7" />
                     </div>
                 </div>
            )
        }

        const isActive = isSubPath(item.href);
        return (
            <Link href={item.href!} className="w-16" onClick={handleNavClick}>
               <div className={cn(
                   "flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary whitespace-nowrap",
                   isActive && "text-primary"
               )}>
                   <item.icon className="h-6 w-6" />
                   <span className="text-xs font-medium">{item.label}</span>
               </div>
            </Link>
        )
    }
    
    return (
        <>
            <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex h-16 items-center justify-around gap-2 rounded-full bg-card border border-border/50 shadow-lg px-3">
                {navItems.map((item) => <NavLink key={item.id || item.href} item={item} />)}
            </nav>
            <ResponsiveDialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <BookingTypeDialog onSelect={handleBookingTypeSelect} closeDialog={() => setIsBookingDialogOpen(false)} />
            </ResponsiveDialog>
        </>
    )
}
