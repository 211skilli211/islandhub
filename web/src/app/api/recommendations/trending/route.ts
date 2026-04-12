import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '4';

    try {
        // In a real scenario, this would call a backend endpoint specifically for popular items.
        // For this implementation, we fetch listings and assume the backend sorts them or we take the first N.
        const res = await api.get(`/listings?limit=${limit}`);

        // Safety check: ensure we have an array
        const listings = Array.isArray(res.data) ? res.data : (res.data?.data || []);

        return NextResponse.json({ listings });
    } catch (error) {
        console.error('Failed to fetch trending:', error);
        return NextResponse.json({ listings: [] });
    }
}
