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
import { Preloader } from "@/components/preloader";
import { Docker } from "@/components/docker";

export default function DashboardLayout({
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
    } else if (user.userType === 'admin') {
      router.replace("/admin/dashboard");
    } else if (user.userType === 'driver') {
      router.replace("/driver/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user || user.userType !== 'customer') {
    return <Preloader />;
  }
  
  return (
    <div className="relative flex flex-col h-dvh bg-background text-foreground">
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      <Docker />
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
