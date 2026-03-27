import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { db, photoboothDb, logOut } from '../firebase';
import { useTenantStore } from '../store/useTenantStore';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Image as ImageIcon, Sparkles, LogOut, FastForward, Gift } from 'lucide-react';
import { theme } from '../theme.config';
import { Toaster, toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- IMPORT EXTRACTED VIEWS ---
import StylesView from './views/StylesView';
import PreviewView from './views/PreviewView';
import CustomizerView from './views/CustomizerView';
import ResultView from './views/ResultView';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CoreEngine() {
  const { currentTenant, currentUserData, setCurrentUserData } = useTenantStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // --- APP FLOW STATE ---
  const [activeView, setActiveView] = useState<'styles' | 'preview' | 'customizer' | 'result'>('styles');
  const [selectedPreset, setSelectedPreset] = useState<any | null>(null);
  const [tenantConfig, setTenantConfig] = useState<any>(currentTenant);

  // --- DATA STATE ---
  const [presets, setPresets] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // --- CUSTOMIZER STATE ---
  const [userPrompt, setUserPrompt] = useState(''); 
  const [userImages, setUserImages] = useState<{ [key: string]: string | null }>({ IMAGE1: null, IMAGE2: null, IMAGE3: null });
  const [isProMode, setIsProMode] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  // --- RESULT & GALLERY STATE ---
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [hideWatermark, setHideWatermark] = useState(false);

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    if (!currentTenant) return;
    const tenantUnsub = onSnapshot(doc(db, 'resellers', currentTenant.id), (docSnap) => {
      if (docSnap.exists()) setTenantConfig({ id: docSnap.id, ...docSnap.data() });
    });
    return () => tenantUnsub();
  }, [currentTenant]);

  useEffect(() => {
    if (!user || !currentTenant) return;
    const userUnsub = onSnapshot(doc(db, 'resellers', currentTenant.id, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) setCurrentUserData({ uid: docSnap.id, ...docSnap.data() } as any);
    });
    return () => userUnsub();
  }, [user, currentTenant, setCurrentUserData]);

  useEffect(() => {
    if (!tenantConfig) return;
    const fetchPresets = async () => {
      try {
        const globalSnap = await getDocs(collection(photoboothDb, 'presets'));
        const hiddenGlobals = tenantConfig.hiddenGlobalPresets || [];
        
        let globalList = globalSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id, isGlobal: true,
            styleName: data.styleName || data.name || 'Unnamed',
            promptFragment: data.promptFragment || data.basePrompt || '',
            thumbnailBase64: data.thumbnailBase64 || data.previewUrl || data.imageUrl || '',
            categories: Array.isArray(data.categories) ? data.categories : (data.category ? [data.category] : []),
            instructionText: data.instructionText || ''
          };
        });
        globalList = globalList.filter(p => !hiddenGlobals.includes(p.id));

        const tenantSnap = await getDocs(collection(db, 'resellers', tenantConfig.id, 'PRESETS'));
        let tenantList = tenantSnap.docs.map(d => ({ id: d.id, isGlobal: false, ...d.data() } as any));
        tenantList = tenantList.filter(p => p.isActive !== false);

        const merged = [...tenantList, ...globalList];
        setPresets(merged);

        const cats = new Set<string>();
        merged.forEach(p => p.categories?.forEach((c: string) => cats.add(c)));
        setCategories(Array.from(cats).sort());
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching presets:", error);
        toast.error("Failed to load studio presets.");
        setIsLoading(false);
      }
    };
    fetchPresets();
  }, [tenantConfig?.id]); 

  // --- STABLE FONT INJECTION (Prevents Font Reverting) ---
  useEffect(() => {
    if (!document.getElementById('dynamic-fonts')) {
      const style = document.createElement('style');
      style.id = 'dynamic-fonts';
      style.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Poppins:wght@400;700;900&family=Roboto:wght@400;700;900&family=Bangers&family=Orbitron:wght@400;700;900&family=Mountains+of+Christmas:wght@700&display=swap');`;
      document.head.appendChild(style);
    }
  }, []);

  if (!tenantConfig || !currentUserData) return null;

  // --- ECONOMY & METHODS ---
  const filteredPresets = presets.filter(p => {
    const matchesSearch = p.styleName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.categories?.includes(selectedCategory);
    return matchesSearch && matchesCat;
  });

  const getCost = (field: string, fallback: number) => {
    const val = tenantConfig[field];
    return val !== undefined && val !== null && val !== '' ? Number(val) : fallback;
  };
  const costStandard = getCost('costStandard', 1);
  const costPro = getCost('costPro', 2);
  const costRetry = getCost('costRetry', 1);
  const costEdit = getCost('costEdit', 2);
  const costDownload = getCost('costDownload', 0);

  const deductCredits = async (cost: number, actionName: string) => {
    if (cost <= 0) return true; 
    if (!user || !tenantConfig) return false;
    
    if ((currentUserData.credits || 0) < cost) {
      toast.error(`Insufficient Credits for ${actionName}. You need ${cost} CR. Please Top Up.`);
      navigate(`/topup?tenant=${tenantConfig.subdomain}`);
      return false;
    }

    try {
      await updateDoc(doc(db, 'resellers', tenantConfig.id, 'users', user.uid), { credits: increment(-cost) });
      return true;
    } catch (error) {
      toast.error("System error processing credits. Please try again.");
      return false;
    }
  };

  const handleSelectForPreview = (preset: any) => { setSelectedPreset(preset); setActiveView('preview'); };
  const handleConfirmPreset = () => { setUserPrompt(''); setActiveView('customizer'); };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUserImages(prev => ({ ...prev, [slot]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };
  const insertImageToken = (token: string) => {
    if (!promptRef.current) { setUserPrompt(prev => prev + ` [${token}] `); return; }
    const start = promptRef.current.selectionStart;
    const end = promptRef.current.selectionEnd;
    const text = userPrompt;
    setUserPrompt(text.substring(0, start) + `[${token}]` + text.substring(end));
    setTimeout(() => { promptRef.current?.focus(); promptRef.current?.setSelectionRange(start + token.length + 2, start + token.length + 2); }, 0);
  };

  const executeInitialGeneration = async () => {
    const cost = isProMode ? costPro : costStandard;
    if (!(await deductCredits(cost, 'Generation'))) return;
    setIsGenerating(true); setActiveView('result'); setIsEditMode(false);
    const loadingToast = toast.loading("Crafting your image...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratedImages(prev => [...prev, `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=800&q=80&auto=format&fit=crop`]);
    setCurrentGalleryIndex(generatedImages.length); setIsGenerating(false); toast.success("Generation complete!", { id: loadingToast });
  };

  const executeRetryGeneration = async () => {
    if (!(await deductCredits(costRetry, 'Retry'))) return;
    setIsGenerating(true); const loadingToast = toast.loading("Retrying generation...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratedImages(prev => [...prev, `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=800&q=80&auto=format&fit=crop`]);
    setCurrentGalleryIndex(generatedImages.length); setIsGenerating(false); toast.success("New variation ready!", { id: loadingToast });
  };

  const executeEditGeneration = async () => {
    if (!editPrompt.trim()) { toast.error("Please enter an edit instruction."); return; }
    if (!(await deductCredits(costEdit, 'Edit'))) return;
    setIsGenerating(true); setIsEditMode(false); const loadingToast = toast.loading("Applying your edits...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratedImages(prev => [...prev, `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=800&q=80&auto=format&fit=crop`]);
    setCurrentGalleryIndex(generatedImages.length); setEditPrompt(''); setIsGenerating(false); toast.success("Edits applied successfully!", { id: loadingToast });
  };

  const executeDownload = async (url: string) => {
    if (!(await deductCredits(costDownload, 'High-Res Download'))) return;
    const link = document.createElement('a'); link.href = url; link.download = `snap-pinas-${Date.now()}.png`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success("High-res image downloaded!");
  };

  // --- STATE PAYLOAD FOR VIEWS ---
  const engineState = {
    activeView, selectedPreset, tenantConfig, presets, categories, searchQuery, selectedCategory, isLoading,
    userPrompt, userImages, isProMode, promptRef, generatedImages, currentGalleryIndex, isGenerating,
    isEditMode, editPrompt, hideWatermark, filteredPresets, costStandard, costPro, costRetry, costEdit, costDownload
  };

  const engineMethods = {
    setActiveView, setSelectedPreset, setSearchQuery, setSelectedCategory, setUserPrompt, setUserImages, setIsProMode,
    setGeneratedImages, setCurrentGalleryIndex, setIsGenerating, setIsEditMode, setEditPrompt, setHideWatermark,
    handleSelectForPreview, handleConfirmPreset, handleImageUpload, insertImageToken, executeInitialGeneration,
    executeRetryGeneration, executeEditGeneration, executeDownload
  };

  // --- THEME OVERRIDES ---
  const isLightMode = tenantConfig.customTheme === 'light';
  const isNeonMode = tenantConfig.customTheme === 'neon';
  const isChristmas = tenantConfig.customTheme === 'christmas';
  const isWinter = tenantConfig.customTheme === 'winter';

  const iconStroke = tenantConfig.iconStyle === 'minimalist' ? 1 : tenantConfig.iconStyle === 'bold' ? 2.5 : 1.5;

  const activePrimary = isChristmas ? '#D4AF37' : (tenantConfig.primaryColor || '#5A5CE6');
  const activeBgStart = isChristmas ? '#4A0E17' : (tenantConfig.bgGradientStart || '#05050A');
  const activeBgEnd = isChristmas ? '#0B2015' : (tenantConfig.bgGradientEnd || '#1A1C2D');
  const logoColor = tenantConfig.logoColor || '#FFFFFF';

  const getDynamicFont = (fontSelection: string) => {
    if (isChristmas) return "'Mountains of Christmas', cursive";
    if (isNeonMode) return "'Orbitron', sans-serif";
    switch(fontSelection) {
      case 'goofy': return "'Bangers', cursive";
      case 'futuristic': return "'Orbitron', sans-serif";
      case 'poppins': return "'Poppins', sans-serif";
      default: return "'Inter', sans-serif";
    }
  };

  return (
    <>
      <div 
        className={cn(
          `min-h-[100dvh] flex flex-col overflow-hidden relative transition-colors duration-500`, 
          !isLightMode && !isNeonMode && !isChristmas ? theme.bgApp : ''
        )}
        style={{
          fontFamily: tenantConfig.fontFamily === 'poppins' ? "'Poppins', sans-serif" : tenantConfig.fontFamily === 'roboto' ? "'Roboto', sans-serif" : "'Inter', sans-serif",
          backgroundImage: tenantConfig.bgImageBase64 && !isChristmas 
            ? `url(${tenantConfig.bgImageBase64})` 
            : `linear-gradient(to bottom right, ${activeBgStart}, ${activeBgEnd})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: isLightMode ? '#f8fafc' : isNeonMode ? '#000000' : undefined,
          color: isLightMode ? '#0f172a' : isNeonMode ? '#00ffcc' : undefined,
          '--primary-color': activePrimary
        } as React.CSSProperties}
      >
        <Toaster theme={isLightMode ? "light" : "dark"} position="top-center" richColors />

        {/* Dynamic Background Overlay for Text Readability */}
        {tenantConfig.bgImageBase64 && !isChristmas && (
          <div className={`absolute inset-0 pointer-events-none z-0 ${isLightMode ? 'bg-white/80' : 'bg-[#0B0D17]/85'}`} />
        )}

        {/* PURE CSS FALLING SNOW EFFECT FOR STUDIO */}
        {(isChristmas || isWinter) && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full opacity-60"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}%`,
                  animation: `fall ${Math.random() * 5 + 5}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                  filter: isChristmas ? 'drop-shadow(0 0 5px rgba(255,255,255,0.8))' : 'none'
                }}
              />
            ))}
            <style>{`
              @keyframes fall {
                0% { transform: translateY(-10vh) translateX(0); opacity: 1; }
                100% { transform: translateY(110vh) translateX(20px); opacity: 0.1; }
              }
            `}</style>
          </div>
        )}

        {/* DEV SKIP BUTTON */}
        <button 
          onClick={() => {
            if (activeView === 'styles') { if (!selectedPreset && presets.length > 0) setSelectedPreset(presets[0]); setActiveView('preview'); } 
            else if (activeView === 'preview') { setActiveView('customizer'); } 
            else if (activeView === 'customizer') { executeInitialGeneration(); } 
            else if (activeView === 'result') { setActiveView('styles'); }
          }}
          className="fixed top-24 right-4 z-[100] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all"
          style={{ backgroundColor: 'var(--primary-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
        >
          <FastForward className="w-3 h-3" strokeWidth={iconStroke} /> Dev Skip
        </button>

        {/* FIXED NAVHEAD */}
        <header className={cn(
          `fixed top-0 inset-x-0 h-20 backdrop-blur-xl border-b z-50 px-4 md:px-8 flex items-center justify-between transition-colors duration-500`, 
          isLightMode ? 'bg-white/80 border-gray-200' : isChristmas ? 'bg-white/5 border-white/10' : theme.borderSubtle,
          !isLightMode && !isChristmas && 'bg-[#0B0D17]/80'
        )}>
          <div className="flex items-center gap-3">
            {/* DYNAMIC LOGO */}
            {tenantConfig.logoBase64 && !isChristmas ? (
              <img src={tenantConfig.logoBase64} alt="Brand Logo" className="h-10 max-w-[120px] object-contain drop-shadow-md" />
            ) : (
              <div className={`w-10 h-10 ${isLightMode ? 'bg-gray-100 border-gray-200' : isChristmas ? 'bg-black/30 border-white/20' : 'bg-[#151828] border-white/5'} border rounded-xl flex items-center justify-center backdrop-blur-md`}>
                <Sparkles className="w-5 h-5" strokeWidth={iconStroke} style={{ color: 'var(--primary-color)' }} />
              </div>
            )}
            
            {/* DUAL BRAND NAME CONTAINER */}
            <h1 className={cn("hidden md:flex items-center gap-1.5 font-bold", isLightMode ? 'text-gray-900' : 'text-white')} style={{ fontSize: isChristmas ? '1.5rem' : '1.125rem' }}>
              <span style={{ 
                fontFamily: getDynamicFont(tenantConfig.logoFont), 
                color: isChristmas ? '#FFFFFF' : logoColor,
                letterSpacing: tenantConfig.logoFont === 'goofy' ? '1px' : 'normal',
                textTransform: isChristmas ? 'none' : 'uppercase'
              }}>
                {tenantConfig.brandName || 'STUDIO'}
              </span>
              {(tenantConfig.brandName2 && tenantConfig.brandName2.trim() !== '') && (
                <span style={{ 
                  fontFamily: getDynamicFont(tenantConfig.logoFont2), 
                  color: isChristmas ? '#FFFFFF' : (tenantConfig.logoColor2 || 'var(--primary-color)'),
                  letterSpacing: tenantConfig.logoFont2 === 'goofy' ? '1px' : 'normal',
                  textTransform: isChristmas ? 'none' : 'uppercase'
                }}>
                  {tenantConfig.brandName2}
                </span>
              )}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div 
              className={cn(`flex items-center gap-3 border px-4 py-2 rounded-full cursor-pointer transition-colors`, isLightMode ? 'bg-white border-gray-200 hover:bg-gray-50' : `${theme.bgCard} ${theme.borderSubtle} hover:bg-white/5`)} 
              onClick={() => navigate(`/topup?tenant=${tenantConfig.subdomain}`)}
            >
              <Wallet className="w-4 h-4" strokeWidth={iconStroke} style={{ color: 'var(--primary-color)' }} />
              <div className="flex flex-col">
                <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${isLightMode ? 'text-gray-500' : 'text-neutral-500'}`}>Balance</span>
                <span className={`text-sm font-bold leading-none mt-0.5 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  {currentUserData.credits} <span className="text-[9px]" style={{ color: 'var(--primary-color)' }}>CR</span>
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate(`/topup?tenant=${tenantConfig.subdomain}`)} 
              className="hidden sm:block text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg" 
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              Top Up
            </button>
            
            <button onClick={() => navigate(`/refer?tenant=${tenantConfig.subdomain}`)} className={cn(`p-2.5 hover:text-white rounded-full transition-colors border`, isLightMode ? 'bg-white border-gray-200 text-yellow-500 hover:bg-yellow-500' : `${theme.bgCard} ${theme.borderSubtle} text-yellow-400 hover:bg-yellow-500`)} title="Refer & Earn">
              <Gift className="w-4 h-4" strokeWidth={iconStroke} />
            </button>
            <button onClick={() => toast.info("Gallery coming soon!")} className={cn(`p-2.5 hover:text-white rounded-full transition-colors hidden sm:block border`, isLightMode ? 'bg-white border-gray-200 text-gray-400 hover:bg-gray-400' : `${theme.bgCard} ${theme.borderSubtle} text-neutral-400 hover:bg-white/10`)}>
              <ImageIcon className="w-4 h-4" strokeWidth={iconStroke} />
            </button>
            <button onClick={() => { logOut(); navigate('/'); }} className={cn(`p-2.5 hover:text-white rounded-full transition-colors border`, isLightMode ? 'bg-white border-gray-200 text-red-500 hover:bg-red-500' : `${theme.bgCard} ${theme.borderSubtle} text-red-400 hover:bg-red-500`)}>
              <LogOut className="w-4 h-4" strokeWidth={iconStroke} />
            </button>
          </div>
        </header>

        <main className="flex-1 pt-20 h-full flex flex-col relative overflow-hidden z-10">
          {/* Dynamic Glow matching Primary Color */}
          {(!isLightMode && !isChristmas) && (
            <div 
              className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full blur-[100px] pointer-events-none opacity-[0.15]" 
              style={{ backgroundColor: 'var(--primary-color)' }} 
            />
          )}

          <AnimatePresence mode="wait">
            {activeView === 'styles' && <StylesView state={engineState} methods={engineMethods} />}
            {activeView === 'preview' && <PreviewView state={engineState} methods={engineMethods} />}
            {activeView === 'customizer' && <CustomizerView state={engineState} methods={engineMethods} />}
            {activeView === 'result' && <ResultView state={engineState} methods={engineMethods} />}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}