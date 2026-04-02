export const dynamic = 'force-dynamic';

'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function BookRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = searchParams.toString();
        router.replace(`/stores?category=service${params ? `&${params}` : ''}`);
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Redirecting to Services...</p>
            </div>
        </div>
    );
}

export default function BookRedirect() {
    return (
        <Suspense fallback={null}>
            <BookRedirectContent />
        </Suspense>
    );
}
