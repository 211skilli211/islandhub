import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit') || '4';

    if (!userId) {
        return NextResponse.json({ listings: [] });
    }

    try {
        // In a real app, this endpoint would trigger a complex ML model prediction or SQL query based on user history.
        // Since we are proxying to a general backend without a specific AI service yet, we will fetch listings
        // and shuffle them or return a specific category as a placeholder for "personalization".

        // Strategy: Fetch listings and randomize/shuffle to simulate new recommendations each time (or cache in SWR).
        const res = await api.get(`/listings?limit=20`);
        const allListings = Array.isArray(res.data) ? res.data : (res.data?.data || []);

        // Simple shuffle
        const shuffled = allListings.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Number(limit));

        return NextResponse.json({ listings: selected });
    } catch (error) {
        console.error('Failed to fetch personalized recommendations:', error);
        return NextResponse.json({ listings: [] });
    }
}
