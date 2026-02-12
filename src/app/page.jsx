import React from 'react';
import { Search, Plus, Building2 } from 'lucide-react';

const StatCard = ({ label, value, trend, colorClass }) => (
  <div className="bg-[#11141b] border border-gray-800 p-5 rounded-2xl">
    <p className="text-gray-500 text-sm mb-1">{label}</p>
    <div className="flex items-baseline gap-3">
      <h4 className={`text-2xl font-bold ${colorClass}`}>{value}</h4>
      {trend && <span className="text-xs text-emerald-500">{trend}</span>}
    </div>
  </div>
);

export default function Dashboard() {
  const industries = [
    { name: 'Apex Cardiology', load: 78, status: 'Active' },
    { name: 'City Dental', load: 45, status: 'Active' },
    { name: 'Sunrise Pediatrics', load: 92, status: 'Critical' }
  ];

  return (
    <main className="flex-1 bg-[#05070a] p-8 text-white min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Industry Ecosystem</h2>
          <p className="text-gray-500 font-medium">Monitoring all medical units</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              placeholder="Search industries..." 
              className="bg-[#11141b] border border-gray-800 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-[#10B981] transition-colors"
            />
          </div>
          <button className="bg-[#10B981] hover:bg-emerald-400 text-black font-bold py-2 px-6 rounded-lg flex items-center gap-2">
            <Plus size={20} /> Create New
          </button>
        </div>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Active Queues" value="145" trend="↑ 12%" colorClass="text-white" />
        <StatCard label="Avg. Wait Time" value="24m" trend="↓ 5%" colorClass="text-blue-400" />
        <StatCard label="Critical Loads" value="7" colorClass="text-[#EF4444]" />
        <StatCard label="System Health" value="98%" colorClass="text-[#10B981]" />
      </div>

      {/* Industry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {industries.map((item, i) => (
          <div key={i} className="bg-[#11141b] border border-gray-800 p-6 rounded-2xl hover:border-[#10B981]/50 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#10B981]/10">
                <Building2 className="text-[#10B981]" />
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                item.status === 'Critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-[#10B981]/10 text-[#10B981]'
              }`}>
                {item.status}
              </span>
            </div>
            <h4 className="text-xl font-bold mb-4">{item.name}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-gray-500">
                <span>Current Load</span>
                <span>{item.load}%</span>
              </div>
              <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${item.load > 80 ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
                  style={{ width: `${item.load}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}