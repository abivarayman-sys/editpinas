import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Image as ImageIcon, Type, RotateCcw, MonitorPlay, X, LayoutTemplate, Wand2, DownloadCloud, Sparkles } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin';

const poppinsFont = { fontFamily: "'Poppins', sans-serif" };
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const colorSwatches = ['#5A5CE6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#ffffff', '#000000'];

const ThemeTab = ({ state, methods }: any) => {

  const handleResetToDefault = () => {
    if (window.confirm("Are you sure you want to reset all theme settings to default?")) {
      methods.setSettings({
        ...state.settings,
        brandName: 'SNAP',
        brandName2: 'PINAS',
        customTheme: 'dark',
        primaryColor: '#5A5CE6',
        fontFamily: 'inter',
        iconStyle: 'standard',
        logoFont: 'inter',
        logoColor: '#FFFFFF',
        logoFont2: 'inter',
        logoColor2: '#5A5CE6',
        sloganText: '',
        footerText: '',
        bgGradientStart: '#05050A',
        bgGradientEnd: '#1A1C2D',
        logoBase64: '',
        bgImageBase64: ''
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>Theme & Branding</motion.h2>
          <motion.p variants={itemVariants} className={theme.textBody}>Customize your app's visual identity.</motion.p>
        </div>
        <motion.button 
          variants={itemVariants} 
          onClick={handleResetToDefault}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-none"
        >
          <RotateCcw className="w-4 h-4" /> Reset to Default
        </motion.button>
      </div>
      
      <div className="space-y-6">
        {/* GLOBAL APPEARANCE */}
        <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border space-y-6`, theme.bgCard, theme.borderSubtle)}>
          <h3 className={cn(theme.textH3, "flex items-center gap-2 border-b border-white/5 pb-4")} style={poppinsFont}>
            <Palette className="w-5 h-5 text-[#5A5CE6]" /> Global Appearance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={cn(theme.textLabel, "mb-2 block")}>Preset Theme Mode</label>
              <select value={state.settings.customTheme || 'dark'} onChange={e => methods.setSettings({...state.settings, customTheme: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none transition-colors text-white font-bold tracking-wide appearance-none`, theme.bgInput, theme.borderSubtle, theme.borderFocus)}>
                <option value="dark">PRO DARK (Classic)</option>
                <option value="light">CLEAN LIGHT (Minimal)</option>
                <option value="neon">CYBERPUNK NEON</option>
                <option value="winter">WINTER CHILL</option>
                <option value="christmas">MERRY CHRISTMAS</option>
                <option value="summer">SUMMER VIBES</option>
                <option value="red_flash">RED FLASH SALE</option>
              </select>
            </div>
            <div>
              <label className={cn(theme.textLabel, "mb-2 flex items-center gap-2")}><Type className="w-4 h-4"/> Main UI Font</label>
              <select value={state.settings.fontFamily || 'inter'} onChange={e => methods.setSettings({...state.settings, fontFamily: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none transition-colors text-white font-bold tracking-wide appearance-none`, theme.bgInput, theme.borderSubtle, theme.borderFocus)}>
                <option value="inter">Inter (Modern & Clean)</option>
                <option value="poppins">Poppins (Bold & Geometric)</option>
                <option value="roboto">Roboto (Friendly & Round)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <label className={cn(theme.textLabel, "mb-3 block")}>Primary Accent Color</label>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-inner border border-white/10 shrink-0">
                <input type="color" value={state.settings.primaryColor || '#5A5CE6'} onChange={e => methods.setSettings({...state.settings, primaryColor: e.target.value})} className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" />
              </div>
              <div className="flex flex-wrap gap-2 flex-1 border-l border-white/10 pl-4">
                {colorSwatches.map(color => (
                  <button
                    key={color}
                    onClick={() => methods.setSettings({...state.settings, primaryColor: color})}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-md ${state.settings.primaryColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ATTRACTION SCREEN / LANDING PAGE CONFIG */}
        <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border space-y-6`, theme.bgCard, theme.borderSubtle)}>
          <h3 className={cn(theme.textH3, "flex items-center gap-2 border-b border-white/5 pb-4")} style={poppinsFont}>
            <MonitorPlay className="w-5 h-5 text-[#5A5CE6]" /> Attraction Screen Typography
          </h3>

          <div className="space-y-4">
            {/* BRAND WORD 1 */}
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={cn(theme.textLabel, "mb-2 block text-indigo-400")}>Brand Word 1</label>
                <input type="text" value={state.settings.brandName || ''} onChange={e => methods.setSettings({...state.settings, brandName: e.target.value})} className={cn(`w-full rounded-xl px-4 py-3 border outline-none transition-colors text-white font-bold`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} placeholder="SNAP" />
              </div>
              <div>
                <label className={cn(theme.textLabel, "mb-2 block")}>Font Style</label>
                <select value={state.settings.logoFont || 'inter'} onChange={e => methods.setSettings({...state.settings, logoFont: e.target.value})} className={cn(`w-full rounded-xl px-4 py-3 border outline-none transition-colors text-white font-bold appearance-none`, theme.bgInput, theme.borderSubtle, theme.borderFocus)}>
                  <option value="inter">Default (Inter)</option>
                  <option value="poppins">Modern (Poppins)</option>
                  <option value="goofy">Goofy (Bangers)</option>
                  <option value="futuristic">Futuristic (Orbitron)</option>
                </select>
              </div>
              <div>
                <label className={cn(theme.textLabel, "mb-2 block")}>Text Color</label>
                <div className="flex gap-2 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 relative"><input type="color" value={state.settings.logoColor || '#FFFFFF'} onChange={e => methods.setSettings({...state.settings, logoColor: e.target.value})} className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" /></div>
                    <input type="text" value={state.settings.logoColor || '#FFFFFF'} onChange={e => methods.setSettings({...state.settings, logoColor: e.target.value})} className={cn(`flex-1 w-full rounded-xl px-3 py-3 border outline-none transition-colors font-mono text-xs text-white`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} />
                </div>
              </div>
            </div>

            {/* BRAND WORD 2 */}
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={cn(theme.textLabel, "mb-2 block text-indigo-400")}>Brand Word 2</label>
                <input type="text" value={state.settings.brandName2 || ''} onChange={e => methods.setSettings({...state.settings, brandName2: e.target.value})} className={cn(`w-full rounded-xl px-4 py-3 border outline-none transition-colors text-white font-bold`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} placeholder="PINAS" />
              </div>
              <div>
                <label className={cn(theme.textLabel, "mb-2 block")}>Font Style</label>
                <select value={state.settings.logoFont2 || 'inter'} onChange={e => methods.setSettings({...state.settings, logoFont2: e.target.value})} className={cn(`w-full rounded-xl px-4 py-3 border outline-none transition-colors text-white font-bold appearance-none`, theme.bgInput, theme.borderSubtle, theme.borderFocus)}>
                  <option value="inter">Default (Inter)</option>
                  <option value="poppins">Modern (Poppins)</option>
                  <option value="goofy">Goofy (Bangers)</option>
                  <option value="futuristic">Futuristic (Orbitron)</option>
                </select>
              </div>
              <div>
                <label className={cn(theme.textLabel, "mb-2 block")}>Text Color</label>
                <div className="flex gap-2 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 relative"><input type="color" value={state.settings.logoColor2 || '#5A5CE6'} onChange={e => methods.setSettings({...state.settings, logoColor2: e.target.value})} className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" /></div>
                    <input type="text" value={state.settings.logoColor2 || '#5A5CE6'} onChange={e => methods.setSettings({...state.settings, logoColor2: e.target.value})} className={cn(`flex-1 w-full rounded-xl px-3 py-3 border outline-none transition-colors font-mono text-xs text-white`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} />
                </div>
              </div>
            </div>

            {/* SLOGAN & FOOTER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className={cn(theme.textLabel, "mb-2 block")}>Subtitle / Slogan Text</label>
                <input type="text" value={state.settings.sloganText || ''} onChange={e => methods.setSettings({...state.settings, sloganText: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none transition-colors text-white`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} placeholder="Leave empty for theme default..." />
              </div>
              <div>
                <label className={cn(theme.textLabel, "mb-2 block")}>Footer Text</label>
                <input type="text" value={state.settings.footerText || ''} onChange={e => methods.setSettings({...state.settings, footerText: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none transition-colors text-white`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} placeholder="Powered by AI Studio" />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className={cn(theme.textLabel, "mb-3 block")}>Background Gradient Colors</label>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">Start Color</p>
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0 border border-white/10"><input type="color" value={state.settings.bgGradientStart || '#05050A'} onChange={e => methods.setSettings({...state.settings, bgGradientStart: e.target.value})} className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" /></div>
                    <input type="text" value={state.settings.bgGradientStart || '#05050A'} onChange={e => methods.setSettings({...state.settings, bgGradientStart: e.target.value})} className={cn(`w-full rounded-xl px-4 py-3 text-sm font-mono`, theme.bgInput, theme.borderSubtle)} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">End Color</p>
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0 border border-white/10"><input type="color" value={state.settings.bgGradientEnd || '#1A1C2D'} onChange={e => methods.setSettings({...state.settings, bgGradientEnd: e.target.value})} className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" /></div>
                    <input type="text" value={state.settings.bgGradientEnd || '#1A1C2D'} onChange={e => methods.setSettings({...state.settings, bgGradientEnd: e.target.value})} className={cn(`w-full rounded-xl px-4 py-3 text-sm font-mono`, theme.bgInput, theme.borderSubtle)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* VISUAL ASSETS & AI GENERATORS */}
        <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border space-y-6`, theme.bgCard, theme.borderSubtle)}>
          <h3 className={cn(theme.textH3, "flex items-center gap-2 border-b border-white/5 pb-4")} style={poppinsFont}>
            <ImageIcon className="w-5 h-5 text-[#5A5CE6]" /> Visual Assets & AI Generators
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* BRAND LOGO AREA */}
            <div className="space-y-4">
              <label className={cn(theme.textLabel, "block")}>Brand Logo Image</label>
              
              <div className="flex items-center gap-4">
                <label className={cn(`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl h-24 w-24 cursor-pointer transition-colors group shrink-0`, theme.bgInput, theme.borderSubtle, "hover:border-[#5A5CE6]/50 hover:bg-[#5A5CE6]/5")}>
                  <ImageIcon className="w-6 h-6 text-[#5A5CE6] group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-[8px] font-bold uppercase">Upload</span>
                  <input type="file" accept="image/*" onChange={(e) => methods.handleImageUpload(e, 'logoBase64')} className="hidden" />
                </label>
                
                {state.settings.logoBase64 && (
                  <div className="relative group shrink-0 h-24 w-24">
                    <img src={state.settings.logoBase64} alt="Logo" className="h-full w-full object-contain rounded-2xl border border-white/10 shadow-lg bg-black/50 p-2" />
                    <button onClick={() => methods.setSettings({...state.settings, logoBase64: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"><X className="w-3 h-3"/></button>
                  </div>
                )}
              </div>

              {/* AI LOGO GENERATOR BOX */}
              <div className="p-5 rounded-2xl border border-[#5A5CE6]/30 bg-[#5A5CE6]/5 flex flex-col gap-3 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-[#5A5CE6]" />
                  <h4 className="text-sm font-bold text-indigo-300">Generate AI Logo</h4>
                </div>

                <textarea 
                  value={state.logoPrompt} 
                  onChange={(e) => methods.setLogoPrompt(e.target.value)} 
                  placeholder="Describe your logo (e.g., A minimalist robot holding a camera...)" 
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-indigo-200/40 outline-none focus:border-[#5A5CE6]/50 min-h-[60px]" 
                />
                
                <p className="text-[9px] text-indigo-200/50 uppercase tracking-widest leading-relaxed">
                  Empty box uses default: Minimalist tech circuit inspired symbol. (-5 CR)
                </p>
                
                {state.isGeneratingAILogo ? (
                  <div className="py-4 flex flex-col items-center justify-center gap-2">
                     <Sparkles className="w-6 h-6 animate-spin text-[#5A5CE6]" />
                     <span className="text-[10px] font-bold text-[#5A5CE6] uppercase tracking-widest">Crafting Logo...</span>
                  </div>
                ) : state.generatedAILogo ? (
                  <div className="flex items-center gap-4 mt-2">
                    <img src={state.generatedAILogo} className="w-16 h-16 rounded-full border-2 border-[#5A5CE6] shadow-[0_0_15px_rgba(90,92,230,0.3)] object-cover" alt="Generated" />
                    <div className="flex flex-col gap-2 flex-1">
                      <button onClick={() => { methods.setSettings({...state.settings, logoBase64: state.generatedAILogo}); methods.setGeneratedAILogo(null); }} className="w-full bg-[#5A5CE6] hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors">
                        Use This Logo
                      </button>
                      <button onClick={() => methods.downloadImage(state.generatedAILogo, 'ai-logo.png')} className="w-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <DownloadCloud className="w-3 h-3" /> Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={methods.handleGenerateAILogo} className="mt-2 w-full border border-[#5A5CE6]/40 text-indigo-300 hover:bg-[#5A5CE6] hover:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-none">
                    <Sparkles className="w-4 h-4" /> Generate (-5 CR)
                  </button>
                )}
              </div>
            </div>

            {/* BACKGROUND IMAGE AREA */}
            <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
              <label className={cn(theme.textLabel, "block")}>Studio Background Image</label>
              
              <div className="flex items-center gap-4">
                <label className={cn(`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl h-24 w-32 cursor-pointer transition-colors group shrink-0`, theme.bgInput, theme.borderSubtle, "hover:border-[#5A5CE6]/50 hover:bg-[#5A5CE6]/5")}>
                  <LayoutTemplate className="w-6 h-6 text-[#5A5CE6] group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-[8px] font-bold uppercase">Upload</span>
                  <input type="file" accept="image/*" onChange={(e) => methods.handleImageUpload(e, 'bgImageBase64')} className="hidden" />
                </label>

                {state.settings.bgImageBase64 && (
                  <div className="relative group shrink-0 h-24 w-32">
                    <img src={state.settings.bgImageBase64} alt="BG" className="h-full w-full object-cover rounded-2xl border border-white/10 shadow-lg" />
                    <button onClick={() => methods.setSettings({...state.settings, bgImageBase64: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"><X className="w-3 h-3"/></button>
                  </div>
                )}
              </div>

              {/* AI BACKGROUND GENERATOR BOX */}
              <div className="p-5 rounded-2xl border border-[#5A5CE6]/30 bg-[#5A5CE6]/5 flex flex-col gap-3 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-[#5A5CE6]" />
                  <h4 className="text-sm font-bold text-indigo-300">Generate AI Background</h4>
                </div>
                
                <input 
                  type="text" 
                  value={state.bgPrompt} 
                  onChange={(e) => methods.setBgPrompt(e.target.value)} 
                  placeholder="Optional: Describe your vibe..." 
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-indigo-200/40 outline-none focus:border-[#5A5CE6]/50" 
                />
                <p className="text-[9px] text-indigo-200/50 uppercase tracking-widest mt-1">If blank, AI will create a cool ambient vibe automatically.</p>

                {state.isGeneratingAIBg ? (
                  <div className="py-4 flex flex-col items-center justify-center gap-2">
                     <Sparkles className="w-6 h-6 animate-spin text-[#5A5CE6]" />
                     <span className="text-[10px] font-bold text-[#5A5CE6] uppercase tracking-widest">Crafting Atmosphere...</span>
                  </div>
                ) : state.generatedAIBg ? (
                  <div className="flex flex-col gap-3 mt-2">
                    <img src={state.generatedAIBg} className="w-full h-24 rounded-xl border border-[#5A5CE6] shadow-[0_0_15px_rgba(90,92,230,0.3)] object-cover" alt="Generated BG" />
                    <div className="flex gap-2">
                      <button onClick={() => { methods.setSettings({...state.settings, bgImageBase64: state.generatedAIBg}); methods.setGeneratedAIBg(null); }} className="flex-1 bg-[#5A5CE6] hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors">
                        Use This BG
                      </button>
                      <button onClick={() => methods.downloadImage(state.generatedAIBg, 'ai-background.png')} className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition-colors">
                        <DownloadCloud className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={methods.handleGenerateAIBg} className="mt-2 w-full border border-[#5A5CE6]/40 text-indigo-300 hover:bg-[#5A5CE6] hover:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-none">
                    <Sparkles className="w-4 h-4" /> Generate (-5 CR)
                  </button>
                )}
              </div>
            </div>
            
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-4 flex justify-end">
          <button onClick={methods.handleSaveSettings} className={theme.btnPrimary + " w-full md:w-auto md:px-12 py-4 shadow-none text-base"}>
            {state.isSaving ? 'SAVING...' : 'SAVE ALL THEME SETTINGS'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ThemeTab;