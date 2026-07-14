import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
    try {
        const res = await fetch(`${API_BASE}/api/category-tile-assets/public`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch' }, { status: res.status });
        }
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        // Return empty array on error - frontend will use fallback
        return NextResponse.json([]);
    }
}