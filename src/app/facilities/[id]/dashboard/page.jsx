"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Box, Text, Stack, Group, Title, Paper, Badge, Grid, ThemeIcon, ScrollArea, Center 
} from '@mantine/core';
import { 
  Clock, Zap, Timer, MonitorPlay, Activity 
} from 'lucide-react';
import { QueueCareLogo } from "@/components/Navbar";
import { motion } from 'framer-motion';

export default function FullScreenSignageDashboard() {
  const { id } = useParams();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  //fetch get api/v1/queue?section_id
  const [activeCalls] = useState([
    { id: 'A009', unit: 'Dental Unit', counter: '03' },
    { id: 'A010', unit: 'Center Terminal', counter: '01' },
    { id: 'B022', unit: 'General Clinic', counter: '05' },
    { id: 'C012', unit: 'X-Ray Lab', counter: '02' },
    { id: 'A011', unit: 'Dental Unit', counter: '04' },
    { id: 'D005', unit: 'Emergency', counter: '01' },
  ]);

  const [nextInLine] = useState([
    { id: 'A012', unit: 'Dental Unit', wait: '2m' },
    { id: 'B023', unit: 'General Clinic', wait: '3m' },
    { id: 'A013', unit: 'Dental Unit', wait: '5m' },
    { id: 'C013', unit: 'X-Ray Lab', wait: '7m' },
    { id: 'B024', unit: 'General Clinic', wait: '9m' },
  ]);

  useEffect(() => { 
    setMounted(true); 
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  return (
    <Box className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased overflow-hidden p-6">
      <Group justify="space-between" mb={30} px={20}>
        <Stack gap={0}>
          <Text c="blue.7" fw={900} size="xs" tt="uppercase" lts="0.4em" mb={4}>Queue Management System</Text>
          <Title order={1} c="#1E293B" fs="italic" className="tracking-tighter uppercase" size="h2">
            {id.replace('-', ' ')}
          </Title>
        </Stack>
        <Paper px={30} py={15} radius="24px" withBorder className="bg-white shadow-lg flex items-center gap-4">
           <Clock size={32} className="text-blue-600" strokeWidth={2.5} />
           <Text c="#1E293B" fw={900} size="36px" className="tabular-nums leading-none">
             {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
           </Text>
        </Paper>
      </Group>

      <main className="flex-1 flex flex-col">
        <Grid gutter={24} className="flex-1">
          
          <Grid.Col span={9}>
            <Stack gap="lg" className="h-full">
              <Group gap="sm" mb={5}>
                <ThemeIcon size={48} radius="xl" color="blue" variant="filled" className="shadow-md shadow-blue-200">
                  <Zap size={24} fill="white" />
                </ThemeIcon>
                <Title order={2} c="#1E293B" fs="italic" className="uppercase tracking-tight" size="h2">
                  Now <span className="text-blue-600">Calling.</span>
                </Title>
              </Group>

              <Grid gutter={20}>
                {activeCalls.map((call, i) => (
                  <Grid.Col span={4} key={call.id}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                      <Paper 
                        radius="48px" p={24} withBorder
                        className={`shadow-xl transition-all h-full flex flex-col items-center justify-center ${
                          i === 0 
                          ? 'bg-blue-50 border-blue-500 border-[4px]'
                          : 'bg-white border-slate-100 border-2'
                        }`}
                      >
                        <Badge 
                          variant="light" color="blue" size="md" radius="md" 
                          className="font-black w-full mb-3"
                          c="blue.9"
                        >
                          {call.unit}
                        </Badge>
                        
                        <Text 
                          fw={900} fs="italic" leading="none" size="90px"
                          c="#1E293B"
                          className="tracking-tighter"
                        >
                          {call.id}
                        </Text>
                        
                        <Box className="w-10 h-1 my-4 rounded-full bg-blue-100" />
                        
                        <Group gap={10} align="center">
                          <Text c="slate.4" fw={700} tt="uppercase" lts="0.2em" size="xs">Counter</Text>
                          <Text 
                            fw={900} size="54px"
                            c="#1E293B"
                          >
                            {call.counter}
                          </Text>
                        </Group>
                      </Paper>
                    </motion.div>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Grid.Col>

          <Grid.Col span={3}>
            <Stack gap="lg" className="h-full">
              <Group gap="sm" mb={5}>
                <ThemeIcon size={48} radius="xl" color="teal" variant="light">
                  <MonitorPlay size={24} />
                </ThemeIcon>
                <Title order={2} c="#1E293B" fs="italic" className="uppercase tracking-tight" size="h2">
                  Next <span className="text-teal-500">Up.</span>
                </Title>
              </Group>

              <Paper radius="48px" withBorder className="flex-1 bg-white border-slate-100 shadow-xl overflow-hidden flex flex-col">
                <Box p={20} className="bg-slate-50 border-b border-slate-100">
                   <Text c="slate.4" fw={900} tt="uppercase" lts="0.3em" size="xs">Preparing for Service</Text>
                </Box>
                
                <ScrollArea className="flex-1">
                  <Stack gap={0}>
                    {nextInLine.map((item, i) => (
                      <Box 
                        key={i} 
                        className={`px-8 py-5 border-b border-slate-50 flex items-center justify-between transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}
                      >
                        <Stack gap={2}>
                          <Text c="blue.6" fw={900} fs="italic" size="32px" className="tracking-tighter leading-none">{item.id}</Text>
                          <Text c="#1E293B" fw={700} tt="uppercase" lts="0.05em" size="xs">{item.unit}</Text>
                        </Stack>
                        <Center className="bg-teal-50 px-4 py-2 rounded-xl border border-teal-100">
                           <Timer size={14} className="text-teal-600 mr-2" />
                           <Text c="teal.9" fw={900} size="18px" className="tabular-nums">{item.wait}</Text>
                        </Center>
                      </Box>
                    ))}
                  </Stack>
                </ScrollArea>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </main>
    </Box>
  );
}