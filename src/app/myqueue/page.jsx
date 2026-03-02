"use client";

import React, { useState, useEffect } from 'react';
import { Container, Stack, Title, Text, Paper, Badge, Group, Button, Loader, Center, Tabs } from '@mantine/core';
import { Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle } from 'lucide-react';
import Navbar from "@/components/Navbar";

export default function MyQueuePage() {
  const [activeQueues, setActiveQueues] = useState([]);
  const [historyQueues, setHistoryQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📡 1. ดึงข้อมูลคิว (GET /api/v1/queue)
  const fetchMyQueues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/queue', { credentials: 'include' });
      const result = await res.json();
      if (result.success && result.role === 'user') {
        setActiveQueues(result.data.active || []);
        setHistoryQueues(result.data.inactive || []);
      }
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyQueues(); }, []);

  // ❌ 2. ยกเลิกคิว (PUT /api/v1/queue?id=...)
  const handleCancelQueue = async (id) => {
    if (!confirm("ยืนยันการยกเลิกคิวนี้?")) return;
    try {
      const res = await fetch(`/api/v1/queue?id=${id}`, {
        method: 'PUT',
        credentials: 'include'
      });
      const result = await res.json();
      if (result.success) {
        fetchMyQueues(); // โหลดข้อมูลใหม่หลังจากยกเลิก
      }
    } catch (err) {
      alert("ยกเลิกคิวล้มเหลว");
    }
  };

  return (
    <Box className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <Container size="md" py={40}>
        <Stack gap="xl">
          <Title order={2} fw={900}>คิวของฉัน</Title>

          <Tabs defaultValue="active" variant="pills" radius="xl">
            <Tabs.List grow mb="xl">
              <Tabs.Tab value="active" leftSection={<Clock size={16}/>}>กำลังรอรับบริการ ({activeQueues.length})</Tabs.Tab>
              <Tabs.Tab value="history" leftSection={<CheckCircle2 size={16}/>}>ประวัติคิว</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="active">
              {loading ? <Center py={50}><Loader /></Center> : (
                <Stack gap="md">
                  {activeQueues.length > 0 ? activeQueues.map(q => (
                    <QueueCard key={q.id} data={q} onCancel={() => handleCancelQueue(q.id)} isActive />
                  )) : <EmptyState message="ไม่มีคิวที่กำลังรออยู่" />}
                </Stack>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="history">
              <Stack gap="md">
                {historyQueues.map(q => <QueueCard key={q.id} data={q} />)}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </Box>
  );
}

function QueueCard({ data, onCancel, isActive }) {
  const statusColors = { waiting: 'blue', complete: 'green', cancel: 'red' };

  return (
    <Paper p="xl" radius="24px" withBorder className="hover:shadow-md transition-all">
      <Group justify="space-between">
        <Stack gap={4}>
          <Text size="xs" fw={800} c="dimmed">คิวหมายเลข</Text>
          <Title order={1} c="blue" fw={900}>{data.number}</Title>
        </Stack>
        <Badge size="lg" radius="md" color={statusColors[data.status] || 'gray'}>
          {data.status?.toUpperCase()}
        </Badge>
      </Group>

      <Group mt="xl" justify="space-between">
        <Stack gap={2}>
          <Text size="sm" fw={700}>{data.name}</Text>
          <Text size="xs" c="dimmed">{data.phone_num}</Text>
        </Stack>
        {isActive && (
          <Button variant="light" color="red" radius="xl" size="xs" onClick={onCancel}>
            ยกเลิกคิว
          </Button>
        )}
      </Group>
    </Paper>
  );
}

function EmptyState({ message }) {
  return (
    <Paper p={50} radius="24px" withBorder className="bg-slate-50 border-dashed">
      <Center><Stack align="center" gap="xs"><AlertCircle size={32} color="#CBD5E1"/><Text c="dimmed" fw={700}>{message}</Text></Stack></Center>
    </Paper>
  );
}