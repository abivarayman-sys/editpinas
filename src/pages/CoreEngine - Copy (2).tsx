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
      toast.error(`Insufficient Credits for ${actionName}. You need ${cost} CR, but you have ${currentUserData.credits || 0} CR. Please Top Up.`);
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
    const link = document.createElement('a'); link.href = url; link.download = `editpinas-${Date.now()}.png`;
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

  return (
    <div className={cn(`min-h-[100dvh] flex flex-col font-sans overflow-hidden relative`, theme.bgApp)}>
      <Toaster theme="dark" position="top-center" richColors />

      {/* DEV SKIP BUTTON */}
      <button onClick={() => {
          if (activeView === 'styles') { if (!selectedPreset && presets.length > 0) setSelectedPreset(presets[0]); setActiveView('preview'); } 
          else if (activeView === 'preview') { setActiveView('customizer'); } 
          else if (activeView === 'customizer') { executeInitialGeneration(); } 
          else if (activeView === 'result') { setActiveView('styles'); }
        }}
        className="fixed top-24 right-4 z-[100] bg-[#5A5CE6] hover:bg-[#4a4cd6] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_4px_20px_rgba(90,92,230,0.4)] transition-all"
      >
        <FastForward className="w-3 h-3" /> Dev Skip
      </button>

      {/* FIXED NAVHEAD */}
      <header className={cn(`fixed top-0 inset-x-0 h-20 bg-[#0B0D17]/80 backdrop-blur-xl border-b z-50 px-4 md:px-8 flex items-center justify-between`, theme.borderSubtle)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#151828] border border-white/5 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-[#5A5CE6]" /></div>
          <h1 className={cn(theme.textH3, "hidden md:block")}>{tenantConfig.brandName || 'STUDIO'}</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className={cn(`flex items-center gap-3 border px-4 py-2 rounded-full cursor-pointer hover:bg-white/5 transition-colors`, theme.bgCard, theme.borderSubtle)} onClick={() => navigate(`/topup?tenant=${tenantConfig.subdomain}`)}>
            <Wallet className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest leading-none">Balance</span>
              <span className="text-sm font-bold text-white leading-none mt-0.5">{currentUserData.credits} <span className="text-[9px] text-indigo-400">CR</span></span>
            </div>
          </div>
          <button onClick={() => navigate(`/topup?tenant=${tenantConfig.subdomain}`)} className="hidden sm:block bg-[#5A5CE6] hover:bg-[#4a4cd6] text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors shadow-[0_4px_15px_rgba(90,92,230,0.3)]">Top Up</button>
          <button onClick={() => navigate(`/refer?tenant=${tenantConfig.subdomain}`)} className={cn(`p-2.5 text-yellow-400 hover:text-white hover:bg-yellow-500 rounded-full transition-colors border`, theme.bgCard, theme.borderSubtle)} title="Refer & Earn"><Gift className="w-4 h-4" strokeWidth={1.5} /></button>
          <button onClick={() => toast.info("Gallery coming soon!")} className={cn(`p-2.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:block border`, theme.bgCard, theme.borderSubtle)}><ImageIcon className="w-4 h-4" strokeWidth={1.5} /></button>
          <button onClick={() => { logOut(); navigate('/'); }} className={cn(`p-2.5 text-red-400 hover:text-white hover:bg-red-500 rounded-full transition-colors border`, theme.bgCard, theme.borderSubtle)}><LogOut className="w-4 h-4" strokeWidth={1.5} /></button>
        </div>
      </header>

      <main className="flex-1 pt-20 h-full flex flex-col relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-[#5A5CE6]/5 rounded-full blur-[100px] pointer-events-none" />

        <AnimatePresence mode="wait">
          {activeView === 'styles' && <StylesView state={engineState} methods={engineMethods} />}
          {activeView === 'preview' && <PreviewView state={engineState} methods={engineMethods} />}
          {activeView === 'customizer' && <CustomizerView state={engineState} methods={engineMethods} />}
          {activeView === 'result' && <ResultView state={engineState} methods={engineMethods} />}
        </AnimatePresence>
      </main>
    </div>
  );
}