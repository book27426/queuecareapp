// src/app/join/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, TextInput, SimpleGrid, Box, Text, Title, Group, Stack, Modal, AspectRatio 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Search, Clock, Ticket, X, Activity, ArrowRight, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Navbar } from "@/components/Navbar";
import { DispenseMachine, PaperTicketContent } from "@/components/QueueTicket";

const FACILITIES = [
  { id: 1, name: "กระทรวงสาธารณสุข", status: "OPEN", waitMin: 15, open: "08:00", close: "16:00", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Ministry_of_Public_Health_Thailand_Logo.png" },
  { id: 2, name: "โรงพยาบาลปทุมธานี", status: "OPEN", waitMin: 45, open: "07:30", close: "20:00", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Red_Cross_icon.svg/1024px-Red_Cross_icon.svg.png" },
  { id: 3, name: "คลินิกเฉพาะทาง", status: "CLOSED", waitMin: 300, open: "09:00", close: "17:00", logo: null }
];

export default function JoinQueuePage() {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [step, setStep] = useState('form'); 
  const [newQueueId] = useState("A026");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('user_queue_id')) {
        localStorage.setItem('user_queue_id', 'pending'); 
      }
      window.dispatchEvent(new Event('queueUpdated'));
    }
  }, []);

  const handleHospitalSelect = (hospital) => {
    if (hospital.status === 'OPEN') {
      setSelectedHospital(hospital);
      setStep('form');
      open();
    }
  };

  const handleJoinQueue = (e) => {
    e.preventDefault();
    localStorage.setItem('user_queue_id', newQueueId);
    window.dispatchEvent(new Event('queueUpdated'));
    setStep('printing');
  };

  return (
    <Box className="min-h-screen bg-[#EBEDF0] flex flex-col font-sans antialiased overflow-x-hidden relative">
      <Box className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
      
      <Navbar user={null} />

      <main className="flex-1 py-10 lg:py-16 w-full relative z-10">
        <Container size="xl">
          <Stack gap={50}>
            
            {/* Header Section */}
            <Group justify="space-between" align="flex-end" wrap="wrap" className="w-full gap-8 border-b-4 border-slate-900 pb-10">
              <Stack gap={0}>
                <Title className="text-4xl lg:text-7xl font-black uppercase tracking-tighter text-slate-900 italic leading-[0.85]">
                  SELECT <span className="text-[#10B981]">INSTITUTION</span>
                </Title>
                <Text className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mt-4">Workstation Database / {FACILITIES.length} Registered Units</Text>
              </Stack>

              <Box className="relative group w-full lg:w-[380px]">
                <div className="absolute inset-0 bg-slate-900 translate-x-1.5 translate-y-1.5 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" />
                <TextInput
                  size="xl" radius={0} placeholder="SEARCH CLINIC..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  leftSection={<Search size={22} strokeWidth={4} className="text-slate-900" />}
                  styles={{ input: { backgroundColor: '#FFFFFF', border: '2px solid #0F172A', fontWeight: 900, height: '65px', fontSize: '14px', textTransform: 'uppercase' } }}
                />
              </Box>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={25}>
              {FACILITIES.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase())).map((hospital) => (
                <FacilityCard key={hospital.id} hospital={hospital} onSelect={handleHospitalSelect} />
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </main>

      <Modal opened={opened} onClose={close} centered radius={0} size={step === 'form' ? "lg" : "xl"} withCloseButton={false} padding={0}>
        <Box className="border-[4px] border-slate-900 bg-white relative">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-10 lg:p-14">
                <Stack gap={40}>
                  <Group gap="xl" className="border-b-2 border-slate-100 pb-8 relative">
                    <button onClick={close} className="absolute -top-4 -right-4 p-2 text-slate-300 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"><X size={32} strokeWidth={4} /></button>
                    <div className="w-20 h-20 border-2 border-slate-900 bg-slate-50 p-4 flex items-center justify-center">
                       {selectedHospital?.logo ? <img src={selectedHospital.logo} alt="Logo" className="w-full h-full object-contain" /> : <Activity className="text-slate-200" size={30} />}
                    </div>
                    <Stack gap={0}>
                      <Title order={2} className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{selectedHospital?.name}</Title>
                      <Text className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em]">Session Registration</Text>
                    </Stack>
                  </Group>

                  <form onSubmit={handleJoinQueue} className="space-y-8">
                    <TextInput required label="PATIENT NAME" placeholder="ชื่อ-นามสกุล" size="xl" radius={0} classNames={{ input: "border-2 border-slate-900 font-black h-16 uppercase", label: "font-black text-slate-400 mb-2 uppercase text-[10px] tracking-widest" }} leftSection={<User size={18} className="text-slate-400" />} />
                    <TextInput required label="CONTACT NUMBER" placeholder="08X-XXX-XXXX" size="xl" radius={0} classNames={{ input: "border-2 border-slate-900 font-black h-16 uppercase", label: "font-black text-slate-400 mb-2 uppercase text-[10px] tracking-widest" }} leftSection={<Phone size={18} className="text-slate-400" />} />
                    <button type="submit" className="w-full py-6 bg-[#10B981] text-white border-2 border-slate-900 text-2xl font-black uppercase tracking-widest shadow-[8px_8px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer">Register Queue</button>
                  </form>
                </Stack>
              </motion.div>
            ) : (
              /* Printing Step */
              <motion.div key="printing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 lg:py-24 bg-slate-50">
                <Stack align="center" gap={0}>
                  <DispenseMachine />
                  <div className="relative h-[380px] flex justify-center overflow-hidden">
                    <motion.div initial={{ y: -300 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 25, delay: 0.5 }}>
                      <PaperTicketContent queueNumber={newQueueId} hospitalName={selectedHospital?.name} />
                    </motion.div>
                  </div>
                  <button onClick={() => { close(); router.push('/myqueue'); }} className="mt-12 px-12 py-5 bg-white border-4 border-slate-900 text-slate-900 text-2xl font-black uppercase shadow-[10px_10px_0px_#10B981] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all cursor-pointer flex items-center gap-4">
                    <Ticket size={28} strokeWidth={4} className="text-[#10B981]" /> View Ticket
                  </button>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Modal>
    </Box>
  );
}

