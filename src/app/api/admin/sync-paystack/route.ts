import { NextResponse } from 'next/server';
import { getFirebaseAdmin, checkPermissions, verifyIdToken } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getPaymentSettings } from '@/lib/settings';

function formatDate(date: Date) {
  // Paystack expects YYYY-MM-DD
  return date.toISOString().split('T')[0];
}

export async function POST(request: Request) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    await checkPermissions(idToken, 'managePayouts');

    const body = await request.json().catch(() => ({}));
    let { startDate, endDate, fullSync, days }: { startDate?: string; endDate?: string; fullSync?: boolean; days?: number } = body || {};

    const today = new Date();
    const effectiveEndDate = endDate ? new Date(endDate) : today;

    let effectiveStartDate: Date;
    if (startDate) {
      effectiveStartDate = new Date(startDate);
    } else if (fullSync) {
      // Go far back to ensure we capture historical transactions
      effectiveStartDate = new Date('2015-01-01T00:00:00Z');
    } else if (typeof days === 'number' && !Number.isNaN(days) && days > 0) {
      effectiveStartDate = new Date(effectiveEndDate.getTime() - days * 24 * 60 * 60 * 1000);
    } else {
      // Default to 120 days history to cover ~4 months of transactions
      effectiveStartDate = new Date(effectiveEndDate.getTime() - 120 * 24 * 60 * 60 * 1000);
    }

    const startDateString = formatDate(effectiveStartDate);
    const endDateString = formatDate(effectiveEndDate);

    const paymentSettings = await getPaymentSettings();
    const secretKey = paymentSettings?.paystackLiveSecretKey;
    
    if (!secretKey) {
      return NextResponse.json({ message: 'Paystack secret key not configured' }, { status: 500 });
    }

    console.log('Syncing Paystack payments from', startDateString, 'to', endDateString, fullSync ? '(full sync enabled)' : '');

    // Fetch transactions from Paystack API
    const transactions = await fetchPaystackTransactions(secretKey, startDateString, endDateString);
    
    let syncedCount = 0;
    let skippedCount = 0;

    for (const transaction of transactions) {
      try {
        // Check if transaction already exists
        const existingPayment = await adminDb.collection('payments').doc(transaction.reference).get();
        
        if (existingPayment.exists) {
          skippedCount++;
          continue;
        }

        // Create payment record
        const paymentDate = transaction.paid_at ? new Date(transaction.paid_at) : transaction.created_at ? new Date(transaction.created_at) : new Date();
        const paymentData = {
          id: transaction.reference,
          reference: transaction.reference,
          amount: transaction.amount / 100, // Convert from kobo to naira
          status: transaction.status === 'success' ? 'success' : 'failed',
          customerEmail: transaction.customer?.email,
          customerName: transaction.customer?.first_name + ' ' + transaction.customer?.last_name,
          paymentMethod: 'paystack',
          type: 'payment',
          description: transaction.metadata?.description || 'Payment via Paystack',
          date: Timestamp.fromDate(paymentDate),
          originalDate: Timestamp.fromDate(paymentDate),
          metadata: transaction.metadata || {},
          rawData: transaction,
          syncedAt: FieldValue.serverTimestamp()
        };

        await adminDb.collection('payments').doc(transaction.reference).set(paymentData);

        // If this is a booking payment, try to update the booking
        if (transaction.metadata?.bookingId) {
          const bookingRef = adminDb.collection('bookings').doc(transaction.metadata.bookingId);
          const bookingDoc = await bookingRef.get();
          
          if (bookingDoc.exists && transaction.status === 'success') {
            await bookingRef.update({
              status: 'Confirmed',
              paymentReference: transaction.reference,
              paymentDate: FieldValue.serverTimestamp()
            });
          }
        }

        // If this is a wallet funding, update user wallet
        if (transaction.metadata?.userId && transaction.metadata?.type === 'wallet_funding' && transaction.status === 'success') {
          const userRef = adminDb.collection('users').doc(transaction.metadata.userId);
          const transactionRef = adminDb.collection(`users/${transaction.metadata.userId}/transactions`).doc(transaction.reference);
          
          const batch = adminDb.batch();
          batch.update(userRef, {
            walletBalance: FieldValue.increment(transaction.amount / 100)
          });
          batch.set(transactionRef, {
            id: transaction.reference,
            userId: transaction.metadata.userId,
            type: 'credit',
            amount: transaction.amount / 100,
            description: 'Wallet funding via Paystack',
            date: FieldValue.serverTimestamp(),
            status: 'completed',
            reference: transaction.reference,
          });
          await batch.commit();
        }

        syncedCount++;
        console.log('Synced payment:', transaction.reference, transaction.amount / 100);

      } catch (error) {
        console.error('Error syncing transaction:', transaction.reference, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Synced ${syncedCount} payments, skipped ${skippedCount} existing payments`,
      syncedCount,
      skippedCount,
      totalTransactions: transactions.length
    });

  } catch (error: any) {
    console.error("API Error in /api/admin/sync-paystack:", error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

async function fetchPaystackTransactions(secretKey: string, startDate?: string, endDate?: string) {
  const allTransactions: any[] = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const params = new URLSearchParams({
        perPage: perPage.toString(),
        page: page.toString(),
      });
      if (startDate) params.append('from', startDate);
      if (endDate) params.append('to', endDate);

      const url = `https://api.paystack.co/transaction?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Paystack API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.status || !data.data || data.data.length === 0) {
        break;
      }

      allTransactions.push(...data.data);
      
      if (data.data.length < perPage) {
        break;
      }
      
      page++;
    }

    console.log(`Fetched ${allTransactions.length} transactions from Paystack`);
    return allTransactions;

  } catch (error) {
    console.error('Error fetching Paystack transactions:', error);
    throw new Error('Failed to fetch transactions from Paystack');
  }
}
