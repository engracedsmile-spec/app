'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getBookings, updateBooking, Booking } from '@/data/trips';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Load bookings from localStorage
    const loadedBookings = getBookings();
    setBookings(loadedBookings);
  }, [refreshTrigger]);

  const handleUpdateBookingStatus = (bookingId: string, status: string) => {
    updateBooking(bookingId, { bookingStatus: status as any });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUpdatePaymentStatus = (bookingId: string, status: string) => {
    updateBooking(bookingId, { paymentStatus: status as any });
    setRefreshTrigger(prev => prev + 1);
  };

  const stats = [
    { 
      title: 'Total Bookings', 
      value: bookings.length.toString(), 
      change: bookings.length > 0 ? `+${bookings.length}` : '0', 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Confirmed Bookings', 
      value: bookings.filter(b => b.bookingStatus === 'confirmed').length.toString(), 
      change: '+' + bookings.filter(b => b.bookingStatus === 'confirmed').length, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Total Revenue', 
      value: '₦' + bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString(), 
      change: '+₦' + bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString(), 
      color: 'bg-purple-500' 
    },
    { 
      title: 'Paid Bookings', 
      value: bookings.filter(b => b.paymentStatus === 'paid').length.toString(), 
      change: '+' + bookings.filter(b => b.paymentStatus === 'paid').length, 
      color: 'bg-orange-500' 
    },
  ];

  const recentBookings = [
    { id: 'BK001', customer: 'Adebayo Johnson', route: 'Lagos → Abuja', vehicle: 'Toyota Sienna', status: 'completed', amount: '₦8,500' },
    { id: 'BK002', customer: 'Sarah Okafor', route: 'Abuja → Kano', vehicle: 'Executive Sedan', status: 'in-progress', amount: '₦25,000' },
    { id: 'BK003', customer: 'Michael Chinwe', route: 'Lagos → Port Harcourt', vehicle: 'Luxury SUV', status: 'pending', amount: '₦35,000' },
    { id: 'BK004', customer: 'Fatima Abdullahi', route: 'Kano → Lagos', vehicle: 'Toyota Sienna', status: 'completed', amount: '₦12,000' },
  ];

  const vehicles = [
    { id: 'V001', model: 'Toyota Sienna 2022', plate: 'ABC-123-DE', status: 'active', driver: 'Ibrahim Musa', location: 'Lagos' },
    { id: 'V002', model: 'Mercedes E-Class', plate: 'XYZ-456-FG', status: 'maintenance', driver: 'John Doe', location: 'Abuja' },
    { id: 'V003', model: 'BMW X5 2023', plate: 'DEF-789-HI', status: 'active', driver: 'Ahmed Ali', location: 'Kano' },
    { id: 'V004', model: 'Toyota Sienna 2023', plate: 'GHI-012-JK', status: 'active', driver: 'Peter Obi', location: 'Port Harcourt' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ES</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, Administrator</span>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'bookings', label: 'Bookings' },
              { id: 'vehicles', label: 'Vehicles' },
              { id: 'drivers', label: 'Drivers' },
              { id: 'customers', label: 'Customers' },
              { id: 'reports', label: 'Reports' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg opacity-20`}></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Bookings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                  {recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customer}</p>
                        <p className="text-sm text-gray-600">{booking.route}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{booking.amount}</p>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fleet Status */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Fleet Status</h3>
                <div className="space-y-4">
                  {vehicles.slice(0, 5).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{vehicle.model}</p>
                        <p className="text-sm text-gray-600">{vehicle.plate} • {vehicle.driver}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{vehicle.location}</p>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">All Bookings ({bookings.length})</h3>
              <button 
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h4>
                <p className="text-gray-600">Bookings will appear here once customers start booking trips.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Booking ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Route</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Payment</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{booking.id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{booking.passenger.firstName} {booking.passenger.lastName}</p>
                            <p className="text-sm text-gray-600">{booking.passenger.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{booking.trip.from} → {booking.trip.to}</td>
                        <td className="py-3 px-4 text-sm">
                          <p>{new Date(booking.trip.departureDate).toLocaleDateString()}</p>
                          <p className="text-gray-600">{booking.trip.departureTime}</p>
                        </td>
                        <td className="py-3 px-4 font-medium">₦{booking.totalAmount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <select
                            value={booking.paymentStatus}
                            onChange={(e) => handleUpdatePaymentStatus(booking.id, e.target.value)}
                            className={`px-2 py-1 text-xs rounded-full border-0 ${
                              booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={booking.bookingStatus}
                            onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                            className={`px-2 py-1 text-xs rounded-full border-0 ${
                              booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                            <button className="text-green-600 hover:text-green-800 text-sm">Contact</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Vehicle Fleet</h3>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Add Vehicle
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">{vehicle.model}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Plate: {vehicle.plate}</p>
                  <p className="text-sm text-gray-600 mb-2">Driver: {vehicle.driver}</p>
                  <p className="text-sm text-gray-600 mb-4">Location: {vehicle.location}</p>
                  <div className="flex space-x-2">
                    <button className="text-purple-600 hover:text-purple-800 text-sm">Edit</button>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Track</button>
                    <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Other tabs can be added here */}
        {['drivers', 'customers', 'reports'].includes(activeTab) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h3>
            <p className="text-gray-600 mb-8">
              This section is under development. More features coming soon!
            </p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              Contact Developer
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
