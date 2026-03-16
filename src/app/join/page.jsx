"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, TextInput, SimpleGrid, Box, Text, Title, Group, Stack, Modal, 
  Paper, Button, ActionIcon, Loader, Center, Badge, Alert
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Search, X, Building2, Clock, Activity, User, 
  Phone, Ticket, PlusCircle, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from "@/components/Navbar";
import { DispenseMachine, PaperTicketContent } from "@/components/QueueTicket";

export default function JoinQueuePage() {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);

  // --- 📊 States ---
  const [facilities, setFacilities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [step, setStep] = useState('form'); // 'form' | 'processing' | 'ticket'
  
  // Data for Booking
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newQueueData, setNewQueueData] = useState(null);
  
  // Login Status
  const [isPhoneUser, setIsPhoneUser] = useState(false);

  // ✅ [A] เช็คสถานะ Login และดึงเบอร์โทรมาใส่รอไว้ (Client Side Only)
  useEffect(() => {
    const savedPhone = localStorage.getItem('user_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      setIsPhoneUser(true);
    }
  }, []);

  const fetchSections = useCallback(async (nameQuery = "") => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = '/api/v1/section';
      const url =  `${baseUrl}?name=${encodeURIComponent(nameQuery.trim())}`

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();
      if (result.success && result.data) {
        setFacilities(result.data);
      } else {
        setFacilities([]);
      }
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  }, []);

  // โหลดข้อมูลครั้งแรก
  useEffect(() => {
    fetchSections(""); 
  }, [fetchSections]);

  // ระบบค้นหา (Debounce)
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

  // --- 🎫 2. ฟังก์ชันจองคิว (ตาม API Spec: POST /api/v1/queue) ---
