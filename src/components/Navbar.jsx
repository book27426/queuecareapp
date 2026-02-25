"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { 
  Activity, Ticket, Phone, ArrowRight, UserCircle2, 
  LogOut, ShieldCheck, X, Camera, User, Check 
} from 'lucide-react'; 
import { 
  Group, Stack, Text, Box, Modal, TextInput, Button, Title, 
  PinInput, ActionIcon, Flex, Badge, Avatar, UnstyledButton, Center
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks'; 
import { motion, AnimatePresence } from 'framer-motion';

// ✅ นำเข้า Firebase Tools (ต้องมี signOut เพิ่มเข้ามา)
import { auth, googleProvider, signInWithPopup, signOut } from "@/lib/firebase";

// --- Logo Component ---
export const QueueCareLogo = () => (
  <Group gap="xs" wrap="nowrap" style={{ pointerEvents: 'none' }}>
    <Box style={{ width: 40, height: 40, backgroundColor: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Activity size={20} color="white" strokeWidth={2.5} />
    </Box>
    <Text span className="font-black" style={{ fontSize: 22, color: '#1E293B', textTransform: 'uppercase' }}>QUEUECARE</Text>
  </Group>
);

export default function Navbar({ user }) {
  const router = useRouter();
  const [loginOpened, { open: openLogin, close: closeLogin }] = useDisclosure(false);
  const [profileOpened, { open: openProfile, close: closeProfile }] = useDisclosure(false);
  
  const [currentUser, setCurrentUser] = useState(user);
  const [loginStep, setLoginStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) setCurrentUser(user);
  }, [user]);

  // 🏥 ฟังก์ชัน Google Login สำหรับ Staff (ฉบับแก้ไข: ขอ Token สด)
  const handleStaffLogin = async () => {
    try {
      // 1. เรียกหน้าต่าง Google Login
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. 🔑 "ขอคีย์ดอกจริง" (JWT Token) จาก Firebase
      const token = await result.user.getIdToken();
      
      // 3. 💾 เซฟคีย์ลงเครื่อง (LocalStorage) เพื่อให้ API หน้าอื่นๆ หยิบไปใช้ได้
      localStorage.setItem('access_token', token);
      
      console.log("✅ กุญแจถูกสร้างและเซฟลงเครื่องแล้ว!");

      closeLogin();
      
      // 4. 🚀 ส่งไปที่หน้า Setup Profile เพื่อตรวจสอบข้อมูลพนักงาน
      router.push('/setup-profile'); 
    } catch (error) {
      console.error("Staff Login Error:", error);
    }
  };

  // 🎫 สำหรับ User ปกติ (ยังใช้ระบบ Phone/OTP Mockup)
  const handleUserLogin = () => {
    localStorage.setItem('user_queue_id', 'Q-123'); 
    closeLogin();
    router.push('/myqueue'); 
  };

  // 🚪 ฟังก์ชัน Logout (ฉบับแก้ไข: ล้างทั้ง Firebase และ LocalStorage)
  const handleLogout = async () => {
    try {
      await signOut(auth); // สั่ง Firebase ให้ Logout
      localStorage.removeItem('user_queue_id');
      localStorage.removeItem('access_token'); // ล้างกุญแจทิ้ง
      setCurrentUser(null);
      router.push('/');
      router.refresh(); // บังคับรีเฟรชสถานะ
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleSendOTP = () => { if (phone.length >= 10) { setLoginStep('otp'); } };

  if (!mounted) return <nav className="h-20 bg-white border-b border-slate-100" />;

  return (
    <>
      <nav className="h-16 md:h-20 px-4 md:px-20 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <Link href="/" className="no-underline"><QueueCareLogo /></Link>

        <Group gap="md">
          {currentUser ? (
            <Group gap="xs">
              <UnstyledButton onClick={openProfile}>
                <Group gap="sm" className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors">
                  <Avatar src={currentUser.image} color="blue" radius="xl" size="sm">
                    {!currentUser.image && <UserCircle2 size={20} />}
                  </Avatar>
                  <Stack gap={0} visibleFrom="xs">
                    <Text className="text-[11px] font-bold text-slate-900 uppercase">
                      {currentUser.first_name || 'Staff Name'}
                    </Text>
                    <Text className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{currentUser.role || 'Officer'}</Text>
                  </Stack>
                </Group>
              </UnstyledButton>
              <ActionIcon variant="subtle" color="gray" radius="xl" size="lg" onClick={handleLogout}><LogOut size={18} /></ActionIcon>
            </Group>
          ) : (
            <Button onClick={openLogin} radius="xl" color="blue" className="px-8 font-bold shadow-xl transition-transform hover:scale-105">Login</Button>
          )}
        </Group>
      </nav>

      {/* --- Modal จัดการโปรไฟล์ (โชว์เมื่อ Login แล้ว) --- */}
      <StaffProfileModal 
        opened={profileOpened} 
        onClose={closeProfile} 
        user={currentUser} 
        onUpdate={(data) => { setCurrentUser(prev => ({...prev, ...data})); closeProfile(); }} 
      />

      {/* --- Modal เข้าสู่ระบบ --- */}
      <Modal opened={loginOpened} onClose={() => { closeLogin(); setLoginStep('phone'); }} centered radius="40px" withCloseButton={false} padding={0} size="440px">
        <Box className="p-10 bg-white relative">
          <ActionIcon variant="light" color="gray" radius="xl" onClick={closeLogin} style={{ position: 'absolute', top: 24, right: 24 }}><X size={20} /></ActionIcon>
          
          <AnimatePresence mode="wait">
            {loginStep === 'phone' ? (
              <motion.div key="phone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Stack gap="xl">
                  <Stack gap={4}>
                    <Text className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">Identification</Text>
                    <Title order={2} className="text-2xl font-extrabold text-[#1E293B]">เข้าสู่ระบบ</Title>
                    <Text size="xs" c="dimmed">เลือกช่องทางการเข้าสู่ระบบตามสิทธิ์ของคุณ</Text>
                  </Stack>

                  <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08X-XXX-XXXX" label="PHONE NUMBER" size="lg" radius="md" leftSection={<Phone size={18} className="text-blue-600" />} />
                  <Button fullWidth size="xl" radius="xl" color="blue" onClick={handleSendOTP} className="h-16 font-bold shadow-lg">Request OTP Code</Button>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                    <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or Staff Access</span></div>
                  </div>

                  {/* ✅ ปุ่ม Google Staff Login ดอกสำคัญ */}
                  <UnstyledButton onClick={handleStaffLogin}>
                    <Flex justify="center" align="center" gap={10} className="py-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group">
                      <img src="https://www.google.com/favicon.ico" width={16} alt="Google" />
                      <Text className="text-[11px] font-black uppercase text-slate-500 group-hover:text-blue-600">Continue with Google Staff</Text>
                      <ShieldCheck size={14} className="text-slate-300 group-hover:text-blue-500" />
                    </Flex>
                  </UnstyledButton>
                </Stack>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Stack gap="xl" align="center">
                  <Title order={2} className="text-2xl font-extrabold">ยืนยัน OTP</Title>
                  <PinInput length={6} size="xl" radius="md" value={otpValue} onChange={setOtpValue} />
                  <Button fullWidth size="xl" radius="xl" color="blue" onClick={handleUserLogin} className="h-16 font-bold">Confirm Login</Button>
                  <Button variant="subtle" color="gray" size="xs" onClick={() => setLoginStep('phone')}>Back to Phone Login</Button>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Modal>
    </>
  );
}

// --- Component ย่อย: Staff Profile Modal ---
function StaffProfileModal({ opened, onClose, user, onUpdate }) {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  
  useEffect(() => { 
    if (opened) { 
      setFirstName(user?.first_name || ''); 
      setLastName(user?.last_name || ''); 
    } 
  }, [opened, user]);

  return (
    <Modal opened={opened} onClose={onClose} centered radius="40px" withCloseButton={false} padding={40} size="500px">
      <Stack gap="xl">
        <Title className="text-2xl font-extrabold text-[#1E293B]">จัดการโปรไฟล์</Title>
        <Center>
          <Avatar src={user?.image} size={100} radius="100%" color="blue" style={{ border: '4px solid #F1F5F9' }} />
        </Center>
        <Group grow>
          <TextInput label="FIRST NAME" value={firstName} onChange={(e) => setFirstName(e.target.value)} radius="md" size="lg" />
          <TextInput label="LAST NAME" value={lastName} onChange={(e) => setLastName(e.target.value)} radius="md" size="lg" />
        </Group>
        <Button fullWidth size="xl" radius="xl" color="blue" onClick={() => onUpdate({ first_name: firstName, last_name: lastName })} leftSection={<Check size={20} />}>
          Update Information
        </Button>
      </Stack>
    </Modal>
  );
}