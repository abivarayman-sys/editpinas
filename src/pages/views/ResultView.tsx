import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw, Paintbrush, DownloadCloud } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../CoreEngine';

export default function ResultView({ state, methods }: any) {
  return (
    <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }} className={cn(`absolute inset-0 z-40 flex flex-col`, theme.bgApp)}>
      <header className={cn(`p-4 md:p-6 flex items-center justify-between bg-[#0B0D17]/80 backdrop-blur-md border-b shrink-0 pt-safe z-50`, theme.borderSubtle)}>
         <button onClick={() => methods.setActiveView('customizer')} className={`flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest`}><ChevronLeft className="w-5 h-5" strokeWidth={1.5} /> Back to Studio</button>
         <div className="text-[10px] font-black tracking-widest text-[#5A5CE6] uppercase">Gallery {state.currentGalleryIndex + 1} / {state.generatedImages.length}</div>
      </header>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4 md:p-12">
        {state.isGenerating ? (
          <div className="text-center">
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Sparkles className="w-10 h-10 text-[#5A5CE6] mx-auto mb-4" /></motion.div>
             <p className={theme.textLabel}>AI is crafting your image...</p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={state.currentGalleryIndex}
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}
                className="relative max-h-full max-w-full rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                onPointerDown={() => methods.setHideWatermark(true)}
                onPointerUp={() => methods.setHideWatermark(false)}
                onPointerLeave={() => methods.setHideWatermark(false)}
              >
                <img src={state.generatedImages[state.currentGalleryIndex]} alt="Result" className="w-full h-full object-contain" />
                
                {/* BRAND WATERMARK OVERLAY */}
                {!state.hideWatermark && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden bg-black/10">
                    <span className="text-4xl md:text-6xl font-black text-white/20 uppercase tracking-widest -rotate-12 whitespace-nowrap">
                      {state.tenantConfig.brandName}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {state.generatedImages.length > 1 && (
              <>
                <button disabled={state.currentGalleryIndex === 0} onClick={() => methods.setCurrentGalleryIndex((prev:number) => prev - 1)} className={cn(`absolute left-4 md:left-8 p-3 md:p-4 hover:bg-white/10 text-white rounded-full border disabled:opacity-20 transition-all z-10`, theme.bgCard, theme.borderSubtle)}><ChevronLeft className="w-6 h-6" strokeWidth={1.5} /></button>
                <button disabled={state.currentGalleryIndex === state.generatedImages.length - 1} onClick={() => methods.setCurrentGalleryIndex((prev:number) => prev + 1)} className={cn(`absolute right-4 md:right-8 p-3 md:p-4 hover:bg-white/10 text-white rounded-full border disabled:opacity-20 transition-all z-10`, theme.bgCard, theme.borderSubtle)}><ChevronRight className="w-6 h-6" strokeWidth={1.5} /></button>
              </>
            )}
          </>
        )}
      </div>

      {!state.isGenerating && (
        <div className={cn(`bg-[#0B0D17] border-t p-6 md:p-8 shrink-0 pb-safe z-50`, theme.borderSubtle)}>
          <div className="max-w-3xl mx-auto">
            {state.isEditMode ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                <div className="flex-1">
                  <label className={cn(theme.textLabel, "mb-2 block")}>Inpainting Edit Prompt</label>
                  <input type="text" value={state.editPrompt} onChange={(e) => methods.setEditPrompt(e.target.value)} placeholder="What do you want to change?" className={cn(`w-full border rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-[#5A5CE6]`, theme.bgInput, theme.borderSubtle)} />
                </div>
                <div className="flex gap-2">
                   <button onClick={() => methods.setIsEditMode(false)} className={cn(theme.btnSecondary, "px-8 w-auto")}>Cancel</button>
                   <button onClick={methods.executeEditGeneration} className={cn(theme.btnPrimary, "px-8 w-auto flex flex-col items-center py-2")}>
                     <span>Apply Edit</span>
                     <span className="text-[8px] text-indigo-200 mt-0.5 opacity-70">Cost: {state.costEdit} CR</span>
                   </button>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                <button onClick={methods.executeRetryGeneration} className={cn(`group hover:bg-[#1C2035] border rounded-3xl p-5 flex flex-col items-center justify-center transition-all hover:border-white/20`, theme.bgCard, theme.borderSubtle)}>
                  <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-neutral-400 group-hover:text-white mb-2 transition-colors" strokeWidth={1.5} />
                  <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs text-white">Retry</span>
                  <span className="text-[8px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Cost: {state.costRetry} CR</span>
                </button>
                
                <button onClick={() => methods.setIsEditMode(true)} className={`group bg-[#5A5CE6]/10 hover:bg-[#5A5CE6]/20 border border-[#5A5CE6]/30 rounded-3xl p-5 flex flex-col items-center justify-center transition-all`}>
                  <Paintbrush className="w-5 h-5 md:w-6 md:h-6 text-[#5A5CE6] group-hover:text-white mb-2 transition-colors" strokeWidth={1.5} />
                  <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs text-indigo-100">Edit</span>
                  <span className="text-[8px] md:text-[9px] font-bold text-indigo-300 uppercase tracking-widest mt-1 opacity-80">Cost: {state.costEdit} CR</span>
                </button>

                <button onClick={() => methods.executeDownload(state.generatedImages[state.currentGalleryIndex])} className={`group bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-3xl p-5 flex flex-col items-center justify-center transition-all`}>
                  <DownloadCloud className="w-5 h-5 md:w-6 md:h-6 text-green-400 group-hover:text-white mb-2 transition-colors" strokeWidth={1.5} />
                  <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs text-green-100">Download</span>
                  <span className="text-[8px] md:text-[9px] font-bold text-green-300 uppercase tracking-widest mt-1 opacity-80">Cost: {state.costDownload} CR</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
     </motion.div>
  );
}