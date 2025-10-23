import { NextRequest, NextResponse } from 'next/server';
import { sendNotification, sendAdminNotification } from '@/lib/firebase/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, payload, isAdmin = false } = body;

    if (!payload) {
      return NextResponse.json({ error: 'Notification payload is required' }, { status: 400 });
    }

    if (isAdmin) {
      await sendAdminNotification(payload);
    } else {
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required for user notifications' }, { status: 400 });
      }
      await sendNotification(userId, payload);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
