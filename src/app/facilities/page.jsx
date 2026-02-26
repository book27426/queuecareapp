"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, NumberInput, Select,
  SimpleGrid, ActionIcon, Container, Button, Paper, ThemeIcon, Badge, Loader, Center, Alert, Avatar
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Pencil, X, RefreshCw, ArrowRight, Activity, Clock, Building2, 
  ShieldCheck, Timer, Trash2, Search, AlertCircle, UserPlus, Users, UserCog, LogOut
} from 'lucide-react';
import Navbar from "@/components/Navbar";

const ROLE_OPTIONS = [
  { value: 'staff', label: 'STAFF' },
  { value: 'admin', label: 'ADMIN' },
  { value: 'manager', label: 'MANAGER' },
];

export default function StaffManagementPage() {
  const [listData, setListData] = useState([]);
  const [mainSection, setMainSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [addModalOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [joinModalOpened, { open: openJoin, close: closeJoin }] = useDisclosure(false);
  const [staffModalOpened, { open: openStaff, close: closeStaff }] = useDisclosure(false);
  
  const [editingData, setEditingData] = useState(null); 
  const [selectedSection, setSelectedSection] = useState(null);

  const [globalInviteCode, setGlobalInviteCode] = useState('');
  const [globalCooldown, setGlobalCooldown] = useState(0);
  const [globalExpire, setGlobalExpire] = useState('30');

  // --- 🌐 1. API: Get Section (Case 1 & 2 ใน Doc) ---
  const fetchAllSections = useCallback(async (name = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = name 
        ? `https://queuecaredev.vercel.app/api/v1/section?name=${encodeURIComponent(name)}`
        : `https://queuecaredev.vercel.app/api/v1/section?id=1`;

      const res = await fetch(url, { credentials: 'include' });
      const result = await res.json();

      if (result.success) {
        if (result.mode === "main-section") {
          setMainSection(result.data.section);
          setListData(result.data.sub_sections || []);
        } else if (result.mode === "sub-section-staff") {
          setMainSection(result.data.parent_section);
          setListData([result.data.own_section]);
        } else {
          setListData(Array.isArray(result.data) ? result.data : [result.data]);
        }
      }
    } catch (err) {
      setError("Failed to connect to API. Please check CORS/Session.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllSections(); }, [fetchAllSections]);

  useEffect(() => {
    let timer;
    if (globalCooldown > 0) timer = setInterval(() => setGlobalCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [globalCooldown]);

  // --- 🌐 2. API: Delete Section ---
  const handleDeleteSection = async (id) => {
    if (!confirm("Confirm soft delete?")) return;
    try {
      await fetch(`https://queuecaredev.vercel.app/api/v1/section?id=${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      fetchAllSections();
    } catch (e) { alert("Delete failed"); }
  };

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar user={{ name: "ADMIN", role: "Manager" }} />

      <Container size="xl" className="flex-1 py-12">
        <Stack gap={40}>
          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <Badge variant="filled" color="blue" size="sm" radius="sm">
                HUB: {mainSection?.name || "ROOT"}
              </Badge>
              <Title fs="italic" className="text-4xl lg:text-5xl font-black text-[#1E293B]">
                Infrastructure <span className="text-blue-600">Console.</span>
              </Title>
            </Stack>

            <Group align="flex-end">
               <TextInput 
                 placeholder="Search..." 
                 leftSection={<Search size={16} />}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && fetchAllSections(searchQuery)}
                 radius="md"
               />
               <Button variant="light" color="blue" leftSection={<UserPlus size={18} />} onClick={openJoin}>JOIN</Button>
               <Button onClick={() => { setEditingData(null); openAdd(); }} color="blue" leftSection={<Plus size={18} />}>CREATE</Button>
            </Group>
          </Group>

          {error && <Alert color="red" variant="light" icon={<AlertCircle size={18}/>}>{error}</Alert>}

          {loading ? (
            <Center h={300}><Loader color="blue" type="bars" /></Center>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
              {listData.map((f) => (
                <Paper key={f.id} p={30} radius="32px" withBorder className="bg-white hover:shadow-xl transition-all relative overflow-hidden group">
                  <Group justify="space-between" mb="xl">
                    <ThemeIcon size={48} radius="lg" variant="light" color="blue"><Building2 size={24} /></ThemeIcon>
                    <Group gap={5}>
                      <ActionIcon variant="subtle" color="blue" onClick={() => { setEditingData(f); openAdd(); }}><Pencil size={16} /></ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteSection(f.id)}><Trash2 size={16} /></ActionIcon>
                    </Group>
                  </Group>

                  <Stack gap={2} mb="xl">
                    <Group justify="space-between">
                        <Text size="xs" fw={800} c="blue">ID: {f.id}</Text>
                        <Button variant="subtle" size="compact-xs" leftSection={<Users size={14} />} onClick={() => { setSelectedSection(f); openStaff(); }}>
                            Manage Staff
                        </Button>
                    </Group>
                    <Title order={3} className="text-2xl font-extrabold text-[#1E293B] truncate">{f.name}</Title>
                  </Stack>

                  <SimpleGrid cols={2} gap="md" mb="xl">
                    <Box className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <Group gap={6} mb={4}><Activity size={14} className="text-blue-500" /><Text size="xs" fw={700} c="dimmed">WAIT</Text></Group>
                      <Text fz={20} fw={900}>{f.wait_default ?? f.default_wait_time ?? 0}s</Text>
                    </Box>
                    <Box className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <Group gap={6} mb={4}><Clock size={14} className="text-teal-500" /><Text size="xs" fw={700} c="dimmed">PREDICT</Text></Group>
                      <Text fz={20} fw={900}>{f.predict_time ?? f.predicted_time ?? 0}s</Text>
                    </Box>
                  </SimpleGrid>

                  <Button fullWidth variant="filled" color="blue" radius="xl" h={54} className="font-bold shadow-lg" rightSection={<ArrowRight size={18} />}>MANAGE QUEUE</Button>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>

      <JoinSectionModal opened={joinModalOpened} onClose={closeJoin} onSuccess={() => fetchAllSections()} />
      <MasterModal opened={addModalOpened} onClose={closeAdd} data={editingData} parentId={mainSection?.id || 1} onSuccess={() => fetchAllSections()} 
        inviteState={{ code: globalInviteCode, setCode: setGlobalInviteCode, cooldown: globalCooldown, setCooldown: setGlobalCooldown, expire: globalExpire, setExpire: setGlobalExpire }} />
      <StaffManagementModal opened={staffModalOpened} onClose={closeStaff} section={selectedSection} />
    </Box>
  );
}

// --- ➕ 3. MODAL: Join Section (PUT /api/v1/staff) ---
function JoinSectionModal({ opened, onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleJoin = async () => {
    if (!code) return;
    setSubmitting(true);
    try {
      // ✅ ตาม Doc: PUT /api/v1/staff พร้อม Body { invite_code }
      const res = await fetch(`https://queuecaredev.vercel.app/api/v1/staff`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invite_code: code })
      });
      const result = await res.json();
      if (result.success) {
        onSuccess();
        onClose();
        setCode('');
      } else {
        alert(result.message || "Invalid Code");
      }
    } catch (e) { alert("CORS Error"); } 
    finally { setSubmitting(false); }
  };

  return (
    <Modal opened={opened} onClose={onClose} centered radius="32px" withCloseButton={false} padding={0} size="md">
      <Box className="p-10 bg-white">
        <Stack gap="xl">
          <Center><ThemeIcon size={60} radius="xl" color="blue" variant="light"><UserPlus size={30} /></ThemeIcon></Center>
          <Title order={2} ta="center" className="font-black">JOIN SECTION</Title>
          <TextInput placeholder="Enter Invite Code" value={code} onChange={(e) => setCode(e.target.value)} size="lg" radius="md" classNames={{ input: "text-center font-black text-blue-600 h-16 text-xl tracking-widest" }} />
          <Button onClick={handleJoin} loading={submitting} fullWidth size="xl" radius="xl" color="blue" h={70} className="font-bold shadow-xl">CONFIRM JOIN</Button>
          <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
        </Stack>
      </Box>
    </Modal>
  );
}

// --- 👤 4. MODAL: Staff Management (PUT /api/v1/staff?id=...) ---
function StaffManagementModal({ opened, onClose, section }) {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened && section) {
      const load = async () => {
        setLoading(true);
        try {
          const res = await fetch(`https://queuecaredev.vercel.app/api/v1/section?id=${section.id}`, { credentials: 'include' });
          const result = await res.json();
          if (result.success) setStaffs(result.data.staffs || []);
        } catch (e) {} finally { setLoading(false); }
      };
      load();
    }
  }, [opened, section]);

  const updateStaff = async (sid, role) => {
    try {
      // ✅ ตาม Doc: PUT /api/v1/staff?id={id}
      await fetch(`https://queuecaredev.vercel.app/api/v1/staff?id=${sid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role, section_id: section.id })
      });
      setStaffs(prev => prev.map(s => s.id === sid ? { ...s, role } : s));
    } catch (e) { alert("Update failed"); }
  };

  const removeStaff = async (sid) => {
    if (!confirm("Remove staff?")) return;
    try {
      // ✅ ตาม Doc: DELETE /api/v1/staff?id={id}
      await fetch(`https://queuecaredev.vercel.app/api/v1/staff?id=${sid}`, { method: 'DELETE', credentials: 'include' });
      setStaffs(prev => prev.filter(s => s.id !== sid));
    } catch (e) { alert("Delete failed"); }
  };

  return (
    <Modal opened={opened} onClose={onClose} centered radius="32px" size="lg" title={<Text fw={900}>MANAGE STAFF: {section?.name}</Text>}>
      <Stack gap="md" py="xl">
        {loading ? <Center><Loader size="sm"/></Center> : staffs.map(s => (
          <Paper key={s.id} p="md" withBorder radius="lg">
            <Group justify="space-between">
              <Group>
                <Avatar color="blue"><UserCog size={20}/></Avatar>
                <Stack gap={0}>
                  <Text fw={700} size="sm">{s.first_name} {s.last_name}</Text>
                  <Text size="xs" c="dimmed">{s.email}</Text>
                </Stack>
              </Group>
              <Group gap="xs">
                <Select size="xs" data={ROLE_OPTIONS} value={s.role} onChange={(val) => updateStaff(s.id, val)} w={100} />
                <ActionIcon color="red" variant="light" onClick={() => removeStaff(s.id)}><LogOut size={14}/></ActionIcon>
              </Group>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Modal>
  );
}

// --- 🛠️ 5. MODAL: Master Section (POST/PUT /api/v1/section) ---
function MasterModal({ opened, onClose, data, parentId, onSuccess, inviteState }) {
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
      // ✅ ตาม Doc: PUT /api/v1/section/invite_code?id={id}
      const res = await fetch(`https://queuecaredev.vercel.app/api/v1/section/invite_code?id=${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ expire_minutes: Number(inviteState.expire) })
      });
      const result = await res.json();
      if (result.success) {
        inviteState.setCode(result.data.invite_code);
        inviteState.setCooldown(60); 
      }
    } catch (e) { alert("CORS Error"); } 
    finally { setGenerating(false); }
  };

  const handleAction = async () => {
    if (!name) return;
    setSubmitting(true);
    try {
      const method = data ? 'PUT' : 'POST';
      const url = data ? `https://queuecaredev.vercel.app/api/v1/section?id=${data.id}` : `https://queuecaredev.vercel.app/api/v1/section`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          name, 
          wait_default: Number(waitDefault), 
          parent_id: data?.parent_id || parentId 
        })
      });
      if (res.ok) { onSuccess(); onClose(); }
    } catch (e) { console.error(e); } 
    finally { setSubmitting(false); }
  };

  return (
    <Modal opened={opened} onClose={onClose} centered radius="32px" withCloseButton={false} padding={0} size="lg">
      <Box className="p-10 bg-white">
        <Stack gap="xl">
          <Title order={2} className="font-black italic uppercase">{data ? "Modify Unit" : "Initialize Unit"}</Title>
          <Stack gap="md">
            <TextInput label="SECTION NAME" value={name} onChange={(e) => setName(e.target.value)} radius="md" />
            <NumberInput label="WAIT TIME (SEC)" value={waitDefault} onChange={setWaitDefault} radius="md" />
            {data && (
              <Paper p="xl" radius="24px" withBorder bg="blue-50/20">
                <Stack gap="md">
                  <Select label="CODE VALIDITY" data={[{value:'30',label:'30m'},{value:'60',label:'1h'},{value:'1440',label:'1d'}]} value={inviteState.expire} onChange={inviteState.setExpire} radius="md" />
                  <Group align="flex-end">
                    <TextInput value={inviteState.code} placeholder="Code" readOnly className="flex-1" radius="md" />
                    <ActionIcon onClick={handleGenerateCode} disabled={inviteState.cooldown > 0} loading={generating} variant="filled" color="blue" size={42} radius="md">
                      {inviteState.cooldown > 0 ? <Text fw={900} fz={10}>{inviteState.cooldown}</Text> : <RefreshCw size={18} />}
                    </ActionIcon>
                  </Group>
                </Stack>
              </Paper>
            )}
          </Stack>
          <Button onClick={handleAction} loading={submitting} fullWidth size="xl" radius="xl" color="blue" h={70} className="font-bold shadow-xl">{data ? "EXECUTE CHANGES" : "CREATE NEW SECTION"}</Button>
        </Stack>
      </Box>
    </Modal>
  );
}