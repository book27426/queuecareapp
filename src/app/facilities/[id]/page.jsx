"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, Select,
  SimpleGrid, Skeleton, ActionIcon, Paper, Button, Badge, 
  Grid, Avatar, Loader, Center, Alert, ThemeIcon, ScrollArea, 
  Container, FileButton, Divider, UnstyledButton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Pencil, X, ArrowRight, Users, LayoutGrid, ArrowLeft, Clock, 
  AlertCircle, Save, Building2, Camera, RefreshCw, Timer, UserPlus, Hourglass
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ API Endpoints
const API_SECTION = "https://queuecaredev.vercel.app/api/v1/section";
const API_INVITE = "https://queuecaredev.vercel.app/api/v1/section/invite_code";

export default function FacilityHubPage() {
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

  const [addModalOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [staffModalOpened, { open: openStaff, close: closeStaff }] = useDisclosure(false);
  const [editingData, setEditingData] = useState(null);

  // 📊 Mock Data สำหรับ Statistics
  const statsMock = {
    avgOpTime: "12m 30s",
    avgNewQueue: "24/h",
    avgWaitTime: "18m"
  };

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetchError(null);
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_SECTION}?id=${hubId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await res.json();
      if (result.success) {
        setMainSection(result.data.section);
        setListData(result.data.sub_sections || []);
        setStaffs(result.data.staffs || []);
        setLiveQueues(result.data.queues || []);
      }
    } catch (err) {
      if (!isSilent) setFetchError("เชื่อมต่อ API ล้มเหลว");
    } finally {
      setInitialLoading(false);
      setIsSyncing(false);
    }
  }, [hubId]);

  useEffect(() => {
    if (hubId) {
      fetchData();
      const interval = setInterval(() => fetchData(true), 30000);
      return () => clearInterval(interval);
    }
  }, [fetchData, hubId]);

  if (initialLoading && !mainSection) {
    return <Box p={50} bg="#F8FAFC" className="min-h-screen"><Container size="xl"><Skeleton height={600} radius={40} /></Container></Box>;
  }

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar />
      
      <main className="flex-1 py-10 max-w-[1600px] mx-auto w-full px-6 lg:px-10">
        <Stack gap={40}>
          {fetchError && <Alert color="red" variant="light" radius="xl">{fetchError}</Alert>}

          {/* Header */}
          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <UnstyledButton onClick={() => router.back()} className="text-blue-600 font-black flex items-center gap-2 hover:opacity-70 transition-all">
                <ArrowLeft size={16}/> BACK
              </UnstyledButton>
              <Title className="text-4xl lg:text-6xl font-black text-[#1E293B] italic uppercase tracking-tighter">
                {mainSection?.name} <span className="text-blue-600">Hub.</span>
              </Title>
            </Stack>

            <Group gap="md">
              <Button variant="light" color="blue" radius="xl" size="lg" h={56} leftSection={<Users size={20}/>} onClick={openStaff}>STAFFS</Button>
              <Button 
                radius="xl" color="blue" size="lg" h={56} px={28} leftSection={<Plus size={20}/>} 
                onClick={() => { setEditingData(null); openAdd(); }} 
                className="font-black italic shadow-xl shadow-blue-500/20"
              >
                ADD UNIT
              </Button>
            </Group>
          </Group>

          {/* ✅ 1. OVERALL STATISTICS (Mock Data) */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {[
              { label: 'AVG OP TIME', value: statsMock.avgOpTime, icon: Timer, color: 'blue' },
              { label: 'NEW QUEUE /H', value: statsMock.avgNewQueue, icon: UserPlus, color: 'teal' },
              { label: 'AVG WAIT TIME', value: statsMock.avgWaitTime, icon: Hourglass, color: 'indigo' }
            ].map((stat, idx) => (
              <Paper key={idx} p="xl" radius={32} withBorder className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all">
                <Group justify="space-between">
                  <Stack gap={0}>
                    <Text size="xs" fw={900} c="dimmed" className="tracking-widest uppercase mb-1">{stat.label}</Text>
                    <Title order={2} className="font-black italic text-[#1E293B]">{stat.value}</Title>
                  </Stack>
                  <ThemeIcon size={52} radius="xl" variant="light" color={stat.color}>
                    <stat.icon size={26} />
                  </ThemeIcon>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>

          {/* ✅ 2. MAIN CONTENT AREA */}
          <Grid gutter={50}>
            {/* LEFT: Sub-sections List */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={32}>
                <AnimatePresence mode="popLayout">
                  {listData.map((unit) => (
                    <motion.div key={unit.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Paper p={32} radius={40} withBorder className="bg-white hover:shadow-2xl transition-all border-slate-100 group relative">
                        <Stack gap={24}>
                          <Group justify="space-between">
                            <Avatar src={unit.image_url} size={60} radius="20px" color="blue" variant="light"><Building2 size={26} /></Avatar>
                            <ActionIcon variant="light" color="blue" radius="xl" size="xl" onClick={() => { setEditingData(unit); openAdd(); }}><Pencil size={18}/></ActionIcon>
                          </Group>
                          <Stack gap={4}>
                            <Title order={3} className="text-2xl font-black italic text-[#1E293B] uppercase">{unit.name}</Title>
                            <Text size="sm" fw={800} c="dimmed" className="tracking-widest">Active: {liveQueues.filter(q => q.section_id === unit.id).length} Queues</Text>
                          </Stack>
                          <Button 
                            fullWidth radius="xl" h={60} color="blue" rightSection={<ArrowRight size={20}/>} 
                            onClick={() => router.push(`/facilities/station/${unit.id}`)} 
                            className="font-black italic shadow-lg shadow-blue-500/5 group-hover:-translate-y-1 transition-all"
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
                <Group justify="space-between" mb="xl">
                  <Title order={3} className="font-black italic uppercase text-[#1E293B]">Live Feed</Title>
                  {isSyncing && <Loader size="xs" color="blue" />}
                </Group>
                <ScrollArea h={550}>
                  <Stack gap="md">
                    {liveQueues.length > 0 ? liveQueues.map((q) => (
                      <Paper key={q.id} p={22} withBorder radius="24px" className={`transition-all ${q.status === 'calling' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-slate-50/50'}`}>
                        <Group justify="space-between">
                          <Stack gap={0}>
                            <Text fw={900} size="24px" className={`italic leading-none ${q.status === 'calling' ? 'text-white' : 'text-blue-600'}`}>#{q.number}</Text>
                            <Text size="xs" fw={800} className={`uppercase mt-1 ${q.status === 'calling' ? 'text-blue-100' : 'text-slate-400'}`}>{q.status}</Text>
                          </Stack>
                          <Badge variant={q.status === 'calling' ? 'white' : 'light'} color="blue" radius="md">MONITOR</Badge>
                        </Group>
                      </Paper>
                    )) : <Center h={200}><Text fw={700} c="dimmed">No active queues</Text></Center>}
                  </Stack>
                </ScrollArea>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </main>

      {/* ✅ Add/Edit Modal (ฉบับสมบูรณ์) */}
      <AddUnitModal opened={addModalOpened} onClose={closeAdd} data={editingData} hubId={hubId} onSuccess={fetchData} />
      <StaffModal opened={staffModalOpened} onClose={closeStaff} staffs={staffs} />
    </Box>
  );
}

// --- 🛠️ MODAL COMPONENT ---
function AddUnitModal({ opened, onClose, data, hubId, onSuccess }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [inviteCode, setInviteCode] = useState(''); 
  const [expireMin, setExpireMin] = useState('1440'); 
  const [cooldown, setCooldown] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      setName(data?.name || '');
      setPreview(data?.image_url || '');
      setInviteCode(data?.invite_code || ''); 
      setFile(null);
    }
  }, [opened, data]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleAction = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const isEdit = !!data;
      const url = isEdit ? `${API_SECTION}?id=${data.id}` : API_SECTION;
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('parent_id', Number(hubId));
      if (file) formData.append('image', file);

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        credentials: 'include',
        body: formData
      });
      if (res.ok) { onSuccess(); onClose(); }
    } catch (e) { alert("Save failed"); } 
    finally { setLoading(false); }
  };

  const handleGenerateCode = async () => {
    if (!data?.id || cooldown > 0) return;
    setGenLoading(true);
    try {
      const res = await fetch(`${API_INVITE}?id=${data.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expire_minutes: Number(expireMin) })
      });
      const result = await res.json();
      if (result.success) {
        setInviteCode(result.data.invite_code);
        setCooldown(60);
      }
    } catch (e) { alert("Error generating code"); }
    finally { setGenLoading(false); }
  };

  return (
    <Modal opened={opened} onClose={onClose} centered radius={40} size="500px" padding={0} withCloseButton={false}>
      <Box className="p-10">
        <Group justify="space-between" mb={40}>
          <Title order={2} className="font-black italic uppercase text-[#1E293B]">{data ? "Unit Settings" : "Add Unit"}</Title>
          <ActionIcon onClick={onClose} variant="subtle" color="gray" radius="xl" size="xl"><X size={24}/></ActionIcon>
        </Group>
        
        <Stack gap={30}>
          <Stack align="center" gap="md">
            <Box className="relative group">
              <Avatar src={preview} size={120} radius="32px" color="blue" className="shadow-2xl border-4 border-white transition-all group-hover:scale-105" />
              <FileButton onChange={(f) => { setFile(f); if(f) setPreview(URL.createObjectURL(f)); }} accept="image/*">
                {(props) => <ActionIcon {...props} className="absolute -bottom-2 -right-2 shadow-xl border-2 border-white" color="blue" radius="xl" size="xl" variant="filled"><Camera size={20}/></ActionIcon>}
              </FileButton>
            </Box>
            <Text size="xs" fw={900} c="dimmed" className="tracking-widest uppercase">Identity Icon</Text>
          </Stack>

          <TextInput label="UNIT NAME" placeholder="e.g. Counter 1" size="xl" radius="xl" value={name} onChange={(e) => setName(e.target.value)} classNames={{ input: 'bg-slate-50 font-bold h-16' }} />

          {data && (
            <Paper p={24} radius={24} withBorder className="bg-blue-50/10 border-dashed border-blue-200">
              <Stack gap="md">
                <Text size="xs" fw={900} c="blue" className="uppercase tracking-widest">Invitation Code</Text>
                <Select label="SET EXPIRY" value={expireMin} onChange={setExpireMin} radius="md"
                  data={[{ value: '1', label: '1 Minute' }, { value: '30', label: '30 Minutes' }, { value: '60', label: '1 Hour' }, { value: '1440', label: '1 Day' }, { value: '10080', label: '1 Week' }]}
                />
                <Group align="flex-end" gap="xs">
                  <TextInput value={inviteCode} readOnly placeholder="CODE" className="flex-1" radius="md" classNames={{ input: 'font-black tracking-widest text-center h-12' }} />
                  <Button onClick={handleGenerateCode} loading={genLoading} disabled={cooldown > 0} color="blue" h={48} radius="md" className="font-bold min-w-[80px]">
                    {cooldown > 0 ? `${cooldown}s` : "GEN"}
                  </Button>
                </Group>
              </Stack>
            </Paper>
          )}

          <Button fullWidth size="xl" radius="xl" color="blue" h={74} onClick={handleAction} loading={loading} className="shadow-2xl shadow-blue-500/20 font-black italic text-xl">
            {data ? "SAVE CHANGES" : "CREATE UNIT"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

// --- 👤 MODAL: Staff Directory ---
function StaffModal({ opened, onClose, staffs }) {
  return (
    <Modal opened={opened} onClose={onClose} centered radius={40} size="500px" padding={0} withCloseButton={false}>
      <Box className="p-10">
        <Group justify="space-between" mb={32}><Title order={2} className="font-black italic uppercase">Staff List</Title><ActionIcon onClick={onClose} variant="subtle" color="gray" radius="xl" size="xl"><X size={24}/></ActionIcon></Group>
        <ScrollArea h={400}><Stack gap="md">{(staffs || []).map((s, i) => (<Paper key={i} p={20} withBorder radius="24px" className="bg-slate-50/50"><Group gap="md"><Avatar radius="xl" color="blue" variant="light" fw={800}>{s.first_name?.[0]}</Avatar><Stack gap={0}><Text fw={800} size="sm">{s.first_name} {s.last_name}</Text><Badge color="blue" variant="filled" size="xs">ACTIVE</Badge></Stack></Group></Paper>))}</Stack></ScrollArea>
        <Button fullWidth mt="xl" variant="light" color="blue" radius="xl" size="lg" onClick={onClose} className="font-bold">CLOSE</Button>
      </Box>
    </Modal>
  );
}