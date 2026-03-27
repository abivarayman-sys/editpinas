import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Trash2, Plus } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin';

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const PricingTab = ({ state, methods }: any) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
      <div>
        <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>Pricing Engine</motion.h2>
        <motion.p variants={itemVariants} className={theme.textBody + " mt-1"}>Configure unlimited packages. Set price to 0 to disable a package.</motion.p>
      </div>
      <motion.div variants={itemVariants} className={cn(`flex rounded-lg p-1 border shrink-0`, theme.bgInput, theme.borderSubtle)}>
        <button onClick={() => methods.setSettings({...state.settings, currency: 'PHP'})} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${state.settings.currency === 'PHP' ? 'bg-[#5A5CE6] text-white shadow-md' : 'text-neutral-500 hover:text-white'}`}>PHP ₱</button>
        <button onClick={() => methods.setSettings({...state.settings, currency: 'USD'})} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${state.settings.currency === 'USD' ? 'bg-[#5A5CE6] text-white shadow-md' : 'text-neutral-500 hover:text-white'}`}>USD $</button>
      </motion.div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {state.settings.packages?.map((pkg: any) => (
        <motion.div variants={itemVariants} key={pkg.id} className={cn(`p-6 rounded-[2rem] relative flex flex-col border shadow-xl`, pkg.isPopular ? `border-[#5A5CE6]/50 shadow-[#5A5CE6]/10 scale-100 lg:scale-105 z-10 ${theme.bgCard}` : `${theme.borderSubtle} ${theme.bgCard}`)}>
          {pkg.isPopular && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-t-[2rem]" />}
          <div className="flex justify-between items-start mb-6">
            <input type="text" value={pkg.name} onChange={e => methods.handleUpdatePackage(pkg.id, 'name', e.target.value)} className={cn(`font-black tracking-widest uppercase text-lg bg-transparent border-b border-transparent focus:outline-none w-3/4 transition-colors`, pkg.isPopular ? 'text-yellow-400' : 'text-white', theme.borderFocus)} style={poppinsFont} />
            <div className="flex gap-2">
              <button onClick={() => methods.handleUpdatePackage(pkg.id, 'isPopular', !pkg.isPopular)} className={`p-1.5 rounded-lg ${pkg.isPopular ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-neutral-500'}`} title="Mark Popular"><Tag className="w-3.5 h-3.5"/></button>
              <button onClick={() => methods.handleRemovePackage(pkg.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <label className={cn(theme.textLabel, "mb-2 block")}>Price ({state.settings.currency})</label>
              <input type="number" min="0" value={pkg.price} onWheel={e => e.currentTarget.blur()} onChange={e => methods.handleUpdatePackage(pkg.id, 'price', e.target.value === '' ? '' : Number(e.target.value))} className={cn(`w-full rounded-2xl px-4 py-3 font-mono focus:outline-none border text-white transition-colors`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} />
            </div>
            <div>
              <label className={cn(theme.textLabel, "mb-2 block")}>Credits Given</label>
              <input type="number" min="0" value={pkg.credits} onWheel={e => e.currentTarget.blur()} onChange={e => methods.handleUpdatePackage(pkg.id, 'credits', e.target.value === '' ? '' : Number(e.target.value))} className={cn(`w-full rounded-2xl px-4 py-3 font-mono font-bold focus:outline-none border transition-colors`, theme.bgInput, theme.borderSubtle, theme.borderFocus, pkg.isPopular ? 'text-yellow-400' : 'text-white')} />
            </div>
          </div>
        </motion.div>
      ))}
      <motion.button variants={itemVariants} onClick={methods.handleAddPackage} className={cn(`border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center min-h-[250px] text-neutral-500 hover:text-[#5A5CE6] transition-colors group`, theme.bgInput, theme.borderSubtle, "hover:border-[#5A5CE6]/50 hover:bg-[#5A5CE6]/5")}>
        <Plus className="w-12 h-12 mb-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
        <span className="font-bold tracking-widest uppercase text-xs" style={poppinsFont}>Add Custom Package</span>
      </motion.button>
    </div>
    <motion.div variants={itemVariants} className="max-w-md mx-auto pt-8">
      <button onClick={methods.handleSaveSettings} className={theme.btnPrimary + " w-full py-4 shadow-none"}>{state.isSaving ? 'Saving Engine...' : 'Publish Pricing Packages'}</button>
    </motion.div>
  </div>
);

export default PricingTab;