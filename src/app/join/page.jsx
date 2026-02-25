"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, TextInput, SimpleGrid, Box, Text, Title, Group, Stack, Modal, 
  Paper, ThemeIcon, Button, ActionIcon, Avatar, Flex,
  Center, Badge, Loader
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Search, Clock, Ticket, X, Activity, User, Phone, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from "@/components/Navbar";
import { DispenseMachine, PaperTicketContent } from "@/components/QueueTicket";

const FACILITIES = [
  { id: 1, name: "กระทรวงสาธารณสุข", status: "OPEN", waitMin: 15, open: "08:00", close: "16:00", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Ministry_of_Public_Health_Thailand_Logo.png" },
  { id: 2, name: "โรงพยาบาลปทุมธานี", status: "OPEN", waitMin: 45, open: "07:30", close: "20:00", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Red_Cross_icon.svg/1024px-Red_Cross_icon.svg.png" },
  { id: 3, name: "คลินิกเฉพาะทาง", status: "CLOSED", waitMin: 300, open: "09:00", close: "17:00", logo: null }
];

export default function JoinQueuePage() {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);

  const [facilities, setFacilities] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [step, setStep] = useState('form'); 
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newQueueId, setNewQueueId] = useState("");

  const fetchSections = async (nameQuery) => {
  if (!nameQuery || nameQuery.trim() === "") {
    setFacilities([]);
    return;
  }
  
  setLoading(true);
  try {
    const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN || 'ใส่_TOKEN_ตรงนี้_เพื่อทดสอบ'; 
    
    const response = await fetch(`https://queuecaredev.vercel.app/api/v1/section?name=${encodeURIComponent(nameQuery)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server Error: ${response.status}`);
    }

    const result = await response.json();
    if (result.success && result.data) {
      setFacilities(result.data);
    }
  } catch (error) {
    console.error("❌ Fetch Detail:", error.message);

  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSections(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    setStep('form');
    setName(""); setPhone("");
    open();
  };

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar user={null} />

      <main className="flex-1 py-10 md:py-20">
        <Container size="xl">
          <Stack gap={50}>
            <Stack align="center" gap="md" className="text-center">
               <Title className="text-4xl md:text-6xl font-extrabold text-[#1E293B] tracking-tighter">
                 Select <span className="text-blue-600">Institution.</span>
               </Title>
               
               <Box className="w-full max-w-lg mt-4 px-4">
                 <TextInput
                   size="xl" radius="xl" placeholder="ค้นหาหน่วยงานที่คุณต้องการ..."
                   value={searchQuery} 
                   onChange={(e) => setSearchQuery(e.target.value)}
                   leftSection={loading ? <Loader size="xs" /> : <Search size={20} className="text-blue-600" />}
                 />
               </Box>
            </Stack>

            <SimpleGrid cols={{ base: 1, lg: 3 }} spacing={20}>
              {facilities.map((hospital) => (
                <FacilityCard 
                  key={hospital.id} 
                  hospital={hospital} 
                  onSelect={handleHospitalSelect} 
                />
              ))}
            </SimpleGrid>
            
            {facilities.length === 0 && searchQuery && !loading && (
              <Center p="xl">
                <Text c="dimmed">ไม่พบหน่วยงานที่คุณค้นหา</Text>
              </Center>
            )}
          </Stack>
        </Container>
      </main>

    </Box>
  );
} 

// 🏥 ปรับ FacilityCard ให้รับข้อมูลจาก API จริง
function FacilityCard({ hospital, onSelect }) {
  return (
    <motion.div whileHover={{ y: -5 }} onClick={() => onSelect(hospital)}>
      <Paper p={24} radius="24px" withBorder className="bg-white border-slate-100 hover:shadow-xl cursor-pointer">
        <Stack gap="xs">
          <Badge color="blue" variant="light" size="xs">ACTIVE UNIT</Badge>
          <Title order={4} className="text-lg font-extrabold text-[#1E293B] line-clamp-1">
            {hospital.name} {/* "Traffy" */}
          </Title>
          <Group gap="lg">
            <Group gap={4}>
              <Clock size={14} className="text-slate-400" />
              <Text className="text-[12px] font-bold text-slate-600">
                Wait: {hospital.default_wait_time}m {/* 10 */}
              </Text>
            </Group>
            <Group gap={4}>
              <Activity size={14} className="text-blue-600" />
              <Text className="text-[12px] font-bold text-blue-600">
                Predicted: {hospital.predicted_time}m {/* 15 */}
              </Text>
            </Group>
          </Group>
          <Button fullWidth mt="md" radius="xl" variant="light" color="blue">จองคิวหน่วยงานนี้</Button>
        </Stack>
      </Paper>
    </motion.div>
  );
}