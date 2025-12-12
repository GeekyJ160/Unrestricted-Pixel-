import React from 'react';
import { Home, PenTool, Layout, Bookmark, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tools', icon: PenTool, label: 'Tools' },
    { id: 'templates', icon: Layout, label: 'Templates' },
    { id: 'saved', icon: Bookmark, label: 'Saved' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#0A0A12]/95 backdrop-blur-md border-t border-white/10 pb-6 pt-3 px-6 flex justify-between items-center z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-cyan-400' : 'text-gray-500'}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
            {isActive && <div className="absolute -top-3 w-8 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_#06B6D4]" />}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
