import React from 'react';
import { motion } from 'motion/react';

const NetworkBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
    <div className="absolute inset-0 bg-[#0B1E2D]"></div>
    <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-[#38A3A5]/5 rounded-full blur-[120px]"></div>
    <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 1200 600">
      <motion.path d="M-100,200 Q600,100 1300,200" fill="none" stroke="#76C893" strokeWidth="1" strokeDasharray="8,8"
        animate={{ strokeDashoffset: [0, -100] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} />
      <motion.path d="M-100,400 Q600,500 1300,400" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="8,8"
        animate={{ strokeDashoffset: [0, 100] }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} />
    </svg>
  </div>
);

export default NetworkBackground;
