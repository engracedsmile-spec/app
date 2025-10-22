'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bars3Icon, 
  XMarkIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  title?: string;
  showLiveTime?: boolean;
  variant?: 'default' | 'logistics' | 'car-booking' | 'flight-booking';
}

export default function Header({ 
  title = "Engraced Smile Logistics", 
  showLiveTime = false,
  variant = 'default'
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const pathname = usePathname();

  // Live time update effect
  useEffect(() => {
    if (!showLiveTime) return;
    
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    return () => clearInterval(timer);
  }, [showLiveTime]);

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'logistics':
        return {
          borderColor: 'border-green-100',
          hoverColor: 'hover:text-green-600',
          buttonGradient: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
        };
      case 'car-booking':
        return {
          borderColor: 'border-primary-100',
          hoverColor: 'hover:text-primary-600',
          buttonGradient: 'from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
        };
      case 'flight-booking':
        return {
          borderColor: 'border-blue-100',
          hoverColor: 'hover:text-blue-600',
          buttonGradient: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        };
      default:
        return {
          borderColor: 'border-primary-100',
          hoverColor: 'hover:text-primary-600',
          buttonGradient: 'from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
        };
    }
  };

  const styles = getVariantStyles();

  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/flight-booking', label: 'Flight Booking' },
    { href: '/car-booking', label: 'Car Booking' },
    { href: '/logistics', label: 'Logistics' },
    { href: '/trips', label: 'Trips' },
    { href: '/contact', label: 'Contact' }
  ];

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className={`bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b ${styles.borderColor}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12">
              <Image
                src="/logo.png"
                alt="Engraced Smile Logistics"
                fill
                className="object-contain"
                sizes="48px"
                priority
              />
            </div>
            {showLiveTime && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Live: {currentTime}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors font-medium ${
                  isActivePath(item.href)
                    ? 'text-primary-600 font-semibold'
                    : `text-gray-700 ${styles.hoverColor}`
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <button className={`bg-gradient-to-r ${styles.buttonGradient} text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium shadow-lg`}>
              Download App
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4 pt-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors font-medium py-2 ${
                    isActivePath(item.href)
                      ? 'text-primary-600 font-semibold'
                      : `text-gray-700 ${styles.hoverColor}`
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* Mobile CTA Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className={`w-full bg-gradient-to-r ${styles.buttonGradient} text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-lg`}>
                Download App
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}