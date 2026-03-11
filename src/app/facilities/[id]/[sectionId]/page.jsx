"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, Text, Title, Group, Stack, TextInput, Textarea, ScrollArea, Modal, Select, 
  Paper, ThemeIcon, Button, ActionIcon, Badge, Flex, Grid, Center, Loader, Alert,
  UnstyledButton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  CheckCircle, UserX, User, Phone, Layers, Clock, Send, X, ArrowLeft,
  Info, Activity, ClipboardList, UserCheck
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import { DispenseMachine, PaperTicketContent } from "@/components/QueueTicket";
import { motion, AnimatePresence } from 'framer-motion';

const API_COUNTER = "https://queuecaredev.vercel.app/api/v1/counter";
const API_QUEUE = process.env.NEXT_PUBLIC_QUEUE_API || "https://queuecaredev.vercel.app/api/v1/queue";

export default function CounterWorkstationPage() {
  const { id, counterId } = useParams();
  const router = useRouter();
  
  const [opened, { open: openTransfer, close: closeTransfer }] = useDisclosure(false);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [counterInfo, setCounterInfo] = useState(null);
  const [currentQueue, setCurrentQueue] = useState(null);
  const [waitingList, setWaitingList] = useState([]);
  const [notes, setNotes] = useState("");

  const fetchCounterData = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetchError(null);
    setIsSyncing(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_COUNTER}?id=${counterId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      
      if (result.success) {
        setCounterInfo(result.data.counter);
        setCurrentQueue(result.data.current_queue);
        setWaitingList(result.data.waiting_queues || []);
      }
    } catch (err) {
      if (!isSilent) setFetchError("System sync failed.");
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [counterId]);

  useEffect(() => {
    fetchCounterData();
    const interval = setInterval(() => fetchCounterData(true), 5000);
    return () => clearInterval(interval);
  }, [fetchCounterData]);

  const handleQueueAction = async (actionType) => {
    if (!currentQueue) return;
    const targetStatus = actionType === 'FINISH' ? "complete" : "cancel";

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_QUEUE}?id=${currentQueue.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: targetStatus, queue_detail: notes })
      });

      if (res.ok) {
        setNotes("");
        fetchCounterData(true);
      }
    } catch (e) { alert("Action Error"); }
  };

  if (loading) return <Center h="100vh" bg="#F8FAFC"><Loader color="blue" type="dots" size="xl" /></Center>;

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Navbar user={{ name: "OPERATOR", role: "Staff" }} />
      
      <main className="flex-1 py-8 max-w-[1750px] mx-auto w-full px-6">
        <Grid gutter={40} align="stretch">
          
          {/* LEFT: PATIENT INFO (8.5/12) */}
          <Grid.Col span={{ base: 12, lg: 8.5 }}>
            <Stack gap={32}>
              <Group justify="space-between">
                <UnstyledButton onClick={() => router.back()} className="text-blue-600 font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-all">
                  <ArrowLeft size={18} /> HUB CONSOLE
                </UnstyledButton>
                <Badge size="xl" radius="lg" color="blue" variant="filled" className="h-12 px-8 font-black italic uppercase shadow-lg">
                  {counterInfo?.name} • {currentQueue ? "SESSION ACTIVE" : "STATION IDLE"}
                </Badge>
              </Group>

              <Grid gutter={32} align="stretch">
                <Grid.Col span={{ base: 12, md: 5.5 }}>
                  <Paper p={40} radius={40} withBorder className="bg-white border-slate-100 shadow-xl h-full">
                    <Group gap="md" mb={35} className="border-b border-slate-50 pb-5">
                      <ThemeIcon size={44} radius="14px" color="blue" variant="light"><ClipboardList size={22} /></ThemeIcon>
                      <Title order={3} className="text-2xl font-black text-[#1E293B]">Patient Info</Title>
                    </Group>
                    
                    <Stack gap={24}>
                      <Box>
                        <Text size="xs" fw={900} c="dimmed" className="mb-2 tracking-widest uppercase">Full Name</Text>
                        <TextInput value={currentQueue?.name || "---"} readOnly radius="xl" size="lg" leftSection={<User size={18} className="text-blue-500" />} classNames={{ input: "font-bold h-14 bg-slate-50 border-transparent shadow-inner" }} />
                      </Box>
                      <Box>
                        <Text size="xs" fw={900} c="dimmed" className="mb-2 tracking-widest uppercase">Contact Number</Text>
                        <TextInput value={currentQueue?.phone_num || "---"} readOnly radius="xl" size="lg" leftSection={<Phone size={18} className="text-blue-500" />} classNames={{ input: "font-bold h-14 bg-slate-50 border-transparent shadow-inner" }} />
                      </Box>
                      <Box>
                        <Text size="xs" fw={900} c="dimmed" className="mb-2 tracking-widest uppercase">Session Notes</Text>
                        <Textarea placeholder="Type case details here..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={!currentQueue} minRows={5} radius="24px" classNames={{ input: "font-bold p-5 bg-slate-50 border-transparent focus:bg-white transition-all shadow-inner" }} />
                      </Box>
                    </Stack>
                  </Paper>
                </Grid.Col>

                {/* ✅ SERVICE AREA: KEEP DISPENSER + PERFECT CENTERED BUTTONS */}
                <Grid.Col span={{ base: 12, md: 6.5 }}>
                  <Paper p={40} radius={40} withBorder className="bg-slate-50/30 border-slate-100 flex flex-col items-center justify-center h-full shadow-inner relative overflow-hidden text-center">
                    
                    {/* Keep the Ticket Dispenser as requested */}
                    <Box className="w-full flex flex-col items-center">
                      <DispenseMachine />
                      
                      <div className="relative w-full flex justify-center h-[300px] overflow-hidden">
                        <AnimatePresence mode="wait">
                          {currentQueue && (
                            <motion.div 
                              key={currentQueue.number} 
                              initial={{ y: -300, opacity: 0 }} 
                              animate={{ y: 0, opacity: 1 }} 
                              exit={{ y: 600, opacity: 0 }} 
                              transition={{ type: "spring", stiffness: 80, damping: 15 }}
                              className="absolute top-0 z-10"
                            >
                              <PaperTicketContent queueNumber={currentQueue.number} hospitalName={counterInfo?.name} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Box>

                    {/* ✅ จัดกลุ่มปุ่มให้อยู่กึ่งกลางหน้าจออย่างสมดุล */}
                    <Stack gap="xl" className="w-full max-w-md mx-auto mt-8">
                      <Group grow gap="xl">
                        <Button 
                          onClick={() => handleQueueAction('FINISH')} 
                          disabled={!currentQueue} 
                          color="teal" radius="xl" h={74} 
                          className="font-black italic shadow-xl shadow-teal-500/10 active:scale-95 transition-all text-lg" 
                          leftSection={<CheckCircle size={24} />}
                        >
                          FINISH
                        </Button>
                        <Button 
                          onClick={() => handleQueueAction('NO_SHOW')} 
                          disabled={!currentQueue} 
                          color="red" radius="xl" h={74} 
                          className="font-black italic shadow-xl shadow-red-500/10 active:scale-95 transition-all text-lg" 
                          leftSection={<UserX size={24} />}
                        >
                          NO SHOW
                        </Button>
                      </Group>
                      
                      <Button 
                        onClick={openTransfer} 
                        disabled={!currentQueue} 
                        fullWidth color="blue" radius="28px" h={88} 
                        className="text-2xl font-black italic shadow-2xl shadow-blue-500/20 active:scale-95 transition-all" 
                        rightSection={<Send size={28} />}
                      >
                        TRANSFER PATIENT
                      </Button>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Stack>
          </Grid.Col>

          {/* RIGHT: WAITLIST */}
          <Grid.Col span={{ base: 12, lg: 3.5 }} className="hidden lg:block">
            <Paper radius={40} withBorder className="bg-white border-slate-100 shadow-2xl h-full overflow-hidden flex flex-col">
              <Box p={40} className="bg-slate-50/50 border-b border-slate-100">
                <Group justify="space-between">
                  <Stack gap={0}>
                    <Title order={3} className="text-2xl font-black text-[#1E293B] uppercase italic">Waitlist</Title>
                    <Text size="xs" fw={900} c="blue" className="tracking-widest">REAL-TIME FEED</Text>
                  </Stack>
                  {isSyncing ? <Loader size="xs" color="blue" /> : <ThemeIcon size={44} radius="xl" variant="light" color="blue"><Layers size={22} /></ThemeIcon>}
                </Group>
              </Box>
              
              <ScrollArea className="flex-1" p={25}>
                <Stack gap="lg">
                  <AnimatePresence mode="popLayout">
                    {waitingList.map((item, i) => (
                      <motion.div key={item.number} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                        <Paper p={24} radius="30px" withBorder className={`border-slate-100 transition-all ${i === 0 ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-200' : 'bg-white hover:bg-slate-50'}`}>
                          <Flex justify="space-between" align="center">
                            <Stack gap={0}>
                              <Title order={4} className={`text-3xl font-black italic tracking-tighter ${i === 0 ? 'text-white' : 'text-blue-600'}`}>#{item.number}</Title>
                              <Text fw={800} size="sm" className={`uppercase truncate max-w-[140px] ${i === 0 ? 'text-blue-100' : 'text-[#1E293B]'}`}>{item.name}</Text>
                            </Stack>
                            <Badge size="lg" radius="md" variant={i === 0 ? 'white' : 'light'} color="blue" leftSection={<Clock size={12} />} className="font-bold">Waiting</Badge>
                          </Flex>
                        </Paper>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Stack>
              </ScrollArea>
            </Paper>
          </Grid.Col>
        </Grid>
      </main>

      <Modal opened={opened} onClose={closeTransfer} centered radius={45} size="500px" padding={0} withCloseButton={false}>
        <Box className="p-12">
          <Group justify="space-between" mb={40}>
            <Title order={2} className="font-black italic uppercase text-[#1E293B]">Transfer Case</Title>
            <ActionIcon onClick={closeTransfer} variant="subtle" color="gray" radius="xl" size="xl"><X size={24}/></ActionIcon>
          </Group>
          <Stack gap="xl">
            <Select label="Target Unit" placeholder="Select..." data={['Dental', 'General']} radius="xl" size="lg" classNames={{ input: "font-bold h-16 bg-slate-50" }} />
            <Button fullWidth size="xl" radius="xl" color="blue" h={80} className="font-black italic">CONFIRM</Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}