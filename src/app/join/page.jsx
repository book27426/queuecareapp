"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Container, 
  TextInput, 
  SimpleGrid, 
  Box, 
  Text, 
  Title, 
  Paper,
  Group,
  Stack
} from '@mantine/core';
import { Activity, Search, Clock, MapPin, ChevronRight } from 'lucide-react';

export default function JoinQueuePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const hospitals = [
    { 
      id: 1, 
      name: "กระทรวงสาธารณสุข", 
      status: "OPEN",
      wait: "15 min",
      color: "#006633", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Ministry_of_Public_Health_Thailand_Logo.png" 
    },
    { 
      id: 2, 
      name: "โรงพยาบาลปทุมธานี", 
      status: "OPEN",
      wait: "45 min",
      color: "#ed1c24", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Red_Cross_icon.svg/1024px-Red_Cross_icon.svg.png" 
    }
  ];

  return (
    <Box className="min-h-screen bg-[#EBEDF0] flex flex-col font-sans selection:bg-health-green/20">
      
      {/* 1. ARCHITECTURAL NAVBAR */}
      <nav className="h-16 px-6 lg:px-32 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-50">
        <Group gap="xs">
          <Box className="w-8 h-8 bg-health-green rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="text-white" size={20} strokeWidth={3} />
          </Box>
          <Text className="text-xl font-black tracking-tighter italic text-slate-900 uppercase">QueueCare</Text>
        </Group>
      </nav>

      {/* 2. THE WORKSPACE SLAB */}
      <Container size="xl" className="flex-1 flex items-center justify-center py-6 lg:py-8 w-full">
        <Paper 
          radius={40} 
          p={{ base: 30, lg: 60 }} 
          withBorder 
          className="bg-white w-full min-h-[75vh] flex flex-col gap-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] border-gray-100"
        >
          {/* HEADER SECTION */}
          <Group justify="space-between" align="center" className="border-b-2 border-gray-50 pb-6">
            <Stack gap={0}>
              <Title order={1} className="text-3xl lg:text-4xl font-black text-[#1A1C1E] tracking-tight">Select Institution</Title>
              <Text className="text-sm lg:text-base font-bold text-slate-400 italic">Join the live queue at your preferred facility.</Text>
            </Stack>

            {/* SCALED SEARCH BAR */}
            <Box className="relative group w-full lg:w-[320px]">
              <Box className="absolute inset-0 bg-gray-100 rounded-xl translate-x-1 translate-y-1 group-focus-within:translate-x-1.5 group-focus-within:translate-y-1.5 transition-transform" />
              <TextInput
                size="md"
                radius="md"
                placeholder="Search"
                leftSection={<Search size={18} strokeWidth={4} className="text-slate-400" />}
                styles={{
                  input: {
                    backgroundColor: '#F3F4F6',
                    border: 'none',
                    fontWeight: 900,
                    height: '48px',
                  }
                }}
              />
            </Box>
          </Group>

          {/* HYBRID GRID */}
          {/* Mobile: 1 column (Horizontal Rectangles) | Desktop: 4 columns (Vertical Cards) */}
          <SimpleGrid cols={{ base: 1, lg: 4 }} spacing={30}>
            {hospitals.map((hospital) => (
              <Link key={hospital.id} href={`/join/${hospital.id}`} className="relative group block">
                
                {/* 45° LIFT - */}
                <Box className="absolute inset-0 bg-black/5 rounded-3xl translate-x-2 translate-y-2 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300 ease-out" />
                
                {/* RESPONSIVE CARD FACE: Rectangle (Mobile) -> Vertical (Desktop) */}
                <Box 
                  className="relative h-full w-full bg-white border-2 border-gray-50 rounded-3xl p-5 flex flex-row lg:flex-col gap-5 transition-transform duration-300 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1 active:translate-x-1 active:translate-y-1 shadow-sm"
                >
                  {/* Logo Container: Smaller on mobile row */}
                  <Box className="w-20 h-20 lg:w-full lg:aspect-square bg-white border border-gray-50 rounded-2xl p-3 flex items-center justify-center shadow-inner shrink-0 lg:mb-2">
                    <img src={hospital.logo} alt="Logo" className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                  </Box>

                  {/* Content Area */}
                  <Stack gap={2} className="flex-1 justify-center lg:justify-start">
                    <Group justify="space-between" wrap="nowrap">
                      <Text className="text-base lg:text-lg font-black text-slate-900 leading-tight tracking-tight line-clamp-1 lg:line-clamp-2">
                        {hospital.name}
                      </Text>
                      {/* Status dot for mobile / tag for desktop */}
                      <Box 
                        className="px-2 lg:px-3 py-1 rounded-full text-[8px] lg:text-[9px] font-black tracking-widest uppercase shrink-0"
                        style={{ backgroundColor: `${hospital.color}10`, color: hospital.color }}
                      >
                        {hospital.status}
                      </Box>
                    </Group>
                    
                    <Group gap={4} className="text-slate-400 font-bold text-[10px] lg:text-[11px]">
                      <MapPin size={10} strokeWidth={3} />
                      Pathum Thani
                    </Group>

                    {/* METRIC BAR: Embedded in the row for mobile */}
                    <Box className="p-2.5 rounded-xl bg-[#F8FAFC] border border-gray-50 flex items-center justify-between mt-2 lg:mt-4">
                      <Group gap={6}>
                        <Clock size={12} className="text-health-green" strokeWidth={3} />
                        <Text className="text-[9px] font-black uppercase tracking-widest text-slate-400">Wait</Text>
                      </Group>
                      <Text className="text-sm lg:text-base font-black text-slate-900">{hospital.wait}</Text>
                    </Box>
                  </Stack>

                  {/* Mobile-only Chevron to signal clickability */}
                  <Box className="lg:hidden flex items-center text-slate-300">
                    <ChevronRight size={20} />
                  </Box>
                </Box>
              </Link>
            ))}

            {/* REQUEST PLACEHOLDER */}
            <Box className="border-4 border-dashed border-gray-50 rounded-3xl flex flex-row lg:flex-col items-center justify-center p-6 lg:p-10 opacity-40 hover:opacity-100 transition-opacity cursor-pointer group gap-4">
              <Activity size={24} className="text-gray-300 group-hover:scale-110 transition-transform" />
              <Text className="text-gray-400 font-black uppercase text-[10px] tracking-widest text-center">Request Facility</Text>
            </Box>
          </SimpleGrid>
        </Paper>
      </Container>

      <footer className="p-8 text-center">
        <Text className="text-slate-300 font-black text-[9px] tracking-[0.4em] uppercase">
          &copy; 2026 QueueCare Healthcare Solutions
        </Text>
      </footer>
    </Box>
  );
}