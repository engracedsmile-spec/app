
"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Preloader } from "@/components/preloader";

export default function WithdrawalsPage() {
    const router = useRouter();

    useEffect(() => {
        // This page is deprecated and replaced by the more comprehensive payouts page
        router.replace('/admin/dashboard/payouts');
    }, [router]);

    return <Preloader />;
}
