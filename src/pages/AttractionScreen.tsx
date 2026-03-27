import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Lock, UserPlus, Zap } from 'lucide-react';
import { useTenantStore } from '../store/useTenantStore';
import { useAuthStore } from '../store/useAuthStore';
import { signInWithGoogle, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function AttractionScreen() {
  const { currentTenant } = useTenantStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [tenantConfig, setTenantConfig] = useState<any>(currentTenant);

  useEffect(() => {
    if (!currentTenant) return;
    const unsub = onSnapshot(doc(db, 'resellers', currentTenant.id), (docSnap) => {
      if (docSnap.exists()) setTenantConfig({ id: docSnap.id, ...docSnap.data() });
    });
    return () => unsub();
  }, [currentTenant]);

  useEffect(() => {
    if (!document.getElementById('dynamic-fonts')) {
      const style = document.createElement('style');
      style.id = 'dynamic-fonts';
      style.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Poppins:wght@400;700;900&family=Roboto:wght@400;700;900&family=Bangers&family=Orbitron:wght@400;700;900&family=Mountains+of+Christmas:wght@700&display=swap');`;
      document.head.appendChild(style);
    }
  }, []);

  const handleLoginRegister = async () => {
    if (user) { navigate(`/engine?tenant=${tenantConfig?.subdomain}`); return; }
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
      navigate(`/engine?tenant=${tenantConfig?.subdomain}`);
    } catch (error) { console.error(error); } 
    finally { setIsLoggingIn(false); }
  };

  if (!tenantConfig) return null;

  const isChristmas = tenantConfig.customTheme === 'christmas';
  const isNeon = tenantConfig.customTheme === 'neon';
  const isWinter = tenantConfig.customTheme === 'winter';
  const isSummer = tenantConfig.customTheme === 'summer';
  const isRedFlash = tenantConfig.customTheme === 'red_flash';

  const activePrimary = isChristmas ? '#D4AF37' : isNeon ? '#00FFCC' : (tenantConfig.primaryColor || '#5A5CE6');
  const activeBgStart = isChristmas ? '#4A0E17' : isNeon ? '#05020B' : (tenantConfig.bgGradientStart || '#05050A');
  const activeBgEnd = isChristmas ? '#0B2015' : isNeon ? '#120422' : (tenantConfig.bgGradientEnd || '#1A1C2D');
  
  // Font Getter Helper
  const getDynamicFont = (fontSelection: string) => {
    if (isChristmas) return "'Mountains of Christmas', cursive";
    if (isNeon) return "'Orbitron', sans-serif";
    switch(fontSelection) {
      case 'goofy': return "'Bangers', cursive";
      case 'futuristic': return "'Orbitron', sans-serif";
      case 'poppins': return "'Poppins', sans-serif";
      default: return "'Inter', sans-serif";
    }
  };

  // Determine Slogan
  const defaultSlogan = isChristmas ? 'Magical Holiday Booth' : isSummer ? 'Summer Snapshots' : isNeon ? 'System Initialization' : isRedFlash ? 'Flash Sale Event' : 'Next-Gen AI Photography';
  const displaySlogan = tenantConfig.sloganText && tenantConfig.sloganText.trim() !== '' ? tenantConfig.sloganText : defaultSlogan;

  // Determine Footer
  const displayFooter = tenantConfig.footerText && tenantConfig.footerText.trim() !== '' ? tenantConfig.footerText : 'Powered by AI Studio';

  return (
    <div 
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000"
      style={{
        fontFamily: isNeon ? "'Orbitron', sans-serif" : (tenantConfig.fontFamily === 'poppins' ? "'Poppins', sans-serif" : tenantConfig.fontFamily === 'roboto' ? "'Roboto', sans-serif" : "'Inter', sans-serif"),
        backgroundImage: tenantConfig.bgImageBase64 && !isChristmas && !isNeon
          ? `url(${tenantConfig.bgImageBase64})` 
          : `linear-gradient(to bottom right, ${activeBgStart}, ${activeBgEnd})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '--primary-color': activePrimary
      } as React.CSSProperties}
    >
      {tenantConfig.bgImageBase64 && !isChristmas && !isNeon && <div className="absolute inset-0 bg-black/60 pointer-events-none" />}

      {/* SNOW EFFECT */}
      {(isChristmas || isWinter) && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {[...Array(60)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full opacity-80"
              style={{
                width: `${Math.random() * 5 + 2}px`, height: `${Math.random() * 5 + 2}px`,
                left: `${Math.random() * 100}%`, top: `-${Math.random() * 20}%`,
                animation: `fall ${Math.random() * 5 + 5}s linear infinite`, animationDelay: `${Math.random() * 5}s`,
                filter: isChristmas ? 'drop-shadow(0 0 5px rgba(255,255,255,0.8))' : 'none'
              }}
            />
          ))}
          <style>{`@keyframes fall { 0% { transform: translateY(-10vh) translateX(0); opacity: 1; } 100% { transform: translateY(110vh) translateX(20px); opacity: 0.2; } }`}</style>
        </div>
      )}

      {/* CYBERPUNK GRID */}
      {isNeon && (
        <div className="absolute inset-0 pointer-events-none z-0 opacity-20"
          style={{ backgroundImage: `linear-gradient(var(--primary-color) 1px, transparent 1px), linear-gradient(90deg, var(--primary-color) 1px, transparent 1px)`, backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)', transformOrigin: 'top center' }}
        />
      )}

      {!tenantConfig.bgImageBase64 && !isNeon && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-30 transition-colors duration-1000" style={{ backgroundColor: 'var(--primary-color)' }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-xl mt-10">
        
        {/* Logo Image or Camera Icon */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="mb-8 relative">
          <div className="absolute inset-0 blur-2xl rounded-full opacity-30 transition-colors duration-1000" style={{ backgroundColor: 'var(--primary-color)' }} />
          {tenantConfig.logoBase64 && !isChristmas ? (
            <img src={tenantConfig.logoBase64} alt="Logo" className="w-40 h-40 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] relative z-10" />
          ) : (
            <div className={`w-32 h-32 flex items-center justify-center backdrop-blur-sm relative z-10 transition-colors duration-1000 ${isNeon ? 'bg-transparent border-2 shadow-[0_0_30px_var(--primary-color)]' : 'rounded-full border bg-[#05050A]/50 shadow-2xl'}`} 
              style={{ borderColor: 'var(--primary-color)', borderRadius: isNeon ? '20%' : '50%' }}>
              <Camera className="w-16 h-16 transition-colors duration-1000" strokeWidth={isChristmas || isNeon ? 2 : 1.5} style={{ color: 'var(--primary-color)', filter: isNeon ? 'drop-shadow(0 0 10px var(--primary-color))' : 'none' }} />
            </div>
          )}
        </motion.div>

        {/* DUAL BRAND NAME CONTAINER */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="mb-4 w-full flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4">
          <span 
            className="text-5xl sm:text-7xl font-black transition-all duration-1000"
            style={{ 
              fontFamily: getDynamicFont(tenantConfig.logoFont), 
              color: isChristmas ? '#FFFFFF' : isNeon ? 'var(--primary-color)' : (tenantConfig.logoColor || '#FFFFFF'), 
              letterSpacing: tenantConfig.logoFont === 'goofy' || isNeon ? '3px' : 'normal',
              textTransform: isChristmas ? 'none' : 'uppercase',
              textShadow: isNeon ? '0 0 20px var(--primary-color), 0 0 40px var(--primary-color)' : '0 4px 10px rgba(0,0,0,0.5)'
            }}
          >
            {tenantConfig.brandName || 'SNAP'}
          </span>
          
          {(tenantConfig.brandName2 && tenantConfig.brandName2.trim() !== '') && (
            <span 
              className="text-5xl sm:text-7xl font-black transition-all duration-1000"
              style={{ 
                fontFamily: getDynamicFont(tenantConfig.logoFont2), 
                color: isChristmas ? '#FFFFFF' : isNeon ? 'var(--primary-color)' : (tenantConfig.logoColor2 || '#5A5CE6'), 
                letterSpacing: tenantConfig.logoFont2 === 'goofy' || isNeon ? '3px' : 'normal',
                textTransform: isChristmas ? 'none' : 'uppercase',
                textShadow: isNeon ? '0 0 20px var(--primary-color), 0 0 40px var(--primary-color)' : '0 4px 10px rgba(0,0,0,0.5)'
              }}
            >
              {tenantConfig.brandName2}
            </span>
          )}
        </motion.div>

        {/* DYNAMIC SLOGAN */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex items-center justify-center gap-4 mb-12 w-full">
          <div className="h-[1px] w-8 sm:w-12 opacity-50 transition-colors duration-1000" style={{ backgroundColor: 'var(--primary-color)' }} />
          <p className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-colors duration-1000 text-center" style={{ color: isChristmas ? 'var(--primary-color)' : isNeon ? '#FFFFFF' : (tenantConfig.logoColor || '#FFFFFF'), opacity: 0.9 }}>
            {displaySlogan}
          </p>
          <div className="h-[1px] w-8 sm:w-12 opacity-50 transition-colors duration-1000" style={{ backgroundColor: 'var(--primary-color)' }} />
        </motion.div>

        {/* Start Button */}
        {user && (
          <motion.button
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.4, delay: 0.6 }}
            onClick={handleLoginRegister}
            className={`w-full max-w-[320px] py-5 px-8 border transition-all flex items-center justify-center gap-3 group relative overflow-hidden ${isNeon ? 'rounded-none shadow-[0_0_20px_var(--primary-color)]' : 'rounded-2xl shadow-2xl backdrop-blur-md hover:bg-black/50'}`}
            style={{ backgroundColor: isChristmas ? 'rgba(212,175,55,0.1)' : isNeon ? 'rgba(0,255,204,0.05)' : 'rgba(15, 16, 32, 0.7)', borderColor: 'var(--primary-color)' }}
          >
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 opacity-20" style={{ background: `linear-gradient(to right, transparent, var(--primary-color), transparent)` }} />
            <Sparkles className="w-5 h-5 transition-colors duration-1000" style={{ color: 'var(--primary-color)' }} />
            <span className="text-white font-bold tracking-widest text-lg uppercase drop-shadow-md">
              {isChristmas ? 'Unwrap the Magic' : isNeon ? 'EXECUTE.EXE' : 'Tap to Start'}
            </span>
            <Sparkles className="w-5 h-5 transition-colors duration-1000" style={{ color: 'var(--primary-color)' }} />
          </motion.button>
        )}

        {/* EXPLICIT AUTH LOGIN / REGISTER BUTTONS */}
        {!user && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.6 }} className="w-full max-w-[360px] flex flex-col gap-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-2">Create an account to begin</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleLoginRegister} disabled={isLoggingIn} className={`py-4 px-4 border transition-all flex flex-col items-center justify-center gap-2 group relative overflow-hidden ${isNeon ? 'rounded-sm hover:shadow-[0_0_15px_var(--primary-color)]' : 'rounded-2xl hover:bg-white/5'}`} style={{ borderColor: 'var(--primary-color)' }}>
                <Lock className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                <span className="text-white font-bold tracking-widest text-xs uppercase">{isLoggingIn ? 'Wait...' : 'Login'}</span>
              </button>
              <button onClick={handleLoginRegister} disabled={isLoggingIn} className={`py-4 px-4 transition-all flex flex-col items-center justify-center gap-2 group relative overflow-hidden shadow-lg ${isNeon ? 'rounded-sm hover:shadow-[0_0_25px_var(--primary-color)]' : 'rounded-2xl hover:opacity-90'}`} style={{ backgroundColor: 'var(--primary-color)' }}>
                <UserPlus className="w-5 h-5" style={{ color: isNeon ? '#000' : '#FFF' }} />
                <span className="font-black tracking-widest text-xs uppercase" style={{ color: isNeon ? '#000' : '#FFF' }}>{isLoggingIn ? 'Wait...' : 'Register'}</span>
              </button>
            </div>
            <button onClick={handleLoginRegister} disabled={isLoggingIn} className="mt-2 w-full py-4 rounded-full border border-white/10 hover:bg-white/5 text-xs font-bold text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-3">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-4 h-4 bg-white rounded-full p-0.5" />
              Continue with Google
            </button>
          </motion.div>
        )}

        {/* DYNAMIC FOOTER */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }} className="mt-12 flex flex-col items-center">
          <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-2">
            {isNeon && <Zap className="w-3 h-3 text-[var(--primary-color)]" />} 
            {displayFooter}
          </p>
        </motion.div>
      </div>
    </div>
  );
}