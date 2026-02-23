"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, Select, 
  SimpleGrid, ScrollArea, Skeleton, ActionIcon, Paper, ThemeIcon, Button, Badge, Flex, Grid, Tabs, Affix, Avatar
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Clock, Layers, ArrowRight, Activity, Settings2, Plus, Pencil, X, RefreshCw, Timer,
  Users, CheckCircle2, LayoutGrid, ShieldCheck, Search, ChevronRight
} from 'lucide-react';
import { Navbar } from "@/components/Navbar";
import { useParams } from 'next/navigation';
import Link from 'next/link';

const EXPIRE_OPTIONS = [
  { value: '30m', label: '30 MINUTES / 30 นาที' },
  { value: '1h', label: '1 HOUR / 1 ชั่วโมง' },
  { value: '1d', label: '1 DAY / 1 วัน' },
  { value: 'never', label: 'NEVER / ไม่มีวันหมดอายุ' },
];

const MOCK_STAFF = [
  { id: 1, name: "ดร. ปทุม ใจดี", role: "Dispatcher", station: "Center Terminal", color: "blue" },
  { id: 2, name: "พยาบาล สมศรี", role: "Operator", station: "Dental Unit (S1)", color: "teal" },
  { id: 3, name: "นายวิชัย มั่นคง", role: "Operator", station: "General Clinic (S2)", color: "cyan" },
];

