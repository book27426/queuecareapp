"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, NumberInput, Select,
  SimpleGrid, ActionIcon, Container, Button, Paper, ThemeIcon, Badge, Loader, Center, Alert
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Pencil, X, RefreshCw, ArrowRight, Users, Activity, Clock, Building2, ShieldCheck, Timer, Trash2, Search, AlertCircle 
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
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingData, setEditingData] = useState(null); 

  const [globalInviteCode, setGlobalInviteCode] = useState('');
  const [globalCooldown, setGlobalCooldown] = useState(0);
  const [globalExpire, setGlobalExpire] = useState('1440');

  // --- 🌐 ฟังก์ชันดึงข้อมูล (แบบกันพัง) ---
  const fetchAllSections = useCallback(async (name = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = name 
        ? `https://queuecaredev.vercel.app/api/v1/section?name=${encodeURIComponent(name)}`
        : `https://queuecaredev.vercel.app/api/v1/section?id=1`;

      const res = await fetch(url, { credentials: 'include' });
      
      // ถ้า Network ต่อติดแต่ Server ตอบ Error (เช่น 404, 500)
      if (!res.ok) throw new Error(`Server status: ${res.status}`);
      
      const result = await res.json();

      if (result.success) {
        if (result.mode === "main-section") {
          setListData([result.data.section, ...result.data.sub_sections]);
        } else if (result.mode === "sub-section-staff") {
          setListData([result.data.own_section]);
        } else if (Array.isArray(result.data)) {
          setListData(result.data);
        } else {
          setListData(result.data ? [result.data] : []);
        }
      }
    } catch (err) {
      // 🚨 จุดสำคัญ: ถ้า Failed to fetch ให้ใส่ข้อมูลหลอกไว้เพื่อให้หน้าจอไม่ว่าง
      console.error("Fetch Error:", err);
      setError("API Connection Failed (Check CORS)");
      
      // ✅ Fallback Data: เพื่อให้คุณเห็น UI Card ระหว่างรอแก้ API
      setListData([
        { id: 1, name: "ALPHA HUB (OFFLINE)", wait_default: 300, predict_time: 15 },
        { id: 2, name: "BETA SECTION (OFFLINE)", wait_default: 600, predict_time: 45 }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllSections(); }, [fetchAllSections]);

  useEffect(() => {
    let timer;
    if (globalCooldown > 0) {
      timer = setInterval(() => setGlobalCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [globalCooldown]);

  const handleDelete = async (id) => {
    if (!confirm("Confirm Delete?")) return;
    try {
      const res = await fetch(`https://queuecaredev.vercel.app/api/v1/section?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchAllSections();
    } catch (err) { alert("Delete failed: CORS issue"); }
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

            <Group align="flex-end">
               <TextInput 
                 placeholder="Search name..." 
                 leftSection={<Search size={16} />}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && fetchAllSections(searchQuery)}
                 radius="xl" size="md"
               />
               <Button onClick={() => { setEditingData(null); openModal(); }} size="xl" radius="xl" color="blue" leftSection={<Plus size={22} />} className="h-16 px-10 font-bold shadow-xl">
                 ADD SECTION
               </Button>
            </Group>
          </Group>

          {error && <Alert color="red" variant="light" icon={<AlertCircle size={16} />}>{error}</Alert>}

          {loading ? (
            <Center h={300}><Loader color="blue" size="xl" type="dots" /></Center>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={32}>
              {listData.map((f) => (
                <Paper key={f.id} p={32} radius={40} withBorder className="bg-white border-slate-100 shadow-sm hover:shadow-2xl transition-all">
                  <Group justify="space-between" align="flex-start" mb="xl">
                    <ThemeIcon size={50} radius="xl" variant="light" color="blue"><Building2 /></ThemeIcon>
                    <Group gap={8}>
                      <ActionIcon variant="light" color="blue" size="lg" radius="xl" onClick={() => { setEditingData(f); openModal(); }}><Pencil size={18} /></ActionIcon>
                      <ActionIcon variant="light" color="red" size="lg" radius="xl" onClick={() => handleDelete(f.id)}><Trash2 size={18} /></ActionIcon>
                    </Group>
                  </Group>

                  <Stack gap={4} mb={32}>
                    <Title order={3} fs="italic" className="text-2xl font-extrabold text-[#1E293B] uppercase">{f.name}</Title>
                    <Badge variant="dot" size="sm">ID: {f.id}</Badge>
                  </Stack>

                  <SimpleGrid cols={2} spacing="md" mb={40}>
                    <Paper p="md" radius="24px" bg="slate-50">
                      <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Wait Default</Text>
                      <Text fs="italic" className="text-2xl font-black text-[#1E293B]">{f.wait_default ?? f.default_wait_time ?? 0}s</Text>
                    </Paper>
                    <Paper p="md" radius="24px" bg="slate-50">
                      <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Predict</Text>
                      <Text fs="italic" className="text-2xl font-black text-[#1E293B]">{f.predict_time ?? f.predicted_time ?? 0}s</Text>
                    </Paper>
                  </SimpleGrid>

                  <Button variant="filled" color="blue" radius="xl" className="h-12 px-6 font-bold" rightSection={<ArrowRight size={18} />}>MANAGE QUEUE</Button>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>

      <MasterModal 
        opened={modalOpened} onClose={closeModal} data={editingData} 
        onSuccess={() => fetchAllSections()}
        inviteState={{ code: globalInviteCode, setCode: setGlobalInviteCode, cooldown: globalCooldown, setCooldown: setGlobalCooldown, expire: globalExpire, setExpire: setGlobalExpire }}
      />
    </Box>
  );
}

function MasterModal({ opened, onClose, data, onSuccess, inviteState }) {
  const [name, setName] = useState('');
  const [waitDefault, setWaitDefault] = useState(300);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (opened) {
      setName(data?.name || '');
      setWaitDefault(data?.wait_default ?? data?.default_wait_time ?? 300);
    }
  }, [opened, data]);

  const handleGenerateCode = async () => {
    if (inviteState.cooldown > 0 || !data?.id) return;
    setGenerating(true);
    try {
      const url = `https://queuecaredev.vercel.app/api/v1/section/invite_code?id=${data.id}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ expire_minutes: inviteState.expire === '0' ? null : Number(inviteState.expire) })
      });
      const result = await res.json();
      if (result.success) {
        inviteState.setCode(result.data.invite_code);
        inviteState.setCooldown(60); 
      }
    } catch (err) { alert("CORS Error: API is blocked by browser safety."); } 
    finally { setGenerating(false); }
  };

  const handleAction = async () => {
    if (!name) return;
    setSubmitting(true);
    try {
      const method = data ? 'PUT' : 'POST';
      const url = data 
        ? `https://queuecaredev.vercel.app/api/v1/section?id=${data.id}` 
        : `https://queuecaredev.vercel.app/api/v1/section`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, wait_default: Number(waitDefault), parent_id: 1 })
      });

      if (res.ok) { onSuccess(); onClose(); }
      else { alert("Server Error on Save"); }
    } catch (e) { alert("Save Failed: Check CORS/Network"); } 
    finally { setSubmitting(false); }
  };

  return (
    <Modal opened={opened} onClose={onClose} centered radius="40px" withCloseButton={false} padding={0} size="600px">
      <Box className="p-10 lg:p-14 bg-white relative">
        <ActionIcon variant="light" color="gray" radius="xl" size="xl" onClick={onClose} style={{ position: 'absolute', top: '28px', right: '28px' }}><X size={24} /></ActionIcon>
        <Stack gap={40}>
          <Title order={2} fs="italic" className="font-extrabold">{data ? "Edit" : "New"} Section</Title>
          <Stack gap="xl">
            <TextInput label="NAME" value={name} onChange={(e) => setName(e.target.value)} size="lg" radius="md" />
            <NumberInput label="WAIT TIME (SEC)" value={waitDefault} onChange={setWaitDefault} size="lg" radius="md" />
            {data && (
              <Paper p={30} radius={32} withBorder bg="blue-50/30">
                <Stack gap="xl">
                  <Group gap="xs"><ShieldCheck size={18} className="text-blue-600" /><Text className="text-[11px] font-bold text-blue-600 uppercase">Invitation Protocol</Text></Group>
                  <Select label="CODE VALIDITY" data={EXPIRE_OPTIONS} value={inviteState.expire} onChange={inviteState.setExpire} radius="md" size="lg" />
                  <Group align="flex-end">
                    <TextInput value={inviteState.code} placeholder="Code..." readOnly className="flex-1" radius="md" size="lg" />
                    <ActionIcon onClick={handleGenerateCode} disabled={inviteState.cooldown > 0} loading={generating} variant="filled" color="blue" size="56px" radius="md">
                      {inviteState.cooldown > 0 ? <Text fw={700} fz="xs">{inviteState.cooldown}s</Text> : <RefreshCw size={24} />}
                    </ActionIcon>
                  </Group>
                </Stack>
              </Paper>
            )}
          </Stack>
          <Button onClick={handleAction} loading={submitting} fullWidth size="xl" radius="xl" color="blue" h={80} className="font-bold shadow-xl">
            {data ? "CONFIRM UPDATE" : "CREATE NOW"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}