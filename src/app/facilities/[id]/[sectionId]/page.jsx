"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, Text, Title, Group, Stack, TextInput, Textarea, ScrollArea, Modal, Select, 
  Paper, ThemeIcon, Button, ActionIcon, Badge, Flex, Grid, Tabs, Center
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  CheckCircle, UserX, User, Phone, Layers, Clock, Send, X, ArrowRight, ArrowLeft,
  Search, Info, Activity 
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import { DispenseMachine, PaperTicketContent } from "@/components/QueueTicket";
import { motion, AnimatePresence } from 'framer-motion';

const SECTION_OPTIONS = [
  { value: 'S1', label: 'DENTAL / ทำฟัน' },
  { value: 'S2', label: 'GENERAL / ผู้ป่วยทั่วไป' },
  { value: 'S3', label: 'ER / ฉุกเฉิน' },
];

export default function SectionDetailPage() {
  const { id, sectionId } = useParams();
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [mounted, setMounted] = useState(false);

  // ระบบ Logic เดิม
  const [currentNumber, setCurrentNumber] = useState(26);
  const [isAnimating, setIsAnimating] = useState(false); // ใช้สำหรับ Cooldown และ Loading
  const [hasActivePatient, setHasActivePatient] = useState(true);
  
  const [waitlist, setWaitlist] = useState([
    { id: 'A027', name: 'สมชาย รักดี', tel: '081-123-4567' },
    { id: 'A028', name: 'นภาพร สดใส', tel: '089-876-5432' },
    { id: 'B015', name: 'วิชัย มั่นคง', tel: '085-555-0199' },
  ]);

  const [patient, setPatient] = useState({ name: "สมชาย ใจดี", tel: "081-123-4567", notes: "" });

  useEffect(() => { setMounted(true); }, []);

  const sectionLabel = sectionId === "S1" ? "DENTAL UNIT" : "GENERAL CLINIC";
  const displayId = `A${String(currentNumber).padStart(3, '0')}`;

  // แก้ไขระบบเรียกคิว: เพิ่มการล็อกปุ่ม (Cooldown) เพื่อป้องกันการกดรัว
  const triggerNextQueue = (type) => {
    if (isAnimating || !hasActivePatient) return;
    
    setIsAnimating(true); // 🔒 เริ่ม Cooldown ทันทีที่กด
    console.log(`Action: ${type}`, { queueId: displayId, patient });

    // จำลองระยะเวลาแอนิเมชันและการจัดการข้อมูล
    setTimeout(() => {
      if (waitlist.length > 0) {
        const next = waitlist[0];
        setPatient({ name: next.name, tel: next.tel, notes: "" });
        setWaitlist(prev => prev.slice(1));
        setCurrentNumber(prev => prev + 1);
      } else {
        setHasActivePatient(false);
      }
      
      // 🔓 ปลดล็อกปุ่มหลังจากแอนิเมชันและข้อมูลอัปเดตเสร็จสิ้น (รวมเวลา Ticket ลงมา)
      setTimeout(() => setIsAnimating(false), 1000); 
      if (opened) close();
    }, 850);
  };

  if (!mounted) return null;

  // 1. ส่วนควบคุมหลัก (2/3)
  const WorkstationUI = (
    <Stack gap={30}>
      <Group justify="space-between" align="center">
        <Button 
          variant="subtle" color="gray" radius="xl" leftSection={<ArrowLeft size={18} />} 
          onClick={() => router.back()} className="font-bold text-slate-400 hover:text-slate-900"
        >
          กลับหน้าหลัก
        </Button>
        <Badge size="xl" radius="md" color="blue" variant="light" className="h-10 px-6 font-bold uppercase italic">
          {sectionLabel}
        </Badge>
      </Group>

      <Grid gutter={30} align="stretch">
        <Grid.Col span={{ base: 12, md: 4.5 }}>
          <Paper p={32} radius={40} withBorder className="bg-white border-slate-100 shadow-sm h-full">
            <Group gap="xs" mb="xl" className="border-b border-slate-50 pb-4">
              <ThemeIcon variant="light" color="blue" radius="md"><Info size={18} /></ThemeIcon>
              <Title order={3} className="text-xl font-extrabold text-[#1E293B]">Patient Session</Title>
            </Group>
            <Stack gap="xl">
              <TextInput label="FULL NAME" value={hasActivePatient ? patient.name : "N/A"} readOnly radius="md" size="md" leftSection={<User size={16} className="text-slate-400" />} classNames={{ input: "font-bold h-12 bg-slate-50" }} />
              <TextInput label="CONTACT" value={hasActivePatient ? patient.tel : "---"} readOnly radius="md" size="md" leftSection={<Phone size={16} className="text-slate-400" />} classNames={{ input: "font-bold h-12 bg-slate-50" }} />
              <Textarea label="SESSION NOTES" placeholder="ระบุข้อมูลเคส..." value={patient.notes} onChange={(e) => setPatient({...patient, notes: e.target.value})} disabled={!hasActivePatient} minRows={6} radius="md" classNames={{ input: "font-bold p-4 focus:border-blue-500" }} />
            </Stack>
          </Paper>
        </Grid.Col>

        {/* FIXED: Centered Terminal Area */}
        <Grid.Col span={{ base: 12, md: 7.5 }}>
          <Paper 
            p={40} radius={40} withBorder 
            className="bg-slate-50/50 border-slate-100 shadow-sm h-full flex flex-col items-center justify-center relative overflow-hidden"
          >
            <Box className="w-full flex flex-col items-center justify-center">
              <DispenseMachine />
              <div className="relative w-full flex justify-center h-[340px] overflow-hidden mt-4">
                <AnimatePresence mode="wait">
                  {hasActivePatient && (
                    <motion.div 
                      key={displayId} initial={{ y: -350 }} animate={{ y: 0 }} 
                      exit={{ y: 900, rotate: 15, opacity: 0 }} transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      className="absolute z-10"
                    >
                      <PaperTicketContent queueNumber={displayId} hospitalName="ALPHA TERMINAL" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <Stack gap="md" className="w-full max-w-sm mt-10">
                <Group grow gap="md">
                  <Button 
                    onClick={() => triggerNextQueue('FINISH')} 
                    loading={isAnimating} // แสดงสถานะ Loading เมื่อกด
                    disabled={!hasActivePatient}
                    color="teal" size="xl" radius="xl" 
                    className="h-16 font-bold shadow-lg shadow-teal-500/10 active:scale-95 transition-all" 
                    leftSection={<CheckCircle size={20} />}
                  >
                    FINISH
                  </Button>
                  <Button 
                    onClick={() => triggerNextQueue('NO_SHOW')} 
                    loading={isAnimating} // ป้องกันการกดรัว
                    disabled={!hasActivePatient}
                    color="red" size="xl" radius="xl" 
                    className="h-16 font-bold shadow-lg shadow-red-500/10 active:scale-95 transition-all" 
                    leftSection={<UserX size={20} />}
                  >
                    NO SHOW
                  </Button>
                </Group>
                <Button 
                  onClick={open} 
                  loading={isAnimating} // ป้องกันการกดรัว
                  disabled={!hasActivePatient}
                  fullWidth color="blue" size="xl" radius="xl" 
                  className="h-20 text-lg font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all" 
                  rightSection={<Send size={22} />}
                >
                  TRANSFER PATIENT
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );

  // 2. ส่วนรายการคิว (1/3)
  const QueueFeedUI = (
    <Paper radius={{ base: 0, lg: 40 }} withBorder className="bg-white border-slate-100 shadow-2xl lg:shadow-blue-500/5 overflow-hidden h-full">
      <Box p={30} className="bg-slate-50/50 border-b border-slate-100">
        <Group justify="space-between" mb="md">
          <Title order={3} className="text-xl font-extrabold text-[#1E293B]">Waitlist Feed</Title>
          <Layers size={22} className="text-blue-600" />
        </Group>
        <TextInput placeholder="ค้นหาเลขคิว..." radius="xl" size="md" leftSection={<Search size={16} />} />
      </Box>
      <ScrollArea h={{ base: 'calc(100vh - 400px)', lg: 650 }} p={25}>
        <Stack gap="md">
          <AnimatePresence initial={false} mode="popLayout">
            {waitlist.map((item, i) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
                <Paper p={20} radius={24} withBorder className={`border-slate-50 transition-all ${i === 0 ? 'ring-2 ring-blue-500/20 bg-blue-50/10 shadow-md' : ''}`}>
                  <Flex justify="space-between" align="center">
                    <Stack gap={0}><Title order={4} className="text-2xl font-black text-[#1E293B] italic tracking-tighter">{item.id}</Title><Text className="text-[10px] font-bold text-slate-400 uppercase">{item.name}</Text></Stack>
                    <Badge size="lg" radius="md" color="blue" variant="light" leftSection={<Clock size={12} />}>15m</Badge>
                  </Flex>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>
      </ScrollArea>
    </Paper>
  );

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar user={{ name: "DR. PATHUM", role: "Operator" }} />

      <main className="flex-1 lg:p-10 max-w-[1800px] mx-auto w-full z-10">
        <Box className="lg:hidden">
          <Tabs defaultValue="control" color="blue" variant="pills" radius="xl" p="md">
            <Tabs.List grow className="bg-white p-1 rounded-full border border-slate-100 mb-6 shadow-sm">
              <Tabs.Tab value="control" leftSection={<Activity size={16} />} className="font-bold h-12">Workstation</Tabs.Tab>
              <Tabs.Tab value="feed" leftSection={<Layers size={16} />} className="font-bold h-12">Feed</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="control" px="xs">{WorkstationUI}</Tabs.Panel>
            <Tabs.Panel value="feed">{QueueFeedUI}</Tabs.Panel>
          </Tabs>
        </Box>

        <Box className="hidden lg:block px-6">
          <Grid gutter={40} align="stretch">
            <Grid.Col span={8}>{WorkstationUI}</Grid.Col>
            <Grid.Col span={4}>{QueueFeedUI}</Grid.Col>
          </Grid>
        </Box>
      </main>

      <RedirectModal opened={opened} onClose={close} patient={patient} queueId={displayId} isAnimating={isAnimating} onConfirm={() => triggerNextQueue('REDIRECT')} />
    </Box>
  );
}

// MODAL: ปุ่ม X อยู่มุมบนขวา และรองรับ Cooldown
function RedirectModal({ opened, onClose, patient, queueId, isAnimating, onConfirm }) {
  const [target, setTarget] = useState(null);

  return (
    <Modal opened={opened} onClose={onClose} centered radius="40px" withCloseButton={false} padding={0} size="600px">
      <Box className="p-10 lg:p-14 bg-white relative">
        <ActionIcon 
          variant="light" color="gray" radius="xl" size="xl" onClick={onClose} 
          style={{ position: 'absolute', top: '28px', right: '28px', zIndex: 100 }} 
          className="hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={24} />
        </ActionIcon>

        <Stack gap={40}>
          <Stack gap={4}>
            <Text className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Workstation Transfer</Text>
            <Title className="text-4xl font-black text-[#1E293B] italic tracking-tighter">{queueId}</Title>
          </Stack>

          <Stack gap="xl">
            <TextInput label="PATIENT IDENTIFICATION" value={patient.name} readOnly radius="md" size="lg" classNames={{ input: "font-bold h-14 bg-slate-50" }} />
            <Select label="REDIRECT TO UNIT" placeholder="เลือกแผนก..." data={SECTION_OPTIONS} value={target} onChange={setTarget} radius="md" size="lg" classNames={{ input: "font-bold h-14" }} />
          </Stack>
          
          <Button 
            onClick={onConfirm} 
            loading={isAnimating} // ป้องกันการกดรัวใน Modal
            disabled={!target} 
            fullWidth size="xl" radius="xl" color="blue" 
            className="h-20 text-lg font-bold shadow-xl active:scale-95 transition-all"
            rightSection={<ArrowRight size={22} />}
          >
            CONFIRM TRANSFER
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}