'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FoodRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/stores?category=food');
    }, [router]);
    return null;
}
