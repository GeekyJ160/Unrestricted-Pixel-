import React from 'react';
import { LucideProps } from 'lucide-react';

export const GradientIconContainer: React.FC<{ children: React.ReactNode; colorFrom: string; colorTo: string; onClick?: () => void }> = ({ children, colorFrom, colorTo, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95`}
      style={{
        background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
        boxShadow: `0 4px 15px -3px ${colorFrom}80`
      }}
    >
      <div className="text-white">
        {children}
      </div>
      {/* Glossy overlay */}
      <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
    </div>
  );
};