// ✅ Updated Facility Card with Readable Status & Operational Hours
function FacilityCard({ hospital, onSelect }) {
  const statusColor = hospital.status === "OPEN" ? "#10B981" : "#EF4444";

  return (
    <motion.div 
      onClick={() => onSelect(hospital)} 
      className="relative group cursor-pointer w-full"
    >
      {/* Opposite Shadow */}
      <div 
        className={`absolute inset-0 transition-all duration-300 
          ${hospital.status === 'OPEN' ? 'bg-[#10B981] translate-x-2.5 translate-y-2.5 group-hover:translate-x-4 group-hover:translate-y-4' : 'bg-slate-200 translate-x-1.5 translate-y-1.5'}`} 
      />
      
      <Box 
        className={`relative bg-white border-2 p-5 flex flex-col gap-6 transition-all duration-300
          ${hospital.status === 'OPEN' ? 'border-slate-900 group-hover:-translate-x-1 group-hover:-translate-y-1' : 'border-slate-200 grayscale opacity-80 cursor-not-allowed'}`}
        style={{ borderRadius: '0px' }}
      >
        <Group justify="space-between" align="center">
          {/* ✅ FIXED: High-contrast status label */}
          <Box className="px-3 py-1 border-2 border-slate-900 shadow-[2px_2px_0px_#000]" style={{ backgroundColor: statusColor }}>
            <Text className="text-[10px] font-black text-white uppercase tracking-widest">{hospital.status}</Text>
          </Box>
          <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${hospital.status === 'OPEN' ? 'bg-[#10B981] animate-pulse' : 'bg-slate-400'}`} />
        </Group>

        <Box className="w-full aspect-square border-2 border-slate-50 bg-slate-50/50 p-6 flex items-center justify-center overflow-hidden">
          {hospital.logo ? (
            <img src={hospital.logo} alt="Logo" className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
          ) : (
            <Activity className="text-slate-200" size={40} />
          )}
        </Box>

        <Title order={4} className="text-lg font-black text-slate-900 uppercase tracking-tighter italic line-clamp-1">{hospital.name}</Title>

        {/* ✅ ADDED: Operational Hours */}
        <Box className="py-3 border-y-2 border-slate-100 flex justify-between items-center px-1">
          <Group gap={6}>
            <Clock size={14} className="text-slate-400" strokeWidth={3} />
            <Text className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Hours</Text>
          </Group>
          <Text className="text-xs font-black text-slate-900 tracking-widest">{hospital.open} - {hospital.close}</Text>
        </Box>

        <Box className="flex justify-between items-center px-1">
          <Group gap={6}>
             <Activity size={14} className="text-[#10B981]" strokeWidth={3} />
             <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Wait</Text>
          </Group>
          <Text className="text-xl font-black text-slate-900 tracking-tighter">
            {hospital.status === 'OPEN' ? `${hospital.waitMin}m` : '---'}
          </Text>
        </Box>
      </Box>
    </motion.div>
  );
}