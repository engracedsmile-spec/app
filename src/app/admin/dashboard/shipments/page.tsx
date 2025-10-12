"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Preloader } from '@/components/preloader';

export default function DeprecatedBookingsPage() {
    const router = useRouter();

    useEffect(() => {
        // This page is deprecated and has been consolidated into the departures management.
        router.replace('/admin/dashboard/departures');
    }, [router]);

    return <Preloader />;
}
