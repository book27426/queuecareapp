"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Group, Stack, Text, Box, Modal, TextInput, Button, Title, 
  PinInput, ActionIcon, Flex, Alert, Loader, Divider, UnstyledButton, Avatar,
  Center, Badge, Menu, FileButton
} from '@mantine/core';
import { 
  Phone, X, ShieldCheck, AlertCircle, LogOut, Activity, 
  Ticket, LayoutDashboard, User as UserIcon, Save, Check, Camera, ChevronDown 
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { motion, AnimatePresence } from 'framer-motion';

import { auth, googleProvider, signInWithPopup, signOut } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loginOpened, { open: openLogin, close: closeLogin }] = useDisclosure(false);
  const [profileOpened, { open: openProfile, close: closeProfile }] = useDisclosure(false);
  
  const requestLock = useRef(false);
  const verifyLock = useRef(false);
  
  const [loginStep, setLoginStep] = useState('phone'); 
  const [phone, setPhone] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpTicket, setOtpTicket] = useState(null); // ✅ เก็บ Ticket สำหรับส่งกลับไป Verify
  const [cooldown, setCooldown] = useState(0); 
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [otpFromDb, setOtpFromDb] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); 

  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); 
  const [editName, setEditName] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const syncAuth = useCallback(async (fbUser) => {
    const token = localStorage.getItem('access_token');
    const savedPhone = localStorage.getItem('user_phone');

    if (fbUser && token) {
      setCurrentUser({ 
        image: fbUser.photoURL, 
        name: fbUser.displayName || fbUser.email, 
        email: fbUser.email, 
        role: 'staff' 
      });
      setEditName(fbUser.displayName || '');
      setPreviewImage(fbUser.photoURL);
    } else if (savedPhone) {
      setCurrentUser({ name: savedPhone, image: null, role: 'user' });
      if (fbUser && !token) await signOut(auth); 
    } else {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, syncAuth);
    const handleStorage = () => syncAuth(auth.currentUser);
    window.addEventListener('storage', handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncAuth, pathname]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOTP = async () => {
    if (phone.length !== 10 || isLoading || requestLock.current) return;

    requestLock.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_USER_API_OTP, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_num: phone })
      });
      const result = await res.json();
      
      if (res.ok && (result.success || result.succes)) {
        // ✅ เก็บ otp_ticket จาก Response (ปรับตามชื่อฟิลด์จริงของ API พี่นะครับ)
        setOtpTicket(result.otp_ticket || result.data?.otp_ticket || null);
        setOtpFromDb(result.message);
        setLoginStep('otp');
        setCooldown(60); 
      } else {
        setError(result.message || "ไม่สามารถขอรหัสได้");
      }
    } catch (err) { 
      setError("การเชื่อมต่อล้มเหลว"); 
    } finally { 
      setIsLoading(false); 
      requestLock.current = false;
    }
  };

