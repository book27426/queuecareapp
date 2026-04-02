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
    MonitorPlay, QrCode, Copy, Download , Trash2, ArchiveRestore, ImageIcon, Check
  }from 'lucide-react';
  import { useParams, useRouter } from 'next/navigation';
  import { motion, AnimatePresence } from 'framer-motion';
  import { QRCodeSVG } from 'qrcode.react';
  import { toBlob } from 'html-to-image'; // Import this at the top

  // ✅ API Endpoints
  const API_SECTION = "https://queuecaredev.vercel.app/api/v1/section";
  const API_OTHER = "https://queuecaredev.vercel.app/api/v1/section/other";
  const API_COUNTER = "https://queuecaredev.vercel.app/api/v1/counter";
  const API_STAFF = "https://queuecaredev.vercel.app/api/v1/staff";

  export default function FacilityHubPage() {
    const params = useParams();
    const router = useRouter(); 
    const hubId = params.id;
    const [qrConfig, setQrConfig] = useState({ url: '', title: '', subtext: '' });

    const [initialLoading, setInitialLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [mainSection, setMainSection] = useState(null);
    const [role, setRole] = useState(null);
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

    const isRedirecting = useRef(false);

    const canManage = (currentRole) => ['super_admin', 'admin'].includes(currentRole?.toLowerCase());

    const openConsoleQr = (counter) => {
      const consoleUrl = `${window.location.origin}/facilities/${hubId}/${counter.id}`;
      setQrConfig({
        url: consoleUrl,
        title: `Counter ${counter.name}`,
        subtext: "Scan to open this station's console"
      });
      openQr();
    };

    const openRegistrationQr = () => {
      setQrConfig({
        url: `${window.location.origin}/join?id=${hubId}`,
        title: "Registration",
        subtext: "Scan to join the queue"
      });
      openQr();
    };

    // ✅ 1. Fetch Static Data (Run once on load)
    const fetchStaticData = useCallback(async () => {
      setInitialLoading(true);
      try {
        const res = await fetch(`${API_SECTION}?id=${hubId}`, { credentials: 'include' });
        const result = await res.json();
        if (result.success) {
          setMainSection(result.data.section);
          setListData(result.data.sub_sections || []);
          setRole(result.data.role)
        } else if (res.status === 403) {
          router.back();
        }
      } catch (err) {
        console.error("Static fetch error:", err);
      } finally {
        setInitialLoading(false);
      }
    }, [hubId, router]);

    // ✅ 2. Fetch Live Data (Runs every 5-10 seconds)
    const fetchLiveData = useCallback(async () => {
      setIsSyncing(true);
      try {
        const res = await fetch(`${API_OTHER}?id=${hubId}`, { credentials: 'include' });
        const result = await res.json();
        if (result.success) {
          setLiveQueues(result.data.queues || []);
          setStats(result.data.stats || {});
          setCounters(result.data.counters || []);
        }
      } catch (err) {
        console.error("Live fetch error:", err);
      } finally {
        setIsSyncing(false);
      }
    }, [hubId]);

    // ✅ 3. Fetch Staff (On-Demand)
    const fetchStaffData = async () => {
      try {
        const res = await fetch(`${API_STAFF}?id=${hubId}`, { credentials: 'include' });
        const result = await res.json();
        if (result.success) {
          setStaffs(result.data || []);
          openStaff(); // Open modal after data is ready
        }
      } catch (err) {
        alert("Could not load staff list");
      }
    };

    useEffect(() => {
      if (hubId) {
        // Phase 1: Load static data immediately
        fetchStaticData();
        
        // Phase 2: Load live data immediately, then start a fast interval (5s)
        fetchLiveData();
        const liveInterval = setInterval(fetchLiveData, 10000); 

        return () => clearInterval(liveInterval);
      }
    }, [hubId, fetchStaticData, fetchLiveData]);

    const refreshAll = useCallback(() => {
      fetchStaticData();
      fetchLiveData();
    }, [fetchStaticData, fetchLiveData]);

    const handleDelete = async (id, deleteType) => {
      let label = '';
      let api = '';

      if (deleteType === 'COUNTER') {
        label = 'Counter';
        api = API_COUNTER;
      } else if (deleteType === 'STAFF') {
        label = 'Staff Member';
        api = API_STAFF; // This points to your https://.../api/v1/staff
      } else {
        label = 'Sector';
        api = API_SECTION;
      }

      if (!window.confirm(`Are you sure you want to remove this ${label}?`)) return;

      try {
        const res = await fetch(`${api}?id=${id}&staff_id`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const result = await res.json();
        if (result.success) {
          refreshAll(); // Refresh UI
        } else {
          alert(result.message || "Failed to delete");
        }
      } catch (err) {
        alert("An error occurred while deleting.");
      }
    };

    if (initialLoading && !mainSection) return <Box p={50} bg="#F8FAFC" className="min-h-screen"><Container size="xl"><Skeleton height={600} radius={40} /></Container></Box>;

    return (
      <Box className="min-h-screen bg-[#F8FAFC] antialiased flex flex-col">
        
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
                <Button variant="light" color="teal" radius="xl" size="lg" h={60} leftSection={<QrCode size={20}/>} onClick={openRegistrationQr} className="font-bold">QR CODE</Button>
                <Button variant="light" color="indigo" radius="xl" size="lg" h={60} leftSection={<MonitorPlay size={20}/>} onClick={() => router.push(`/facilities/${hubId}/dashboard`)} className="font-bold">TV DISPLAY</Button>
                <Button variant="light" color="blue" radius="xl" size="lg" h={60} leftSection={<Users size={20}/>} onClick={fetchStaffData} className="font-bold">STAFFS</Button>
                {canManage(role) && (
                  <>
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
                    <Button 
                      variant="light" 
                      color="red" 
                      radius="xl" 
                      size="lg" 
                      h={60} 
                        leftSection={<Trash2 size={20} />}
                        onClick={() => {
                          handleDelete(unit.id, 'SECTION')
                          onClose(); 
                        }}
                        className="font-black italic uppercase"
                      >
                      Delete
                    </Button>
                  </>
                )}
              </Group>
            </Group>

            {/* ✅ 1. OVERALL STATISTICS (Mock Data) */}
            <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="lg">
              <StatBox label="TOTAL QUEUES" value={stats.queues_remaining} icon={UserPlus} color="teal" />
              <StatBox label="NEW QUEUES /H" value={stats.increase_last_hour} icon={ArchiveRestore} color="indigo" />
              <StatBox label="DONE QUEUES /H" value={stats.clear_last_hour} icon={Activity} color="indigo" />
              <StatBox label="AVG OPERATION TIME" value={stats.avg_operation_time_minutes} icon={Hourglass} color="blue" />
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
                        {canManage(role) && (
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
                        )}
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
                                  <Group gap={4}> {/* gap={4} makes them very close */}
                                    <ActionIcon variant="light" color="teal" radius="xl" size="xl" onClick={() => openConsoleQr(c)}>
                                      <QrCode size={18}/>
                                    </ActionIcon>
                                    {canManage(role) && (
                                      <>
                                        <ActionIcon variant="light" color="indigo" radius="xl" size="xl" onClick={() => { setEditingId(c.id); setModalType('COUNTER'); openAdd(); }}>
                                          <Pencil size={18}/>
                                        </ActionIcon>
                                        <ActionIcon variant="light" color="red" radius="xl" size="xl" onClick={() => handleDelete(c.id, 'COUNTER')}>
                                          <Trash2 size={18}/>
                                        </ActionIcon>
                                      </>
                                    )}
                                  </Group>
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
                        {canManage(role) && (
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
                        )}
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
                                  <Group gap={4}> {/* gap={4} makes them very close */}
                                    {canManage(role) && (
                                      <>
                                        <ActionIcon variant="light" color="blue" radius="xl" size="xl" onClick={() => { setEditingId(unit.id); setModalType('SECTION'); openAdd(); }}><Pencil size={18}/></ActionIcon>
                                        <ActionIcon variant="subtle" color="red" radius="xl" size="xl" onClick={() => handleDelete(unit.id, 'COUNTER')}>
                                          <Trash2 size={18}/>
                                        </ActionIcon>
                                      </>
                                    )}
                                  </Group>
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
        {/* Inside FacilityHubPage return statement */}
        <AddUnitModal 
          opened={addModalOpened} 
          onClose={closeAdd} 
          hubId={hubId} 
          parentId={mainSection?.parent_id}
          onSuccess={refreshAll} // Changed from fetchData to refreshAll to match your function name
          type={modalType} 
          onDelete={handleDelete} // 👈 PASS THE LOGIC HERE
          data={
            editingId === mainSection?.id 
              ? mainSection 
              : (modalType === 'COUNTER' 
                  ? counter.find(c => c.id === editingId) 
                  : listData.find(u => u.id === editingId))
          } 
        />
        <StaffModal opened={staffModalOpened} onClose={closeStaff} staffs={staffs} role={role} />
        <QRModal 
          opened={qrModalOpened} 
          onClose={closeQr} 
          url={qrConfig.url} 
          title={qrConfig.title} 
          subtext={qrConfig.subtext} 
        />
      </Box>
    );
  }

  // --- 🛠️ MODAL COMPONENT ---
  function QRModal({ opened, onClose, url, title, subtext }) {
    const qrRef = useRef(null);
    const [copiedImg, setCopiedImg] = useState(false);

    const handleCopyLink = () => {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    };

    const handleCopyImage = async () => {
      if (!qrRef.current) return;
      
      try {
        // Convert the div containing the QR to a blob
        const blob = await toBlob(qrRef.current, { 
          backgroundColor: '#ffffff',
          pixelRatio: 2 // Higher quality
        });
        
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        
        setCopiedImg(true);
        setTimeout(() => setCopiedImg(false), 2000); // Reset icon after 2s
      } catch (err) {
        console.error("Image copy failed", err);
        alert("Failed to copy image. Your browser might not support this.");
      }
    };

    return (
      <Modal opened={opened} onClose={onClose} centered radius={45} size="md" padding={40} withCloseButton={false}>
        <Stack align="center" gap="xl">
          <Stack gap={4} align="center">
            <Title order={2} className="text-3xl font-black uppercase text-[#1E293B]" fs="italic">
              {title} <span className="text-blue-600">QR.</span>
            </Title>
            <Text c="dimmed" fw={800} tt="uppercase" size="xs" className="tracking-widest">{subtext}</Text>
          </Stack>
          
          {/* ✅ The Ref is attached here */}
          <Paper ref={qrRef} p={30} radius={40} withBorder className="bg-white shadow-inner">
            {typeof window !== 'undefined' && <QRCodeSVG value={url} size={220} level="H" includeMargin={true} />}
          </Paper>

          <Stack gap="xs" w="100%">
            {/* ✅ NEW: COPY IMAGE BUTTON */}
            <Button 
              variant="filled" 
              color={copiedImg ? "teal" : "indigo"} 
              radius="xl" 
              size="lg" 
              h={54}
              leftSection={copiedImg ? <Check size={18}/> : <ImageIcon size={18}/>} 
              onClick={handleCopyImage}
              className="font-black italic transition-all"
            >
              {copiedImg ? "IMAGE COPIED!" : "COPY QR IMAGE"}
            </Button>

            {/* EXISTING: COPY LINK BUTTON */}
            <Button 
              variant="light" 
              color="blue" 
              radius="xl" 
              size="lg" 
              h={54}
              leftSection={<Copy size={18}/>} 
              onClick={handleCopyLink}
              className="font-bold"
            >
              COPY LINK
            </Button>

            <Button variant="subtle" color="gray" radius="xl" onClick={onClose} className="font-bold mt-2">
              CLOSE
            </Button>
          </Stack>
        </Stack>
      </Modal>
    );
  }

  function AddUnitModal({ opened, onClose, data, hubId, parentId, onSuccess, type, onDelete }) {
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
        formData.append('parent_id', parentId);

        if (file) formData.append('image', file);

        const res = await fetch(url, {
          method: isEdit ? 'PUT' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
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
        const res = await fetch(`${API_OTHER}?id=${data.id}`, {
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
  function StaffModal({ opened, onClose, staffs, role, onDelete }) {
    const canManage = (currentRole) => ['owner', 'admin'].includes(currentRole?.toLowerCase());
    return (
      <Modal opened={opened} onClose={onClose} centered radius={45} size="500px" padding={0} withCloseButton={false}>
        <Box className="p-12">
          <Group justify="space-between" mb={32}>
            <Title order={2} className="font-black uppercase text-[#1E293B]" fs="italic">Staff List</Title>
            <ActionIcon onClick={onClose} variant="subtle" color="gray" radius="xl" size="xl">
              <X size={24}/>
            </ActionIcon>
          </Group>

          <ScrollArea h={400}>
            <Stack gap="md">
              {(staffs || []).map((s, i) => (
                <Paper key={i} p={22} radius="28px" withBorder className="bg-slate-50/50 shadow-sm">
                  <Group justify="space-between">
                    <Group gap="md">
                      <Avatar radius="xl" color="blue" variant="light" fw={800}>
                        {s.first_name?.[0]}
                      </Avatar>
                      <Stack gap={0}>
                        <Text fw={800} size="sm">{s.first_name} {s.last_name}</Text>
                        <Badge color="blue" variant="filled" size="xs">{s.role}</Badge>
                      </Stack>
                    </Group>

                    {/* Fix: Added 'onDelete' call and proper '&&' syntax */}
                    {canManage(role) && !canManage(s.role) && (
                      <ActionIcon 
                        variant="light" 
                        color="red" 
                        radius="xl" 
                        size="xl" 
                        onClick={() => onDelete(s.id, 'STAFF')}
                      >
                        <Trash2 size={18}/>
                      </ActionIcon>
                    )}
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
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