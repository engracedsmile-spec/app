
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Preloader } from '@/components/preloader';

// This page is deprecated.
export default function LogisticsRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return <Preloader />;
}
