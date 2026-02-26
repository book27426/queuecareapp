"use client";

import React, { useState, useEffect } from "react";
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
  
  // ✅ เก็บ ID ของพนักงานที่ได้จาก API ตอนโหลดหน้า
  const [staffId, setStaffId] = useState(null);

  // Profile States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(""); // UI มี แต่ใน API Doc หลักไม่มี (ใส่เผื่อไว้)
  const [imagePreview, setImagePreview] = useState(null);

  // ✅ ใช้ v1 ตามเอกสาร
  const API_URL = "https://queuecaredev.vercel.app/api/v1";

  // 1. ตรวจสอบสถานะและดึง Staff ID
  useEffect(() => {
    const checkProfile = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.warn("No token found, redirecting...");
        return router.push("/");
      }

      try {
        // ✅ ใช้ POST /staff ตาม Doc เพื่อตรวจสอบหรือสร้าง Staff entry
        const response = await fetch(`${API_URL}/staff`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setStaffId(result.data.id);
          
          // ถ้าตั้งค่าชื่อเรียบร้อยแล้ว ให้วาร์ปไปหน้า facilities เลย (ไม่ต้องตั้งซ้ำ)
          if (result.data?.first_name && result.data?.last_name) {
            return router.push("/facilities");
          }
        } else {
          setErrorMsg(result.message || "ไม่สามารถดึงข้อมูลพนักงานได้");
        }
      } catch (err) {
        console.error("Fetch profile failed:", err);
        setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ (CORS/Network)");
      } finally {
        setLoading(false); 
      }
    };

    checkProfile();
  }, [router]);

  const handleImageChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 2. บันทึกข้อมูลจริง (ไม่มี Bypass)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!staffId) return setErrorMsg("ไม่พบรหัสพนักงาน กรุณารีเฟรชหน้าจอ");

    setSubmitting(true);
    setErrorMsg(null);
    
    const token = localStorage.getItem("access_token");

    try {
      // ✅ ใช้ PUT /staff?id={id} ตาม Doc
      const response = await fetch(`${API_URL}/staff?id=${staffId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // ใส่เผื่อไว้ถ้า API ต้องการทั้ง Token และ Cookie
        },
        credentials: 'include', // 🍪 ส่ง session Cookie ตามที่ Doc ระบุ
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName,
          role: "staff",   // ค่า Default ตาม Spec
          section_id: 1,   // หรือค่าที่คุณต้องการ
          email: ""        // ใส่เป็นค่าว่างหรือดึงจากสถานะ Login
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // ✅ สำเร็จจริงเท่านั้นถึงจะไปต่อ
        router.push("/facilities");
      } else {
        setErrorMsg(result.message || "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setErrorMsg("ไม่สามารถส่งข้อมูลได้ (CORS Error) กรุณาตรวจสอบการตั้งค่าหลังบ้าน");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Center h="100vh" bg="#F8FAFC">
        <Stack align="center" gap="xs">
          <Loader size="xl" variant="dots" color="blue" />
          <Text fw={700} c="dimmed">กำลังเตรียมข้อมูลโปรไฟล์...</Text>
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
              <Text c="dimmed" size="sm">ข้อมูลนี้จะถูกใช้ในการระบุตัวตนในระบบคิว</Text>
            </Stack>

            {errorMsg && (
              <Alert variant="light" color="red" icon={<AlertCircle size={18} />}>
                {errorMsg}
              </Alert>
            )}

            <Center>
              <Box pos="relative">
                <Avatar src={imagePreview} size={140} radius="140px">
                  {!imagePreview && <User size={60} color="#CBD5E1" />}
                </Avatar>
                <FileButton onChange={handleImageChange} accept="image/png,image/jpeg">
                  {(props) => (
                    <ActionIcon {...props} variant="filled" color="blue" size={45} radius="xl" pos="absolute" bottom={5} right={5}>
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
                      placeholder="Last Name"
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
                >
                  บันทึกข้อมูลและเริ่มต้นใช้งาน
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}