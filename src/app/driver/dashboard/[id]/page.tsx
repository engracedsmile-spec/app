
"use client"

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Preloader } from '@/components/preloader';

export default function DeprecatedDriverIdPage() {
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        // This page structure is deprecated, redirecting to the specific departure manifest
        router.replace(`/driver/dashboard/deliveries/${params.id}`);
    }, [router, params.id]);

    return <Preloader />;
}
