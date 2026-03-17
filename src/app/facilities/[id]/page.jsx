"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, Select,
  SimpleGrid, Skeleton, ActionIcon, Paper, Button, Badge, 
  Grid, Avatar, Loader, Center, ThemeIcon, ScrollArea, 
  Container, FileButton, Divider , UnstyledButton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Pencil, X, ArrowRight, Users, ArrowLeft, Clock, 
  Save, Building2, Camera, Timer, UserPlus, Hourglass, Activity, 
  MonitorPlay, QrCode, Copy, Download 
}from 'lucide-react';
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

// ✅ API Endpoints
const API_SECTION = "https://queuecaredev.vercel.app/api/v1/section";
const API_INVITE = "https://queuecaredev.vercel.app/api/v1/section/invite_code";
const API_COUNTER = "https://queuecaredev.vercel.app/api/v1/counter";

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
  const [stats,setStats] = useState([]);
  const [counter,setCounters] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const [addModalOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [staffModalOpened, { open: openStaff, close: closeStaff }] = useDisclosure(false);
  const [editingData, setEditingData] = useState(null);
  const [qrModalOpened, { open: openQr, close: closeQr }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false); 
  const [editingId, setEditingId] = useState(null);
  const [modalType, setModalType] = useState('SECTION');

  // 📊 Mock Data สำหรับ Statistics
  const statsMock = {
    avgOpTime: "12m 30s", //get result.data.stats.est_avg_operation_time_per_case_minutes
    avgNewQueue: "24/h", //get result.est_new_queue_per_hour
    avgComQueue: "20/h" //get result.est_complete_case_per_hour
  };

  const isRedirecting = useRef(false);

  const fetchData = useCallback(async () => {
    if (isRedirecting.current) return;

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
        setStats(result.data.stats || []);
        setCounters(result.data.counters || [])
      }else{
        if (result.message === "Forbidden" || res.status === 403) {
          if (!isRedirecting.current) {
            isRedirecting.current = true; 
            alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Forbidden)");
            
            router.back();
          }
        } else {
          if (!isSilent) setFetchError(result.message || "เกิดข้อผิดพลาด");
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsSyncing(false);
      if (!isRedirecting.current) setInitialLoading(false);
    }
  }, [hubId, router]);

  useEffect(() => {
    if (hubId) {
      fetchData();
      const interval = setInterval(() => {if (!isRedirecting.current) fetchData()}, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchData, hubId]);

  if (initialLoading && !mainSection) return <Box p={50} bg="#F8FAFC" className="min-h-screen"><Container size="xl"><Skeleton height={600} radius={40} /></Container></Box>;

  return (
    <Box className="min-h-screen bg-[#F8FAFC] antialiased flex flex-col">
      <Navbar />
      
       <main className="flex-1 py-10 max-w-[1750px] mx-auto w-full px-6 lg:px-10">
        <Stack gap={40}>
          {/* Header */}
          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <UnstyledButton onClick={() => router.back()} className="text-blue-600 font-black flex items-center gap-2 uppercase hover:opacity-70 transition-all">
                <ArrowLeft size={16}/> BACK
              </UnstyledButton>
              <Title className="text-5xl lg:text-6xl font-black text-[#1E293B] uppercase tracking-tighter" fs="italic">
                {mainSection?.name} <span className="text-blue-600">Console.</span>
              </Title>
            </Stack>

            <Group gap="md">
              <Button variant="light" color="teal" radius="xl" size="lg" h={60} leftSection={<QrCode size={20}/>} onClick={openQr} className="font-bold">QR CODE</Button>
              <Button variant="light" color="indigo" radius="xl" size="lg" h={60} leftSection={<MonitorPlay size={20}/>} onClick={() => router.push(`/facilities/${hubId}/dashboard`)} className="font-bold">TV DISPLAY</Button>
              <Button variant="light" color="blue" radius="xl" size="lg" h={60} leftSection={<Users size={20}/>} onClick={openStaff} className="font-bold">STAFFS</Button>
              <Button 
                variant="light" 
                color="slate" // Using slate/gray to distinguish it as a "settings" action
                radius="xl" 
                size="lg" 
                h={60} 
                leftSection={<Pencil size={20}/>} 
                onClick={() => {
                  setEditingId(mainSection?.id); 
                  setModalType('SECTION'); 
                  openAdd();
                }} 
                className="font-bold"
              >
                EDIT HUB
              </Button>
            </Group>
          </Group>

          {/* ✅ 1. OVERALL STATISTICS (Mock Data) */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <StatBox label="AVG OPERATION TIME" value={stats.est_avg_operation_time_per_case_minutes} icon={Hourglass} color="blue" />
            <StatBox label="NEW QUEUES /H" value={stats.est_new_queue_per_hour} icon={UserPlus} color="teal" />
            <StatBox label="DONE QUEUES /H" value={stats.est_complete_case_per_hour} icon={Activity} color="indigo" />
          </SimpleGrid>
          
          {/* ✅ 2. MAIN CONTENT AREA */}
          <Grid gutter={40}>
            {/* LEFT COLUMN: Counters and Sub-sections */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap={50}>
                {/* 🚩 NEW: COUNTERS LIST (Top Priority) */}
                <Box>
                  <Group mb="xl" justify="space-between">
                    <Stack gap={0}>
                      <Title order={3} className="font-black italic uppercase text-[#1E293B]">
                        Service Counters
                      </Title>
                      <Text size="xs" fw={900} c="indigo" className="tracking-widest uppercase">Direct Terminal Access</Text>
                    </Stack>
                    <Group gap="xs">
                      <Button 
                        radius="xl" 
                        color="indigo" 
                        size="sm" 
                        h={42} 
                        leftSection={<Plus size={16}/>} 
                        onClick={() => { setEditingId(null); setModalType('COUNTER'); openAdd(); }}
                        className="font-black italic shadow-md active:scale-95 transition-all uppercase"
                      >
                        Add Counter
                      </Button>
                    </Group>
                  </Group>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <AnimatePresence mode="popLayout">
                      {counter.map((c) => (
                        <motion.div key={`counter-${c.id}`} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                          <Paper p={24} radius={32} withBorder className="bg-white border-slate-100 hover:border-indigo-500 transition-all shadow-sm group">
                            <Stack gap="lg">
                              <Group justify="space-between">
                                <Box className="relative">
                                  <Avatar 
                                    radius="xl" 
                                    size="lg" 
                                    // If c.is_active is true, use indigo, otherwise use a dim gray
                                    color={c.is_active ? "indigo" : "gray"} 
                                    variant={c.is_active ? "filled" : "light"} 
                                    className="font-black italic shadow-lg transition-all"
                                  >
                                    {c.name?.charAt(0) || 'C'}
                                  </Avatar>
                                  
                                  {/* Status Indicator Dot */}
                                  <Box 
                                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                      c.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                                    }`} 
                                  />
                                </Box>

                                <ActionIcon 
                                  variant="light" 
                                  color="indigo" 
                                  radius="xl" 
                                  size="xl" 
                                  onClick={() => { setEditingId(c.id); setModalType('COUNTER'); openAdd(); }}
                                >
                                  <Pencil size={18}/>
                                </ActionIcon>
                              </Group>
                              
                              <Box>
                                <Text size="xs" fw={900} c="dimmed" className="tracking-widest uppercase mb-1">Station Name</Text>
                                <Title order={2} className="font-black italic text-[#1E293B] uppercase">Counter {c.name}</Title>
                              </Box>

                              <Button 
                                fullWidth 
                                radius="xl" 
                                h={54} 
                                color="indigo" 
                                variant="light"
                                rightSection={<ArrowRight size={20} />}
                                onClick={() => router.push(`/facilities/${hubId}/${c.id}`)}
                                className="font-black italic group-hover:bg-indigo-600 group-hover:text-white transition-all"
                              >
                                OPEN CONSOLE
                              </Button>
                            </Stack>
                          </Paper>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </SimpleGrid>
                </Box>

                {/* 🚩 SUB-SECTIONS LIST (Below Counters) */}
                <Box>
                  <Group mb="xl" justify="space-between" align="flex-end">
                    {/* Left Side: Titles */}
                    <Stack gap={0}>
                      <Title order={3} className="font-black italic uppercase text-[#1E293B]">
                        Service Sectors
                      </Title>
                      <Text size="xs" fw={900} c="indigo" className="tracking-widest uppercase">
                        Direct Terminal Access
                      </Text>
                    </Stack>

                    {/* Right Side: Badge and Button closer together */}
                    <Group gap="xs"> {/* 'gap="xs"' or 'gap={8}' keeps them very close */}
                      <Button 
                        radius="xl" 
                        color="indigo" 
                        size="sm" 
                        h={42} 
                        leftSection={<Plus size={16}/>} 
                        onClick={() => { setEditingId(null); setModalType('SECTION'); openAdd(); }}
                        className="font-black italic shadow-md active:scale-95 transition-all uppercase"
                      >
                        Add Sector
                      </Button>
                    </Group>
                  </Group>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={32}>
                    <AnimatePresence mode="popLayout">
                      {listData.map((unit) => (
                        <motion.div key={`unit-${unit.id}`} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                          <Paper p={32} radius={40} withBorder className="bg-white hover:shadow-2xl transition-all border-slate-100 group relative">
                            <Stack gap={24}>
                              <Group justify="space-between">
                                <Avatar src={unit.image_url} size={60} radius="20px" color="blue" variant="light"><Building2 size={26} /></Avatar>
                                <ActionIcon variant="light" color="blue" radius="xl" size="xl" onClick={() => { setEditingId(unit.id); setModalType('SECTION'); openAdd(); }}><Pencil size={18}/></ActionIcon>
                              </Group>
                              <Stack gap={4}>
                                <Title order={3} className="text-2xl font-black italic text-[#1E293B] uppercase">{unit.name}</Title>
                                <Text size="sm" fw={800} c="dimmed" className="tracking-widest">Active: {liveQueues.filter(q => q.section_id === unit.id).length} Queues</Text>
                              </Stack>
                              <Button 
                                fullWidth radius="xl" h={60} color="blue" rightSection={<ArrowRight size={20}/>} 
                                onClick={() => router.push(`/facilities/${unit.id}`)} 
                                className="font-black italic shadow-lg shadow-blue-500/5 group-hover:-translate-y-1 transition-all"
                              >
                                VIEW HUB
                              </Button>
                            </Stack>
                          </Paper>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </SimpleGrid>
                </Box>

              </Stack>
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
      <AddUnitModal 
        opened={addModalOpened} 
        onClose={closeAdd} 
        hubId={hubId} 
        onSuccess={fetchData} 
        type={modalType} 
        data={
          // 1. Check if we are editing the Main Hub
          editingId === mainSection?.id 
            ? mainSection 
            // 2. Otherwise, check if it's a Counter or a Sub-Section
            : (modalType === 'COUNTER' 
                ? counter.find(c => c.id === editingId) 
                : listData.find(u => u.id === editingId))
        } 
      />
      <StaffModal opened={staffModalOpened} onClose={closeStaff} staffs={staffs} />
      <QRModal opened={qrModalOpened} onClose={closeQr} hubId={hubId} hubName={mainSection?.name} />
    </Box>
  );
}

// --- 🛠️ MODAL COMPONENT ---
function QRModal({ opened, onClose, hubId, hubName }) {
  const bookingUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${hubId}` : '';
  const handleCopy = () => { navigator.clipboard.writeText(bookingUrl); alert("Copied!"); };

  return (
    <Modal opened={opened} onClose={onClose} centered radius={45} size="md" padding={40} withCloseButton={false}>
      <Stack align="center" gap="xl">
        <Stack gap={4} align="center">
          <Title order={2} className="text-3xl font-black uppercase text-[#1E293B]" fs="italic">Registration <span className="text-blue-600">QR.</span></Title>
          <Text c="dimmed" fw={800} tt="uppercase" size="xs" className="tracking-widest">Scan to join the queue</Text>
        </Stack>
        <Paper p={30} radius={40} withBorder className="bg-slate-50 shadow-inner">
           {typeof window !== 'undefined' && <QRCodeSVG value={bookingUrl} size={220} level="H" includeMargin={true} />}
        </Paper>
        <Stack gap="xs" w="100%">
          <Text ta="center" size="sm" fw={800} c="dimmed" fs="italic">{hubName}</Text>
          <Button variant="light" color="blue" radius="xl" size="lg" leftSection={<Copy size={18}/>} onClick={handleCopy}>COPY LINK</Button>
          <Button variant="subtle" color="gray" radius="xl" onClick={onClose} className="font-bold">CLOSE</Button>
        </Stack>
      </Stack>
    </Modal>
  );
}

function AddUnitModal({ opened, onClose, data, hubId, onSuccess, type }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [inviteCode, setInviteCode] = useState(''); 
  const [expireMin, setExpireMin] = useState('1440'); 
  const [cooldown, setCooldown] = useState(0); 
  const [submitting, setSubmitting] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      setName(data?.name || '');
      setPreview(data?.image_url || '');
      setInviteCode(data?.invite_code || ''); 
      setFile(null);
    }
  }, [opened, data]);

  const handleAction = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const isEdit = !!data;
      const api = type === 'COUNTER' ? API_COUNTER : API_SECTION;
      const url = isEdit ? `${api}?id=${data.id}` : `${api}`;
      const formData = new FormData();
      
      formData.append('name', name.trim());
      formData.append('parent_id', Number(hubId));
      formData.append('section_id', Number(hubId));
      
      // Tell backend if this is a counter or a section
      formData.append('type', type?.toLowerCase()); 

      if (file) formData.append('image', file);

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        credentials: 'include',
        body: formData
      });

      if (res.ok) { 
        onSuccess(); 
        onClose(); 
      }
    } catch (e) { 
      alert("Action failed"); 
    } finally { 
      setSubmitting(false); 
    }
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
          <Title order={2} className="font-black italic uppercase text-[#1E293B]">
            {data ? `Edit ${type}` : `Add ${type}`}
          </Title>
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

          <TextInput 
            label={`${type} NAME`} 
            placeholder={`e.g. ${type} 01`} 
            size="xl" 
            radius="xl" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            classNames={{ input: 'bg-slate-50 font-bold h-16' }} 
          />

          {data && type !== 'COUNTER' && (
            <Paper p={24} radius={24} withBorder className="bg-blue-50/10 border-dashed border-blue-200">
              <Stack gap="md">
                <Text size="xs" fw={900} c="blue" className="uppercase tracking-widest">Invitation Code</Text>
                <Select 
                  label="SET EXPIRY" 
                  value={expireMin} 
                  onChange={setExpireMin} 
                  radius="md"
                  data={[
                    { value: '1', label: '1 Minute' }, 
                    { value: '30', label: '30 Minutes' }, 
                    { value: '60', label: '1 Hour' }, 
                    { value: '1440', label: '1 Day' }, 
                    { value: '10080', label: '1 Week' }
                  ]}
                />
                <Group align="flex-end" gap="xs">
                  <TextInput 
                    value={inviteCode} 
                    readOnly 
                    placeholder="CODE" 
                    className="flex-1" 
                    radius="md" 
                    classNames={{ input: 'font-black tracking-widest text-center h-12' }} 
                  />
                  <Button 
                    onClick={handleGenerateCode} 
                    loading={genLoading} 
                    disabled={cooldown > 0} 
                    color="blue" 
                    h={48} 
                    radius="md" 
                    className="font-bold min-w-[80px]"
                  >
                    {cooldown > 0 ? `${cooldown}s` : "GEN"}
                  </Button>
                </Group>
              </Stack>
            </Paper>
          )}

          <Button 
            fullWidth size="xl" radius="xl" color="blue" h={80} 
            onClick={handleAction} 
            loading={submitting} 
            disabled={!name.trim()} 
            className="shadow-2xl font-black italic uppercase"
          >
            {/* Dynamic Button Text */}
            {data ? "Save Changes" : `Create ${type}`}
          </Button>
          {!name.trim() && <Text size="xs" fw={800} c="red" ta="center" fs="italic">Required to proceed</Text>}
        </Stack>
      </Box>
    </Modal>
  );
}

