
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, User, Car, ShieldCheck, HelpCircle, LogOut, Fuel, Headset } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SubHeader } from "@/components/sub-header";

const ListItem = ({ icon: Icon, title, href, action }: { icon: React.ElementType, title: string, href?: string, action?: () => void }) => {
    const content = (
        <div className="flex items-center p-4 transition-colors hover:bg-muted/50 cursor-pointer">
             <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted mr-4">
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <p className="font-semibold">{title}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
    );

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        if (href) {
            return <Link href={href}>{children}</Link>;
        }
        return <div onClick={action}>{children}</div>;
    };

    return <Wrapper>{content}</Wrapper>;
};


export default function DriverAccountPage() {
    const router = useRouter();
    const { user, signOut } = useAuth();

    const generalItems = [
        { icon: User, title: 'Profile Details', href: "/driver/dashboard/account/profile" },
        { icon: Car, title: 'My Trips', href: "/driver/dashboard/deliveries" },
        { icon: Fuel, title: 'Expenses & Requests', href: "/driver/dashboard/expenses" },
    ];

    const settingsItems = [
        { icon: ShieldCheck, title: 'Privacy & Security', href: "#" },
        { icon: Headset, title: 'Driver Support', href: "/dashboard/messages" },
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
                        <AvatarImage src={user?.profilePictureUrl} alt={user?.name} />
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
                    <Button onClick={handleSignOut} variant="outline" className="w-full h-12 text-base text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="mr-2 h-5 w-5"/><span>Log Out</span>
                    </Button>
                </div>
            </div>
        </>
    );
}
