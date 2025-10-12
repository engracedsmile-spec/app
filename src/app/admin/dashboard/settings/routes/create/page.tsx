
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Preloader } from '@/components/preloader';

export default function CreateRouteRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // This page is deprecated, redirecting to the main routes page
        // where a dialog is used for creation.
        router.replace('/admin/dashboard/settings/routes');
    }, [router]);

    return <Preloader />;
}

    