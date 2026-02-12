import React from 'react';
import { ChevronRight, Search, User } from 'lucide-react';

export default function Navbar({ industryName, sectionName }) {
  return (
    <header className="h-20 border-b border-gray-800 bg-darkBg/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500 hover:text-white cursor-pointer transition-colors">Industries</span>
        <ChevronRight size={14} className="text-gray-600" />
        <span className="text-gray-500 hover:text-white cursor-pointer transition-colors">{industryName}</span>
        {sectionName && (
          <>
            <ChevronRight size={14} className="text-gray-600" />
            <span className="text-healthGreen font-bold uppercase tracking-wider">{sectionName}</span>
          </>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-healthGreen transition-colors" />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            className="bg-cardBg border border-gray-800 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-healthGreen transition-all w-64"
          />
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-healthGreen to-blue-500 p-[2px] cursor-pointer">
          <div className="w-full h-full rounded-full bg-darkBg flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}