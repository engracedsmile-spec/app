
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/dashboard/settings/general');
    }, [router]);

    return null; // or a loading spinner
}

    