import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    try {
        const res = await fetch(`${API_BASE}/api/admin/category-tile-assets`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });
        
        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch' }, { status: res.status });
        }
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();
    
    try {
        const res = await fetch(`${API_BASE}/api/admin/category-tile-assets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(body),
        });
        
        if (!res.ok) {
            const error = await res.json();
            return NextResponse.json(error, { status: res.status });
        }
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}