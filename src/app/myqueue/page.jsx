"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Box, Text, Stack, Group, SimpleGrid, Title, Button, 
  Paper, ThemeIcon, Badge, ActionIcon, SegmentedControl, Center, Loader, Alert 
} from '@mantine/core';
import Navbar from "@/components/Navbar"; 
import { 
  Ticket, Clock, Hash, Trash2, AlertCircle, RefreshCw,
  CheckCircle2, Calendar, ChevronRight, Activity, Building2, User, Phone, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyQueuePage() {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'inactive'
  const [queues, setQueues] = useState({ active: [], inactive: [] });
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const fetchMyQueues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const phone = localStorage.getItem('user_phone');
      const token = localStorage.getItem('access_token');

      let url = process.env.NEXT_PUBLIC_QUEUE_API;
      if (phone) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}phone_num=${encodeURIComponent(phone)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const result = await response.json();
      console.log("📡 ข้อมูลที่ได้มา:", result);

      if (result.success || result.succes) {
        const activeList = result.data?.active || [];
        const inactiveList = result.data?.inactive || [];

        setQueues({
          active: activeList,
          inactive: inactiveList
        });

        if (activeList.length > 0 && !selectedId) {
          setSelectedId(activeList[0].id);
        }
      } else {
        setError(result.message || "ไม่พบข้อมูลคิวของคุณ");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่ภายหลัง");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchMyQueues();
  }, [fetchMyQueues]);

  const allQueues = [...queues.active, ...queues.inactive];
  const selectedData = allQueues.find(q => q.id === selectedId) || null;

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 py-8 lg:py-16">
        <Container size="xl">
          <Stack gap={40}>
            
            {/* 🆕 ปรับ HEADER SECTION ให้อยู่ในแถวเดียวกัน */}
            <Group justify="space-between" align="center" wrap="wrap" className="gap-6">
              <Stack gap={4}>
                <Text className="tracking-[0.3em] text-blue-600 font-bold text-[10px] uppercase">Live Status</Text>
                <Title className="text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tighter">
                  My <span className="text-blue-600">Queues.</span>
                </Title>
              </Stack>

              <Group gap="md" className="w-full lg:w-auto">
                <ActionIcon 
                  variant="light" color="blue" size="xl" radius="xl" 
                  onClick={fetchMyQueues} loading={loading}
                  className="h-14 w-14" // ✅ ทำให้ปุ่มมีขนาดเท่า SegmentedControl
                >
                  <RefreshCw size={24} />
                </ActionIcon>

                <SegmentedControl
                  value={activeTab}
                  onChange={setActiveTab}
                  radius="xl" size="md" color="blue"
                  data={[
                    { label: 'คิวปัจจุบัน', value: 'active' },
                    { label: 'ประวัติ', value: 'inactive' }
                  ]}
                  className="bg-white border border-slate-100 h-14 font-bold"
                />
              </Group>
            </Group>

            {error && (
              <Alert color="red" variant="light" radius="md" icon={<AlertCircle size={16} />} title="เกิดข้อผิดพลาด">
                {error}
              </Alert>
            )}

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              
              {/* 🆕 🎫 LEFT SIDE: ตั๋วรายละเอียดคิวแบบเน้นๆ ตามแบบ */}
              <Box className="w-full lg:w-[460px] lg:sticky lg:top-32">
                <AnimatePresence mode="wait">
                  {loading && !selectedData ? (
                    <Paper p={40} radius={32} withBorder className="h-[450px] flex items-center justify-center bg-white border-slate-100 shadow-lg">
                      <Loader size="lg" variant="dots" color="blue" />
                    </Paper>
                  ) : selectedData ? (
                    <motion.div key={selectedData.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Paper p={32} radius={32} withBorder className="bg-white border-slate-100 shadow-2xl shadow-blue-500/5 relative overflow-hidden">
                        <Stack gap={32}>
                          {/* 🆕 ปรับ Header ภายใน Card */}
                          <Group justify="space-between" align="center">
                            <Stack gap={0}>
                              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SELECTED INSTITUTION</Text>
                              <Title order={2} className="text-2xl font-black text-[#1E293B] uppercase mt-1">
                                {selectedData.institution_name || "ชื่อสถาบัน"}
                              </Title>
                            </Stack>
                            <ThemeIcon size={44} radius="xl" color="blue" variant="light" className="border border-blue-100">
                                <Activity size={20} />
                            </ThemeIcon>
                          </Group>

                          {/* 🆕 ปรับขนาดหมายเลขคิวและ Badge */}
                          <Center className="py-6 border-y border-slate-50">
                             <Stack gap={0} align="center">
                               <Text className="text-[100px] lg:text-[120px] font-black text-[#1E293B] leading-none tracking-tighter italic">
                                 {selectedData.number}
                               </Text>
                               <Badge size="xl" radius="md" color="blue" variant="filled" className="mt-4 px-6 font-bold">
                                 {selectedData.status?.toUpperCase() || "PENDING"}
                               </Badge>
                             </Stack>
                          </Center>

                          {/* 🆕 ปรับรายการรายละเอียด ด้านล่างตั๋ว */}
                          <Stack gap="xs">
                            <DetailRow label="คิวก่อนหน้า" value={`${selectedData.wait_count || "0"} คิว`} icon={<Hash size={16} />} />
                            <DetailRow label="เวลารอโดยประมาณ" value={`${selectedData.wait_time || "0"} min`} icon={<Clock size={16} />} />
                            <DetailRow label="เวลาที่คาดว่าจะได้รับบริการ" value={selectedData.start_at || "HH:MM"} icon={<Calendar size={16} />} />
                          </Stack>

                          {activeTab === 'active' && (
                            <Button fullWidth size="xl" radius="xl" color="red" variant="filled" leftSection={<Trash2 size={20} />} className="font-bold h-16 shadow-lg shadow-red-500/10">
                              ยกเลิกการจองคิว
                            </Button>
                          )}
                        </Stack>
                      </Paper>
                    </motion.div>
                  ) : (
                    <EmptyState text="กรุณาเลือกคิวเพื่อดูข้อมูล" />
                  )}
                </AnimatePresence>
              </Box>

              {/* 📋 RIGHT SIDE: รายการคิวใบเล็ก จัดแบบ SimpleGrid */}
              <Box className="flex-1 w-full">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={20}>
                  <AnimatePresence mode="popLayout">
                    {queues[activeTab].map((item) => (
                      <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Paper 
                          p={24} radius={24} withBorder 
                          onClick={() => setSelectedId(item.id)}
                          className={`cursor-pointer transition-all ${selectedId === item.id ? 'border-blue-600 bg-white shadow-2xl shadow-blue-500/5' : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg'}`}
                        >
                          {/* 🆕 ปรับโครงสร้างภายใน Card ใบเล็ก */}
                          <Group justify="space-between" wrap="nowrap" gap="md">
                            <Group gap="md">
                              <Box className={`w-20 h-20 rounded-3xl flex items-center justify-center ${selectedId === item.id ? 'bg-gray-300' : 'bg-slate-50 border border-slate-100'}`}>
                                 <Text className={`text-4xl font-black italic ${selectedId === item.id ? 'text-white' : 'text-[#1E293B]'}`}>
                                    {item.number}
                                 </Text>
                              </Box>
                              <Stack gap={4}>
                                <Text className="text-base font-black text-[#1E293B] uppercase truncate max-w-[180px]">
                                    {item.institution_name || item.name}
                                </Text>
                                <Group gap={8}>
                                    <Text className="text-sm font-bold text-slate-400">
                                        รอ {item.wait_time || "0"} min
                                    </Text>
                                    <Text className="text-sm font-bold text-slate-400">
                                        ETA: {item.start_at || "HH:MM"}
                                    </Text>
                                </Group>
                              </Stack>
                            </Group>
                            <ActionIcon variant="light" color="blue" radius="xl" size="lg"><ChevronRight size={18} /></ActionIcon>
                          </Group>
                        </Paper>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </SimpleGrid>

                {!loading && queues[activeTab].length === 0 && (
                   <EmptyState text={activeTab === 'active' ? "คุณยังไม่มีคิวที่กำลังรอนะครับ" : "ไม่มีประวัติการจองคิวในระบบ"} />
                )}
              </Box>
            </div>
          </Stack>
        </Container>
      </main>
    </Box>
  );
}

// --- 🆕 ปรับ Sub-components ---

function DetailRow({ label, value, icon }) {
  return (
    <Group justify="space-between" align="center" className="py-4 border-b border-slate-50 last:border-b-0">
      <Group gap={12}>
        <ThemeIcon size={32} radius="lg" variant="light" color="gray" className="text-slate-400 border border-slate-100">
            {icon}
        </ThemeIcon>
        <Text className="text-sm font-bold text-[#1E293B]">{label}</Text>
      </Group>
      <Text className="text-sm font-black text-[#1E293B] bg-slate-50 px-3 py-1 radius-md">
        {value || "-"}
      </Text>
    </Group>
  );
}

function EmptyState({ text }) {
  return (
    <Paper p={60} radius={32} withBorder className="text-center bg-white border-dashed border-slate-200 w-full h-[350px] flex items-center justify-center border-slate-100">
      <Stack align="center" gap="xs">
        <Building2 size={48} color="#CBD5E1" strokeWidth={1} />
        <Text className="font-bold text-slate-400 text-sm">{text}</Text>
      </Stack>
    </Paper>
  );
}