import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getPaymentSettings } from '@/lib/settings';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    
    if (!signature) {
      console.error('Paystack webhook: Missing signature');
      return NextResponse.json({ message: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const paymentSettings = await getPaymentSettings();
    const secretKey = paymentSettings?.paystackLiveSecretKey;
    
    if (!secretKey) {
      console.error('Paystack webhook: Secret key not configured');
      return NextResponse.json({ message: 'Webhook not configured' }, { status: 500 });
    }

    const hash = crypto.createHmac('sha512', secretKey).update(body).digest('hex');
    
    if (hash !== signature) {
      console.error('Paystack webhook: Invalid signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Paystack webhook received:', event.event, event.data.reference);

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(adminDb, event.data);
        break;
      case 'charge.failed':
        await handleFailedPayment(adminDb, event.data);
        break;
      case 'transfer.success':
        await handleSuccessfulTransfer(adminDb, event.data);
        break;
      case 'transfer.failed':
        await handleFailedTransfer(adminDb, event.data);
        break;
      default:
        console.log('Unhandled Paystack event:', event.event);
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
  } catch (error: any) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSuccessfulPayment(adminDb: any, data: any) {
  const { reference, amount, customer, metadata } = data;
  const amountInNaira = amount / 100; // Convert from kobo to naira
  
  console.log('Processing successful payment:', reference, amountInNaira);

  try {
    // Create payment transaction record
    const paymentRef = adminDb.collection('payments').doc(reference);
    
    const paymentData = {
      id: reference,
      reference: reference,
      amount: amountInNaira,
      status: 'success',
      customerEmail: customer?.email,
      customerName: customer?.first_name + ' ' + customer?.last_name,
      paymentMethod: 'paystack',
      type: 'payment',
      description: metadata?.description || 'Payment via Paystack',
      date: FieldValue.serverTimestamp(),
      metadata: metadata || {},
      rawData: data
    };

    await paymentRef.set(paymentData);

    // If this is a booking payment, update the booking status
    if (metadata?.bookingId) {
      const bookingRef = adminDb.collection('bookings').doc(metadata.bookingId);
      await bookingRef.update({
        status: 'Confirmed',
        paymentReference: reference,
        paymentDate: FieldValue.serverTimestamp()
      });
    }

    // If this is a wallet funding, update user wallet
    if (metadata?.userId && metadata?.type === 'wallet_funding') {
      const userRef = adminDb.collection('users').doc(metadata.userId);
      const transactionRef = adminDb.collection(`users/${metadata.userId}/transactions`).doc(reference);
      
      const batch = adminDb.batch();
      batch.update(userRef, {
        walletBalance: FieldValue.increment(amountInNaira)
      });
      batch.set(transactionRef, {
        id: reference,
        userId: metadata.userId,
        type: 'credit',
        amount: amountInNaira,
        description: 'Wallet funding via Paystack',
        date: FieldValue.serverTimestamp(),
        status: 'completed',
        reference: reference,
      });
      await batch.commit();
    }

    console.log('Payment processed successfully:', reference);
  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

async function handleFailedPayment(adminDb: any, data: any) {
  const { reference, amount, customer, metadata } = data;
  const amountInNaira = amount / 100;
  
  console.log('Processing failed payment:', reference, amountInNaira);

  try {
    // Create failed payment record
    const paymentRef = adminDb.collection('payments').doc(reference);
    
    const paymentData = {
      id: reference,
      reference: reference,
      amount: amountInNaira,
      status: 'failed',
      customerEmail: customer?.email,
      customerName: customer?.first_name + ' ' + customer?.last_name,
      paymentMethod: 'paystack',
      type: 'payment',
      description: metadata?.description || 'Failed payment via Paystack',
      date: FieldValue.serverTimestamp(),
      metadata: metadata || {},
      rawData: data
    };

    await paymentRef.set(paymentData);

    // If this is a booking payment, mark it as failed
    if (metadata?.bookingId) {
      const bookingRef = adminDb.collection('bookings').doc(metadata.bookingId);
      await bookingRef.update({
        status: 'Payment Failed',
        paymentReference: reference,
        paymentDate: FieldValue.serverTimestamp()
      });
    }

    console.log('Failed payment recorded:', reference);
  } catch (error) {
    console.error('Error processing failed payment:', error);
  }
}

async function handleSuccessfulTransfer(adminDb: any, data: any) {
  const { reference, amount, recipient, metadata } = data;
  const amountInNaira = amount / 100;
  
  console.log('Processing successful transfer:', reference, amountInNaira);

  try {
    // Create transfer record
    const transferRef = adminDb.collection('transfers').doc(reference);
    
    const transferData = {
      id: reference,
      reference: reference,
      amount: amountInNaira,
      status: 'success',
      recipientName: recipient?.name,
      recipientAccount: recipient?.account_number,
      recipientBank: recipient?.bank?.name,
      type: 'transfer',
      description: metadata?.description || 'Transfer via Paystack',
      date: FieldValue.serverTimestamp(),
      metadata: metadata || {},
      rawData: data
    };

    await transferRef.set(transferData);
    console.log('Transfer processed successfully:', reference);
  } catch (error) {
    console.error('Error processing successful transfer:', error);
  }
}

async function handleFailedTransfer(adminDb: any, data: any) {
  const { reference, amount, recipient, metadata } = data;
  const amountInNaira = amount / 100;
  
  console.log('Processing failed transfer:', reference, amountInNaira);

  try {
    // Create failed transfer record
    const transferRef = adminDb.collection('transfers').doc(reference);
    
    const transferData = {
      id: reference,
      reference: reference,
      amount: amountInNaira,
      status: 'failed',
      recipientName: recipient?.name,
      recipientAccount: recipient?.account_number,
      recipientBank: recipient?.bank?.name,
      type: 'transfer',
      description: metadata?.description || 'Failed transfer via Paystack',
      date: FieldValue.serverTimestamp(),
      metadata: metadata || {},
      rawData: data
    };

    await transferRef.set(transferData);
    console.log('Failed transfer recorded:', reference);
  } catch (error) {
    console.error('Error processing failed transfer:', error);
  }
}
