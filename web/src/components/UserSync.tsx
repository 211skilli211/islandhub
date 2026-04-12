'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';

export default function UserSync() {
    const { isAuthenticated, refreshUser } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            refreshUser();
        }
    }, [isAuthenticated, refreshUser]);

    return null;
}
