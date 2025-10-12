"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Preloader } from '@/components/preloader';

export default function EditRouteRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/dashboard/settings/routes');
    }, [router]);

    return <Preloader />;
}
