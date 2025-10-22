'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';

interface ServiceCardProps {
  service: {
    id: number;
    title: string;
    description: string;
    icon: any;
    color: string;
    features: string[];
    price: string;
    link: string;
  };
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const colorClasses = {
    primary: 'bg-primary-50 border-primary-200 text-primary-700',
    accent: 'bg-accent-50 border-accent-200 text-accent-700',
    secondary: 'bg-secondary-50 border-secondary-200 text-secondary-700',
  };

  const iconColorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    accent: 'bg-accent-100 text-accent-600',
    secondary: 'bg-secondary-100 text-secondary-600',
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div className="card p-6 h-full border-2 hover:border-primary-300 transition-all duration-300">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${iconColorClasses[service.color as keyof typeof iconColorClasses]}`}>
          <service.icon className="w-8 h-8" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
            {service.title}
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {service.description}
          </p>

          {/* Features */}
          <div className="space-y-2 mb-6">
            {service.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-2"
              >
                <CheckIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-sm text-gray-600">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Price */}
          <div className="mb-6">
            <p className="text-lg font-semibold text-primary-600">
              {service.price}
            </p>
          </div>

          {/* CTA Button */}
          <Link
            href={service.link}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 transform hover:scale-105"
          >
            Learn More
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-accent-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default ServiceCard;
