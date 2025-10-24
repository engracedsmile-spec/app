
import type { Role } from "@/lib/permissions";

export type Status = 'On Progress' | 'Delayed' | 'Cancelled' | 'Completed' | 'Boarding' | 'In Transit' | 'Pending';
export type UserStatus = 'Active' | 'Suspended' | 'Inactive' | 'Online' | 'Offline';

export type PaymentSettings = {
    paystackLivePublicKey?: string;
    paystackLiveSecretKey?: string;
}

export type SupportSettings = {
    quickReplies: string[];
}

export type VehicleShowcaseImage = {
    id: string;
    src: string;
    alt: string;
    hint?: string;
};

export type Terminal = {
    id: string;
    name: string;
    city: string;
    state: string;
    address: string;
    coordinates?: { lat: number; lng: number };
    heroImageUrl?: string;
    galleryImageUrls?: string[];
    facilities?: string[];
    status: 'active' | 'inactive';
};

export type Route = {
    id: string;
    name: string; // e.g. "Benin -> Lagos"
    originTerminalId: string;
    destinationTerminalId: string;
    baseFare: number;
    estimatedDuration?: string; // e.g. "5h 30m"
    reverseRouteId?: string;
};

export type Vehicle = {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    vin?: string | null;
    seats: number;
    status: 'Active' | 'Maintenance' | 'Inactive';
    primaryDriverId?: string | null;
    wifiId?: string | null;
    wifiPassword?: string;
}

export type ScheduledTripPassenger = {
    name: string;
    seat: number;
};

export type ScheduledTrip = {
    id: string;
    routeId: string;
    routeName: string;
    driverId: string;
    driverName: string;
    vehicleId: string;
    departureDate: string; // YYYY-MM-DD string
    departurePeriod: 'Morning' | 'Evening';
    status: 'Provisional' | 'Scheduled' | 'Boarding' | 'In Transit' | 'Completed' | 'Cancelled';
    bookedSeats: number[];
    passengers: ScheduledTripPassenger[];
    seatHolds?: { [seatNumber: string]: { userId: string | null; expires: any } };
    fare: number;
}

export type Booking = {
    id: string;
    price: number;
    status: Status;
    userId: string | null;
    type: 'passenger' | 'charter';
    createdAt: any; // serverTimestamp
    title: string;
    
    // Passenger specific
    passengerName: string;
    passengerPhone: string;
    passengers: string[];
    travelDate?: string;
    scheduledTripId?: string;
    seats?: number[];
    itemDescription?: string; // For passenger: Seat number(s)
    wifiPassword?: string;
    cancellationReason?: string;
    
    bookingType?: 'seat_booking' | 'charter';

    // Charter specific
    charterPackageId?: string;
    charterPackageName?: string;
    charterDays?: number;

    pickupAddress: string;
    destinationAddress: string;
    vehicleId?: string;

    rating?: {
        stars: number;
        feedback?: string;
    };
    
    discount?: {
        code: string;
        amount: number;
    };
};

export type DriverApplication = {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    driversLicenseNumber: string;
    licenseIssuingState: string;
    nin: string;
    licensePhotoDataUri?: string;
    driverPhotoDataUri?: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedAt: any;
}

export type Draft = {
  id: string;
  userId: string;
  type: 'passenger' | 'charter';
  lastSaved: any; // serverTimestamp
  formData: any;
  step: number;
};

export type Expense = {
    id: string;
    driverId: string;
    driverName: string;
    amount: number;
    type: 'Fuel' | 'Repair' | 'Toll' | 'Other';
    description: string;
    date: any; // serverTimestamp
    status: 'pending' | 'approved' | 'rejected';
    paymentMethod: 'Cash' | 'Transfer' | 'Unpaid';
}

export type FundRequest = {
    id: string;
    driverId: string;
    driverName: string;
    amount: number;
    reason: string;
    requestedAt: any;
    status: 'pending' | 'approved' | 'rejected';
}

export type Transaction = {
    id: string;
    userId: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: any; // serverTimestamp
    status: 'pending' | 'completed' | 'failed';
    reference?: string; // Paystack reference
}

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string; // Could be 'support' or a specific admin ID
    text: string;
    createdAt: any; // serverTimestamp
}

export type Conversation = {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    lastMessage: {
        text: string;
        createdAt: any;
    } | null;
    unreadByAdmin: number;
    unreadByUser: number;
}

export type AppNotification = {
    id: string;
    userId: string;
    title: string;
    description: string;
    createdAt: any; // serverTimestamp
    read: boolean;
    type: 'booking' | 'driver' | 'system' | 'wallet' | 'rating' | 'user';
    href?: string;
}

export type Promotion = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    href?: string;
    status: 'active' | 'inactive';
    createdAt: any;
    code?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    applicableTo: 'all' | 'seat_booking' | 'charter' | 'specific_package';
    applicablePackageId?: string;
}

export type CharterPackage = {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    dailyRate: number;
    features: {
        onboardWifi: boolean;
        bottledWater: boolean;
        snackPack: boolean;
        securityEscort: boolean;
        chargingPorts: boolean;
        music: boolean;
        customDecorations: boolean;
    };
    status: 'active' | 'inactive';
}

export type CharterContract = {
    id: string;
    bookingId: string;
    charterPackageId: string;
    quoteId: string;
    durationDays: number;
    priceBreakdown: {
        base: number;
        daily: number;
        distance: number;
        driverAllowance: number;
        addOns: number;
    };
    depositPaid: number;
    totalPaid: number;
    cancellationPolicy: string;
}

export type WiFi = {
    id: string;
    name: string; // SSID
    password: string;
}


export interface User {
  id: string; // This will be the Firebase UID
  userId: string; // This is a duplicate of ID, required by security rules
  name: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
  userType: 'customer' | 'driver' | 'admin';
  vehicle?: string; // Driver-specific
  licensePlate?: string; // Driver-specific
  role?: Role; // Admin-specific
  status: UserStatus;
  dateJoined: string;
  walletBalance?: number;
  walletPin?: string;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  fcmToken?: string;
  terminalId?: string;
  notificationSettings?: { [key: string]: boolean };
  [key: string]: any;
}

// We are re-exporting Role to be used in other files
export type { Role };
