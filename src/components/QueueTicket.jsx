import React from 'react';
import { Box } from '@mantine/core';
import { motion } from 'framer-motion';

export const DispenseMachine = ({ children }) => (
  <Box className="relative flex flex-col items-center w-full overflow-visible">
    {/* ส่วนหัวเครื่อง */}
    <Box className="relative z-30">
      <svg width="420" height="100" viewBox="0 0 500 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
        <path 
          d="M40 20C40 8.95431 48.9543 0 60 0H440C451.046 0 460 8.95431 460 20V80C460 91.0457 451.046 100 440 100H60C48.9543 100 40 91.0457 40 80V20Z" 
          fill="#E5E7EB" 
          stroke="#D1D5DB" 
          strokeWidth="2" 
        />
        <rect x="80" y="70" width="340" height="16" rx="8" fill="#1F2937" />
        <path d="M80 78H420" stroke="#111827" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
    </Box>

    {/* ✅ เพิ่มช่องนี้เข้าไป: เพื่อให้ตั๋วไหลออกมาจากเครื่องพิมพ์ */}
    <Box 
      className="relative z-20 w-full flex justify-center" 
      style={{ marginTop: '-20px', overflow: 'visible' }}
    >
      {children}
    </Box>
  </Box>
);

export const PaperTicketContent = ({ queueNumber, hospitalName }) => (
  <motion.div 
    initial={{ y: -250, opacity: 0 }} // เริ่มจากข้างบน
    animate={{ y: 0, opacity: 1 }}    // ไหลลงมา
    transition={{ 
      type: "spring", 
      stiffness: 60, 
      damping: 15,
      delay: 0.5 
    }}
  >
    <svg width="380" height="320" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
      <path 
        d="M75 0H425V320L400 300L375 320L350 300L325 320L300 300L275 320L250 300L225 320L200 300L175 320L150 300L125 320L100 300L75 320V0Z" 
        fill="#FFFFFF" 
        stroke="#F3F4F6" 
        strokeWidth="1" 
      />
      <text x="250" y="80" textAnchor="middle" fontWeight="900" style={{ fontSize: '18px', fill: '#94A3B8', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>คิวของคุณคือ</text>
      <text x="250" y="200" textAnchor="middle" fontWeight="900" className="italic" style={{ fontSize: '120px', fill: '#1E293B', letterSpacing: '-0.05em', fontFamily: 'sans-serif' }}>{queueNumber}</text>
      <line x1="100" y1="280" x2="400" y2="280" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="8 8" />
    </svg>
  </motion.div>
);