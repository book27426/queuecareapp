"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, Select,
  SimpleGrid, ActionIcon, Container, Button, Paper, ThemeIcon, Badge, Loader, Center, Alert, Avatar, ScrollArea, FileButton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Pencil, X, RefreshCw, ArrowRight, Building2, 
  Search, AlertCircle, UserPlus, Users, Trash2, Save, Camera
} from 'lucide-react';

const API_BASE = "https://queuecaredev.vercel.app/api/v1/section";
const API_STAFF = "https://queuecaredev.vercel.app/api/v1/staff";

export default function StaffManagementPage() {
  const router = useRouter();
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [addModalOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [staffModalOpened, { open: openStaff, close: closeStaff }] = useDisclosure(false);
  const [joinModalOpened, { open: openJoin, close: closeJoin }] = useDisclosure(false);
  
  const [editingData, setEditingData] = useState(null); 
  const [selectedSection, setSelectedSection] = useState(null);

  // --- 📡 1. Fetch Sections ---
  const fetchAllSections = useCallback(async (name = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}?name=${encodeURIComponent(name)}`;
      const res = await fetch(url, { 
        method: 'GET',
        credentials: 'include',
      });
      const result = await res.json();
      if (result.success) {
        const dataToShow = result.mode === "main-section" 
          ? result.data.sub_sections 
          : (Array.isArray(result.data) ? result.data : [result.data]);
        setListData(dataToShow || []);
      }
    } catch (err) { 
      setError("Failed to load data"); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchAllSections(); }, [fetchAllSections]);

  // --- 🗑️ 2. Delete Section ---
  const handleDeleteSection = async (id) => {
    if (!confirm("ลบหน่วยงานนี้?")) return;
    try {
      const res = await fetch(`${API_BASE}?id=${id}`, { 
        method: 'DELETE', 
        credentials: 'include',
      });
      const result = await res.json();
      if (res.ok) fetchAllSections();
      else alert(result.message || "คุณไม่มีสิทธิ์ลบ");
    } catch (e) { alert("Delete Error"); }
  };

  return (
    <Box className="min-h-screen bg-[#F8FAFC]">
      <Container size="xl" className="py-12">
        <Stack gap={40}>
          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <Badge variant="filled" color="blue" radius="sm">MANAGEMENT CENTER</Badge>
              <Title className="text-5xl font-black text-[#1E293B] tracking-tighter italic">
                Facility <span className="text-blue-600">Console.</span>
              </Title>
            </Stack>
            <Group>
              <TextInput 
                placeholder="Search..." 
                leftSection={<Search size={16}/>} 
                radius="md" 
                value={searchQuery} 
                onChange={(e)=>setSearchQuery(e.target.value)} 
                onKeyDown={(e)=>e.key==='Enter' && fetchAllSections(searchQuery)}
              />
              <Button variant="light" radius="md" leftSection={<UserPlus size={18}/>} onClick={openJoin}>JOIN</Button>
              <Button onClick={()=>{setEditingData(null); openAdd();}} radius="md" color="blue" leftSection={<Plus size={18}/>}>CREATE</Button>
            </Group>
          </Group>

          {loading ? (
            <Center h={200}><Loader color="blue" type="bars"/></Center>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
              {listData.map((f) => (
                <Paper key={f.id} p={30} radius={32} withBorder className="bg-white hover:shadow-2xl transition-all group relative overflow-hidden">
                  <Group justify="space-between" mb="xl">
                    <Avatar src={f.image_url} size={64} radius="xl" color="blue" className="shadow-lg border-2 border-white">
                      <Building2 size={32} />
                    </Avatar>
                    <Group gap={8}>
                      <ActionIcon variant="subtle" color="blue" size="lg" onClick={()=>{setEditingData(f); openAdd();}}><Pencil size={18}/></ActionIcon>
                      <ActionIcon variant="subtle" color="red" size="lg" onClick={()=>handleDeleteSection(f.id)}><Trash2 size={18}/></ActionIcon>
                    </Group>
                  </Group>
                  
                  <Stack gap={0} mb="xl">
                    <Text size="xs" fw={900} c="blue">ID: {f.id}</Text>
                    <Title order={3} className="text-2xl font-black text-[#1E293B] truncate">{f.name}</Title>
                    <Button 
                      variant="subtle" p={0} h="auto" justify="flex-start" 
                      leftSection={<Users size={14}/>} 
                      onClick={()=>{setSelectedSection(f); openStaff();}} mt={5}
                    >
                      Staff List
                    </Button>
                  </Stack>
                  
                  <Button 
                    fullWidth radius="xl" h={54} color="blue" 
                    rightSection={<ArrowRight size={18}/>} 
                    onClick={()=>router.push(`/facilities/${f.id}`)} 
                    className="font-bold shadow-lg italic"
                  >
                    MANAGE QUEUE
                  </Button>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>

      {/* --- MODALS --- */}
      <JoinSectionModal opened={joinModalOpened} onClose={closeJoin} onSuccess={fetchAllSections} />
      <MasterModal opened={addModalOpened} onClose={closeAdd} data={editingData} onSuccess={fetchAllSections} />
      <StaffManagementModal opened={staffModalOpened} onClose={closeStaff} section={selectedSection} />
    </Box>
  );
}

// --- 🛠️ MODAL: Master Modal (Create/Edit) ---
function MasterModal({ opened, onClose, data, onSuccess }) {
  const [name, setName] = useState('');
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [expireMin, setExpireMin] = useState('30');

  useEffect(() => {
    if (opened) {
      setName(data?.name || '');
      setPreview(data?.image_url || '');
      setInviteCode('');
    }
  }, [opened, data]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleAction = async () => {
    if (!name) return;
    setSubmitting(true);
    try {
      const isEdit = !!data;
      const url = isEdit ? `${API_BASE}?id=${data.id}` : API_BASE;
      const payload = {
        name: name,
        parent_id: isEdit ? Number(data.parent_id) : 1
      };

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.message || "Error");
      }
    } catch (e) { alert("Network Error"); } 
    finally { setSubmitting(false); }
  };

  const handleGenerateCode = async () => {
    if (!data?.id || cooldown > 0) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/other?id=${data.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expire_minutes: Number(expireMin) })
      });
      const result = await res.json();
      if (result.success) {
        setInviteCode(result.data.invite_code);
        setCooldown(60);
      } else { alert(result.message || "Failed to generate"); }
    } catch (e) { alert("Error generating code"); } 
    finally { setGenerating(false); }
  };

  return (
    <Modal opened={opened} onClose={onClose} centered radius={32} padding={0} size="md" withCloseButton={false}>
      <Box className="p-10">
        <Title order={2} className="font-black italic uppercase mb-8">{data ? "Edit Facility" : "New Facility"}</Title>
        <Stack gap="xl">
          <Stack align="center" gap="xs">
            <Avatar src={preview} size={100} radius={32} color="blue" className="shadow-md">
              <Camera size={40}/>
            </Avatar>
            <FileButton onChange={(f) => { if(f) setPreview(URL.createObjectURL(f)); }} accept="image/*">
              {(props) => <Button {...props} variant="light" size="xs">Change Photo</Button>}
            </FileButton>
          </Stack>

          <TextInput label="FACILITY NAME" value={name} onChange={(e)=>setName(e.target.value)} radius="md" size="lg" placeholder="e.g. Wellness Center" />
          
          {data && (
            <Paper p="lg" radius="24" withBorder className="border-dashed bg-slate-50/50">
              <Stack gap="sm">
                <Text size="xs" fw={900} c="blue">INVITATION SYSTEM</Text>
                <Select label="EXPIRE IN" value={expireMin} onChange={setExpireMin} radius="md"
                  data={[{value:'1',label:'1 min'},{value:'30',label:'30 min'},{value:'60',label:'1 hr'},{value:'1440',label:'1 day'}]}
                />
                <Group align="flex-end">
                  <TextInput value={inviteCode} readOnly placeholder="Code" className="flex-1" radius="md" />
                  <ActionIcon onClick={handleGenerateCode} loading={generating} disabled={cooldown > 0} color="blue" size={42} radius="md" variant="filled">
                    {cooldown > 0 ? <Text fz={10}>{cooldown}</Text> : <RefreshCw size={18}/>}
                  </ActionIcon>
                </Group>
              </Stack>
            </Paper>
          )}

          <Button onClick={handleAction} loading={submitting} fullWidth size="xl" radius="xl" color="blue" h={70} leftSection={<Save size={20}/>}>
            {data ? "EXECUTE CHANGES" : "CREATE UNIT"}
          </Button>
          <Button variant="subtle" color="gray" fullWidth onClick={onClose}>Cancel</Button>
        </Stack>
      </Box>
    </Modal>
  );
}

// --- 👤 MODAL: Staff Directory ---
function StaffManagementModal({ opened, onClose, section }) {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened && section?.id) {
      const loadStaff = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${API_STAFF}?id=${section.id}`, {
            method: 'GET',
            credentials: 'include',
          });

          const result = await res.json();

          if (result.success) setStaffs(result.data || []);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
      };
      loadStaff();
    }
  }, [opened, section]);

  return (
    <Modal opened={opened} onClose={onClose} centered radius={32} size="lg" padding={0} withCloseButton={false}>
      <Box className="p-8">
        <Group justify="space-between" mb="xl">
          <Title order={3} className="font-black">Staff Directory</Title>
          <ActionIcon onClick={onClose} variant="subtle" color="gray" radius="xl" size="xl"><X/></ActionIcon>
        </Group>
        <ScrollArea h={350} offsetScrollbars>
          <Stack gap="sm">
            {loading ? <Center py={40}><Loader/></Center> : staffs.length > 0 ? staffs.map(s => (
              <Paper key={s.id} p="md" radius="xl" withBorder className="bg-slate-50/50">
                <Group justify="space-between">
                  <Group gap="md">
                    <Avatar color="blue" radius="xl" size="sm" className="font-bold">{s.first_name?.[0]}</Avatar>
                    <Stack gap={0}>
                      <Text fw={800} size="sm">{s.first_name} {s.last_name}</Text>
                      <Text size="xs" c="dimmed">{s.email}</Text>
                    </Stack>
                  </Group>
                  <Badge variant="light" radius="md">{s.role}</Badge>
                </Group>
              </Paper>
            )) : <Center py={40}><Text c="dimmed">No staff members found.</Text></Center>}
          </Stack>
        </ScrollArea>
      </Box>
    </Modal>
  );
}

// --- ➕ MODAL: Join ---
function JoinSectionModal({ opened, onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if(!code) return;
    setJoining(true);
    try {
      const res = await fetch(API_STAFF, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: code })
      });
      if (res.ok) { 
        onSuccess(); 
        onClose(); 
        setCode(''); 
      } else { alert("Invalid Code"); }
    } catch(e) { alert("Join Error"); }
    finally { setJoining(false); }
  };

  return (
    <Modal opened={opened} onClose={onClose} centered radius={32} title="Join with Invite Code">
      <Stack p="xl">
        <TextInput value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter 6-digit code" size="lg" radius="md" />
        <Button onClick={handleJoin} loading={joining} size="lg" radius="xl" color="blue">Confirm Join</Button>
      </Stack>
    </Modal>
  );
}