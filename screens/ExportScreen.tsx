import React, { useState } from 'react';
import { ChevronLeft, MoreHorizontal, Instagram, Facebook, Twitter, Mail, Check, Copy } from 'lucide-react';
import { Project } from '../types';

interface ExportScreenProps {
  project: Project;
  onBack: () => void;
  onHome: () => void;
}

const ExportScreen: React.FC<ExportScreenProps> = ({ project, onBack, onHome }) => {
  const [format, setFormat] = useState<'JPEG' | 'PNG' | 'HEIC'>('JPEG');
  const [resolution, setResolution] = useState('High (4K)');
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#05050A]">
       {/* Header */}
       <div className="h-14 px-4 flex items-center justify-between border-b border-gray-900">
         <button onClick={onBack} className="flex items-center gap-1 text-blue-500 font-medium">
            <ChevronLeft size={20} />
            Back
         </button>
         <h1 className="text-white font-medium">Share & Export</h1>
         <button onClick={onHome} className="text-blue-500 font-medium">Done</button>
       </div>

       <div className="flex-1 overflow-y-auto p-6 pb-20 no-scrollbar">
          {/* Preview */}
          <div className="flex justify-center mb-8">
             <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <img src={project.image} alt="Final" className="w-full h-full object-cover" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
                {!removeWatermark && (
                     <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-gray-300">
                        <span className="font-bold text-cyan-400">UPS</span> Studio
                     </div>
                )}
             </div>
          </div>

          {/* Quick Actions */}
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-1">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
             <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-colors">
                <DownloadIcon />
                Save to Photos
             </button>
             <button 
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-colors border border-gray-700"
             >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied' : 'Copy to Clipboard'}
             </button>
          </div>

          {/* Share Grid */}
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-1">Share To</h3>
          <div className="bg-[#12121A] rounded-2xl p-4 grid grid-cols-5 gap-4 mb-8">
              <ShareBtn icon={Instagram} label="Instagram" color="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" />
              <ShareBtn icon={TikTokIcon} label="TikTok" color="bg-black border border-gray-700" />
              <ShareBtn icon={SnapchatIcon} label="Snapchat" color="bg-yellow-400 text-black" />
              <ShareBtn icon={Facebook} label="Facebook" color="bg-blue-600" />
              <ShareBtn icon={MoreHorizontal} label="More" color="bg-gray-700" />
          </div>

          {/* Export Options */}
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-1">Export Options</h3>
          <div className="bg-[#12121A] rounded-2xl overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <span className="text-sm font-medium">Format</span>
                <div className="flex bg-gray-900 rounded-lg p-1">
                   {(['JPEG', 'PNG', 'HEIC'] as const).map(f => (
                       <button 
                         key={f}
                         onClick={() => setFormat(f)}
                         className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${format === f ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                       >
                         {f}
                       </button>
                   ))}
                </div>
             </div>
             <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <span className="text-sm font-medium">Resolution</span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                    {resolution} <ChevronLeft size={16} className="-rotate-90" />
                </span>
             </div>
             <div className="flex items-center justify-between p-4">
                <span className="text-sm font-medium">Remove Watermark</span>
                <button 
                    onClick={() => setRemoveWatermark(!removeWatermark)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${removeWatermark ? 'bg-green-500' : 'bg-gray-700'}`}
                >
                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${removeWatermark ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
             </div>
          </div>
          
          {/* Pro Banner */}
          {!removeWatermark && (
            <div className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                        U
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">UPS: Unrestricted</h4>
                        <p className="text-xs text-gray-400">Pixel Studio Pro</p>
                    </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                    Get UPS Pro
                </button>
            </div>
          )}
       </div>
    </div>
  );
};

// Icons specific to this screen
const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
)

const TikTokIcon = ({size=24, ...props}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" {...props}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.62-1.12v8.76c-.52 4.03-3.35 6.83-7.35 7.28-3.73.23-7.15-2.22-7.85-5.85-.7-3.63 1.25-7.39 4.88-8.23.47-.11.95-.16 1.43-.18v4.06c-.46.03-.94.02-1.37.2-1.46.61-2.21 2.36-1.6 3.86.6 1.5 2.36 2.21 3.86 1.6 1.14-.46 1.75-1.57 1.78-2.78V.02z"/></svg>
)

const SnapchatIcon = ({size=24, ...props}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12.06 2.75c-2.45 0-4.63 1.94-5.02 4.19-.08.46-.38.74-.75.76-.7.04-1.3.47-1.48 1.14-.14.52.09 1.09.58 1.34.42.22.42.54.34.8-.08.26-.35.53-.88.63-.58.11-1.03.62-1.03 1.23 0 .49.33.91.75 1.11 1.25.59 1.21 1.66 1.2 1.83 0 .47.23.94.75 1.18.3.14.49.26.54.43.08.31-.24.79-1.2 1.29-.68.35-1.13 1.05-1.14 1.81 0 1.27 1.55 1.74 2.65 1.74.88 0 1.56-.27 2.1-.64.5-.33 1.12-.52 1.72-.5.58-.02 1.2.17 1.69.5.54.37 1.21.64 2.08.64 1.09 0 2.62-.47 2.64-1.74 0-.76-.45-1.46-1.13-1.81-.95-.49-1.26-.97-1.18-1.29.05-.17.23-.29.53-.43.51-.23.74-.7.74-1.17 0-.17-.05-1.23 1.19-1.83.42-.2.74-.62.74-1.1 0-.62-.45-1.12-1.02-1.23-.53-.1-.8-.37-.87-.63-.09-.26-.08-.58.33-.8.49-.25.72-.82.58-1.34-.18-.67-.78-1.1-1.48-1.14-.37-.02-.67-.3-.75-.76-.4-2.25-2.58-4.19-5.03-4.19z"/></svg>
)

const ShareBtn: React.FC<{ icon: any, label: string, color: string }> = ({ icon: Icon, label, color }) => (
    <button className="flex flex-col items-center gap-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} shadow-lg hover:scale-110 transition-transform`}>
            <Icon size={24} className="text-white" />
        </div>
        <span className="text-[10px] text-gray-400">{label}</span>
    </button>
)

export default ExportScreen;