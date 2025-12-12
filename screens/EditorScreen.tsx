
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Share, Undo2, Redo2, Wand2, Scissors, User, Sliders, Sticker, Type, Settings2, Download, AlertCircle, Loader2, ChevronRight, Palette as PaletteIcon, MonitorUp, Zap, Upload, ImageMinus, Eraser, Move } from 'lucide-react';
import { Project, ToolType } from '../types';
import { generateImageWithGemini } from '../services/geminiService';

interface EditorScreenProps {
  project: Project;
  onBack: () => void;
  onExport: (p: Project) => void;
  apiKeyValid: boolean;
  initialTool?: ToolType;
}

const EditorScreen: React.FC<EditorScreenProps> = ({ project, onBack, onExport, apiKeyValid, initialTool }) => {
  const [activeTool, setActiveTool] = useState<ToolType>(initialTool || ToolType.MAGIC);
  const [imageSrc, setImageSrc] = useState(project.image);
  const [isImageLoading, setIsImageLoading] = useState(true);
  
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
  const [loraRepo, setLoraRepo] = useState('');
  const [loraScale, setLoraScale] = useState(0.8);
  const [styleStrength, setStyleStrength] = useState(0.75);
  
  // Gemini State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tooltip State
  const [tooltip, setTooltip] = useState<{x: number, y: number, label: string, desc: string} | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial tool if provided
  useEffect(() => {
    if (initialTool) {
        setActiveTool(initialTool);
        // Pre-fill prompt for certain quick actions if needed
        if (initialTool === ToolType.RETOUCH) {
            setPrompt("Remove this object");
        }
    }
  }, [initialTool]);

  // Sync Flux Source when entering tool
  useEffect(() => {
    if (activeTool === ToolType.FLUX && !fluxSourceImage) {
        setFluxSourceImage(imageSrc);
    }
  }, [activeTool, imageSrc]);

  // Filter Presets Definition
  const FILTER_PRESETS = [
    { id: 'original', name: 'Original', filter: null },
    { id: 'bw', name: 'B&W', filter: (i: number) => `grayscale(${i}%)` },
    { id: 'noir', name: 'Noir', filter: (i: number) => `grayscale(100%) contrast(${100 + i * 0.5}%) brightness(${100 - i * 0.2}%)` },
    { id: 'sepia', name: 'Sepia', filter: (i: number) => `sepia(${i}%)` },
    { id: 'vintage', name: 'Vintage', filter: (i: number) => `sepia(${i * 0.5}%) contrast(${100 + i * 0.2}%) brightness(${100 - i * 0.05}%)` },
    { id: 'cinematic', name: 'Cinema', filter: (i: number) => `contrast(${100 + i * 0.2}%) saturate(${100 - i * 0.1}%) sepia(${i * 0.2}%)` },
    { id: 'chrome', name: 'Chrome', filter: (i: number) => `contrast(${100 + i * 0.3}%) saturate(${100 + i * 0.3}%)` },
    { id: 'warm', name: 'Warm', filter: (i: number) => `sepia(${i * 0.3}%) saturate(${100 + i * 0.2}%)` },
    { id: 'cool', name: 'Cool', filter: (i: number) => `hue-rotate(-${i * 0.4}deg) saturate(${100 - i * 0.1}%)` },
    { id: 'fade', name: 'Fade', filter: (i: number) => `brightness(${100 + i * 0.1}%) contrast(${100 - i * 0.2}%) saturate(${100 - i * 0.2}%)` },
    { id: 'dramatic', name: 'Drama', filter: (i: number) => `contrast(${100 + i * 0.4}%) brightness(${100 - i * 0.1}%)` },
  ];

  const STYLE_PRESETS = [
      "Van Gogh Starry Night", "Cyberpunk 2077", "Watercolor", "Oil Painting", "Pencil Sketch", "Anime Studio Ghibli", "Pixel Art", "Ukiyo-e"
  ];

  // Tools Config with comprehensive styling for active states
  const tools = [
    { id: ToolType.MAGIC, icon: Wand2, label: 'AI Magic', color: 'text-cyan-400', bg: 'bg-cyan-400/20 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.25)]', description: 'Generate creative edits with AI' },
    { id: ToolType.BG_REMOVE, icon: ImageMinus, label: 'Bg Remove', color: 'text-blue-400', bg: 'bg-blue-400/20 border-blue-400/50 shadow-[0_0_20px_rgba(96,165,250,0.25)]', description: 'Remove background automatically' },
    { id: ToolType.FLUX, icon: Move, label: 'AI Morph', color: 'text-pink-500', bg: 'bg-pink-500/20 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.25)]', description: 'Blend images & apply subtle morphs' },
    { id: ToolType.UPSCALE, icon: MonitorUp, label: 'Upscale', color: 'text-purple-400', bg: 'bg-purple-400/20 border-purple-400/50 shadow-[0_0_20px_rgba(192,132,252,0.25)]', description: 'Real-ESRGAN Super Resolution' },
    { id: ToolType.STYLE, icon: PaletteIcon, label: 'Style', color: 'text-amber-400', bg: 'bg-amber-400/20 border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.25)]', description: 'AI Style Transfer' },
    { id: ToolType.CUTOUT, icon: Eraser, label: 'Eraser', color: 'text-red-400', bg: 'bg-red-400/20 border-red-400/50 shadow-[0_0_20px_rgba(248,113,113,0.25)]', description: 'Magic Object Eraser' },
    { id: ToolType.RETOUCH, icon: User, label: 'Retouch', color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/20 border-fuchsia-400/50 shadow-[0_0_20px_rgba(232,121,249,0.25)]', description: 'Smart Object Edit / Generative Fill' },
    { id: ToolType.FILTERS, icon: PaletteIcon, label: 'Filters', color: 'text-indigo-400', bg: 'bg-indigo-400/20 border-indigo-400/50 shadow-[0_0_20px_rgba(129,140,248,0.25)]', description: 'Apply artistic color filters' },
    { id: ToolType.ADJUST, icon: Sliders, label: 'Adjust', color: 'text-gray-200', bg: 'bg-gray-700/50 border-gray-500/50 shadow-[0_0_20px_rgba(255,255,255,0.15)]', description: 'Tweak brightness and contrast' },
    { id: ToolType.STICKERS, icon: Sticker, label: 'Stickers', color: 'text-lime-400', bg: 'bg-lime-400/20 border-lime-400/50 shadow-[0_0_20px_rgba(163,230,53,0.25)]', description: 'Add fun stickers to your image' },
    { id: ToolType.TEXT, icon: Type, label: 'Text', color: 'text-emerald-400', bg: 'bg-emerald-400/20 border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.25)]', description: 'Overlay text on your design' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const result = e.target.result as string;
          setImageSrc(result);
          if (activeTool === ToolType.FLUX) {
              setFluxSourceImage(result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!apiKeyValid) {
        setError("Pro License Required (Missing API Key)");
        return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
        // Send current image for img2img editing
        const result = await generateImageWithGemini(prompt, imageSrc);
        setImageSrc(result);
        setIsImageLoading(true); // Trigger loading animation for new image
    } catch (e: any) {
        setError(e.message || "Generation failed. Try a different prompt.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleBgRemove = async () => {
    if (!apiKeyValid) {
        setError("Pro License Required (Missing API Key)");
        return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
        const result = await generateImageWithGemini("Remove the background from this image. Return the subject on a transparent or white background.", imageSrc);
        setImageSrc(result);
        setIsImageLoading(true);
    } catch (e: any) {
        setError(e.message || "Background removal failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleStyleTransfer = async () => {
      const styleTarget = stylePreset || prompt;
      const effectiveLora = loraRepo.trim();
      
      if (!styleTarget && !effectiveLora) return;

      if (!apiKeyValid) {
        setError("Pro License Required (Missing API Key)");
        return;
      }

      setIsGenerating(true);
      setError(null);
      try {
          let promptText = "";
          // Simulate LoRA via prompting instructions
          if (effectiveLora) {
             promptText = `Apply the aesthetic/style from the LoRA model '${effectiveLora}' with a scale of ${loraScale} and a mixing strength of ${styleStrength}. `;
             if (styleTarget) promptText += `Also incorporate elements of: ${styleTarget}. `;
          } else {
             promptText = `Transform this image into the style of ${styleTarget}. Style Strength: ${styleStrength}. `;
          }
          promptText += "Maintain the original subject matter and composition but apply the artistic style aggressively.";

          const result = await generateImageWithGemini(promptText, imageSrc);
          setImageSrc(result);
          setIsImageLoading(true);
      } catch (e: any) {
          setError(e.message || "Style transfer failed.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleFluxGenerate = async () => {
    if (!prompt.trim()) return;
    if (!apiKeyValid) {
        setError("Pro License Required (Missing API Key)");
        return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
        let strengthInstruction = "";
        // Refined prompting for Morphing behavior
        if (fluxStrength <= 30) {
            strengthInstruction = "Strictly adhere to the original image structure. Only morph fine details to match the prompt subtly.";
        } else if (fluxStrength <= 70) {
            strengthInstruction = "Balanced Morph: Blend the original structure with the new concept. Update shapes and textures but keep the composition.";
        } else {
            strengthInstruction = "Heavy Morph: Use the original only as a loose guide. Significantly transform the subject and environment to match the prompt.";
        }

        const finalPrompt = `[AI Morph Task] \nTarget Concept: "${prompt}". \nTransformation Strength: ${fluxStrength}%. \nInstruction: ${strengthInstruction} \nMorph the input image towards the target concept seamlessly.`;
        
        // Use fluxSourceImage if available to ensure consistent editing from source
        const sourceToUse = fluxSourceImage || imageSrc;
        const result = await generateImageWithGemini(finalPrompt, sourceToUse);
        setImageSrc(result);
        setIsImageLoading(true);
    } catch (e: any) {
        setError(e.message || "Morphing failed.");
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleRetouch = async () => {
    if (!prompt.trim() || !retouchSelection.trim()) return;
    if (!apiKeyValid) {
        setError("Pro License Required (Missing API Key)");
        return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
        const finalPrompt = `Edit Instruction: Locate the object or area described as "${retouchSelection}" and ${prompt}. Ensure seamless integration with the surrounding image.`;
        const result = await generateImageWithGemini(finalPrompt, imageSrc);
        setImageSrc(result);
        setIsImageLoading(true);
    } catch (e: any) {
        setError(e.message || "Retouch failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleErase = async () => {
    if (!eraserObject.trim()) return;
    if (!apiKeyValid) {
        setError("Pro License Required (Missing API Key)");
        return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
        const promptText = `Object Removal Task: Identify the object described as "${eraserObject}". Remove it completely from the image. Inpaint the resulting hole to match the surrounding background pattern, texture, and lighting seamlessly. The result should look as if the object never existed.`;
        const result = await generateImageWithGemini(promptText, imageSrc);
        setImageSrc(result);
        setIsImageLoading(true);
    } catch (e: any) {
        setError(e.message || "Object removal failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleUpscale = async () => {
     if (!apiKeyValid) {
        setError("Pro License Required (Missing API Key)");
        return;
     }
     setIsGenerating(true);
     setError(null);
     try {
         const enhancementPrompt = `Upscale this image ${upscaleFactor}x with Real-ESRGAN style enhancement${faceEnhance ? ' and face restoration' : ''}. High resolution, sharp details, photorealistic restoration.`;
         const result = await generateImageWithGemini(enhancementPrompt, imageSrc);
         setImageSrc(result);
         setIsImageLoading(true);
     } catch(e: any) {
         setError(e.message || "Upscaling failed");
     } finally {
         setIsGenerating(false);
     }
  };

  const getCombinedStyle = () => {
    // Base adjustment style
    let styleString = `brightness(${100 + exposure}%) contrast(${100 + contrast}%)`;
    
    // Append selected filter style
    const preset = FILTER_PRESETS.find(p => p.id === selectedFilter);
    if (preset && preset.filter) {
        styleString += ` ${preset.filter(filterIntensity)}`;
    }
    
    return { filter: styleString };
  };

  return (
    <div className="flex flex-col h-full bg-[#05050A]">
      {/* Top Bar */}
      <div className="h-14 px-4 flex items-center justify-between bg-[#05050A] z-10 border-b border-gray-900">
         <button onClick={onBack} className="p-2 text-gray-400 hover:text-white">
            <ChevronLeft size={24} />
         </button>
         <div className="flex gap-4">
            <button className="p-2 text-gray-400 hover:text-white"><Undo2 size={20} /></button>
            <button className="p-2 text-gray-400 hover:text-white"><Redo2 size={20} /></button>
         </div>
         <button 
            onClick={() => onExport({ ...project, image: imageSrc })}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
         >
            Next
            <ChevronRight size={14} />
         </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-6 bg-[#05050A]">
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '24px 24px' }} 
         />

         {/* Image Canvas Container */}
         <div className="relative flex items-center justify-center w-full h-full min-h-[300px]">
             
             {/* Loading / Generating Overlay */}
             {(isGenerating) && (
                <div className="absolute z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg p-6">
                    <Loader2 size={48} className="text-cyan-400 animate-spin mb-4" />
                    <p className="text-cyan-100 font-medium whitespace-nowrap">Generating...</p>
                </div>
             )}
             
             {/* Image Loading State */}
             {isImageLoading && !isGenerating && (
                <div className="absolute z-10 flex flex-col items-center justify-center">
                    <Loader2 size={32} className="text-gray-600 animate-spin" />
                </div>
             )}

             <img 
                src={imageSrc} 
                alt="Editing" 
                className={`max-w-full max-h-full object-contain shadow-2xl rounded-sm transition-all duration-300 ease-out ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                style={getCombinedStyle()}
                onLoad={() => setIsImageLoading(false)}
                onError={(e) => {
                    console.error("Image load failed", e);
                    setError("Could not load image.");
                    setIsImageLoading(false);
                }}
             />
             
             {/* Glow effect behind image */}
             <div className="absolute inset-0 shadow-[0_0_80px_rgba(59,130,246,0.15)] pointer-events-none rounded-lg mix-blend-overlay" />
         </div>
         
         {/* Error Toast */}
         {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm shadow-xl z-30 animate-pulse">
                <AlertCircle size={16} />
                {error}
                <button onClick={() => setError(null)} className="ml-2 font-bold">✕</button>
            </div>
         )}
      </div>

      {/* Controls Area */}
      <div className="bg-[#0A0A12] border-t border-gray-900 pb-safe relative z-20">
        
        {/* Adjustment Panel (Contextual) */}
        {activeTool === ToolType.ADJUST && (
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md animate-slide-up">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 w-16">Exposure</span>
                        <input 
                            type="range" 
                            min="-50" max="50" 
                            value={exposure} 
                            onChange={(e) => setExposure(parseInt(e.target.value))}
                            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <span className="text-xs text-gray-500 w-8 text-right">{exposure.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 w-16">Contrast</span>
                        <input 
                            type="range" 
                            min="-50" max="50" 
                            value={contrast} 
                            onChange={(e) => setContrast(parseInt(e.target.value))}
                            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <span className="text-xs text-gray-500 w-8 text-right">{contrast.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end">
                         <button onClick={() => {setExposure(0); setContrast(0)}} className="text-xs bg-gray-800 px-3 py-1 rounded text-gray-400 hover:text-white transition-colors">Reset</button>
                    </div>
                </div>
            </div>
        )}

        {/* Filters Panel (Contextual) */}
        {activeTool === ToolType.FILTERS && (
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md animate-slide-up">
                {selectedFilter !== 'original' && (
                    <div className="flex items-center gap-4 mb-4 animate-slide-up">
                        <span className="text-xs text-gray-400 w-12 font-medium">Intensity</span>
                        <input 
                            type="range" 
                            min="0" max="100" 
                            value={filterIntensity} 
                            onChange={(e) => setFilterIntensity(parseInt(e.target.value))}
                            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <span className="text-xs text-gray-500 w-8 text-right">{filterIntensity}%</span>
                    </div>
                )}
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
                    {FILTER_PRESETS.map((filter) => {
                        const isSelected = selectedFilter === filter.id;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => setSelectedFilter(filter.id)}
                                className={`flex flex-col items-center gap-2 group transition-transform ${isSelected ? 'scale-105' : 'hover:scale-105'}`}
                            >
                                <div className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${isSelected ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'border-gray-700 group-hover:border-gray-500'}`}>
                                    <img 
                                        src={imageSrc} 
                                        alt={filter.name} 
                                        className="w-full h-full object-cover"
                                        style={{ filter: filter.filter ? filter.filter(100) : 'none' }}
                                    />
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-cyan-400/20 pointer-events-none" />
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`}>
                                    {filter.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Cutout/Eraser Panel (Contextual) */}
        {activeTool === ToolType.CUTOUT && (
             <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md animate-slide-up">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-red-400 font-bold uppercase">Magic Eraser</p>
                        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">Generative Infill</span>
                    </div>
                    
                    <div className="bg-black/40 p-3 rounded-xl border border-gray-800/50">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1.5">Object to Remove</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={eraserObject}
                                onChange={(e) => setEraserObject(e.target.value)}
                                placeholder="Describe object (e.g. 'Red cup')..."
                                className="w-full bg-transparent border-b border-gray-700 py-2 text-sm focus:outline-none focus:border-red-500 text-white placeholder-gray-600 transition-colors pr-8"
                                onKeyDown={(e) => e.key === 'Enter' && handleErase()}
                            />
                            {eraserObject && (
                                <button onClick={() => setEraserObject('')} className="absolute right-0 top-2 text-gray-500 hover:text-white">✕</button>
                            )}
                        </div>
                    </div>
                    
                    {/* Quick Suggestions */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        {['Person', 'Text', 'Watermark', 'Shadow', 'Background Clutter'].map(item => (
                            <button 
                                key={item}
                                onClick={() => setEraserObject(item)}
                                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-[10px] text-gray-300 whitespace-nowrap border border-gray-700 hover:border-gray-500 transition-all"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    
                    <button
                        onClick={handleErase}
                        disabled={isGenerating || !eraserObject}
                        className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Eraser size={18} />}
                        Erase Object
                    </button>
                </div>
             </div>
        )}
        
        {/* Retouch Panel (Contextual) */}
        {activeTool === ToolType.RETOUCH && (
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md animate-slide-up">
                <div className="flex flex-col gap-3">
                    <p className="text-xs text-purple-400 font-bold uppercase">Smart Object Retouch</p>
                    
                    <div className="space-y-3">
                         <div className="bg-black/40 p-3 rounded-xl border border-gray-800/50">
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1.5">1. Select Object/Area</label>
                            <input 
                                type="text" 
                                value={retouchSelection}
                                onChange={(e) => setRetouchSelection(e.target.value)}
                                placeholder="e.g. Red Jacket, The Background..."
                                className="w-full bg-transparent border-b border-gray-700 py-1 text-sm focus:outline-none focus:border-purple-500 text-white placeholder-gray-600 transition-colors"
                            />
                        </div>
                        
                        <div className="bg-black/40 p-3 rounded-xl border border-gray-800/50">
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1.5">2. Edit Instruction</label>
                            <input 
                                type="text" 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g. Turn it blue, Remove it..."
                                className="w-full bg-transparent border-b border-gray-700 py-1 text-sm focus:outline-none focus:border-purple-500 text-white placeholder-gray-600 transition-colors"
                                onKeyDown={(e) => e.key === 'Enter' && handleRetouch()}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleRetouch}
                        disabled={isGenerating || !prompt || !retouchSelection}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 mt-1"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                        Apply Retouch
                    </button>
                </div>
            </div>
        )}
        
        {/* Background Remove Panel (Contextual) */}
        {activeTool === ToolType.BG_REMOVE && (
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md animate-slide-up">
                <div className="flex flex-col gap-3">
                    <p className="text-xs text-blue-400 font-bold uppercase">AI Background Removal</p>
                    <p className="text-sm text-gray-300">Automatically identify and remove the background from your subject.</p>
                    
                    <button
                        onClick={handleBgRemove}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 mt-1"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <ImageMinus size={18} />}
                        Remove Background
                    </button>
                </div>
            </div>
        )}
        
        {/* Style Transfer Panel (Contextual) */}
        {activeTool === ToolType.STYLE && (
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md animate-slide-up">
                <div className="flex flex-col gap-3">
                    <p className="text-xs text-amber-400 font-bold uppercase">AI Style Transfer + LoRA</p>
                    
                    {/* Presets */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {STYLE_PRESETS.map((style) => (
                            <button 
                                key={style}
                                onClick={() => { setStylePreset(style); setLoraRepo(''); }} 
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${stylePreset === style ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>

                    {/* Custom LoRA Input */}
                    <div className="bg-black/40 p-3 rounded-xl border border-gray-800/50 space-y-3">
                         <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1.5 flex justify-between">
                                <span>Custom LoRA Model (HF Repo)</span>
                                <span className="text-amber-500/80 text-[10px]">Optional</span>
                            </label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={loraRepo}
                                    onChange={(e) => {
                                        setLoraRepo(e.target.value);
                                        if(e.target.value) setStylePreset(''); // Clear preset if LoRA used
                                    }}
                                    placeholder="e.g. ostris/ikea-instructions-lora-sdxl"
                                    className="w-full bg-transparent border-b border-gray-700 py-1 text-sm focus:outline-none focus:border-amber-500 text-white placeholder-gray-600 transition-colors pr-8"
                                />
                                <div className="absolute right-0 top-1.5">
                                    <Settings2 size={14} className="text-gray-600" />
                                </div>
                            </div>
                         </div>
                    
                         {/* Sliders */}
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                    <span>LoRA Scale</span>
                                    <span>{loraScale.toFixed(1)}</span>
                                </div>
                                <input 
                                    type="range" min="0" max="2" step="0.1"
                                    value={loraScale}
                                    onChange={(e) => setLoraScale(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                            </div>
                             <div>
                                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                    <span>Style Strength</span>
                                    <span>{styleStrength.toFixed(2)}</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.05"
                                    value={styleStrength}
                                    onChange={(e) => setStyleStrength(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                            </div>
                         </div>
                    </div>

                    {/* Prompt Fallback */}
                    {!loraRepo && (
                        <div className="bg-black/40 p-3 rounded-xl border border-gray-800/50">
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1.5">Custom Style Prompt</label>
                            <input 
                                type="text" 
                                value={prompt}
                                onChange={(e) => {
                                    setPrompt(e.target.value);
                                    if(e.target.value) setStylePreset('');
                                }}
                                placeholder="e.g. In the style of a comic book..."
                                className="w-full bg-transparent border-b border-gray-700 py-1 text-sm focus:outline-none focus:border-amber-500 text-white placeholder-gray-600 transition-colors"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleStyleTransfer}
                        disabled={isGenerating || (!prompt && !stylePreset && !loraRepo)}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 mt-1"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <PaletteIcon size={18} />}
                        Transfer Style
                    </button>
                </div>
            </div>
        )}

        {/* Upscale Panel (Contextual) */}
        {activeTool === ToolType.UPSCALE && (
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md animate-slide-up">
               <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                      <p className="text-xs text-purple-400 font-bold uppercase">Real-ESRGAN Super Res</p>
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">AI Enhanced</span>
                  </div>
                  
                  <div className="bg-black/40 p-4 rounded-xl border border-gray-800/50 space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Scale Factor</span>
                         <div className="flex bg-gray-800 rounded-lg p-1">
                            {[2, 4].map(scale => (
                                <button
                                   key={scale}
                                   onClick={() => setUpscaleFactor(scale as 2 | 4)}
                                   className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${upscaleFactor === scale ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                   {scale}x
                                </button>
                            ))}
                         </div>
                      </div>

                      <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                             <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Face Enhancement</span>
                             <span className="text-[10px] text-gray-500">Restore facial details</span>
                         </div>
                         <button
                            onClick={() => setFaceEnhance(!faceEnhance)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${faceEnhance ? 'bg-purple-600' : 'bg-gray-700'}`}
                         >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${faceEnhance ? 'translate-x-6' : 'translate-x-0'}`} />
                         </button>
                      </div>
                  </div>

                  <button
                     onClick={handleUpscale}
                     disabled={isGenerating}
                     className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                     {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <MonitorUp size={18} />}
                     Upscale Image
                  </button>
               </div>
            </div>
        )}
        
        {/* Flux 2 / AI Morph Panel (Contextual) */}
        {activeTool === ToolType.FLUX && (
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md animate-slide-up">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-pink-500 font-bold uppercase">AI Morph / Flux Remix</p>
                        <span className="text-[10px] bg-pink-500/10 text-pink-500 px-2 py-0.5 rounded border border-pink-500/20">FLUX.2-dev</span>
                    </div>
                    
                    {/* Source Image Control */}
                    <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-xl border border-gray-700">
                        <img src={fluxSourceImage || imageSrc} alt="Source" className="w-12 h-12 rounded-lg object-cover opacity-80" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-400">Source Image</p>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-pink-400 font-bold hover:text-pink-300 transition-colors flex items-center gap-1 mt-0.5"
                            >
                                <Upload size={10} /> Change Source
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>
                    
                    {/* Prompt Input */}
                    <div className="relative">
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Morph to (e.g. 'Marble statue')..."
                            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 text-white placeholder-gray-600"
                            onKeyDown={(e) => e.key === 'Enter' && handleFluxGenerate()}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Move size={16} className={prompt ? "text-pink-400 animate-pulse" : "text-gray-700"} />
                        </div>
                    </div>

                    {/* Strength Slider */}
                    <div className="space-y-2">
                         <div className="flex justify-between text-xs text-gray-400">
                             <span>Subtle</span>
                             <span>Balanced</span>
                             <span>Total Morph</span>
                         </div>
                         <input 
                            type="range" 
                            min="0" max="100" 
                            value={fluxStrength} 
                            onChange={(e) => setFluxStrength(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                         />
                         <div className="text-center text-[10px] text-gray-500">
                             Morph Intensity: <span className="text-pink-400">{fluxStrength}%</span>
                         </div>
                    </div>

                    <button
                        onClick={handleFluxGenerate}
                        disabled={isGenerating || !prompt}
                        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Move size={18} />}
                        Morph Image
                    </button>
                </div>
            </div>
        )}

        {/* AI Magic Panel (Contextual) */}
        {activeTool === ToolType.MAGIC && (
             <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md animate-slide-up">
                <p className="text-xs text-cyan-400 font-bold uppercase mb-2">Gemini Pro Prompt</p>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe change (e.g. 'Add neon lights', 'Make it cyberpunk')..."
                            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white placeholder-gray-600"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Wand2 size={16} className={prompt ? "text-cyan-400 animate-pulse" : "text-gray-700"} />
                        </div>
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                        className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-xl font-medium text-sm transition-colors flex items-center"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : 'Generate'}
                    </button>
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
                     {['Cyberpunk style', 'Oil painting', 'Make it snowy', 'Add sunglasses'].map(suggestion => (
                         <button key={suggestion} onClick={() => setPrompt(suggestion)} className="whitespace-nowrap px-3 py-1 bg-gray-800 rounded-full text-[10px] text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                            {suggestion}
                         </button>
                     ))}
                </div>
             </div>
        )}

        {/* Tools Carousel */}
        <div 
            className="flex items-center gap-2 overflow-x-auto no-scrollbar p-4"
            onScroll={() => setTooltip(null)}
        >
            {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id as ToolType)}
                        onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                                label: tool.label,
                                desc: tool.description || ''
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        className={`flex flex-col items-center justify-center min-w-[72px] h-[72px] rounded-2xl transition-all duration-300 ${
                            isActive 
                                ? `${tool.bg} scale-110 border-2 z-10 -translate-y-1` 
                                : 'hover:bg-gray-900 border border-transparent opacity-60 hover:opacity-100 hover:-translate-y-0.5'
                        }`}
                    >
                        <div className={`mb-1.5 transition-colors duration-300 ${isActive ? (tool.color) : 'text-gray-400'}`}>
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                        </div>
                        <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`}>{tool.label}</span>
                    </button>
                )
            })}
        </div>
      </div>
      
      {/* Floating Tooltip */}
      {tooltip && (
        <div 
            className="fixed z-50 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full transition-opacity duration-200"
            style={{ left: tooltip.x, top: tooltip.y - 12 }}
        >
            <p className="text-xs font-bold text-white text-center mb-0.5">{tooltip.label}</p>
            <p className="text-[10px] text-gray-400 text-center whitespace-nowrap">{tooltip.desc}</p>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
        </div>
      )}

      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default EditorScreen;
