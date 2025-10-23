

"use client"

import { useAuth } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { AdminHelp } from "./help";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Bell, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, limit } from "firebase/firestore";
import Link from "next/link";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AppNotification } from "@/lib/data";
import { usePreloader } from "@/context/preloader-context";
import { useRouter } from "next/navigation";

const NotificationItem = ({ notif }: { notif: AppNotification }) => {
    const { firestore } = useAuth();
    const { showPreloader } = usePreloader();
    const router = useRouter();
    
    const handleMarkAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent link navigation
        if (!notif.userId) return;
        const notifRef = doc(firestore, `users/${notif.userId}/notifications`, notif.id);
        await updateDoc(notifRef, { read: true });
    }
    
    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        showPreloader();
        router.push(href);
    };

    const content = (
         <div className={cn("p-4 flex items-start gap-4 transition-colors hover:bg-muted/50 cursor-pointer", !notif.read && "bg-primary/5")}>
            <div className="mt-1 flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                <BellRing className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <p className={cn("font-semibold", !notif.read && "text-foreground")}>{notif.title}</p>
                <p className="text-sm text-muted-foreground">{notif.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.createdAt?.toDate().toLocaleString()}</p>
            </div>
            {!notif.read && (
                 <Button variant="ghost" size="sm" onClick={handleMarkAsRead} className="h-auto px-2 py-1 text-xs">
                    Mark as read
                </Button>
            )}
        </div>
    );

    return notif.href ? (
        <Link href={notif.href} onClick={(e) => handleLinkClick(e, notif.href!)} className="block">
            {content}
        </Link>
    ) : (
        <div className="block">{content}</div>
    );
};


export const AdminHeader = () => {
    const { user, firestore } = useAuth();
    const { showPreloader } = usePreloader();
    const router = useRouter();
    const [greeting, setGreeting] = useState("Welcome Back");
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

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
        const q = query(notifsRef, orderBy("createdAt", "desc"), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: AppNotification[] = [];
            let unread = 0;
            snapshot.forEach(doc => {
                const data = doc.data() as AppNotification;
                fetched.push({ id: doc.id, ...data });
                if (!data.read) {
                    unread++;
                }
            });
            setNotifications(fetched);
            setUnreadCount(unread);
        });
        return () => unsubscribe();
    }, [user, firestore]);
    
    const handleAccountClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        showPreloader();
        router.push("/admin/dashboard/account");
    };

    return (
        <header className="p-4 sticky top-0 bg-background z-10 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <Link href="/admin/dashboard/account" onClick={handleAccountClick}>
                    <Avatar className="h-12 w-12 border-2 border-border/50">
                        <AvatarImage src={user?.profilePictureUrl || `https://i.pravatar.cc/150?u=${user?.email}`} alt={user?.name} />
                        <AvatarFallback className="bg-muted text-foreground">{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Link>
                <div>
                    <h1 className="text-base font-medium text-muted-foreground">{greeting}</h1>
                    <h2 className="text-lg md:text-2xl font-bold">{user?.name}</h2>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <ThemeSwitcher />
                <Drawer>
                    <DrawerTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-6 w-6"/>
                            {unreadCount > 0 && <span className={cn("absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background", unreadCount > 0 && "blinking-dot")}></span>}
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="h-[90vh]">
                        <DrawerHeader>
                            <DrawerTitle>Notifications</DrawerTitle>
                            <DrawerDescription>Recent activity across the platform.</DrawerDescription>
                        </DrawerHeader>
                        <DrawerBody className="p-0">
                             <div className="divide-y divide-border/50">
                                {notifications.length > 0 ? (
                                    notifications.map(notif => <NotificationItem key={notif.id} notif={notif} />)
                                ) : (
                                    <p className="text-center text-muted-foreground p-8">No notifications yet.</p>
                                )}
                            </div>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
                <AdminHelp page="dashboard"/>
            </div>
        </header>
    )
}
