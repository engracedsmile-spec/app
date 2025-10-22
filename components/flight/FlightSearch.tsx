'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  CalendarDaysIcon, 
  UserIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { airports, airlines, searchFlights, Flight } from '@/data/flights';

interface FlightSearchForm {
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  class: 'economy' | 'business' | 'first';
}


export default function FlightSearch() {
  // Initialize with today's date to prevent hydration mismatch
  const today = new Date().toISOString().split('T')[0];
  
  const [searchForm, setSearchForm] = useState<FlightSearchForm>({
    from: '',
    to: '',
    departureDate: today,
    returnDate: '',
    passengers: 1,
    tripType: 'round-trip',
    class: 'economy'
  });

  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (field: keyof FlightSearchForm, value: string | number) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const swapLocations = () => {
    setSearchForm(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const generateSearchResults = (): Flight[] => {
    return searchFlights(
      searchForm.from,
      searchForm.to,
      searchForm.departureDate,
      searchForm.returnDate,
      searchForm.passengers,
      searchForm.tripType,
      searchForm.class
    );
  };

  const handleSearch = async () => {
    if (!searchForm.from || !searchForm.to || !searchForm.departureDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const results = generateSearchResults();
      setSearchResults(results);
      setShowResults(true);
      setIsSearching(false);
    }, 1500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8"
      >
        <div className="flex items-center space-x-2 mb-6">
          <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Search Flights</h2>
        </div>

        <div className="space-y-6">
          {/* Trip Type */}
          <div className="flex space-x-2">
            {(['round-trip', 'one-way', 'multi-city'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleInputChange('tripType', type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  searchForm.tripType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'round-trip' ? 'Round Trip' : type === 'one-way' ? 'One Way' : 'Multi City'}
              </button>
            ))}
          </div>

          {/* From/To Locations */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                From
              </label>
              <select
                value={searchForm.from}
                onChange={(e) => handleInputChange('from', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="" className="text-gray-700">Select departure city</option>
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code} className="text-gray-900">
                    {airport.city} ({airport.code}) - {airport.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                To
              </label>
              <select
                value={searchForm.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="" className="text-gray-700">Select destination city</option>
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code} className="text-gray-900">
                    {airport.city} ({airport.code}) - {airport.name}
                  </option>
                ))}
              </select>
              <button
                onClick={swapLocations}
                className="absolute right-3 top-9 p-1 rounded-full hover:bg-gray-100 transition-colors"
                title="Swap locations"
              >
                <ArrowPathIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Dates and Passengers */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                Departure Date
              </label>
              <input
                type="date"
                value={searchForm.departureDate}
                onChange={(e) => handleInputChange('departureDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            
            {searchForm.tripType === 'round-trip' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                  Return Date
                </label>
                <input
                  type="date"
                  value={searchForm.returnDate}
                  onChange={(e) => handleInputChange('returnDate', e.target.value)}
                  min={searchForm.departureDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Passengers
              </label>
              <select
                value={searchForm.passengers}
                onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <option key={num} value={num} className="text-gray-900">
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <div className="flex space-x-2">
              {(['economy', 'business', 'first'] as const).map((classType) => (
                <button
                  key={classType}
                  onClick={() => handleInputChange('class', classType)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    searchForm.class === classType
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {classType === 'economy' ? 'Economy' : classType === 'business' ? 'Business' : 'First Class'}
                </button>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Searching Flights...</span>
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-5 h-5" />
                <span>Search Flights</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Search Results */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              Flight Results ({searchResults.length} flights found)
            </h3>
            <p className="text-gray-600 mt-1">
              {searchForm.from} → {searchForm.to} • {searchForm.departureDate} • {searchForm.passengers} passenger(s)
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {searchResults.map((flight, index) => (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      {/* Airline Info */}
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                          <span className="text-blue-600 font-bold text-sm">
                            {airlines.find(a => a.name === flight.airline)?.logo || '✈️'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{flight.airline}</p>
                        <p className="text-xs text-gray-500">{flight.flightNumber}</p>
                        <p className="text-xs text-gray-400">{flight.aircraft}</p>
                      </div>

                      {/* Flight Route */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{flight.departure.time}</p>
                            <p className="text-sm text-gray-600">{flight.departure.code}</p>
                            <p className="text-xs text-gray-500">{flight.departure.date}</p>
                          </div>
                          
                          <div className="flex-1 mx-4">
                            <div className="flex items-center justify-center">
                              <div className="flex-1 border-t-2 border-gray-300"></div>
                              <div className="px-3 py-1 bg-gray-100 rounded-full">
                                <ClockIcon className="w-4 h-4 text-gray-500" />
                                <span className="ml-1 text-xs text-gray-600">{flight.duration}</span>
                              </div>
                              <div className="flex-1 border-t-2 border-gray-300"></div>
                            </div>
                            {flight.stops > 0 && (
                              <p className="text-center text-xs text-orange-600 mt-1">
                                {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{flight.arrival.time}</p>
                            <p className="text-sm text-gray-600">{flight.arrival.code}</p>
                            <p className="text-xs text-gray-500">{flight.arrival.date}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price and Book Button */}
                  <div className="text-right ml-6">
                    <div className="mb-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(flight.price * searchForm.passengers)}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{flight.class}</p>
                      <p className="text-xs text-gray-400">
                        {searchForm.passengers} passenger{searchForm.passengers > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="mb-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        {flight.wifi && <span className="flex items-center"><span className="mr-1">📶</span>WiFi</span>}
                        {flight.entertainment && <span className="flex items-center"><span className="mr-1">🎬</span>Entertainment</span>}
                        {flight.power && <span className="flex items-center"><span className="mr-1">🔌</span>Power</span>}
                      </div>
                      <div className="mt-1">
                        <span>🍽️ {flight.meals}</span>
                        <span className="ml-2">🧳 {flight.baggage}</span>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg">
                      Select
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
