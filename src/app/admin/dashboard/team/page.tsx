
"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated. Redirecting to the consolidated user management page.
export default function TeamManagementRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/dashboard/users');
    }, [router]);

    return null;
}
