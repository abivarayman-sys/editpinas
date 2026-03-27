import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Camera, Upload, X, Sparkles, Check, Zap, Image as ImageIcon } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../CoreEngine';

export default function CustomizerView({ state, methods }: any) {
  if (!state.selectedPreset) return null;
  return (
    <motion.div key="customizer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col px-4 md:px-8 py-6 z-10 overflow-y-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => methods.setActiveView('preview')} className={cn(`flex items-center gap-2 text-neutral-400 hover:text-white transition-colors border hover:bg-white/10 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest`, theme.bgCard, theme.borderSubtle)}><ChevronLeft className="w-4 h-4" /> Back to Preview</button>
        <div className="text-right">
          <p className={theme.textLabel}>Studio Configurator</p>
          <p className={theme.textH3}>{state.selectedPreset.styleName}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className={cn(`${theme.textH3} flex items-center gap-2`)}><ImageIcon className="w-4 h-4 text-indigo-400"/> Reference Images</h3>
          <p className={theme.textBody}>Upload up to 3 reference images. Tap an uploaded image to insert its placeholder into your prompt.</p>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {['IMAGE1', 'IMAGE2', 'IMAGE3'].map((slot) => (
              <div key={slot} className="relative aspect-square">
                {state.userImages[slot] ? (
                  <div className={`w-full h-full relative group rounded-2xl overflow-hidden border-2 border-[#5A5CE6] shadow-lg cursor-pointer`} onClick={() => methods.insertImageToken(slot)}>
                    <img src={state.userImages[slot] as string} alt={slot} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-[#5A5CE6]/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-white font-black text-[10px] tracking-widest uppercase">Insert</span></div>
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded-md text-[8px] font-black text-indigo-400 tracking-widest z-10">{slot}</div>
                    <button onClick={(e) => { e.stopPropagation(); methods.setUserImages((prev: any) => ({...prev, [slot]: null})); }} className="absolute top-2 left-2 bg-red-500/90 p-1.5 rounded-full text-white z-10 hover:bg-red-500"><X className="w-3 h-3" strokeWidth={1.5}/></button>
                  </div>
                ) : (
                  <label className={cn(`w-full h-full flex flex-col items-center justify-center border border-dashed hover:border-[#5A5CE6]/50 hover:bg-[#5A5CE6]/5 rounded-2xl cursor-pointer transition-colors group`, theme.bgCard, theme.borderSubtle)}>
                    <Upload className="w-6 h-6 text-neutral-500 group-hover:text-indigo-400 mb-2 transition-colors" strokeWidth={1.5} />
                    <span className="text-[10px] font-black tracking-widest uppercase text-neutral-500 group-hover:text-indigo-400 transition-colors">{slot}</span>
                    <input type="file" accept="image/*" onChange={(e) => methods.handleImageUpload(e, slot)} className="hidden" />
                  </label>
                )}
              </div>
            ))}
          </div>
          <div className="pt-4">
            <button className={cn(`w-full py-4 rounded-2xl border hover:border-white/30 text-white font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2 transition-all shadow-sm`, theme.bgCard, theme.borderSubtle)}>
              <Camera className="w-5 h-5 text-neutral-400" strokeWidth={1.5} /> Open Camera
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className={cn(`${theme.textH3} flex items-center gap-2`)}><Sparkles className="w-4 h-4 text-[#5A5CE6]"/> AI Generation Prompt</h3>
          <div className="relative">
            <textarea ref={state.promptRef} value={state.userPrompt} onChange={(e) => methods.setUserPrompt(e.target.value)} className={cn(`w-full rounded-2xl p-5 text-sm leading-relaxed text-white outline-none transition-colors min-h-[160px] border`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} placeholder="Add your custom instructions here (e.g., wearing a red jacket)..." />
            <div className="absolute bottom-4 right-4 flex gap-1">
               {['IMAGE1', 'IMAGE2', 'IMAGE3'].map(slot => state.userImages[slot] && <span key={slot} className="bg-[#5A5CE6]/20 text-indigo-300 border border-[#5A5CE6]/30 px-2 py-1 rounded text-[8px] font-black tracking-widest uppercase flex items-center gap-1"><Check className="w-3 h-3"/> {slot} Active</span>)}
            </div>
          </div>

          <div className={cn(`${theme.card} flex items-center justify-between`)}>
            <div>
              <h4 className="text-[11px] font-black tracking-widest uppercase text-white flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" strokeWidth={1.5}/> ACTIVATE PRO Mode</h4>
              <p className="text-[10px] text-neutral-400 mt-1">High fidelity output with Gemini 3.1 Pro Flash.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={state.isProMode} onChange={() => methods.setIsProMode(!state.isProMode)} className="sr-only peer" />
              <div className="w-12 h-6 bg-[#080A12] rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-500 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5CE6] border border-white/10"></div>
            </label>
          </div>

          <div className="pt-4">
            <button onClick={methods.executeInitialGeneration} className={cn(theme.btnPrimary, `w-full py-5 text-base flex justify-center items-center gap-3 ${state.isProMode ? 'shadow-[0_0_30px_rgba(90,92,230,0.4)]' : ''}`)}>
              Generate Image <Sparkles className="w-5 h-5" />
            </button>
            <p className="text-center text-[10px] font-black tracking-widest uppercase text-neutral-500 mt-4">
              Cost: <span className="text-white">{state.isProMode ? state.costPro : state.costStandard} CR</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}