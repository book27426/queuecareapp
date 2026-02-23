"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Container, Box, Text, Stack, Group, SimpleGrid, Title, Button, Modal, 
  Paper, ThemeIcon, Badge, ActionIcon, SegmentedControl, Center, Flex 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navbar } from "@/components/Navbar"; 
import { 
  Ticket, History as HistoryIcon, Plus, Clock, Hash, Trash2, 
  AlertTriangle, CheckCircle2, Calendar, ChevronRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_DATA = {
  queuing: [
    { id: 'A026', agency: 'โรงพยาบาลปทุมธานี', section: 'Center', wait: '15 min', ahead: '5 คิว', eta: '14:30' },
    { id: 'B012', agency: 'คลินิกเวชกรรม', section: 'General Medicine', wait: '45 min', ahead: '12 คิว', eta: '15:15' },
  ],
  history: [
    { id: 'C099', agency: 'คลินิกเฉพาะทาง', section: 'Dental', date: '23 Feb 2026', eta: '10:15' },
  ]
};

export default function MyQueuePage() {
  const [activeTab, setActiveTab] = useState('queuing');
  const [selectedId, setSelectedId] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!selectedId && MOCK_DATA[activeTab].length > 0) {
      setSelectedId(MOCK_DATA[activeTab][0].id);
    }
  }, [activeTab, selectedId]);

  const allData = [...MOCK_DATA.queuing, ...MOCK_DATA.history];
  const selectedData = allData.find(q => q.id === selectedId) || (MOCK_DATA[activeTab][0] || null);

  if (!mounted) return null;

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar user={null} />

      <main className="flex-1 py-8 lg:py-16">
        <Container size="xl">
          <Stack gap={40}>
            
            {/* HEADER: สมมาตร 100% */}
            <Group justify="space-between" align="center" wrap="wrap" className="gap-6">
              <Stack gap={4}>
                <Text className="tracking-[0.3em] text-blue-600 font-bold text-[10px] uppercase">Service Control</Text>
                <Title className="text-4xl lg:text-6xl font-extrabold text-[#1E293B] tracking-tighter">
                  My <span className="text-blue-600">Status.</span>
                </Title>
              </Stack>

              <Group gap="md" className="w-full lg:w-auto">
                <Button 
                  component={Link} href="/join" size="lg" radius="xl" color="blue"
                  leftSection={<Plus size={18} />}
                  className="h-14 px-8 font-bold shadow-lg shadow-blue-600/10 flex-1 lg:flex-none"
                >
                  จองคิวใหม่
                </Button>
                
                <SegmentedControl
                  value={activeTab} onChange={setActiveTab} radius="xl" size="md" color="blue"
                  data={[{ label: 'คิวปัจจุบัน', value: 'queuing' }, { label: 'ประวัติ', value: 'history' }]}
                  className="bg-white border border-slate-100 flex-1 lg:flex-none h-14"
                />
              </Group>
            </Group>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              
              {/* 🎫 LEFT SIDE: Ticket Card (แสดง ETA ชัดเจน) */}
              <Box className="w-full lg:w-[460px] lg:sticky lg:top-32">
                <AnimatePresence mode="wait">
                  {selectedData ? (
                    <motion.div key={selectedId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                      <Paper p={32} radius={32} withBorder className="bg-white border-slate-100 shadow-2xl shadow-blue-500/5 relative overflow-hidden">
                        <Stack gap={32} className="relative z-10">
                          <Group justify="space-between">
                            <Stack gap={0}>
                              <Text className="text-[10px] font-black text-blue-600 uppercase">Selected Institution</Text>
                              <Title order={3} className="text-xl font-extrabold text-[#1E293B] line-clamp-1">{selectedData.agency}</Title>
                            </Stack>
                            <ThemeIcon size={44} radius="xl" color="blue" variant="light"><Activity size={20} /></ThemeIcon>
                          </Group>

                          <Center className="py-6 border-y border-slate-50">
                             <Stack gap={0} align="center">
                               <Text className="text-[80px] sm:text-[100px] lg:text-[140px] font-black text-[#1E293B] leading-none tracking-tighter italic">
                                 {selectedData.id}
                               </Text>
                               <Badge size="lg" radius="md" color="blue" variant="light" className="mt-4">{selectedData.section}</Badge>
                             </Stack>
                          </Center>

                          <Stack gap="xs">
                            {activeTab === 'queuing' ? (
                              <>
                                <DetailRow label="คิวก่อนหน้า" value={selectedData.ahead} icon={<Hash size={16} />} />
                                <DetailRow label="เวลารอโดยประมาณ" value={selectedData.wait} icon={<Clock size={16} />} />
                                {/* เพิ่ม ETA (เวลาคาดว่าจะได้รับบริการ) */}
                                <DetailRow label="เวลาที่คาดว่าจะได้รับบริการ" value={selectedData.eta} icon={<Calendar size={16} />} />
                                <Button fullWidth size="lg" radius="xl" color="red" variant="light" onClick={open} className="mt-4 h-14 font-bold" leftSection={<Trash2 size={18} />}>
                                  ยกเลิกการจองคิว
                                </Button>
                              </>
                            ) : (
                              <>
                                <DetailRow label="วันที่รับบริการ" value={selectedData.date} icon={<Calendar size={16} />} />
                                <DetailRow label="เวลาที่เสร็จสิ้น" value={selectedData.eta} icon={<CheckCircle2 size={16} />} />
                              </>
                            )}
                          </Stack>
                        </Stack>
                      </Paper>
                    </motion.div>
                  ) : <EmptyState />}
                </AnimatePresence>
              </Box>

              {/* 📋 RIGHT SIDE: Queue List (เปลี่ยน Status เป็น Est. Wait) */}
              <Box className="flex-1 w-full">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
                  <AnimatePresence mode="popLayout">
                    {MOCK_DATA[activeTab].map((item) => (
                      <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Paper 
                          p={20} radius={24} withBorder onClick={() => setSelectedId(item.id)}
                          className={`cursor-pointer transition-all ${selectedId === item.id ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100 bg-white hover:border-blue-200'}`}
                        >
                          <Flex align="center" gap="md" wrap="nowrap">
                            <Box className="w-16 h-16 aspect-square bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                               <Title order={4} className="text-xl font-black text-[#1E293B] italic">{item.id}</Title>
                            </Box>
                            <Stack gap={2} className="flex-1 min-w-0">
                               <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.agency}</Text>
                               {/* FIXED: เปลี่ยนจากสถานะเป็น Est. Wait และ ETA */}
                               <Group gap={8}>
                                 <Text className="text-xs font-bold text-blue-600">รอ {item.wait}</Text>
                                 <Text className="text-[10px] font-bold text-slate-400">ETA: {item.eta}</Text>
                               </Group>
                            </Stack>
                            <ActionIcon variant="light" color="blue" radius="xl"><ChevronRight size={16} /></ActionIcon>
                          </Flex>
                        </Paper>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </SimpleGrid>
              </Box>

            </div>
          </Stack>
        </Container>
      </main>

      {/* CANCEL MODAL: สมมาตรตามมาตรฐาน */}
      <Modal opened={opened} onClose={close} centered radius="32px" withCloseButton={false} padding={32} size="md">
        <Stack gap="xl" align="center" className="text-center">
          <ThemeIcon size={64} radius="xl" color="red" variant="light"><AlertTriangle size={32} /></ThemeIcon>
          <Title order={2} className="text-2xl font-extrabold text-[#1E293B]">ยกเลิกการจองคิว?</Title>
          <Group grow className="w-full" gap="md">
            <Button onClick={close} size="lg" radius="xl" variant="subtle" color="gray">ย้อนกลับ</Button>
            <Button onClick={close} size="lg" radius="xl" color="red" className="shadow-lg shadow-red-500/20 font-bold">ยืนยัน</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

function DetailRow({ label, value, icon }) {
  return (
    <Group justify="space-between" align="center" className="py-3 border-b border-slate-50">
      <Group gap={10}>
        <ThemeIcon size={28} radius="md" variant="light" color="gray" className="text-slate-400">{icon}</ThemeIcon>
        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</Text>
      </Group>
      <Text className="text-lg font-black text-[#1E293B]">{value}</Text>
    </Group>
  );
}

function EmptyState() {
  return (
    <Paper p={40} radius={32} withBorder className="text-center bg-white border-dashed border-slate-200">
      <Text className="font-bold text-slate-400 text-sm">ไม่พบข้อมูลคิวในขณะนี้</Text>
    </Paper>
  );
}