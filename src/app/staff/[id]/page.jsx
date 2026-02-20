"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, Select, Textarea, 
  SimpleGrid, ScrollArea, Badge, Skeleton 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Clock, Layers, ArrowRight, User, Phone, CheckCircle2, 
  LayoutGrid, Activity, Maximize2, Minimize2 
} from 'lucide-react';
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const SECTION_OPTIONS = [
  { value: 'S1', label: 'DENTAL / ทำฟัน' },
  { value: 'S2', label: 'GENERAL / ผู้ป่วยทั่วไป' },
  { value: 'S3', label: 'ER / ฉุกเฉิน' },
  { value: 'S4', label: 'SURGERY / ห้องผ่าตัด' },
];

export default function FacilityStationPage() {
  const params = useParams();
  const hospitalId = params.id;
  const [layoutMode, setLayoutMode] = useState('dashboard');
  const [opened, { open, close }] = useDisclosure(false);
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [overallStats] = useState([
    { label: "NEW QUEUE / H", avg: "14", value: "+12%", type: "bad" },
    { label: "COMPLETE / H", avg: "10", value: "+5%", type: "good" },
    { label: "AVG OP TIME", avg: "18m", value: "-2m", type: "good" },
  ]);

  const [waitlist] = useState([
    { id: 'A027', name: 'สมชาย รักดี', phone: '081-234-5678', est: '15m' },
    { id: 'A028', name: 'นภาพร สดใส', phone: '089-876-5432', est: '20m' },
    { id: 'B015', name: 'วิชัย มั่นคง', phone: '085-555-0199', est: '45m' },
    { id: 'C022', name: 'เกรียงไกร ใจดี', phone: '082-111-2233', est: '50m' },
    { id: 'A029', name: 'รุ่งนภา พัฒนา', phone: '084-444-5555', est: '55m' },
    { id: 'B016', name: 'มานะ ขยัน', phone: '081-000-1111', est: '60m' },
  ]);

  const [sections] = useState([
    { id: 'S1', name: "Dental / ทำฟัน", current: "A026", status: "#10B981", stats: [{ l: "QUEUE", v: "12", u: "+2", t: "bad" }, { l: "CASES", v: "45", u: "+5", t: "good" }] },
    { id: 'S2', name: "General / ผู้ป่วยทั่วไป", current: "B006", status: "#FBBF24", stats: [{ l: "QUEUE", v: "28", u: "+8", t: "bad" }, { l: "CASES", v: "102", u: "+12", t: "good" }] },
    { id: 'S3', name: "ER / ฉุกเฉิน", current: "C006", status: "#EF4444", stats: [{ l: "QUEUE", v: "5", u: "+1", t: "bad" }, { l: "CASES", v: "18", u: "+2", t: "good" }] }
  ]);

  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    const statTimer = setInterval(() => setActiveStatIndex((prev) => (prev + 1) % 2), 6000);
    return () => { clearTimeout(timer); clearInterval(statTimer); };
  }, []);

  const getTrendColor = (type) => {
    if (type === "good") return "#10B981";
    if (type === "bad") return "#EF4444";
    return "#94A3B8";
  };

  const handleCallNext = () => {
    if (waitlist.length > 0) {
      setSelectedPatient(waitlist[0]);
      open();
    }
  };

  if (loading) return <Box p={50}><Stack gap="xl"><Skeleton height={60} radius={0} /><Skeleton height={500} radius={0} /></Stack></Box>;

  return (
    <Box className="min-h-screen bg-[#EBEDF0] flex flex-col font-sans antialiased overflow-x-hidden relative">
      <Box className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
      <Navbar user={{ name: "DR. PATHUM", role: "Dispatcher" }} />

      <main className="flex-1 flex flex-col lg:flex-row p-5 lg:p-12 gap-10 max-w-[1800px] mx-auto w-full z-10">
        <motion.div layout transition={{ type: "spring", stiffness: 200, damping: 25 }} className={layoutMode === 'dashboard' ? "flex-1 flex flex-col gap-10" : "w-full lg:w-72 flex flex-col gap-10"}>
          <Box className="bg-white border-[3px] border-slate-900 p-8 lg:p-10 flex flex-col gap-10 relative shadow-[15px_15px_0px_rgba(15,23,42,0.05)]" style={{ borderRadius: '0px' }}>
            <Group justify="space-between" align="center" className="border-b-4 border-slate-900 pb-8">
              <Title className={`${layoutMode === 'dashboard' ? 'text-4xl lg:text-6xl' : 'text-2xl'} font-black text-slate-900 uppercase italic tracking-tighter leading-none`}>
                {layoutMode === 'dashboard' ? <><span className="text-[#10B981]">STATION</span> CONTROL</> : "STATS"}
              </Title>
              <button onClick={() => setLayoutMode(layoutMode === 'dashboard' ? 'management' : 'dashboard')} className="p-3 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#000] hover:bg-slate-900 hover:text-white transition-all cursor-pointer">
                {layoutMode === 'dashboard' ? <Maximize2 size={20} strokeWidth={3} /> : <Minimize2 size={20} strokeWidth={3} />}
              </button>
            </Group>

            <SimpleGrid cols={layoutMode === 'dashboard' ? { base: 1, sm: 3 } : 1} spacing={25}>
              {overallStats.map((stat, i) => (
                <Box key={i} className="border-2 border-slate-100 p-5 hover:border-slate-900 transition-colors">
                  <Text className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</Text>
                  <Group gap={8} align="baseline" wrap="nowrap">
                    <Text className={`${layoutMode === 'dashboard' ? 'text-4xl' : 'text-2xl'} font-black text-slate-900 tracking-tighter`}>{stat.avg}</Text>
                    <Text className="text-[10px] font-black italic" style={{ color: getTrendColor(stat.type) }}>({stat.value})</Text>
                  </Group>
                </Box>
              ))}
            </SimpleGrid>

            {layoutMode === 'dashboard' && (
              <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing={35}>
                {sections.map((section) => (
                  <Link href={`/staff/${hospitalId}/${section.id}`} key={section.id} className="no-underline relative group block">
                    <div className="absolute inset-0 bg-slate-900 translate-x-2.5 translate-y-2.5 group-hover:translate-x-4 group-hover:translate-y-4 transition-all" />
                    <Box className="relative h-full bg-white border-2 border-slate-900 p-6 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-all">
                      <Group justify="space-between" mb="lg">
                        <Title order={4} className="text-[13px] font-black text-slate-900 uppercase italic truncate">{section.name}</Title>
                        <Box className="w-3 h-3 rounded-full border-2 border-white shadow-md animate-pulse" style={{ backgroundColor: section.status, boxShadow: `0 0 10px ${section.status}` }} />
                      </Group>
                      <div className="grid grid-cols-[80px_1fr] gap-4 h-[100px]"> 
                        <Box className="bg-white border-2 border-slate-900 flex flex-col items-center justify-center">
                          <Text className="text-[7px] font-black text-slate-400 uppercase">Serving</Text>
                          <Text className="text-2xl font-black text-[#10B981] italic">{section.current}</Text>
                        </Box>
                        <Box className="bg-slate-50 border border-slate-100 overflow-hidden relative">
                          <div className="transition-all duration-700 ease-in-out" style={{ transform: `translateY(-${activeStatIndex * 100}px)` }}>
                            {section.stats.map((m, idx) => (
                              <div key={idx} className="h-[100px] flex flex-col justify-center p-4">
                                <Text className="text-[9px] font-black text-slate-400 uppercase mb-1">{m.l}</Text>
                                <Group gap={6} align="baseline">
                                  <Text className="text-xl font-black text-slate-900">{m.v}</Text>
                                  <Text className="text-[10px] font-black" style={{ color: getTrendColor(m.t) }}>({m.u})</Text>
                                </Group>
                              </div>
                            ))}
                          </div>
                        </Box>
                      </div>
                    </Box>
                  </Link>
                ))}
              </SimpleGrid>
            )}
          </Box>
        </motion.div>

        <motion.div layout transition={{ type: "spring", stiffness: 200, damping: 25 }} className={layoutMode === 'dashboard' ? "w-full lg:w-96 flex flex-col relative" : "flex-1 flex flex-col relative"}>
          <div className="absolute inset-0 bg-slate-900 translate-x-3 translate-y-3" />
          <Box className="relative bg-white border-[3px] border-slate-900 flex flex-col overflow-hidden h-[850px]">
            <Box className="p-8 border-b-4 border-slate-900 bg-white">
              <Group justify="space-between" align="center">
                <Stack gap={0}>
                  <Title order={3} className={`${layoutMode === 'dashboard' ? 'text-xl' : 'text-3xl'} font-black uppercase italic tracking-tighter`}>Next In Line</Title>
                  <Text className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.3em]">
                    Showing 5 / {waitlist.length} Pool
                  </Text>
                </Stack>
                <Layers size={layoutMode === 'dashboard' ? 22 : 32} className="text-slate-900" strokeWidth={3} />
              </Group>

              <div className="relative group mt-6">
                <div className="absolute inset-0 bg-[#10B981] translate-x-1.5 translate-y-1.5 group-hover:translate-x-3 group-hover:translate-y-3 transition-all" />
                <button onClick={handleCallNext} className="relative w-full py-4 bg-slate-900 text-white border-2 border-slate-900 text-sm font-black uppercase tracking-widest group-hover:-translate-x-1 group-hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-3">
                  Call Next Ticket <ArrowRight size={18} strokeWidth={3} />
                </button>
              </div>
            </Box>

            <ScrollArea className="flex-1 p-6 bg-slate-50/30">
              <SimpleGrid cols={layoutMode === 'dashboard' ? 1 : { base: 1, sm: 2, xl: 3 }} spacing="md">
                {waitlist.map((item, i) => (
                  <Box key={i} className={`bg-white border-2 p-5 flex items-center justify-between ${i === 0 ? 'border-[#10B981] shadow-[4px_4px_0px_#10B981]' : 'border-slate-100'}`}>
                    <Stack gap={0}>
                      <Text className={`text-2xl font-black italic tracking-tighter ${i === 0 ? 'text-[#10B981]' : 'text-slate-900'}`}>{item.id}</Text>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase mt-1">{item.name}</Text>
                    </Stack>
                    <Box className="border-2 border-slate-900 px-3 py-1.5 flex items-center gap-2">
                      <Clock size={12} className="text-[#10B981]" strokeWidth={4} />
                      <Text className="text-xs font-black text-slate-900">{item.est}</Text>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </ScrollArea>
          </Box>
        </motion.div>
      </main>

      <DispatchModal opened={opened} onClose={close} patient={selectedPatient} />
    </Box>
  );
}

function DispatchModal({ opened, onClose, patient }) {
  const [formData, setFormData] = useState({ name: '', phone: '', notes: '', section: null });

  useEffect(() => {
    if (patient) setFormData({ name: patient.name, phone: patient.phone, notes: '', section: null });
  }, [patient]);

  if (!patient) return null;

  return (
    <Modal opened={opened} onClose={onClose} centered radius={0} withCloseButton={false} padding={0} size="600px">
      <Box className="border-[4px] border-slate-900 bg-white relative p-10 lg:p-14 shadow-[20px_20px_0px_rgba(16,185,129,0.1)]">
        <Stack gap={40}>
          <Group justify="space-between" align="flex-start" className="border-b-4 border-slate-900 pb-8">
            <Stack gap={0}>
              <Title className="text-7xl font-black italic text-[#10B981] tracking-tighter leading-none">{patient.id}</Title>
              <Text className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Ready for Dispatch</Text>
            </Stack>
            <CheckCircle2 size={40} className="text-[#10B981]" strokeWidth={3} />
          </Group>

          <Stack gap="xl">
            <TextInput label="PATIENT NAME" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} radius={0} size="xl" classNames={{ input: "border-2 border-slate-900 font-black h-16 focus:border-[#10B981]", label: "font-black text-slate-400 mb-2 uppercase text-[10px] tracking-widest" }} leftSection={<User size={18} className="text-slate-400" />} />
            <TextInput label="CONTACT NUMBER" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} radius={0} size="xl" classNames={{ input: "border-2 border-slate-900 font-black h-16 focus:border-[#10B981]", label: "font-black text-slate-400 mb-2 uppercase text-[10px] tracking-widest" }} leftSection={<Phone size={18} className="text-slate-400" />} />
            <Textarea label="OPERATIONAL NOTES" placeholder="DETAILS..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} radius={0} minRows={3} classNames={{ input: "border-2 border-slate-900 font-black focus:border-[#10B981] p-4", label: "font-black text-slate-400 mb-2 uppercase text-[10px] tracking-widest" }} />
            <Select 
              label="DESTINATION UNIT" 
              placeholder="CHOOSE SECTION..." 
              data={SECTION_OPTIONS} 
              value={formData.section} 
              onChange={(val) => setFormData({...formData, section: val})} 
              radius={0} size="xl" 
              leftSection={<LayoutGrid size={18} className="text-[#10B981]" />} 
              classNames={{ 
                input: `border-2 ${!formData.section ? 'border-red-500' : 'border-slate-900'} font-black h-16 focus:border-[#10B981]`, 
                label: "font-black text-slate-400 mb-2 uppercase text-[10px] tracking-widest" 
              }} 
            />
          </Stack>

          <button 
            disabled={!formData.section}
            onClick={onClose} 
            className="w-full py-6 bg-slate-900 text-white border-2 border-slate-900 text-2xl font-black uppercase shadow-[10px_10px_0px_#10B981] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
          >
            EXECUTE DISPATCH <ArrowRight size={24} strokeWidth={3} />
          </button>
        </Stack>
      </Box>
    </Modal>
  );
}