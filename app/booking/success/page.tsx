'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Booking } from '@/data/trips';
import {
  CheckCircleIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CreditCardIcon,
  PrinterIcon,
  ShareIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function BookingSuccessPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    // Get booking data from session storage
    const bookingData = sessionStorage.getItem('booking_success');
    
    if (!bookingData) {
      router.push('/');
      return;
    }

    setBooking(JSON.parse(bookingData));
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!booking) return;

    const shareData = {
      title: 'My Trip Booking - Engraced Smile Logistics',
      text: `I just booked a trip from ${booking.trip.from} to ${booking.trip.to} with Engraced Smile Logistics!`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Booking details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircleIcon className="w-16 h-16 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your trip has been successfully booked. You'll receive a confirmation email shortly with all the details.
          </p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">Trip Confirmation</h2>
                <p className="text-primary-100">Booking ID: {booking.id}</p>
                <p className="text-primary-100">Payment Reference: {booking.paymentReference}</p>
              </div>
              <div className="text-right">
                <p className="text-primary-100">Booking Date</p>
                <p className="font-semibold">{new Date(booking.bookingDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Trip Information */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Trip Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Details</h3>
                
                {/* Route */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">{booking.trip.from}</span>
                  </div>
                  <div className="flex-1 border-t border-dashed border-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5 text-red-500" />
                    <span className="font-semibold">{booking.trip.to}</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(booking.trip.departureDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departure Time:</span>
                    <span className="font-medium">{booking.trip.departureTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arrival Time:</span>
                    <span className="font-medium">{booking.trip.arrivalTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{booking.trip.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{booking.trip.distance}</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Vehicle & Driver */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle & Driver</h3>
                
                {/* Vehicle Image */}
                <div className="relative h-32 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={booking.trip.vehicle.image}
                    alt={booking.trip.vehicle.model}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">{booking.trip.vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{booking.trip.vehicle.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver:</span>
                    <span className="font-medium">{booking.trip.driver.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium">⭐ {booking.trip.driver.rating}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{booking.trip.driver.experience}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="border-t pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Passenger Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{booking.passenger.firstName} {booking.passenger.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{booking.passenger.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{booking.passenger.phone}</span>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passengers:</span>
                    <span className="font-medium">{booking.seats}</span>
                  </div>
                  {booking.passenger.emergencyContact && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emergency Contact:</span>
                      <span className="font-medium">{booking.passenger.emergencyContact}</span>
                    </div>
                  )}
                  {booking.passenger.idNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Number:</span>
                      <span className="font-medium">{booking.passenger.idNumber}</span>
                    </div>
                  )}
                </div>
              </div>
              {booking.specialRequests && (
                <div className="mt-4">
                  <span className="text-gray-600 text-sm">Special Requests:</span>
                  <p className="font-medium text-sm mt-1">{booking.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Price per passenger:</span>
                    <span>₦{booking.trip.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of passengers:</span>
                    <span>× {booking.seats}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Paid:</span>
                    <span className="text-primary-600">₦{booking.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Payment Status:</span>
                    <span className="font-medium capitalize">{booking.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium capitalize">{booking.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <PrinterIcon className="w-5 h-5" />
            <span>Print Ticket</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
            <span>Share</span>
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <span>Book Another Trip</span>
          </button>
        </motion.div>

        {/* Important Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-blue-50 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-blue-900 mb-4">Important Information</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Before Your Trip:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Arrive at the departure point 30 minutes early</li>
                <li>Bring a valid ID (NIN, Driver's License, or Passport)</li>
                <li>Keep your booking confirmation handy</li>
                <li>Pack light refreshments for long journeys</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Need Help?</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4" />
                  <span>Call: +234 801 234 5678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>Email: support@engraced.com</span>
                </div>
                <p className="text-xs mt-2">Customer support is available 24/7</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
