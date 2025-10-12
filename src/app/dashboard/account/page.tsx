
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, User, Bell, ShieldCheck, HelpCircle, Wallet, LogOut, Car, Settings, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card } from "@/components/ui/card";
import { SubHeader } from "@/components/sub-header";
import Link from "next/link";
import { usePreloader } from "@/context/preloader-context";

const ListItem = ({ icon: Icon, title, href, action }: { icon: React.ElementType, title: string, href?: string, action?: () => void }) => {
    const { showPreloader } = usePreloader();
    const router = useRouter();
    
    const handleClick = (e: React.MouseEvent) => {
        if (action) {
            action();
        } else if (href) {
            e.preventDefault();
            showPreloader();
            router.push(href);
        }
    }

    const content = (
        <div className="flex items-center p-4 transition-colors hover:bg-muted/50 cursor-pointer" onClick={handleClick}>
             <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted mr-4">
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <p className="font-semibold">{title}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
    );
    
    return href && !action ? <Link href={href} className="contents">{content}</Link> : content;
};


export default function AccountPage() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    
    const generalItems = [
        { icon: User, title: 'Profile Details', href: "/dashboard/account/profile" },
        { icon: Car, title: 'My Bookings', href: "/dashboard/history" },
        { icon: Wallet, title: 'My Wallet', href: "/dashboard/wallet" },
        { icon: Share2, title: 'Refer & Earn', href: "/dashboard/referrals" },
    ];

    const settingsItems = [
        { icon: Settings, title: 'Preferences', href: "/dashboard/account/preferences" },
        { icon: Bell, title: 'Notification Settings', href: "/dashboard/account/notifications" },
        { icon: ShieldCheck, title: 'Privacy & Security', href: "/dashboard/account/security" },
        { icon: HelpCircle, title: 'Help Center', href: "/dashboard/support" },
    ];

    const handleSignOut = () => {
        signOut();
        router.push('/signin');
    };

    return (
        <>
            <SubHeader title="Account" />
            <div className="p-4 md:p-6 space-y-8">
                 <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/50">
                        <AvatarImage src={user?.profilePictureUrl || `https://i.pravatar.cc/150?u=${user?.email}`} />
                        <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-xl font-bold">{user?.name}</h2>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-base font-semibold tracking-tight px-1">Theme</h3>
                    <div className="p-4 rounded-lg bg-card flex justify-between items-center">
                        <p className="font-semibold">Appearance</p>
                        <ThemeSwitcher />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-base font-semibold tracking-tight px-1">General</h3>
                    <Card>
                        <div className="divide-y divide-border/50">
                            {generalItems.map((item) => (
                                    <ListItem key={item.title} {...item} />
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                        <h3 className="text-base font-semibold tracking-tight px-1">Settings</h3>
                        <Card>
                        <div className="divide-y divide-border/50">
                            {settingsItems.map((item) => (
                                    <ListItem key={item.title} {...item} />
                            ))}
                        </div>
                    </Card>
                </div>
                
                <div className="pt-4">
                    <Button onClick={handleSignOut} variant="outline" className="w-full h-12 text-base text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive flex items-center justify-center gap-2">
                        <LogOut className="h-5 w-5" /> <span>Log Out</span>
                    </Button>
                </div>
            </div>
        </>
    );
}
