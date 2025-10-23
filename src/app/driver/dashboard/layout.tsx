/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client"

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Preloader } from "@/components/preloader";

export default function DriverDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/signin");
    } else if (user.userType !== 'driver') {
        router.replace(user.userType === 'customer' ? "/dashboard" : "/admin/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Preloader />;
  }
  
  if (user?.status === 'Suspended' || user?.status === 'Inactive') {
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

  return <>{children}</>;
}
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
