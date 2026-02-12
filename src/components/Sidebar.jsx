import React from 'react';
import { LayoutDashboard, Building2, Users, Settings, Bell } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
    { icon: <Building2 size={20} />, label: 'Industries', active: false },
    { icon: <Users size={20} />, label: 'Staff', active: false },
    { icon: <Settings size={20} />, label: 'Settings', active: false },
  ];

  return (
    <aside className="w-64 h-screen bg-[#0a0c10] border-r border-gray-800 flex flex-col p-6 sticky top-0">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center">
          <span className="text-black font-bold">+</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">HealthQueue</h1>
      </div>
      
      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              item.active 
                ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer Nav */}
      <div className="mt-auto pt-6 border-t border-gray-800">
        <button className="flex items-center gap-3 text-gray-400 hover:text-white px-2">
          <Bell size={20} />
          <span>Notifications</span>
        </button>
      </div>
    </aside>
  );
}