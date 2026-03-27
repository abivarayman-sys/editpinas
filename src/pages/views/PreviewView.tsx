import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../CoreEngine';

export default function PreviewView({ state, methods }: any) {
  if (!state.selectedPreset) return null;
  return (
    <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }} className={cn(`absolute inset-0 z-40 flex flex-col items-center justify-center`, theme.bgApp)}>
      <button onClick={() => methods.setActiveView('styles')} className={cn(`absolute top-4 left-4 md:top-8 md:left-8 z-[100] p-4 hover:bg-white/10 rounded-full text-white transition-colors border shadow-2xl`, theme.bgCard, theme.borderSubtle)}>
        <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
      </button>

      <div className="w-full h-full relative flex flex-col p-4 md:p-8 pb-48 md:pb-32 justify-center items-center">
        {state.selectedPreset.thumbnailBase64 ? (
          <img src={state.selectedPreset.thumbnailBase64} alt={state.selectedPreset.styleName} className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.4)]" />
        ) : (
          <div className={cn(`w-full h-full max-w-md max-h-[500px] border border-dashed rounded-3xl flex items-center justify-center`, theme.borderSubtle, theme.textLabel)}>No Preview Image</div>
        )}
        
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/80 to-transparent pt-32 pb-8 px-6 md:px-12 flex flex-col md:flex-row items-end justify-between gap-6 z-50">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {state.selectedPreset.categories?.map((c: string, i: number) => <span key={i} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-[#151828] border border-white/5 px-3 py-1 rounded-full">{c}</span>)}
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-wide text-white drop-shadow-2xl">{state.selectedPreset.styleName}</h2>
            {state.selectedPreset.instructionText && <p className={cn(`mt-3 max-w-lg p-4 rounded-2xl border backdrop-blur-xl`, theme.textBody, theme.bgCard, theme.borderSubtle)}>"{state.selectedPreset.instructionText}"</p>}
          </div>
          <button onClick={methods.handleConfirmPreset} className={cn(theme.btnWhite, "w-full md:w-auto px-10 py-5 text-sm flex items-center justify-center gap-3")}>
            Use This Preset <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}