// --- 👤 MODAL: Staff Directory ---
function StaffModal({ opened, onClose, staffs }) {
  return (
    <Modal opened={opened} onClose={onClose} centered radius={45} size="500px" padding={0} withCloseButton={false}>
      <Box className="p-12">
        <Group justify="space-between" mb={32}><Title order={2} className="font-black uppercase text-[#1E293B]" fs="italic">Staff List</Title><ActionIcon onClick={onClose} variant="subtle" color="gray" radius="xl" size="xl"><X size={24}/></ActionIcon></Group>
        <ScrollArea h={400}><Stack gap="md">{(staffs || []).map((s, i) => (<Paper key={i} p={22} radius="28px" withBorder className="bg-slate-50/50 shadow-sm"><Group gap="md"><Avatar radius="xl" color="blue" variant="light" fw={800}>{s.first_name?.[0]}</Avatar><Stack gap={0}><Text fw={800} size="sm">{s.first_name} {s.last_name}</Text><Badge color="blue" variant="filled" size="xs">ACTIVE STAFF</Badge></Stack></Group></Paper>))}</Stack></ScrollArea>
        <Button fullWidth mt="xl" variant="light" color="blue" radius="xl" size="lg" h={64} onClick={onClose} className="font-bold">CLOSE</Button>
      </Box>
    </Modal>
  );
}

function StatBox({ label, value, icon: Icon, color }) {
  return (
    <Paper p="xl" radius={32} withBorder className="bg-white border-slate-100 shadow-sm">
      <Group justify="space-between">
        <Stack gap={0}><Text size="xs" fw={900} c="dimmed" className="tracking-widest uppercase mb-1">{label}</Text><Title order={2} className="font-black text-[#1E293B]" fs="italic">{value}</Title></Stack>
        <ThemeIcon size={52} radius="xl" variant="light" color={color}><Icon size={26} /></ThemeIcon>
      </Group>
    </Paper>
  );
}