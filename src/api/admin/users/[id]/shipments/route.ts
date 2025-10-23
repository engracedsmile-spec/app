
import { NextResponse } from 'next/server';

// This file is deprecated and its logic has been moved to /api/admin/users/[id]/bookings
// Any requests to this endpoint will be permanently redirected.
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const url = new URL(request.url);
    // 301 Moved Permanently
    return NextResponse.redirect(`${url.origin}/api/admin/users/${params.id}/bookings`, 301);
}
