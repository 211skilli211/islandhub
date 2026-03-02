'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/listings?type=product');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Redirecting to Goods...</p>
            </div>
        </div>
    );
}
