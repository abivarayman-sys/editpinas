import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin'; // Make sure this path is correct!

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const CostsTab = ({ state, methods }: any) => (
  <div className="space-y-6 max-w-2xl">
    <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>Credit System Routing</motion.h2>
    <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border space-y-8`, theme.bgCard, theme.borderSubtle)}>
      <p className={theme.textBody}>Define exactly how many credits are deducted from a user's wallet when they perform specific actions. Set to 0 for free actions.</p>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className={cn(theme.textLabel, "mb-3 block")}>Cost per Generation (Base Image)</label>
          <div className="relative">
            <input type="number" min="5" value={state.settings.costStandard || 0} onWheel={e => e.currentTarget.blur()} 
              onChange={e => methods.setSettings({...state.settings, costStandard: e.target.value === '' ? '' : Number(e.target.value)})} 
              onBlur={e => { if(Number(e.target.value) < 5) { toast.error("Must be at least 5 credits."); methods.setSettings({...state.settings, costStandard: 5}); } }}
              className={cn(`w-full rounded-2xl px-6 py-4 font-mono text-2xl outline-none border transition-colors text-white font-bold`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} />
            <span className="absolute right-6 top-4 text-neutral-500 font-bold tracking-widest uppercase">CR</span>
          </div>
        </div>
        <div>
          <label className={cn(theme.textLabel, "mb-3 block")}>Cost per PRO Mode Generation</label>
          <div className="relative">
            <input type="number" min="10" value={state.settings.costPro || 0} onWheel={e => e.currentTarget.blur()} 
              onChange={e => methods.setSettings({...state.settings, costPro: e.target.value === '' ? '' : Number(e.target.value)})} 
              onBlur={e => { if(Number(e.target.value) < 10) { toast.error("PRO Mode must be at least 10 credits."); methods.setSettings({...state.settings, costPro: 10}); } }}
              className={cn(`w-full rounded-2xl px-6 py-4 font-mono text-2xl outline-none border transition-colors text-[#5A5CE6] font-bold`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} />
            <span className="absolute right-6 top-4 text-[#5A5CE6]/50 font-bold tracking-widest uppercase">CR</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={cn(theme.textLabel, "mb-3 block")}>Cost per Download</label>
            <div className="relative">
              <input type="number" min="0" value={state.settings.costDownload || 0} onWheel={e => e.currentTarget.blur()} 
                onChange={e => methods.setSettings({...state.settings, costDownload: e.target.value === '' ? 0 : Number(e.target.value)})} 
                className={cn(`w-full rounded-2xl px-6 py-4 font-mono text-xl outline-none border transition-colors text-green-400 font-bold`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} />
              <span className="absolute right-4 top-4 text-green-500/50 font-bold tracking-widest uppercase text-sm">CR</span>
            </div>
          </div>
          <div>
            <label className={cn(theme.textLabel, "mb-3 block")}>Cost per Edit</label>
            <div className="relative">
              <input type="number" min="5" value={state.settings.costEdit || 0} onWheel={e => e.currentTarget.blur()} 
                onChange={e => methods.setSettings({...state.settings, costEdit: e.target.value === '' ? '' : Number(e.target.value)})} 
                onBlur={e => { if(Number(e.target.value) < 5) { toast.error("Must be at least 5 credits."); methods.setSettings({...state.settings, costEdit: 5}); } }}
                className={cn(`w-full rounded-2xl px-6 py-4 font-mono text-xl outline-none border transition-colors text-orange-400 font-bold`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} />
              <span className="absolute right-4 top-4 text-orange-500/50 font-bold tracking-widest uppercase text-sm">CR</span>
            </div>
          </div>
          <div>
            <label className={cn(theme.textLabel, "mb-3 block")}>Cost per Retry</label>
            <div className="relative">
              <input type="number" min="5" value={state.settings.costRetry || 0} onWheel={e => e.currentTarget.blur()} 
                onChange={e => methods.setSettings({...state.settings, costRetry: e.target.value === '' ? '' : Number(e.target.value)})} 
                onBlur={e => { if(Number(e.target.value) < 5) { toast.error("Must be at least 5 credits."); methods.setSettings({...state.settings, costRetry: 5}); } }}
                className={cn(`w-full rounded-2xl px-6 py-4 font-mono text-xl outline-none border transition-colors text-blue-400 font-bold`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} />
              <span className="absolute right-4 top-4 text-blue-500/50 font-bold tracking-widest uppercase text-sm">CR</span>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-6 border-t border-white/5 flex justify-end">
        <button onClick={methods.handleSaveSettings} className={theme.btnPrimary + " w-full md:w-auto md:px-12 py-4 shadow-none"}>
          {state.isSaving ? 'SAVING...' : 'SAVE COST ROUTING'}
        </button>
      </div>
    </motion.div>
  </div>
);

// IMPORTANT: You must export it as default!
export default CostsTab;