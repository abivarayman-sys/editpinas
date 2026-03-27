import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';
import { db, photoboothDb, handleFirestoreError, OperationType, logOut, signInWithGoogle } from '../firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Reseller } from '../store/useTenantStore';
import { Shield, Users, Image as ImageIcon, Plus, Trash2, LogOut, Menu, X, Upload, Edit2, Eye, EyeOff, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function SuperAdmin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'resellers' | 'presets' | 'packages'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  
  const [newReseller, setNewReseller] = useState<Partial<Reseller>>({ brandName: '', subdomain: '', creditsBalance: 0, maintenanceMode: false, ownerUid: '' });
  const [createError, setCreateError] = useState<string | null>(null);
  const [resellerToDelete, setResellerToDelete] = useState<string | null>(null);

  // Global Packages State
  const [globalPackages, setGlobalPackages] = useState<any[]>([]);
  const [globalSettingsId, setGlobalSettingsId] = useState('main');
  const [newPackage, setNewPackage] = useState({ packageID: '', packageName: '', packageCredits: 0, packagePrice: 0 });
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // Preset State
  const defaultPresetState = { 
    styleName: '', 
    promptFragment: '', 
    thumbnailBase64: '',
    instructionText: '',
    instructionImageBase64: '',
    isActive: true
  };
  const [newPreset, setNewPreset] = useState(defaultPresetState);
  const [presetCategoryInput, setPresetCategoryInput] = useState(''); 
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

  const isSuperAdmin = user?.email === 'abivarayman@gmail.com';

  useEffect(() => {
    if (!user || !isSuperAdmin) return;
    fetchData();
  }, [user, isSuperAdmin]);

  const fetchData = async () => {
    try {
      // 1. Fetch Resellers
      const resSnap = await getDocs(collection(db, 'resellers'));
      setResellers(resSnap.docs.map(d => ({ id: d.id, ...d.data() } as Reseller)));

      // 2. Fetch Global Presets
      const preSnap = await getDocs(collection(photoboothDb, 'presets'));
      setPresets(preSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          styleName: data.styleName || data.name || 'Unnamed Preset',
          promptFragment: data.promptFragment || data.basePrompt || '',
          thumbnailBase64: data.thumbnailBase64 || data.previewUrl || '',
          categories: Array.isArray(data.categories) ? data.categories : (data.category ? [data.category] : []),
          instructionText: data.instructionText || '',
          instructionImageBase64: data.instructionImageBase64 || '',
          isActive: data.isActive !== false
        };
      }));

      // 3. Fetch Global Packages
      const gsSnap = await getDocs(collection(db, 'GLOBALSETTINGS'));
      if (!gsSnap.empty) {
        setGlobalSettingsId(gsSnap.docs[0].id);
        setGlobalPackages(gsSnap.docs[0].data().packages || []);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'resellers/presets/packages');
    }
  };

  // --- Reseller Operations ---
  const handleCreateReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      const newId = newReseller.subdomain?.toLowerCase().trim();
      if (!newId) return;
      
      await setDoc(doc(db, 'resellers', newId), {
        ...newReseller, subdomain: newId, creditsBalance: Number(newReseller.creditsBalance) || 0,
        maintenanceMode: false, priceSingle: 50, creditsSingle: 1,
        announcementEnabled: false, announcementImageBase64: "", announcementText: "",
        costDownload: 0, costEdit: 0, costPro: 0, costRetry: 0, costStandard: 0,
        creditsBargain: 0, creditsEdit: 0, creditsPro: 0, creditsRetry: 0, creditsStandard: 0,
        gcashName: "", gcashNumber: "", priceBargain: 0, pricePro: 0, qrCodeBase64: "", qrCodeUrl: "",
        referralEnabled: false, rewardInvited: 0, rewardInviter: 0, totalPhotosGenerated: 0
      });
      
      setNewReseller({ brandName: '', subdomain: '', creditsBalance: 0, ownerUid: '', maintenanceMode: false });
      toast.success("Reseller tenant created successfully!");
      fetchData();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : String(error));
      handleFirestoreError(error, OperationType.CREATE, 'resellers');
    }
  };

  const handleAddCredits = async (id: string, amount: number) => {
    try {
      await updateDoc(doc(db, 'resellers', id), { creditsBalance: increment(amount) });
      toast.success(`Added ${amount} credits to tenant!`);
      fetchData();
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `resellers/${id}`); }
  };

  const confirmDeleteReseller = async () => {
    if (!resellerToDelete) return;
    try {
      await deleteDoc(doc(db, 'resellers', resellerToDelete));
      setResellerToDelete(null);
      toast.success("Reseller deleted!");
      fetchData();
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `resellers/${resellerToDelete}`); }
  };

  // --- Package Operations ---
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedPkgs = [...globalPackages];
      if (editingPackageId) {
        updatedPkgs = updatedPkgs.map(p => p.packageID === editingPackageId ? newPackage : p);
      } else {
        updatedPkgs.push({ ...newPackage, packageID: `sa_${Date.now()}` });
      }
      await setDoc(doc(db, 'GLOBALSETTINGS', globalSettingsId), { packages: updatedPkgs }, { merge: true });
      setGlobalPackages(updatedPkgs);
      setNewPackage({ packageID: '', packageName: '', packageCredits: 0, packagePrice: 0 });
      setEditingPackageId(null);
      toast.success(editingPackageId ? "Package updated!" : "Package created!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'GLOBALSETTINGS');
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      const updatedPkgs = globalPackages.filter(p => p.packageID !== id);
      await setDoc(doc(db, 'GLOBALSETTINGS', globalSettingsId), { packages: updatedPkgs }, { merge: true });
      setGlobalPackages(updatedPkgs);
      toast.success("Package deleted!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'GLOBALSETTINGS');
    }
  };

  const handleEditPackage = (pkg: any) => {
    setNewPackage(pkg);
    setEditingPackageId(pkg.packageID);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Image Upload Handler ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnailBase64' | 'instructionImageBase64') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPreset(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Preset CRUD Operations ---
  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoriesArray = presetCategoryInput.split(',').map(c => c.trim()).filter(Boolean);
      const presetDataToSave = { ...newPreset, categories: categoriesArray };

      if (editingPresetId) {
        await updateDoc(doc(photoboothDb, 'presets', editingPresetId), presetDataToSave);
        toast.success("Preset updated!");
      } else {
        const newId = newPreset.styleName.toLowerCase().replace(/\s+/g, '-');
        await setDoc(doc(photoboothDb, 'presets', newId), { ...presetDataToSave, isActive: true });
        toast.success("Preset created!");
      }
      
      setNewPreset(defaultPresetState);
      setPresetCategoryInput('');
      setEditingPresetId(null);
      fetchData();
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'presets'); }
  };

  const handleEditPreset = (preset: any) => {
    setNewPreset(preset);
    setPresetCategoryInput(preset.categories?.join(', ') || '');
    setEditingPresetId(preset.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTogglePresetVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(photoboothDb, 'presets', id), { isActive: !currentStatus });
      fetchData();
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `presets/${id}`); }
  };

  const handleDeletePreset = async (id: string) => {
    if (window.confirm("Are you sure you want to completely delete this preset from the global database?")) {
      try {
        await deleteDoc(doc(photoboothDb, 'presets', id));
        toast.success("Preset deleted!");
        fetchData();
      } catch (error) { handleFirestoreError(error, OperationType.DELETE, `presets/${id}`); }
    }
  };

  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-[100dvh] bg-[#05050A] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-2xl font-black tracking-widest uppercase mb-6">{!user ? 'Super Admin Access' : 'Access Denied'}</h1>
          {!user ? (
            <button onClick={signInWithGoogle} className="px-8 py-4 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold tracking-widest uppercase transition-colors shadow-lg shadow-white/10">Login with Google</button>
          ) : (
            <>
              <p className="mb-6 text-neutral-400">Logged in as <span className="text-white font-bold">{user.email}</span>. Please use the master account.</p>
              <button onClick={logOut} className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold tracking-widest uppercase transition-colors">Log Out</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const NavButtons = () => (
    <>
      <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all ${activeTab === 'overview' ? 'bg-white text-black' : 'text-neutral-500 hover:bg-white/5 hover:text-white'}`}>
        <Shield className="w-4 h-4" /> Overview
      </button>
      <button onClick={() => { setActiveTab('resellers'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all ${activeTab === 'resellers' ? 'bg-white text-black' : 'text-neutral-500 hover:bg-white/5 hover:text-white'}`}>
        <Users className="w-4 h-4" /> Resellers
      </button>
      <button onClick={() => { setActiveTab('packages'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all ${activeTab === 'packages' ? 'bg-white text-black' : 'text-neutral-500 hover:bg-white/5 hover:text-white'}`}>
        <Tag className="w-4 h-4" /> Packages
      </button>
      <button onClick={() => { setActiveTab('presets'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all ${activeTab === 'presets' ? 'bg-white text-black' : 'text-neutral-500 hover:bg-white/5 hover:text-white'}`}>
        <ImageIcon className="w-4 h-4" /> Global Presets
      </button>
    </>
  );

  return (
    <div className="min-h-[100dvh] bg-[#05050A] text-white flex font-sans overflow-hidden">
      
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F1020] border-r border-white/10 flex flex-col h-[100dvh] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-lg font-black tracking-widest uppercase text-white">Super Admin</h1>
                <p className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase mt-1">Master Control</p>
              </div>
            </div>
            <div className="bg-black/50 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-1">Your UID</p>
              <p className="text-[10px] font-mono text-neutral-300 break-all select-all">{user.uid}</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 -mr-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto"><NavButtons /></nav>
        <div className="p-4 border-t border-white/10 shrink-0">
          <button onClick={() => { logOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase text-neutral-400 hover:bg-white/5 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden w-full">
        <header className="md:hidden shrink-0 bg-[#0F1020] border-b border-white/10 p-4 flex justify-between items-center z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-black tracking-widest uppercase text-white">Super Admin</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-5xl mx-auto">
              
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase mb-4 md:mb-6 text-white">Global Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    <div className="bg-[#0F1020] border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg">
                      <p className="text-[10px] md:text-xs text-neutral-400 font-bold tracking-widest uppercase mb-2">Resellers</p>
                      <p className="text-2xl md:text-4xl font-black text-white">{resellers.length}</p>
                    </div>
                    <div className="bg-[#0F1020] border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg">
                      <p className="text-[10px] md:text-xs text-neutral-400 font-bold tracking-widest uppercase mb-2">Packages</p>
                      <p className="text-2xl md:text-4xl font-black text-white">{globalPackages.length}</p>
                    </div>
                    <div className="bg-[#0F1020] border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg">
                      <p className="text-[10px] md:text-xs text-neutral-400 font-bold tracking-widest uppercase mb-2">Presets</p>
                      <p className="text-2xl md:text-4xl font-black text-white">{presets.length}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg">
                      <p className="text-[10px] md:text-xs text-neutral-300 font-bold tracking-widest uppercase mb-2">System Status</p>
                      <p className="text-3xl md:text-4xl font-black text-green-400">ONLINE</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'resellers' && (
                <div className="space-y-6 md:space-y-8">
                  <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase mb-2 md:mb-6 text-white">Resellers</h2>
                  
                  <div className="bg-[#0F1020] border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-lg">
                    <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase text-white mb-4 md:mb-6 flex items-center gap-2"><Plus className="w-4 h-4" /> Provision New Tenant</h3>
                    <form onSubmit={handleCreateReseller} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {createError && <div className="md:col-span-2 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-xs md:text-sm">{createError}</div>}
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Brand Name</label>
                        <input required type="text" value={newReseller.brandName} onChange={e => setNewReseller({...newReseller, brandName: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white" placeholder="Cebu Snap" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Subdomain (ID)</label>
                        <input required type="text" value={newReseller.subdomain} onChange={e => setNewReseller({...newReseller, subdomain: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-white text-white" placeholder="cebu" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Owner UID</label>
                        <input required type="text" value={newReseller.ownerUid} onChange={e => setNewReseller({...newReseller, ownerUid: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-white text-white" placeholder="Firebase UID" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Initial Credits</label>
                        <input required type="number" value={newReseller.creditsBalance} onChange={e => setNewReseller({...newReseller, creditsBalance: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-white text-white" />
                      </div>
                      <div className="md:col-span-2 pt-2">
                        <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full py-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs md:text-sm uppercase tracking-wider shadow-lg shadow-white/10">Create Tenant</motion.button>
                      </div>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {resellers.map(r => (
                      <div key={r.id} className="bg-[#0F1020] border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                        <div className="truncate">
                          <p className="text-base md:text-lg font-bold text-white truncate">{r.brandName}</p>
                          <p className="text-[10px] md:text-xs font-mono text-neutral-400 mt-1 truncate">{r.subdomain}.editpinas.app</p>
                          <p className="text-[8px] md:text-[10px] font-mono text-neutral-500 mt-1 truncate">UID: {r.ownerUid}</p>
                        </div>
                        <div className="flex flex-row md:items-center justify-between md:justify-end gap-4 border-t border-white/5 pt-4 md:border-0 md:pt-0 mt-2 md:mt-0">
                          <div className="text-left md:text-right">
                            <p className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-0.5 md:mb-1">Credits</p>
                            <p className="text-lg md:text-xl font-black font-mono text-white">{r.creditsBalance}</p>
                          </div>
                          <div className="flex gap-2">
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAddCredits(r.id, 100)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white">
                              +100
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAddCredits(r.id, 1000)} className="px-3 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                              +1K
                            </motion.button>
                            {/* CUSTOM CREDIT REPLENISH BUTTON */}
                            <motion.button 
                              whileTap={{ scale: 0.95 }} 
                              onClick={() => {
                                const amt = window.prompt("Enter exact amount of credits to add:");
                                if (amt && !isNaN(Number(amt)) && Number(amt) > 0) handleAddCredits(r.id, Number(amt));
                              }} 
                              className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-[10px] md:text-xs font-bold uppercase tracking-wider text-indigo-300"
                            >
                              + Custom
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setResellerToDelete(r.id)} className="p-2 md:p-3 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 ml-1 transition-colors">
                              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'packages' && (
                <div className="space-y-6 md:space-y-8">
                  <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase mb-2 md:mb-6 text-white">Credit Packages</h2>
                  
                  <div className="bg-[#0F1020] border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-lg relative">
                    <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase text-white mb-4 md:mb-6 flex items-center gap-2">
                      {editingPackageId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                      {editingPackageId ? 'Edit Package' : 'Create Package'}
                    </h3>
                    
                    {editingPackageId && (
                      <button 
                        onClick={() => { setNewPackage({ packageID: '', packageName: '', packageCredits: 0, packagePrice: 0 }); setEditingPackageId(null); }}
                        className="absolute top-5 right-5 text-[10px] uppercase font-bold text-neutral-400 hover:text-white"
                      >
                        Cancel Edit
                      </button>
                    )}

                    <form onSubmit={handleSavePackage} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Package Name</label>
                        <input required type="text" value={newPackage.packageName} onChange={e => setNewPackage({...newPackage, packageName: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white" placeholder="e.g. Starter Node" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Credits Amount</label>
                        <input required type="number" value={newPackage.packageCredits} onChange={e => setNewPackage({...newPackage, packageCredits: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Price (₱ / $)</label>
                        <input required type="number" value={newPackage.packagePrice} onChange={e => setNewPackage({...newPackage, packagePrice: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white" />
                      </div>
                      <div className="md:col-span-3 pt-2">
                        <motion.button whileTap={{ scale: 0.95 }} type="submit" className={`w-full py-4 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider transition-colors shadow-lg ${editingPackageId ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'bg-white hover:bg-neutral-200 text-black'}`}>
                          {editingPackageId ? 'Update Package' : 'Save Package'}
                        </motion.button>
                      </div>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {globalPackages.map(pkg => (
                      <div key={pkg.packageID} className="bg-[#0F1020] border border-white/10 p-5 rounded-2xl md:rounded-3xl shadow-lg flex flex-col justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">{pkg.packageName}</h4>
                          <p className="text-2xl font-black text-indigo-400 mb-2">{pkg.packageCredits} <span className="text-sm text-neutral-500">CR</span></p>
                          <p className="text-sm text-white font-mono mb-4">Price: {pkg.packagePrice}</p>
                        </div>
                        <div className="flex gap-2 border-t border-white/5 pt-4">
                          <button onClick={() => handleEditPackage(pkg)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase text-white transition-colors flex items-center justify-center gap-2">
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={() => handleDeletePackage(pkg.packageID)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'presets' && (
                <div className="space-y-6 md:space-y-8">
                  <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase mb-2 md:mb-6 text-white">Global Presets</h2>
                  
                  {/* Create / Edit Preset Form */}
                  <div className="bg-[#0F1020] border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-lg relative">
                    <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase text-white mb-4 md:mb-6 flex items-center gap-2">
                      {editingPresetId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                      {editingPresetId ? 'Edit Preset' : 'Add New Preset'}
                    </h3>
                    
                    {editingPresetId && (
                      <button 
                        onClick={() => { setNewPreset(defaultPresetState); setPresetCategoryInput(''); setEditingPresetId(null); }}
                        className="absolute top-5 right-5 text-[10px] uppercase font-bold text-neutral-400 hover:text-white"
                      >
                        Cancel Edit
                      </button>
                    )}

                    <form onSubmit={handleSavePreset} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Style Name</label>
                          <input required type="text" value={newPreset.styleName} onChange={e => setNewPreset({...newPreset, styleName: e.target.value})} disabled={!!editingPresetId} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Categories (Comma-separated)</label>
                          <input required type="text" value={presetCategoryInput} onChange={e => setPresetCategoryInput(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white" placeholder="e.g. Neon, Sci-Fi, Dark" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Prompt Fragment (AI Instructions)</label>
                        <textarea required value={newPreset.promptFragment} onChange={e => setNewPreset({...newPreset, promptFragment: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white min-h-[80px]" />
                      </div>

                      <div className="p-4 border border-white/5 bg-white/5 rounded-xl space-y-4">
                        <h4 className="text-[10px] font-bold tracking-widest text-white uppercase flex items-center gap-2">
                          Special Instructions (Pop-up Card)
                        </h4>
                        <div>
                          <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Instruction Text</label>
                          <textarea value={newPreset.instructionText} onChange={e => setNewPreset({...newPreset, instructionText: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white text-white min-h-[60px]" placeholder="e.g. Please look directly at the camera and keep a straight face..." />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Instruction Image (Guide)</label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center justify-center gap-2 bg-black border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors">
                              <Upload className="w-4 h-4 text-neutral-400" />
                              <span className="text-[10px] md:text-xs font-bold uppercase text-neutral-400">Upload Image</span>
                              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'instructionImageBase64')} className="hidden" />
                            </label>
                            {newPreset.instructionImageBase64 && <img src={newPreset.instructionImageBase64} alt="Instruction Preview" className="h-10 w-10 object-cover rounded border border-white/20" />}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Thumbnail Cover Image</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center justify-center gap-2 w-full bg-black border border-white/10 rounded-xl px-4 py-4 cursor-pointer hover:bg-white/5 transition-colors">
                            <Upload className="w-4 h-4 text-neutral-400" />
                            <span className="text-[10px] md:text-xs font-bold uppercase text-neutral-400">Upload Thumbnail</span>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnailBase64')} className="hidden" />
                          </label>
                          {newPreset.thumbnailBase64 && <img src={newPreset.thumbnailBase64} alt="Thumbnail Preview" className="h-12 w-12 object-cover rounded border border-white/20 shrink-0" />}
                        </div>
                      </div>

                      <div className="pt-2">
                        <motion.button whileTap={{ scale: 0.95 }} type="submit" className={`w-full py-4 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider transition-colors shadow-lg ${editingPresetId ? 'bg-indigo-500 text-white shadow-indigo-500/20 hover:bg-indigo-400' : 'bg-white hover:bg-neutral-200 text-black shadow-white/10'}`}>
                          {editingPresetId ? 'Update Preset' : 'Save New Preset'}
                        </motion.button>
                      </div>
                    </form>
                  </div>

                  {/* Presets List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {presets.map(p => (
                      <div key={p.id} className={`bg-[#0F1020] border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden group shadow-lg flex flex-col transition-all duration-300 ${p.isActive === false ? 'opacity-40 grayscale' : ''}`}>
                        <div className="aspect-[4/3] bg-black relative">
                          {p.thumbnailBase64 ? (
                            <img src={p.thumbnailBase64} alt={p.styleName} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px] font-mono">No Image</div>
                          )}
                          
                          {/* Top Right Controls (Hide/Show & Delete) */}
                          <div className="absolute top-2 right-2 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleTogglePresetVisibility(p.id, p.isActive !== false)} className="p-1.5 md:p-2 bg-black/80 hover:bg-black text-white rounded-lg shadow-lg">
                              {p.isActive !== false ? <Eye className="w-3 h-3 md:w-4 md:h-4" /> : <EyeOff className="w-3 h-3 md:w-4 md:h-4 text-red-400" />}
                            </button>
                            <button onClick={() => handleDeletePreset(p.id)} className="p-1.5 md:p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg shadow-lg">
                              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </div>

                          {/* Top Left Status Badge */}
                          {p.isActive === false && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded">Hidden</div>
                          )}
                        </div>
                        
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start">
                            <div className="truncate pr-2 w-full">
                              <p className="font-bold text-sm md:text-lg leading-tight text-white truncate">{p.styleName}</p>
                              {/* Multiple Category Badges */}
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {p.categories.map((cat: string, i: number) => (
                                  <span key={i} className="text-[8px] md:text-[10px] font-bold tracking-widest text-neutral-400 border border-neutral-700 bg-neutral-800/50 px-1.5 py-0.5 rounded uppercase">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button onClick={() => handleEditPreset(p)} className="p-2 bg-white/5 hover:bg-white/20 rounded-lg transition-colors shrink-0">
                              <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </div>
                          
                          <p className="text-[10px] md:text-xs text-neutral-500 mt-3 line-clamp-2 leading-snug">{p.promptFragment}</p>
                          
                          {(p.instructionText || p.instructionImageBase64) && (
                            <div className="mt-auto pt-3 flex items-center gap-1.5 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                              <ImageIcon className="w-3 h-3" /> Has Pop-up Instructions
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {resellerToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0F1020] border border-red-500/30 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl shadow-red-500/10">
            <h3 className="text-lg md:text-xl font-black tracking-widest uppercase text-red-500 mb-3 md:mb-4">Confirm Deletion</h3>
            <p className="text-xs md:text-sm text-neutral-300 mb-6 md:mb-8 leading-relaxed">
              Are you absolutely sure you want to delete <span className="font-bold text-white">"{resellerToDelete}"</span>? This action is permanent.
            </p>
            <div className="flex gap-3 md:gap-4">
              <button onClick={() => setResellerToDelete(null)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs md:text-sm font-bold uppercase tracking-wider text-white transition-colors">Cancel</button>
              <button onClick={confirmDeleteReseller} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition-colors">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}