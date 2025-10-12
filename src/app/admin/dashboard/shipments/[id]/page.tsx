"use client"
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Preloader } from '@/components/preloader';

export default function DeprecatedBookingDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        // This page is deprecated. Redirect to the departures manifest page.
        // A full implementation would fetch the booking, get the scheduledTripId, then redirect.
        // For simplicity, we redirect to the main departures list.
        router.replace('/admin/dashboard/departures');
    }, [router, id]);

    return <Preloader />;
}
