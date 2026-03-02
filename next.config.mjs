/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // 🎯 ดักทุกอย่างที่ยิงมาที่ /api/v1
        source: '/api/v1/:path*',
        // 🚀 ส่งต่อไปที่ URL จริง โดยเติม /api/v1 เข้าไปข้างหน้า path ที่เหลือ
        destination: 'https://queuecaredev.vercel.app/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;