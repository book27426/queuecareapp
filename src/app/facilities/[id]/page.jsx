"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, 
  SimpleGrid, ScrollArea, Skeleton, ActionIcon, Paper, Button, Badge, 
  Flex, Grid, Tabs, Avatar, Loader, Center, Alert, FileButton, Divider, ThemeIcon
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Pencil, X, RefreshCw, ArrowRight, Activity, 
  Users, LayoutGrid, Search, ArrowLeft, Clock, AlertCircle, Save, Camera,
  Hash, Trash2, Layers, Building2
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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

  // 1. ฟังก์ชันดึงข้อมูลหลัก
  const fetchData = useCallback(async (isSilent = false) => {
    if (!API_BASE.startsWith('http') || !API_QUEUE.startsWith('http')) {
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

      // 📋 1.2 ดึงรายการคิว (POST)
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
      if (!isSilent) setFetchError(`Failed to fetch: ${err.message}`);
    } finally {
      setInitialLoading(false);
      setIsSyncing(false);
    }
  }, [hubId]);

  useEffect(() => {
    if (!hubId) return;
    fetchData();
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, [fetchData, hubId]);

  if (initialLoading && !mainSection) {
    return (
      <Box p={50} bg="#F8FAFC" className="min-h-screen">
        <Stack gap="xl">
          <Skeleton height={50} width="40%" radius="xl" />
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={30}>
            <Skeleton height={300} radius={40} />
            <Skeleton height={300} radius={40} />
          </SimpleGrid>
        </Stack>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar />
      
      <main className="flex-1 py-10 max-w-[1600px] mx-auto w-full px-6 lg:px-10">
        <Stack gap={40}>
          {fetchError && (
            <Alert color="red" variant="light" icon={<AlertCircle size={18}/>} radius="xl" className="font-bold">
              {fetchError}. โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
            </Alert>
          )}

          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <UnstyledButton onClick={() => router.back()} className="group mb-2">
                <Group gap={6}>
                  <ArrowLeft size={16} className="text-blue-600 group-hover:-translate-x-1 transition-transform" />
                  <Text size="xs" fw={900} className="text-blue-600 tracking-widest uppercase">Back to Console</Text>
                </Group>
              </UnstyledButton>
              <Title className="text-4xl lg:text-6xl font-black text-[#1E293B] tracking-tighter italic uppercase">
                {mainSection?.name || "Hub"} <span className="text-blue-600">Control.</span>
              </Title>
            </Stack>

            <Group gap="md">
              <Button 
                variant="light" color="blue" radius="xl" size="lg" h={56} px={24}
                leftSection={<Users size={20}/>} onClick={openStaffModal}
                className="font-bold shadow-sm"
              >
                STAFFS
              </Button>
              <Button 
                radius="xl" color="blue" size="lg" h={56} px={28}
                leftSection={<Plus size={20}/>} onClick={openSectionModal}
                className="font-black italic shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
              >
                ADD UNIT
              </Button>
            </Group>
          </Group>

          <Grid gutter={50}>
            {/* LEFT: Stations List */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap={32}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={30}>
                  <AnimatePresence>
                    {listData.map((sec) => (
                      <motion.div key={sec.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Paper p={32} radius={40} withBorder className="bg-white hover:shadow-2xl transition-all group border-slate-100 relative overflow-hidden">
                          <Stack gap={24}>
                            <Group justify="space-between">
                              <ThemeIcon size={54} radius="20px" color="blue" variant="light">
                                <LayoutGrid size={26} />
                              </ThemeIcon>
                              <Badge variant="dot" color="green" size="lg" fw={800}>ONLINE</Badge>
                            </Group>
                            
                            <Stack gap={4}>
                              <Text size="xs" fw={900} c="dimmed" className="tracking-widest uppercase opacity-60">Station ID: {sec.id}</Text>
                              <Title order={3} className="text-2xl font-black text-[#1E293B] uppercase italic">{sec.name}</Title>
                              <Text size="sm" fw={700} c="dimmed">Active Queues: {liveQueues.filter(q => q.section_id === sec.id).length}</Text>
                            </Stack>

                            <Button 
                              fullWidth radius="xl" h={60} color="blue" 
                              rightSection={<ArrowRight size={20}/>} 
                              className="font-black italic shadow-lg shadow-blue-500/10 group-hover:translate-y-[-2px] transition-all"
                            >
                              OPEN CONSOLE
                            </Button>
                          </Stack>
                        </Paper>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </SimpleGrid>
                
                {listData.length === 0 && (
                  <Paper p={80} radius={40} withBorder className="bg-white border-dashed text-center">
                    <Stack align="center" gap="md">
                      <Building2 size={48} className="text-slate-300" />
                      <Text fw={700} c="dimmed">ยังไม่มีหน่วยงานย่อยใน Hub นี้</Text>
                      <Button variant="subtle" onClick={openSectionModal} radius="xl">เริ่มสร้าง Unit แรก</Button>
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Grid.Col>
            
            {/* RIGHT: Live Feed */}
            <Grid.Col span={{ base: 12, lg: 4 }} className="hidden lg:block">
              <Paper radius={40} withBorder p={35} className="bg-white shadow-2xl border-slate-100 sticky top-32">
                <Stack gap="xl">
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Title order={3} className="font-black italic text-[#1E293B] uppercase">Live Feed</Title>
                      <Text size="xs" fw={800} c="blue" className="tracking-widest">REAL-TIME UPDATE</Text>
                    </Stack>
                    {isSyncing && <Loader size="sm" color="blue" />}
                  </Group>

                  <ScrollArea h={550} offsetScrollbars>
                    <Stack gap="md">
                      {liveQueues.length > 0 ? (
                        liveQueues.map((q) => (
                          <Paper key={q.id} p={20} withBorder radius="24px" className="bg-slate-50/50 hover:bg-white transition-all border-slate-100">
                            <Group justify="space-between">
                              <Stack gap={0}>
                                <Text fw={900} size="xl" className="text-blue-600 italic">#{q.number}</Text>
                                <Text size="xs" fw={800} className="text-[#1E293B] uppercase">{q.name || "General User"}</Text>
                              </Stack>
                              <Badge color="blue" variant="light" radius="md">In Progress</Badge>
                            </Group>
                          </Paper>
                        ))
                      ) : (
                        <Center h={200}>
                          <Stack align="center" gap="xs">
                            <Clock size={32} className="text-slate-300" />
                            <Text size="sm" fw={700} c="dimmed">ยังไม่มีคิวในขณะนี้</Text>
                          </Stack>
                        </Center>
                      )}
                    </Stack>
                  </ScrollArea>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </main>

      {/* --- ✅ Modals Section --- */}
      <StaffModal opened={staffModalOpened} onClose={closeStaffModal} staffs={staffs} />
      
      {/* แก้ปัญหา ReferenceError ด้วยการเรียกใช้คอมโพเนนต์ที่เขียนไว้ด้านล่าง */}
      <SectionManagementModal 
        opened={sectionModalOpened} 
        onClose={closeSectionModal} 
        hubId={hubId} 
        onSuccess={() => { fetchData(); closeSectionModal(); }} 
      />
    </Box>
  );
}

// --- 🛠️ MODAL: Section Management (แก้ ReferenceError) ---
function SectionManagementModal({ opened, onClose, hubId, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(API_BASE, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: name.trim(),
          parent_id: Number(hubId)
        })
      });
      if (res.ok) {
        setName('');
        onSuccess();
      } else {
        alert("Failed to create unit");
      }
    } catch (e) {
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      opened={opened} onClose={onClose} centered radius="40px" 
      size="500px" padding={0} withCloseButton={false}
    >
      <Box className="p-10">
        <Group justify="space-between" mb={40}>
          <Stack gap={0}>
            <Title order={2} className="font-black italic uppercase text-[#1E293B]">Add New Unit</Title>
            <Text size="xs" fw={800} c="dimmed" className="tracking-widest uppercase">Sub-Section Management</Text>
          </Stack>
          <ActionIcon onClick={onClose} variant="subtle" color="gray" radius="xl" size="xl"><X size={24}/></ActionIcon>
        </Group>

        <Stack gap="xl">
          <TextInput 
            label={<Text size="xs" fw={900} c="dimmed" className="uppercase mb-2 tracking-widest">Unit Name</Text>}
            placeholder="เช่น แผนกอายุรกรรม, เคาน์เตอร์ A" 
            size="xl" radius="xl" value={name} onChange={(e) => setName(e.target.value)}
            classNames={{ input: 'bg-slate-50 border-transparent focus:bg-white font-bold h-16' }}
          />
          <Button 
            fullWidth size="xl" radius="xl" color="blue" h={70}
            leftSection={<Save size={20}/>}
            onClick={handleCreate} loading={loading}
            className="shadow-2xl shadow-blue-500/20 font-black italic text-xl hover:translate-y-[-2px] transition-all"
          >
            CREATE UNIT
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

// --- 👤 MODAL: Staff Directory ---
function StaffModal({ opened, onClose, staffs }) {
  return (
    <Modal 
      opened={opened} onClose={onClose} centered radius="40px" 
      size="500px" padding={0} withCloseButton={false}
    >
      <Box className="p-10">
        <Group justify="space-between" mb={32}>
          <Stack gap={0}>
            <Title order={2} className="font-black italic uppercase text-[#1E293B]">Staff Directory</Title>
            <Text size="xs" fw={800} c="blue" className="tracking-widest">ACTIVE MEMBERS</Text>
          </Stack>
          <ActionIcon onClick={onClose} variant="subtle" color="gray" radius="xl" size="xl"><X size={24}/></ActionIcon>
        </Group>

        <ScrollArea h={400} offsetScrollbars>
          <Stack gap="md" className="pr-2">
            {staffs.length > 0 ? (
              staffs.map((s) => (
                <Paper key={s.id} p={20} withBorder radius="24px" className="bg-slate-50/50 border-slate-100">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="md">
                      <Avatar radius="xl" color="blue" variant="light" fw={800}>
                        {s.first_name?.[0]}{s.last_name?.[0]}
                      </Avatar>
                      <Stack gap={0}>
                        <Text fw={800} size="sm" className="text-[#1E293B]">{s.first_name} {s.last_name}</Text>
                        <Text size="xs" c="dimmed" fw={700}>{s.email || "No email"}</Text>
                      </Stack>
                    </Group>
                    <Badge color="blue" variant="filled" radius="md" size="sm" className="font-bold">{s.role || "STAFF"}</Badge>
                  </Group>
                </Paper>
              ))
            ) : (
              <Center h={200}>
                <Text fw={700} c="dimmed">ไม่พบรายชื่อ Staff ในหน่วยงานนี้</Text>
              </Center>
            )}
          </Stack>
        </ScrollArea>
        
        <Button fullWidth mt="xl" variant="light" color="blue" radius="xl" size="lg" onClick={onClose} className="font-bold">
          CLOSE DIRECTORY
        </Button>
      </Box>
    </Modal>
  );
}

// Helper: UnstyledButton (ใช้ภายใน Page)
function UnstyledButton({ children, onClick, className }) {
  return (
    <button onClick={onClick} className={`bg-transparent border-0 p-0 cursor-pointer outline-none ${className}`}>
      {children}
    </button>
  );
}