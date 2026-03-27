import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin'; // Make sure this path is correct

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const SupportTab = ({ state, methods }: any) => (
  <div className="space-y-6 max-w-3xl">
    <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>Support & Bots</motion.h2>
    
    <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] border shadow-xl space-y-5`, theme.bgCard, theme.borderSubtle)}>
      <h3 className={cn(theme.textH3, "flex items-center gap-2 mb-4")} style={poppinsFont}>
        <MessageSquare className="w-5 h-5 text-[#5A5CE6]" /> Facebook Botcake Integration
      </h3>
      <div>
        <label className={cn(theme.textLabel, "mb-2 block")}>Embed Code / Script Paste</label>
        <textarea 
          value={state.settings.botcakeHtml || ''} 
          onChange={e => methods.setSettings({...state.settings, botcakeHtml: e.target.value})} 
          className={cn(`w-full rounded-2xl px-5 py-4 font-mono text-sm outline-none border transition-colors min-h-[120px] text-white`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} 
          placeholder="" 
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <input 
          type="checkbox" 
          id="botToggle" 
          checked={state.settings.botcakeEnabled || false} 
          onChange={e => methods.setSettings({...state.settings, botcakeEnabled: e.target.checked})} 
          className="w-5 h-5 rounded border-white/10 bg-black text-[#5A5CE6]" 
        />
        <label htmlFor="botToggle" className="text-xs font-bold tracking-widest text-white uppercase">Enable Chatbot Widget</label>
      </div>
    </motion.div>

    <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] border shadow-xl`, theme.bgCard, theme.borderSubtle)}>
        <h3 className={cn(theme.textH3, "mb-4")} style={poppinsFont}>User Messages (Inbox)</h3>
        <div className="text-center py-8 text-neutral-500 text-xs font-bold tracking-widest uppercase border border-dashed border-white/10 rounded-xl">
          Inbox is currently empty
        </div>
    </motion.div>

    <motion.div variants={itemVariants} className="pt-4 flex justify-end">
      <button onClick={methods.handleSaveSettings} className={theme.btnPrimary + " w-full md:w-auto md:px-12 py-4 rounded-2xl"}>
        {state.isSaving ? 'Saving...' : 'Save Support Config'}
      </button>
    </motion.div>
  </div>
);

export default SupportTab;