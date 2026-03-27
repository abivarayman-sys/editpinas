import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Gift, Eye, EyeOff, Trash2 } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin'; // Make sure this path is correct

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const PromosTab = ({ state, methods }: any) => (
  <div className="space-y-6 max-w-4xl">
    <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>Promo Campaigns</motion.h2>
    
    <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] border shadow-xl`, theme.bgCard, theme.borderSubtle)}>
      <h3 className={cn(theme.textH3, "mb-6 flex items-center gap-2 border-b border-white/5 pb-4")} style={poppinsFont}>
        <Ticket className="w-5 h-5 text-[#5A5CE6]" /> Create Promo Code
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2">
            <label className={cn(theme.textLabel, "mb-2 block")}>Code Name</label>
            <input 
              type="text" 
              value={state.newPromo.code} 
              onChange={e => methods.setNewPromo({...state.newPromo, code: e.target.value.replace(/\s+/g, '').toUpperCase()})} 
              placeholder="e.g. SUMMER2026" 
              className={cn(`w-full rounded-2xl px-5 py-4 text-sm outline-none border uppercase font-bold tracking-widest text-white transition-colors`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} 
            />
        </div>
        <div>
            <label className={cn(theme.textLabel, "mb-2 block")}>Credits Given</label>
            <input 
              type="number" 
              min="0" 
              value={state.newPromo.credits} 
              onChange={e => methods.setNewPromo({...state.newPromo, credits: e.target.value === '' ? 0 : Number(e.target.value)})} 
              onWheel={e => e.currentTarget.blur()} 
              className={cn(`w-full rounded-2xl px-5 py-4 text-sm outline-none border font-bold text-white transition-colors`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} 
            />
        </div>
        <div>
            <label className={cn(theme.textLabel, "mb-2 block")}>Max Uses</label>
            <input 
              type="number" 
              min="0" 
              value={state.newPromo.maxUses} 
              onChange={e => methods.setNewPromo({...state.newPromo, maxUses: e.target.value === '' ? 0 : Number(e.target.value)})} 
              onWheel={e => e.currentTarget.blur()} 
              className={cn(`w-full rounded-2xl px-5 py-4 text-sm outline-none border font-bold text-white transition-colors`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} 
            />
        </div>
      </div>
      <button 
        onClick={methods.handleCreatePromo} 
        disabled={state.isCreatingPromo} 
        className={theme.btnPrimary + " mt-8 px-10 rounded-2xl py-4 shadow-none"}
      >
        {state.isCreatingPromo ? 'Creating...' : 'Generate Campaign'}
      </button>
    </motion.div>

    <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border overflow-x-auto`, theme.bgCard, theme.borderSubtle)}>
        <h3 className={cn(theme.textH3, "mb-6 flex items-center gap-2")} style={poppinsFont}>
          <Gift className="w-5 h-5 text-[#5A5CE6]" /> Active Campaigns
        </h3>
        {!(state.settings.promos && state.settings.promos.length > 0) ? (
          <p className={theme.textBody}>No promo codes created yet.</p>
        ) : (
          <table className="w-full text-left">
              <thead>
              <tr className="border-b border-white/5">
                <th className={theme.textLabel + " pb-4"}>Promo Code</th>
                <th className={theme.textLabel + " pb-4"}>Value</th>
                <th className={theme.textLabel + " pb-4"}>Usage</th>
                <th className={theme.textLabel + " pb-4"}>Status</th>
                <th className={theme.textLabel + " pb-4"}>Actions</th>
              </tr>
              </thead>
              <tbody className="text-sm">
              {state.settings.promos.map((promo: any) => (
                <tr key={promo.id} className="border-b border-white/5">
                    <td className="py-5 font-black text-white tracking-widest">{promo.code}</td>
                    <td className="py-5 text-[#5A5CE6] font-black">+{promo.credits} CR</td>
                    <td className="py-5 text-neutral-400 font-bold">{promo.currentUses || 0} / {promo.maxUses}</td>
                    <td className="py-5">
                      <span className={`px-3 py-1 rounded-md text-[9px] uppercase tracking-widest font-black ${promo.isActive ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-500'}`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-5 flex gap-2">
                      <button 
                        onClick={() => methods.handleTogglePromo(promo.id, promo.isActive)} 
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors" 
                        title={promo.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {promo.isActive ? <EyeOff className="w-4 h-4 text-orange-400" /> : <Eye className="w-4 h-4 text-green-400" />}
                      </button>
                      <button 
                        onClick={() => methods.handleDeletePromo(promo.id)} 
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </td>
                </tr>
              ))}
              </tbody>
          </table>
        )}
    </motion.div>
  </div>
);

export default PromosTab;