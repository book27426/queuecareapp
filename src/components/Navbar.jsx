// src/components/Navbar.jsx
"use client";

import React, { useState, useEffect } from 'react'; // ✅ เพิ่ม useEffect
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; 
import { Activity, Ticket, Phone, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react'; 
import { Group, Stack, Text, Box, Modal, TextInput, Button, Title, PinInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks'; 
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false); 
  const [loginStep, setLoginStep] = useState('phone'); 
  const [phone, setPhone] = useState('');
  const [otpValue, setOtpValue] = useState('');
  
  // ✅ ระบบ Cooldown State
  const [timer, setTimer] = useState(0);

  // ✅ ฟังก์ชันนับเวลาถอยหลัง
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = () => {
    if (phone.length >= 10) {
      setLoginStep('otp');
      setTimer(60); // ✅ เริ่มนับถอยหลัง 1 นาที (60 วินาที)
    }
  };

  const handleResendOTP = () => {
    if (timer === 0) {
      console.log("Resending OTP to:", phone);
      setTimer(60); // ✅ รีเซ็ตตัวนับใหม่
      setOtpValue(''); // ล้างค่าเดิม
    }
  };

  const handleLogin = () => {
    close();
    setLoginStep('phone');
    setOtpValue('');
    setTimer(0);
    router.push('/myqueue'); 
  };

  const isIndex = pathname === '/';
  const isStaff = !!user;

  return (
    <>
      <nav className="h-20 px-8 lg:px-20 flex items-center justify-between bg-white border-b-2 border-slate-900 sticky top-0 z-50">
        <Link href="/" className="no-underline">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center shadow-[4px_4px_0px_#10B981]">
              <Activity className="text-[#10B981]" size={22} strokeWidth={3} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">QueueCare</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {!isStaff && (
            <>
              {!isIndex && (
                <Link href="/myqueue" className="no-underline">
                  <button className="px-6 py-2.5 bg-white border-2 border-slate-900 text-slate-900 font-black flex items-center gap-2 shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer">
                    <Ticket size={18} strokeWidth={3} className="text-[#10B981]" />
                    <span className="uppercase tracking-tight text-xs">คิวของฉัน</span>
                  </button>
                </Link>
              )}
              <button onClick={open} className="px-8 py-2.5 bg-[#0096FF] border-2 border-slate-900 text-white font-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all uppercase tracking-widest text-xs cursor-pointer">
                Login
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ✅ Modal 0px Radius ตามสไตล์ Industrial */}
      <Modal opened={opened} onClose={() => { close(); setLoginStep('phone'); }} centered radius={0} padding={0} withCloseButton={false} size="440px">
        <Box className="border-[4px] border-slate-900 bg-white p-10">
          <AnimatePresence mode="wait">
            {loginStep === 'phone' ? (
              <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Stack gap="xl">
                  <Box>
                    <Title order={2} className="text-3xl font-black uppercase tracking-tighter text-slate-900">Welcome Back</Title>
                    <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Identification Required</Text>
                  </Box>
                  
                  <TextInput 
                    value={phone} 
                    onChange={(e) => setPhone(e.currentTarget.value)} 
                    placeholder="08X-XXX-XXXX" 
                    label="PHONE NUMBER" 
                    size="lg" 
                    radius={0}
                    leftSection={<Phone size={18} />} 
                    classNames={{ input: "font-black border-2 border-slate-900 focus:border-[#10B981]", label: "font-black text-[10px] tracking-widest mb-1" }} 
                  />
                  
                  <Stack gap="sm">
                    <Button fullWidth size="xl" radius={0} color="dark.9" onClick={handleSendOTP} className="h-16 bg-slate-900 border-none shadow-[6px_6px_0px_#10B981] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                      <Group gap="xs">
                        <Text className="font-black uppercase tracking-widest">Send OTP</Text>
                        <ArrowRight size={20} strokeWidth={3} />
                      </Group>
                    </Button>
                    <Link href="/staff" className="no-underline w-full" onClick={close}>
                      <button className="w-full bg-transparent border-none text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-slate-900 transition-colors cursor-pointer py-2">
                        Login as Staff
                      </button>
                    </Link>
                  </Stack>
                </Stack>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Stack gap="xl" align="center">
                  <Box className="w-full">
                    <Title order={2} className="text-3xl font-black uppercase tracking-tighter text-slate-900">Verify OTP</Title>
                    <Text className="text-lg font-black text-[#10B981] mt-1">{phone}</Text>
                  </Box>

                  <Box className="py-2">
                    <PinInput 
                      length={6} 
                      size="xl" 
                      oneTimeCode 
                      value={otpValue}
                      onChange={setOtpValue}
                      type="number"
                      classNames={{ input: "font-black text-3xl h-16 w-12 !rounded-none border-2 border-slate-900 focus:border-[#10B981]" }}
                    />
                  </Box>

                  <Stack gap="md" className="w-full">
                    <Button fullWidth size="xl" radius={0} onClick={handleLogin} disabled={otpValue.length < 6} className="h-16 bg-[#10B981] border-none shadow-[6px_6px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                      <Text className="font-black uppercase tracking-widest text-white">Confirm Login</Text>
                    </Button>

                    <Group justify="space-between" className="w-full">
                      <button onClick={() => setLoginStep('phone')} className="bg-transparent border-none cursor-pointer flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all">
                        <ArrowLeft size={14} strokeWidth={3} />
                        <Text className="font-black uppercase text-[9px] tracking-widest underline">Edit Phone</Text>
                      </button>

                      {/* ✅ ส่วน Resend OTP Cooldown */}
                      {timer > 0 ? (
                        <Group gap={6} className="text-slate-400">
                          <RotateCw size={12} className="animate-spin" />
                          <Text className="font-black text-[9px] tracking-widest uppercase">Resend in {timer}s</Text>
                        </Group>
                      ) : (
                        <button onClick={handleResendOTP} className="bg-transparent border-none cursor-pointer text-[#0096FF] hover:text-blue-700 font-black uppercase text-[9px] tracking-widest underline transition-all">
                          Resend New OTP
                        </button>
                      )}
                    </Group>
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