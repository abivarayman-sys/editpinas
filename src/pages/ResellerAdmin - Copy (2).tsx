import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, increment, onSnapshot, setDoc, deleteDoc, deleteField, addDoc } from 'firebase/firestore';
import { db, photoboothDb, handleFirestoreError, OperationType, logOut } from '../firebase';
import { useTenantStore, Reseller } from '../store/useTenantStore';
import { useAuthStore } from '../store/useAuthStore';
import { theme } from '../theme.config';
import { 
  Settings, Users, CreditCard, LogOut, X, Menu, LayoutDashboard, 
  BarChart3, Gift, Ticket, MessageSquare, Coins, Tag, Database, 
  AlertTriangle, Coins as CoinsIcon, CheckCircle2, Wallet, Wand2, Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import OverviewTab from './tabs/OverviewTab';
import InsightsTab from './tabs/InsightsTab';
import QueueTab from './tabs/QueueTab';
import UsersTab from './tabs/UsersTab';
import PromosTab from './tabs/PromosTab';
import SupportTab from './tabs/SupportTab';
import ReferralsTab from './tabs/ReferralsTab';
import PaymentSetupTab from './tabs/PaymentSetupTab';
import PricingTab from './tabs/PricingTab';
import PresetsTab from './tabs/PresetsTab';
import CostsTab from './tabs/CostsTab';
import SettingsTab from './tabs/SettingsTab';
import SystemTab from './tabs/SystemTab';
import ThemeTab from './tabs/ThemeTab';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const interFont = { fontFamily: "'Inter', sans-serif" };
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };

export const compressImage = (base64Str: string, maxWidth = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scaleSize = maxWidth / img.width;
      if (scaleSize < 1) { canvas.width = maxWidth; canvas.height = img.height * scaleSize; } 
      else { canvas.width = img.width; canvas.height = img.height; }
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
};

