import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ tileKey: string }> }
) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { tileKey } = await params;

    try {
        const res = await fetch(`${API_BASE}/api/admin/category-tile-assets/${tileKey}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
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