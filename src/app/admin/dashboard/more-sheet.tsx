
"use client"

import { FileText, Bell, DollarSign, BarChart, Cog, User, Headset, UserCog, Users, Route as RouteIcon, CalendarPlus, Fuel, AppWindow, Image as ImageIcon, Car, TerminalSquare, Scan, Share2, Gift, HelpCircle, Wifi, Archive, BadgePercent, Download, CreditCard, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/firebase";
import { PERMISSIONS } from "@/lib/permissions";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePreloader } from "@/context/preloader-context";
import { useRouter } from "next/navigation";


const allMenuItems = {
    business: [
        { icon: BarChart, title: "Analytics", href: "/admin/dashboard/analytics", permission: "viewAnalytics" },
        { icon: CalendarPlus, title: "Departures", href: "/admin/dashboard/departures", permission: "manageShipments" },
        { icon: Car, title: "Vehicles", href: "/admin/dashboard/settings/vehicles", permission: "manageSettings" },
        { icon: DollarSign, title: "Payouts", href: "/admin/dashboard/payouts", permission: "managePayouts" },
        { icon: BadgePercent, title: "Promotions", href: "/admin/dashboard/settings/frontend/promotions", permission: "managePromotions" },
        { icon: Share2, title: "Referrals", href: "/admin/dashboard/referrals", permission: "manageSettings" },
        { icon: Headset, title: "Customer Support", href: "/admin/dashboard/support", badge: 0, permission: "manageSupport" },
        { icon: Scan, title: "Scan QR", href: "/admin/dashboard/scan", permission: "manageShipments" },
        { icon: HelpCircle, title: "Help & Support", href: "/admin/dashboard/help", permission: "viewDashboard" },
    ],
    configuration: [
        { icon: Cog, title: "General", href: "/admin/dashboard/settings/general", permission: "manageSettings" },
        { icon: CreditCard, title: "Payment Gateway", href: "/admin/dashboard/settings/payment", permission: "managePayments" },
        { icon: Wifi, title: "WiFi Inventory", href: "/admin/dashboard/settings/inventory", permission: "manageInventory" },
        { icon: AppWindow, title: "Modules", href: "/admin/dashboard/settings/modules", permission: "manageSettings" },
        { icon: TerminalSquare, title: "Terminals", href: "/admin/dashboard/settings/terminals", permission: "manageSettings" },
        { icon: RouteIcon, title: "Routes", href: "/admin/dashboard/settings/routes", permission: "manageSettings" },
        { icon: Gift, title: "Charter Packages", href: "/admin/dashboard/settings/charter", permission: "manageSettings" },
        { icon: Share2, title: "Referral Settings", href: "/admin/dashboard/settings/referrals", permission: "manageSettings"},
        { icon: ImageIcon, title: "Frontend CMS", href: "/admin/dashboard/settings/frontend", permission: "manageFrontend" },
        { icon: MessageSquare, title: "Support Settings", href: "/admin/dashboard/settings/support", permission: "manageSupport" },
    ],
    system: [
        { icon: Bell, title: "Push Notification", href: "/admin/dashboard/settings/notifications", permission: "sendNotifications" },
        { icon: Download, title: "Daily Digest", href: "/admin/dashboard/report", permission: "viewReports" },
        { icon: User, title: "Account", href: "/admin/dashboard/account", permission: "manageAccount" },
    ]
};


const GridItem = ({ item, onNavigate }: { item: { icon: React.ElementType, title: string, href: string, badge?: number }, onNavigate: (href: string) => void }) => {
    
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onNavigate(item.href);
    };

    return (
        <Link href={item.href} className="block group" onClick={handleClick}>
            <Card className="transition-all duration-200 ease-in-out group-hover:bg-primary/5 group-hover:border-primary/40 group-hover:shadow-md h-full">
                <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 h-full relative">
                    {item.badge != null && item.badge > 0 && (
                        <Badge className="absolute top-2 right-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">{item.badge}</Badge>
                    )}
                    <div className="flex items-center justify-center h-12 w-12 bg-muted rounded-full transition-colors duration-200 group-hover:bg-primary/10">
                        <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium leading-tight">{item.title}</span>
                </CardContent>
            </Card>
        </Link>
    );
};

const Section = ({ title, items, onNavigate }: { title: string, items: any[], onNavigate: (href: string) => void}) => {
    if (items.length === 0) return null;
    return (
        <div>
            <h2 className="text-base font-semibold tracking-tight mb-4 px-1">{title}</h2>
             <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                {items.map((item) => (
                     <GridItem key={item.title} item={item} onNavigate={onNavigate} />
                ))}
            </div>
        </div>
    )
}

interface AdminMoreSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export const AdminMoreSheet = ({ open, onOpenChange, children }: AdminMoreSheetProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const userRole = user?.role || 'Support';
    const userPermissions = PERMISSIONS[userRole] || [];
    const { showPreloader } = usePreloader();
    const router = useRouter();


    const menuItems = useMemo(() => {
        const filterByPermission = (items: any[]) => items.filter(item => userPermissions.includes(item.permission as any));
        return {
            business: filterByPermission(allMenuItems.business),
            configuration: filterByPermission(allMenuItems.configuration),
            system: filterByPermission(allMenuItems.system),
        }
    }, [userPermissions]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) {
            return menuItems;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        const filterBySearch = (items: any[]) => items.filter(item => item.title.toLowerCase().includes(lowercasedFilter));
        return {
            business: filterBySearch(menuItems.business),
            configuration: filterBySearch(menuItems.configuration),
            system: filterBySearch(menuItems.system),
        };
    }, [searchTerm, menuItems]);

    const hasResults = Object.values(filteredItems).some(arr => arr.length > 0);
    
    const handleNavigate = (href: string) => {
        showPreloader();
        onOpenChange(false);
        router.push(href);
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <div className="flex flex-col h-[90vh] overflow-hidden">
                    {/* Header Section: This part will NOT scroll */}
                    <div className="shrink-0 p-4 pb-2 space-y-4">
                        <DrawerHeader className="p-0 text-left">
                            <DrawerTitle>More Options</DrawerTitle>
                            <DrawerDescription>Access additional management tools and settings.</DrawerDescription>
                        </DrawerHeader>
                        <div className="relative">
                            <Input
                                placeholder="Search options..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>
                    </div>

                    {/* Body Section: This part will expand and scroll */}
                    <ScrollArea className="flex-1 overflow-y-auto max-h-[70vh] scroll-smooth px-1">
                        <div className="p-4 pt-2 space-y-8">
                             {hasResults ? (
                                <>
                                    <Section title="Business Management" items={filteredItems.business} onNavigate={handleNavigate} />
                                    <Section title="Configuration" items={filteredItems.configuration} onNavigate={handleNavigate} />
                                    {filteredItems.system.length > 0 && <Section title="System & Admin" items={filteredItems.system} onNavigate={handleNavigate} />}
                                </>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p className="text-lg font-semibold">No results found</p>
                                    <p>Try searching for a different term.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
