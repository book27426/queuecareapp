"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Text, Title, Group, Stack, TextInput, Modal, Select, 
  SimpleGrid, Skeleton, ActionIcon, Container, Image, FileButton, Button, Paper, ThemeIcon, Badge, Flex
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Pencil, X, RefreshCw, Timer, ArrowRight, Users, ImageIcon, Activity, Clock, Upload, ShieldCheck, Search
} from 'lucide-react';
import { Navbar } from "@/components/Navbar";
import Link from 'next/link';

const EXPIRE_OPTIONS = [
  { value: '30m', label: '30 MINUTES' }, { value: '1h', label: '1 HOUR' },
  { value: '1d', label: '1 DAY' }, { value: 'never', label: 'NEVER' },
];

export default function StaffManagementPage() {
  const [loading, setLoading] = useState(true);
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [editingFacility, setEditingFacility] = useState(null);

  const [facilities, setFacilities] = useState([
    { 
      id: '1', name: "ALPHA TERMINAL", staffCount: 12, 
      logo: "https://img.freepik.com/free-vector/abstract-logo-template_23-2148243456.jpg",
      liveData: { queue: "24", queueTrend: "+15%", queueStatus: "bad", time: "12m", timeTrend: "-2m", timeStatus: "good" } 
    },
    { 
      id: '2', name: "BRAVO MEDICAL", staffCount: 8, logo: "",
      liveData: { queue: "15", queueTrend: "-5%", queueStatus: "good", time: "18m", timeTrend: "0m", timeStatus: "neutral" }
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (type) => {
    if (type === "good") return "teal";
    if (type === "bad") return "red";
    return "gray";
  };

  if (loading) return <Box p={50}><Stack gap="xl"><Skeleton height={60} radius="xl" /><SimpleGrid cols={3}><Skeleton height={400} radius={40} /><Skeleton height={400} radius={40} /><Skeleton height={400} radius={40} /></SimpleGrid></Stack></Box>;

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar user={{ name: "SYSTEM ADMIN", role: "Manager" }} />

      <Container size="xl" className="flex-1 py-12 z-10">
        <Stack gap={48}>
          {/* HEADER SECTION: Administrative Style */}
          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <Text className="tracking-[0.3em] text-blue-600 font-bold text-[10px] uppercase">Infrastructure</Text>
              <Title className="text-4xl lg:text-6xl font-extrabold text-[#1E293B] tracking-tighter italic">
                Facility <span className="text-blue-600">Hub.</span>
              </Title>
            </Stack>

            <Button 
              onClick={() => {setEditingFacility(null); open();}} 
              size="xl" radius="xl" color="blue" 
              leftSection={<Plus size={22} />}
              className="h-16 px-10 font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              ADD NEW FACILITY
            </Button>
          </Group>

          {/* FACILITIES GRID: Premium Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={32}>
            {facilities.map((f) => (
              <Paper key={f.id} p={32} radius={40} withBorder className="bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
                
                <Group justify="space-between" align="flex-start" mb="xl">
                  <Paper className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner">
                    {f.logo ? <Image src={f.logo} alt="Logo" fit="contain" /> : <ImageIcon size={28} className="text-slate-200" />}
                  </Paper>
                  <ActionIcon 
                    variant="light" color="blue" size="lg" radius="xl" 
                    onClick={() => {setEditingFacility(f); open();}}
                    className="group-hover:scale-110 transition-transform"
                  >
                    <Pencil size={18} />
                  </ActionIcon>
                </Group>

                <Stack gap={4} mb={32}>
                  <Title order={3} className="text-2xl font-extrabold text-[#1E293B] tracking-tight uppercase italic">{f.name}</Title>
                  <Badge variant="dot" color="blue" size="sm">Active Operational Unit</Badge>
                </Stack>

                {/* PERFORMANCE ANALYTICS PANEL */}
                <SimpleGrid cols={2} spacing="md" mb={40}>
                  <Paper p="md" radius="24px" bg="slate-50" className="border border-slate-100">
                    <Group gap={6} mb={4}>
                      <Activity size={12} className="text-blue-600" />
                      <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Queue</Text>
                    </Group>
                    <Group align="baseline" gap={6}>
                      <Text className="text-2xl font-black text-[#1E293B] italic">{f.liveData.queue}</Text>
                      <Text className="text-[10px] font-bold" style={{ color: getStatusColor(f.liveData.queueStatus) }}>{f.liveData.queueTrend}</Text>
                    </Group>
                  </Paper>
                  <Paper p="md" radius="24px" bg="slate-50" className="border border-slate-100">
                    <Group gap={6} mb={4}>
                      <Clock size={12} className="text-teal-500" />
                      <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Avg Time</Text>
                    </Group>
                    <Group align="baseline" gap={6}>
                      <Text className="text-2xl font-black text-[#1E293B] italic">{f.liveData.time}</Text>
                      <Text className="text-[10px] font-bold" style={{ color: getStatusColor(f.liveData.timeStatus) }}>{f.liveData.timeTrend}</Text>
                    </Group>
                  </Paper>
                </SimpleGrid>

                {/* FOOTER ACTION */}
                <Group justify="space-between" className="pt-6 border-t border-slate-50">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="gray" radius="md" size="sm"><Users size={14} /></ThemeIcon>
                    <Text className="text-xs font-bold text-slate-500">{f.staffCount} STAFF MEMBERS</Text>
                  </Group>
                  <Button 
                    component={Link} href={`/staff/${f.id}`}
                    variant="filled" color="blue" radius="xl" 
                    className="h-12 px-6 font-bold shadow-lg shadow-blue-600/10 active:scale-95 transition-all"
                    rightSection={<ArrowRight size={18} />}
                  >
                    ENTER HUB
                  </Button>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      {/* MODAL: Master Setup */}
      <FacilityManagementModal opened={modalOpened} onClose={close} facility={editingFacility} />
    </Box>
  );
}

function FacilityManagementModal({ opened, onClose, facility }) {
  const [name, setName] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [expireDuration, setExpireDuration] = useState('1d'); 
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (facility) {
      setName(facility.name); setLogoPreview(facility.logo || ''); setInviteCode('ST-9922-X');
    } else {
      setName(''); setLogoPreview(''); setInviteCode('');
    }
  }, [facility, opened]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleFileUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCode = () => {
    if (cooldown > 0) return;
    setInviteCode(`ST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setCooldown(60); 
  };

  return (
    <Modal opened={opened} onClose={onClose} centered radius="40px" withCloseButton={false} padding={0} size="640px">
      <Box className="p-10 lg:p-14 bg-white relative">
        {/* FIXED X BUTTON: Absolute Top-Right */}
        <ActionIcon 
          variant="light" color="gray" radius="xl" size="xl" onClick={onClose} 
          style={{ position: 'absolute', top: '28px', right: '28px', zIndex: 100 }}
          className="hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={24} />
        </ActionIcon>

        <Stack gap={40}>
          <Stack gap={4}>
            <Text className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Administrative Console</Text>
            <Title className="text-3xl font-extrabold text-[#1E293B] tracking-tight">{facility ? "Edit Facility" : "New Facility"}</Title>
          </Stack>
          
          <Stack gap="xl">
            <TextInput 
              label="FACILITY NAME (REQUIRED)" placeholder="e.g. ALPHA MEDICAL CENTER" 
              value={name} onChange={(e) => setName(e.target.value)} required 
              size="lg" radius="md" 
              classNames={{ input: "font-bold h-14 border-slate-200 focus:border-blue-500", label: "font-bold text-[11px] mb-2 text-slate-500" }} 
            />
            
            {/* Branding Section */}
            <Paper p={24} radius="24px" withBorder bg="slate-50" className="border-slate-100">
              <Group gap="xl" align="flex-start">
                <Box className="w-24 h-24 rounded-3xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm relative group">
                  {logoPreview ? <Image src={logoPreview} alt="Logo" fit="contain" /> : <ImageIcon size={32} className="text-slate-200" />}
                  <FileButton onChange={handleFileUpload} accept="image/*">
                    {(props) => (
                      <ActionIcon {...props} variant="filled" color="blue" radius="xl" className="absolute bottom-1 right-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={14} />
                      </ActionIcon>
                    )}
                  </FileButton>
                </Box>
                <Stack gap="sm" className="flex-1">
                  <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logo Configuration</Text>
                  <TextInput placeholder="Image URL..." value={typeof logoPreview === 'string' && logoPreview.startsWith('http') ? logoPreview : ''} onChange={(e) => setLogoPreview(e.target.value)} radius="md" classNames={{ input: "h-11 text-xs" }} />
                  <FileButton onChange={handleFileUpload} accept="image/*">
                    {(props) => <Button {...props} variant="outline" color="blue" radius="md" size="xs" leftSection={<Upload size={14} />}>Upload Local File</Button>}
                  </FileButton>
                </Stack>
              </Group>
            </Paper>

            {/* SYMMETRICAL INVITATION BOX */}
            <Paper p={30} radius={32} withBorder className="bg-blue-50/30 border-blue-100">
              <Stack gap="xl">
                <Group gap="md"><ShieldCheck size={20} className="text-blue-600" /><Text className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Invitation Protocol</Text></Group>
                <Group align="flex-end">
                  <TextInput label="STAFF INVITE CODE" value={inviteCode} readOnly className="flex-1" radius="md" size="lg" classNames={{ input: "font-black h-14 bg-white text-blue-600 border-blue-200" }} />
                  <ActionIcon onClick={handleGenerateCode} disabled={cooldown > 0} variant="filled" color="blue" size="56px" radius="md" className="shadow-lg shadow-blue-600/20">
                    {cooldown > 0 ? <Text className="font-bold text-xs">{cooldown}s</Text> : <RefreshCw size={24} />}
                  </ActionIcon>
                </Group>
                <Select label="CODE VALIDITY" data={EXPIRE_OPTIONS} value={expireDuration} onChange={setExpireDuration} radius="md" size="lg" leftSection={<Timer size={18} />} classNames={{ input: "font-bold h-14 border-slate-200" }} />
              </Stack>
            </Paper>
          </Stack>
          
          <Button 
            onClick={onClose} disabled={!name.trim()} fullWidth size="xl" radius="xl" color="blue" 
            className="h-20 text-lg font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            rightSection={<ArrowRight size={28} />}
          >
            INITIALIZE FACILITY SETUP
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}