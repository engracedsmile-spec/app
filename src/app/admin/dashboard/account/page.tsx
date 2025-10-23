/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShieldCheck, HelpCircle, LogOut, ArrowLeft, User, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { PERMISSIONS } from "@/lib/permissions";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AdminHelp } from "../help";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePreloader } from "@/context/preloader-context";

const ListItem = ({ icon: Icon, title, href, action }: { icon: React.ElementType, title: string, href?: string, action?: () => void }) => {
    const { showPreloader } = usePreloader();
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (href) {
            e.preventDefault();
            showPreloader();
            router.push(href);
        } else if (action) {
            action();
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
    
    return href ? <Link href={href} className="contents">{content}</Link> : content;
};


export default function AdminAccountPage() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    
    const settingsItems = [
        { icon: ShieldCheck, title: 'Privacy & Security', href: "#", permission: 'manageSettings' },
        { icon: HelpCircle, title: 'Admin Support', href: "/admin/dashboard/support", permission: 'manageSupport' },
    ];

    const simplifiedItems = [
        { icon: User, title: 'Profile Details', href: "#" },
        { icon: FileText, title: 'My Activity', href: "#" },
    ]

    const handleSignOut = () => {
        signOut();
        router.push('/signin');
    };
    
    const userRole = user?.role || 'Support';
    const userPermissions = PERMISSIONS[userRole] || [];

    const accessibleSettings = settingsItems.filter(item => userPermissions.includes(item.permission as any));

    const pageContent = (isManager: boolean) => (
         <div className="space-y-8">
            <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-primary/50">
                    <AvatarImage src={user?.profilePictureUrl || "https://github.com/shadcn.png"} alt={user?.name} />
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

            {isManager ? (
                 <div className="space-y-4">
                     <h3 className="text-base font-semibold tracking-tight px-1">Settings</h3>
                     <Card>
                        <div className="divide-y divide-border/50">
                            {accessibleSettings.map((item, index) => (
                                <ListItem key={item.title} {...item} />
                            ))}
                        </div>
                    </Card>
                </div>
            ) : (
                 <div className="space-y-4">
                    <h3 className="text-base font-semibold tracking-tight px-1">General</h3>
                    <Card>
                        <div className="divide-y divide-border/50">
                            {simplifiedItems.map((item) => <ListItem key={item.title} {...item} />)}
                        </div>
                    </Card>
                </div>
            )}
            
            <div className="pt-4">
                <Button onClick={handleSignOut} variant="outline" className="w-full h-12 text-base text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive">
                   <LogOut className="mr-2 h-5 w-5"/><span>Log Out</span>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
             <header className="flex items-center justify-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 absolute left-4">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">My Account</h1>
                 <div className="absolute right-4">
                    <AdminHelp page="account" />
                </div>
            </header>
            <ScrollArea className="flex-1">
                <div className="p-4 md:p-6">
                    {pageContent(userRole === 'Manager')}
                </div>
            </ScrollArea>
        </div>
    );
}
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
