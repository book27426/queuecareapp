"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { 
  Activity, Phone, UserCircle2, LogOut, ShieldCheck, X, Check 
} from 'lucide-react'; 
import { 
  Group, Stack, Text, Box, Modal, TextInput, Button, Title, 
  PinInput, ActionIcon, Flex, Avatar, UnstyledButton, Center, Alert, Loader
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks'; 
import { motion, AnimatePresence } from 'framer-motion';

// ✅ นำเข้า Firebase
import { auth, googleProvider, signInWithPopup, signOut } from "@/lib/firebase";
import { GoogleAuthProvider } from "firebase/auth";

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
  const [isLoggingIn, setIsLoggingIn] = useState(false); // ✅ ป้องกันกดซ้อน
  const [loginError, setLoginError] = useState(null);
  
  const [loginStep, setLoginStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) setCurrentUser(user);
  }, [user]);

  // 🏥 ฟังก์ชัน Google Login สำหรับ Staff (แก้ไขเรื่อง Popup และ Bypass)
  const handleStaffLogin = async () => {
    if (isLoggingIn) return; // ✅ ป้องกัน Double Click ที่ทำให้ Popup พัง

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      // 1. เรียก Google Login
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. 🔑 ดึง JWT Token
      const token = await result.user.getIdToken();
      
      // 3. 💾 เซฟลงเครื่องเพื่อใช้ยิง API จริง
      localStorage.setItem('access_token', token);
      
      console.log("✅ Token saved. Moving to profile setup...");
      closeLogin();
      
      // 4. 🚀 ส่งไปเช็คโปรไฟล์ที่หน้า Setup (ซึ่งเราแก้ให้เข้มงวดแล้ว)
      router.push('/setup-profile'); 

    } catch (error) {
      console.error("Staff Login Error:", error);
      
      // ✅ ดักจับ Error Popup ที่คุณเจอ
      if (error.code === 'auth/popup-closed-by-user') {
        setLoginError("คุณปิดหน้าต่าง Login เร็วเกินไป กรุณาลองใหม่อีกครั้ง");
      } else {
        setLoginError("เกิดข้อผิดพลาด: " + error.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 🚪 ฟังก์ชัน Logout (ล้างค่าทุกอย่างจริง 100%)
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_queue_id');
      setCurrentUser(null);
      router.push('/');
      window.location.reload(); // ✅ รีโหลดเพื่อให้ State ทั้งแอปสะอาด
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleUserLogin = () => {
    localStorage.setItem('user_queue_id', 'Q-123'); 
    closeLogin();
    router.push('/myqueue'); 
  };

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
                      {currentUser.first_name || 'Staff'}
                    </Text>
                    <Text className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{currentUser.role || 'Officer'}</Text>
                  </Stack>
                </Group>
              </UnstyledButton>
              <ActionIcon variant="subtle" color="gray" radius="xl" size="lg" onClick={handleLogout}><LogOut size={18} /></ActionIcon>
            </Group>
          ) : (
            <Button onClick={openLogin} radius="xl" color="blue" className="px-8 font-bold shadow-xl">Login</Button>
          )}
        </Group>
      </nav>

      {/* Modal เข้าสู่ระบบ */}
      <Modal opened={loginOpened} onClose={() => { if(!isLoggingIn) closeLogin(); }} centered radius="40px" withCloseButton={false} padding={0} size="440px">
        <Box className="p-10 bg-white relative">
          {!isLoggingIn && (
            <ActionIcon variant="light" color="gray" radius="xl" onClick={closeLogin} style={{ position: 'absolute', top: 24, right: 24 }}><X size={20} /></ActionIcon>
          )}
          
          <AnimatePresence mode="wait">
            <Stack gap="xl">
              <Stack gap={4}>
                <Text className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">Identification</Text>
                <Title order={2} className="text-2xl font-extrabold text-[#1E293B]">เข้าสู่ระบบ</Title>
              </Stack>

              {loginError && (
                <Alert color="red" variant="light" size="xs">
                  {loginError}
                </Alert>
              )}

              {/* ส่วนของ User ปกติ */}
              {loginStep === 'phone' ? (
                <Stack gap="md">
                  <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08X-XXX-XXXX" label="PHONE NUMBER" size="lg" radius="md" />
                  <Button fullWidth size="xl" radius="xl" color="blue" onClick={() => setLoginStep('otp')} className="h-16 font-bold shadow-lg">Request OTP</Button>
                </Stack>
              ) : (
                <Stack gap="md" align="center">
                  <PinInput length={6} size="xl" value={otpValue} onChange={setOtpValue} />
                  <Button fullWidth size="xl" radius="xl" color="blue" onClick={handleUserLogin} className="h-16 font-bold">Confirm</Button>
                  <Button variant="subtle" color="gray" size="xs" onClick={() => setLoginStep('phone')}>Back</Button>
                </Stack>
              )}
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or Staff Access</span></div>
              </div>

              {/* ✅ ปุ่ม Google Staff Login (แบบกันพัง) */}
              <UnstyledButton onClick={handleStaffLogin} disabled={isLoggingIn}>
                <Flex justify="center" align="center" gap={10} className={`py-4 rounded-2xl border transition-all ${isLoggingIn ? 'bg-slate-50 border-slate-100' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                  {isLoggingIn ? (
                    <Loader size="xs" color="blue" />
                  ) : (
                    <>
                      <img src="https://www.google.com/favicon.ico" width={16} alt="Google" />
                      <Text className="text-[11px] font-black uppercase text-slate-500">Continue with Google Staff</Text>
                      <ShieldCheck size={14} className="text-slate-300" />
                    </>
                  )}
                </Flex>
              </UnstyledButton>
            </Stack>
          </AnimatePresence>
        </Box>
      </Modal>

      {/* Modal โปรไฟล์ */}
      <StaffProfileModal 
        opened={profileOpened} 
        onClose={closeProfile} 
        user={currentUser} 
        onUpdate={(data) => { setCurrentUser(prev => ({...prev, ...data})); closeProfile(); }} 
      />
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
    <Modal opened={opened} onClose={onClose} centered radius="40px" padding={40} size="500px" withCloseButton={false}>
      <Stack gap="xl">
        <Title className="text-2xl font-extrabold text-[#1E293B]">Profile Settings</Title>
        <Center>
          <Avatar src={user?.image} size={100} radius="100%" color="blue" />
        </Center>
        <Group grow>
          <TextInput label="FIRST NAME" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <TextInput label="LAST NAME" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </Group>
        <Button fullWidth size="xl" radius="xl" color="blue" onClick={() => onUpdate({ first_name: firstName, last_name: lastName })}>
          Update Profile
        </Button>
      </Stack>
    </Modal>
  );
}