import React, { useState } from 'react';
import { Plus, Image as ImageIcon, Zap, Eraser, Move, Palette, Sparkles, ChevronRight, Crown } from 'lucide-react';
import { Project, ToolType } from '../types';
import BottomNav from '../components/BottomNav';
import ProjectCard from '../components/ProjectCard';
import { GradientIconContainer } from '../components/Icons';

interface HomeScreenProps {
  onCreateProject: (tool?: ToolType) => void;
  onOpenProject: (p: Project) => void;
  apiKeyValid: boolean;
  onRequestKey: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onCreateProject, onOpenProject, apiKeyValid, onRequestKey }) => {
  const [activeTab, setActiveTab] = useState('home');

  const recentProjects: Project[] = [
    { id: '1', title: 'Cyberpunk Portrait', date: '05/03/2023, 1:30 PM', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop', type: 'Edit' },
    { id: '2', title: 'Mountain Lake Edit', date: '05/03/2023, 1:30 PM', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=400&auto=format&fit=crop', type: 'Enhance' },
    { id: '3', title: 'Feline Fusion', date: '05/03/2023, 1:30 PM', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop', type: 'Morph' },
    { id: '4', title: 'Product Shot 01', date: '05/03/2023, 1:30 PM', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop', type: 'Cleanup' },
  ];

  return (
    <div className="flex flex-col h-full bg-ups-bg pb-20 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 flex justify-between items-center bg-gradient-to-b from-[#0F1016] to-transparent">
        <h1 className="text-xl font-medium tracking-tight text-gray-300">Unrestricted Pixel Studio</h1>
        <button 
          onClick={apiKeyValid ? undefined : onRequestKey}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${apiKeyValid ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
        >
          <Crown size={14} fill={apiKeyValid ? "currentColor" : "none"} />
          {apiKeyValid ? 'PRO ACTIVE' : 'GET PRO'}
        </button>
      </div>

      <div className="px-6 space-y-8">
        {/* Start New Project Card */}
        <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden p-6 flex flex-col items-center justify-center text-center group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 opacity-90 transition-opacity group-hover:opacity-100" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay" />
          
          <div className="relative z-10 flex flex-col items-center gap-3">
             <button 
               onClick={() => onCreateProject()}
               className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg hover:scale-105 transition-transform"
             >
                <Plus size={32} className="text-white" strokeWidth={3} />
             </button>
             <div>
               <h2 className="text-2xl font-bold text-white mb-1">Start New Project</h2>
               <p className="text-blue-100 text-sm">Select from camera or gallery</p>
             </div>
          </div>
          
          <div className="absolute bottom-4 right-4 bg-white/10 p-2 rounded-full">
            <ImageIcon size={20} className="text-white/80" />
          </div>
        </div>

        {/* Quick AI Tools */}
        <div>
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-bold text-white">Quick AI Tools</h2>
                <button className="text-xs text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800 hover:text-white transition-colors">View All</button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
                <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <GradientIconContainer 
                        colorFrom="#0EA5E9" colorTo="#3B82F6"
                        onClick={() => onCreateProject(ToolType.BG_REMOVE)}
                    >
                        <Eraser size={28} />
                    </GradientIconContainer>
                    <span className="text-[10px] text-center text-gray-300 w-20 leading-tight">AI Background Remove</span>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <GradientIconContainer 
                        colorFrom="#8B5CF6" colorTo="#D946EF"
                        onClick={() => onCreateProject(ToolType.UPSCALE)}
                    >
                        <Sparkles size={28} />
                    </GradientIconContainer>
                    <span className="text-[10px] text-center text-gray-300 w-20 leading-tight">AI Enhance</span>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <GradientIconContainer 
                        colorFrom="#14B8A6" colorTo="#06B6D4"
                        onClick={() => onCreateProject(ToolType.RETOUCH)}
                    >
                        <Zap size={28} fill="currentColor" />
                    </GradientIconContainer>
                    <span className="text-[10px] text-center text-gray-300 w-20 leading-tight">Object Eraser</span>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <GradientIconContainer 
                        colorFrom="#EC4899" colorTo="#F43F5E"
                        onClick={() => onCreateProject(ToolType.FLUX)}
                    >
                        <Move size={28} />
                    </GradientIconContainer>
                    <span className="text-[10px] text-center text-gray-300 w-20 leading-tight">AI Morph</span>
                </div>
                 <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <GradientIconContainer 
                        colorFrom="#EAB308" colorTo="#F97316"
                        onClick={() => onCreateProject(ToolType.STYLE)}
                    >
                        <Palette size={28} />
                    </GradientIconContainer>
                    <span className="text-[10px] text-center text-gray-300 w-20 leading-tight">Style Transfer</span>
                </div>
            </div>
        </div>

        {/* Recent Projects */}
        <div>
             <h2 className="text-lg font-bold text-white mb-4">Recent Projects</h2>
             <div className="grid grid-cols-2 gap-4">
                {recentProjects.map(project => (
                    <ProjectCard key={project.id} project={project} onClick={onOpenProject} />
                ))}
             </div>
        </div>
      </div>

      {/* Prompt Bar Placeholder */}
      <div className="mt-8 mx-6 bg-gray-900/80 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
         <div>
            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Prompt</p>
            <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                <div className="w-12 h-1.5 rounded-full bg-gray-700" />
            </div>
         </div>
         <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
            <ChevronRight size={16} className="text-gray-400" />
         </div>
      </div>
      
      <div className="h-10" /> {/* Spacer */}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default HomeScreen;