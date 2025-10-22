'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trip, generateBookingId, generatePaymentReference, saveBooking, Booking } from '@/data/trips';
import {
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  WalletIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [passengerDetails, setPassengerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    idNumber: '',
    specialRequests: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'ussd' | 'wallet'>('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    bankCode: '',
    accountNumber: '',
    phoneNumber: ''
  });

  useEffect(() => {
    // Get trip data from session storage
    const tripData = sessionStorage.getItem('selected_trip');
    const passengerCountData = sessionStorage.getItem('passenger_count');
    
    if (!tripData) {
      router.push('/');
      return;
    }

    setSelectedTrip(JSON.parse(tripData));
    setPassengerCount(parseInt(passengerCountData || '1'));
  }, [router]);

  const totalAmount = selectedTrip ? selectedTrip.price * passengerCount : 0;

  const handlePassengerDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerDetails.firstName || !passengerDetails.lastName || !passengerDetails.email || !passengerDetails.phone) {
      alert('Please fill in all required passenger details');
      return;
    }
    setCurrentStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create booking
      const booking: Booking = {
        id: generateBookingId(),
        tripId: selectedTrip!.id,
        trip: selectedTrip!,
        passenger: passengerDetails,
        seats: passengerCount,
        totalAmount,
        paymentStatus: 'paid',
        paymentMethod,
        bookingDate: new Date().toISOString(),
        bookingStatus: 'confirmed',
        paymentReference: generatePaymentReference(),
        specialRequests: passengerDetails.specialRequests || undefined
      };

      // Save booking
      saveBooking(booking);

      // Redirect to success page
      sessionStorage.setItem('booking_success', JSON.stringify(booking));
      router.push('/booking/success');
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCardIcon, popular: true },
    { id: 'bank', name: 'Bank Transfer', icon: BanknotesIcon, popular: false },
    { id: 'ussd', name: 'USSD Code', icon: DevicePhoneMobileIcon, popular: true },
    { id: 'wallet', name: 'Digital Wallet', icon: WalletIcon, popular: false }
  ];

  if (!selectedTrip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-800"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                {[
                  { step: 1, title: 'Passenger Details', completed: currentStep > 1 },
                  { step: 2, title: 'Payment', completed: false }
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      item.completed 
                        ? 'bg-green-500 text-white'
                        : currentStep === item.step
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.completed ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        item.step
                      )}
                    </div>
                    <span className={`ml-3 font-medium ${
                      currentStep >= item.step ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {item.title}
                    </span>
                    {index < 1 && (
                      <div className={`w-24 h-1 mx-4 ${
                        item.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Passenger Details */}
            {currentStep === 1 && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handlePassengerDetailsSubmit}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Passenger Details</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={passengerDetails.firstName}
                      onChange={(e) => setPassengerDetails(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={passengerDetails.lastName}
                      onChange={(e) => setPassengerDetails(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={passengerDetails.email}
                      onChange={(e) => setPassengerDetails(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={passengerDetails.phone}
                      onChange={(e) => setPassengerDetails(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+234 XXX XXX XXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      value={passengerDetails.emergencyContact}
                      onChange={(e) => setPassengerDetails(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      placeholder="+234 XXX XXX XXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Number (NIN/Passport)
                    </label>
                    <input
                      type="text"
                      value={passengerDetails.idNumber}
                      onChange={(e) => setPassengerDetails(prev => ({ ...prev, idNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={passengerDetails.specialRequests}
                    onChange={(e) => setPassengerDetails(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Any special requirements or requests..."
                  />
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Continue to Payment
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h3>
                
                {/* Payment Method Selection */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="sr-only"
                      />
                      <method.icon className="w-6 h-6 text-purple-600 mr-3" />
                      <span className="font-medium text-gray-900">{method.name}</span>
                      {method.popular && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                {/* Payment Form */}
                <form onSubmit={handlePaymentSubmit}>
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cardNumber}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.expiryDate}
                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.cvv}
                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                            placeholder="123"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'ussd' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">USSD Payment Instructions:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                        <li>Dial *737*000*{totalAmount}*3210#</li>
                        <li>Enter your 4-digit PIN</li>
                        <li>Confirm payment details</li>
                        <li>You'll receive SMS confirmation</li>
                      </ol>
                    </div>
                  )}

                  {paymentMethod === 'bank' && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Bank Transfer Details:</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Account Name:</strong> Engraced Smile Logistics Ltd</p>
                        <p><strong>Account Number:</strong> 1234567890</p>
                        <p><strong>Bank:</strong> First Bank of Nigeria</p>
                        <p><strong>Amount:</strong> ₦{totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        `Pay ₦${totalAmount.toLocaleString()}`
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Trip Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Summary</h3>
              
              {/* Trip Image */}
              <div className="relative h-32 rounded-lg overflow-hidden mb-4">
                <Image
                  src={selectedTrip.vehicle.image}
                  alt={selectedTrip.vehicle.model}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Trip Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{selectedTrip.from} → {selectedTrip.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(selectedTrip.departureDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTrip.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium">{selectedTrip.vehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers:</span>
                  <span className="font-medium">{passengerCount}</span>
                </div>
              </div>

              <hr className="my-4" />

              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Price per passenger:</span>
                  <span>₦{selectedTrip.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Passengers:</span>
                  <span>× {passengerCount}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-purple-600">
                  <span>Total:</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center text-green-700">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  <span className="text-xs">Secure payment with 256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
