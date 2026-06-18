'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function StoreSlugRedirect() {
    const params = useParams<{ slug: string }>();
    const router = useRouter();

    useEffect(() => {
        if (params?.slug) {
            router.replace(`/store/${params.slug}`);
        }
    }, [params, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-primary">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-accent-500/20 border-t-accent-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-body-sm text-ink-secondary">Redirecting...</p>
            </div>
        </div>
    );
}
