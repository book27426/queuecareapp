"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, 
  SimpleGrid, Skeleton, ActionIcon, Paper, Button, Badge, 
  Grid, Avatar, Loader, Center, Alert, ThemeIcon, ScrollArea, 
  Container, // ✅ แก้ไข: เพิ่ม Container เข้ามาในชุด Import นี้แล้วครับ
  FileButton, Divider
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Pencil, X, ArrowRight, Users, LayoutGrid, ArrowLeft, Clock, 
  AlertCircle, Save, Building2, Camera, Hash
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const API_SECTION = process.env.NEXT_PUBLIC_SECTION_CREATE_API;

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

  const [sectionModalOpened, { open: openSection, close: closeSection }] = useDisclosure(false);
  const [staffModalOpened, { open: openStaff, close: closeStaff }] = useDisclosure(false);
  const [editingData, setEditingData] = useState(null);

  // 📡 1. GET DATA (ฉบับแก้ 401: ใส่ credentials และเช็ค Token)
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetchError(null);
    setIsSyncing(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("No access token found. Please login.");

      const res = await fetch(`${API_SECTION}?id=${hubId}`, {
        method: 'GET',
        credentials: 'include', // ✅ ส่ง Session Cookie
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (res.status === 401) throw new Error("Session expired. Please login again.");
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      const result = await res.json();
      
      if (result.success) {
        setMainSection(result.data.section);
        setListData(result.data.sub_sections || []);
        setStaffs(result.data.staffs || []);
        setLiveQueues(result.data.queues || []);
      }
    } catch (err) {
      if (!isSilent) setFetchError(err.message);
    } finally {
      setInitialLoading(false);
      setIsSyncing(false);
    }
  }, [hubId]);

  useEffect(() => {
    if (hubId) {
      fetchData();
      const interval = setInterval(() => fetchData(true), 5000);
      return () => clearInterval(interval);
    }
  }, [fetchData, hubId]);

  // 🧱 Loading State ด้วย Skeleton (ต้องการ Container ครอบ)
  if (initialLoading && !mainSection) {
    return (
      <Box p={50} className="min-h-screen bg-[#F8FAFC]">
        <Container size="xl">
          <Skeleton height={60} width="30%" mb="xl" radius="xl" />
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
            <Skeleton height={280} radius={40} />
            <Skeleton height={280} radius={40} />
            <Skeleton height={280} radius={40} />
          </SimpleGrid>
        </Container>
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
              {fetchError}
            </Alert>
          )}

          {/* Header */}
          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <UnstyledButton onClick={() => router.back()} className="group mb-2">
                <Group gap={6}>
                  <ArrowLeft size={16} className="text-blue-600 group-hover:-translate-x-1 transition-all" />
                  <Text size="xs" fw={900} className="text-blue-600 tracking-widest uppercase">Back</Text>
                </Group>
              </UnstyledButton>
              <Title className="text-4xl lg:text-6xl font-black text-[#1E293B] italic uppercase tracking-tighter">
                {mainSection?.name} <span className="text-blue-600">Hub.</span>
              </Title>
            </Stack>

            <Group gap="md">
              <Button variant="light" color="blue" radius="xl" size="lg" h={56} px={24} leftSection={<Users size={20}/>} onClick={openStaff}>
                STAFFS
              </Button>
              <Button 
                radius="xl" color="blue" size="lg" h={56} px={28} leftSection={<Plus size={20}/>} 
                onClick={() => { setEditingData(null); openSection(); }} 
                className="shadow-xl shadow-blue-500/20 font-bold italic"
              >
                ADD UNIT
              </Button>
            </Group>
          </Group>

          <Grid gutter={50}>
            {/* LEFT: Units List */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={30}>
                <AnimatePresence mode="popLayout">
                  {listData.map((sec) => (
                    <motion.div key={`unit-${sec.id}`} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Paper p={32} radius={40} withBorder className="bg-white hover:shadow-2xl transition-all border-slate-100 group relative overflow-hidden">
                        <Stack gap={24}>
                          <Group justify="space-between">
                            <ThemeIcon size={54} radius="20px" color="blue" variant="light">
                              <LayoutGrid size={26} />
                            </ThemeIcon>
                            <ActionIcon variant="light" color="blue" radius="xl" onClick={() => { setEditingData(sec); openSection(); }}><Pencil size={18}/></ActionIcon>
                          </Group>
                          
                          <Stack gap={4}>
                            <Text size="xs" fw={900} c="dimmed" className="uppercase tracking-widest opacity-60">ID: {sec.id}</Text>
                            <Title order={3} className="text-2xl font-black italic uppercase text-[#1E293B] truncate">{sec.name}</Title>
                          </Stack>

                          <Button 
                            fullWidth radius="xl" h={60} color="blue" 
                            rightSection={<ArrowRight size={20}/>} 
                            onClick={() => router.push(`/facilities/station/${sec.id}`)}
                            className="font-black italic shadow-lg"
                          >
                            OPEN CONSOLE
                          </Button>
                        </Stack>
                      </Paper>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SimpleGrid>
            </Grid.Col>

            {/* RIGHT: Live Feed Sidebar */}
            <Grid.Col span={{ base: 12, lg: 4 }} className="hidden lg:block">
              <Paper radius={40} withBorder p={35} className="bg-white sticky top-32 border-slate-100 shadow-2xl">
                <Stack gap="xl">
                  <Group justify="space-between">
                    <Title order={3} className="font-black italic uppercase">Live Feed</Title>
                    {isSyncing && <Loader size="xs" color="blue" />}
                  </Group>
                  <ScrollArea h={550}>
                    <Stack gap="md">
                      {liveQueues.length > 0 ? (
                        liveQueues.map((q) => (
                          <Paper key={`q-${q.id}`} p={22} withBorder radius="24px" className="bg-slate-50/50">
                            <Group justify="space-between">
                              <Stack gap={0}>
                                <Text fw={900} size="24px" className="text-blue-600 italic">#{q.number}</Text>
                                <Text size="xs" fw={800} c="dimmed" className="uppercase">{q.name || "User"}</Text>
                              </Stack>
                              <Badge color="blue" variant="light" radius="md">{q.status}</Badge>
                            </Group>
                          </Paper>
                        ))
                      ) : (
                        <Center h={200}><Text fw={700} c="dimmed">No active queues</Text></Center>
                      )}
                    </Stack>
                  </ScrollArea>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </main>

      <SectionManagementModal opened={sectionModalOpened} onClose={closeSection} data={editingData} hubId={hubId} onSuccess={fetchData} />
      <StaffModal opened={staffModalOpened} onClose={closeStaff} staffs={staffs} />
    </Box>
  );
}

// --- 🛠️ MODAL: Create/Edit ---
function SectionManagementModal({ opened, onClose, data, hubId, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) setName(data?.name || '');
  }, [opened, data]);

  const handleAction = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const isEdit = !!data;
      const url = isEdit ? `${API_SECTION}?id=${data.id}` : API_SECTION;
      
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('parent_id', Number(hubId));

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) { onSuccess(); onClose(); }
      else alert("Error: ไม่สามารถบันทึกได้");
    } catch (e) { alert("Network Error"); } 
    finally { setLoading(false); }
  };

  return (
    <Modal opened={opened} onClose={onClose} centered radius={40} size="500px" padding={0} withCloseButton={false}>
      <Box className="p-10">
        <Group justify="space-between" mb={40}>
          <Title order={2} className="font-black italic uppercase text-[#1E293B]">{data ? "Edit Unit" : "Add Unit"}</Title>
          <ActionIcon onClick={onClose} variant="subtle" color="gray" radius="xl" size="xl"><X size={24}/></ActionIcon>
        </Group>
        <Stack gap={40}>
          <TextInput 
            label="UNIT NAME" placeholder="e.g. Counter 1" size="xl" radius="xl" 
            value={name} onChange={(e) => setName(e.target.value)}
            classNames={{ input: 'bg-slate-50 font-bold h-16' }}
          />
          <Button fullWidth size="xl" radius="xl" color="blue" h={70} onClick={handleAction} loading={loading} className="font-black italic shadow-xl shadow-blue-500/20">
            {data ? "SAVE CHANGES" : "CREATE UNIT"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

// --- 👤 MODAL: Staff ---
function StaffModal({ opened, onClose, staffs }) {
  return (
    <Modal opened={opened} onClose={onClose} centered radius={40} size="500px" padding={0} withCloseButton={false}>
      <Box className="p-10">
        <Group justify="space-between" mb={32}>
          <Title order={2} className="font-black italic uppercase text-[#1E293B]">Staff List</Title>
          <ActionIcon onClick={onClose} variant="subtle" color="gray" radius="xl" size="xl"><X size={24}/></ActionIcon>
        </Group>
        <ScrollArea h={400}>
          <Stack gap="md">
            {(staffs || []).map((s, i) => (
              <Paper key={i} p={20} withBorder radius="24px" className="bg-slate-50/50">
                <Group gap="md">
                  <Avatar radius="xl" color="blue" variant="light" fw={800}>{s.first_name?.[0]}</Avatar>
                  <Stack gap={0}>
                    <Text fw={800} size="sm">{s.first_name} {s.last_name}</Text>
                    <Badge color="blue" variant="filled" size="xs">STAFF</Badge>
                  </Stack>
                </Group>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
        <Button fullWidth mt="xl" variant="light" color="blue" radius="xl" size="lg" onClick={onClose} className="font-bold">CLOSE</Button>
      </Box>
    </Modal>
  );
}

// --- HELPERS ---
function UnstyledButton({ children, onClick, className }) {
  return <button onClick={onClick} className={`bg-transparent border-0 p-0 cursor-pointer outline-none ${className}`}>{children}</button>;
}