import { NextResponse } from 'next/server';
import { sendAdminNotification, type NotificationPayload } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const payload: NotificationPayload = await request.json();
    
    // The actual logic with firebase-admin is now in a separate, server-only file.
    await sendAdminNotification(payload);

    return NextResponse.json({ success: true, message: 'Notification sent.' });

  } catch (error: any) {
    console.error("API Error in /api/notifications:", error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
