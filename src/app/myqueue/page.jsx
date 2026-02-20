"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Container, Box, Text, Stack, Group, SimpleGrid, Title, Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navbar } from "@/components/Navbar"; 
import { Ticket, History as HistoryIcon, Plus, Clock, Hash, Trash2, AlertTriangle, X, Check, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_DATA = {
  queuing: [
    { id: 'A026', agency: 'โรงพยาบาลปทุมธานี', section: 'Center', wait: '20 MIN', ahead: '5 คิว', eta: '14:30', color: '#10B981' },
    { id: 'B012', agency: 'คลินิกเวชกรรม', section: 'General Medicine', wait: '45 MIN', ahead: '12 คิว', eta: '15:15', color: '#FBBF24' },
  ],
  history: [
    { id: 'C099', agency: 'คลินิกเฉพาะทาง', section: 'Dental', date: '15 Feb 2026', eta: '14:50', color: '#94A3B8' },
  ]
};

const SHARP_RIP = 'polygon(0% 0%, 100% 0%, 100% 97%, 95% 100%, 90% 97%, 85% 100%, 80% 97%, 75% 100%, 70% 97%, 65% 100%, 60% 97%, 55% 100%, 50% 97%, 45% 100%, 40% 97%, 35% 100%, 30% 97%, 25% 100%, 20% 97%, 15% 100%, 10% 97%, 5% 100%, 0% 97%)';

export default function MyQueuePage() {
  const [activeTab, setActiveTab] = useState('queuing');
  const [selectedId, setSelectedId] = useState(MOCK_DATA.queuing[0].id);
  const [opened, { open, close }] = useDisclosure(false);
  
  const allData = [...MOCK_DATA.queuing, ...MOCK_DATA.history];
  const selectedData = allData.find(q => q.id === selectedId) || MOCK_DATA.queuing[0];

  return (
    <Box className="min-h-screen bg-[#EBEDF0] flex flex-col font-sans antialiased overflow-x-hidden relative">
      <Navbar user={null} />

      <Container size="xl" className="flex-1 py-8 lg:py-14 w-full relative z-10">
        <Stack gap={{ base: 30, lg: 60 }}>
          
          <Group justify="space-between" align="flex-end" wrap="wrap" className="w-full gap-6">
            <Stack gap={2}>
              <Title className="text-4xl lg:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                MY <span className="text-[#10B981]">QUEUE</span>
              </Title>
              <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px] lg:text-xs">Workstation Control Panel</Text>
            </Stack>

            <Group gap="md" className="w-full lg:w-auto">
              <Link href="/join" style={{ textDecoration: 'none', flex: 1 }} className="lg:flex-none">
                <Button 
                  fullWidth size="xl" radius="0" color="dark.9"
                  leftSection={<Plus size={20} strokeWidth={4} />}
                  className="h-14 lg:px-8 border-2 border-slate-900 shadow-[6px_6px_0px_#10B981] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                  <Text className="font-black uppercase tracking-widest">จองคิวใหม่</Text>
                </Button>
              </Link>

              <Box className="flex w-full lg:w-auto bg-white border-2 border-slate-900 p-1">
                <TabBtn active={activeTab === 'queuing'} onClick={() => { setActiveTab('queuing'); setSelectedId(MOCK_DATA.queuing[0].id); }} icon={<Ticket size={16} />} label="คิวปัจจุบัน" />
                <TabBtn active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setSelectedId(MOCK_DATA.history[0].id); }} icon={<HistoryIcon size={16} />} label="ประวัติ" />
              </Box>
            </Group>
          </Group>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 items-start">
            
            <Box className="w-full lg:w-[540px] lg:sticky lg:top-32">
              <AnimatePresence mode="wait">
                <motion.div key={selectedId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}>
                  <Stack gap={40}>
                    <Box className="relative">
                      <div className="absolute inset-0 bg-slate-900 opacity-5 translate-x-4 translate-y-4" style={{ clipPath: SHARP_RIP }} />
                      
                      <Box className="bg-white p-10 lg:p-14 pb-20 lg:pb-32 text-center relative flex flex-col items-center justify-center border-2 border-slate-900" style={{ clipPath: SHARP_RIP, borderRadius: '0px' }}> 
                        <Stack gap={4} className="mb-10 text-left w-full border-l-[6px] border-slate-900 pl-6">
                          <Text className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Selected Session</Text>
                          <Title order={3} className="text-2xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter line-clamp-1">{selectedData.agency}</Title>
                        </Stack>

                        <Box className="my-8 lg:my-14 flex items-center justify-center w-full">
                           <Text 
                            style={{ 
                              fontSize: 'clamp(80px, 2vw, 220px)',
                              lineHeight: 0.8,
                              fontWeight: 900,
                            }} 
                            className="text-slate-900 tracking-tighter select-none"
                           >
                             {selectedData.id}
                           </Text>
                        </Box>

                        <Text className="text-xs lg:text-sm font-black text-[#10B981] uppercase tracking-[0.4em] bg-[#10B981]/5 px-5 py-2 border border-[#10B981]/20 mt-10">
                          {selectedData.section || 'General'}
                        </Text>
                        <Box className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                      </Box>
                    </Box>

                    <Stack gap="xs" className="px-2">
                      {activeTab === 'queuing' ? (
                        <>
                          <DetailRow label="คิวก่อนหน้า" value={selectedData.ahead || '0 คิว'} icon={<Hash size={18} />} />
                          <DetailRow label="เวลารอโดยประมาณ" value={selectedData.wait || '0 MIN'} icon={<Clock size={18} />} />
                          <DetailRow label="เวลาที่คาดว่าจะบริการ" value={selectedData.eta} icon={<Clock size={18} />} />
                          <button onClick={open} className="w-full h-20 mt-10 bg-[#ff0000] border-[4px] border-slate-900 text-white font-black text-2xl uppercase tracking-tighter shadow-[10px_10px_0px_#000] hover:bg-white hover:text-[#ff0000] active:shadow-none active:translate-x-2 active:translate-y-2 transition-all cursor-pointer flex items-center justify-center gap-3" style={{ borderRadius: '0px' }}>
                            <Trash2 size={28} strokeWidth={3} /> ยกเลิกการจองคิว
                          </button>
                        </>
                      ) : (
                        <>
                          <DetailRow label="เวลาเสร็จสิ้น" value={selectedData.eta} icon={<Clock size={18} />} />
                          <DetailRow label="วันที่เสร็จสิ้น" value={selectedData.date} icon={<CalendarCheck size={18} />} />
                          <Box className="mt-8 p-6 border-2 border-slate-900 bg-slate-900 text-white text-center">
                             <Text className="font-black uppercase tracking-[0.2em] text-sm">การบริการเสร็จสิ้น</Text>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </motion.div>
              </AnimatePresence>
            </Box>

            {/* 📋 SIDE GRID (Right) - เลขคิวใบย่อยเล็กลงเพื่อให้หายเบียด */}
            <Box className="flex-1 w-full">
              <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing={30}>
                <AnimatePresence mode="popLayout">
                  {MOCK_DATA[activeTab].map((item) => (
                    <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Box onClick={() => setSelectedId(item.id)} className="relative cursor-pointer group" style={{ filter: `drop-shadow(${selectedId === item.id ? '8px 8px 0px #10B981' : '4px 4px 0px #E2E8F0'})` }}>
                        <Box className={`bg-white p-6 lg:p-8 pb-10 lg:pb-12 flex flex-col items-center justify-center min-h-[220px] border-2 transition-colors ${selectedId === item.id ? 'border-slate-900' : 'border-slate-100 hover:border-slate-300'}`} style={{ clipPath: SHARP_RIP, borderRadius: '0px' }}>
                          <Stack gap="md" align="center" className="w-full">
                            <Group justify="space-between" className="w-full px-1" wrap="nowrap">
                               <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                               <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[100px]">{item.agency}</Text>
                            </Group>
                            
                            {/* ✅ NORMAL SCALE (SIDE): เลขคิวใบย่อยต้องเล็กลงเพื่อให้หายเบียด */}
                            <Text style={{ fontSize: '48px', fontWeight: 900, fontStyle: 'italic' }} className="text-slate-900 tracking-tighter">
                              {item.id}
                            </Text>
                            
                            <Box className="px-3 py-1 bg-slate-50 border border-slate-200 mt-2">
                               <Text className="text-[9px] font-black text-[#10B981] uppercase">{item.wait || 'CLOSED'}</Text>
                            </Box>
                          </Stack>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SimpleGrid>
            </Box>

          </div>
        </Stack>
      </Container>

      <Modal opened={opened} onClose={close} centered radius={0} withCloseButton={false} padding={0} size="md">
        <Box className="border-[4px] border-slate-900 bg-white p-8 lg:p-10">
           <Stack gap="xl">
              <Group gap="md">
                 <Box className="w-12 h-12 bg-red-600 flex items-center justify-center text-white"><AlertTriangle size={24} strokeWidth={3} /></Box>
                 <Title order={2} className="text-3xl font-black uppercase tracking-tighter text-slate-900">Confirm Action</Title>
              </Group>
              <Text className="text-lg font-bold text-slate-500">คุณแน่ใจหรือไม่ว่าต้องการ <span className="text-red-600 underline">ยกเลิก</span> คิวนี้?</Text>
              <Group grow gap="md" className="pt-4">
                 <Button onClick={close} size="lg" radius={0} variant="default" className="border-2 border-slate-900 font-black h-16 uppercase">ไม่ใช่</Button>
                 <Button onClick={close} size="lg" radius={0} color="red.6" className="border-2 border-slate-900 font-black h-16 shadow-[4px_4px_0px_#000] uppercase">ใช่, ยกเลิก</Button>
              </Group>
           </Stack>
        </Box>
      </Modal>
    </Box>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button type="button" onClick={onClick} className={`flex-1 lg:flex-none px-4 lg:px-8 py-2.5 font-black text-[10px] lg:text-xs uppercase transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${active ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`} style={{ borderRadius: '0px' }}>
      {icon} {label}
    </button>
  );
}

function DetailRow({ label, value, icon }) {
  return (
    <Group justify="space-between" align="center" className="border-b border-slate-100 py-3 lg:py-4 group hover:border-slate-900 transition-colors">
      <Group gap={10}>
         <Box className="text-slate-300 group-hover:text-slate-900 transition-colors">{icon}</Box>
         <Text className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</Text>
      </Group>
      <Text className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tighter">{value}</Text>
    </Group>
  );
}