"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, 
  SimpleGrid, ScrollArea, Skeleton, ActionIcon, Paper, Button, Badge, Flex, Grid, Tabs, Avatar, Loader, Center, Alert, FileButton, Divider
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Pencil, X, RefreshCw, ArrowRight, Activity, 
  Users, LayoutGrid, Search, ArrowLeft, Clock, AlertCircle, Save, Camera
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from 'next/navigation';

// แก้ไข: เพิ่ม Fallback URL ตรงๆ เพื่อป้องกันค่า undefined จาก .env
const API_BASE = process.env.NEXT_PUBLIC_SECTION_CREATE_API || "https://queuecaredev.vercel.app/api/v1/section";
const API_QUEUE = process.env.NEXT_PUBLIC_QUEUE_API || "https://queuecaredev.vercel.app/api/v1/queue";

export default function FacilityStationPage() {
  const params = useParams();
  const router = useRouter(); 
  const hubId = params.id;

  const [initialLoading, setInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); 
  const [mainSection, setMainSection] = useState(null);
  const [listData, setListData] = useState([]);
  const [liveQueues, setLiveQueues] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const [sectionModalOpened, { open: openSectionModal, close: closeSectionModal }] = useDisclosure(false);
  const [staffModalOpened, { open: openStaffModal, close: closeStaffModal }] = useDisclosure(false);
  const [editingSection, setEditingSection] = useState(null);

  // 1. ฟังก์ชันดึงข้อมูลหลัก (เพิ่มการตรวจสอบ URL ก่อนยิง)
  const fetchData = useCallback(async (isSilent = false) => {
    // ป้องกันการยิงถ้า URL ไม่ถูกต้อง
    if (!API_BASE.startsWith('http') || !API_QUEUE.startsWith('http')) {
      console.error("Invalid API URLs. Please check your .env file.");
      if (!isSilent) setFetchError("API Configuration Error: URL missing");
      return;
    }

    if (!isSilent) setFetchError(null);
    setIsSyncing(true);

    try {
      const token = localStorage.getItem('access_token');

      // 🏢 1.1 ดึงข้อมูลหน่วยงาน (GET)
      const res = await fetch(`${API_BASE}?id=${hubId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error(`Section API: ${res.status}`);
      const result = await res.json();
      
      if (result.success) {
        setMainSection(result.data.section);
        setListData(result.data.sub_sections || []);
        setStaffs(result.data.staffs || []);
      }

      // 📋 1.2 ดึงรายการคิว (POST ตาม Spec)
      const qRes = await fetch(API_QUEUE, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!qRes.ok) throw new Error(`Queue API: ${qRes.status}`);
      const qResult = await qRes.json();
      
      if (qResult.data) {
        setLiveQueues(qResult.data);
      }
      
    } catch (err) {
      console.error("Fetch Error:", err.message);
      // แจ้ง Error บน UI ถ้าเป็นการโหลดครั้งแรกหรือกด Refresh เอง
      if (!isSilent) setFetchError(`Failed to fetch: ${err.message}`);
    } finally {
      setInitialLoading(false);
      setIsSyncing(false);
    }
  }, [hubId]);

  // 2. ระบบ Auto-Sync (Polling ทุก 5 วินาที)
  useEffect(() => {
    if (!hubId) return;
    
    fetchData(); // เรียกครั้งแรก
    
    const interval = setInterval(() => {
      fetchData(true); // Polling เงียบๆ (isSilent = true)
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchData, hubId]);

  if (initialLoading && !mainSection) return <Box p={50}><Skeleton height={600} radius={40} /></Box>;

  // --- 🧱 Render UI ---
  // (ส่วนที่เหลือของโค้ด UI เหมือนเดิม แต่เพิ่มการดัก Error ที่ Alert)
  
  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar />
      <main className="flex-1 lg:p-10 max-w-[1800px] mx-auto w-full z-10">
        <Box className="px-6">
          {fetchError && (
            <Alert color="red" variant="light" icon={<AlertCircle size={18}/>} mb="xl" radius="md">
              {fetchError}. โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือปิด-เปิด npm run dev ใหม่
            </Alert>
          )}
          
          <Grid gutter={50}>
            {/* Stations Content และ Queue Feed Content ใส่ที่นี่ตามปกติ */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
               <Stack gap={40}>
                 <Title className="text-3xl lg:text-5xl font-black text-[#1E293B] tracking-tighter italic">
                   {mainSection?.name || "Hub"} <span className="text-blue-600">Control.</span>
                 </Title>
                 {/* ...รายการ Units... */}
                 <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={25}>
                    {listData.map((sec) => (
                      <Paper key={sec.id} p={24} radius={40} withBorder className="bg-white hover:shadow-xl transition-all">
                        <Text fw={800}>{sec.name}</Text>
                        <Button fullWidth mt="md" radius="xl" variant="light">Open Console</Button>
                      </Paper>
                    ))}
                 </SimpleGrid>
               </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, lg: 4 }} className="hidden lg:block">
               {/* Queue Feed Content */}
               <Paper radius={40} withBorder p={30} className="bg-white shadow-2xl">
                  <Title order={3} mb="xl">Live Feed {isSyncing && <Loader size="xs" ml="xs" />}</Title>
                  <Stack gap="md">
                    {liveQueues.map((q) => (
                      <Paper key={q.id} p="md" withBorder radius="lg">
                        <Text fw={900} size="xl">{q.number}</Text>
                        <Text size="xs" c="dimmed">{q.name}</Text>
                      </Paper>
                    ))}
                  </Stack>
               </Paper>
            </Grid.Col>
          </Grid>
        </Box>
      </main>

      <StaffModal opened={staffModalOpened} onClose={closeStaffModal} staffs={staffs} />
      <SectionManagementModal opened={sectionModalOpened} onClose={closeSectionModal} hubId={hubId} onSuccess={fetchData} />
    </Box>
  );
}

// Modal สำหรับแสดงรายชื่อ Staff
function StaffModal({ opened, onClose, staffs }) {
  return (
    <Modal opened={opened} onClose={onClose} centered radius="40px" title="Staff Directory">
       <ScrollArea h={400}>
         <Stack gap="md">
           {staffs.map((s) => (
             <Paper key={s.id} p="md" withBorder radius="lg">
               <Group justify="space-between">
                 <Text fw={800}>{s.first_name} {s.last_name}</Text>
                 <Badge color="blue">{s.role}</Badge>
               </Group>
             </Paper>
           ))}
         </Stack>
       </ScrollArea>
    </Modal>
  );
}