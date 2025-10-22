'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Header />
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Comprehensive transportation solutions tailored to your needs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                title: 'Inter-State Transportation',
                description: 'Comfortable and reliable transportation between states with our fleet of Sienna vehicles.',
                icon: '🚐',
                features: ['Air Conditioning', 'WiFi', 'Comfortable Seats', 'Real-time Tracking'],
                price: 'From ₦5,000',
                color: 'blue'
              },
              {
                id: 2,
                title: 'Flight Booking',
                description: 'Book domestic and international flights with competitive prices and excellent service.',
                icon: '✈️',
                features: ['Best Prices', '24/7 Support', 'Flexible Booking', 'Instant Confirmation'],
                price: 'Best Rates Guaranteed',
                color: 'green'
              },
              {
                id: 3,
                title: 'Luxury Car Rental',
                description: 'Premium executive and luxury vehicles for special occasions and business travel.',
                icon: '🚗',
                features: ['Premium Vehicles', 'Professional Drivers', 'Flexible Duration', 'Insurance Included'],
                price: 'From ₦25,000/day',
                color: 'purple'
              }
            ].map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-105"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="text-xl font-bold text-primary-600 mb-4">{service.price}</div>
                <Link
                  href="/booking"
                  className="block w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-accent-700 transition-all duration-300 text-center"
                >
                  Book Now
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Fleet Showcase */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-4">
                Our Services
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Comprehensive Transportation Solutions
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From premium vehicles to flight bookings and logistics services, we provide complete transportation solutions for all your needs.
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {[
              {
                title: "Toyota Sienna",
                subtitle: "Inter-State Travel",
                price: "₦5,000",
                period: "per trip",
                capacity: "8 passengers",
                features: ["Air Conditioning", "WiFi Connectivity", "Entertainment System", "Professional Driver", "Luggage Space"],
                badge: "Most Popular",
                image: "/sienna.webp"
              },
              {
                title: "Toyota Sienna Executive",
                subtitle: "Premium Inter-State",
                price: "₦12,000",
                period: "per trip",
                capacity: "8 passengers",
                features: ["Premium Interior", "Enhanced AC", "Leather Seats", "Professional Service", "Extra Comfort"],
                badge: "Executive",
                image: "/sienna2.avif"
              },
              {
                title: "Toyota Sienna VIP",
                subtitle: "Luxury Experience",
                price: "₦18,000",
                period: "per trip",
                capacity: "7 passengers",
                features: ["VIP Interior", "Captain Chairs", "Premium Service", "Entertainment Suite", "Maximum Comfort"],
                badge: "Premium",
                image: "/sienna3.avif"
              }
            ].map((vehicle, index) => (
              <motion.div
                key={vehicle.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
                      {vehicle.badge}
                    </span>
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-xs font-medium text-gray-700">{vehicle.capacity}</span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{vehicle.title}</h3>
                    <p className="text-primary-600 font-medium">{vehicle.subtitle}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {vehicle.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{vehicle.price}</span>
                      <span className="text-gray-500 ml-1">/{vehicle.period}</span>
                    </div>
                    <Link
                      href="/booking"
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Additional Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beyond transportation, we offer comprehensive travel and logistics solutions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Flight Booking Service */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="text-5xl mr-4">✈️</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Flight Booking</h3>
                  <p className="text-primary-600 font-medium">Domestic & International</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Book domestic and international flights with competitive prices and excellent service. 
                We partner with major airlines to bring you the best deals.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  Best Price Guarantee
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  24/7 Booking Support
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  Flexible Cancellation
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  Instant Confirmation
                </li>
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-semibold"
                onClick={() => window.location.href = '/booking'}
              >
                Book Flight
              </motion.button>
            </motion.div>

            {/* Logistics Service */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="text-5xl mr-4">📦</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Logistics & Cargo</h3>
                  <p className="text-primary-600 font-medium">Complete Supply Chain Solutions</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Comprehensive logistics solutions for cargo transportation, warehousing, 
                and supply chain management across Nigeria and beyond.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  Cargo Transportation
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  Warehousing Solutions
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  Supply Chain Management
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  Real-time Tracking
                </li>
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-semibold"
                onClick={() => window.location.href = '/contact'}
              >
                Get Quote
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the difference with our premium features and services
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Real-time Tracking', description: 'Track your vehicle in real-time with our advanced GPS system.', icon: '📍' },
              { title: 'Flexible Scheduling', description: 'Book your trips with flexible scheduling options.', icon: '📅' },
              { title: '24/7 Support', description: 'Round-the-clock customer support for all your needs.', icon: '🕐' },
              { title: 'Premium Service', description: 'Experience premium service with our professional team.', icon: '⭐' },
              { title: 'Secure Payments', description: 'Multiple secure payment options for your convenience.', icon: '🔒' },
              { title: 'Nationwide Coverage', description: 'Serving all major cities and states across Nigeria.', icon: '🌍' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Experience Our Services?
            </h2>
            <p className="text-xl text-accent-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Engraced Smile Logistics 
              for their transportation needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/booking"
                className="bg-white text-accent-600 hover:bg-accent-50 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Book Your Trip
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-accent-600 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
