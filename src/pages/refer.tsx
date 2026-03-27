import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useTenantStore } from '../store/useTenantStore';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { ChevronLeft, Gift, Copy, Share2, Users, Coins } from 'lucide-react';
import { theme } from '../theme.config';
import { Toaster, toast } from 'sonner';
import { cn } from './CoreEngine'; // Using your utility

const poppinsFont = { fontFamily: "'Poppins', sans-serif" };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } } };

export default function Refer() {
  const { currentTenant, currentUserData, setCurrentUserData } = useTenantStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!user || !currentTenant) { navigate('/'); return; }
    const unsub = onSnapshot(doc(db, 'resellers', currentTenant.id, 'users', user.uid), (doc) => {
      if (doc.exists()) setCurrentUserData({ uid: doc.id, ...doc.data() } as any);
    });
    return () => unsub();
  }, [user, currentTenant, navigate, setCurrentUserData]);

  if (!currentTenant || !currentUserData) return null;

  // Generate their unique link (using their UID as the referral code)
  const referralLink = `${window.location.origin}/?tenant=${currentTenant.subdomain}&ref=${user?.uid}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join me on ${currentTenant.brandName}`,
          text: `Use my link to get free AI Generation credits on ${currentTenant.brandName}!`,
          url: referralLink
        });
      } catch (err) { console.log("Share cancelled"); }
    } else {
      handleCopy();
    }
  };

  return (
    <div className={cn(`min-h-[100dvh] flex flex-col font-sans relative`, theme.bgApp)}>
      <Toaster theme="dark" position="top-center" richColors />
      
      {/* HEADER */}
      <header className={cn(`p-4 md:p-6 flex items-center justify-between bg-[#0B0D17]/80 backdrop-blur-md border-b shrink-0 z-50 sticky top-0`, theme.borderSubtle)}>
         <button onClick={() => navigate(-1)} className={`flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest`}>
           <ChevronLeft className="w-5 h-5" strokeWidth={1.5} /> Back to Studio
         </button>
      </header>

      <main className="flex-1 p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="w-full max-w-2xl relative z-10 space-y-6">
          
          <motion.div variants={itemVariants} className="text-center space-y-4 mb-8">
            <div className="w-20 h-20 bg-yellow-500/20 border border-yellow-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(234,179,8,0.2)]">
              <Gift className="w-10 h-10 text-yellow-400" />
            </div>
            <h1 className={theme.textH1} style={poppinsFont}>Invite & Earn Credits</h1>
            <p className={theme.textBody}>Give your friends free credits to start, and earn <strong className="text-yellow-400">10 CR</strong> for every friend who signs up using your link.</p>
          </motion.div>

          {/* Link Box */}
          <motion.div variants={itemVariants} className={cn(`p-6 rounded-[2rem] shadow-xl border flex flex-col md:flex-row gap-4 items-center justify-between`, theme.bgCard, theme.borderSubtle)}>
            <div className="w-full overflow-hidden">
              <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-2">Your Unique Invite Link</p>
              <p className="text-sm font-mono text-white truncate bg-[#0B0D17] p-4 rounded-xl border border-white/5 select-all">{referralLink}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto shrink-0 mt-4 md:mt-0">
              <button onClick={handleCopy} className={cn(theme.btnSecondary, "flex-1 md:flex-none flex items-center justify-center gap-2 py-4 px-6")}>
                {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />} {isCopied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={handleShare} className={cn(theme.btnPrimary, "flex-1 md:flex-none flex items-center justify-center gap-2 py-4 px-6 shadow-none")}>
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 md:gap-6 pt-4">
            <div className={cn(`p-6 md:p-8 rounded-[2rem] border text-center`, theme.bgCard, theme.borderSubtle)}>
              <Users className="w-6 h-6 text-[#5A5CE6] mx-auto mb-3" />
              <p className="text-3xl md:text-4xl font-black text-white" style={poppinsFont}>{currentUserData.referralCount || 0}</p>
              <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-1">Friends Invited</p>
            </div>
            <div className={cn(`p-6 md:p-8 rounded-[2rem] border text-center relative overflow-hidden`, theme.bgCard, theme.borderSubtle)}>
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600" />
              <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-3" />
              <p className="text-3xl md:text-4xl font-black text-white" style={poppinsFont}>{(currentUserData.referralCount || 0) * 10}</p>
              <p className="text-[10px] text-yellow-500/70 font-black uppercase tracking-widest mt-1">Credits Earned</p>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}