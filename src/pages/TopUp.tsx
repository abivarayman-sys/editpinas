import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Upload, CheckCircle2, Info, Receipt, Zap, Flame, Crown, Gift, X, Wallet, CreditCard, Clock } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';

// Premium Libraries
import { Toaster, toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useTenantStore } from '../store/useTenantStore';
import { useAuthStore } from '../store/useAuthStore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { theme } from '../theme.config';

// Clean Utility for safely merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

export default function TopUp() {
  const { currentTenant, currentUserData, setCurrentUserData } = useTenantStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<'packages' | 'payment' | 'success'>('packages');
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [showSoonModal, setShowSoonModal] = useState(false);
  const [showSampleReceiptModal, setShowSampleReceiptModal] = useState(false);
  const [isNumberCopied, setIsNumberCopied] = useState(false);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- PROMO CODE STATE ---
  const [promoCode, setPromoCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  if (!currentTenant || !currentUserData || !user) {
    navigate('/');
    return null;
  }

  const packages = currentTenant.packages?.length > 0 ? currentTenant.packages : [
    { id: 'pkg_1', name: 'Starter', price: 20, credits: 20 },
    { id: 'pkg_2', name: 'Bargain', price: 50, credits: 60, isPopular: true },
    { id: 'pkg_3', name: 'Pro', price: 100, credits: 120 }
  ];

  const handleSelectPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setStep('payment');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
        setShowExampleModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyScreenshot = async () => {
    if (!selectedPackage || !screenshotBase64) return;
    setIsVerifying(true);
    
    const loadingToast = toast.loading("Verifying your payment proof...");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await updateDoc(doc(db, 'resellers', currentTenant.id, 'users', currentUserData.uid), {
        credits: increment(selectedPackage.credits),
        totalCreditPurchased: increment(selectedPackage.credits)
      });
      await addDoc(collection(db, 'resellers', currentTenant.id, 'users', currentUserData.uid, 'transactions'), {
        userId: currentUserData.uid, amount: Number(selectedPackage.price), credits: selectedPackage.credits, status: 'verified', isDevMode: true, createdAt: new Date().toISOString()
      });
      setCurrentUserData({ ...currentUserData, credits: (currentUserData.credits || 0) + selectedPackage.credits } as any);
      
      toast.success("Payment verified successfully!", { id: loadingToast });
      setStep('success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `resellers/${currentTenant.id}/users/${currentUserData.uid}/transactions`);
      toast.error("Failed to process transaction.", { id: loadingToast });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGatewayClick = () => {
    if (!currentTenant.gatewaySnippet || currentTenant.gatewaySnippet.trim() === '') {
      setShowSoonModal(true);
    } else {
      toast.loading(`Redirecting to secure gateway to pay ₱${selectedPackage?.price}...`, { duration: 2000 });
    }
  };

  const handleCopyNumber = () => {
    const numberToCopy = currentTenant.gcashNumber || '0000 000 0000';
    navigator.clipboard.writeText(numberToCopy);
    setIsNumberCopied(true);
    toast.success("GCash number copied to clipboard!");
    setTimeout(() => setIsNumberCopied(false), 3000);
  };

  const getPackageIcon = (index: number) => {
    if (index === 0) return <Zap className="w-5 h-5 text-blue-400" />;
    if (index === 1) return <Flame className="w-5 h-5 text-orange-400" />;
    return <Crown className="w-5 h-5 text-green-400" />;
  };

  // --- PROMO CODE REDEMPTION LOGIC ---
  const handleRedeemPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code.");
      return;
    }

    setIsRedeeming(true);
    const codeToRedeem = promoCode.toUpperCase().trim();
    const loadingToast = toast.loading("Verifying promo code...");

    try {
      // 1. Fetch fresh tenant data to get accurate usage counts
      const tenantRef = doc(db, 'resellers', currentTenant.id);
      const tenantSnap = await getDoc(tenantRef);
      if (!tenantSnap.exists()) throw new Error("Tenant not found");
      
      const tenantData = tenantSnap.data();
      const promos = tenantData.promos || [];
      
      // 2. Validate Promo Code existence and rules
      const matchedPromo = promos.find((p: any) => p.code === codeToRedeem);

      if (!matchedPromo) {
        toast.error("Invalid Promo Code.", { id: loadingToast });
        setIsRedeeming(false);
        return;
      }
      if (!matchedPromo.isActive) {
        toast.error("This promo code is no longer active.", { id: loadingToast });
        setIsRedeeming(false);
        return;
      }
      if (matchedPromo.currentUses >= matchedPromo.maxUses) {
        toast.error("This promo code has reached its maximum usage limit.", { id: loadingToast });
        setIsRedeeming(false);
        return;
      }

      // 3. Check if user already redeemed this specific code
      const redemptionRef = doc(db, 'resellers', currentTenant.id, 'users', user.uid, 'redeemedPromos', matchedPromo.id);
      const redemptionSnap = await getDoc(redemptionRef);
      
      if (redemptionSnap.exists()) {
        toast.error("You have already used this promo code.", { id: loadingToast });
        setIsRedeeming(false);
        return;
      }

      // 4. Apply Reward! Increment user credits
      await updateDoc(doc(db, 'resellers', currentTenant.id, 'users', user.uid), {
        credits: increment(matchedPromo.credits)
      });

      // 5. Save redemption record to prevent reuse
      await setDoc(redemptionRef, {
        code: matchedPromo.code,
        redeemedAt: new Date().toISOString(),
        creditsAwarded: matchedPromo.credits
      });

      // 6. Update global promo usage count in the reseller document
      const updatedPromos = promos.map((p: any) => 
        p.id === matchedPromo.id ? { ...p, currentUses: (p.currentUses || 0) + 1 } : p
      );
      await updateDoc(tenantRef, { promos: updatedPromos });

      // 7. Update UI State instantly
      setCurrentUserData({ ...currentUserData, credits: (currentUserData.credits || 0) + matchedPromo.credits } as any);
      setPromoCode('');

      toast.success(`Success! Added ${matchedPromo.credits} Credits to your account.`, { id: loadingToast });

    } catch (error) {
      console.error(error);
      toast.error("System error redeeming code. Please try again.", { id: loadingToast });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className={cn("min-h-[100dvh] flex items-center justify-center p-4 sm:p-8 font-sans relative", theme.bgApp)}>
      <Toaster theme="dark" position="top-center" richColors />

      {/* SAMPLE RECEIPT MODAL (Pre-Upload) */}
      <AnimatePresence>
        {showSampleReceiptModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={cn("p-6 rounded-[2rem] max-w-sm w-full shadow-2xl border", theme.bgCard, theme.borderSubtle)}>
              <div className="flex items-center gap-2 text-neutral-200 mb-4">
                <Info className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
                <h3 className={cn(theme.textH3)}>Sample Receipt</h3>
              </div>
              
              <div className="w-full aspect-[4/5] bg-[#0F1020] rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center border border-white/5">
                {currentTenant.sampleScreenshotBase64 ? (
                  <img src={currentTenant.sampleScreenshotBase64} alt="Sample Screenshot" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Receipt className="w-12 h-12 text-neutral-600 mx-auto mb-2" />
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">No sample provided</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowSampleReceiptModal(false)} className="flex-1 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-colors border border-white/5">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowSampleReceiptModal(false);
                    fileInputRef.current?.click();
                  }} 
                  className={cn(theme.btnPrimary, "flex-1 py-3.5 shadow-none")}
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOON TO BE AVAILABLE MODAL */}
      <AnimatePresence>
        {showSoonModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={cn("p-8 rounded-[2rem] max-w-sm w-full shadow-2xl text-center flex flex-col items-center border", theme.bgCard, theme.borderSubtle)}>
              <div className="w-16 h-16 bg-[#5A5CE6]/10 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-[#5A5CE6]" />
              </div>
              <h3 className="text-xl font-black tracking-wide text-white uppercase mb-2">Soon to be available</h3>
              <p className={cn(theme.textBody, "mb-8")}>
                The automated payment gateway is currently being configured by the administrator and will be available shortly. Please use manual transfer for now.
              </p>
              <button onClick={() => setShowSoonModal(false)} className={cn(theme.btnWhite, "w-full py-4 shadow-none")}>
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Outer Floating Container */}
      <div className={cn("w-full max-w-md rounded-[2rem] relative flex flex-col shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar border", theme.bgCard, theme.borderSubtle)}>
        
        {/* Universal Header */}
        <header className="pt-8 px-6 pb-6 flex flex-col items-center relative shrink-0">
          <button onClick={() => step === 'payment' ? setStep('packages') : navigate(-1)} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="bg-[#0052FE] px-5 py-1.5 rounded flex items-center justify-center mb-5 shadow-lg">
            <span className="text-white font-bold text-lg tracking-tight flex items-center gap-1.5">
              <span className="bg-white text-[#0052FE] rounded-full w-5 h-5 flex items-center justify-center text-xs font-black">G</span> GCash
            </span>
          </div>
          
          <h1 className={cn(theme.textH1)} style={poppinsFont}>
            {step === 'packages' ? 'G-CASH PAYMENT' : step === 'payment' ? 'UPLOAD RECEIPT' : 'SUCCESS'}
          </h1>
        </header>

        {/* Main Content Area */}
        <main className="px-6 pb-8 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: PACKAGES */}
            {step === 'packages' && (
              <motion.div key="packages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                
                <div className="bg-[#1A1C2D] border border-white/5 rounded-3xl flex items-center justify-between py-5 px-6 mb-2 shadow-inner">
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 tracking-widest uppercase mb-1">Balance</p>
                    <p className="text-2xl font-black text-white tracking-wide" style={poppinsFont}>{currentUserData.credits} Credits</p>
                  </div>
                  <button onClick={() => navigate(`/engine?tenant=${currentTenant.subdomain}`)} className={cn(theme.btnWhite, "px-5 py-2.5 shadow-none")}>Go to Studio</button>
                </div>

                {packages.map((pkg: any, i: number) => (
                  <button key={pkg.id} onClick={() => handleSelectPackage(pkg)} className="w-full flex items-center justify-between p-5 rounded-3xl bg-[#1C1F33] border border-white/5 hover:border-white/10 hover:bg-[#22263D] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#151828] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        {getPackageIcon(i)}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className={cn(theme.textH3)}>{pkg.name}</h3>
                          <span className="bg-[#0052FE] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">G</span>
                        </div>
                        <p className="text-[10px] font-bold text-indigo-200/40 uppercase tracking-widest mt-1">
                          {i === 0 ? 'Single Save' : i === 1 ? 'Best Value' : 'Bulk Access'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-white tracking-wide" style={poppinsFont}>{currentTenant.currency === 'USD' ? '$' : '₱'}{pkg.price}</p>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">+{pkg.credits} Credits</p>
                    </div>
                  </button>
                ))}

                {/* Promo Code Entry Area */}
                <div className="bg-[#1C1F33] border border-white/5 rounded-3xl p-5 mt-4">
                  <div className="flex items-center gap-2 mb-4 text-indigo-200/60">
                    <Gift className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Have a promo code?</span>
                  </div>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="ENTER CODE" 
                      className={cn("flex-1 rounded-full px-5 text-xs font-bold uppercase text-white placeholder-neutral-600 outline-none focus:border focus:border-[#5A5CE6]/50 transition-colors", theme.bgInput)} 
                    />
                    <button 
                      onClick={handleRedeemPromo}
                      disabled={isRedeeming || !promoCode}
                      className={cn(theme.btnPrimary, "px-6 py-3 shadow-none disabled:opacity-50")}
                    >
                      {isRedeeming ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PAYMENT & UPLOAD */}
            {step === 'payment' && selectedPackage && (
              <motion.div key="payment" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="w-full flex flex-col h-full gap-4">
                
                <div className="bg-[#1A1C2D] border border-white/5 rounded-3xl flex justify-between items-center py-5 px-6">
                  <div>
                    <p className={cn(theme.textLabel, "mb-1")}>Paying For</p>
                    <p className={cn(theme.textH3)}>{selectedPackage.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(theme.textLabel, "mb-1")}>Amount Due</p>
                    <p className="text-2xl font-black text-white" style={poppinsFont}>₱{selectedPackage.price}</p>
                  </div>
                </div>

                {/* INSTANT VERIFY PAYMENT GATEWAY BUTTON */}
                {currentTenant.gatewayEnabled && (
                  <button onClick={handleGatewayClick} className="w-full bg-[#0052FE] hover:bg-[#0040D0] text-white rounded-3xl p-5 flex items-center justify-between transition-transform transform hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,82,254,0.3)]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner bg-white/10">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black uppercase tracking-widest text-white">Instant Verify Payment</p>
                        <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mt-1">Instant Automated Approval</p>
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 rotate-180 text-white opacity-50" />
                  </button>
                )}

                {currentTenant.gatewayEnabled && (
                  <div className="flex items-center gap-4 my-2 opacity-50">
                    <div className="flex-1 h-px bg-white/20" />
                    <span className={cn(theme.textLabel)}>OR MANUAL TRANSFER</span>
                    <div className="flex-1 h-px bg-white/20" />
                  </div>
                )}

                {/* QR Code and Copy Number Button */}
                <div className="bg-[#1C1F33] border border-white/5 rounded-3xl p-6 text-center flex flex-col items-center">
                  <p className={cn(theme.textLabel, "mb-4")}>Scan to Pay</p>
                  
                  {currentTenant.qrCodeBase64 ? (
                    <div className="w-56 h-56 mx-auto bg-white p-3 rounded-3xl shadow-xl mb-6">
                      <img src={currentTenant.qrCodeBase64} alt="QR" className="w-full h-full object-contain rounded-2xl" />
                    </div>
                  ) : (
                    <div className="w-56 h-56 mx-auto bg-[#0F1020] border border-dashed border-white/10 p-3 rounded-3xl shadow-xl mb-6 flex items-center justify-center">
                      <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">No QR Uploaded</span>
                    </div>
                  )}

                  <button 
                    onClick={handleCopyNumber}
                    className="w-full max-w-[240px] bg-[#0F1020] border border-white/10 hover:border-[#5A5CE6]/50 transition-colors rounded-full px-6 py-4 flex items-center justify-center gap-2 group relative"
                  >
                    {isNumberCopied ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-black tracking-widest uppercase text-sm">
                          {currentTenant.gcashNumber || '0000 000 0000'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5 text-indigo-400" />
                        <span className="text-white font-black tracking-widest uppercase text-sm">Copy Number</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col mt-2">
                  {!screenshotBase64 ? (
                    <button onClick={() => setShowSampleReceiptModal(true)} className={cn("min-h-[120px] border-2 border-dashed border-[#5A5CE6]/30 hover:border-[#5A5CE6] rounded-3xl flex flex-col items-center justify-center transition-all group", theme.bgInput)}>
                      <Upload className="w-6 h-6 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                      <span className={cn(theme.textH3)}>Upload Receipt</span>
                    </button>
                  ) : (
                    <div className={cn("min-h-[120px] relative bg-[#1C1F33] border border-white/5 rounded-3xl p-2 flex items-center justify-center")}>
                      <img src={screenshotBase64} alt="Receipt" className="max-h-32 object-contain rounded-2xl" />
                      <button onClick={() => setScreenshotBase64(null)} className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded-full hover:bg-black transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>

                <div className="mt-4">
                  <button onClick={handleVerifyScreenshot} disabled={isVerifying || !screenshotBase64} className={cn(theme.btnPrimary, "w-full flex items-center justify-center gap-2 py-4")}>
                    {isVerifying ? 'Verifying...' : 'Submit Manual Receipt'}
                  </button>
                  <p className="text-center text-[10px] text-green-400 font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Dev Mode: Auto-Approve Enabled
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 'success' && selectedPackage && (
              <motion.div key="success" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-32 h-32 flex items-center justify-center mb-6">
                   <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                     <CheckCircle2 className="w-10 h-10 text-green-400" />
                   </div>
                </div>

                <h2 className={cn(theme.textH1)} style={poppinsFont}>Verified</h2>
                <p className={cn(theme.textBody, "mb-12 mt-4")}>You received <span className="text-white font-bold">{selectedPackage.credits} Credits</span>.</p>
                <button onClick={() => navigate(`/engine?tenant=${currentTenant.subdomain}`)} className={cn(theme.btnPrimary, "w-full py-4")}>Return to Studio</button>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* POST-UPLOAD SCREENSHOT GUIDELINES MODAL */}
      <AnimatePresence>
        {showExampleModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={cn("p-6 rounded-3xl max-w-sm w-full shadow-2xl border", theme.bgCard, theme.borderSubtle)}>
              <div className="flex items-center gap-2 text-neutral-200 mb-4">
                <Info className="w-5 h-5 text-yellow-400" strokeWidth={1.5} />
                <h3 className={cn(theme.textH3)}>Screenshot Guidelines</h3>
              </div>
              <div className={cn("rounded-2xl p-4 border border-white/5 mb-6", theme.bgInput)}>
                <div className={`w-full aspect-[4/3] bg-[#1C1F33] rounded-xl mb-4 flex flex-col items-center justify-center border border-dashed border-[#5A5CE6]/30`}>
                  <Receipt className="w-8 h-8 text-[#5A5CE6] mb-2" strokeWidth={1.5} />
                  <div className="w-24 h-1.5 bg-neutral-700 rounded-full mb-1" />
                  <div className="w-16 h-1.5 bg-neutral-700 rounded-full mb-4" />
                  <div className="border border-green-500/30 bg-green-500/10 px-2 py-1 rounded w-3/4 text-center mb-1">
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Amount Visible</span>
                  </div>
                  <div className="border border-green-500/30 bg-green-500/10 px-2 py-1 rounded w-3/4 text-center">
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Ref No. Visible</span>
                  </div>
                </div>
                <ul className="text-[11px] font-medium text-neutral-400 space-y-2 list-disc pl-4">
                  <li>Amount must exactly match the package.</li>
                  <li>Reference Number must be readable.</li>
                  <li>Date and time must be visible.</li>
                </ul>
              </div>
              <button onClick={() => setShowExampleModal(false)} className={cn(theme.btnWhite, "w-full py-3.5 shadow-none")}>
                I Understand
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}