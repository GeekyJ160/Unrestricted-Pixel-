
import React from 'react';
import { Camera } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div 
        className="flex flex-col items-center justify-center h-full w-full bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
            <div className="relative">
                <Camera size={64} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" strokeWidth={1.5} />
                <div className="absolute -right-2 -bottom-2 bg-ups-purple text-white text-xs font-bold px-1.5 py-0.5 rounded">AI</div>
            </div>
            <div className="ml-4">
                <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                    UPS
                </h1>
            </div>
        </div>
        
        <h2 className="text-xl font-medium text-gray-200 tracking-wide mb-12">Unrestricted Pixel Studio</h2>

        {/* Loader */}
        <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 w-1/2 animate-[shimmer_1.5s_infinite_linear]" style={{ backgroundSize: '200% 100%' }} />
        </div>
        <p className="text-xs text-gray-500 animate-pulse">Loading assets...</p>
      </div>

        {/* Decorative lines */}
        <div className="absolute bottom-0 w-full h-1/3 opacity-20 pointer-events-none">
             <div className="absolute bottom-0 left-1/4 w-px h-full bg-gradient-to-t from-cyan-500 to-transparent" />
             <div className="absolute bottom-0 right-1/4 w-px h-full bg-gradient-to-t from-purple-500 to-transparent" />
        </div>
        
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
    </div>
  );
};

export default LoadingScreen;