const handleCreateQueue = async () => {
    if (!name.trim() || phone.length !== 10) return;
    setStep('processing');
    setError(null);

    try {
        const response = await fetch("https://queuecaredev.vercel.app/api/v1/queue", {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                section_id: Number(selectedHospital.id), 
                name: name.trim(), 
                phone_num: phone 
            })
        });

        const result = await response.json();
        console.log("📥 Result from POST:", result);

        if (result.success && result.data) {
            // ✅ ดึงข้อมูลจากก้อน data ของการ POST มาใช้เลย
            const queueInfo = result.data; 
            
            setNewQueueData(queueInfo); 
            
            // ✨ สั่งเปลี่ยน Step ทันที ข้อมูลจะถูกส่งไปที่ตั๋ว
            setStep('ticket');
        } else {
            setError(result.message || "จองคิวไม่สำเร็จ");
            setStep('form');
        }
    } catch (err) {
        setError("การเชื่อมต่อมีปัญหา");
        setStep('form');
    }
};

  return (
    <Box className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="py-12 md:py-20">
        <Container size="xl">
          <Stack gap={40}>
            {/* ส่วนค้นหา */}
            <Stack align="center" className="text-center">
              <Title order={1} fz={{ base: 32, md: 48 }} fw={900}>
                Select <Text span c="blue" inherit>Institution.</Text>
              </Title>
              <Text c="dimmed" fw={500}>ค้นหาและเลือกหน่วยงานเพื่อรับบัตรคิวออนไลน์</Text>
              
              <Box w="100%" maw={500} mt={20}>
                <TextInput
                  size="xl" radius="xl" 
                  placeholder="พิมพ์ชื่อหน่วยงานที่ต้องการ..."
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

            {/* 🏥 รายการหน่วยงาน */}
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

            {/* Loading & Empty State */}
            {loading && <Center py={100}><Stack align="center"><Loader size="xl" variant="dots" /><Text c="dimmed" fw={700}>กำลังค้นหาข้อมูล...</Text></Stack></Center>}
            {!loading && facilities.length === 0 && (
              <Center p={80} className="bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <Stack align="center" gap="sm">
                  <Building2 size={48} color="#CBD5E1" />
                  <Text c="dimmed" fw={800}>ไม่พบหน่วยงานที่คุณค้นหา</Text>
                  <Button variant="light" radius="xl" onClick={() => setSearchQuery("")}>แสดงทั้งหมด</Button>
                </Stack>
              </Center>
            )}
          </Stack>
        </Container>
      </main>

      {/* 🎫 Modal จองคิว */}
      <Modal 
        opened={opened} onClose={close} centered radius="40px" withCloseButton={false} 
        padding={0} size={step === 'ticket' ? "450px" : "400px"}
      >
        <Box p={30}>
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Stack gap="xl">
                  <Group justify="space-between">
                    <Box>
                      <Title order={3} fw={900}>จองคิวบริการ</Title>
                      <Badge color="blue" variant="light" mt={5}>{selectedHospital?.name}</Badge>
                    </Box>
                    <ActionIcon variant="light" color="gray" radius="xl" onClick={close}><X size={18} /></ActionIcon>
                  </Group>

                  {error && <Alert color="red" variant="light" radius="md" icon={<AlertCircle size={16} />}>{error}</Alert>}

                  <Stack gap="md">
                    <TextInput 
                      label="ชื่อ-นามสกุล" placeholder="ระบุชื่อของคุณ" radius="md" size="md" 
                      value={name} onChange={(e) => setName(e.target.value)} 
                      leftSection={<User size={18} color="#2563EB" />} 
                    />
                    <TextInput 
                      label="เบอร์โทรศัพท์" placeholder="08XXXXXXXX" radius="md" size="md" maxLength={10} 
                      value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                      leftSection={<Phone size={18} color="#2563EB" />}
                      disabled={isPhoneUser} // ✅ ล็อคเบอร์ถ้า Login มาแล้ว
                    />
                  </Stack>

                  <Button fullWidth size="xl" radius="xl" color="blue" h={60} onClick={handleCreateQueue} disabled={!name || phone.length !== 10} fw={900}>
                    ยืนยันการรับคิว
                  </Button>
                </Stack>
              </motion.div>
            )}

            {step === 'processing' && (
              <Center py={60}><Stack align="center"><Loader size={50} color="blue" type="bars" /><Text fw={800} c="blue">กำลังออกบัตรคิว...</Text></Stack></Center>
            )}

{step === 'ticket' && (
  <motion.div key="ticket" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
    <Stack align="center" gap="xl">
      {/* 🎰 ตรวจสอบว่ามีข้อมูลจริงไหม ถ้าไม่มีให้หมุนรอก่อน */}
      {!newQueueData ? (
        <Center h={200}><Loader color="blue" /></Center>
      ) : (
        <DispenseMachine>
          {/* 🎫 ดึงข้อมูลจาก API มาโชว์บนกระดาษ */}
          <PaperTicketContent 
            queueNumber={newQueueData.number || "---"} 
            name={newQueueData.name || name} 
            hospitalName={selectedHospital?.name || "หน่วยงาน"} 
            status={newQueueData.status || "waiting"} 
          />
        </DispenseMachine>
      )}
      
      <Button 
        fullWidth size="xl" radius="xl" color="blue" 
        onClick={() => router.push('/myqueue')} 
        fw={900}
      >
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

// 🏥 ส่วนการ์ดแสดงหน่วยงาน
function FacilityCard({ hospital, onSelect }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -10 }} onClick={() => onSelect(hospital)}>
      <Paper p={24} radius="32px" withBorder className="bg-white hover:shadow-2xl cursor-pointer transition-all border-slate-100 group">
        <Stack gap="md">
          <Group justify="space-between">
            <Badge color="blue" variant="light" radius="sm">OPEN NOW</Badge>
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
          <Button fullWidth radius="xl" size="md" variant="filled" color="blue" fw={900} mt="sm">กดรับคิว</Button>
        </Stack>
      </Paper>
    </motion.div>
  );
}