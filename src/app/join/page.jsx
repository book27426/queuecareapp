"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, TextInput, SimpleGrid, Box, Text, Title, Group, Stack, Modal, 
  Paper, Button, ActionIcon, Loader, Center, Badge, Alert
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Search, X, Building2, Clock, Activity, User, Phone, Ticket, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from "@/components/Navbar";
import { DispenseMachine, PaperTicketContent } from "@/components/QueueTicket";

export default function JoinQueuePage() {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);

  // --- States ---
  const [facilities, setFacilities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [step, setStep] = useState('form'); 
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newQueueData, setNewQueueData] = useState(null);
  
  // ✅ [Safe Check] เช็คสถานะ Login เฉพาะฝั่ง Client
  const [isPhoneUser, setIsPhoneUser] = useState(false);

  useEffect(() => {
    // โค้ดส่วนนี้จะทำงานเฉพาะใน Browser เท่านั้น
    const savedPhone = localStorage.getItem('user_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      setIsPhoneUser(true); // ยืนยันว่าเป็นผู้ใช้ที่ Login แล้ว
    }
  }, []);

  // --- 🔍 1. Data Fetching ---
  const fetchSections = useCallback(async (nameQuery = "") => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = '/api/v1/section';
      const url = nameQuery.trim() 
        ? `${baseUrl}?name=${encodeURIComponent(nameQuery.trim())}` 
        : baseUrl;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // สำหรับระบบ Guest Cookie
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (result.success && result.data) {
        setFacilities(result.data);
      } else {
        setFacilities([]);
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setError("ไม่สามารถดึงข้อมูลหน่วยงานได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections(""); 
  }, [fetchSections]);

  useEffect(() => {
    if (searchQuery === "") {
      fetchSections("");
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetchSections(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchSections]);

  // --- 🎫 2. Queue Booking ---
  const handleCreateQueue = async () => {
    if (!name || phone.length !== 10) return;
    setStep('processing');
    setError(null);
    try {
      const response = await fetch(`/api/v1/queue`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          section_id: selectedHospital.id, 
          name, 
          phone_num: phone 
        })
      });
      const result = await response.json();
      if (result.success) {
        setNewQueueData(result.data);
        setStep('ticket');
      } else {
        setError(result.message || "จองคิวไม่สำเร็จ");
        setStep('form');
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setStep('form');
    }
  };

  return (
    <Box className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="py-12 md:py-20">
        <Container size="xl">
          <Stack gap={40}>
            {/* Header & Search */}
            <Stack align="center" className="text-center">
              <Title order={1} fz={{ base: 32, md: 48 }} fw={900}>
                Select <Text span c="blue" inherit>Institution.</Text>
              </Title>
              <Text c="dimmed" fw={500} size="sm">ค้นหาและเลือกหน่วยงานที่ต้องการเพื่อจองคิว</Text>
              
              <Box w="100%" maw={500} mt={20}>
                <TextInput
                  size="xl" radius="xl" 
                  placeholder="พิมพ์ชื่อหน่วยงาน..."
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftSection={loading ? <Loader size="xs" /> : <Search size={20} color="#2563EB" />}
                  rightSection={searchQuery && (
                    <ActionIcon variant="transparent" onClick={() => setSearchQuery("")}>
                      <X size={16} />
                    </ActionIcon>
                  )}
                />
              </Box>
            </Stack>

            {/* 🏥 Grid รายการหน่วยงาน */}
            <AnimatePresence mode="popLayout">
              {!loading && facilities.length > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={24}>
                  {facilities.map((hospital) => (
                    <FacilityCard 
                      key={hospital.id} 
                      hospital={hospital} 
                      onSelect={(h) => { 
                        setSelectedHospital(h); 
                        setStep('form'); 
                        open(); 
                      }} 
                    />
                  ))}
                </SimpleGrid>
              ) : null}
            </AnimatePresence>

            {/* Loading / Empty States */}
            {loading && (
              <Center py={100}><Stack align="center"><Loader size="xl" variant="dots" /><Text c="dimmed" fw={700}>กำลังโหลด...</Text></Stack></Center>
            )}

            {!loading && facilities.length === 0 && (
              <Center p={80} className="bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <Stack align="center">
                  <Building2 size={48} color="#CBD5E1" />
                  <Text c="dimmed" fw={700}>ไม่พบข้อมูลหน่วยงาน</Text>
                  <Button variant="subtle" onClick={() => setSearchQuery("")}>แสดงทั้งหมด</Button>
                </Stack>
              </Center>
            )}
          </Stack>
        </Container>
      </main>

      {/* 🎫 Booking Modal */}
      <Modal 
        opened={opened} 
        onClose={close} 
        centered 
        radius="40px" 
        withCloseButton={false} 
        padding={0} 
        size={step === 'ticket' ? "450px" : "400px"}
      >
        <Box p={30}>
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Stack gap="xl">
                  <Group justify="space-between">
                    <Box>
                      <Title order={3} fw={900}>จองคิวบริการ</Title>
                      <Badge variant="dot" color="blue" size="lg" mt={5}>{selectedHospital?.name}</Badge>
                    </Box>
                    <ActionIcon variant="light" color="gray" radius="xl" onClick={close}><X size={18} /></ActionIcon>
                  </Group>

                  {error && <Alert color="red" radius="md" icon={<AlertCircle size={16} />}>{error}</Alert>}

                  <Stack gap="md">
                    <TextInput 
                      label="ชื่อ-นามสกุล" 
                      placeholder="ระบุชื่อจริง" 
                      radius="md" size="md" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      leftSection={<User size={18} color="#2563EB" />} 
                      required
                    />
                    <TextInput 
                      label="เบอร์โทรศัพท์" 
                      placeholder="08XXXXXXXX" 
                      radius="md" size="md" 
                      maxLength={10} 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                      leftSection={<Phone size={18} color="#2563EB" />}
                      required
                      // ✅ แก้ไขที่นี่: ใช้ State แทนการเรียก localStorage ตรงๆ เพื่อเลี่ยง Error
                      disabled={isPhoneUser} 
                    />
                    {isPhoneUser && <Text size="10px" c="dimmed" ta="right">ล็อคเบอร์โทรศัพท์ตามบัญชีที่เข้าสู่ระบบ</Text>}
                  </Stack>

                  <Button fullWidth size="xl" radius="xl" color="blue" h={60} onClick={handleCreateQueue} disabled={!name || phone.length !== 10} fw={900}>
                    ยืนยันการรับคิว
                  </Button>
                </Stack>
              </motion.div>
            )}

            {step === 'processing' && (
              <Center py={60}>
                <Stack align="center" gap="lg">
                  <Loader size={50} color="blue" type="bars" />
                  <Text fw={900} fz="xl" c="blue">กำลังประมวลผล...</Text>
                </Stack>
              </Center>
            )}

            {step === 'ticket' && (
              <motion.div key="ticket" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Stack align="center" gap="xl">
                  <DispenseMachine>
                    <PaperTicketContent 
                      queueNumber={newQueueData?.number} 
                      name={newQueueData?.name} 
                      hospitalName={selectedHospital?.name} 
                      status={newQueueData?.status} 
                    />
                  </DispenseMachine>
                  <Button fullWidth size="xl" radius="xl" color="blue" onClick={() => router.push('/myqueue')} fw={900} leftSection={<Ticket size={20} />}>
                    ดูคิวของฉัน
                  </Button>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Modal>
    </Box>
  );
}

