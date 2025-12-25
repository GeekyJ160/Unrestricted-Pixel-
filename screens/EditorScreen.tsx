
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Share, Undo2, Redo2, Wand2, Scissors, User, Sliders, Sticker, Type, Settings2, Download, AlertCircle, Loader2, ChevronRight, Palette as PaletteIcon, MonitorUp, Zap, Upload, ImageMinus, Eraser, Move, ExternalLink, X, PlusCircle, Ban, Sparkle } from 'lucide-react';
import { Project, ToolType } from '../types';
import { generateImageWithGemini, GenerationResult } from '../services/geminiService';

interface EditorScreenProps {
  project: Project;
  onBack: () => void;
  onExport: (p: Project) => void;
  apiKeyValid: boolean;
  initialTool?: ToolType;
}

const NEGATIVE_PRESETS = ['blur', 'text', 'watermark', 'low quality', 'deformed', 'cluttered'];
const STYLE_PRESETS = [
  { name: "Van Gogh", prompt: "in the style of Vincent van Gogh, post-impressionism, thick brushstrokes, starry swirls" },
  { name: "Cyberpunk", prompt: "cyberpunk aesthetic, neon lights, futuristic city, synthwave colors, high tech low life" },
  { name: "Watercolor", prompt: "watercolor painting style, soft edges, ethereal, artistic splashes, hand-painted texture" },
  { name: "Oil Painting", prompt: "classical oil painting, rich textures, Renaissance style, heavy impasto" },
  { name: "Anime", prompt: "modern anime art style, vibrant cel shading, high quality character design, Studio Ghibli inspired" },
  { name: "Pixel Art", prompt: "16-bit pixel art, retro gaming aesthetic, clean pixel clusters, vibrant limited palette" }
];