export default function FacilityStationPage() {
  const params = useParams();
  const hospitalId = params.id || 'center';
  const [loading, setLoading] = useState(true);
  const [sectionModalOpened, { open: openSectionModal, close: closeSectionModal }] = useDisclosure(false);
  const [staffModalOpened, { open: openStaffModal, close: closeStaffModal }] = useDisclosure(false);
  const [editingSection, setEditingSection] = useState(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleEditSection = (e, section) => {
    e.preventDefault(); e.stopPropagation();
    setEditingSection(section);
    openSectionModal();
  };

  if (loading) return <Box p={50}><Skeleton height={600} radius={40} /></Box>;

  // 1. ส่วนเนื้อหาหลัก (2/3 บน Desktop)
  const StationsContent = (
    <Stack gap={40}>
      <Group justify="space-between" align="flex-end">
        <Stack gap={4}>
          <Text className="tracking-[0.3em] text-blue-600 font-bold text-[10px] uppercase">Service Control</Text>
          <Title className="text-3xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tighter italic">Station Control.</Title>
        </Stack>
        
        {/* ปรับปรุงปุ่มสำหรับ Mobile: เพิ่ม ActionIcon สำหรับดูเจ้าหน้าที่ */}
        <Group gap="md">
          <ActionIcon 
            hiddenFrom="sm" variant="light" color="blue" size="56px" radius="xl" 
            onClick={openStaffModal} className="shadow-sm"
          >
            <Users size={24} />
          </ActionIcon>
          
          <Group visibleFrom="sm" gap="md">
            <Button variant="light" color="blue" radius="xl" size="lg" leftSection={<Users size={20} />} onClick={openStaffModal} className="h-14 font-bold">รายชื่อเจ้าหน้าที่</Button>
            <Button onClick={() => { setEditingSection(null); openSectionModal(); }} size="lg" radius="xl" color="blue" leftSection={<Plus size={20} />} className="h-14 px-8 font-bold shadow-xl">เพิ่มแผนกใหม่</Button>
          </Group>
        </Group>
      </Group>

      {/* Metrics & Units Grid (รักษาสัดส่วน 2/3) */}
      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing={20}>
        {[{l:"NEW QUEUE",v:"14",t:"+12%"},{l:"COMPLETE",v:"10",t:"+5%"},{l:"AVG TIME",v:"18m",t:"-2m"}].map((s,i)=>(
          <Paper key={i} p={20} radius={32} withBorder className="bg-white border-slate-100 shadow-sm">
            <Text className="text-[9px] font-bold uppercase text-slate-400 mb-1 truncate">{s.l}</Text>
            <Group gap={4} align="baseline"><Text className="text-2xl font-black text-[#1E293B]">{s.v}</Text><Badge color="blue" variant="light" size="xs">{s.t}</Badge></Group>
          </Paper>
        ))}
      </SimpleGrid>

      <Stack gap={20}>
        <Group gap="sm"><LayoutGrid size={18} className="text-blue-600" /><Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Units</Text></Group>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={25}>
          {[{id:'S1',n:'Dental / ทำฟัน',c:'A026',w:'12'},{id:'S2',n:'General / ทั่วไป',c:'B006',w:'28'}].map((sec)=>(
            <Link href={`/staff/${hospitalId}/${sec.id}`} key={sec.id} className="no-underline">
              <Paper p={24} radius={40} withBorder className="bg-white border-slate-100 hover:shadow-2xl transition-all group">
                <Flex justify="space-between" align="center" mb="lg">
                  <Title order={4} className="text-lg font-extrabold text-[#1E293B] uppercase">{sec.n}</Title>
                  <ActionIcon variant="light" color="blue" radius="xl" size="lg" onClick={(e)=>handleEditSection(e,sec)}><Pencil size={18} /></ActionIcon>
                </Flex>
                <Flex align="center" gap="xl">
                  <Box className="w-20 h-20 bg-slate-50 rounded-[28px] flex flex-col items-center justify-center border border-slate-100">
                    <Text className="text-[7px] font-bold text-slate-400 uppercase">Serving</Text>
                    <Text className="text-2xl font-black text-blue-600 italic">{sec.c}</Text>
                  </Box>
                  <Stack gap={4} className="flex-1">
                    <Group justify="space-between" className="border-b border-slate-50 pb-1"><Text className="text-[10px] font-bold text-slate-400">Waitlist</Text><Text className="text-sm font-black text-red-600">{sec.w}</Text></Group>
                    <Button fullWidth mt={5} radius="xl" color="blue" variant="light" className="h-10 font-bold" rightSection={<ChevronRight size={14} />}>Manage</Button>
                  </Stack>
                </Flex>
              </Paper>
            </Link>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );

  // 2. ส่วนรายการคิว (1/3 บน Desktop)
  const QueueFeedContent = (
    <Box className="lg:sticky lg:top-32 h-fit">
      <Paper radius={{ base: 0, lg: 40 }} withBorder className="bg-white border-slate-100 shadow-2xl lg:shadow-blue-500/5 overflow-hidden h-full">
        <Box p={30} className="bg-slate-50/50 border-b border-slate-100">
          <Group justify="space-between" mb="md"><Title order={3} className="text-xl font-extrabold text-[#1E293B]">Live Feed</Title><Layers size={22} className="text-blue-600" /></Group>
          <TextInput placeholder="Search ID..." radius="xl" size="md" leftSection={<Search size={16} />} />
        </Box>
        <ScrollArea h={{ base: 'calc(100vh - 420px)', lg: 550 }} p={25}>
          <Stack gap="md">
            {[{id:'A027',n:'สมชาย รักดี',e:'15m'},{id:'A028',n:'นภาพร สดใส',e:'20m'}].map((item, i)=>(
              <Paper key={item.id} p={20} radius={24} withBorder className={`border-slate-50 ${i === 0 ? 'border-blue-600 bg-blue-50/20 shadow-md' : ''}`}>
                <Flex justify="space-between" align="center">
                  <Stack gap={0}><Title order={4} className="text-xl font-black text-[#1E293B] italic">{item.id}</Title><Text className="text-[10px] font-bold text-slate-400 uppercase">{item.n}</Text></Stack>
                  <Badge color="blue" variant="light">{item.e}</Badge>
                </Flex>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
        <Box p={24} className="bg-white border-t border-slate-50">
          <Flex justify="center"><Button component={Link} href={`/staff/${hospitalId}/center`} variant="filled" color="blue" radius="xl" size="lg" w={{ base: '100%', lg: '60%' }} className="h-16 font-bold shadow-xl text-lg" rightSection={<ArrowRight size={20} />}>จัดการคิว</Button></Flex>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar user={{ name: "DR. PATHUM", role: "Dispatcher" }} />

      {/* Mobile FAB: ปุ่มบวกเดียวจบ */}
      <Affix position={{ bottom: 30, right: 30 }} hiddenFrom="sm" zIndex={200}>
        <ActionIcon onClick={() => { setEditingSection(null); openSectionModal(); }} size="64px" radius="100%" color="blue" variant="filled" className="shadow-2xl" style={{ border: '4px solid white' }}><Plus size={32} /></ActionIcon>
      </Affix>

      <main className="flex-1 lg:p-10 max-w-[1800px] mx-auto w-full z-10">
        <Box className="lg:hidden">
          <Tabs defaultValue="stations" color="blue" variant="pills" radius="xl" p="md">
            <Tabs.List grow className="bg-white p-1 rounded-full border border-slate-100 mb-6">
              <Tabs.Tab value="stations" leftSection={<LayoutGrid size={16} />} className="font-bold h-12">Stations</Tabs.Tab>
              <Tabs.Tab value="feed" leftSection={<Layers size={16} />} className="font-bold h-12">Live Feed</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="stations">{StationsContent}</Tabs.Panel>
            <Tabs.Panel value="feed">{QueueFeedContent}</Tabs.Panel>
          </Tabs>
        </Box>

        {/* Desktop: 2/3 และ 1/3 Ratio */}
        <Box className="hidden lg:block px-6">
          <Grid gutter={50}>
            <Grid.Col span={8}>{StationsContent}</Grid.Col>
            <Grid.Col span={4}>{QueueFeedContent}</Grid.Col>
          </Grid>
        </Box>
      </main>

      {/* Modal จัดการแผนก (Fixed X Button) */}
      <SectionManagementModal opened={sectionModalOpened} onClose={closeSectionModal} section={editingSection} />

      {/* Modal รายชื่อเจ้าหน้าที่ (Absolute Symmetry) */}
      <StaffManagementModal opened={staffModalOpened} onClose={closeStaffModal} />
    </Box>
  );
}

// --- MODAL COMPONENTS WITH ABSOLUTE X BUTTON ---

function StaffManagementModal({ opened, onClose }) {
  return (
    <Modal opened={opened} onClose={onClose} centered radius="40px" withCloseButton={false} padding={0} size="600px">
      <Box className="p-10 lg:p-14 bg-white relative overflow-hidden">
        {/* FIXED X BUTTON: มุมบนขวาเป๊ะ */}
        <ActionIcon variant="light" color="gray" radius="xl" size="xl" onClick={onClose} style={{ position: 'absolute', top: '28px', right: '28px', zIndex: 100 }} className="hover:bg-red-50 hover:text-red-500 transition-colors"><X size={24} /></ActionIcon>
        <Stack gap={40}>
          <Stack gap={4}><Text className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Human Resources</Text><Title className="text-3xl font-extrabold text-[#1E293B]">Active Staff List</Title></Stack>
          <Paper radius={32} withBorder bg="slate-50/50"><ScrollArea h={400} p="xl"><Stack gap="lg">{MOCK_STAFF.map((s)=>(<Paper key={s.id} p="md" radius="24px" withBorder bg="white"><Flex justify="space-between" align="center"><Group gap="md"><Avatar color={s.color} radius="xl">{s.name[0]}</Avatar><Stack gap={0}><Text className="font-bold text-sm">{s.name}</Text><Badge size="xs" variant="outline">{s.role}</Badge></Stack></Group><Text className="text-xs font-black text-blue-600">{s.station}</Text></Flex></Paper>))}</Stack></ScrollArea></Paper>
          <Button fullWidth size="xl" radius="xl" color="blue" variant="light" className="h-16 font-bold" onClick={onClose}>Close Directory</Button>
        </Stack>
      </Box>
    </Modal>
  );
}

function SectionManagementModal({ opened, onClose, section }) {
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => { if (section) { setName(section.name); setInviteCode('DH-8829-X'); } else { setName(''); setInviteCode(''); } }, [section, opened]);
  useEffect(() => { let timer; if (cooldown > 0) timer = setInterval(() => setCooldown(p => p - 1), 1000); return () => clearInterval(timer); }, [cooldown]);

  return (
    <Modal opened={opened} onClose={onClose} centered radius="40px" withCloseButton={false} padding={0} size="600px">
      <Box className="p-10 lg:p-14 bg-white relative overflow-hidden">
        {/* FIXED X BUTTON: มุมบนขวาเป๊ะ */}
        <ActionIcon variant="light" color="gray" radius="xl" size="xl" onClick={onClose} style={{ position: 'absolute', top: '28px', right: '28px', zIndex: 100 }} className="hover:bg-red-50 hover:text-red-500 transition-colors"><X size={24} /></ActionIcon>
        <Stack gap={40}>
          <Stack gap={4}><Text className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Configuration</Text><Title className="text-3xl font-extrabold text-[#1E293B]">{section ? "Edit Department" : "New Department"}</Title></Stack>
          <Stack gap="xl">
            <TextInput label="DEPARTMENT NAME *" value={name} onChange={(e)=>setName(e.target.value)} required radius="md" size="lg" classNames={{ input: "font-bold h-14 border-slate-200" }} />
            <Paper p={30} radius={32} withBorder bg="slate-50"><Stack gap="xl"><Group gap="md"><ShieldCheck size={20} className="text-blue-600" /><Text className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Invitation Protocol</Text></Group><Group align="flex-end"><TextInput label="INVITE CODE" value={inviteCode} readOnly className="flex-1" radius="md" classNames={{ input: "font-black h-14 bg-white" }} /><ActionIcon onClick={()=>setCooldown(60)} disabled={cooldown > 0} variant="filled" color="blue" size="56px" radius="md">{cooldown > 0 ? <Text size="xs">{cooldown}s</Text> : <RefreshCw size={24} />}</ActionIcon></Group><Select label="EXPIRATION" data={EXPIRE_OPTIONS} defaultValue="1d" radius="md" size="lg" classNames={{ input: "font-bold h-14" }} /></Stack></Paper>
          </Stack>
          <Button fullWidth size="xl" radius="xl" color="blue" className="h-20 text-lg font-bold shadow-xl" onClick={onClose} disabled={!name.trim()}>Apply Operational Setup <ArrowRight size={22} className="ml-2" /></Button>
        </Stack>
      </Box>
    </Modal>
  );
}