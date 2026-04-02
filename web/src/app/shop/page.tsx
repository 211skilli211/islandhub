export const dynamic = 'force-dynamic';

'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ShopRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = searchParams.toString();
        router.replace(`/stores?category=product${params ? `&${params}` : ''}`);
    }, [router, searchParams]);
    return null;
}

export default function ShopRedirect() {
    return (
        <Suspense fallback={null}>
            <ShopRedirectContent />
        </Suspense>
    );
}