// Helper for downloading generated images directly from URL
export const downloadImage = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch(e) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default function ResellerAdmin() {
  const { currentTenant } = useTenantStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<Partial<Reseller> & any>({});
  const [isSaving, setIsSaving] = useState(false);

  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempUserCredits, setTempUserCredits] = useState<number>(0);

  const [globalPresets, setGlobalPresets] = useState<any[]>([]);
  const [tenantPresets, setTenantPresets] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  
  const [globalPackages, setGlobalPackages] = useState<any[]>([]);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);

  const [newPromo, setNewPromo] = useState({ code: '', credits: 50, maxUses: 100 });
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);

  const defaultPresetState = { styleName: '', description: '', promptFragment: '', categories: [] as string[], thumbnailBase64: '', instructionText: '', instructionImageBase64: '', isActive: true };
  const [newPreset, setNewPreset] = useState(defaultPresetState);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [generatedThumb, setGeneratedThumb] = useState<string | null>(null);

  // --- AI GENERATOR STATES ---
  const [isGeneratingAILogo, setIsGeneratingAILogo] = useState(false);
  const [generatedAILogo, setGeneratedAILogo] = useState<string | null>(null);
  const [isGeneratingAIBg, setIsGeneratingAIBg] = useState(false);
  const [generatedAIBg, setGeneratedAIBg] = useState<string | null>(null);
  const [bgPrompt, setBgPrompt] = useState('');

  // --- USE EFFECTS (DATA FETCHING) ---
  useEffect(() => {
    if (currentTenant && !settings.id) {
      const initialPackages = currentTenant.packages?.length > 0 ? currentTenant.packages : [
        { id: 'pkg_1', name: 'Starter', price: 20, credits: 20 },
        { id: 'pkg_2', name: 'Bargain', price: 50, credits: 60, isPopular: true },
        { id: 'pkg_3', name: 'Pro', price: 100, credits: 120 }
      ];

      setSettings({
        ...currentTenant,
        currency: currentTenant.currency || 'PHP',
        customTheme: currentTenant.customTheme || 'dark',
        brandName2: currentTenant.brandName2 || '', 
        primaryColor: currentTenant.primaryColor || '#5A5CE6',
        fontFamily: currentTenant.fontFamily || 'inter',
        iconStyle: currentTenant.iconStyle || 'standard',
        logoFont: currentTenant.logoFont || 'inter',                  
        logoColor: currentTenant.logoColor || '#FFFFFF',              
        logoFont2: currentTenant.logoFont2 || 'inter',                 
        logoColor2: currentTenant.logoColor2 || '#5A5CE6',             
        sloganText: currentTenant.sloganText || '',                    
        footerText: currentTenant.footerText || '',                    
        bgGradientStart: currentTenant.bgGradientStart || '#05050A',  
        bgGradientEnd: currentTenant.bgGradientEnd || '#1A1C2D', 
        logoBase64: currentTenant.logoBase64 || '',
        bgImageBase64: currentTenant.bgImageBase64 || '',
        hiddenGlobalPresets: currentTenant.hiddenGlobalPresets || [],
        customCategories: currentTenant.customCategories || [],
        gatewayEnabled: currentTenant.gatewayEnabled || false,
        gatewaySnippet: currentTenant.gatewaySnippet || '',
        sampleScreenshotBase64: currentTenant.sampleScreenshotBase64 || '',
        promos: currentTenant.promos || [],
        packages: initialPackages,
        costStandard: currentTenant.costStandard || 5,
        costPro: currentTenant.costPro || 10,
        costEdit: currentTenant.costEdit || 5,
        costRetry: currentTenant.costRetry || 5,
        costDownload: currentTenant.costDownload || 0
      });
    }
  }, [currentTenant, settings.id]);

  useEffect(() => {
    if (!user || !currentTenant) { navigate('/'); return; }
    if (user.uid !== currentTenant.ownerUid && user.email !== 'abivarayman@gmail.com') {
      navigate(`/?tenant=${currentTenant.subdomain}`); return;
    }

    setShowCreditWarning(currentTenant.creditsBalance <= 0);

    const usersUnsub = onSnapshot(collection(db, 'resellers', currentTenant.id, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    });

    const fetchAllData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'resellers', currentTenant.id, 'users'));
        let allTx: any[] = [];
        for (const uDoc of usersSnap.docs) {
          const txSnap = await getDocs(collection(db, 'resellers', currentTenant.id, 'users', uDoc.id, 'transactions'));
          allTx = [...allTx, ...txSnap.docs.map(d => ({ id: d.id, userId: uDoc.id, ...d.data() }))];
        }
        setTransactions(allTx.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

        const globalSnap = await getDocs(collection(photoboothDb, 'presets'));
        const gPresets = globalSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id, ...data, styleName: data.styleName || data.name || 'Unnamed Preset',
            promptFragment: data.promptFragment || data.basePrompt || '',
            thumbnailBase64: data.thumbnailBase64 || data.previewUrl || data.imageUrl || '',
            categories: Array.isArray(data.categories) ? data.categories : (data.category ? [data.category] : [])
          };
        });
        setGlobalPresets(gPresets);
        
        const cats = new Set<string>();
        gPresets.forEach((p: any) => {
          if (Array.isArray(p.categories)) p.categories.forEach((c: string) => cats.add(c));
          else if (p.category) cats.add(p.category);
        });
        if (currentTenant.customCategories) {
          currentTenant.customCategories.forEach((c: string) => cats.add(c));
        }
        setAvailableCategories(Array.from(cats));

        const tenantSnap = await getDocs(collection(db, 'resellers', currentTenant.id, 'PRESETS'));
        const tPresets = tenantSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTenantPresets(tPresets.sort((a:any, b:any) => (b.createdAt || 0) - (a.createdAt || 0)));

        let fetchedPackages: any[] = [];
        try {
          const globalSettingsSnap = await getDocs(collection(db, 'GLOBALSETTINGS'));
          globalSettingsSnap.forEach((doc) => {
            if (doc.data().packages) fetchedPackages = doc.data().packages;
          });
        } catch (e) {
          console.warn("Could not fetch GLOBALSETTINGS (permissions). Using default packages.");
        }
        if (fetchedPackages.length === 0) {
          fetchedPackages = [
            { packageID: 'sa_1', packageName: 'Starter Node', packageCredits: 1000, packagePrice: 500 },
            { packageID: 'sa_2', packageName: 'Growth Node', packageCredits: 3500, packagePrice: 1500 },
            { packageID: 'sa_3', packageName: 'Enterprise', packageCredits: 10000, packagePrice: 4000 }
          ];
        }
        setGlobalPackages(fetchedPackages);

      } catch (error) { console.error("Error fetching data", error); }
    };
    fetchAllData();

    return () => usersUnsub();
  }, [user, currentTenant, navigate]);

  // --- REPLENISH LOGIC ---
  const handleBuyGlobalCredits = async (pkg: any) => {
    if (!currentTenant) return;
    const loadingToast = toast.loading(`Processing purchase for ${pkg.packageName}...`);
    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update Reseller document balance
      await updateDoc(doc(db, 'resellers', currentTenant.id), {
        creditsBalance: increment(pkg.packageCredits)
      });

      // Log global transaction
      await addDoc(collection(db, 'GLOBAL_TRANSACTIONS'), {
        tenantId: currentTenant.id,
        tenantName: currentTenant.brandName,
        packageID: pkg.packageID,
        packageName: pkg.packageName,
        amount: pkg.packagePrice,
        creditsAdded: pkg.packageCredits,
        createdAt: new Date().toISOString(),
        status: 'completed'
      });

      toast.success(`Success! ${pkg.packageCredits} CR added to your workspace.`, { id: loadingToast });
      setShowBuyCreditsModal(false);
    } catch (error) {
      console.error("Replenish Error:", error);
      toast.error("Transaction failed. Please contact SuperAdmin.", { id: loadingToast });
    }
  };

  // --- AI GENERATION LOGIC ---
  const handleGenerateAILogo = async () => {
    if (!currentTenant) return;
    if ((currentTenant.creditsBalance || 0) < 5) {
      toast.error("Insufficient Tenant Credits (Need 5 CR). Please top up SuperAdmin.");
      return;
    }
    setIsGeneratingAILogo(true);
    setGeneratedAILogo(null);
    try {
      // Deduct from tenant balance
      await updateDoc(doc(db, 'resellers', currentTenant.id), { creditsBalance: increment(-5) });
      
      // Mock generation delay 
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      // MOCK AI GENERATION PAYLOAD
      const mockAiLogoUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop';
      setGeneratedAILogo(mockAiLogoUrl);
      toast.success("AI Logo Generated successfully!");
    } catch (e) {
      toast.error("Failed to generate AI logo.");
    } finally {
      setIsGeneratingAILogo(false);
    }
  };

  const handleGenerateAIBg = async () => {
    if (!currentTenant) return;
    if ((currentTenant.creditsBalance || 0) < 5) {
      toast.error("Insufficient Tenant Credits (Need 5 CR). Please top up SuperAdmin.");
      return;
    }
    setIsGeneratingAIBg(true);
    setGeneratedAIBg(null);
    try {
      // Deduct from tenant balance
      await updateDoc(doc(db, 'resellers', currentTenant.id), { creditsBalance: increment(-5) });
      
      // Mock generation delay 
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // MOCK AI GENERATION PAYLOAD
      const mockAiBgUrl = 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1024&auto=format&fit=crop';
      setGeneratedAIBg(mockAiBgUrl);
      toast.success("AI Background Generated successfully!");
    } catch (e) {
      toast.error("Failed to generate AI background.");
    } finally {
      setIsGeneratingAIBg(false);
    }
  };


  // --- METHODS & ACTIONS ---
  const handleVerifyTransaction = async (txId: string, userId: string, credits: number) => {
    if (!currentTenant) return;
    try {
      await updateDoc(doc(db, 'resellers', currentTenant.id, 'users', userId, 'transactions', txId), { status: 'verified' });
      await updateDoc(doc(db, 'resellers', currentTenant.id, 'users', userId), { credits: increment(credits), totalCreditPurchased: increment(credits), lastPurchaseDate: new Date().toISOString() });
      setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'verified' } : t));
      toast.success("Transaction verified and credits awarded.");
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `resellers/${currentTenant.id}`); }
  };

  const handleRejectTransaction = async (txId: string, userId: string) => {
    if (!currentTenant) return;
    try {
      await updateDoc(doc(db, 'resellers', currentTenant.id, 'users', userId, 'transactions', txId), { status: 'rejected' });
      setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'rejected' } : t));
      toast.info("Transaction rejected.");
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `resellers/${currentTenant.id}`); }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    if (!currentTenant) return;
    try { 
      await updateDoc(doc(db, 'resellers', currentTenant.id, 'users', userId), { status: newStatus }); 
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentTenant || !window.confirm("Permanently delete this user record?")) return;
    try { 
      await deleteDoc(doc(db, 'resellers', currentTenant.id, 'users', userId)); 
      toast.success("User deleted permanently.");
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `users/${userId}`); }
  };

  const handleSaveUserCredits = async (userId: string) => {
    if (!currentTenant) return;
    try {
      await updateDoc(doc(db, 'resellers', currentTenant.id, 'users', userId), { credits: tempUserCredits });
      setEditingUserId(null);
      toast.success("User credits updated.");
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`); }
  };

  const handleCreatePromo = async () => {
    if (!newPromo.code || newPromo.credits <= 0 || newPromo.maxUses <= 0 || !currentTenant) {
      toast.error("Please fill all promo fields correctly.");
      return;
    }
    setIsCreatingPromo(true);
    try {
      const newPromoObj = { id: `promo_${Date.now()}`, code: newPromo.code.toUpperCase(), credits: Number(newPromo.credits), maxUses: Number(newPromo.maxUses), currentUses: 0, isActive: true, createdAt: new Date().toISOString() };
      const updatedPromos = [...(settings.promos || []), newPromoObj];
      setSettings({ ...settings, promos: updatedPromos });
      await updateDoc(doc(db, 'resellers', currentTenant.id), { promos: updatedPromos });
      toast.success("Promo code created successfully!");
      setNewPromo({ code: '', credits: 50, maxUses: 100 });
    } catch (error) {
      toast.error("Failed to create promo code.");
    } finally { setIsCreatingPromo(false); }
  };

  const handleTogglePromo = async (promoId: string, currentStatus: boolean) => {
    if (!currentTenant) return;
    try {
      const updatedPromos = (settings.promos || []).map((p: any) => p.id === promoId ? { ...p, isActive: !currentStatus } : p);
      setSettings({ ...settings, promos: updatedPromos });
      await updateDoc(doc(db, 'resellers', currentTenant.id), { promos: updatedPromos });
      toast.success(`Promo ${!currentStatus ? 'activated' : 'deactivated'}.`);
    } catch (error) { toast.error("Failed to update promo."); }
  };

  const handleDeletePromo = async (promoId: string) => {
    if (!currentTenant || !window.confirm("Permanently delete this promo code?")) return;
    try {
      const updatedPromos = (settings.promos || []).filter((p: any) => p.id !== promoId);
      setSettings({ ...settings, promos: updatedPromos });
      await updateDoc(doc(db, 'resellers', currentTenant.id), { promos: updatedPromos });
      toast.success("Promo code deleted.");
    } catch (error) { toast.error("Failed to delete promo."); }
  };

  const handleSaveSettings = async () => {
    if (!currentTenant) return;

    if (Number(settings.costStandard) < 5) { toast.error("Cost per Generation cannot be less than 5 credits."); return; }
    if (Number(settings.costPro) < 10) { toast.error("Cost per PRO Mode cannot be less than 10 credits."); return; }
    if (Number(settings.costEdit) < 5) { toast.error("Cost per Edit cannot be less than 5 credits."); return; }
    if (Number(settings.costRetry) < 5) { toast.error("Cost per Retry cannot be less than 5 credits."); return; }

    setIsSaving(true);
    const loadingToast = toast.loading("Saving configuration...");
    try {
      const formattedPackages = (settings.packages || []).map((p: any) => ({
        ...p, price: Number(p.price) || 0, credits: Number(p.credits) || 0
      }));

      await updateDoc(doc(db, 'resellers', currentTenant.id), {
        brandName: settings.brandName || '', 
        brandName2: settings.brandName2 || '', 
        currency: settings.currency || 'PHP', 
        customTheme: settings.customTheme || 'dark', 
        primaryColor: settings.primaryColor || '#5A5CE6',
        fontFamily: settings.fontFamily || 'inter',
        iconStyle: settings.iconStyle || 'standard', 
        logoFont: settings.logoFont || 'inter',                  
        logoColor: settings.logoColor || '#FFFFFF',              
        logoFont2: settings.logoFont2 || 'inter',                 
        logoColor2: settings.logoColor2 || '#5A5CE6',             
        sloganText: settings.sloganText || '',                    
        footerText: settings.footerText || '',                    
        bgGradientStart: settings.bgGradientStart || '#05050A',  
        bgGradientEnd: settings.bgGradientEnd || '#1A1C2D',      
        logoBase64: settings.logoBase64 || '',
        bgImageBase64: settings.bgImageBase64 || '',
        maintenanceMode: settings.maintenanceMode || false,
        gcashName: settings.gcashName || '', 
        gcashNumber: settings.gcashNumber || '', 
        qrCodeBase64: settings.qrCodeBase64 || '',
        gatewayEnabled: settings.gatewayEnabled || false, 
        gatewaySnippet: settings.gatewaySnippet || '', 
        sampleScreenshotBase64: settings.sampleScreenshotBase64 || '',
        packages: formattedPackages, 
        customCategories: settings.customCategories || [], 
        promos: settings.promos || [],
        costStandard: Number(settings.costStandard) || 5, 
        costDownload: Number(settings.costDownload) || 0, 
        costEdit: Number(settings.costEdit) || 5, 
        costPro: Number(settings.costPro) || 10, 
        costRetry: Number(settings.costRetry) || 5,
        announcementEnabled: settings.announcementEnabled || false, 
        announcementText: settings.announcementText || '', 
        announcementImageBase64: settings.announcementImageBase64 || '',
        botcakeEnabled: settings.botcakeEnabled || false, 
        botcakeHtml: settings.botcakeHtml || '', 
        termsAndConditions: settings.termsAndConditions || '',
        hiddenGlobalPresets: settings.hiddenGlobalPresets || [],
        priceSingle: deleteField(), creditsSingle: deleteField(), priceBargain: deleteField(), creditsBargain: deleteField(), pricePro: deleteField(), creditsPro: deleteField(),
      });
      toast.success('Configurations saved successfully!', { id: loadingToast });
    } catch (error) { 
      toast.error('Failed to save configurations.', { id: loadingToast });
      handleFirestoreError(error, OperationType.UPDATE, `resellers/${currentTenant.id}`); 
    } finally { setIsSaving(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, isPreset: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressedBase64 = await compressImage(reader.result as string);
        if (isPreset) setNewPreset(prev => ({ ...prev, [field]: compressedBase64 }));
        else setSettings(prev => ({ ...prev, [field]: compressedBase64 }));
        toast.success("Image processed successfully.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPackage = () => {
    const newPkg = { id: `pkg_${Date.now()}`, name: 'New Package', price: 0, credits: 0, isPopular: false };
    setSettings({ ...settings, packages: [...(settings.packages || []), newPkg] });
  };
  const handleRemovePackage = (id: string) => { setSettings({ ...settings, packages: settings.packages.filter((p:any) => p.id !== id) }); };
  const handleUpdatePackage = (id: string, field: string, value: any) => { setSettings({ ...settings, packages: settings.packages.map((p:any) => p.id === id ? { ...p, [field]: value } : p) }); };

  const handleAddCustomCategory = async () => {
    if (!customCategoryInput.trim() || !currentTenant) return;
    const newCat = customCategoryInput.trim().toUpperCase();
    const existingCats = settings.customCategories || [];
    if (!existingCats.includes(newCat) && !availableCategories.includes(newCat)) {
      const updatedCats = [...existingCats, newCat];
      setSettings({ ...settings, customCategories: updatedCats });
      setAvailableCategories(prev => [...prev, newCat]);
      await updateDoc(doc(db, 'resellers', currentTenant.id), { customCategories: updatedCats });
      toast.success(`Category ${newCat} added.`);
    }
    setCustomCategoryInput('');
  };

  const handleToggleGlobalPreset = async (presetId: string) => {
    const currentHidden = settings.hiddenGlobalPresets || [];
    const newHidden = currentHidden.includes(presetId) ? currentHidden.filter((id: string) => id !== presetId) : [...currentHidden, presetId];
    setSettings({ ...settings, hiddenGlobalPresets: newHidden });
    if (currentTenant) await updateDoc(doc(db, 'resellers', currentTenant.id), { hiddenGlobalPresets: newHidden });
  };

  const handleSaveTenantPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;
    const loadingToast = toast.loading("Saving custom preset...");
    try {
      const timestamp = Date.now();
      if (editingPresetId) {
        await updateDoc(doc(db, 'resellers', currentTenant.id, 'PRESETS', editingPresetId), { ...newPreset, updatedAt: timestamp });
      } else {
        const newId = `${newPreset.styleName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
        await setDoc(doc(db, 'resellers', currentTenant.id, 'PRESETS', newId), { ...newPreset, isActive: true, createdAt: timestamp, updatedAt: timestamp });
      }
      const tenantSnap = await getDocs(collection(db, 'resellers', currentTenant.id, 'PRESETS'));
      const tPresets = tenantSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTenantPresets(tPresets.sort((a:any, b:any) => (b.createdAt || 0) - (a.createdAt || 0)));
      setNewPreset(defaultPresetState);
      setEditingPresetId(null);
      setGeneratedThumb(null);
      toast.success("Preset saved successfully!", { id: loadingToast });
    } catch (error) { 
      toast.error("Failed to save preset.", { id: loadingToast });
      handleFirestoreError(error, OperationType.CREATE, `resellers/${currentTenant.id}/PRESETS`); 
    }
  };

  const handleToggleTenantPreset = async (id: string, currentStatus: boolean) => {
    if (!currentTenant) return;
    try {
      await updateDoc(doc(db, 'resellers', currentTenant.id, 'PRESETS', id), { isActive: !currentStatus });
      setTenantPresets(tenantPresets.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `resellers/${currentTenant.id}/PRESETS/${id}`); }
  };

  const handleDeleteTenantPreset = async (id: string) => {
    if (!currentTenant || !window.confirm("Permanently delete this custom preset?")) return;
    try {
      await deleteDoc(doc(db, 'resellers', currentTenant.id, 'PRESETS', id));
      setTenantPresets(tenantPresets.filter(p => p.id !== id));
      toast.success("Preset deleted.");
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `resellers/${currentTenant.id}/PRESETS/${id}`); }
  };

  const handleEditTenantPreset = (p: any) => {
    setEditingPresetId(p.id);
    setNewPreset(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTestPromptGeneration = async () => {
    if (!newPreset.promptFragment) { toast.error("Please enter a base prompt first."); return; }
    setIsGeneratingThumb(true);
    setGeneratedThumb(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      setGeneratedThumb('https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=1024&q=100'); 
    } catch (error) { toast.error("Generation failed."); } 
    finally { setIsGeneratingThumb(false); }
  };

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending');
  const verifiedTransactions = transactions.filter(tx => tx.status === 'verified');
  const getOrdersToday = () => transactions.filter(tx => new Date(tx.createdAt).toDateString() === new Date().toDateString()).length;
  const calculateTotalRevenue = () => verifiedTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const calculatePendingRevenue = () => pendingTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const calculateTotalGenerations = () => users.reduce((sum, u) => sum + (Number(u.photosGenerated) || 0), 0);
  const calculateAverageBalance = () => users.length > 0 ? Math.round(users.reduce((sum, u) => sum + (Number(u.credits) || 0), 0) / users.length) : 0;

  if (!currentTenant) return null;

  const maxMeter = Math.max(1000, (currentTenant.creditsBalance || 0) + 500);
  const meterPercentage = Math.min(((currentTenant.creditsBalance || 0) / maxMeter) * 100, 100);
  let meterColor = 'bg-green-500';
  if ((currentTenant.creditsBalance || 0) < 100) meterColor = 'bg-red-500';
  else if ((currentTenant.creditsBalance || 0) < 300) meterColor = 'bg-yellow-500';

  const tabState = {
    settings, currentTenant, users, transactions, pendingTransactions, verifiedTransactions, 
    globalPresets, tenantPresets, availableCategories, customCategoryInput, editingPresetId, 
    newPreset, isGeneratingThumb, generatedThumb, isSaving, newPromo, isCreatingPromo, 
    editingUserId, tempUserCredits, meterColor, meterPercentage, setShowBuyCreditsModal,
    isGeneratingAILogo, generatedAILogo, isGeneratingAIBg, generatedAIBg, bgPrompt
  };

  const tabMethods = {
    setSettings, handleSaveSettings, handleImageUpload, handleAddPackage, handleRemovePackage, handleUpdatePackage,
    handleAddCustomCategory, handleToggleGlobalPreset, handleSaveTenantPreset, handleToggleTenantPreset, handleDeleteTenantPreset, handleEditTenantPreset, handleTestPromptGeneration, setNewPreset, setEditingPresetId, setGeneratedThumb, setCustomCategoryInput,
    handleVerifyTransaction, handleRejectTransaction, handleUpdateUserStatus, handleDeleteUser, handleSaveUserCredits, setEditingUserId, setTempUserCredits,
    handleCreatePromo, handleTogglePromo, handleDeletePromo, setNewPromo,
    calculateTotalRevenue, calculatePendingRevenue, calculateTotalGenerations, calculateAverageBalance, getOrdersToday,
    setActiveTab, setIsSidebarOpen, downloadImage, handleGenerateAILogo, handleGenerateAIBg, setBgPrompt, setGeneratedAILogo, setGeneratedAIBg, handleBuyGlobalCredits
  };

  const NavGroup = ({ title, items }: { title: string, items: { id: string, label: string, icon: any, badge?: number }[] }) => (
    <div className="mb-8">
      <p className={cn(theme.textLabel, "mb-3 px-4")} style={poppinsFont}>{title}</p>
      <div className="space-y-1">
        {items.map(item => (
          <button 
            key={item.id} 
            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); window.scrollTo(0,0); }}
            className={cn(`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-bold tracking-wide uppercase transition-all duration-300`, activeTab === item.id ? 'bg-[#5A5CE6] text-white shadow-[0_4px_15px_rgba(90,92,230,0.3)]' : 'text-neutral-400 hover:bg-[#151828] hover:text-white hover:translate-x-1')}
          >
            <div className="flex items-center gap-3"><item.icon className="w-5 h-5" strokeWidth={1.5} /> {item.label}</div>
            {item.badge !== undefined && item.badge > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{item.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn(`min-h-[100dvh] flex font-sans overflow-hidden`, theme.bgApp)} style={interFont}>
      <Toaster theme="dark" position="top-center" richColors />

      {/* MODALS */}
      <AnimatePresence>
        {showCreditWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={cn(`p-6 md:p-8 rounded-[2rem] max-w-md w-full shadow-2xl text-center border`, theme.bgCard, theme.borderSubtle)}>
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className={theme.textH1} style={poppinsFont}>Zero Credits</h3>
              <p className={cn(theme.textBody, "mb-8")}>Your tenant account has depleted all its operational credits. Users cannot generate images until you replenish your balance.</p>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <button onClick={() => setShowCreditWarning(false)} className={theme.btnSecondary}>Dismiss</button>
                <button onClick={() => { setShowCreditWarning(false); setShowBuyCreditsModal(true); }} className={cn(theme.btnPrimary, "bg-red-600 hover:bg-red-500 shadow-red-600/30")}>Buy Now</button>
              </div>
            </motion.div>
          </div>
        )}

        {showBuyCreditsModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
             <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className={cn(`p-6 md:p-8 rounded-[2rem] max-w-4xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto hide-scrollbar border border-[#5A5CE6]/30`, theme.bgApp)}>
                <button onClick={() => setShowBuyCreditsModal(false)} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                <div className="text-center mb-8 mt-2">
                   <div className="w-16 h-16 bg-[#5A5CE6]/20 rounded-full flex items-center justify-center mx-auto mb-4"><CoinsIcon className="w-8 h-8 text-[#5A5CE6]" /></div>
                   <h2 className={theme.textH1} style={poppinsFont}>Replenish Credits</h2>
                   <p className={theme.textBody}>Fuel your workspace. Select a global package to add generation capacity to your studio.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {globalPackages.map((pkg) => (
                      <motion.div whileHover={{ scale: 1.02, y: -5 }} key={pkg.packageID} className={cn(`border border-[#5A5CE6]/30 p-6 rounded-[2rem] transition-all group flex flex-col justify-between shadow-lg`, theme.bgCard)}>
                         <div>
                            <p className={theme.textLabel}>{pkg.packageName}</p>
                            <p className="text-4xl font-black text-white mt-2 mb-4 tracking-tighter" style={poppinsFont}>{pkg.packageCredits} <span className="text-sm text-neutral-500 font-medium">CR</span></p>
                         </div>
                         <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-4">
                            <p className="text-xl font-bold text-white tracking-wide">₱{pkg.packagePrice}</p>
                            <button onClick={() => handleBuyGlobalCredits(pkg)} className={theme.btnPrimary + " shadow-none py-3 text-xs"}>Buy Package</button>
                         </div>
                      </motion.div>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <aside className={cn(`fixed inset-y-0 left-0 z-50 w-72 border-r flex flex-col h-[100dvh] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`, theme.bgApp, theme.borderSubtle)}>
        <div className={cn(`p-6 flex justify-between items-center border-b`, theme.borderSubtle)}>
          <div>
            <h1 className={cn(theme.textH3, "truncate")} style={poppinsFont}>{currentTenant.brandName || 'ADMIN'}</h1>
            <p className={theme.textLabel}>Workspace</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-neutral-400"><X className="w-5 h-5" /></button>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto hide-scrollbar">
          <NavGroup title="Dashboard" items={[{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'insights', label: 'Insights', icon: BarChart3 }]} />
          <NavGroup title="Operations" items={[{ id: 'queue', label: 'Verification Queue', icon: CreditCard, badge: pendingTransactions.length }, { id: 'users', label: 'User Management', icon: Users }, { id: 'support', label: 'Support & Bots', icon: MessageSquare }]} />
          <NavGroup title="Growth" items={[{ id: 'promos', label: 'Promo Campaigns', icon: Ticket }, { id: 'referrals', label: 'Referrals', icon: Gift }]} />
          <NavGroup title="Economy" items={[{ id: 'pricing', label: 'Packages Pricing', icon: Tag }, { id: 'payment', label: 'Payment Setup', icon: Wallet }, { id: 'costs', label: 'Credit System', icon: CoinsIcon }]} />
          <NavGroup title="Customization" items={[
            { id: 'theme', label: 'Theme & Branding', icon: Palette },
            { id: 'presets', label: 'Styles & Presets', icon: Wand2 }, 
            { id: 'settings', label: 'General Settings', icon: Settings }, 
            { id: 'system', label: 'System & Data', icon: Database }
          ]} />
        </nav>

        <div className={cn(`p-4 border-t shrink-0`, theme.borderSubtle)}>
          <button onClick={() => { logOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-bold tracking-wide uppercase text-neutral-400 hover:bg-[#151828] transition-colors">
            <LogOut className="w-5 h-5" strokeWidth={1.5} /> Exit Workspace
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden w-full relative">
        <header className={cn(`md:hidden shrink-0 border-b p-4 flex items-center gap-3 pt-safe`, theme.bgApp, theme.borderSubtle)}>
          <button onClick={() => setIsSidebarOpen(true)} className="text-neutral-400"><Menu className="w-6 h-6" /></button>
          <h1 className={theme.textH3} style={poppinsFont}>{currentTenant.brandName}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-safe">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial="hidden" animate="show" exit="hidden" variants={containerVariants} className="max-w-6xl mx-auto">
              
              {/* ROUTING TO YOUR EXTRACTED COMPONENTS */}
              {activeTab === 'overview' && <OverviewTab state={tabState} methods={tabMethods} />}
              {activeTab === 'insights' && <InsightsTab state={tabState} methods={tabMethods} />}
              {activeTab === 'queue' && <QueueTab state={tabState} methods={tabMethods} />}
              {activeTab === 'users' && <UsersTab state={tabState} methods={tabMethods} />}
              {activeTab === 'promos' && <PromosTab state={tabState} methods={tabMethods} />}
              {activeTab === 'support' && <SupportTab state={tabState} methods={tabMethods} />}
              {activeTab === 'referrals' && <ReferralsTab state={tabState} methods={tabMethods} />}
              {activeTab === 'payment' && <PaymentSetupTab state={tabState} methods={tabMethods} />}
              {activeTab === 'pricing' && <PricingTab state={tabState} methods={tabMethods} />}
              {activeTab === 'presets' && <PresetsTab state={tabState} methods={tabMethods} />}
              {activeTab === 'costs' && <CostsTab state={tabState} methods={tabMethods} />}
              {activeTab === 'theme' && <ThemeTab state={tabState} methods={tabMethods} />}
              {activeTab === 'settings' && <SettingsTab state={tabState} methods={tabMethods} />}
              {activeTab === 'system' && <SystemTab state={tabState} methods={tabMethods} />}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}