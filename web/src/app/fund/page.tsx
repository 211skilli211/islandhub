export const dynamic = 'force-dynamic';

'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function FundRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = searchParams.toString();
        router.replace(`/campaigns${params ? `?${params}` : ''}`);
    }, [router, searchParams]);
    return null;
}

export default function FundRedirect() {
    return (
        <Suspense fallback={null}>
            <FundRedirectContent />
        </Suspense>
    );
}
