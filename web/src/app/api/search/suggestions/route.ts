import { NextRequest, NextResponse } from 'next/server';
import { searchWithFuzzy } from '@/lib/search/engine';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        // Use fuzzy search engine for typo correction
        const results = await searchWithFuzzy(query, {
            limit: 8,
            types: ['product', 'category', 'vendor', 'service'],
        });

        return NextResponse.json({ suggestions: results });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ suggestions: [] }, { status: 500 });
    }
}