const EditorScreen: React.FC<EditorScreenProps> = ({ project, onBack, onExport, apiKeyValid, initialTool }) => {
  const [activeTool, setActiveTool] = useState<ToolType>(initialTool || ToolType.MAGIC);
  const [imageSrc, setImageSrc] = useState(project.image);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);
  
  // Adjustments State
  const [exposure, setExposure] = useState(0);
  const [contrast, setContrast] = useState(0);

  // Filters State
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [filterIntensity, setFilterIntensity] = useState(100);
  
  // Cutout / Eraser State
  const [eraserObject, setEraserObject] = useState('');

  // Upscale State
  const [upscaleFactor, setUpscaleFactor] = useState<2 | 4>(2);
  const [faceEnhance, setFaceEnhance] = useState(false);
  
  // Flux/Morph State
  const [fluxStrength, setFluxStrength] = useState(50);
  const [fluxSourceImage, setFluxSourceImage] = useState<string | null>(null);
  
  // Retouch State
  const [retouchSelection, setRetouchSelection] = useState('');

  // Style Transfer State
  const [stylePreset, setStylePreset] = useState('');
  const [styleReferenceImage, setStyleReferenceImage] = useState<string | null>(null);
  const [styleStrength, setStyleStrength] = useState(0.75);
  
  // Gemini State
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showNegative, setShowNegative] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styleFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTool) setActiveTool(initialTool);
  }, [initialTool]);

  useEffect(() => {
    if (activeTool === ToolType.FLUX && !fluxSourceImage) setFluxSourceImage(imageSrc);
  }, [activeTool, imageSrc]);

  const handleStyleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setStyleReferenceImage(e.target.result as string);
          setStylePreset(''); // Clear preset if user uploads custom
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApiResponse = (result: GenerationResult) => {
    setImageSrc(result.image);
    setGroundingLinks(result.links || []);
    setIsImageLoading(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
        const result = await generateImageWithGemini(prompt, imageSrc, undefined, negativePrompt);
        handleApiResponse(result);
    } catch (e: any) {
        setError(e.message || "Generation failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleBgRemove = async () => {
    setIsGenerating(true);
    setError(null);
    try {
        const result = await generateImageWithGemini("Remove the background entirely from the subject. Return only the subject with a clean isolated look.", imageSrc);
        handleApiResponse(result);
    } catch (e: any) {
        setError(e.message || "Background removal failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleStyleTransfer = async (presetPrompt?: string) => {
      const styleTarget = presetPrompt || stylePreset || prompt;
      if (!styleTarget && !styleReferenceImage) return;
      setIsGenerating(true);
      setError(null);
      try {
          let promptText = "";
          if (styleReferenceImage) {
            promptText = `Apply the artistic style from the Style Reference Image to this Target Image. Maintain the subject but transform the visual aesthetic. Prompt: ${prompt || 'Complete style transfer'}`;
          } else {
            promptText = `Re-imagine this image in the style of: ${styleTarget}. Maintain structural integrity while applying the style.`;
          }
          
          const result = await generateImageWithGemini(promptText, imageSrc, styleReferenceImage || undefined);
          handleApiResponse(result);
      } catch (e: any) {
          setError(e.message || "Style transfer failed.");
      } finally {
          setIsGenerating(false);
      }
  };

  const toggleNegativeTag = (tag: string) => {
    setNegativePrompt(prev => {
        const tags = prev.split(',').map(t => t.trim()).filter(t => t !== "");
        if (tags.includes(tag)) {
            return tags.filter(t => t !== tag).join(', ');
        } else {
            return [...tags, tag].join(', ');
        }
    });
  };

  const handleFluxGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
        const finalPrompt = `[AI Morph] Target: ${prompt}. Strength: ${fluxStrength}%. Seamlessly transform the content while maintaining the core structure.`;
        const result = await generateImageWithGemini(finalPrompt, fluxSourceImage || imageSrc);
        handleApiResponse(result);
    } catch (e: any) {
        setError(e.message || "Morphing failed.");
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleRetouch = async () => {
    if (!prompt.trim() || !retouchSelection.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
        const finalPrompt = `Retouching: In the area of "${retouchSelection}", apply this change: "${prompt}". Blend perfectly.`;
        const result = await generateImageWithGemini(finalPrompt, imageSrc);
        handleApiResponse(result);
    } catch (e: any) {
        setError(e.message || "Retouch failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleErase = async () => {
    if (!eraserObject.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
        const promptText = `Identify and completely remove "${eraserObject}". Use surrounding context to fill the area naturally.`;
        const result = await generateImageWithGemini(promptText, imageSrc);
        handleApiResponse(result);
    } catch (e: any) {
        setError(e.message || "Removal failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleUpscale = async () => {
     setIsGenerating(true);
     setError(null);
     try {
         const enhancementPrompt = `Upscale this image to high definition (${upscaleFactor}x). ${faceEnhance ? 'Enhance all facial features for clarity.' : 'Maintain all original artistic details while sharpening.'}`;
         const result = await generateImageWithGemini(enhancementPrompt, imageSrc);
         handleApiResponse(result);
     } catch(e: any) {
         setError(e.message || "Upscaling failed");
     } finally {
         setIsGenerating(false);
     }
  };

  const getCombinedStyle = () => {
    let styleString = `brightness(${100 + exposure}%) contrast(${100 + contrast}%)`;
    const preset = FILTER_PRESETS.find(p => p.id === selectedFilter);
    if (preset && preset.filter) styleString += ` ${preset.filter(filterIntensity)}`;
    return { filter: styleString };
  };

  const FILTER_PRESETS = [
    { id: 'original', name: 'Original', filter: null },
    { id: 'bw', name: 'B&W', filter: (i: number) => `grayscale(${i}%)` },
    { id: 'noir', name: 'Noir', filter: (i: number) => `grayscale(100%) contrast(${100 + i * 0.5}%) brightness(${100 - i * 0.2}%)` },
    { id: 'sepia', name: 'Sepia', filter: (i: number) => `sepia(${i}%)` },
    { id: 'vintage', name: 'Vintage', filter: (i: number) => `sepia(${i * 0.5}%) contrast(${100 + i * 0.2}%) brightness(${100 - i * 0.05}%)` },
    { id: 'cinematic', name: 'Cinema', filter: (i: number) => `contrast(${100 + i * 0.2}%) saturate(${100 - i * 0.1}%) sepia(${i * 0.2}%)` },
  ];

  const tools = [
    { id: ToolType.MAGIC, icon: Wand2, label: 'AI Magic', color: 'text-cyan-400', bg: 'bg-cyan-400/20 border-cyan-400/50', description: 'Smart creative edits' },
    { id: ToolType.BG_REMOVE, icon: ImageMinus, label: 'Bg Remove', color: 'text-blue-400', bg: 'bg-blue-400/20 border-blue-400/50', description: 'Auto cut-out' },
    { id: ToolType.FLUX, icon: Move, label: 'AI Morph', color: 'text-pink-500', bg: 'bg-pink-500/20 border-pink-500/50', description: 'Advanced AI morphing' },
    { id: ToolType.UPSCALE, icon: MonitorUp, label: 'Upscale', color: 'text-purple-400', bg: 'bg-purple-400/20 border-purple-400/50', description: 'Super Resolution' },
    { id: ToolType.STYLE, icon: PaletteIcon, label: 'Style', color: 'text-amber-400', bg: 'bg-amber-400/20 border-amber-400/50', description: 'Style Transfer' },
    { id: ToolType.CUTOUT, icon: Eraser, label: 'Eraser', color: 'text-red-400', bg: 'bg-red-400/20 border-red-400/50', description: 'Object Eraser' },
    { id: ToolType.RETOUCH, icon: User, label: 'Retouch', color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/20 border-fuchsia-400/50', description: 'Generative Retouching' },
    { id: ToolType.FILTERS, icon: PaletteIcon, label: 'Filters', color: 'text-indigo-400', bg: 'bg-indigo-400/20 border-indigo-400/50', description: 'Color filters' },
    { id: ToolType.ADJUST, icon: Sliders, label: 'Adjust', color: 'text-gray-200', bg: 'bg-gray-700/50 border-gray-500/50', description: 'Color tweaks' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#05050A]">
      {/* Top Bar */}
      <div className="h-14 px-4 flex items-center justify-between bg-[#05050A] z-10 border-b border-gray-900">
         <button onClick={onBack} className="p-2 text-gray-400 hover:text-white"><ChevronLeft size={24} /></button>
         <div className="flex gap-4">
            <button className="p-2 text-gray-400 hover:text-white"><Undo2 size={20} /></button>
            <button className="p-2 text-gray-400 hover:text-white"><Redo2 size={20} /></button>
         </div>
         <button onClick={() => onExport({ ...project, image: imageSrc })} className="flex items-center gap-2 bg-blue-600 px-4 py-1.5 rounded-full text-sm font-medium">
            Next <ChevronRight size={14} />
         </button>
      </div>

      {/* Workspace */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-6 bg-[#05050A]">
         <div className="relative flex items-center justify-center w-full h-full max-h-[70vh]">
             {isGenerating && (
                <div className="absolute z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                    <Loader2 size={48} className="text-cyan-400 animate-spin mb-4" />
                    <p className="text-cyan-100 font-bold tracking-widest text-sm uppercase">Gemini Processing...</p>
                </div>
             )}
             
             <img 
                src={imageSrc} 
                alt="Canvas" 
                className={`max-w-full max-h-full object-contain shadow-2xl transition-all duration-500 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                style={getCombinedStyle()}
                onLoad={() => setIsImageLoading(false)}
             />
         </div>

         {/* Grounding Links */}
         {groundingLinks.length > 0 && (
            <div className="w-full max-w-md mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl animate-slide-up">
                <p className="text-[10px] text-blue-400 font-bold uppercase mb-2 flex items-center gap-1">
                    <Zap size={10} /> AI Search Grounding Sources
                </p>
                <div className="flex flex-wrap gap-2">
                    {groundingLinks.map((link, idx) => (
                        <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/10 flex items-center gap-1 text-gray-300 transition-colors">
                            {link.title} <ExternalLink size={8} />
                        </a>
                    ))}
                </div>
            </div>
         )}
         
         {error && (
            <div className="absolute top-4 bg-red-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm z-30 animate-bounce">
                <AlertCircle size={16} /> {error}
                <button onClick={() => setError(null)} className="ml-2">✕</button>
            </div>
         )}
      </div>

      {/* Controls */}
      <div className="bg-[#0A0A12] border-t border-gray-900">
        {/* Dynamic Panels */}
        <div className="overflow-hidden">
            {activeTool === ToolType.MAGIC && (
                <div className="px-6 py-4 animate-slide-up bg-cyan-900/10 border-b border-white/5 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                         <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-1">
                            <Sparkle size={12} className="text-cyan-400" /> AI Creative Prompt
                         </span>
                         <button 
                            onClick={() => setShowNegative(!showNegative)}
                            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${showNegative ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400'}`}
                         >
                            <Ban size={10} /> {showNegative ? 'Hide Exclusions' : 'Add Exclusions'}
                         </button>
                    </div>
                    
                    <div className="flex gap-2">
                        <input 
                            type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe what to ADD or CHANGE..."
                            className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none placeholder:text-gray-600"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button onClick={handleGenerate} disabled={isGenerating || !prompt} className="bg-cyan-600 px-5 rounded-xl text-sm font-bold disabled:opacity-50">Go</button>
                    </div>

                    {showNegative && (
                        <div className="animate-slide-down space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 ml-1 uppercase">
                                <Ban size={12} /> Exclude from Generation
                            </div>
                            <input 
                                type="text" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="E.g. blur, low quality, watermarks, text..."
                                className="w-full bg-black/40 border border-red-900/30 rounded-xl px-4 py-2.5 text-xs focus:border-red-500 outline-none placeholder:text-red-900/30"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {NEGATIVE_PRESETS.map(tag => (
                                    <button 
                                        key={tag} 
                                        onClick={() => toggleNegativeTag(tag)}
                                        className={`text-[9px] px-2 py-1 rounded border transition-all ${negativePrompt.includes(tag) ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/10 text-gray-500 hover:border-red-500/50 hover:text-red-300'}`}
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {activeTool === ToolType.BG_REMOVE && (
                <div className="px-6 py-4 animate-slide-up bg-blue-900/10 border-b border-white/5">
                    <button onClick={handleBgRemove} disabled={isGenerating} className="w-full bg-blue-600 py-3 rounded-xl font-bold text-sm">Remove Background Now</button>
                </div>
            )}
            {activeTool === ToolType.STYLE && (
                <div className="px-6 py-4 animate-slide-up bg-amber-900/10 border-b border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                            <PaletteIcon size={12} /> Style Presets
                        </span>
                        <div className="flex gap-2">
                           <input 
                                type="file" ref={styleFileInputRef} className="hidden" accept="image/*"
                                onChange={handleStyleImageUpload}
                           />
                           <button 
                                onClick={() => styleFileInputRef.current?.click()}
                                className="flex items-center gap-1.5 text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-amber-200"
                           >
                                <Upload size={12} /> {styleReferenceImage ? 'Change Ref' : 'Upload Ref'}
                           </button>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {STYLE_PRESETS.map(s => (
                            <button 
                                key={s.name} 
                                onClick={() => { 
                                    setStylePreset(s.name); 
                                    setStyleReferenceImage(null); 
                                    handleStyleTransfer(s.prompt);
                                }} 
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${stylePreset === s.name ? 'bg-amber-500 text-black border-amber-300' : 'bg-gray-800 text-gray-400 border-white/5 hover:border-amber-500/50 hover:text-white'}`}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>

                    {styleReferenceImage && (
                        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-amber-500/50">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-amber-500">
                                 <img src={styleReferenceImage} className="w-full h-full object-cover" />
                                 <button 
                                    onClick={() => setStyleReferenceImage(null)}
                                    className="absolute top-0 right-0 bg-black/60 p-0.5 rounded-bl text-white hover:bg-red-500"
                                 >
                                    <X size={8} />
                                 </button>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-amber-400 uppercase">Style Reference Loaded</p>
                                <p className="text-[9px] text-gray-500">Click Apply to transfer visual aesthetic</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input 
                            type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                            placeholder={styleReferenceImage ? "Fine-tune style (optional)..." : "Describe custom style..."}
                            className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none"
                        />
                        <button 
                            onClick={() => handleStyleTransfer()} 
                            disabled={isGenerating || (!stylePreset && !styleReferenceImage && !prompt)} 
                            className="bg-amber-600 px-6 rounded-xl text-sm font-bold disabled:opacity-50 text-white"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
            {activeTool === ToolType.UPSCALE && (
                <div className="px-6 py-4 animate-slide-up bg-purple-900/10 border-b border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400">Resolution</span>
                        <div className="flex bg-gray-800 p-1 rounded-lg">
                            {[2, 4].map(s => (
                                <button key={s} onClick={() => setUpscaleFactor(s as 2|4)} className={`px-6 py-1 rounded-md text-xs font-bold ${upscaleFactor === s ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>{s}x</button>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleUpscale} disabled={isGenerating} className="w-full bg-purple-600 py-3 rounded-xl font-bold text-sm text-white">Apply Super Res</button>
                </div>
            )}
            {activeTool === ToolType.FLUX && (
                <div className="px-6 py-4 animate-slide-up bg-pink-900/10 border-b border-white/5 space-y-3">
                    <input 
                        type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Morph to what? (e.g. Robot, Gold)"
                        className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-pink-500 outline-none"
                    />
                    <div className="flex items-center gap-4">
                        <input type="range" min="0" max="100" value={fluxStrength} onChange={e => setFluxStrength(parseInt(e.target.value))} className="flex-1 accent-pink-500 h-1 bg-gray-700 rounded" />
                        <span className="text-xs text-pink-400 font-bold">{fluxStrength}%</span>
                    </div>
                    <button onClick={handleFluxGenerate} disabled={isGenerating || !prompt} className="w-full bg-pink-600 py-3 rounded-xl font-bold text-sm text-white">Morph Content</button>
                </div>
            )}
            {activeTool === ToolType.ADJUST && (
                <div className="px-6 py-4 animate-slide-up space-y-3">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-gray-400 w-12">Exp</span>
                        <input type="range" min="-50" max="50" value={exposure} onChange={e => setExposure(parseInt(e.target.value))} className="flex-1 accent-cyan-400 h-1" />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-gray-400 w-12">Con</span>
                        <input type="range" min="-50" max="50" value={contrast} onChange={e => setContrast(parseInt(e.target.value))} className="flex-1 accent-purple-400 h-1" />
                    </div>
                </div>
            )}
            {activeTool === ToolType.FILTERS && (
                <div className="px-6 py-4 animate-slide-up flex gap-3 overflow-x-auto no-scrollbar">
                    {FILTER_PRESETS.map(f => (
                        <button key={f.id} onClick={() => setSelectedFilter(f.id)} className={`flex flex-col items-center gap-1 ${selectedFilter === f.id ? 'scale-110' : 'opacity-60'}`}>
                            <div className={`w-12 h-12 rounded border-2 ${selectedFilter === f.id ? 'border-indigo-500' : 'border-transparent'} overflow-hidden`}>
                                <img src={imageSrc} className="w-full h-full object-cover" style={{filter: f.filter ? f.filter(100) : 'none'}} />
                            </div>
                            <span className="text-[8px] uppercase tracking-tighter text-gray-400">{f.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Main Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-4 bg-black/40">
            {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id as ToolType)}
                        className={`flex flex-col items-center justify-center min-w-[72px] h-[72px] rounded-2xl transition-all duration-300 ${
                            isActive ? `${tool.bg} scale-105 shadow-lg` : 'opacity-40 hover:opacity-100'
                        }`}
                    >
                        <div className={`mb-1 transition-colors ${isActive ? tool.color : 'text-gray-400'}`}>
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                        </div>
                        <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{tool.label}</span>
                    </button>
                )
            })}
        </div>
      </div>
      
      <style>{`
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-down { animation: slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-down {
            from { transform: translateY(-10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default EditorScreen;
