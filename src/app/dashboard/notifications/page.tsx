
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Car, CheckCircle2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getFirestore, collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type Notification = {
    id: string;
    title: string;
    description: string;
    createdAt: Timestamp;
    read: boolean;
    type: 'booking' | 'driver' | 'system' | 'wallet';
    href?: string;
};

const NotificationIcon = ({ type }: { type: Notification['type']}) => {
    const iconClass = "h-5 w-5";
    switch(type) {
        case 'booking': return <Car className={cn(iconClass, "text-blue-500")} />;
        case 'driver': return <CheckCircle2 className={cn(iconClass, "text-green-500")} />;
        case 'wallet': return <Wallet className={cn(iconClass, "text-orange-500")} />;
        case 'system':
        default:
            return <Bell className={cn(iconClass, "text-muted-foreground")} />;
    }
}

const NotificationItem = ({ notif }: { notif: Notification }) => {
    const content = (
        <div className={cn(
            "p-4 flex items-start gap-4 transition-colors",
            !notif.read && "bg-primary/5",
            notif.href ? "hover:bg-muted/50 cursor-pointer" : ""
        )}>
            <div className="mt-1 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                <NotificationIcon type={notif.type} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <p className={cn("font-semibold", !notif.read && "text-foreground")}>{notif.title}</p>
                    {!notif.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0 ml-2 blinking-dot"></div>}
                </div>
                <p className="text-sm text-muted-foreground">{notif.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.createdAt.toDate().toLocaleString()}</p>
            </div>
        </div>
    );

    return notif.href ? <Link href={notif.href} className="block">{content}</Link> : <div className="block">{content}</div>
}

export default function NotificationListPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        const db = getFirestore(firebaseApp);
        const notifsRef = collection(db, `users/${user.id}/notifications`);
        const q = query(notifsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotifications: Notification[] = [];
            snapshot.forEach(doc => {
                fetchedNotifications.push({ id: doc.id, ...doc.data() } as Notification);
            });
            setNotifications(fetchedNotifications);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <header className="flex items-center justify-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                 <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 absolute left-4">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Notifications</h1>
            </header>

            <main className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="space-y-2 p-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                             <div key={i} className="flex items-center gap-4 p-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-3 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length > 0 ? (
                     <div className="divide-y divide-border/50">
                        {notifications.map(notif => (
                            <NotificationItem key={notif.id} notif={notif} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center h-full">
                        <Bell className="h-16 w-16 mx-auto text-primary/20"/>
                        <p className="text-lg font-semibold mt-4">No Notifications</p>
                        <p className="mt-1 max-w-xs">Important updates about your account will appear here.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
