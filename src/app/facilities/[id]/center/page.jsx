"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // เพิ่ม useRouter
import { 
  Box, Text, Title, Group, Stack, TextInput, Textarea, ScrollArea, Modal, Select, 
  SimpleGrid, Paper, ThemeIcon, Button, ActionIcon, Badge, Flex, Grid, Center 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  UserX, User, Phone, Layers, Clock, Send, X, ArrowRight, Play, ArrowLeft,
  CheckCircle2, Activity, ClipboardList, TrendingUp, Search, Info
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import { DispenseMachine, PaperTicketContent } from "@/components/QueueTicket";
import { motion, AnimatePresence } from 'framer-motion';

// ... (SECTION_OPTIONS เหมือนเดิม) ...
const SECTION_OPTIONS = [
  { value: 'S1', label: 'DENTAL / ทำฟัน' },
  { value: 'S2', label: 'GENERAL / ผู้ป่วยทั่วไป' },
  { value: 'S3', label: 'ER / ฉุกเฉิน' },
];

export default function CenterTerminalPage() {
  const { id } = useParams();
  const router = useRouter(); // เรียกใช้งาน router
  const [opened, { open, close }] = useDisclosure(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  //fetch get api/v1/counter
  const [waitlist, setWaitlist] = useState([
    { id: 'A027', name: 'สมชาย รักดี', tel: '081-234-5678', isVerified: true },
    { id: 'A028', name: 'นภาพร สดใส', tel: '089-876-5432', isVerified: false },
    { id: 'B015', name: 'วิชัย มั่นคง', tel: '085-555-0199', isVerified: false },
  ]);

  const [activePatient, setActivePatient] = useState(null); 
  const [centerNotes, setCenterNotes] = useState("");
  const [targetUnit, setTargetUnit] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  // ... (handleCallNext และ handleFinalize เหมือนเดิม) ...
  const handleCallNext = () => {
    //fetch put api/v1/queue body 
    if (isAnimating || waitlist.length === 0 || activePatient) return;
    setIsAnimating(true);
    setTargetUnit(null); 
    const next = waitlist[0];
    setActivePatient(next);
    setCenterNotes(""); 
    setWaitlist(prev => prev.slice(1)); 
    setTimeout(() => setIsAnimating(false), 850);
  };

  const handleFinalize = (type) => {
    //fetch put api/v1/queue body
    if (isAnimating || !activePatient) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActivePatient(null); 
      setIsAnimating(false);
      if (opened) close();
    }, 850);
  };

  if (!mounted) return null;

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar user={{ name: `CENTER-${id}`, role: "Center Operator" }} />

      <main className="flex-1 p-6 lg:p-10 max-w-[1800px] mx-auto w-full z-10">
        <Stack gap="xl">
          {/* 1. เพิ่มส่วน Header สำหรับปุ่มย้อนกลับ */}
          <Group justify="space-between" align="center" className="mb-4">
            <Button
              variant="subtle"
              color="gray"
              radius="xl"
              size="md"
              leftSection={<ArrowLeft size={20} />}
              onClick={() => router.back()} // ย้อนกลับไปหน้าก่อนหน้า
              className="font-bold hover:bg-slate-100 transition-colors text-slate-500"
            >
              กลับหน้าควบคุมสถานี
            </Button>
            
            <Badge size="lg" radius="md" color="blue" variant="outline" className="font-bold">
              ID: TERMINAL-CENTER-{id}
            </Badge>
          </Group>

          {/* Grid ระบบจัดการหลัก (โค้ดเดิมของคุณ) */}
          <Grid gutter={40}>
            {/* ... คอลัมน์ซ้าย (Verification) ... */}
            <Grid.Col span={{ base: 12, lg: 3 }}>
               {/* โค้ดส่วน Verification และ Stats ของคุณ */}
               <Stack gap={30}>
                <Paper p={32} radius={32} withBorder className="bg-white border-slate-100 shadow-sm">
                  <Group gap="xs" mb="xl" className="border-b border-slate-50 pb-4">
                    <ThemeIcon variant="light" color="blue" radius="md"><Info size={18} /></ThemeIcon>
                    <Title order={3} className="text-xl font-extrabold text-[#1E293B]">Verification</Title>
                  </Group>
                  <Stack gap="xl">
                    <TextInput label="PATIENT NAME" value={activePatient?.name || ""} onChange={(e) => setActivePatient(prev => ({...prev, name: e.target.value}))} disabled={!activePatient} radius="md" classNames={{ input: "font-bold h-12" }} />
                    <TextInput label="PHONE NUMBER" value={activePatient?.tel || ""} readOnly={activePatient?.isVerified} disabled={!activePatient} radius="md" classNames={{ input: "font-bold h-12" }} />
                    <Textarea label="RECEPTION NOTES" value={centerNotes} onChange={(e) => setCenterNotes(e.currentTarget.value)} placeholder="ระบุข้อมูลเพิ่มเติม..." minRows={3} radius="md" classNames={{ input: "font-bold p-4" }} />
                  </Stack>
                </Paper>
               </Stack>
            </Grid.Col>

            {/* ... คอลัมน์กลาง (Terminal Console) ... */}
            <Grid.Col span={{ base: 12, lg: 5 }}>
               {/* โค้ดส่วน Console และตั๋วของคุณ */}
               <Stack justify="center" align="center" gap={0} className="h-full">
                <Badge size="xl" radius="md" color="blue" variant="light" className="mb-8 h-10 px-6 font-bold">
                   UNIT: เคาท์เตอร์กลาง {id}
                </Badge>
                <DispenseMachine />
                <div className="relative w-full flex justify-center h-[380px] overflow-hidden">
                  <AnimatePresence mode="wait">
                    {activePatient && (
                      <motion.div key={activePatient.id} initial={{ y: -350, opacity: 1 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 900, rotate: 15, opacity: 0 }} transition={{ type: "spring", stiffness: 120, damping: 20 }} className="absolute z-10">
                        <PaperTicketContent queueNumber={activePatient.id} hospitalName={`CENTER TERMINAL`} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Stack className="w-full max-w-[480px] mt-10" gap="xl">
                  {!activePatient ? (
                    <Button onClick={handleCallNext} size="xl" radius="xl" color="blue" className="h-20 text-xl font-bold shadow-2xl shadow-blue-600/20 active:scale-95 transition-all" rightSection={<Play size={24} fill="currentColor" />}>
                      เรียกคิวต่อไป (Call Next)
                    </Button>
                  ) : (
                    <Stack gap="md">
                      <Button onClick={open} size="xl" radius="xl" color="blue" className="h-20 text-xl font-bold shadow-2xl shadow-blue-600/20 active:scale-95 transition-all" rightSection={<Send size={22} />}>
                        ส่งต่อหน่วยงาน (Redirect)
                      </Button>
                      <Button variant="subtle" color="red" radius="xl" size="md" onClick={() => handleFinalize('NO_SHOW')} leftSection={<UserX size={18} />} className="font-bold">
                        ผู้ป่วยไม่มาแสดงตัว (No Show)
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Grid.Col>

            {/* ... คอลัมน์ขวา (Queue Pool) ... */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
               {/* โค้ดส่วน Queue Pool ของคุณ */}
               <Box className="lg:sticky lg:top-32">
                <Paper radius={40} withBorder className="bg-white border-slate-100 shadow-2xl shadow-blue-500/5 overflow-hidden">
                  <Box p={30} className="bg-slate-50/50 border-b border-slate-100">
                    <Title order={4} className="text-xl font-extrabold text-[#1E293B]">Queue Pool</Title>
                  </Box>
                  <ScrollArea h={600} p={25}>
                    <Stack gap="md">
                      <AnimatePresence initial={false} mode="popLayout">
                        {waitlist.map((item, i) => (
                          <motion.div key={item.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
                            <Paper p={20} radius={24} withBorder className={`border-slate-50 ${i === 0 ? 'ring-2 ring-blue-500/20 bg-blue-50/10' : ''}`}>
                              <Flex justify="space-between" align="center">
                                <Stack gap={2}>
                                  <Title order={4} className="text-2xl font-black text-[#1E293B] italic tracking-tighter">{item.id}</Title>
                                  <Text className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[140px]">{item.name}</Text>
                                </Stack>
                                <Badge size="lg" radius="md" color="blue" variant="light" leftSection={<Clock size={12} />}>15m</Badge>
                              </Flex>
                            </Paper>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </Stack>
                  </ScrollArea>
                </Paper>
              </Box>
            </Grid.Col>
          </Grid>
        </Stack>
      </main>

      {/* Modal (โค้ดเดิมของคุณ) */}
      <RedirectModal opened={opened} onClose={close} patient={activePatient} notes={centerNotes} setNotes={setCenterNotes} targetUnit={targetUnit} setTargetUnit={setTargetUnit} onConfirm={() => handleFinalize('SENT')} />
    </Box>
  );
}

// MODAL COMPONENT: ดีไซน์สมมาตร 100%
function RedirectModal({ opened, onClose, patient, notes, setNotes, targetUnit, setTargetUnit, onConfirm }) {
  return (
    <Modal opened={opened} onClose={onClose} centered radius="40px" withCloseButton={false} padding={0} size="600px">
      <Box className="p-12 bg-white">
        <Stack gap={40}>
          <Group justify="space-between" align="center">
            <Stack gap={4}>
              <Text className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Workstation Redirection</Text>
              <Title className="text-3xl font-extrabold text-[#1E293B] tracking-tight">{patient?.id} Processing</Title>
            </Stack>
            <ActionIcon variant="light" color="gray" radius="xl" size="xl" onClick={onClose}><X size={24} /></ActionIcon>
          </Group>

          <Stack gap="xl">
            <TextInput label="PATIENT IDENTIFICATION" value={patient?.name || ''} readOnly size="lg" radius="md" classNames={{ input: "font-bold h-14 bg-slate-50 border-slate-200" }} />
            <Textarea label="INTERNAL NOTES (OPTIONAL)" placeholder="ระบุอาการเบื้องต้นหรือข้อมูลส่งต่อ..." value={notes} onChange={(e) => setNotes(e.currentTarget.value)} radius="md" minRows={3} classNames={{ input: "font-bold p-4 border-slate-200 focus:border-blue-500" }} />
            <Select label="TARGET DEPARTMENT (REQUIRED)" placeholder="เลือกแผนกที่จะส่งตัวต่อไป..." data={SECTION_OPTIONS} value={targetUnit} onChange={setTargetUnit} radius="md" size="lg" classNames={{ input: "font-bold h-14 border-slate-200" }} />
          </Stack>
          
          <Button 
            onClick={onConfirm} disabled={!targetUnit} fullWidth size="xl" radius="xl" color="blue" 
            className="h-20 text-lg font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            rightSection={<ArrowRight size={22} />}
          >
            ยืนยันการส่งตัวผู้ป่วย
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}