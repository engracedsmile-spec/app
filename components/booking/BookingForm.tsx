'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const BookingForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1,
    service: 'transportation'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.from || !formData.to) {
      alert('Please specify departure and destination locations');
      return;
    }

    if (formData.service === 'transportation') {
      // Redirect to trips page with search parameters
      const searchParams = new URLSearchParams({
        from: formData.from,
        to: formData.to,
        date: formData.date || '',
        passengers: formData.passengers.toString()
      });
      
      router.push(`/trips?${searchParams.toString()}`);
    } else {
      // For flight and luxury car bookings (future implementation)
      alert('Flight booking and luxury car rental will be available soon!');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* From Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.from}
                onChange={(e) => handleInputChange('from', e.target.value)}
                placeholder="Departure location"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-400"
                required
              />
            </div>
          </div>

          {/* To Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                placeholder="Destination"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-400"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-400"
                required
              />
            </div>
          </div>

          {/* Passengers */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passengers
            </label>
            <div className="relative">
              <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.passengers}
                onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white text-gray-400"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Service Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Service Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'transportation', label: 'Inter-State Transportation', icon: '🚐' },
              { value: 'flight', label: 'Flight Booking', icon: '✈️' },
              { value: 'luxury-car', label: 'Luxury Car Rental', icon: '🚗' }
            ].map((service) => (
              <label
                key={service.value}
                            className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.service === service.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
              >
                <input
                  type="radio"
                  name="service"
                  value={service.value}
                  checked={formData.service === service.value}
                  onChange={(e) => handleInputChange('service', e.target.value)}
                  className="sr-only"
                />
                <span className="text-2xl mr-3">{service.icon}</span>
                <span className="font-medium text-gray-900">{service.label}</span>
                {formData.service === service.value && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 text-lg shadow-lg"
          >
            <MagnifyingGlassIcon className="w-6 h-6" />
            <span>Search Available Trips</span>
          </motion.button>
        </div>

        {/* Quick Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need help? Call us at <a href="tel:+2348012345678" className="text-primary-600 hover:underline">+234 801 234 5678</a></p>
        </div>
      </form>
    </motion.div>
  );
};

export default BookingForm;
