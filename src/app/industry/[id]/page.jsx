import React from 'react';
import { ChevronRight, UserPlus, ArrowRightLeft, Clock } from 'lucide-react';

export default function QueuePage() {
  const subSections = ['General Health', 'Heart Disease', 'Bone Treatment', 'Neurology'];
  
  const currentQueue = [
    { id: 'A006', name: 'John Doe', time: '12m', status: 'critical', detail: 'Chest Pain' },
    { id: 'A007', name: 'Sarah Connor', time: '4m', status: 'stable', detail: 'General Checkup' },
    { id: 'A008', name: 'Mike Ross', time: '2m', status: 'stable', detail: 'Follow-up' },
  ];

  return (
    <div className="flex flex-1 bg-[#05070a] text-white">
      {/* Left Column: Sub-sections List */}
      <nav className="w-72 border-r border-gray-800 p-6 flex flex-col gap-2">
        <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4">Sub-Sections</h3>
        {subSections.map((name) => (
          <button key={name} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group flex justify-between items-center">
            {name}
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100" />
          </button>
        ))}
      </nav>

      {/* Right Column: Live Queue Area */}
      <section className="flex-1 p-8">
        <header className="flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#10B981] font-bold uppercase tracking-widest mb-2">
              <span>Apex Cardiology</span>
              <ChevronRight size={12} />
              <span className="text-white">Heart Disease</span>
            </div>
            <h2 className="text-3xl font-bold">Queue Monitor</h2>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#11141b] border border-gray-800 px-6 py-3 rounded-2xl text-center">
              <p className="text-[10px] text-gray-500 uppercase font-black">Total Waiting</p>
              <p className="text-xl font-bold text-white">12</p>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 px-6 py-3 rounded-2xl text-center">
              <p className="text-[10px] text-rose-500 uppercase font-black">Critical</p>
              <p className="text-xl font-bold text-rose-500">2</p>
            </div>
          </div>
        </header>

        {/* Live Queue Cards */}
        <div className="space-y-3">
          {currentQueue.map((patient) => (
            <div 
              key={patient.id} 
              className={`bg-[#11141b] border p-5 rounded-2xl flex items-center justify-between group transition-all ${
                patient.status === 'critical' ? 'border-rose-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-8">
                <div className={`text-4xl font-black ${patient.status === 'critical' ? 'text-rose-500' : 'text-[#10B981]'}`}>
                  {patient.id}
                </div>
                <div>
                  <h5 className="text-lg font-bold flex items-center gap-2">
                    {patient.name}
                    {patient.status === 'critical' && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />}
                  </h5>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={14}/> {patient.time}</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] uppercase font-bold tracking-wider">{patient.detail}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Visible on Hover */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="h-12 w-12 bg-white/5 hover:bg-[#10B981] hover:text-black rounded-xl flex items-center justify-center transition-all">
                  <UserPlus size={20} />
                </button>
                <button className="h-12 w-12 bg-white/5 hover:bg-blue-500 hover:text-black rounded-xl flex items-center justify-center transition-all">
                  <ArrowRightLeft size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}