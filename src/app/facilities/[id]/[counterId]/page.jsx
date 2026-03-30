"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, Text, Title, Group, Stack, TextInput, Textarea, ScrollArea, Modal, Select, 
  Paper, ThemeIcon, Button, ActionIcon, Badge, Flex, Grid, Center, Loader, Alert,
  UnstyledButton, CloseButton
} from '@mantine/core';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import { 
  CheckCircle, UserX, User, Phone, Layers, Clock, Send, X, ArrowLeft,
  Search, Activity, ClipboardList, UserCheck, PlayCircle
} from 'lucide-react';
import { DispenseMachine, PaperTicketContent } from "@/components/QueueTicket";
import { motion, AnimatePresence } from 'framer-motion';



const API_COUNTER = "https://queuecaredev.vercel.app/api/v1/counter";
const API_COUNTERSEARCH = "https://queuecaredev.vercel.app/api/v1/otp_verify";
const API_QUEUE = "https://queuecaredev.vercel.app/api/v1/queue";

export default function CounterWorkstationPage() {
  const { id, counterId } = useParams();
  const router = useRouter();
  
  const [opened, { open: openTransfer, close: closeTransfer }] = useDisclosure(false);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [counterInfo, setCounterInfo] = useState(null);
  const [currentQueue, setCurrentQueue] = useState(null);
  const [calledList, setCalledList] = useState([]);
  const [nextqueue, setNextQueueu] = useState([]);
  const [notes, setNotes] = useState("");

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  const [transferOptions, setTransferOptions] = useState([]); // To store the formatted list for Select
  const [targetSectionId, setTargetSectionId] = useState(null); // To store chosen value

  useEffect(() => {
    const cachedData = localStorage.getItem('cached_sub_sections');
    if (cachedData) {
      try {
        const sections = JSON.parse(cachedData);
        // Mantine Select requires { value: string, label: string }
        const formatted = sections.map(s => ({
          value: s.id.toString(),
          label: s.name
        }));
        setTransferOptions(formatted);
      } catch (e) {
        console.error("Error parsing sections", e);
      }
    }
  }, []);

  const fetchMainData = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetchError(null);
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_COUNTER}?id=${counterId}`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await res.json();
      
      if (result.success) {
        setCounterInfo(result.data.counter);
        setCurrentQueue(result.data.current_queue);
        setNextQueueu(result.data.next_queues);
        // NOTE: We don't setCalledList here anymore to avoid overwriting search results
      }
    } catch (err) {
      if (!isSilent) setFetchError("System sync failed.");
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  }, [counterId]);

  // 2. Search Sync (Only Called Queues)
  const searchCalledList = useCallback(async () => {
    setIsSyncing(true);
    try {
      const url = new URL(API_COUNTERSEARCH);
      url.searchParams.append('id', counterId);
      if (searchQuery) url.searchParams.append('search', searchQuery);

      const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });
      const result = await res.json();
      
      if (result.success) {
        setCalledList(result.data.called_queues || []);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, [counterId, searchQuery]);

  useEffect(() => {
    fetchMainData();
    const interval = setInterval(() => fetchMainData(true), 50000);
    return () => clearInterval(interval);
  }, [fetchMainData]);

  useEffect(() => {
    searchCalledList();
  }, [debouncedSearch, searchCalledList]);

  const handleQueueAction = async (actionType, transferSectionId = null, queueId = null) => {
    setIsSyncing(true);

    const body = {
      next: true,
      queue_detail: notes || "",
      counter_id: counterId,
      section_id: id
    };

    let queue_id = currentQueue?.id
    switch (actionType) {
      case 'CALL_NEXT':
        body.status = "serving";
        queue_id = queueId
        break;
      case 'FINISH':
        body.status = "complete";
        break;
      case 'NO_SHOW':
        body.status = "no_show";
        break;
      case 'TRANSFER':
        body.status = "transfer";
        body.section_id = transferSectionId;
        break;
      default:
        setIsSyncing(false);
        return;
    }

    try {
      const res = await fetch(`${API_QUEUE}?id=${queue_id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setNotes("");
        if (actionType === 'TRANSFER') closeTransfer();
        fetchCounterData(true);
        searchCalledList();
      }
    } catch (e) {
      alert("System Error: Could not update queue.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return <Center h="100vh" bg="#F8FAFC"><Loader color="blue" type="dots" size="xl" /></Center>;

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      
      <main className="flex-1 py-8 max-w-[1750px] mx-auto w-full px-6">
        <Grid gutter={40} align="stretch">
          
          {/* LEFT: PATIENT INFO (8.5/12) */}
          <Grid.Col span={{ base: 12, lg: 8.5 }}>
            <Stack gap={32}>
              <Group justify="space-between">
                <UnstyledButton onClick={() => router.back()} className="text-blue-600 font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-all">
                  <ArrowLeft size={18} /> HUB CONSOLE
                </UnstyledButton>
                <Badge size="xl" radius="lg" color={currentQueue ? "blue" : "gray"} variant={currentQueue ? "filled" : "light"} className="h-12 px-8 font-black italic uppercase shadow-lg">
                  {"Counter "+counterInfo?.name}  • {currentQueue ? "SESSION ACTIVE" : "STATION IDLE"}
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

                    <Stack gap="xl" className="w-full max-w-md mx-auto mt-8">
                      <AnimatePresence mode="wait">
                        {!currentQueue ? (
                          <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <Button 
                              onClick={() => handleQueueAction('CALL_NEXT')}
                              disabled={nextqueue.length === 0 || isSyncing}
                              fullWidth
                              size="xl" 
                              radius="28px" 
                              h={100} 
                              color="blue"
                              className="text-2xl font-black italic shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
                              leftSection={isSyncing ? <Loader size="sm" color="white" /> : <PlayCircle size={32} />}
                            >
                              {nextqueue.length > 0 ? "START NEXT QUEUE" : "NO PATIENTS IN LINE"}
                            </Button>
                            {nextqueue.length > 0 && (
                              <Text size="xs" fw={900} c="blue" ta="center" mt="md" className="tracking-widest opacity-60">
                                NEXT UP: #{nextqueue[0].number}
                              </Text>
                            )}
                          </motion.div>
                        ) : (
                          /* --- STATE B: ACTIVE (Serving Patient) --- */
                          <motion.div
                            key="active-state"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full flex flex-col gap-6"
                          >
                            <Group grow gap="xl">
                              <Button 
                                onClick={() => handleQueueAction('FINISH')} 
                                color="teal" 
                                radius="xl" 
                                h={74} 
                                className="font-black italic shadow-xl shadow-teal-500/10 active:scale-95 transition-all text-lg" 
                                leftSection={<CheckCircle size={24} />}
                              >
                                FINISH
                              </Button>
                              <Button 
                                onClick={() => handleQueueAction('NO_SHOW')} 
                                color="red" 
                                radius="xl" 
                                h={74} 
                                className="font-black italic shadow-xl shadow-red-500/10 active:scale-95 transition-all text-lg" 
                                leftSection={<UserX size={24} />}
                              >
                                NO SHOW
                              </Button>
                            </Group>
                            
                            <Button 
                              onClick={openTransfer} 
                              fullWidth 
                              color="blue" 
                              variant="light"
                              radius="28px" 
                              h={88} 
                              className="text-2xl font-black italic border-2 border-blue-100 active:scale-95 transition-all" 
                              rightSection={<Send size={28} />}
                            >
                              TRANSFER PATIENT
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                    <Title order={3} className="text-2xl font-black text-[#1E293B] uppercase italic">Calledlist</Title>
                    <TextInput 
                      placeholder="Search called patients..." 
                      leftSection={<Search size={16}/>} 
                      radius="md" 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          searchCalledList(); // Only trigger the search API
                        }
                      }}
                      rightSection={
                        isSyncing ? <Loader size="xs" /> : null
                      }
                    />
                  </Stack>
                  {isSyncing ? <Loader size="xs" color="blue" /> : <ThemeIcon size={44} radius="xl" variant="light" color="blue"><Layers size={22} /></ThemeIcon>}
                </Group>
              </Box>
              
              <ScrollArea className="flex-1" p={25}>
                <Stack gap="lg">
                  <AnimatePresence mode="popLayout">
                    {calledList.map((item) => (
                      <motion.div key={item.number} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                      <Paper p={24} radius="30px" withBorder className="bg-white border-slate-100 hover:bg-slate-50 transition-all">
                        <Flex justify="space-between" align="center">
                          <Stack gap={0}>
                            {/* 2. Your updated Title (Always Blue) */}
                            <Title order={4} className="text-3xl font-black italic tracking-tighter text-blue-600">
                              #{item.number}
                            </Title>
                            
                            {/* 3. Your updated Text (Always Dark Slate) */}
                            <Text fw={800} size="sm" className="uppercase truncate max-w-[140px] text-[#1E293B]">
                              {item.name}
                            </Text>
                          </Stack>
                        
                          {/* 4. Your updated Badge (Always Light variant) */}
                          <Button onClick={() => handleQueueAction('CALL_NEXT', null, item.id)} size="lg" radius="md" variant="blue" color="white" leftSection={<PlayCircle size={12} />} className="font-bold">
                            Recalled
                          </Button>
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
            <ActionIcon onClick={closeTransfer} variant="subtle" color="gray" radius="xl" size="xl">
              <X size={24}/>
            </ActionIcon>
          </Group>

          <Stack gap="xl">
            <Select label="Target Unit" placeholder="Select destination..." data={transferOptions} value={targetSectionId} onChange={setTargetSectionId} radius="xl" size="lg" classNames={{ input: "font-bold h-16 bg-slate-50" }} />
            <Button fullWidth size="xl" radius="xl" color="blue" h={80} className="font-black italic" loading={isSyncing} disabled={!targetSectionId} onClick={() => handleQueueAction('TRANSFER', targetSectionId)}>
              CONFIRM TRANSFER
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}