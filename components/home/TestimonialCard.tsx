'use client';

import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

interface TestimonialCardProps {
  testimonial: {
    id: number;
    name: string;
    role: string;
    content: string;
    rating: number;
    avatar: string;
  };
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group"
    >
      <div className="card p-6 h-full hover:shadow-large transition-all duration-300">
        {/* Rating */}
        <div className="flex items-center mb-4">
          {[...Array(testimonial.rating)].map((_, index) => (
            <StarIcon key={index} className="w-5 h-5 text-yellow-400" />
          ))}
        </div>

        {/* Content */}
        <blockquote className="text-gray-600 mb-6 leading-relaxed italic">
          "{testimonial.content}"
        </blockquote>

        {/* Author */}
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
            <p className="text-sm text-gray-500">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
