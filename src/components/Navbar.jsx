"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Group, Stack, Text, Box, Modal, TextInput, Button, Title, 
  PinInput, ActionIcon, Flex, Alert, Loader, Divider, UnstyledButton, Avatar,
  Tooltip, Center, Badge
} from '@mantine/core';
import { 
  Phone, X, ShieldCheck, AlertCircle, LogOut, Activity, 
  Ticket, LayoutDashboard, User as UserIcon, PlusCircle, Save, Check, Camera 
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase
import { auth, googleProvider, signInWithPopup, signOut } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { updateProfile } from "firebase/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef(null); 
  const [loginOpened, { open: openLogin, close: closeLogin }] = useDisclosure(false);
  const [profileOpened, { open: openProfile, close: closeProfile }] = useDisclosure(false);
  
  // --- 🔒 States ระบบ Login ---
  const [loginStep, setLoginStep] = useState('phone'); 
  const [phone, setPhone] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [cooldown, setCooldown] = useState(0); 
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [otpFromDb, setOtpFromDb] = useState(null); 

  const [isLoading, setIsLoading] = useState(false); // 👈 ตัวนี้ต้องมี
  const [isVerifying, setIsVerifying] = useState(false); 
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); 

  // --- 📝 Profile Edit States (Staff) ---
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  // ✅ 1. ยามเฝ้าประตู: แยก Role Staff/User
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setCurrentUser({
          image: fbUser.photoURL,
          name: fbUser.displayName, // 👈 Firebase จะส่งชื่อที่อัปเดตแล้วมาให้ตรงนี้
          email: fbUser.email,
          role: 'staff'
        });
      } else {
        const savedPhone = localStorage.getItem('user_phone');
        if (savedPhone) {
          setCurrentUser({ name: savedPhone, image: null, role: 'user' });
        } else {
          setCurrentUser(null);
        }
      }
    });
    return () => unsubscribe();
  }, [pathname]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ✅ 2. ฟังก์ชันแก้ไขโปรไฟล์ Staff
  const handleImageClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
      setIsUpdating(true);
      setShowSuccess(false);
      try {
        // 1. อัปเดตที่ Database หลังบ้าน (ตามเดิม)
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_STAFF_PROFILE_API}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ name: editName, phone_num: editPhone, image: previewImage })
        });

        if (res.ok) {
          // 2. 🎯 [จุดสำคัญ] สั่งให้ Firebase อัปเดตชื่อในโปรไฟล์ที่ถืออยู่ด้วย
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
              displayName: editName,
              photoURL: previewImage // ถ้าพี่จะอัปเดตรูปด้วย
            });
          }

          // 3. อัปเดต State ในเครื่อง
          setCurrentUser(prev => ({ ...prev, name: editName, image: previewImage }));
          
          setShowSuccess(true);
          setTimeout(() => { setShowSuccess(false); closeProfile(); }, 1500);
        }
      } catch (err) { 
        console.error("Update Error:", err);
        setError("ไม่สามารถอัปเดตข้อมูลได้"); 
      } finally { 
        setIsUpdating(false); 
      }
    };
  // ✅ 3. ฟังก์ชัน Login ฝั่ง User (กู้คืน handleRequestOTP)
  const handleRequestOTP = async () => {
    if (phone.length !== 10 || (cooldown > 0 && loginStep === 'phone')) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_USER_API_OTP, {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_num: phone })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setOtpFromDb(result.message);
        setLoginStep('otp');
        setCooldown(60); 
      } else {
        setError(result.message || "ไม่สามารถขอรหัสได้");
      }
    } catch (err) { setError("การเชื่อมต่อล้มเหลว"); } 
    finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (otpValue.length !== 6 || isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_STAFF_API_GOOGLE_LOGIN, {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_num: phone, otp: otpValue })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        localStorage.setItem('user_phone', phone);
        handleCloseModal();
        router.push('/myqueue');
      } else { setError("รหัส OTP ไม่ถูกต้อง"); }
    } catch (err) { setError("Verify Error"); } 
    finally { setIsVerifying(false); }
  };

  // ✅ 4. ฟังก์ชัน Login ฝั่ง Staff
  const handleStaffLogin = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      localStorage.setItem('access_token', token);
      const res = await fetch(`${process.env.NEXT_PUBLIC_STAFF_PROFILE_API}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      handleCloseModal();
      if (res.status === 404) router.push('/setup-profile');
      else router.push('/facilities');
    } catch (err) { setError("Staff Login Failed"); }
  };

  // ✅ 5. Logout & กลับหน้าแรก
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    setCurrentUser(null);
    window.location.href = '/'; // 🏠 ดีดกลับหน้าแรกและโหลดใหม่ชัวร์ที่สุด
  };

  const handleCloseModal = () => {
    closeLogin();
    setTimeout(() => { setLoginStep('phone'); setPhone(''); setError(null); setOtpFromDb(null); }, 300);
  };

  return (
    <>
      <nav className="h-16 md:h-20 px-4 md:px-20 flex items-center justify-between bg-white/90 backdrop-blur-md border-b sticky top-0 z-50">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Group gap="xs">
            <Box style={{ width: 38, height: 38, backgroundColor: '#2563EB', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} color="white" strokeWidth={3} />
            </Box>
            <Text span fw={900} fz={22} c="#1E293B">QUEUECARE</Text>
          </Group>
        </Link>

        {currentUser ? (
          <Group gap="sm">
            {currentUser.role === 'staff' ? (
              <Button onClick={() => router.push('/facilities')} radius="xl" color="orange" variant="light" fw={700} leftSection={<LayoutDashboard size={16} />}>จัดการหน่วยงาน</Button>
            ) : (
              <>
                {pathname.includes('/myqueue') ? (
                  <Button onClick={() => router.push('/join')} radius="xl" color="blue" fw={700} leftSection={<PlusCircle size={16} />}>จองคิวเพิ่ม</Button>
                ) : (pathname.includes('/join') || pathname.includes('/search')) ? (
                  <Button onClick={() => router.push('/myqueue')} radius="xl" color="blue" variant="light" fw={700} leftSection={<Ticket size={16} />}>คิวของฉัน</Button>
                ) : null}
              </>
            )}
            <Avatar src={currentUser.image} radius="xl" className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all" onClick={currentUser.role === 'staff' ? openProfile : undefined} />
            <ActionIcon variant="light" color="red" radius="xl" size="lg" onClick={handleLogout}><LogOut size={18} /></ActionIcon>
          </Group>
        ) : (
          <Button onClick={openLogin} radius="xl" color="blue" fw={700}>Login</Button>
        )}
      </nav>

      {/* 📝 Modal แก้ไขโปรไฟล์ Staff */}
      <Modal opened={profileOpened} onClose={closeProfile} centered radius="32px" padding="xl" withCloseButton={false}>
        <Stack gap="xl">
          <Group justify="space-between">
            <Title order={3} fw={900}>Staff Profile</Title>
            <ActionIcon variant="subtle" color="gray" onClick={closeProfile}><X size={20} /></ActionIcon>
          </Group>
          <Center>
            <Box style={{ position: 'relative' }}>
              <Avatar src={previewImage} size={100} radius="100%" className="border-4 border-slate-100" />
              <ActionIcon variant="filled" color="blue" radius="xl" style={{ position: 'absolute', bottom: 0, right: 0, border: '3px solid white' }} onClick={handleImageClick}><Camera size={16} /></ActionIcon>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
            </Box>
          </Center>
          <Stack gap="md">
            <TextInput label="ชื่อ-นามสกุล" value={editName} onChange={(e) => setEditName(e.target.value)} radius="md" size="md" />
            <TextInput label="เบอร์โทรศัพท์" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} radius="md" size="md" maxLength={10} />
          </Stack>
          <Button fullWidth size="lg" radius="xl" color={showSuccess ? "green" : "blue"} onClick={handleUpdateProfile} loading={isUpdating} leftSection={showSuccess ? <Check size={18} /> : <Save size={18} />}>
            {showSuccess ? "บันทึกสำเร็จ!" : "บันทึกข้อมูล"}
          </Button>
        </Stack>
      </Modal>

      {/* 🚀 Modal: Login Form */}
      <Modal opened={loginOpened} onClose={handleCloseModal} centered radius="32px" withCloseButton={false} padding={0} size="420px">
        <Box className="p-10 bg-white relative">
          <ActionIcon variant="light" color="gray" radius="xl" onClick={handleCloseModal} style={{ position: 'absolute', top: 20, right: 20 }}><X size={20} /></ActionIcon>
          <AnimatePresence mode="wait">
            {loginStep === 'phone' ? (
              <motion.div key="phone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Stack gap="xl">
                  <Stack gap={4}><Title order={2} fw={900}>เข้าสู่ระบบ</Title><Text size="xs" c="dimmed">กรุณากรอกเบอร์โทรศัพท์เพื่อจัดการคิว</Text></Stack>
                  <TextInput label="PHONE NUMBER" placeholder="08XXXXXXXX" size="lg" radius="md" maxLength={10} leftSection={<Phone size={18} color="#3B82F6" />} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
                  {error && <Alert color="red" variant="light" py="xs" icon={<AlertCircle size={16}/>}><Text size="xs">{error}</Text></Alert>}
                  <Button fullWidth size="xl" radius="xl" color="blue" h={60} onClick={handleRequestOTP} loading={isLoading} disabled={phone.length !== 10}>รับรหัส OTP</Button>
                  <Divider label="สำหรับเจ้าหน้าที่" labelPosition="center" />
                  <UnstyledButton onClick={handleStaffLogin}><Flex justify="center" align="center" gap={10} className="py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"><ShieldCheck size={16} color="#3B82F6" /><Text size="xs" fw={700}>SIGN IN WITH GOOGLE STAFF</Text></Flex></UnstyledButton>
                </Stack>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Stack gap="xl" align="center">
                  <Stack gap={4} align="center"><Title order={2} fw={900}>ยืนยันรหัส OTP</Title><Text size="xs" c="dimmed">ส่งรหัสไปที่ {phone}</Text></Stack>
                  <PinInput length={6} size="lg" radius="md" value={otpValue} onChange={setOtpValue} autoFocus />
                  {otpFromDb && (
                    <Box px={12} py={6} bg="blue.0" style={{ borderRadius: '8px', border: '1px dashed #3B82F6' }}>
                      <Text size="xs" fw={800} c="blue.7">DEBUG OTP: {otpFromDb}</Text>
                    </Box>
                  )}
                  {error && <Alert color="red" variant="light" w="100%" py="xs"><Text size="xs" ta="center">{error}</Text></Alert>}
                  <Stack gap="sm" w="100%">
                    <Button fullWidth size="xl" radius="xl" color="blue" h={60} onClick={handleVerifyOTP} loading={isVerifying} disabled={otpValue.length !== 6}>ยืนยันรหัส</Button>
                    <Button variant="subtle" color="gray" size="sm" onClick={handleRequestOTP} disabled={cooldown > 0}>{cooldown > 0 ? `ขอรหัสใหม่ใน (${cooldown}s)` : "ส่งรหัสใหม่อีกครั้ง"}</Button>
                  </Stack>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Modal>
    </>
  );
}