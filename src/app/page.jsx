"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Ticket, Clock, ShieldCheck, HeartHandshake, Globe, Activity 
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import { 
  Box, Text, Stack, Group, Title, Container, Button, ThemeIcon, SimpleGrid 
} from '@mantine/core';

const QueueCareLogo = () => (
  <Group gap="xs" wrap="nowrap" style={{ pointerEvents: 'none' }}>
    <Box 
      style={{ 
        width: '40px', height: '40px', backgroundColor: '#2563EB', borderRadius: '50%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
      }}
    >
      <Activity size={22} color="white" strokeWidth={2.5} />
    </Box>
    <Text 
      span 
      style={{ 
        fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '22px', fontWeight: 800, 
        letterSpacing: '-0.02em', color: 'inherit', textTransform: 'uppercase', 
        lineHeight: 1, display: 'inline-block'
      }}
    >
      QUEUECARE
    </Text>
  </Group>
);

export default function IndexPage() {
  const router = useRouter();

  return (
    <Box className="min-h-screen bg-[#FDFDFD] flex flex-col antialiased overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <Navbar user={null} /> 

      <main className="flex-1 z-10">
        {/* SECTION 1: HERO (ปุ่มคู่ขนานเพื่อความสมมาตร) */}
        <Box className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[65vh] bg-[#F1F5F9] -z-10" 
               style={{ borderBottomLeftRadius: '10% 100%', borderBottomRightRadius: '10% 100%' }} />
          
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

                {/* FIXED: แสดงทั้ง 2 ปุ่มคู่กันเสมอเพื่อความสมมาตรและอิสระในการใช้งาน */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 w-full px-4 sm:px-0">
                  <Button 
                    fullWidth 
                    size="xl" radius="md" 
                    onClick={() => router.push('/join')}
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
                    leftSection={<Ticket size={24} className="text-blue-600" />}>
                    คิวของฉัน
                  </Button>
                </div>
              </div>

              <div className="w-full lg:w-1/2 flex justify-center px-4">
                <Box className="relative w-full max-w-[540px] aspect-[4/3] rounded-[40px] overflow-hidden bg-white shadow-2xl border-[12px] border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000" 
                    alt="Clinic" className="w-full h-full object-cover"
                  />
                  <Box className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                </Box>
              </div>
            </div>
          </Container>
        </Box>

        {/* SECTION 2: FEATURES (สมมาตรกึ่งกลาง) */}
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
              <FeatureCard icon={<Clock size={32} />} title="Time Precision" desc="Accurate wait estimates based on real workstation data." />
              <FeatureCard icon={<ShieldCheck size={32} />} title="Verified Security" desc="Data is protected and verified with certified institutions." />
              <FeatureCard icon={<Globe size={32} />} title="Universal Access" desc="Connect to any facility in our network from any device." />
            </SimpleGrid>
          </Container>
        </div>
      </main>
      
      <footer className="bg-[#0F172A] pt-24 pb-12 text-white">
        <Container size="lg">
          <div className="flex flex-col items-center text-center gap-10">
            <div className="opacity-90">
            </div>
          </div>
        </Container>
      </footer>
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
      <Title order={4} className="text-xl font-bold text-[#1E293B] mb-4 tracking-tight">{title}</Title>
      <Text className="text-[#64748B] leading-relaxed font-medium text-[15px] max-w-[280px]">{desc}</Text>
    </Box>
  );
}