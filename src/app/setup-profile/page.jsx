"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Container, Title, Text, TextInput, Button, Stack, Paper,
  Center, Loader, Avatar, FileButton, ActionIcon, Grid, Alert
} from "@mantine/core";
import { Camera, User, Phone, ChevronRight, AlertCircle } from "lucide-react";

export default function SetupProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Profile States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const hasChecked = useRef(false);

  // --- 🌐 1. จังหวะด่านตรวจ (Check & Redirect) ---
  useEffect(() => {
    if (hasChecked.current) return;

    const checkUserStatus = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/");

      try {
        hasChecked.current = true;
        
        // ✅ ใช้ตัวแปรจาก .env และวิ่งผ่าน Proxy
        const staffEndpoint = process.env.NEXT_PUBLIC_STAFF_PROFILE_API;

        const response = await fetch(staffEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // ✅ ถ้ามีชื่อ-นามสกุลแล้ว -> วาร์ปไปหน้า facilities ทันที
          if (result.data?.first_name && result.data?.last_name) {
            return router.push("/facilities");
          }
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Check status failed:", err);
        setLoading(false); 
      }
    };

    checkUserStatus();
  }, [router]);

  // --- 🚀 2. จังหวะเพิ่มข้อมูล (POST New Staff) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // ตรวจสอบเบอร์โทร 10 หลักเบื้องต้น
    if (phone.length !== 10) {
      setErrorMsg("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    
    const token = localStorage.getItem("access_token");

    try {
      const staffEndpoint = process.env.NEXT_PUBLIC_STAFF_PROFILE_API;

      const response = await fetch(staffEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName,
          phone_num: phone,
          role: "staff"
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push("/facilities");
      } else {
        setErrorMsg(result.message || "ไม่สามารถสร้างโปรไฟล์ได้");
      }
    } catch (err) {
      setErrorMsg("Connection Error: โปรดตรวจสอบระบบ Proxy หรือ Backend");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <Center h="100vh" bg="#F8FAFC">
        <Stack align="center" gap="xs">
          <Loader size="xl" variant="dots" color="blue" />
          <Text fw={700} c="dimmed">กำลังตรวจสอบสถานะเจ้าหน้าที่...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box py={80} bg="#F8FAFC" mih="100vh">
      <Container size="xs">
        <Paper p={{ base: 30, sm: 40 }} radius="32px" withBorder shadow="xl" bg="white">
          <Stack gap="xl">
            <Stack gap={4} align="center">
              <Box px={12} py={4} bg="#EBF5FF" style={{ borderRadius: 20 }}>
                <Text size="xs" fw={800} c="blue" tt="uppercase" lts="1px">Identity Setup</Text>
              </Box>
              <Title order={2} fz={28} fw={900} c="#1E293B">ตั้งค่าโปรไฟล์เจ้าหน้าที่</Title>
              <Text c="dimmed" size="sm" ta="center">กรุณากรอกข้อมูลเพื่อเริ่มต้นใช้งานระบบ QueueCare</Text>
            </Stack>

            {errorMsg && <Alert variant="light" color="red" icon={<AlertCircle size={18} />}>{errorMsg}</Alert>}

            <Center>
              <Box pos="relative">
                <Avatar src={imagePreview} size={140} radius="140px" style={{ border: "5px solid #F1F5F9" }}>
                  {!imagePreview && <User size={60} color="#CBD5E1" />}
                </Avatar>
                <FileButton onChange={handleImageChange} accept="image/png,image/jpeg">
                  {(props) => (
                    <ActionIcon {...props} variant="filled" color="blue" size={45} radius="xl" pos="absolute" bottom={5} right={5} style={{ border: "4px solid white" }}>
                      <Camera size={20} />
                    </ActionIcon>
                  )}
                </FileButton>
              </Box>
            </Center>

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <TextInput 
                      label="ชื่อจริง" 
                      placeholder="First Name" 
                      required size="lg" radius="md" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput 
                      label="นามสกุล" 
                      placeholder="Last Name" 
                      required size="lg" radius="md" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                    />
                  </Grid.Col>
                </Grid>
                <TextInput 
                  label="เบอร์โทรศัพท์" 
                  placeholder="08XXXXXXXX" 
                  required size="lg" radius="md" 
                  maxLength={10}
                  leftSection={<Phone size={18} color="#3B82F6" />} 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                />
                <Button 
                  type="submit" fullWidth size="xl" radius="xl" color="blue" 
                  loading={submitting} mt={20} h={64} 
                  rightSection={<ChevronRight size={20} />}
                >
                  ยืนยันและดำเนินการต่อ
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}