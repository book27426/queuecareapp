"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Box, Text, Stack, Group, Title, Paper, Grid, ThemeIcon, ScrollArea, LoadingOverlay, SimpleGrid 
} from '@mantine/core';
import { Clock, Zap, MonitorPlay } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FullScreenSignageDashboard() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : "";
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCalls, setActiveCalls] = useState([]);
  const [nextInLine, setNextInLine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const fetchQueueData = async () => {
    if (!id) return;
    try {
     const response = await fetch(`https://queuecaredev.vercel.app/api/v1/queue?id=${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success && result.data) {
        setActiveCalls(Array.isArray(result.data.currently_serving) ? result.data.currently_serving : []);
        setNextInLine(Array.isArray(result.data.recent_logs) ? result.data.recent_logs : []);
        setName(result.data.section_name || "");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const poll = setInterval(fetchQueueData, 10000);
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [id]);

  return (
    // Main container locked to viewport height to prevent scrolling
    <Box className="h-screen w-screen overflow-hidden bg-[#F8FAFC] p-8 flex flex-col antialiased">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

      {/* HEADER SECTION */}
      <Group justify="space-between" mb="xl" className="shrink-0">
        <Group gap="sm" align="center">
          <Text fw={900} size="h" tt="uppercase" lts="0.1em">
            Queue System : 
          </Text>
          
          <Title order={1} className="uppercase italic" size="h2" c="blue.7" >
            {name}
          </Title>
        </Group>
        
        <Paper px={32} py={12} radius="xl" withBorder className="shadow-lg bg-white">
          <Group gap="md">
            <Clock size={32} className="text-blue-600" />
            <Text fw={900} size="48px" className="tabular-nums" style={{ lineHeight: 1 }}>
              {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Group>
        </Paper>
      </Group>

      {/* BODY SECTION: flex-1 min-h-0 ensures it fits the screen exactly */}
      <Grid gutter={32} className="flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT: NOW CALLING */}
        <Grid.Col span={9} className="h-full">
          <Group gap="sm" mb="md" className="shrink-0">
            <ThemeIcon size={54} radius="xl" color="blue" variant="filled">
              <Zap size={28} fill="white" />
            </ThemeIcon>
            <Title order={1} c="#1E293B" className="uppercase italic tracking-tighter" size="42px">
              Now <span className="text-blue-600">Calling.</span>
            </Title>
          </Group>

          <Paper 
            p={40} 
            radius="56px" 
            withBorder 
            className="flex-1 bg-white shadow-2xl border-slate-100 overflow-hidden"
          >
            <Grid gutter={24}>
              <AnimatePresence mode="popLayout">
                {activeCalls.map((call) => (
                  <Grid.Col span={4} key={call.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Paper
                        radius="40px"
                        p={30}
                        withBorder
                        className="flex flex-col items-center justify-center border-2 bg-slate-50 border-slate-200"
                      >
                        <div className="flex flex-col items-center w-fit mx-auto">
                          <Text 
                            fw={900} 
                            size="90px" 
                            className="leading-none italic tracking-tighter"
                            c="blue.9"
                            align="center"
                          >
                            {String(call.number)}
                          </Text>

                          <Box className="mt-2 mb-2 h-1.5 w-full rounded-full bg-slate-200" />
                        </div>
                        <Stack gap={0} align="center">
                          <Text c="dimmed" fw={800} size="sm" tt="uppercase" lts="0.1em">Counter</Text>
                          <Text size="52px" fw={900} c="#1E293B" className="leading-none">
                            {String(call.counter_name || '-')}
                          </Text>
                        </Stack>
                      </Paper>
                    </motion.div>
                  </Grid.Col>
                ))}
              </AnimatePresence>
            </Grid>
          </Paper>
        </Grid.Col>

        {/* RIGHT: HISTORY */}
        <Grid.Col span={3} className="h-full flex flex-col">
          <Group gap="sm" mb="md" className="shrink-0">
            <ThemeIcon size={48} radius="xl" color="teal" variant="light"><MonitorPlay size={24} /></ThemeIcon>
            <Title order={1} c="#1E293B" className="uppercase italic tracking-tighter" size="36px">
              Has <span className="text-blue-600">Called.</span>
            </Title>
          </Group>

          <Paper radius="56px" withBorder className="flex-1 overflow-hidden flex flex-col shadow-xl bg-white">
            <SimpleGrid cols={2} spacing={0}>
              {nextInLine.map((item, i) => (
                <Box 
                  key={item.id} 
                  className={`p-8 border-b border-r flex justify-center items-center ${
                    (Math.floor(i / 2) + i) % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <Text c="blue.7" fw={900} size="40px" className="italic tabular-nums">
                    {String(item.number)}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}