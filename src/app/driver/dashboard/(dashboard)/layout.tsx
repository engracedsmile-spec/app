/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client";

import { Docker } from "@/components/docker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Preloader } from "@/components/preloader";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/signin');
        }
    }, [user, loading, router]);
    
    if (loading || !user) {
        return <Preloader />;
    }

    if (user.status === 'Suspended' || user.status === 'Inactive') {
        return (
            <div className="flex h-dvh w-full items-center justify-center bg-background p-4">
              <Card className="max-w-md text-center">
                  <CardContent className="p-6">
                      <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4"/>
                      <h2 className="text-xl font-bold">Account {user.status}</h2>
                      <p className="text-muted-foreground mt-2">
                          Your account is currently {user.status.toLowerCase()}. Please contact support for more information.
                      </p>
                  </CardContent>
              </Card>
          </div>
        )
    }

    return (
        <div className="flex flex-col h-dvh bg-background text-foreground">
            <div className="flex-1 overflow-y-auto pb-24">
                {children}
            </div>
            <Docker />
        </div>
    )
}
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
