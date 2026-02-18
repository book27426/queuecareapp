"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Container, Box, Text, Stack, Group, SimpleGrid, Title } from '@mantine/core';
import { Navbar } from "@/components/Navbar";
import { Ticket, History, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_DATA = {
  queuing: [
    { id: 'A026', agency: 'โรงพยาบาลปทุมธานี', section: 'Center', wait: '20 MIN', ahead: '5 คิว', eta: '14:30' },
    { id: 'B012', agency: 'คลินิกเวชกรรม', section: 'General Medicine', wait: '45 MIN', ahead: '12 คิว', eta: '15:15' },
    { id: 'A006', agency: 'โรงพยาบาลกรุงเทพ', section: 'Center', wait: '10 MIN', ahead: '2 คิว', eta: '14:40' },
  ],
  history: [
    { id: 'C099', agency: 'คลินิกเฉพาะทาง', section: 'Dental', date: '15 Feb 2026', eta: 'Finished' },
  ]
};

const ZIGZAG_CLIP = 'polygon(0% 0%, 100% 0%, 100% 95%, 95% 100%, 90% 95%, 85% 100%, 80% 95%, 75% 100%, 70% 95%, 65% 100%, 60% 95%, 55% 100%, 50% 95%, 45% 100%, 40% 95%, 35% 100%, 30% 95%, 25% 100%, 20% 95%, 15% 100%, 10% 95%, 7.5% 100%, 5% 95%, 2.5% 100%, 0% 95%)';

export default function MyTablePage() {
  const [activeTab, setActiveTab] = useState('queuing');
  const [selectedId, setSelectedId] = useState(MOCK_DATA.queuing[0].id);
  const selectedData = [...MOCK_DATA.queuing, ...MOCK_DATA.history].find(q => q.id === selectedId);

  return (
    <Box className="min-h-screen bg-[#EBEDF0] flex flex-col font-sans antialiased overflow-x-hidden">
      <Navbar user={null} />

      <Container size="xl" className="flex-1 py-10 w-full">
        <Stack gap={40}>
          <Group justify="space-between" align="center" wrap="nowrap" className="w-full">
            <Title className="text-5xl font-black uppercase tracking-tighter text-slate-900">
              MY <span className="text-[#10B981]">TABLE</span>
            </Title>
             <Group gap="xs">
              <Link href="/join" className="no-underline">
              <div className="relative group">
                {/* Shadow Block (เงาหนาด้านหลัง) */}
                <div className="absolute inset-0 bg-emerald-900 rounded-xl translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-all" />
                
                {/* Main Button (ตัวปุ่มด้านหน้า) */}
                <button className="relative px-6 py-3 bg-[#10B981] text-white rounded-xl flex items-center gap-2 transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 shadow-sm">
                  <Plus size={22} strokeWidth={4} />
                  <Text fz={18} className="font-black uppercase tracking-tight">จองคิวเพิ่ม</Text>
                </button>
              </div>
            </Link>

            <Box className="bg-gray-300/40 p-1.5 rounded-2xl flex gap-1 shadow-inner">
              <TabBtn active={activeTab === 'queuing'} onClick={() => setActiveTab('queuing')} icon={<Ticket size={20} />} label="Queuing" />
              <TabBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20} />} label="History" />
            </Box>
          </Group>
             </Group>

          <div className="flex flex-col lg:flex-row gap-16 items-start">
            
            <Box className="w-full lg:w-[370px] order-2 lg:order-1 sticky top-32">
              <AnimatePresence mode="wait">
                <motion.div key={selectedId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                  <Stack gap="xl">
                    <Box style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.15))' }}>
                      <Box className="bg-[#FDFBF7] p-12 pb-24 text-center relative flex flex-col items-center justify-center min-h-[400" style={{ clipPath: ZIGZAG_CLIP }}>       
                        <Stack gap={4} className="mb-8">
                          <Text fz={25} className="text-4xl font-black text-[#0F172A] uppercase leading-none max-w-[340px]">{selectedData.agency}</Text>
                        </Stack>
                        <Stack gap={4} className="mb-10">
                          <Text fz={25} className="text-3xl font-black text-[#10B981] uppercase leading-none">{selectedData.section || 'Center'}</Text>
                        </Stack>                     
                        <Text fz={25} className="text-[130px] font-black text-[#0F172A] leading-none tracking-tighter">
                          {selectedData.id}
                        </Text>
                        <Text className="text-2xl font-black text-[#10B981] uppercase mt-4">
                          Wait: {selectedData.wait}
                        </Text>
                        
                        <Box className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                      </Box>
                    </Box>

                    <Stack gap="md" className="px-10">
                      <DetailRow label="คิวก่อนหน้า" value={selectedData.ahead || '0'} />
                      <DetailRow label="เวลารอโดยประมาณ" value={selectedData.wait || '0'} />
                      <DetailRow label="เวลาที่คาดว่าจะได้รับการบริการ" value={selectedData.eta} />
                      
                      {activeTab === 'queuing' && (
                        <button className="w-full py-5 mt-6 bg-[#EF4444] hover:bg-red-600 text-white font-black rounded-3xl uppercase shadow-xl shadow-red-500/20 transition-all active:scale-95 text-lg">
                          ยกเลิกคิว
                        </button>
                      )}
                    </Stack>
                  </Stack>
                </motion.div>
              </AnimatePresence>
            </Box>

            <Box className="flex-1 w-full order-1 lg:order-2">
              <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing={40}>
                {MOCK_DATA[activeTab].map((item) => (
                  <Box key={item.id} onClick={() => setSelectedId(item.id)} className="relative cursor-pointer group">
                    <Box 
                      className={`absolute inset-0 rounded-xl transition-all duration-300 
                        ${selectedId === item.id 
                          ? 'bg-[#10B981] translate-x-2 translate-y-2 group-hover:translate-x-4 group-hover:translate-y-4' 
                          : 'bg-gray-300/30 opacity-100 translate-x-1 translate-y-1 group-hover:translate-x-3 group-hover:translate-y-3'
                        }`} 
                    />
                    <Box 
                      className={`relative bg-[#FDFBF7] p-8 pb-14 transition-all duration-300 flex flex-col items-center justify-center min-h-[240px] 
                        group-hover:-translate-x-1 group-hover:-translate-y-1 active:translate-x-0 active:translate-y-0
                        ${selectedId === item.id ? 'border-2 border-[#10B981]' : 'border border-transparent'}`}
                      style={{ clipPath: ZIGZAG_CLIP, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.08))' }}
                    >
                      <Stack gap="sm" align="center" className="w-full">
                        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.agency}</Text>
                        
                        <Text className="text-6xl font-black text-[#0F172A] leading-none">{item.id}</Text>
                        
                        <Text className="text-sm font-black text-[#10B981] uppercase mt-2">
                          {item.wait}
                        </Text>
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

          </div>
        </Stack>
      </Container>
    </Box>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`px-8 py-3 rounded-xl font-black text-sm uppercase transition-all flex items-center gap-3 ${active ? 'bg-black text-white shadow-lg' : 'text-slate-500 hover:bg-gray-200'}`}>
      {icon} {label}
    </button>
  );
}

function DetailRow({ label, value }) {
  return (
    <Group justify="space-between" className="border-b-2 border-slate-200 pb-4">
      <Text className="text-xs font-black text-slate-500 uppercase tracking-tighter">{label}</Text>
      <Text className="text-2xl font-black text-slate-900 uppercase">{value}</Text>
    </Group>
  );
}