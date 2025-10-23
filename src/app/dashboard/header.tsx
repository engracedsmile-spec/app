"use client";

import { useAuth } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { usePreloader } from "@/context/preloader-context";
import { useRouter } from "next/navigation";


export const Header = () => {
    const { user, firestore } = useAuth();
    const { showPreloader } = usePreloader();
    const router = useRouter();
    const [greeting, setGreeting] = useState("Welcome Back");
    const [unreadCount, setUnreadCount] = useState(0);

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
        if (!user || !firestore) return;
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
        <header className="sticky top-0 left-0 right-0 z-20 px-4 pt-4 bg-background">
            <div className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/account" onClick={(e) => handleLinkClick(e, "/dashboard/account")}>
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
                    <ThemeSwitcher />
                    <Link href="/dashboard/notifications" onClick={(e) => handleLinkClick(e, "/dashboard/notifications")}>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-6 w-6"/>
                            {unreadCount > 0 && <span className={cn("absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background", unreadCount > 0 && "blinking-dot")}></span>}
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
