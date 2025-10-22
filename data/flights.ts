export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  class: string;
  stops: number;
  aircraft: string;
  terminal?: string;
  gate?: string;
  baggage?: string;
  meals?: string;
  wifi?: boolean;
  entertainment?: boolean;
  power?: boolean;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}

export const airports: Airport[] = [
  { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria', timezone: 'WAT' },
  { code: 'ABV', name: 'Nnamdi Azikiwe International Airport', city: 'Abuja', country: 'Nigeria', timezone: 'WAT' },
  { code: 'KAN', name: 'Mallam Aminu Kano International Airport', city: 'Kano', country: 'Nigeria', timezone: 'WAT' },
  { code: 'PHC', name: 'Port Harcourt International Airport', city: 'Port Harcourt', country: 'Nigeria', timezone: 'WAT' },
  { code: 'ENU', name: 'Akanu Ibiam International Airport', city: 'Enugu', country: 'Nigeria', timezone: 'WAT' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK', timezone: 'GMT' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'UK', timezone: 'GMT' },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', timezone: 'EST' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', timezone: 'PST' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', timezone: 'GST' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', timezone: 'CET' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', timezone: 'CET' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', timezone: 'CET' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', timezone: 'TRT' },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', timezone: 'EET' },
  { code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', timezone: 'SAST' },
  { code: 'ACC', name: 'Kotoka International Airport', city: 'Accra', country: 'Ghana', timezone: 'GMT' },
  { code: 'DSS', name: 'Blaise Diagne International Airport', city: 'Dakar', country: 'Senegal', timezone: 'GMT' },
  { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', timezone: 'EAT' },
  { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', timezone: 'EAT' }
];

export const airlines = [
  { name: 'Arik Air', code: 'W3', logo: '🛩️' },
  { name: 'Air Peace', code: 'P4', logo: '✈️' },
  { name: 'Dana Air', code: '9J', logo: '🛫' },
  { name: 'Ethiopian Airlines', code: 'ET', logo: '🇪🇹' },
  { name: 'British Airways', code: 'BA', logo: '🇬🇧' },
  { name: 'Emirates', code: 'EK', logo: '🇦🇪' },
  { name: 'Lufthansa', code: 'LH', logo: '🇩🇪' },
  { name: 'Air France', code: 'AF', logo: '🇫🇷' },
  { name: 'KLM Royal Dutch Airlines', code: 'KL', logo: '🇳🇱' },
  { name: 'Turkish Airlines', code: 'TK', logo: '🇹🇷' },
  { name: 'EgyptAir', code: 'MS', logo: '🇪🇬' },
  { name: 'South African Airways', code: 'SA', logo: '🇿🇦' },
  { name: 'Kenya Airways', code: 'KQ', logo: '🇰🇪' },
  { name: 'Ghana Airways', code: 'GH', logo: '🇬🇭' },
  { name: 'Air Senegal', code: 'HC', logo: '🇸🇳' },
  { name: 'United Airlines', code: 'UA', logo: '🇺🇸' },
  { name: 'Delta Air Lines', code: 'DL', logo: '🇺🇸' },
  { name: 'American Airlines', code: 'AA', logo: '🇺🇸' }
];

const aircraftTypes = [
  'Boeing 737-800',
  'Boeing 777-300ER',
  'Boeing 787-8',
  'Airbus A320',
  'Airbus A330-300',
  'Airbus A350-900',
  'Boeing 747-400',
  'Boeing 737 MAX',
  'Airbus A321',
  'Boeing 767-300'
];

const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'No Meal'];
const baggageOptions = ['23kg', '32kg', '45kg', 'No Baggage'];

// Helper function to generate random time
const generateRandomTime = (): string => {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// Helper function to add hours to time
const addHoursToTime = (time: string, hours: number): string => {
  const [hour, minute] = time.split(':').map(Number);
  const newHour = (hour + hours) % 24;
  return `${newHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// Helper function to calculate flight duration
const calculateDuration = (from: string, to: string): { hours: number; minutes: number } => {
  // Mock flight durations based on typical routes
  const routeDurations: { [key: string]: { hours: number; minutes: number } } = {
    'LOS-ABV': { hours: 1, minutes: 30 },
    'ABV-LOS': { hours: 1, minutes: 30 },
    'LOS-KAN': { hours: 1, minutes: 45 },
    'KAN-LOS': { hours: 1, minutes: 45 },
    'LOS-PHC': { hours: 1, minutes: 15 },
    'PHC-LOS': { hours: 1, minutes: 15 },
    'ABV-KAN': { hours: 1, minutes: 20 },
    'KAN-ABV': { hours: 1, minutes: 20 },
    'LOS-LHR': { hours: 6, minutes: 30 },
    'LHR-LOS': { hours: 6, minutes: 30 },
    'LOS-JFK': { hours: 11, minutes: 15 },
    'JFK-LOS': { hours: 11, minutes: 15 },
    'LOS-DXB': { hours: 7, minutes: 45 },
    'DXB-LOS': { hours: 7, minutes: 45 },
    'ABV-LHR': { hours: 6, minutes: 45 },
    'LHR-ABV': { hours: 6, minutes: 45 },
    'KAN-LHR': { hours: 7, minutes: 15 },
    'LHR-KAN': { hours: 7, minutes: 15 }
  };

  const route = `${from}-${to}`;
  return routeDurations[route] || { hours: Math.floor(Math.random() * 8) + 1, minutes: Math.floor(Math.random() * 60) };
};

// Helper function to generate base price
const generateBasePrice = (from: string, to: string, classType: string): number => {
  // Domestic routes
  const domesticRoutes = ['LOS', 'ABV', 'KAN', 'PHC', 'ENU'];
  const isDomestic = domesticRoutes.includes(from) && domesticRoutes.includes(to);
  
  let basePrice: number;
  
  if (isDomestic) {
    basePrice = Math.floor(Math.random() * 50000) + 30000; // ₦30,000 - ₦80,000
  } else {
    // International routes
    const internationalBase = Math.floor(Math.random() * 400000) + 200000; // ₦200,000 - ₦600,000
    basePrice = internationalBase;
  }
  
  // Apply class multiplier
  switch (classType) {
    case 'business':
      return Math.floor(basePrice * 2.5);
    case 'first':
      return Math.floor(basePrice * 4);
    default:
      return basePrice;
  }
};

// Generate 200 mock flights
export const generateMockFlights = (): Flight[] => {
  const flights: Flight[] = [];
  const routes: Array<{ from: string; to: string }> = [];
  
  // Generate all possible routes
  airports.forEach(fromAirport => {
    airports.forEach(toAirport => {
      if (fromAirport.code !== toAirport.code) {
        routes.push({ from: fromAirport.code, to: toAirport.code });
      }
    });
  });

  // Generate flights for each route
  routes.forEach((route, routeIndex) => {
    const numFlightsPerRoute = Math.floor(Math.random() * 4) + 2; // 2-5 flights per route
    
    for (let i = 0; i < numFlightsPerRoute; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const aircraft = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
      const departureTime = generateRandomTime();
      const duration = calculateDuration(route.from, route.to);
      const arrivalTime = addHoursToTime(departureTime, duration.hours + duration.minutes / 60);
      
      const fromAirport = airports.find(a => a.code === route.from)!;
      const toAirport = airports.find(a => a.code === route.to)!;
      
      // Generate different classes for the same flight
      ['economy', 'business', 'first'].forEach((classType, classIndex) => {
        const flightId = `flight-${routeIndex}-${i}-${classIndex}`;
        const stops = Math.random() < 0.3 ? Math.floor(Math.random() * 2) + 1 : 0; // 30% chance of stops
        const price = generateBasePrice(route.from, route.to, classType);
        
        flights.push({
          id: flightId,
          airline: airline.name,
          flightNumber: `${airline.code}${Math.floor(Math.random() * 9999) + 100}`,
          departure: {
            airport: fromAirport.name,
            code: fromAirport.code,
            time: departureTime,
            date: new Date().toISOString().split('T')[0] // Today's date as default
          },
          arrival: {
            airport: toAirport.name,
            code: toAirport.code,
            time: arrivalTime,
            date: new Date().toISOString().split('T')[0]
          },
          duration: `${duration.hours}h ${duration.minutes}m`,
          price: price,
          class: classType,
          stops: stops,
          aircraft: aircraft,
          terminal: `T${Math.floor(Math.random() * 3) + 1}`,
          gate: `G${Math.floor(Math.random() * 50) + 1}`,
          baggage: baggageOptions[Math.floor(Math.random() * baggageOptions.length)],
          meals: mealOptions[Math.floor(Math.random() * mealOptions.length)],
          wifi: Math.random() < 0.7,
          entertainment: Math.random() < 0.8,
          power: Math.random() < 0.6
        });
      });
    }
  });

  return flights.slice(0, 200); // Return exactly 200 flights
};

// Pre-generated flight data
export const mockFlights: Flight[] = generateMockFlights();

// Helper function to search flights
export const searchFlights = (
  from: string,
  to: string,
  departureDate: string,
  returnDate?: string,
  passengers: number = 1,
  tripType: 'round-trip' | 'one-way' | 'multi-city' = 'round-trip',
  classType: 'economy' | 'business' | 'first' = 'economy'
): Flight[] => {
  return mockFlights.filter(flight => {
    const matchesRoute = flight.departure.code === from && flight.arrival.code === to;
    const matchesDate = flight.departure.date === departureDate;
    const matchesClass = flight.class === classType;
    
    return matchesRoute && matchesDate && matchesClass;
  }).sort((a, b) => a.price - b.price);
};

// Helper function to get popular routes
export const getPopularRoutes = (): Array<{ from: string; to: string; count: number }> => {
  const routeCounts: { [key: string]: number } = {};
  
  mockFlights.forEach(flight => {
    const route = `${flight.departure.code}-${flight.arrival.code}`;
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });
  
  return Object.entries(routeCounts)
    .map(([route, count]) => {
      const [from, to] = route.split('-');
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

// Helper function to get cheapest flights
export const getCheapestFlights = (limit: number = 10): Flight[] => {
  return [...mockFlights]
    .sort((a, b) => a.price - b.price)
    .slice(0, limit);
};

// Helper function to get flights by airline
export const getFlightsByAirline = (airlineName: string): Flight[] => {
  return mockFlights.filter(flight => flight.airline === airlineName);
};

// Helper function to get domestic vs international flights
export const getFlightStats = () => {
  const domesticAirports = ['LOS', 'ABV', 'KAN', 'PHC', 'ENU'];
  
  const domestic = mockFlights.filter(flight => 
    domesticAirports.includes(flight.departure.code) && 
    domesticAirports.includes(flight.arrival.code)
  ).length;
  
  const international = mockFlights.length - domestic;
  
  return { domestic, international, total: mockFlights.length };
};
