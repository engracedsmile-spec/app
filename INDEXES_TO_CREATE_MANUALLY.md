# Indexes to Create Manually in Firebase Console

## Why Manual Creation?
Firebase CLI doesn't allow deploying single-field indexes via `firestore.indexes.json`. These need to be created manually in the Firebase Console.

## ✅ GOOD NEWS: Payments No Longer Need Index!
**Payments are now fetched directly from Paystack API** - no Firestore index needed! The code has been updated to fetch payments in real-time from Paystack, avoiding the index requirement entirely.

## Indexes to Create (if needed)

### 1. Transfers Index (if you use transfers from Firestore)
- **Collection ID**: `transfers`
- **Query scope**: Collection group
- **Fields**:
  - `date` (Descending)

### 3. Users ReferralCount Index (if needed)
- **Collection ID**: `users`
- **Query scope**: Collection group
- **Fields**:
  - `referralCount` (Descending)

### 4. ScheduledTrips DepartureDate Index (if needed)
- **Collection ID**: `scheduledTrips`
- **Query scope**: Collection group
- **Fields**:
  - `departureDate` (Descending)

## How to Create
1. Go to Firebase Console → Firestore Database → Indexes tab
2. Click "Create Index"
3. Fill in the details above
4. Click "Create"
5. Wait for index to build (can take minutes to hours)

## Alternative Solution
If you want to avoid creating indexes, see the modified query in `/src/app/api/admin/data/route.ts` that fetches without orderBy and sorts in memory.

