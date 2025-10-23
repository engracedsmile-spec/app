
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { sendAdminNotification } from '@/lib/firebase/notifications';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const body = await request.json();

    const applicationData = { 
        ...body, 
        status: 'pending', 
        appliedAt: FieldValue.serverTimestamp()
    };
    
    const applicationsRef = adminDb.collection("driverApplications");
    const docRef = await applicationsRef.add(applicationData);

    await sendAdminNotification({
      title: "New Driver Application",
      description: `${body.name} has applied to be a driver.`,
      type: 'driver',
      href: '/admin/dashboard/drivers'
    });

    return NextResponse.json({ success: true, applicationId: docRef.id }, { status: 201 });

  } catch (error: any) {
    console.error("API Error creating driver application:", error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
