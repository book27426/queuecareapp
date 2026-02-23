"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, TextInput, SimpleGrid, Box, Text, Title, Group, Stack, Modal, 
  Paper, ThemeIcon, Button, ActionIcon, Avatar, Flex
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Search, Clock, Ticket, X, Activity, ArrowRight, User, Phone, Building2 } from 'lucide-react';
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
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar user={null} />

      <main className="flex-1 py-10 md:py-20">
        <Container size="xl">
          <Stack gap={50}>
            <Stack align="center" gap="md" className="text-center">
               <Text className="tracking-[0.3em] text-blue-600 font-bold text-[10px] uppercase">
                 Institutional Directory
               </Text>
               <Title className="text-4xl md:text-6xl font-extrabold text-[#1E293B] tracking-tighter">
                 Select <span className="text-blue-600">Institution.</span>
               </Title>
               
               <Box className="w-full max-w-lg mt-4 px-4">
                 <TextInput
                   size="xl" radius="xl" placeholder="ค้นหาชื่อสถานพยาบาล..."
                   value={searchQuery} onChange={(e) => setSearchQuery(e.currentTarget.value)}
                   leftSection={<Search size={20} className="text-blue-600" />}
                   styles={{ 
                     input: { 
                        backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', 
                        fontWeight: 600, height: '60px', fontSize: '15px'
                     } 
                   }}
                 />
               </Box>
            </Stack>

            <SimpleGrid cols={{ base: 1, lg: 3 }} spacing={20}>
              {FACILITIES.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase())).map((hospital) => (
                <FacilityCard key={hospital.id} hospital={hospital} onSelect={handleHospitalSelect} />
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </main>

      {/* Modal */}
      <Modal opened={opened} onClose={close} centered radius="32px" size={step === 'form' ? "lg" : "xl"} withCloseButton={false} padding={0}>
        <Box className="p-10 md:p-14 bg-white">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Stack gap="xl">
                  <Group justify="space-between" align="center">
                    <Title order={2} className="text-2xl font-extrabold text-[#1E293B] tracking-tight">{selectedHospital?.name}</Title>
                    <ActionIcon variant="light" color="gray" radius="xl" size="xl" onClick={close}><X size={24} /></ActionIcon>
                  </Group>
                  <form onSubmit={handleJoinQueue} className="space-y-6">
                    <TextInput required label="ชื่อ-นามสกุล" size="lg" radius="md" leftSection={<User size={18} />} placeholder='กรอกชื่อและนามสกุล' classNames={{ input: "font-bold h-14" }} />
                    <TextInput required label="เบอร์โทรศัพท์" size="lg" radius="md" leftSection={<Phone size={18} />} placeholder='กรอกเบอร์ติดต่อ' classNames={{ input: "font-bold h-14" }} />
                    <Button type="submit" fullWidth size="xl" radius="xl" color="blue" className="h-16 font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all">จองคิว</Button>
                  </form>
                </Stack>
              </motion.div>
            ) : (
              <motion.div key="printing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 bg-slate-50 rounded-[32px]">
                <DispenseMachine />
                <div className="relative h-[300px] overflow-hidden">
                  <motion.div initial={{ y: -300 }} transition={{ duration: 0.6 }} animate={{ y: 0 }}><PaperTicketContent queueNumber={newQueueId} hospitalName={selectedHospital?.name} /></motion.div>
                </div>
                <Button onClick={() => { close(); router.push('/myqueue'); }} size="xl" radius="xl" color="dark" className="mt-8 px-12 h-16 font-bold shadow-2xl" leftSection={<Ticket size={24} />}>ดูคิวของฉัน</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Modal>
    </Box>
  );
}

function FacilityCard({ hospital, onSelect }) {
  const isOpen = hospital.status === "OPEN";

  return (
    <motion.div whileHover={isOpen ? { y: -5 } : {}} onClick={() => onSelect(hospital)}>
      <Paper 
        p={20} radius="24px" withBorder 
        className={`cursor-pointer transition-all duration-300 relative overflow-hidden
          ${isOpen ? 'bg-white border-slate-100 hover:shadow-xl' : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}`}
      >
        <Flex 
          direction={{ base: 'row', lg: 'column' }} 
          gap={{ base: 'md', lg: 'xl' }}
          align={{ base: 'center', lg: 'stretch' }}
        >
          <Box className="w-20 md:w-24 lg:w-full aspect-square bg-slate-50 rounded-2xl flex items-center justify-center p-4 border border-slate-100/50 flex-shrink-0">
            {hospital.logo ? (
              // object-contain: ย่อรูปให้พอดีกรอบสี่เหลี่ยมโดยไม่เสียสัดส่วน
              <img src={hospital.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Building2 className="text-slate-200" size={32} />
            )}
          </Box>

          {/* Content Area ... (เหมือนเดิม) */}
          <Stack gap="xs" className="flex-1">
            <Group justify="space-between" align="center">
              <Box className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest
                ${isOpen ? 'bg-teal-50 text-teal-600' : 'bg-slate-200 text-slate-500'}`}>
                {hospital.status}
              </Box>
              <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
            </Group>

            <Title order={4} className="text-lg font-extrabold text-[#1E293B] tracking-tight leading-tight line-clamp-1">
              {hospital.name}
            </Title>
            
            <Group gap="lg" className="mt-1">
              <Group gap={4}>
                <Clock size={12} className="text-slate-400" />
                <Text className="text-[11px] font-bold text-slate-600">{hospital.open}-{hospital.close}</Text>
              </Group>
              <Group gap={4}>
                <Activity size={12} className="text-blue-600" />
                <Text className="text-[11px] font-bold text-blue-600">{isOpen ? `${hospital.waitMin}m wait` : '--'}</Text>
              </Group>
            </Group>
          </Stack>
        </Flex>
      </Paper>
    </motion.div>
  );
}