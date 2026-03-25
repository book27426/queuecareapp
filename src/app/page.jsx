"use client";

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Ticket, Clock, ShieldCheck, Globe 
} from 'lucide-react';
import { 
  Box, Text, Stack, Title, Container, Button, ThemeIcon, SimpleGrid 
} from '@mantine/core';

export default function IndexPage() {
  const router = useRouter();

  const handleJoinQueue = useCallback(async () => {
    try {
      // Check current user role to prevent staff from entering patient flow
      const res = await fetch("https://queuecaredev.vercel.app/api/v1/me", {
        method: 'GET',
        credentials: 'include'
      });

      const result = await res.json();

      if (result.role === 'staff') {
        // Clear staff session before redirecting to patient join flow
        await fetch("https://queuecaredev.vercel.app/api/v1/user", { 
          method: 'DELETE',
          credentials: 'include' 
        });

        // Handle Firebase cleanup if auth is present
        if (typeof auth !== 'undefined') {
          const { signOut } = await import('firebase/auth');
          await signOut(auth);
        }

        localStorage.clear();
        sessionStorage.clear();
      }
      
      window.location.href = '/join';
    } catch (error) {
      console.error("Join Queue Transition Error:", error);
      window.location.href = '/join'; // Fallback redirect
    }
  }, []);

  return (
    <Box className="min-h-screen bg-[#FDFDFD] flex flex-col antialiased overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>

      <main className="flex-1 z-10">
        {/* SECTION 1: HERO */}
        <Box className="relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 right-0 h-[65vh] bg-[#F1F5F9] -z-10" 
            style={{ borderBottomLeftRadius: '10% 100%', borderBottomRightRadius: '10% 100%' }} 
          />
          
          <Container size="lg" className="pt-16 pb-24 md:py-32">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="w-full lg:w-1/2 space-y-10 text-center lg:text-left">
                <Stack gap="xl">
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-[#1E293B] leading-[1.1] tracking-tighter">
                    Modern access to <br/>
                    <span className="text-blue-600">healthcare flow.</span>
                  </h1>
                  
                  <Text className="text-lg md:text-xl text-[#64748B] leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                    จัดการเวลาของคุณอย่างมีเกียรติด้วยระบบจัดการคิวที่โปร่งใสและตรวจสอบได้แบบ Real-time
                  </Text>
                </Stack>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 w-full px-4 sm:px-0">
                  <Button 
                    fullWidth 
                    size="xl" radius="md" 
                    onClick={handleJoinQueue}
                    className="bg-[#1E293B] hover:bg-slate-800 text-white h-16 md:h-20 font-bold shadow-2xl sm:w-auto px-10"
                    rightSection={<ArrowRight size={22} />}
                  >
                    Join Queue
                  </Button>

                  <Button 
                    fullWidth
                    variant="white" size="xl" radius="md" 
                    onClick={() => router.push(`/myqueue`)}
                    className="h-16 md:h-20 font-bold text-[#1E293B] border border-slate-200 shadow-sm sm:w-auto hover:bg-slate-50"
                    leftSection={<Ticket size={24} className="text-blue-600" />}
                  >
                    คิวของฉัน
                  </Button>
                </div>
              </div>

              <div className="w-full lg:w-1/2 flex justify-center px-4">
                <Box className="relative w-full max-w-[540px] aspect-[4/3] rounded-[40px] overflow-hidden bg-white shadow-2xl border-[12px] border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000" 
                    alt="Clinic Interior" 
                    className="w-full h-full object-cover"
                  />
                  <Box className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                </Box>
              </div>
            </div>
          </Container>
        </Box>

        {/* SECTION 2: FEATURES */}
        <div className="bg-[#F8FAFC] py-32 border-t border-slate-100">
          <Container size="lg">
            <Stack gap="xs" align="center" className="mb-24 text-center">
              <Title order={2} className="text-3xl md:text-5xl font-extrabold text-[#1E293B] tracking-tight">
                Reliable Patient Infrastructure
              </Title>
              <Text className="text-[#64748B] font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                ยกระดับมาตรฐานการเข้าถึงการรักษาด้วยโครงสร้างพื้นฐานดิจิทัลที่แม่นยำ
              </Text>
            </Stack>
            
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing={50}>
              <FeatureCard 
                icon={<Clock size={32} />} 
                title="Time Precision" 
                desc="Accurate wait estimates based on real workstation data." 
              />
              <FeatureCard 
                icon={<ShieldCheck size={32} />} 
                title="Verified Security" 
                desc="Data is protected and verified with certified institutions." 
              />
              <FeatureCard 
                icon={<Globe size={32} />} 
                title="Universal Access" 
                desc="Connect to any facility in our network from any device." 
              />
            </SimpleGrid>
          </Container>
        </div>
      </main>
    </Box>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <Box className="text-center group px-6 flex flex-col items-center">
      <ThemeIcon 
        size={84} radius="32px" variant="light" color="blue"
        className="mb-8 bg-white border border-slate-100 text-blue-600 shadow-sm group-hover:scale-110 transition-transform duration-500"
      >
        {icon}
      </ThemeIcon>
      <Title order={4} className="text-xl font-bold text-[#1E293B] mb-4 tracking-tight">
        {title}
      </Title>
      <Text className="text-[#64748B] leading-relaxed font-medium text-[15px] max-w-[280px]">
        {desc}
      </Text>
    </Box>
  );
}