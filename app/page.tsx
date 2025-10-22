'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BookingForm from '@/components/booking/BookingForm';
import Header from '@/components/layout/Header';
import Image from 'next/image';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<boolean[]>(new Array(4).fill(false));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Comprehensive transportation hero images
  const heroImages = [
    {
      url: "/cars.jpg",
      alt: "Premium vehicle transportation services"
    },
    {
      url: "/flight.jpg",
      alt: "Flight booking and air travel services"
    },
    {
      url: "/logistics.jpg",
      alt: "Comprehensive logistics and cargo services"
    },
    {
      url: "/plane.jpg",
      alt: "Air travel and aviation services"
    }
  ];

  useEffect(() => {
    setIsClient(true);
    
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    
    updateTime(); // Set initial time
    const timer = setInterval(updateTime, 1000);
    
    // Preload hero images
    const preloadImages = async () => {
      if (typeof window === 'undefined') return;
      
      const imagePromises = heroImages.map((image) => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = image.url;
        });
      });

      try {
        await Promise.all(imagePromises);
        console.log('All hero images loaded successfully');
      } catch (error) {
        console.log('Some hero images failed to load:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    preloadImages();
    
    return () => clearInterval(timer);
  }, []);

  // Hero image rotation effect
  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(heroInterval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Header 
        title="Engraced Smile Logistics" 
        showLiveTime={true}
        variant="default"
      />
      
      {/* Professional Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Rotating Background Images */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-primary-900/70 z-10"></div>
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            {heroImages.map((image, index) => (
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ 
                  opacity: index === currentHeroImage ? 1 : 0,
                  scale: index === currentHeroImage ? 1 : 1.1
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                {isClient && imageLoadErrors[index] ? (
                  // Fallback placeholder for failed images
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🚗</div>
                      <p className="text-lg font-medium">Sienna Transport</p>
                      <p className="text-sm text-gray-300">{image.alt}</p>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    onLoad={() => {
                      console.log(`Successfully loaded image ${index + 1}: ${image.alt}`);
                    }}
                    onError={(e) => {
                      console.error(`Failed to load image ${index + 1}:`, image.url);
                      setImageLoadErrors(prev => {
                        const newErrors = [...prev];
                        newErrors[index] = true;
                        return newErrors;
                      });
                    }}
                  />
                )}
              </motion.div>
            ))}
            
            {/* Loading indicator for first load */}
            {!isLoaded && isClient && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Loading...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-6 text-center text-white">
          {/* Image Navigation & Info */}
          <div className="absolute top-8 right-8 hidden md:block">
            {/* Current Image Info */}
            <div className="text-right mb-3">
              <p className="text-white/80 text-sm">
                {currentHeroImage + 1} / {heroImages.length}
              </p>
              <p className="text-white/60 text-xs">
                {heroImages[currentHeroImage]?.alt}
              </p>
            </div>
            
            {/* Navigation Dots */}
            <div className="flex space-x-2 justify-end">
              {heroImages.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentHeroImage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentHeroImage 
                      ? 'bg-white scale-125 shadow-lg' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isClient && isLoaded ? 1 : 0, y: isClient && isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/20"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Nigeria's Leading Transportation & Logistics Company
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Transportation, Flights &</span>
              <span className="block text-primary-300 font-light">Logistics Solutions</span>
            </h1>
            
            <p className="text-lg md:text-xl mb-10 text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Experience comprehensive transportation solutions including premium vehicles, flight bookings, 
              and logistics services. Professional service, real-time tracking, and 24/7 customer support.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary-600 hover:bg-primary-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => window.location.href = '/booking'}
              >
                Book Your Journey
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-white/30 hover:border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                Explore Fleet
              </motion.button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/20"
            >
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-300">10K+</div>
                <div className="text-sm text-gray-300">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-300">50+</div>
                <div className="text-sm text-gray-300">Modern Vehicles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-300">24/7</div>
                <div className="text-sm text-gray-300">Customer Support</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 z-10">
          <motion.div
            className="absolute top-1/4 left-1/12 w-3 h-3 bg-primary-400 rounded-full opacity-60"
            animate={{ y: [0, -20, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 right-1/12 w-2 h-2 bg-white rounded-full opacity-40"
            animate={{ y: [0, -15, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/6 w-4 h-4 bg-primary-300 rounded-full opacity-30"
            animate={{ y: [0, -25, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>
      </section>



      {/* Vehicle Fleet Showcase */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-4">
                Our Fleet
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Premium Vehicle Collection
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from our carefully maintained fleet of modern vehicles, each designed for comfort, safety, and style.
              </p>
            </motion.div>
          </div>

          {/* Vehicle Cards */}
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
                image: "/sienna.jpg"
              },
              {
                title: "Toyota Sienna Executive",
                subtitle: "Premium Inter-State",
                price: "₦12,000",
                period: "per trip",
                capacity: "8 passengers",
                features: ["Premium Interior", "Enhanced AC", "Leather Seats", "Professional Service", "Extra Comfort"],
                badge: "Executive",
                image: "/sienna2.jpg"
              },
              {
                title: "Toyota Sienna VIP",
                subtitle: "Luxury Experience",
                price: "₦18,000",
                period: "per trip",
                capacity: "7 passengers",
                features: ["VIP Interior", "Captain Chairs", "Premium Service", "Entertainment Suite", "Maximum Comfort"],
                badge: "Premium",
                image: "/sienna3.jpg"
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
                {/* Vehicle Image */}
                <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
                      {vehicle.badge}
                    </span>
                  </div>
                  
                  {/* Capacity */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-xs font-medium text-gray-700">{vehicle.capacity}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{vehicle.title}</h3>
                    <p className="text-primary-600 font-medium">{vehicle.subtitle}</p>
                  </div>

                  {/* Features */}
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

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{vehicle.price}</span>
                      <span className="text-gray-500 ml-1">/{vehicle.period}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                      onClick={() => window.location.href = '/booking'}
                    >
                      Book Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Why Choose Our Fleet */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-lg"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Why Choose Our Fleet?
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Every vehicle in our fleet meets the highest standards of safety, comfort, and reliability.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: "🛡️",
                  title: "Safety Certified",
                  description: "Regular inspections and safety certifications"
                },
                {
                  icon: "🔧",
                  title: "Well Maintained",
                  description: "Professional maintenance and care"
                },
                {
                  icon: "👨‍✈️",
                  title: "Expert Drivers",
                  description: "Trained and experienced professionals"
                },
                {
                  icon: "📍",
                  title: "GPS Tracking",
                  description: "Real-time location monitoring"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

            {/* Flight Booking Section */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-4">
                Flight Services
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Book Your Flights with Confidence
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Experience seamless flight booking with competitive prices and excellent service. 
                We partner with major airlines to bring you the best deals for both domestic and international travel.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✈️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Domestic Flights</h3>
                    <p className="text-sm text-gray-600">All major Nigerian cities</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">International</h3>
                    <p className="text-sm text-gray-600">Worldwide destinations</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Best Prices</h3>
                    <p className="text-sm text-gray-600">Competitive rates guaranteed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🕐</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">24/7 Support</h3>
                    <p className="text-sm text-gray-600">Round-the-clock assistance</p>
                  </div>
                </div>
              </div>

               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg"
                 onClick={() => window.location.href = '/flight-booking'}
               >
                 Book Flight Now
               </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                 <Image
                   src="/flight.jpg"
                   alt="Flight booking services"
                   fill
                   className="object-cover"
                 />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Ready to Fly?</h3>
                  <p className="text-blue-200">Book your next adventure with us</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logistics Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                 <Image
                   src="/logistics.jpg"
                   alt="Logistics and cargo services"
                   fill
                   className="object-cover"
                 />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Logistics Solutions</h3>
                  <p className="text-green-200">Complete supply chain management</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="inline-block px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-medium mb-4">
                Logistics Services
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Complete Logistics Solutions
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Comprehensive logistics services for cargo transportation, warehousing, and supply chain management. 
                We handle everything from small packages to large shipments across Nigeria and beyond.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Cargo Transport</h3>
                    <p className="text-sm text-gray-600">Safe and secure delivery</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Warehousing</h3>
                    <p className="text-sm text-gray-600">Secure storage solutions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Supply Chain</h3>
                    <p className="text-sm text-gray-600">End-to-end management</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-time Tracking</h3>
                    <p className="text-sm text-gray-600">Monitor your shipments</p>
                  </div>
                </div>
              </div>

               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg"
                 onClick={() => window.location.href = '/logistics'}
               >
                 Get Logistics Quote
               </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              About Engraced Smile Logistics
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading transportation and logistics company in Nigeria, committed to excellence and customer satisfaction
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="prose prose-lg">
                <p className="text-gray-700 mb-6">
                  Since our establishment, Engraced Smile Logistics has been at the forefront of providing 
                  premium transportation services across Nigeria. We pride ourselves on our commitment to 
                  safety, comfort, and reliability.
                </p>
                <p className="text-gray-700 mb-6">
                  Our comprehensive range of services includes inter-state transportation with modern Sienna 
                  vehicles, luxury car rentals for special occasions, and seamless flight booking services 
                  for both domestic and international travel.
                </p>
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">10K+</div>
                    <div className="text-gray-600">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">50+</div>
                    <div className="text-gray-600">Vehicles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">15+</div>
                    <div className="text-gray-600">States Covered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">24/7</div>
                    <div className="text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <div className="bg-primary-50 rounded-lg p-6 border border-primary-100">
                  <div className="text-3xl mb-3">🚐</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Modern Fleet</h3>
                  <p className="text-gray-600 text-sm">Well-maintained vehicles with modern amenities</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Safety First</h3>
                  <p className="text-gray-600 text-sm">Rigorous safety protocols and trained drivers</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                  <div className="text-3xl mb-3">⭐</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Quality Service</h3>
                  <p className="text-gray-600 text-sm">Exceptional customer service and satisfaction</p>
                </div>
                <div className="bg-primary-50 rounded-lg p-6 border border-primary-100">
                  <div className="text-3xl mb-3">📍</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Wide Coverage</h3>
                  <p className="text-gray-600 text-sm">Serving major cities across Nigeria</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Booking Section */}
      <section id="booking" className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Book Your Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quick and easy booking for all your transportation needs
            </p>
          </motion.div>
          
          <BookingForm />
        </div>
      </section>

      {/* Real-Time Tracking Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-medium mb-4">
                Live Tracking
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Track Your Journey in Real-Time
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Monitor your vehicle's location, route progress, and estimated arrival time with our advanced GPS tracking system.
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Map Interface */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
                <div className="relative h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl overflow-hidden border-2 border-gray-200">
                  {/* Map Placeholder - Replace with actual map component */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <svg width="100%" height="100%" className="text-gray-400">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>
                    
                    {/* Animated Route */}
                    <svg className="absolute inset-0 w-full h-full">
                      <motion.path
                        d="M 50 300 Q 200 150 350 250"
                        stroke="#8b5cf6"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="10,5"
                        animate={{ strokeDashoffset: [0, -30] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                    </svg>
                    
                    {/* Vehicle Markers */}
                    <motion.div
                      className="absolute"
                      style={{ left: '15%', top: '75%' }}
                      animate={{ 
                        x: [0, 200, 0],
                        y: [0, -150, 0]
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-4 h-4 bg-white rounded-sm"></div>
                      </div>
                    </motion.div>
                    
                    {/* Location Pins */}
                    <div className="absolute top-4 left-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      A
                    </div>
                    <div className="absolute bottom-8 right-8 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      B
                    </div>
                  </div>
                  
                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md">
                    <div className="flex flex-col">
                      <button className="w-10 h-10 hover:bg-gray-50 rounded-t-lg flex items-center justify-center text-gray-600 border-b">+</button>
                      <button className="w-10 h-10 hover:bg-gray-50 rounded-b-lg flex items-center justify-center text-gray-600">-</button>
                    </div>
                  </div>
                  
                  {/* Live Status */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-4 min-w-48">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-900">Vehicle En Route</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div>Speed: 65 km/h</div>
                      <div>ETA: 25 minutes</div>
                      <div>Distance: 18.5 km</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Precise Location</h3>
                    <p className="text-gray-600">Get exact vehicle location with GPS accuracy within 3 meters.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Live ETA Updates</h3>
                    <p className="text-gray-600">Real-time arrival estimates based on current traffic conditions.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Route Optimization</h3>
                    <p className="text-gray-600">Smart routing to avoid traffic and find the fastest path.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zm-5-5h5l-5-5v5zm5-5h5l-5-5v5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Notifications</h3>
                    <p className="text-gray-600">Get notified about departure, arrival, and any route changes.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive transportation solutions tailored to your needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                title: 'Logistics & Cargo',
                description: 'Comprehensive logistics solutions for cargo transportation, warehousing, and supply chain management.',
                icon: '📦',
                features: ['Cargo Transport', 'Warehousing', 'Supply Chain', 'Real-time Tracking'],
                price: 'Competitive Rates',
                color: 'purple'
              },
              {
                id: 4,
                title: 'Luxury Car Rental',
                description: 'Premium executive and luxury vehicles for special occasions and business travel.',
                icon: '🚗',
                features: ['Premium Vehicles', 'Professional Drivers', 'Flexible Duration', 'Insurance Included'],
                price: 'From ₦25,000/day',
                color: 'orange'
              }
            ].map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
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
                <div className="text-xl font-bold text-primary-600">{service.price}</div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-2 rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-300"
                  onClick={() => window.location.href = '/booking'}
                >
                  Book Now
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your travel needs with our competitive and transparent pricing
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Economy Transport',
                description: 'Budget-friendly inter-state travel',
                price: '₦5,000',
                period: 'per trip',
                features: [
                  'Comfortable Sienna vehicles',
                  'Air conditioning',
                  'Professional drivers',
                  'Safety protocols',
                  'Basic refreshments'
                ],
                popular: false,
                color: 'primary'
              },
              {
                name: 'Premium Transport',
                description: 'Enhanced comfort and services',
                price: '₦8,500',
                period: 'per trip',
                features: [
                  'Luxury Sienna vehicles',
                  'WiFi connectivity',
                  'Premium refreshments',
                  'Priority boarding',
                  'Entertainment system',
                  '24/7 customer support'
                ],
                popular: true,
                color: 'accent'
              },
              {
                name: 'Luxury Car Rental',
                description: 'Executive and luxury vehicles',
                price: '₦25,000',
                period: 'per day',
                features: [
                  'Premium luxury vehicles',
                  'Professional chauffeur',
                  'Flexible scheduling',
                  'Full insurance coverage',
                  'VIP treatment',
                  'Airport transfers'
                ],
                popular: false,
                color: 'primary'
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white rounded-xl shadow-lg p-8 border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-accent-300 shadow-accent-100' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-accent-500 to-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary-600">{plan.price}</span>
                    <span className="text-gray-500 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-3">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-accent-600 to-primary-600 text-white hover:from-accent-700 hover:to-primary-700'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                  onClick={() => window.location.href = '/booking'}
                >
                  Book Now
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 bg-white rounded-xl p-8 shadow-lg"
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl mb-3">💳</div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Payment</h3>
                <p className="text-gray-600">Multiple payment options including card, bank transfer, and mobile money</p>
              </div>
              <div>
                <div className="text-3xl mb-3">🔄</div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy Cancellation</h3>
                <p className="text-gray-600">Free cancellation up to 24 hours before your trip</p>
              </div>
              <div>
                <div className="text-3xl mb-3">🎁</div>
                <h3 className="font-semibold text-gray-900 mb-2">Group Discounts</h3>
                <p className="text-gray-600">Special rates for group bookings and corporate clients</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
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

      {/* Testimonials Section */}
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
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from thousands of satisfied customers who trust us for their transportation needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Adebayo Johnson',
                role: 'Business Executive',
                content: 'Excellent service! The vehicles are always clean and comfortable. I use Engraced Smile Logistics for all my business trips between Lagos and Abuja.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
              },
              {
                name: 'Sarah Okafor',
                role: 'Teacher',
                content: 'Very reliable and professional. The drivers are courteous and always on time. I feel safe traveling with them, especially during night trips.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1494790108755-2616b75c88dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80'
              },
              {
                name: 'Michael Chinwe',
                role: 'Entrepreneur',
                content: 'The luxury car rental service is top-notch. Perfect for important business meetings and special occasions. Highly recommended!',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80'
              },
              {
                name: 'Fatima Abdullahi',
                role: 'Marketing Manager',
                content: 'Booking flights through their platform is so convenient. Great prices and excellent customer support. They handle everything professionally.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2088&q=80'
              },
              {
                name: 'David Okoro',
                role: 'Student',
                content: 'Affordable and comfortable transportation for students. The WiFi on board helps me study during long trips. Great value for money!',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80'
              },
              {
                name: 'Grace Emeka',
                role: 'Event Planner',
                content: 'They provide excellent group transportation for events. Well-coordinated and professional service. My clients are always satisfied.',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 mr-4 rounded-full overflow-hidden relative">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{testimonial.name}</h3>
                    <p className="text-primary-600 font-medium">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
                
                <blockquote className="text-gray-700 italic text-lg leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Customer Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">50K+</div>
              <div className="text-gray-600">Successful Trips</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">99.9%</div>
              <div className="text-gray-600">On-Time Performance</div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions or need assistance? Our team is here to help you 24/7
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">📞</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Phone</div>
                      <div className="text-gray-600">+234 801 234 5678</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">📧</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Email</div>
                      <div className="text-gray-600">info@engracedsmile.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">📍</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Office</div>
                      <div className="text-gray-600">Lagos, Nigeria</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">🕐</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Hours</div>
                      <div className="text-gray-600">24/7 Available</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                    onClick={() => window.location.href = '/booking'}
                  >
                    📱 Book a Trip
                  </button>
                  <button className="w-full text-left p-3 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors">
                    📍 Track Your Vehicle
                  </button>
                  <button className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                    💬 Live Chat Support
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>General Inquiry</option>
                    <option>Booking Support</option>
                    <option>Technical Issue</option>
                    <option>Complaint</option>
                    <option>Suggestion</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-accent-700 transition-all duration-300"
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile App Download Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Available on Mobile
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Get Our Mobile App
              </h2>
              <p className="text-lg md:text-xl text-primary-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                Experience seamless booking and tracking on your mobile device. 
                Download our app for instant access to all transportation services.
              </p>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Quick Booking</h3>
                  <p className="text-primary-200 text-sm">Book rides in seconds with our intuitive interface</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Live Tracking</h3>
                  <p className="text-primary-200 text-sm">Track your vehicle in real-time anywhere</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zm-5-5h5l-5-5v5zm5-5h5l-5-5v5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Push Notifications</h3>
                  <p className="text-primary-200 text-sm">Get instant updates about your journey</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Install Mobile App</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-white/30 hover:border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                >
                  View Features
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Engraced Smile Logistics 
              for their transportation needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold transition-colors"
                onClick={() => window.location.href = '/booking'}
              >
                Book Your Trip
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/contact'}
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative w-12 h-12">
                  <Image
                    src="/logo.png"
                    alt="Engraced Smile Logistics"
                    fill
                    className="object-contain"
                    sizes="48px"
                  />
                </div>
              </div>
              <p className="text-gray-400 mb-4">Premium transportation and logistics solutions</p>
              <div className="flex space-x-4">
                <span className="text-2xl">📱</span>
                <span className="text-2xl">📧</span>
                <span className="text-2xl">📞</span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Inter-State Transportation</li>
                <li>Flight Booking</li>
                <li>Luxury Car Rental</li>
                <li>Corporate Travel</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>24/7 Customer Service</li>
                <li>Live Chat</li>
                <li>Help Center</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Mobile App</h4>
              <p className="text-gray-400 mb-4">Download our mobile app</p>
              <button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-colors">
                Get Mobile App
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>© 2024 Engraced Smile Logistics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
