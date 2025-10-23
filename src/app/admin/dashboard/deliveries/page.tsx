// This file is deprecated and has been replaced by the departures page.
"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Preloader } from '@/components/preloader';

export default function DeprecatedDeliveriesPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/dashboard/departures');
    }, [router]);

    return <Preloader />;
}