function FacilityCard({ hospital, onSelect }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -10 }} onClick={() => onSelect(hospital)}>
      <Paper p={24} radius="32px" withBorder className="bg-white hover:shadow-2xl cursor-pointer transition-all border-slate-100 group">
        <Stack gap="md">
          <Group justify="space-between">
            <Badge color="blue" variant="light">OPEN NOW</Badge>
            <ActionIcon variant="subtle" color="blue" radius="xl" className="opacity-0 group-hover:opacity-100 transition-opacity"><PlusCircle size={24} /></ActionIcon>
          </Group>
          <Box>
            <Title order={4} fw={900} fz={20} className="line-clamp-2">{hospital.name}</Title>
            <Text size="xs" c="dimmed" mt={4}>ID: #{hospital.id}</Text>
          </Box>
          <Group gap="md">
            <Paper withBorder p="xs" radius="lg" className="flex-1 bg-slate-50/50">
              <Stack gap={2} align="center">
                <Text size="10px" fw={800} c="dimmed">WAITING</Text>
                <Group gap={4}><Clock size={14} color="#2563EB" /><Text size="sm" fw={800}>{hospital.default_wait_time}m</Text></Group>
              </Stack>
            </Paper>
            <Paper withBorder p="xs" radius="lg" className="flex-1 bg-blue-50/30 border-blue-100">
              <Stack gap={2} align="center">
                <Text size="10px" fw={800} c="blue.6">PREDICTED</Text>
                <Group gap={4}><Activity size={14} color="#2563EB" /><Text size="sm" fw={800} c="blue.8">{hospital.predicted_time}m</Text></Group>
              </Stack>
            </Paper>
          </Group>
          <Button fullWidth radius="xl" size="md" color="blue" fw={900} mt="sm">กดรับคิว</Button>
        </Stack>
      </Paper>
    </motion.div>
  );
}