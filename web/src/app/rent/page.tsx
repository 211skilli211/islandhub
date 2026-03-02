'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RentRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = searchParams.toString();
        router.replace(`/rentals${params ? `?${params}` : ''}`);
    }, [router, searchParams]);
    return null;
}

export default function RentRedirect() {
    return (
        <Suspense fallback={null}>
            <RentRedirectContent />
        </Suspense>
    );
}
