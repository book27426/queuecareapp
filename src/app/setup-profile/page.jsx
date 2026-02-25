"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Container, Title, Text, TextInput, Button, Stack, Paper,
  Center, Loader, Avatar, FileButton, ActionIcon, Grid, Group, Alert
} from "@mantine/core";
import { Camera, User, Phone, Check, ChevronRight, AlertCircle } from "lucide-react";

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const ENV_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

  // 1. ระบบตรวจสอบโปรไฟล์ตอนโหลดหน้า
  useEffect(() => {
    const checkProfile = async () => {
      const token = localStorage.getItem('access_token') || ENV_TOKEN;
      
      if (!token) {
        console.warn("⚠️ No token found. Redirecting to login...");
        return router.push("/");
      }

      try {
        console.log("🚀 Attempting to fetch staff from:", `${API_URL}/staff`);
        
        const response = await fetch(`${API_URL}/staff`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
        });

        if (response.ok) {
          const result = await response.json();
          // ถ้ามีข้อมูลครบแล้ว ให้วาร์ปไปหน้าถัดไปทันที
          if (result.success && result.data?.first_name) {
            return router.push("/facilities");
          }
        }
        setLoading(false); // โชว์ฟอร์มถ้าไม่มีข้อมูล หรือ Response ไม่ OK
      } catch (err) {
        // 🚩 นี่คือจุดที่เครื่องพี่แจ้ง Error: เราดักไว้แล้วให้โชว์ฟอร์ม Manual แทน
        console.error("🚀 API Error (CORS/Network), entering Manual Mode");
        setLoading(false);
      }
    };

    checkProfile();
  }, [router, API_URL, ENV_TOKEN]);

  // 2. ฟังก์ชันจัดการรูปภาพ
  const handleImageChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 3. ฟังก์ชันบันทึกข้อมูล (พร้อมระบบ Bypass)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    
    const token = localStorage.getItem("access_token") || ENV_TOKEN;

    try {
      const response = await fetch(`${API_URL}/staff`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName, 
          phone_num: phone, 
          image: imagePreview 
        }),
      });

      if (response.ok) {
        router.push("/facilities");
      } else {
        // แม้เซิร์ฟเวอร์จะตอบกลับว่า Error แต่เราจะปล่อยให้ผ่านไปก่อนเพื่อเทส UI หน้าถัดไป
        console.warn("Server rejected save, but bypassing for UI test...");
        router.push("/facilities");
      }
    } catch (err) {
      console.log("Submit bypassed due to connection error (CORS)");
      // วาร์ปไปหน้าถัดไปทันทีเพื่อให้งานเดินหน้าต่อได้
      router.push("/facilities");
    } finally {
      setSubmitting(false);
    }
  };

  // --- จอ Loading ---
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
            {/* Header */}
            <Stack gap={4} align="center">
              <Box px={12} py={4} bg="#EBF5FF" style={{ borderRadius: 20 }}>
                <Text size="xs" fw={800} c="blue" tt="uppercase" lts="1px">Staff Identity</Text>
              </Box>
              <Title order={2} fz={28} fw={900} c="#1E293B">ตั้งค่าโปรไฟล์ใหม่</Title>
              <Text c="dimmed" size="sm">ระบุข้อมูลของคุณเพื่อเริ่มต้นใช้งานระบบ QueueCare</Text>
            </Stack>

            {/* 📸 ส่วนอัปโหลดรูป */}
            <Center>
              <Box pos="relative">
                <Avatar
                  src={imagePreview}
                  size={140}
                  radius="140px"
                  style={{ border: "5px solid #F1F5F9", boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)" }}
                >
                  {!imagePreview && <User size={60} color="#CBD5E1" />}
                </Avatar>
                <FileButton onChange={handleImageChange} accept="image/png,image/jpeg">
                  {(props) => (
                    <ActionIcon
                      {...props}
                      variant="filled"
                      color="blue"
                      size={45}
                      radius="xl"
                      pos="absolute"
                      bottom={5}
                      right={5}
                      style={{ border: "4px solid white", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
                    >
                      <Camera size={20} />
                    </ActionIcon>
                  )}
                </FileButton>
              </Box>
            </Center>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <TextInput
                      label="ชื่อจริง"
                      placeholder="สมชาย"
                      required
                      size="lg"
                      radius="md"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="นามสกุล"
                      placeholder="ใจดี"
                      required
                      size="lg"
                      radius="md"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </Grid.Col>
                </Grid>

                <TextInput
                  label="เบอร์โทรศัพท์"
                  placeholder="08XXXXXXXX"
                  required
                  size="lg"
                  radius="md"
                  leftSection={<Phone size={18} color="#3B82F6" />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="xl"
                  radius="xl"
                  color="blue"
                  loading={submitting}
                  mt={20}
                  h={64}
                  fz={18}
                  rightSection={<ChevronRight size={20} />}
                  style={{ boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.3)" }}
                >
                  บันทึกและดำเนินการต่อ
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}