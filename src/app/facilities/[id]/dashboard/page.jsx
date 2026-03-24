"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Box, Text, Stack, Group, Title, Paper, Badge, Grid, ThemeIcon, ScrollArea, Center, Loader, LoadingOverlay 
} from '@mantine/core';
import { Clock, Zap, Timer, MonitorPlay } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FullScreenSignageDashboard() {
  const params = useParams();
  // Ensure ID is a string; fallback to empty string if undefined
  const id = typeof params?.id === 'string' ? params.id : "";
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCalls, setActiveCalls] = useState([]);
  const [nextInLine, setNextInLine] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueueData = async () => {
    if (!id) return;
    try {
      const response = await fetch(`https://queuecaredev.vercel.app/api/v1/queue?id=${id}`);
      const result = await response.json();

      if (result.success && result.data) {
        // Defensive mapping: ensure we always have an array
        setActiveCalls(Array.isArray(result.data.serving) ? result.data.serving : []);
        setNextInLine(Array.isArray(result.data.waiting) ? result.data.waiting : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const poll = setInterval(fetchQueueData, 5000);
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [id]);

  return (
    <Box className="relative h-screen bg-[#F8FAFC] p-6 antialiased">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

      <Group justify="space-between" mb="md" className="h-[10vh]">
        <Stack gap={0}>
          <Text c="blue.7" fw={900} size="xs" tt="uppercase" lts="0.4em">Queue System</Text>
          <Title order={1} className="uppercase italic">{id.replace(/-/g, ' ')}</Title>
        </Stack>
        
        <Paper px={28} py={14} radius="xl" withBorder className="shadow-lg bg-white">
          <Group gap="md">
            <Clock size={28} className="text-blue-600" />
            <Text fw={900} size="40px" className="tabular-nums" style={{ lineHeight: 1 }}>
              {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Group>
        </Paper>
      </Group>

      <Grid gutter={24} className="flex-1 min-h-0">
        {/* --- NOW CALLING SECTION --- */}
        <Grid.Col span={9} className="flex flex-col">
            {/* Section Header */}
            <Group gap="sm" mb="sm">
              <ThemeIcon size={54} radius="xl" color="blue" variant="filled">
                <Zap size={28} fill="white" />
              </ThemeIcon>
              <Title order={1} c="#1E293B" className="uppercase italic tracking-tighter" size="38px">
                Now <span className="text-blue-600">Calling.</span>
              </Title>
            </Group>

            {/* THE MAIN FRAME */}
            <Paper 
              p={30} 
              radius="48px" 
              withBorder 
              className="flex-1 bg-white shadow-2xl border-slate-100 flex flex-col justify-start"
              style={{ minHeight: '70vh' }} // Ensures the frame stays large even if calls are few
            >
              <Grid gutter={20} className="h-full">
                <AnimatePresence mode="popLayout">
                  {
                    activeCalls.map((call, i) => (
                      <Grid.Col span={4} key={call.id || i}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <Paper
                            radius="32px"
                            p={25}
                            withBorder
                            className={`flex flex-col items-center transition-all ${
                              i === 0 
                              ? 'bg-blue-600 border-blue-700 shadow-blue-200' 
                              : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            {/* Unit Label */}
                            <Badge 
                              variant="white" 
                              color={i === 0 ? "blue" : "gray"} 
                              size="lg" 
                              fullWidth 
                              mb={15}
                            >
                              {String(call.unit || 'General')}
                            </Badge>

                            {/* Queue Number */}
                            <Text 
                              fw={900} 
                              size="100px" 
                              className="leading-none italic tracking-tighter"
                              c={i === 0 ? "white" : "#1E293B"}
                            >
                              {String(call.id)}
                            </Text>

                            <Box className={`my-4 h-1 w-12 rounded-full ${i === 0 ? 'bg-blue-400' : 'bg-slate-200'}`} />

                            {/* Counter Info */}
                            <Stack gap={0} align="center">
                              <Text 
                                c={i === 0 ? "blue.1" : "dimmed"} 
                                fw={800} 
                                size="xs" 
                                tt="uppercase" 
                                lts="0.2em"
                              >
                                Counter
                              </Text>
                              <Text 
                                fw={900} 
                                size="60px" 
                                className="leading-none"
                                c={i === 0 ? "white" : "#1E293B"}
                              >
                                {String(call.counter || '-')}
                              </Text>
                            </Stack>
                          </Paper>
                        </motion.div>
                      </Grid.Col>
                    ))
                  }
                </AnimatePresence>
              </Grid>
            </Paper>
        </Grid.Col>

        {/* RIGHT SIDE: NEXT UP */}
        <Grid.Col span={3}>
          <Group gap="sm" mb={20}>
            <ThemeIcon size={48} radius="xl" color="teal" variant="light"><MonitorPlay size={24} /></ThemeIcon>
            <Title order={2} className="italic uppercase">Next <span className="text-teal-500">Up.</span></Title>
          </Group>

          <Paper radius="48px" withBorder className="h-[calc(100vh-200px)] overflow-hidden flex flex-col shadow-xl">
            <ScrollArea className="flex-1">
              <Stack gap={0}>
                {nextInLine.map((item, i) => (
                  <Box key={item.id} className={`p-6 border-b flex justify-between items-center ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <Stack gap={0}>
                      <Text c="blue.6" fw={900} size="32px" className="italic leading-none">{String(item.id)}</Text>
                      <Text size="xs" fw={700} tt="uppercase">{String(item.unit || 'General')}</Text>
                    </Stack>
                    <Center className="bg-teal-50 px-3 py-1 rounded-lg">
                      <Timer size={14} className="text-teal-600 mr-2" />
                      <Text c="teal.9" fw={900}>{String(item.wait || '0m')}</Text>
                    </Center>
                  </Box>
                ))}
              </Stack>
            </ScrollArea>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}