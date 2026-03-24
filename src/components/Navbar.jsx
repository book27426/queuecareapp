"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Group, Stack, Text, Box, Modal, TextInput, Button, Title,
  PinInput, ActionIcon, Flex, Alert, Divider, UnstyledButton, Avatar,
  Center, Badge, Menu, FileButton, ThemeIcon
} from '@mantine/core';
import {
  X, ShieldCheck, AlertCircle, LogOut, Activity,
  Ticket, LayoutDashboard, User as UserIcon, Save, Check, Camera, ChevronDown,
  ArrowLeft, Smartphone, Lock, PlusCircle
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
  const lastVerifyTime = useRef(0);

  const [loginStep, setLoginStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpTicket, setOtpTicket] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [otpFromDb, setOtpFromDb] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [editName, setEditName] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isQueuePage = pathname.includes('/myqueue');

  const syncAuth = useCallback(async (fbUser) => {
    const image = localStorage.getItem('staff_image');
    const name = localStorage.getItem('staff_name');
    const email = localStorage.getItem('staff_email');
    const savedPhone = localStorage.getItem('user_phone');
    if (fbUser && name) {
      //display image name email from localStorage but now i dont have image
      setCurrentUser({ image: image, name: name || email, role: 'staff', email: email });
      setEditName(name || '');
      setPreviewImage(image);
    } else if (savedPhone) {
      setCurrentUser({ name: savedPhone, image: null, role: 'user' });
    } else {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, syncAuth);
    const handleStorage = () => syncAuth(auth.currentUser);
    window.addEventListener('storage', handleStorage);
    return () => { unsubscribe(); window.removeEventListener('storage', handleStorage); };
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
      const res = await fetch("https://queuecaredev.vercel.app/api/v1/otp_verify", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_num: phone })
      });

      const result = await res.json();
      if (res.ok && (result.success || result.succes)) {
        setLoginStep('otp');
        setOtpFromDb(result.message);
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
    const now = Date.now();
    if (now - lastVerifyTime.current < 2000) return;
    if (isVerifying || verifyLock.current || otpValue.length !== 6) return;

    verifyLock.current = true;
    lastVerifyTime.current = now;
    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch("https://queuecaredev.vercel.app/api/v1/user", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_num: phone, otp: otpValue })
      });

      const result = await res.json();
      if (res.ok && (result.success || result.succes)) {

        await signOut(auth);

        localStorage.setItem('user_phone', phone);

        setCurrentUser({ name: phone, image: null, role: 'user' });
        handleCloseModal();
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
    // try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const res = await fetch("https://queuecaredev.vercel.app/api/v1/staff", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {

        const responseData = await res.json();
        const staff = responseData.data;

        localStorage.removeItem('user_phone');

        const fullName = `${staff.first_name} ${staff.last_name}`;
        localStorage.setItem('staff_image', result.user.photoURL);
        localStorage.setItem('staff_name', fullName);
        localStorage.setItem('staff_email', staff.email);

        setCurrentUser({
          image: result.user.photoURL,
          name: fullName, // Use DB name instead of Google name if preferred
          role: 'staff',
        });

        handleCloseModal();
        router.push('/facilities');
      } else {
        setError("คุณไม่มีสิทธิ์เข้าถึงส่วนของเจ้าหน้าที่");
        await signOut(auth);
      }
    // } catch (err) {
    //   setError("การเข้าสู่ระบบล้มเหลว");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleUpdateProfile = async () => {
    if (!editName || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateProfile(auth.currentUser, { displayName: editName });
      setCurrentUser(prev => prev ? { ...prev, name: editName } : null);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); closeProfile(); }, 1500);
    } catch (err) { setError("ไม่สามารถบันทึกข้อมูลได้"); }
    finally { setIsUpdating(false); }
  };

  const handleLogout = async () => {
    await fetch("https://queuecaredev.vercel.app/api/v1/user", {
      method: 'DELETE',
      credentials: 'include'
    });
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
      verifyLock.current = false; lastVerifyTime.current = 0;
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
            <Box className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity size={20} color="white" strokeWidth={3} />
            </Box>
            <Text fw={900} fz={24} c="#1E293B" className="tracking-tighter italic hidden sm:block">QUEUECARE</Text>
          </Group>
        </Link>

        <Group gap="xs">
          {currentUser ? (
            <Group gap="xs">
              {currentUser.role === 'staff' ? (
                <Button onClick={() => router.push('/facilities')} radius="xl" color="orange" variant="light" fw={800} size="sm" leftSection={<LayoutDashboard size={16} />}>Dashboard</Button>
              ) : (
                <Group gap={8}>
                  {/* ✅ Single Smart Button */}
                  <Button
                    visibleFrom="sm" onClick={() => router.push(isQueuePage ? '/join' : '/myqueue')}
                    radius="xl" color="blue" fw={900} size="md" px={24}
                    leftSection={isQueuePage ? <PlusCircle size={18} /> : <Ticket size={18} />}
                    className="shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    {isQueuePage ? "จองคิวเพิ่ม" : "คิวของฉัน"}
                  </Button>
                  <ActionIcon
                    hiddenFrom="sm" onClick={() => router.push(isQueuePage ? '/join' : '/myqueue')}
                    radius="xl" color="blue" size="xl" variant="filled" className="shadow-lg"
                  >
                    {isQueuePage ? <PlusCircle size={20} /> : <Ticket size={20} />}
                  </ActionIcon>
                </Group>
              )}
              <Menu shadow="xl" width={240} radius="xl" position="bottom-end" withArrow transitionProps={{ transition: 'pop-top-right' }}>
                <Menu.Target>
                  <UnstyledButton className="hover:bg-slate-50 p-1 rounded-full transition-all">
                    <Group gap={8}><Avatar src={currentUser.image} radius="xl" size="sm" color="blue" /><ChevronDown size={12} className="text-slate-400" /></Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Box className="p-3">
                    <Text size="xs" c="dimmed" fw={700} className="uppercase mb-1 tracking-widest">Account</Text>
                    <Text fw={900} size="sm" className="text-[#1E293B]" truncate>{currentUser.name}</Text>
                  </Box>
                  <Menu.Divider />
                  {currentUser.role === 'staff' && <Menu.Item leftSection={<UserIcon size={14} />} onClick={openProfile}>แก้ไขโปรไฟล์</Menu.Item>}
                  <Menu.Item color="red" leftSection={<LogOut size={14} />} onClick={handleLogout}>ออกจากระบบ</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          ) : (
            <Group gap="xs">
              <Button component={Link} href="/myqueue" variant="subtle" color="gray" radius="xl" size="sm" className="font-bold">คิวของฉัน</Button>
              <Button onClick={openLogin} radius="xl" color="blue" fw={900} px={{ base: 20, sm: 28 }} h={46} className="shadow-xl shadow-blue-500/20 active:scale-95 transition-transform">Login</Button>
            </Group>
          )}
        </Group>
      </nav>

      {/* 🚀 MODAL: Login & Staff & OTP (Wider & Fix Off-screen) */}
      <Modal
        opened={loginOpened} onClose={handleCloseModal} centered
        radius="32px" withCloseButton={false} padding={0}
        size="500px"
      >
        <Box className="bg-white relative overflow-hidden min-h-[540px]">
          <Group justify="space-between" className="px-6 pt-6 absolute top-0 left-0 w-full z-10">
            {loginStep === 'otp' ? (
              <ActionIcon variant="light" color="blue" radius="xl" onClick={() => setLoginStep('phone')} size="lg">
                <ArrowLeft size={20} strokeWidth={3} />
              </ActionIcon>
            ) : <Box />}
            <ActionIcon onClick={handleCloseModal} variant="subtle" color="gray" radius="xl" size="lg">
              <X size={22} />
            </ActionIcon>
          </Group>

          <Box className="px-6 pb-12 pt-24 sm:px-14 sm:pt-28">
            <AnimatePresence mode="wait">
              {loginStep === 'phone' ? (
                <motion.div key="phone" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                  <Stack gap={44}>
                    <Stack gap={12} align="center" className="text-center">
                      <ThemeIcon size={84} radius="32px" color="blue" variant="light" className="shadow-inner border border-blue-50">
                        <Smartphone size={38} />
                      </ThemeIcon>
                      <Stack gap={4}>
                        <Title order={2} className="text-3xl font-black italic tracking-tighter text-[#1E293B]">Welcome.</Title>
                        <Text size="sm" c="dimmed" fw={600}>ระบุเบอร์โทรศัพท์เพื่อเข้าถึงระบบคิว</Text>
                      </Stack>
                    </Stack>
                    <Stack gap="xl">
                      <TextInput
                        label={<Text size="xs" fw={900} c="dimmed" className="tracking-widest mb-1 uppercase">Phone Number</Text>}
                        placeholder="08XXXXXXXX" size="xl" radius="xl" maxLength={10}
                        value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        classNames={{ input: 'bg-slate-50 border-transparent focus:bg-white font-bold h-16 text-center text-lg' }}
                      />
                      {error && <Alert color="red" variant="light" radius="xl" icon={<AlertCircle size={18} />} className="py-2 font-bold">{error}</Alert>}
                      <Button fullWidth size="xl" radius="xl" color="blue" h={68} onClick={handleRequestOTP} loading={isLoading} className="shadow-2xl shadow-blue-500/30 font-black italic text-lg hover:translate-y-[-2px] transition-all">REQUEST OTP</Button>
                    </Stack>

                    {/* ✅ STAFF LOGIN BUTTON: */}
                    <Stack gap="md">
                      <Divider label={<Text size="xs" fw={800} c="dimmed" className="tracking-widest uppercase">Staff Portal</Text>} labelPosition="center" />
                      <UnstyledButton onClick={handleStaffLogin} className="group">
                        <Flex justify="center" align="center" gap={12} className="py-4 rounded-2xl border-2 border-slate-50 group-hover:bg-slate-50 group-hover:border-blue-100 transition-all">
                          <ShieldCheck size={20} className="text-blue-600" /><Text size="xs" fw={900} className="tracking-widest">SIGN IN AS STAFF</Text>
                        </Flex>
                      </UnstyledButton>
                    </Stack>
                  </Stack>
                </motion.div>
              ) : (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Stack gap={44} align="center">
                    <Stack gap={16} align="center" className="text-center">
                      <ThemeIcon size={84} radius="32px" color="blue" variant="light" className="shadow-inner border border-blue-50">
                        <Lock size={38} />
                      </ThemeIcon>
                      <Stack gap={4}>
                        <Title order={2} className="text-3xl font-black italic text-[#1E293B]">Verify Identity</Title>
                        <Text size="sm" c="dimmed" fw={600}>รหัสส่งไปที่เบอร์ <span className="text-blue-600 font-extrabold">{phone}</span></Text>
                      </Stack>
                    </Stack>
                    <Stack gap="xl" w="100%" align="center">
                      {/* ✅ FIX OFF-SCREEN*/}
                      <PinInput
                        length={6} size="md" radius="md" value={otpValue} onChange={setOtpValue} autoFocus
                        classNames={{ input: 'w-10 h-14 xs:w-12 xs:h-16 sm:w-14 sm:h-18 md:w-16 md:h-20 border-2 border-slate-100 focus:border-blue-500 font-black text-2xl shadow-sm' }}
                        gap="xs"
                      />
                      {otpFromDb && <Badge variant="light" color="blue" size="lg" radius="md" className="py-4 font-black tracking-widest border border-blue-100">DEBUG: {otpFromDb}</Badge>}
                      <Stack gap="xl" w="100%" pt={10}>
                        <Button
                          type="button" fullWidth size="xl" radius="xl" color="blue" h={72}
                          onClick={(e) => handleVerifyOTP(e)} loading={isVerifying} disabled={isVerifying}
                          className="shadow-2xl shadow-blue-500/40 font-black italic text-xl"
                        >CONFIRM VERIFY</Button>
                        <Button variant="subtle" color="gray" size="sm" radius="xl" onClick={handleRequestOTP} disabled={cooldown > 0} className="font-bold">
                          {cooldown > 0 ? `RESEND IN ${cooldown}S` : "RESEND OTP CODE"}
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Modal>

      {/* 👤 Profile Modal - Pretty & Wider */}
      <Modal opened={profileOpened} onClose={closeProfile} centered radius="32px" title={<Text component="span" fw={900} fz="xl" className="italic text-[#1E293B] pl-2">Manage Profile</Text>} size="500px" padding="xl">
        <Stack gap={40}>
          <Center>
            <Box className="relative group">
              <Avatar src={previewImage} size={140} radius="100px" color="blue" className="shadow-2xl border-4 border-white transition-transform group-hover:scale-105" />
              <FileButton onChange={handleImageChange} accept="image/png,image/jpeg">
                {(props) => (
                  <ActionIcon {...props} className="absolute bottom-1 right-1 shadow-xl border-2 border-white hover:scale-110 active:scale-95 transition-all" color="blue" radius="xl" size="xl" variant="filled">
                    <Camera size={20} />
                  </ActionIcon>
                )}
              </FileButton>
            </Box>
          </Center>
          <Stack gap="xl">
            <TextInput label={<Text size="xs" fw={900} c="dimmed" className="tracking-widest mb-1 uppercase">Display Name</Text>} value={editName} onChange={(e) => setEditName(e.currentTarget.value)} radius="xl" size="lg" classNames={{ input: 'bg-slate-50 border-transparent focus:bg-white font-bold h-14 shadow-sm' }} />
            <TextInput label={<Text size="xs" fw={900} c="dimmed" className="tracking-widest mb-1 uppercase">Official Email</Text>} value={currentUser?.email} disabled radius="xl" size="lg" variant="filled" classNames={{ input: 'font-bold opacity-70 italic' }} />
          </Stack>
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Alert color="green" icon={<Check size={18} />} variant="light" radius="xl" className="font-bold border border-green-100 text-green-700 shadow-sm">บันทึกข้อมูลเรียบร้อย!</Alert>
              </motion.div>
            )}
          </AnimatePresence>
          <Button fullWidth size="xl" radius="xl" color="blue" h={68} onClick={handleUpdateProfile} loading={isUpdating} leftSection={showSuccess ? <Check size={22} /> : <Save size={22} />} className="shadow-2xl shadow-blue-500/20 font-black italic text-lg hover:translate-y-[-2px] transition-all"> {showSuccess ? "SUCCESS" : "SAVE CHANGES"}</Button>
        </Stack>
      </Modal>
    </>
  );
}