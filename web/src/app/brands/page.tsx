'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BrandsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/stores');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Redirecting to Brands...</p>
            </div>
        </div>
    );
}