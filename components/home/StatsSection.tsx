'use client';

import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  TruckIcon, 
  StarIcon, 
  GlobeAltIcon 
} from '@heroicons/react/24/outline';

const StatsSection = () => {
  const stats = [
    {
      id: 1,
      icon: UsersIcon,
      number: '50,000+',
      label: 'Happy Customers',
      color: 'primary'
    },
    {
      id: 2,
      icon: TruckIcon,
      number: '100+',
      label: 'Vehicles',
      color: 'accent'
    },
    {
      id: 3,
      icon: StarIcon,
      number: '4.9',
      label: 'Customer Rating',
      color: 'secondary'
    },
    {
      id: 4,
      icon: GlobeAltIcon,
      number: '36',
      label: 'States Covered',
      color: 'primary'
    }
  ];

  const iconColorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    accent: 'bg-accent-100 text-accent-600',
    secondary: 'bg-secondary-100 text-secondary-600',
  };

  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Trusted by thousands of customers across Nigeria for reliable transportation services
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${iconColorClasses[stat.color as keyof typeof iconColorClasses]}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-white mb-2"
              >
                {stat.number}
              </motion.div>
              <p className="text-blue-100 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
