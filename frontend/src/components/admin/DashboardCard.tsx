import React from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-50
        backdrop-filter backdrop-blur-lg
        border border-white border-opacity-40 dark:border-gray-700
        shadow-xl rounded-2xl
        overflow-hidden
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default DashboardCard;
