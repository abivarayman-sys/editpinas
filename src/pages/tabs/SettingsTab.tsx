import React from 'react';
import { motion } from 'framer-motion';
import { Palette, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin';

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const SettingsTab = ({ state, methods }: any) => (
  <div className="space-y-6 max-w-3xl">
    <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>General Settings</motion.h2>
    <div className="space-y-6">
      <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border space-y-6`, theme.bgCard, theme.borderSubtle)}>
        <h3 className={cn(theme.textH3, "flex items-center gap-2 border-b border-white/5 pb-4")} style={poppinsFont}><Palette className="w-5 h-5 text-[#5A5CE6]" /> Branding & Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={cn(theme.textLabel, "mb-2 block")}>Brand Name</label>
            <input type="text" value={state.settings.brandName || ''} onChange={e => methods.setSettings({...state.settings, brandName: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none transition-colors text-white font-bold tracking-wide`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} />
          </div>
          <div>
            <label className={cn(theme.textLabel, "mb-2 block")}>Custom Theme</label>
            <select value={state.settings.customTheme || 'dark'} onChange={e => methods.setSettings({...state.settings, customTheme: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none transition-colors text-white font-bold tracking-wide appearance-none`, theme.bgInput, theme.borderSubtle, theme.borderFocus)}>
              <option value="dark">PRO DARK (DEFAULT)</option>
              <option value="light">CLEAN LIGHT</option>
              <option value="neon">CYBERPUNK NEON</option>
            </select>
          </div>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border space-y-6`, theme.bgCard, theme.borderSubtle)}>
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <h3 className={cn(theme.textH3, "flex items-center gap-2 text-yellow-400")} style={poppinsFont}><ShieldAlert className="w-5 h-5" /> Pop-up Announcement</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={state.settings.announcementEnabled || false} onChange={e => methods.setSettings({...state.settings, announcementEnabled: e.target.checked})} className="sr-only peer" />
            <div className="w-12 h-6 bg-[#080A12] rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-500 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500 border border-white/5"></div>
          </label>
        </div>
        <div>
          <label className={cn(theme.textLabel, "mb-2 block")}>Announcement Text</label>
          <textarea value={state.settings.announcementText || ''} onChange={e => methods.setSettings({...state.settings, announcementText: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none transition-colors text-white min-h-[100px]`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} placeholder="Welcome to our new theme! Enjoy 50% off..." />
        </div>
        <div>
          <label className={cn(theme.textLabel, "mb-2 block")}>Promo Image Flyer</label>
          <div className="flex items-center gap-6">
            <label className={cn(`flex flex-1 flex-col items-center justify-center gap-3 border-2 border-dashed rounded-3xl py-8 cursor-pointer transition-colors group`, theme.bgInput, theme.borderSubtle, "hover:border-yellow-500/50 hover:bg-yellow-500/5")}>
              <ImageIcon className="w-8 h-8 text-yellow-500/50 group-hover:scale-110 transition-transform group-hover:text-yellow-400" />
              <span className={theme.textH3} style={poppinsFont}>Upload Flyer</span>
              <input type="file" accept="image/*" onChange={(e) => methods.handleImageUpload(e, 'announcementImageBase64')} className="hidden" />
            </label>
            {state.settings.announcementImageBase64 && <img src={state.settings.announcementImageBase64} alt="Promo" className="h-32 w-32 object-cover rounded-2xl border border-white/10 shrink-0 shadow-lg" />}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border space-y-4`, theme.bgCard, theme.borderSubtle)}>
        <h3 className={cn(theme.textH3, "border-b border-white/5 pb-4 mb-4")} style={poppinsFont}>Terms & Conditions</h3>
        <textarea value={state.settings.termsAndConditions || ''} onChange={e => methods.setSettings({...state.settings, termsAndConditions: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none transition-colors text-neutral-400 min-h-[160px] text-sm leading-relaxed`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} placeholder="1. By using this photobooth, you agree..." />
      </motion.div>

      <motion.div variants={itemVariants} className="pt-4 pb-12 flex justify-end">
        <button onClick={methods.handleSaveSettings} className={theme.btnPrimary + " w-full md:w-auto md:px-12 py-4 shadow-none"}>{state.isSaving ? 'SAVING...' : 'SAVE ALL SETTINGS'}</button>
      </motion.div>
    </div>
  </div>
);
export default SettingsTab;