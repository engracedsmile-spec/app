export interface Trip {
  id: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance: string;
  vehicle: {
    type: 'standard' | 'executive' | 'vip';
    model: string;
    image: string;
    totalSeats: number;
    availableSeats: number;
    features: string[];
  };
  price: number;
  driver: {
    name: string;
    rating: number;
    experience: string;
    phone: string;
  };
  status: 'available' | 'full' | 'cancelled';
  route: string[];
}

export interface Booking {
  id: string;
  tripId: string;
  trip: Trip;
  passenger: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    emergencyContact: string;
    idNumber: string;
  };
  seats: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank' | 'ussd' | 'wallet';
  bookingDate: string;
  bookingStatus: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentReference: string;
  specialRequests?: string;
}

// Demo trips data with real Nigerian routes
export const demoTrips: Trip[] = [
  {
    id: 'TRP001',
    from: 'Lagos',
    to: 'Abuja',
    departureDate: '2024-01-15',
    departureTime: '06:00',
    arrivalTime: '14:30',
    duration: '8h 30min',
    distance: '756 km',
    vehicle: {
      type: 'standard',
      model: 'Toyota Sienna',
      image: '/sienna.webp',
      totalSeats: 8,
      availableSeats: 3,
      features: ['AC', 'WiFi', 'USB Charging', 'Entertainment', 'Refreshments']
    },
    price: 8500,
    driver: {
      name: 'Ibrahim Musa',
      rating: 4.8,
      experience: '8 years',
      phone: '+234 803 123 4567'
    },
    status: 'available',
    route: ['Lagos', 'Ibadan', 'Ilorin', 'Lokoja', 'Abuja']
  },
  {
    id: 'TRP002',
    from: 'Lagos',
    to: 'Abuja',
    departureDate: '2024-01-15',
    departureTime: '08:00',
    arrivalTime: '16:00',
    duration: '8h 00min',
    distance: '756 km',
    vehicle: {
      type: 'executive',
      model: 'Toyota Sienna Executive',
      image: '/sienna2.avif',
      totalSeats: 8,
      availableSeats: 5,
      features: ['Premium AC', 'WiFi', 'Leather Seats', 'Premium Audio', 'Snacks', 'Water']
    },
    price: 12000,
    driver: {
      name: 'Ahmed Ali',
      rating: 4.9,
      experience: '12 years',
      phone: '+234 805 987 6543'
    },
    status: 'available',
    route: ['Lagos', 'Ibadan', 'Ilorin', 'Lokoja', 'Abuja']
  },
  {
    id: 'TRP003',
    from: 'Lagos',
    to: 'Abuja',
    departureDate: '2024-01-15',
    departureTime: '10:00',
    arrivalTime: '17:30',
    duration: '7h 30min',
    distance: '756 km',
    vehicle: {
      type: 'vip',
      model: 'Toyota Sienna VIP',
      image: '/sienna3.avif',
      totalSeats: 7,
      availableSeats: 2,
      features: ['VIP Interior', 'Captain Chairs', 'Premium Service', 'Entertainment Suite', 'Meals', 'Personal Assistant']
    },
    price: 18000,
    driver: {
      name: 'John Okoro',
      rating: 5.0,
      experience: '15 years',
      phone: '+234 807 555 1234'
    },
    status: 'available',
    route: ['Lagos', 'Ibadan', 'Ilorin', 'Lokoja', 'Abuja']
  },
  {
    id: 'TRP004',
    from: 'Abuja',
    to: 'Lagos',
    departureDate: '2024-01-16',
    departureTime: '07:00',
    arrivalTime: '15:30',
    duration: '8h 30min',
    distance: '756 km',
    vehicle: {
      type: 'standard',
      model: 'Toyota Sienna',
      image: '/sienna.webp',
      totalSeats: 8,
      availableSeats: 6,
      features: ['AC', 'WiFi', 'USB Charging', 'Entertainment', 'Refreshments']
    },
    price: 8500,
    driver: {
      name: 'Samuel Adebayo',
      rating: 4.7,
      experience: '6 years',
      phone: '+234 809 876 5432'
    },
    status: 'available',
    route: ['Abuja', 'Lokoja', 'Ilorin', 'Ibadan', 'Lagos']
  },
  {
    id: 'TRP005',
    from: 'Lagos',
    to: 'Port Harcourt',
    departureDate: '2024-01-17',
    departureTime: '06:30',
    arrivalTime: '13:00',
    duration: '6h 30min',
    distance: '463 km',
    vehicle: {
      type: 'executive',
      model: 'Toyota Sienna Executive',
      image: '/sienna2.avif',
      totalSeats: 8,
      availableSeats: 4,
      features: ['Premium AC', 'WiFi', 'Leather Seats', 'Premium Audio', 'Snacks', 'Water']
    },
    price: 10000,
    driver: {
      name: 'Emmanuel Okafor',
      rating: 4.8,
      experience: '10 years',
      phone: '+234 806 321 9876'
    },
    status: 'available',
    route: ['Lagos', 'Benin City', 'Asaba', 'Port Harcourt']
  },
  {
    id: 'TRP006',
    from: 'Lagos',
    to: 'Kano',
    departureDate: '2024-01-18',
    departureTime: '05:00',
    arrivalTime: '17:00',
    duration: '12h 00min',
    distance: '1050 km',
    vehicle: {
      type: 'vip',
      model: 'Toyota Sienna VIP',
      image: '/sienna3.avif',
      totalSeats: 7,
      availableSeats: 1,
      features: ['VIP Interior', 'Captain Chairs', 'Premium Service', 'Entertainment Suite', 'Meals', 'Personal Assistant']
    },
    price: 22000,
    driver: {
      name: 'Aliyu Hassan',
      rating: 4.9,
      experience: '14 years',
      phone: '+234 808 147 2580'
    },
    status: 'available',
    route: ['Lagos', 'Ibadan', 'Ilorin', 'Abuja', 'Kaduna', 'Zaria', 'Kano']
  },
  {
    id: 'TRP007',
    from: 'Abuja',
    to: 'Kano',
    departureDate: '2024-01-19',
    departureTime: '08:00',
    arrivalTime: '14:30',
    duration: '6h 30min',
    distance: '356 km',
    vehicle: {
      type: 'standard',
      model: 'Toyota Sienna',
      image: '/sienna.webp',
      totalSeats: 8,
      availableSeats: 7,
      features: ['AC', 'WiFi', 'USB Charging', 'Entertainment', 'Refreshments']
    },
    price: 6500,
    driver: {
      name: 'Musa Ibrahim',
      rating: 4.6,
      experience: '7 years',
      phone: '+234 804 963 7410'
    },
    status: 'available',
    route: ['Abuja', 'Kaduna', 'Zaria', 'Kano']
  },
  {
    id: 'TRP008',
    from: 'Lagos',
    to: 'Ibadan',
    departureDate: '2024-01-20',
    departureTime: '09:00',
    arrivalTime: '11:30',
    duration: '2h 30min',
    distance: '128 km',
    vehicle: {
      type: 'executive',
      model: 'Toyota Sienna Executive',
      image: '/sienna2.avif',
      totalSeats: 8,
      availableSeats: 8,
      features: ['Premium AC', 'WiFi', 'Leather Seats', 'Premium Audio', 'Snacks', 'Water']
    },
    price: 4500,
    driver: {
      name: 'David Ogundimu',
      rating: 4.7,
      experience: '5 years',
      phone: '+234 802 741 8520'
    },
    status: 'available',
    route: ['Lagos', 'Ibadan']
  }
];

// Storage functions for bookings
export const getBookings = (): Booking[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('engraced_bookings');
  return stored ? JSON.parse(stored) : [];
};

export const saveBooking = (booking: Booking): void => {
  if (typeof window === 'undefined') return;
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem('engraced_bookings', JSON.stringify(bookings));
};

export const updateBooking = (bookingId: string, updates: Partial<Booking>): void => {
  if (typeof window === 'undefined') return;
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  if (index !== -1) {
    bookings[index] = { ...bookings[index], ...updates };
    localStorage.setItem('engraced_bookings', JSON.stringify(bookings));
  }
};

export const generateBookingId = (): string => {
  return 'BK' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
};

export const generatePaymentReference = (): string => {
  return 'PAY' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
};
