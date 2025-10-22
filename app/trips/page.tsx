'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { demoTrips, Trip } from '@/data/trips';
import {
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function TripsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [searchCriteria, setSearchCriteria] = useState({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    date: searchParams.get('date') || '',
    passengers: parseInt(searchParams.get('passengers') || '1')
  });

  useEffect(() => {
    // Filter trips based on search criteria
    let filtered = demoTrips;

    if (searchCriteria.from) {
      filtered = filtered.filter(trip => 
        trip.from.toLowerCase().includes(searchCriteria.from.toLowerCase())
      );
    }

    if (searchCriteria.to) {
      filtered = filtered.filter(trip => 
        trip.to.toLowerCase().includes(searchCriteria.to.toLowerCase())
      );
    }

    if (searchCriteria.date) {
      filtered = filtered.filter(trip => trip.departureDate === searchCriteria.date);
    }

    // Filter by available seats
    filtered = filtered.filter(trip => 
      trip.vehicle.availableSeats >= searchCriteria.passengers &&
      trip.status === 'available'
    );

    setFilteredTrips(filtered);
  }, [searchCriteria]);

  const handleBookTrip = (trip: Trip) => {
    // Store trip data and redirect to booking
    sessionStorage.setItem('selected_trip', JSON.stringify(trip));
    sessionStorage.setItem('passenger_count', searchCriteria.passengers.toString());
    router.push('/booking/checkout');
  };

  const getVehicleBadgeColor = (type: string) => {
    switch (type) {
      case 'standard': return 'bg-blue-500';
      case 'executive': return 'bg-purple-500';
      case 'vip': return 'bg-gold-500 bg-gradient-to-r from-yellow-400 to-yellow-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-800"
            >
              ← Back to Home
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Available Trips</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h2>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">From:</span>
              <p className="font-medium">{searchCriteria.from || 'Any Location'}</p>
            </div>
            <div>
              <span className="text-gray-600">To:</span>
              <p className="font-medium">{searchCriteria.to || 'Any Destination'}</p>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <p className="font-medium">{searchCriteria.date || 'Any Date'}</p>
            </div>
            <div>
              <span className="text-gray-600">Passengers:</span>
              <p className="font-medium">{searchCriteria.passengers} {searchCriteria.passengers === 1 ? 'Passenger' : 'Passengers'}</p>
            </div>
          </div>
          <p className="text-purple-600 font-medium mt-4">
            {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''} found
          </p>
        </motion.div>

        {/* Trips List */}
        <div className="space-y-6">
          {filteredTrips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-12 text-center"
            >
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or check back later for more available trips.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Search Again
              </button>
            </motion.div>
          ) : (
            filteredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="grid lg:grid-cols-4 gap-6 p-6">
                  {/* Vehicle Image */}
                  <div className="lg:col-span-1">
                    <div className="relative h-48 lg:h-full min-h-[200px] rounded-lg overflow-hidden">
                      <Image
                        src={trip.vehicle.image}
                        alt={trip.vehicle.model}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 ${getVehicleBadgeColor(trip.vehicle.type)} text-white text-xs font-semibold rounded-full capitalize`}>
                          {trip.vehicle.type}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {trip.vehicle.availableSeats}/{trip.vehicle.totalSeats} seats
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Route and Time */}
                    <div>
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-lg">{trip.from}</span>
                        </div>
                        <div className="flex-1 border-t border-dashed border-gray-300 relative">
                          <span className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white px-2">
                            {trip.distance}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-5 h-5 text-red-500" />
                          <span className="font-semibold text-lg">{trip.to}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{new Date(trip.departureDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{trip.departureTime} - {trip.arrivalTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Duration: {trip.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{trip.vehicle.model}</h4>
                      <div className="flex flex-wrap gap-2">
                        {trip.vehicle.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                          >
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {trip.driver.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{trip.driver.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1">{trip.driver.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{trip.driver.experience} experience</span>
                        </div>
                      </div>
                    </div>

                    {/* Route Preview */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Route:</p>
                      <p className="text-sm text-gray-800">
                        {trip.route.join(' → ')}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Booking */}
                  <div className="lg:col-span-1 flex flex-col justify-between">
                    <div>
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-purple-600">
                          ₦{trip.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">per passenger</div>
                        {searchCriteria.passengers > 1 && (
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            Total: ₦{(trip.price * searchCriteria.passengers).toLocaleString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                          <span>Available Seats:</span>
                          <span className="font-medium">{trip.vehicle.availableSeats}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vehicle Type:</span>
                          <span className="font-medium capitalize">{trip.vehicle.type}</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBookTrip(trip)}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg"
                    >
                      Book This Trip
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
