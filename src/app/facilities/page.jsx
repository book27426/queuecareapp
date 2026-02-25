"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, NumberInput, Select,
  SimpleGrid, ActionIcon, Container, Button, Paper, ThemeIcon, Badge
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Pencil, X, RefreshCw, ArrowRight, Users, Activity, Clock, Building2, ShieldCheck, Timer 
} from 'lucide-react';
import Navbar from "@/components/Navbar";

const EXPIRE_OPTIONS = [
  { value: '30', label: '30 MINUTES' },
  { value: '60', label: '1 HOUR' },
  { value: '360', label: '6 HOURS' },
  { value: '720', label: '12 HOURS' },
  { value: '1440', label: '1 DAY' },
  { value: '10080', label: '1 WEEK' },
  { value: '43200', label: '1 MONTH' },
  { value: '0', label: 'NEVER' },
];

export default function StaffManagementPage() {
  const [listData, setListData] = useState([
    { 
      id: 1, 
      name: "TRAFFY HUB", 
      parent_id: 1, 
      wait_default: 300, 
      staffCount: 12,
      liveData: { queue: 24, queueTrend: "+12%", queueStatus: "bad", time: "15m" }
    }
  ]);
  
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingData, setEditingData] = useState(null); 

  // ✅ 🔒 Persistent State: เก็บข้อมูลข้ามการปิด-เปิด Modal
  const [globalInviteCode, setGlobalInviteCode] = useState('');
  const [globalCooldown, setGlobalCooldown] = useState(0);
  const [globalExpire, setGlobalExpire] = useState('1440');

  useEffect(() => {
    let timer;
    if (globalCooldown > 0) {
      timer = setInterval(() => setGlobalCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [globalCooldown]);

  const handleUpdateLocal = (newData) => {
    if (editingData) {
      setListData(prev => prev.map(item => item.id === editingData.id ? { ...item, ...newData } : item));
    } else {
      const newItem = { 
        ...newData, 
        id: Date.now(), 
        staffCount: 0, 
        liveData: { queue: 0, queueTrend: "0%", queueStatus: "gray", time: "0s" } 
      };
      setListData(prev => [...prev, newItem]);
    }
  };

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar user={{ name: "SYSTEM ADMIN", role: "Manager" }} />
      <Container size="xl" className="flex-1 py-12 z-10">
        <Stack gap={48}>
          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <Text className="tracking-[0.3em] text-blue-600 font-bold text-[10px] uppercase">Infrastructure</Text>
              <Title fs="italic" className="text-4xl lg:text-6xl font-extrabold text-[#1E293B] tracking-tighter">
                Facility <span className="text-blue-600">Hub.</span>
              </Title>
            </Stack>
            <Button 
              onClick={() => { setEditingData(null); openModal(); }} 
              size="xl" radius="xl" color="blue" 
              leftSection={<Plus size={22} />} 
              className="h-16 px-10 font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              ADD NEW FACILITY
            </Button>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={32}>
            {listData.map((f) => (
              <Paper key={f.id} p={32} radius={40} withBorder className="bg-white border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                <Group justify="space-between" align="flex-start" mb="xl">
                  <Paper className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 shadow-inner">
                    <ThemeIcon size={40} variant="transparent" color="blue"><Building2 /></ThemeIcon>
                  </Paper>
                  <ActionIcon variant="light" color="blue" size="lg" radius="xl" onClick={() => { setEditingData(f); openModal(); }}>
                    <Pencil size={18} />
                  </ActionIcon>
                </Group>
                <Stack gap={4} mb={32}>
                  <Title order={3} fs="italic" className="text-2xl font-extrabold text-[#1E293B] tracking-tight uppercase">{f.name}</Title>
                  <Badge variant="dot" color="blue" size="sm">Active Operational Unit</Badge>
                </Stack>
                <SimpleGrid cols={2} spacing="md" mb={40}>
                  <Paper p="md" radius="24px" bg="slate-50" className="border border-slate-100">
                    <Group gap={6} mb={4}><Activity size={12} className="text-blue-600" /><Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Queue</Text></Group>
                    <Group align="baseline" gap={6}>
                      <Text fs="italic" className="text-2xl font-black text-[#1E293B]">{f.liveData?.queue || 0}</Text>
                      <Text fz={10} fw={700} c={f.liveData?.queueStatus === 'bad' ? 'red' : 'teal'}>{f.liveData?.queueTrend}</Text>
                    </Group>
                  </Paper>
                  <Paper p="md" radius="24px" bg="slate-50" className="border border-slate-100">
                    <Group gap={6} mb={4}><Clock size={12} className="text-teal-500" /><Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Wait Time</Text></Group>
                    <Group align="baseline" gap={6}>
                      <Text fs="italic" className="text-2xl font-black text-[#1E293B]">{f.wait_default}s</Text>
                    </Group>
                  </Paper>
                </SimpleGrid>
                <Group justify="space-between" className="pt-6 border-t border-slate-50">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="gray" radius="md" size="sm"><Users size={14} /></ThemeIcon>
                    <Text className="text-xs font-bold text-slate-500 uppercase">{f.staffCount || 0} Staff</Text>
                  </Group>
                  <Button variant="filled" color="blue" radius="xl" className="h-12 px-6 font-bold shadow-lg" rightSection={<ArrowRight size={18} />}>ENTER HUB</Button>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      <MasterModal 
        opened={modalOpened} onClose={closeModal} data={editingData} onSaveLocal={handleUpdateLocal} 
        inviteState={{ 
          code: globalInviteCode, setCode: setGlobalInviteCode, 
          cooldown: globalCooldown, setCooldown: setGlobalCooldown, 
          expire: globalExpire, setExpire: setGlobalExpire 
        }}
      />
    </Box>
  );
}

function MasterModal({ opened, onClose, data, onSaveLocal, inviteState }) {
  const [name, setName] = useState('');
  const [waitDefault, setWaitDefault] = useState(300);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (opened) {
      setName(data?.name || '');
      setWaitDefault(data?.wait_default || 300);
    }
  }, [opened, data]);

  // ✅ ดึง API จริง (แก้ Link ให้เป็น v1 และส่ง ID แบบ Dynamic)
  const handleGenerateCode = async () => {
    if (inviteState.cooldown > 0 || !data?.id) return;
    setGenerating(true);
    try {
      const expireMins = inviteState.expire === '0' ? null : Number(inviteState.expire);
      
      // ✅ เปลี่ยน URL ให้เป็น v1 และใช้ Template Literal เพื่อส่ง data.id จริงๆ
      const url = `https://queuecaredev.vercel.app/api/v1/section/invite_code?id=${data.id}`;

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ expire_minutes: expireMins })
      });

      const result = await res.json();
      if (result.success) {
        inviteState.setCode(result.data.invite_code);
        inviteState.setCooldown(60); 
      } else {
        alert(`API Error: ${result.message || 'รหัสผ่านหรือสิทธิ์ไม่ถูกต้อง'}`);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("ไม่สามารถเชื่อมต่อ API ได้ (Failed to fetch) กรุณาตรวจสอบ CORS หรือ Network");
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = async () => {
    if (!name) return;
    setSubmitting(true);
    // เก็บ parent_id ไว้ส่ง API เบื้องหลัง
    const payload = { name, wait_default: waitDefault, parent_id: data?.parent_id || 1 };
    onSaveLocal(payload);

    try {
      const method = data ? 'PUT' : 'POST';
      // ปรับ URL ให้ตรงตามมาตรฐาน (v1)
      const url = data 
        ? `https://queuecaredev.vercel.app/api/v1/section?id=${data.id}` 
        : `https://queuecaredev.vercel.app/api/v1/section`;

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      onClose();
    } catch (e) {
      console.error("Save Error:", e);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} centered radius="40px" withCloseButton={false} padding={0} size="600px">
      <Box className="p-10 lg:p-14 bg-white relative">
        <ActionIcon variant="light" color="gray" radius="xl" size="xl" onClick={onClose} style={{ position: 'absolute', top: '28px', right: '28px' }}><X size={24} /></ActionIcon>
        <Stack gap={40}>
          <Stack gap={4}>
            <Text className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Administrative Console</Text>
            <Title fs="italic" className="text-3xl font-extrabold text-[#1E293B] tracking-tight">{data ? "Edit Facility" : "New Facility"}</Title>
          </Stack>
          <Stack gap="xl">
            <TextInput label="FACILITY NAME" value={name} onChange={(e) => setName(e.target.value)} size="lg" radius="md" classNames={{ input: "font-bold h-14 border-slate-200 focus:border-blue-500", label: "font-bold text-[11px] mb-2 text-slate-500" }} />
            <NumberInput label="WAIT TIME (SECONDS)" value={waitDefault} onChange={setWaitDefault} size="lg" radius="md" classNames={{ input: "font-black h-14" }} />
            
            {data && (
              <Paper p={30} radius={32} withBorder className="bg-blue-50/30 border-blue-100">
                <Stack gap="xl">
                  <Group gap="xs"><ShieldCheck size={18} className="text-blue-600" /><Text className="text-[11px] font-bold text-blue-600 uppercase">Invitation Protocol</Text></Group>
                  <Select label="CODE VALIDITY" data={EXPIRE_OPTIONS} value={inviteState.expire} onChange={inviteState.setExpire} leftSection={<Timer size={16} />} radius="md" size="lg" classNames={{ input: "font-bold h-14" }} />
                  <Group align="flex-end">
                    <TextInput value={inviteState.code} placeholder="Click to generate..." readOnly className="flex-1" radius="md" size="lg" classNames={{ input: "font-black h-14 bg-white text-blue-600 border-blue-200" }} />
                    <ActionIcon onClick={handleGenerateCode} disabled={inviteState.cooldown > 0} loading={generating} variant="filled" color="blue" size="56px" radius="md" className="shadow-lg active:scale-95 transition-all">
                      {inviteState.cooldown > 0 ? <Text fw={700} fz="xs">{inviteState.cooldown}s</Text> : <RefreshCw size={24} />}
                    </ActionIcon>
                  </Group>
                </Stack>
              </Paper>
            )}
          </Stack>
          <Button onClick={handleAction} loading={submitting} fullWidth size="xl" radius="xl" color="blue" className="h-20 text-lg font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
            {data ? "EXECUTE UPDATE" : "INITIALIZE FACILITY"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}