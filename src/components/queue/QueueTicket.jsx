import React from 'react';
import { Clock, UserPlus, ArrowRightLeft, MoreVertical } from 'lucide-react';

export default function QueueTicket({ id, name, waitTime, status, issue }) {
  const isCritical = status === 'critical';

  return (
    <div className={`
      relative overflow-hidden bg-cardBg border p-5 rounded-2xl flex items-center justify-between group transition-all duration-300
      ${isCritical ? 'border-heartRed/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'border-gray-800 hover:border-gray-600'}
    `}>
      {/* Left Decoration for Critical */}
      {isCritical && <div className="absolute left-0 top-0 bottom-0 w-1 bg-heartRed shadow-[2px_0_10px_rgba(239,68,68,0.5)]" />}

      <div className="flex items-center gap-8">
        {/* Ticket ID */}
        <div className={`text-4xl font-black tracking-tighter ${isCritical ? 'text-heartRed' : 'text-healthGreen'}`}>
          {id}
        </div>

        {/* Patient Info */}
        <div>
          <div className="flex items-center gap-3">
            <h5 className="text-lg font-bold text-white">{name}</h5>
            {isCritical && (
              <span className="text-[10px] px-2 py-0.5 bg-heartRed/20 text-heartRed border border-heartRed/30 rounded uppercase font-black animate-pulse">
                High Priority
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Clock size={14} className={isCritical ? 'text-heartRed' : 'text-healthGreen'} />
              Waiting {waitTime}
            </span>
            <span className="text-xs bg-white/5 px-2 py-0.5 rounded text-gray-400 font-bold uppercase tracking-tighter">
              {issue}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
          <button title="Call Next" className="h-11 w-11 bg-healthGreen text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-healthGreen/20">
            <UserPlus size={20} />
          </button>
          <button title="Transfer" className="h-11 w-11 bg-white/5 text-gray-400 hover:text-white rounded-xl flex items-center justify-center border border-gray-800 hover:border-gray-600 transition-all">
            <ArrowRightLeft size={20} />
          </button>
        </div>
        <button className="text-gray-600 hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}