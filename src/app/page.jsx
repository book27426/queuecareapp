"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Ticket, Clock, ShieldCheck } from 'lucide-react';
import { Navbar } from "@/components/Navbar";
import { Box, Text, Stack, Group, Title } from '@mantine/core';

export default function IndexPage() {
  const router = useRouter();
  const [activeQueueId, setActiveQueueId] = useState(null);

  useEffect(() => {
    const savedQueue = localStorage.getItem('user_queue_id');
    if (savedQueue) setActiveQueueId(savedQueue);
  }, []);

  return (
    <Box className="min-h-screen bg-[#EBEDF0] flex flex-col font-sans antialiased overflow-x-hidden">
      <Box className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
      
      <Navbar user={null} /> 

      <main className="flex-1 flex items-center justify-center p-6 lg:p-10 z-10">
        <Box 
          className="bg-white w-full max-w-5xl border-[3px] border-slate-900 p-8 md:p-14 lg:p-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative"
          style={{ borderRadius: '0px', boxShadow: '15px 15px 0px rgba(15, 23, 42, 0.05)' }}
        >
          <div className="w-full lg:w-[45%] relative group">
            <div className="absolute inset-0 bg-[#10B981] translate-x-3 translate-y-3 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-300" />
            <div className="relative aspect-square overflow-hidden border-[4px] border-slate-900 bg-slate-100 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000" 
                alt="Medical Care" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>

          <div className="w-full lg:w-[55%] space-y-8 lg:space-y-10">
            <div className="space-y-4">
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[0.85] tracking-tighter italic uppercase">
                Queue <span className="text-[#10B981]">Care</span> <br /> 
                <span className="text-3xl md:text-4xl text-slate-400">Simplified.</span>
              </h1>
              
              <div className="space-y-6 max-w-md">
                <p className="text-lg lg:text-xl font-bold text-slate-500 italic leading-snug">
                  Skip the waiting room. Experience real-time transparency in healthcare workstation.
                </p>
                
                <Stack gap="sm">
                  <FeatureItem icon={<Clock size={20} strokeWidth={3} />} text="Live wait-time estimates & updates" />
                  <FeatureItem icon={<ShieldCheck size={20} strokeWidth={3} />} text="Verified medical institutions only" />
                </Stack>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              
              <div className="relative group w-full sm:w-auto">
                <div className="absolute inset-0 bg-slate-900 translate-x-2 translate-y-2 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300" />
                <button 
                  onClick={() => router.push('/join')}
                  className="relative w-full px-10 py-4 bg-[#10B981] text-white text-lg font-black border-2 border-slate-900 uppercase group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 cursor-pointer flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  Join Queue <ArrowRight strokeWidth={4} size={20} />
                </button>
              </div>

              {activeQueueId && (
                <div className="relative group w-full sm:w-auto">
                  <div className="absolute inset-0 bg-slate-200 translate-x-1 translate-y-1 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300" />
                  <button 
                    onClick={() => router.push(`/myqueue`)}
                    className="relative w-full px-8 py-4 bg-white text-slate-900 text-lg font-black border-2 border-slate-900 uppercase group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 cursor-pointer flex items-center justify-center gap-3 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Ticket size={20} strokeWidth={3} className="text-[#10B981]" />
                    คิวของฉัน
                  </button>
                </div>
              )}

            </div>
          </div>
        </Box>
      </main>
    </Box>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <Group gap="sm">
      <div className="text-[#10B981] flex items-center justify-center">
        {icon}
      </div>
      <Text className="text-slate-700 font-black uppercase text-[11px] lg:text-[12px] tracking-[0.1em]">{text}</Text>
    </Group>
  );
}