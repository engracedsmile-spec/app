import { NextResponse } from 'next/server';
import { getFirebaseAdmin, checkPermissions, verifyIdToken } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getPaymentSettings } from '@/lib/settings';

export async function POST(request: Request) {
  try {
    const { adminDb } = getFirebaseAdmin();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization token provided' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    await checkPermissions(idToken, 'managePayouts');

    const { startDate, endDate } = await request.json();
    
    if (!startDate || !endDate) {
      return NextResponse.json({ message: 'Start date and end date are required' }, { status: 400 });
    }

    const paymentSettings = await getPaymentSettings();
    const secretKey = paymentSettings?.paystackLiveSecretKey;
    
    if (!secretKey) {
      return NextResponse.json({ message: 'Paystack secret key not configured' }, { status: 500 });
    }

    console.log('Syncing Paystack payments from', startDate, 'to', endDate);

    // Fetch transactions from Paystack API
    const transactions = await fetchPaystackTransactions(secretKey, startDate, endDate);
    
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
          date: FieldValue.serverTimestamp(),
          originalDate: new Date(transaction.created_at),
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

async function fetchPaystackTransactions(secretKey: string, startDate: string, endDate: string) {
  const allTransactions: any[] = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const url = `https://api.paystack.co/transaction?perPage=${perPage}&page=${page}&from=${startDate}&to=${endDate}`;
      
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
