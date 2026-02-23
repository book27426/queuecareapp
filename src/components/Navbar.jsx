// src/components/Navbar.jsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { 
  Activity, Ticket, Phone, ArrowRight, RotateCw, UserCircle2, 
  LogOut, ShieldCheck, X, Camera, User, Check, Upload 
} from 'lucide-react'; 
import { 
  Group, Stack, Text, Box, Modal, TextInput, Button, Title, 
  PinInput, ActionIcon, Flex, Badge, Avatar, UnstyledButton, FileButton, Center
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks'; 
import { motion, AnimatePresence } from 'framer-motion';

// โลโก้มาตรฐาน QueueCare
export const QueueCareLogo = () => (
  <Group gap="xs" wrap="nowrap" style={{ pointerEvents: 'none' }}>
    <Box 
      style={{ 
        width: 'clamp(32px, 5vw, 40px)', height: 'clamp(32px, 5vw, 40px)', 
        backgroundColor: '#2563EB', borderRadius: '50%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
      }}
    >
      <Activity size={20} color="white" strokeWidth={2.5} />
    </Box>
    <Text 
      span className="font-black"
      style={{ 
        fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 'clamp(18px, 4vw, 22px)', 
        letterSpacing: '-0.02em', color: '#1E293B', textTransform: 'uppercase', lineHeight: 1
      }}
    >
      QUEUECARE
    </Text>
  </Group>
);

export function Navbar({ user }) {
  const router = useRouter();
  const [loginOpened, { open: openLogin, close: closeLogin }] = useDisclosure(false);
  const [profileOpened, { open: openProfile, close: closeProfile }] = useDisclosure(false);
  
  // 1. เพิ่ม Local State เพื่อรองรับการอัปเดตข้อมูลแบบ Real-time
  const [currentUser, setCurrentUser] = useState(user);
  const [loginStep, setLoginStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [timer, setTimer] = useState(0);
  const [activeQueueId, setActiveQueueId] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Sync ข้อมูลเมื่อ Prop user เปลี่ยนแปลง
  useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    setMounted(true);
    setActiveQueueId(localStorage.getItem('user_queue_id'));
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = () => {
    if (phone.length >= 10) { setLoginStep('otp'); setTimer(60); }
  };

  const handleLogin = () => {
    localStorage.setItem('user_queue_id', 'Q-123');
    setActiveQueueId('Q-123');
    closeLogin();
    setLoginStep('phone');
    setOtpValue('');
    router.push('/myqueue'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('user_queue_id');
    setActiveQueueId(null);
    router.push('/');
  };

  // 2. ฟังก์ชันอัปเดตข้อมูลผู้ใช้ใน Navbar
  const handleUpdateProfile = (newData) => {
    setCurrentUser(prev => ({ ...prev, ...newData }));
    closeProfile();
  };

  if (!mounted) return <nav className="h-20 bg-white border-b border-slate-100" />;

  return (
    <>
      <nav className="h-16 md:h-20 px-4 md:px-10 lg:px-20 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <Link href="/" className="no-underline transition-opacity hover:opacity-80">
          <QueueCareLogo />
        </Link>

        <Group gap={{ base: 'xs', md: 'md' }}>
          {currentUser ? ( // ใช้ currentUser แทน user
            <Group gap="xs">
              <UnstyledButton onClick={openProfile} className="hover:opacity-80 transition-opacity">
                <Group gap="sm" className="bg-slate-50 px-2 md:px-4 py-1.5 rounded-full border border-slate-100">
                  <Avatar src={currentUser.image} alt={currentUser.name} color="blue" radius="xl" size="sm">
                    {!currentUser.image && <UserCircle2 size={20} />}
                  </Avatar>
                  <Stack gap={0} visibleFrom="xs">
                    <Text className="text-[10px] md:text-[11px] font-bold text-slate-900 leading-tight uppercase">{currentUser.name}</Text>
                    <Text className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase tracking-widest">{currentUser.role}</Text>
                  </Stack>
                </Group>
              </UnstyledButton>
              <ActionIcon variant="subtle" color="gray" radius="xl" size="lg" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-500">
                <LogOut size={18} />
              </ActionIcon>
            </Group>
          ) : activeQueueId ? (
            <Group gap="xs">
              <Button variant="filled" color="blue" radius="xl" size="sm" onClick={() => router.push('/myqueue')} className="px-4 md:px-6 font-bold shadow-lg" leftSection={<Ticket size={16} />}>คิวของฉัน</Button>
              <ActionIcon variant="subtle" color="gray" radius="xl" size="lg" onClick={handleLogout}><LogOut size={18} /></ActionIcon>
            </Group>
          ) : (
            <Button onClick={openLogin} radius="xl" size="sm" color="blue" className="px-6 md:px-8 font-bold shadow-xl active:scale-95 transition-all">Login</Button>
          )}
        </Group>
      </nav>

      {/* ส่ง handleUpdateProfile เข้าไปใน Modal */}
      <StaffProfileModal 
        opened={profileOpened} 
        onClose={closeProfile} 
        user={currentUser} 
        onUpdate={handleUpdateProfile} 
      />

      {/* Login Modal (เหมือนเดิม) */}
      <Modal opened={loginOpened} onClose={() => { closeLogin(); setLoginStep('phone'); }} centered radius="40px" padding={0} withCloseButton={false} size={{ base: '95%', sm: '440px' }} overlayProps={{ backgroundOpacity: 0.5, blur: 6 }}>
        <Box className="p-8 md:p-12 bg-white relative">
          <ActionIcon variant="light" color="gray" radius="xl" size="lg" onClick={closeLogin} style={{ position: 'absolute', top: '24px', right: '24px' }}><X size={20} /></ActionIcon>
          <AnimatePresence mode="wait">
            {loginStep === 'phone' ? (
              <motion.div key="phone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Stack gap="xl">
                  <Stack gap={4}><Text className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">Identification</Text><Title order={2} className="text-2xl font-extrabold text-[#1E293B]">เข้าสู่ระบบ</Title></Stack>
                  <TextInput value={phone} onChange={(e) => setPhone(e.currentTarget.value)} placeholder="08X-XXX-XXXX" label="PHONE NUMBER" size="lg" radius="md" leftSection={<Phone size={18} className="text-blue-600" />} />
                  <Button fullWidth size="xl" radius="xl" color="blue" onClick={handleSendOTP} className="h-16 font-bold shadow-xl active:scale-95">Request OTP Code</Button>
                  <Link href="/staff" className="no-underline" onClick={closeLogin}><Flex justify="center" align="center" gap={6} className="py-2 opacity-50"><ShieldCheck size={14} /><Text className="text-[10px] font-bold uppercase">Staff Portal</Text></Flex></Link>
                </Stack>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Stack gap="xl" align="center">
                  <Stack gap={4} align="center"><Title order={2} className="text-2xl font-extrabold text-[#1E293B]">ยืนยันรหัส OTP</Title><Badge variant="light" color="blue" size="lg">{phone}</Badge></Stack>
                  <Box className="py-4"><PinInput length={6} size="xl" radius="md" oneTimeCode value={otpValue} onChange={setOtpValue} type="number" classNames={{ input: "font-bold text-2xl h-14 w-11 md:w-14" }} /></Box>
                  <Button fullWidth size="xl" radius="xl" color="blue" onClick={handleLogin} disabled={otpValue.length < 6} className="h-16 font-bold shadow-xl active:scale-95">Confirm and Login</Button>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Modal>
    </>
  );
}

// STAFF PROFILE MODAL: เพิ่มระบบส่งค่ากลับ
function StaffProfileModal({ opened, onClose, user, onUpdate }) {
  const [name, setName] = useState(user?.name || '');
  const [tel, setTel] = useState(user?.tel || '');
  const [imagePreview, setImagePreview] = useState(user?.image || '');

  // เมื่อ Modal เปิด ให้รีเซ็ตค่าตาม user ปัจจุบัน
  useEffect(() => {
    if (opened) {
      setName(user?.name || '');
      setTel(user?.tel || '');
      setImagePreview(user?.image || '');
    }
  }, [opened, user]);

  const handleFileUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} centered radius="40px" withCloseButton={false} padding={0} size={{ base: '95%', sm: '500px' }} overlayProps={{ backgroundOpacity: 0.5, blur: 6 }}>
      <Box className="p-10 md:p-14 bg-white relative">
        <ActionIcon variant="light" color="gray" radius="xl" size="xl" onClick={onClose} style={{ position: 'absolute', top: '28px', right: '28px', zIndex: 100 }} className="hover:bg-red-50 hover:text-red-500"><X size={24} /></ActionIcon>
        <Stack gap={40}>
          <Stack gap={4}><Text className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">Profile Settings</Text><Title className="text-3xl font-extrabold text-[#1E293B]">จัดการข้อมูลส่วนตัว</Title></Stack>
          <Center>
            <Box className="relative">
              <Avatar src={imagePreview} size={120} radius="100%" color="blue" className="border-4 border-slate-50 shadow-xl">{!imagePreview && <User size={60} className="text-slate-300" />}</Avatar>
              <FileButton onChange={handleFileUpload} accept="image/*">
                {(props) => <ActionIcon {...props} variant="filled" color="blue" size="40px" radius="xl" className="absolute bottom-0 right-0 shadow-lg border-4 border-white active:scale-90"><Camera size={18} /></ActionIcon>}
              </FileButton>
            </Box>
          </Center>
          <Stack gap="xl">
            <TextInput label="DISPLAY NAME" value={name} onChange={(e) => setName(e.target.value)} radius="md" size="lg" leftSection={<User size={18} className="text-blue-600" />} classNames={{ input: "font-bold h-14 border-slate-200" }} />
            <TextInput label="PHONE NUMBER" value={tel} onChange={(e) => setTel(e.target.value)} radius="md" size="lg" leftSection={<Phone size={18} className="text-blue-600" />} classNames={{ input: "font-bold h-14 border-slate-200" }} />
          </Stack>
          {/* เมื่อกดปุ่ม จะส่งข้อมูลใหม่กลับไปยัง Navbar */}
          <Button 
            fullWidth size="xl" radius="xl" color="blue" 
            className="h-20 text-lg font-bold shadow-xl active:scale-95" 
            onClick={() => onUpdate({ name, tel, image: imagePreview })}
            leftSection={<Check size={22} />}
          >
            Update Profile Information
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}