const handleVerifyOTP = async (e) => {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (isVerifying || verifyLock.current || otpValue.length !== 6) return;

  verifyLock.current = true;
  setIsVerifying(true);
  setError(null);

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_USER_API_VERIFY, { 
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone_num: phone, 
        otp: otpValue,
        otp_ticket: otpTicket 
      })
    });
    const result = await res.json();

    if (res.ok && (result.success || result.succes)) {
      // 1. ล้างสิทธิ์ Staff (ถ้ามี)
      localStorage.removeItem('access_token');
      await signOut(auth); 

      // 2. บันทึกสิทธิ์ User ใหม่
      localStorage.setItem('user_phone', phone);

      // --- 🚀 ส่วนที่พี่ต้องการ: การลบ Guest Token ---
      
      // ✅ ถ้าพี่เก็บ guest_token ใน LocalStorage
      localStorage.removeItem('guest_token'); 

      // ✅ ถ้าพี่เก็บ guest_token ใน Cookie (ใช้วิธีสั่งให้หมดอายุ)
      document.cookie = "guest_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // ------------------------------------------

      setCurrentUser({ name: phone, image: null, role: 'user' }); 
      handleCloseModal();
      
      // ย้ายหน้าไป My Queue เพื่อเริ่มดึงข้อมูลในฐานะ User เต็มตัว
      router.push('/myqueue');
    } else { 
      setError(result.message || "รหัส OTP ไม่ถูกต้อง");
      verifyLock.current = false; 
    }
  } catch (err) { 
    setError("เกิดข้อผิดพลาดในการตรวจสอบ"); 
    verifyLock.current = false; 
  } finally { 
    setIsVerifying(false); 
  }
};

  const handleStaffLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_STAFF_PROFILE_API}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        localStorage.setItem('access_token', token);
        localStorage.removeItem('user_phone'); 
        setCurrentUser({ image: result.user.photoURL, name: result.user.displayName, role: 'staff' }); 
        handleCloseModal();
        router.push('/facilities');
      } else {
        setError("คุณไม่มีสิทธิ์เข้าถึงส่วนของเจ้าหน้าที่");
        await signOut(auth);
      }
    } catch (err) { 
      setError("การเข้าสู่ระบบล้มเหลว"); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateProfile(auth.currentUser, { displayName: editName });
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); closeProfile(); }, 1500);
    } catch (err) { 
      setError("ไม่สามารถบันทึกข้อมูลได้"); 
    } finally { 
      setIsUpdating(false); 
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    setCurrentUser(null);
    window.location.href = '/';
  };

  const handleCloseModal = () => {
    closeLogin();
    setTimeout(() => { 
      setLoginStep('phone'); setPhone(''); setError(null); setOtpFromDb(null); setOtpValue(''); setOtpTicket(null);
      requestLock.current = false;
      verifyLock.current = false;
    }, 300);
  };

  const handleImageChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <nav className="h-16 md:h-20 px-4 lg:px-12 flex items-center justify-between bg-white/90 backdrop-blur-md border-b sticky top-0 z-50">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Group gap="xs">
            <Box className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Activity size={20} color="white" strokeWidth={3} />
            </Box>
            <Text fw={900} fz={24} c="#1E293B" className="tracking-tighter italic">QUEUECARE</Text>
          </Group>
        </Link>

        <Group gap="md">
          {currentUser ? (
            <Group gap="sm">
              {currentUser.role === 'staff' ? (
                <Button onClick={() => router.push('/facilities')} radius="xl" color="orange" variant="light" fw={800} size="sm" leftSection={<LayoutDashboard size={16} />}>จัดการหน่วยงาน</Button>
              ) : (
                <Button onClick={() => router.push(pathname.includes('/myqueue') ? '/join' : '/myqueue')} radius="xl" color="blue" variant="light" fw={800} size="sm" leftSection={<Ticket size={16} />}>
                   {pathname.includes('/myqueue') ? "จองคิวเพิ่ม" : "คิวของฉัน"}
                </Button>
              )}

              <Menu shadow="lg" width={240} radius="md" position="bottom-end" withArrow>
                <Menu.Target>
                  <UnstyledButton className="hover:bg-slate-50 p-1.5 rounded-full transition-all border border-transparent hover:border-slate-100">
                    <Group gap={8}><Avatar src={currentUser.image} radius="xl" size="sm" color="blue" /><ChevronDown size={14} className="text-slate-400 hidden xs:block" /></Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Box className="p-3"><Text size="xs" c="dimmed" fw={700} className="uppercase mb-1">Signed in as</Text><Text fw={800} size="sm" truncate>{currentUser.name}</Text></Box>
                  <Menu.Divider />
                  {currentUser.role === 'staff' && <Menu.Item leftSection={<UserIcon size={14} />} onClick={openProfile}>แก้ไขโปรไฟล์</Menu.Item>}
                  <Menu.Item color="red" leftSection={<LogOut size={14} />} onClick={handleLogout}>ออกจากระบบ</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          ) : (
            <Group gap="xs">
              <Button component={Link} href="/myqueue" variant="subtle" color="gray" radius="xl" size="sm" className="hidden sm:flex">Check Status</Button>
              <Button onClick={openLogin} radius="xl" color="blue" fw={900} px={24} h={44} className="shadow-lg shadow-blue-100">Login</Button>
            </Group>
          )}
        </Group>
      </nav>

      <Modal opened={loginOpened} onClose={handleCloseModal} centered radius="32px" withCloseButton={false} padding={0} size="420px">
        <Box className="bg-white relative overflow-hidden">
          <ActionIcon onClick={handleCloseModal} variant="subtle" color="gray" radius="xl" size="lg" className="absolute top-6 right-5 z-[100] hover:bg-slate-100 transition-all"><X size={22} /></ActionIcon>

          <Box className="p-10 pt-16">
            <AnimatePresence mode="wait">
              {loginStep === 'phone' ? (
                <motion.div key="phone" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                  <Stack gap="xl">
                    <Stack gap={6}>
                      <Title order={2} className="text-4xl font-black italic tracking-tighter text-[#1E293B]">Welcome.</Title>
                      <Text size="sm" c="dimmed" fw={500}>กรุณากรอกเบอร์โทรศัพท์เพื่อเข้าถึงระบบคิว</Text>
                    </Stack>
                    <TextInput label={<Text size="xs" fw={800} c="dimmed" className="tracking-widest mb-1 uppercase">Phone Number</Text>} placeholder="08XXXXXXXX" size="lg" radius="md" maxLength={10} leftSection={<Phone size={18} className="text-blue-500" />} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
                    {error && <Alert color="red" variant="light" radius="xl" icon={<AlertCircle size={18}/>}><Text size="xs" fw={700}>{error}</Text></Alert>}
                    <Button fullWidth size="xl" radius="xl" color="blue" h={64} onClick={handleRequestOTP} loading={isLoading} className="shadow-xl shadow-blue-100 font-bold">รับรหัส OTP</Button>
                    <Divider label={<Text size="xs" fw={800} c="slate.4" className="tracking-widest">STAFF ONLY</Text>} labelPosition="center" />
                    <UnstyledButton onClick={handleStaffLogin}>
                      <Flex justify="center" align="center" gap={12} className="py-4 rounded-2xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                        <ShieldCheck size={20} className="text-blue-500" /><Text size="xs" fw={800} className="tracking-widest">SIGN IN WITH GOOGLE STAFF</Text>
                      </Flex>
                    </UnstyledButton>
                  </Stack>
                </motion.div>
              ) : (
                <motion.div key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Stack gap="xl" align="center">
                    <Stack gap={4} align="center">
                      <Title order={2} className="text-3xl font-black italic text-[#1E293B]">Verify Identity</Title>
                      <Text size="sm" c="dimmed" fw={500}>ส่งรหัส 6 หลักไปที่เบอร์ <span className="text-blue-600 font-bold">{phone}</span></Text>
                    </Stack>
                    <PinInput length={6} size="xl" radius="md" value={otpValue} onChange={setOtpValue} autoFocus classNames={{ input: 'border-2 focus:border-blue-500 font-bold' }} />
                    {otpFromDb && <Badge variant="dot" color="blue" size="lg">DEBUG OTP: {otpFromDb}</Badge>}
                    <Stack gap="sm" w="100%">
                      <Button type="button" fullWidth size="xl" radius="xl" color="blue" h={64} onClick={(e) => handleVerifyOTP(e)} loading={isVerifying} disabled={isVerifying} className="shadow-xl font-bold">ยืนยันรหัสเข้าใช้งาน</Button>
                      <Button variant="subtle" color="gray" size="sm" onClick={handleRequestOTP} disabled={cooldown > 0}>{cooldown > 0 ? `ขอรหัสใหม่ใน (${cooldown}s)` : "ส่งรหัสใหม่อีกครั้ง"}</Button>
                    </Stack>
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Modal>  
      
      <Modal opened={profileOpened} onClose={closeProfile} centered radius="32px" title={<Title order={4} fw={900} className="italic text-[#1E293B]">Manage Profile</Title>} size="420px" padding="xl">
        <Stack gap="xl">
          <Center><Box className="relative group"><Avatar src={previewImage} size={130} radius="100px" color="blue" className="shadow-2xl border-white" /><FileButton onChange={handleImageChange} accept="image/png,image/jpeg">{(props) => (<ActionIcon {...props} className="absolute bottom-1 right-1" color="blue" radius="xl" size="xl" variant="filled"><Camera size={20} /></ActionIcon>)}</FileButton></Box></Center>
          <Stack gap="md"><TextInput label="Display Name" value={editName} onChange={(e) => setEditName(e.currentTarget.value)} radius="md" size="md" /><TextInput label="Official Email" value={currentUser?.email} disabled radius="md" size="md" variant="filled" /></Stack>
          <AnimatePresence>{showSuccess && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}><Alert color="green" icon={<Check size={16}/>} variant="light" radius="md"><Text size="xs" fw={700}>อัปเดตข้อมูลสำเร็จแล้วครับ!</Text></Alert></motion.div>)}</AnimatePresence>
          <Button fullWidth size="xl" radius="xl" color="blue" h={60} onClick={handleUpdateProfile} loading={isUpdating} leftSection={showSuccess ? <Check size={20}/> : <Save size={20}/>}>{showSuccess ? "Success" : "Save Changes"}</Button>
        </Stack>
      </Modal>
    </>
  );
} 