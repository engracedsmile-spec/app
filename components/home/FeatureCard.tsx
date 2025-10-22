'use client';

import { motion } from 'framer-motion';

interface FeatureCardProps {
  feature: {
    id: number;
    title: string;
    description: string;
    icon: any;
    color: string;
  };
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  const iconColorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    accent: 'bg-accent-100 text-accent-600',
    secondary: 'bg-secondary-100 text-secondary-600',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group"
    >
      <div className="card p-6 h-full text-center hover:shadow-large transition-all duration-300">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${iconColorClasses[feature.color as keyof typeof iconColorClasses]} group-hover:scale-110 transition-transform duration-300`}>
          <feature.icon className="w-8 h-8" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
          {feature.title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
