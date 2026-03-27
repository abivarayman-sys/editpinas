import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, Image as ImageIcon, Sparkles, Check, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin'; 

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

// SimpleCarousel Component extracted for use in this tab
const SimpleCarousel = React.memo(({ presets, hiddenList, onToggle, mode = 'global', onEdit, onDelete }: any) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x hide-scrollbar">
      {presets.map((p: any) => {
        const isHidden = mode === 'global' ? hiddenList?.includes(p.id) : p.isActive === false;
        return (
          <motion.div whileHover={{ scale: 1.02, y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} key={p.id} className={cn(`min-w-[200px] w-[200px] shrink-0 aspect-[3/4] rounded-[2rem] relative overflow-hidden shadow-2xl snap-center transition-opacity duration-300 border`, isHidden ? 'opacity-40 grayscale border-white/5' : `opacity-100 ${theme.borderSubtle} ${theme.bgCard}`)}>
            {p.thumbnailBase64 ? ( <img src={p.thumbnailBase64} alt={p.styleName} className="w-full h-full object-cover pointer-events-none" /> ) : ( <div className={cn(`w-full h-full flex items-center justify-center text-xs font-mono`, theme.textLabel)}>No Image</div> )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/90 to-transparent p-4 pt-16 pointer-events-none">
              <p className={cn(theme.textH3, "truncate")} style={poppinsFont}>{p.styleName}</p>
              <p className="text-[10px] text-[#5A5CE6] font-bold uppercase tracking-widest mt-1 truncate">{p.categories?.join(', ')}</p>
            </div>
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {mode === 'global' ? (
                <button onClick={() => onToggle(p.id)} className="bg-black/80 backdrop-blur-md text-white p-2.5 rounded-full border border-white/10 hover:bg-black transition-colors shadow-lg" title={isHidden ? "Show Preset" : "Hide Preset from your users"}>{isHidden ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4 text-red-400"/>}</button>
              ) : (
                <>
                  <button onClick={() => onToggle(p.id, p.isActive)} className="bg-black/80 backdrop-blur-md text-white p-2.5 rounded-full border border-white/10 hover:bg-black transition-colors shadow-lg" title={p.isActive !== false ? "Disable this preset" : "Enable this preset"}>{p.isActive !== false ? <EyeOff className="w-4 h-4 text-orange-400" /> : <Eye className="w-4 h-4 text-green-400" />}</button>
                  <button onClick={() => onEdit(p)} className="bg-[#5A5CE6] text-white p-2.5 rounded-full shadow-lg" title="Edit Preset"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(p.id)} className="bg-red-500 text-white p-2.5 rounded-full shadow-lg" title="Delete Preset permanently"><Trash2 className="w-4 h-4" /></button>
                </>
              )}
            </div>
            {mode === 'global' && isHidden && <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">Hidden</div>}
            {mode === 'tenant' && isHidden && <div className="absolute top-3 left-3 bg-neutral-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">Disabled</div>}
          </motion.div>
        );
      })}
    </div>
  );
});

const PresetsTab = ({ state, methods }: any) => (
  <div className="space-y-8">
    <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>Styles & Presets</motion.h2>
    
    <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] border shadow-xl relative`, theme.bgCard, theme.borderSubtle)}>
        <h3 className={cn(theme.textH3, "mb-8 flex items-center gap-2")} style={poppinsFont}><Wand2 className="w-5 h-5 text-[#5A5CE6]" /> {state.editingPresetId ? 'EDIT PRESET' : 'CREATE PRESET'}</h3>
        
        {state.editingPresetId && (
        <button onClick={() => { methods.setNewPreset({ styleName: '', description: '', promptFragment: '', categories: [] as string[], thumbnailBase64: '', instructionText: '', instructionImageBase64: '', isActive: true }); methods.setEditingPresetId(null); methods.setGeneratedThumb(null); }} className="absolute top-8 right-8 text-[10px] uppercase font-bold text-neutral-400 hover:text-white bg-white/5 px-4 py-2 rounded-full transition-colors">
          Cancel Edit
        </button>
        )}
        
        <form onSubmit={methods.handleSaveTenantPreset} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className={cn(theme.textLabel, "mb-2 block")}>Style Name</label>
              <input required type="text" value={state.newPreset.styleName} onChange={e => methods.setNewPreset({...state.newPreset, styleName: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none transition-colors text-white font-bold`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} placeholder="e.g. Cyberpunk" />
            </div>
            <div>
                <label className={cn(theme.textLabel, "mb-2 block")}>Categories</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {state.availableCategories.map((cat:string) => (
                    <button type="button" key={cat} onClick={() => {
                        if (state.newPreset.categories.includes(cat)) methods.setNewPreset({...state.newPreset, categories: state.newPreset.categories.filter((c:string) => c !== cat)});
                        else methods.setNewPreset({...state.newPreset, categories: [...state.newPreset.categories, cat]});
                      }}
                      className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border transition-colors ${state.newPreset.categories.includes(cat) ? 'bg-[#5A5CE6] border-[#5A5CE6] text-white shadow-lg shadow-[#5A5CE6]/20' : 'bg-black/50 border-white/5 text-neutral-500 hover:bg-white/5 hover:text-white'}`}
                    >{cat}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={state.customCategoryInput} onChange={e => methods.setCustomCategoryInput(e.target.value)} placeholder="Type new category..." className={cn(`flex-1 rounded-xl px-5 py-3 text-xs font-bold border outline-none text-white transition-colors`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} />
                  <button type="button" onClick={methods.handleAddCustomCategory} className={theme.btnWhite + " shadow-none"}>Add</button>
                </div>
            </div>
            <div>
              <label className={cn(theme.textLabel, "mb-2 block")}>Base Prompt / AI Instructions</label>
              <textarea required value={state.newPreset.promptFragment} onChange={e => methods.setNewPreset({...state.newPreset, promptFragment: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none min-h-[120px] transition-colors text-white text-sm leading-relaxed`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} placeholder="Highly detailed, cinematic lighting..." />
            </div>
          </div>
          
          <div className={cn(`border rounded-3xl p-5 flex flex-col`, theme.bgInput, theme.borderSubtle)}>
            <label className={cn(theme.textLabel, "mb-4 flex items-center gap-2")}><ImageIcon className="w-4 h-4 text-[#5A5CE6]"/> Preview Thumbnail</label>
            <div className={`flex-1 ${theme.bgCard} rounded-2xl border ${theme.borderSubtle} flex items-center justify-center relative overflow-hidden mb-4 min-h-[200px] shadow-inner`}>
              {state.isGeneratingThumb ? (
                <div className="text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Sparkles className="w-8 h-8 text-[#5A5CE6] mx-auto mb-3" /></motion.div>
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Generating 1k Image...</p>
                </div>
              ) : state.generatedThumb ? (
                <img src={state.generatedThumb} alt="Gen" className="w-full h-full object-cover" />
              ) : state.newPreset.thumbnailBase64 ? (
                <img src={state.newPreset.thumbnailBase64} alt="Current" className="w-full h-full object-cover opacity-80" />
              ) : (
                <p className={theme.textLabel}>No Image Uploaded</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <label className="flex items-center justify-center gap-2 bg-white/5 rounded-xl px-4 py-4 cursor-pointer hover:bg-white/10 transition-colors text-[10px] font-black uppercase tracking-widest text-white border border-white/5">
                Upload <input type="file" accept="image/*" onChange={(e) => methods.handleImageUpload(e, 'thumbnailBase64', true)} className="hidden" />
              </label>
              <button type="button" onClick={methods.handleTestPromptGeneration} disabled={state.isGeneratingThumb} className="bg-[#5A5CE6]/10 border border-[#5A5CE6]/20 text-indigo-300 hover:bg-[#5A5CE6]/20 hover:text-white rounded-xl px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <Wand2 className="w-4 h-4"/> {state.isGeneratingThumb ? 'Wait...' : 'Generate 1k'}
              </button>
            </div>
            {state.generatedThumb && (
              <button type="button" onClick={() => methods.setNewPreset({...state.newPreset, thumbnailBase64: state.generatedThumb})} className="w-full py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"><Check className="w-4 h-4"/> Set as Cover</button>
            )}
          </div>
        </div>
        <div className="pt-6 border-t border-white/5 flex justify-end">
          <button type="submit" className={theme.btnPrimary + " w-full md:w-auto md:px-12 py-4"}>
            {state.editingPresetId ? 'UPDATE PRESET' : 'SAVE PRESET'}
          </button>
        </div>
      </form>
      
      {state.tenantPresets.length > 0 && (
        <div className="mt-12 pt-10 border-t border-white/10">
          <h4 className={theme.textH3 + " mb-2"} style={poppinsFont}>Your Styles Created</h4>
          <p className={theme.textBody + " mb-6"}>Manage your isolated custom presets. Buttons are permanently visible on the top right of each card.</p>
          <div className="-mx-8 px-4"><SimpleCarousel presets={state.tenantPresets} hiddenList={[]} mode="tenant" onToggle={methods.handleToggleTenantPreset} onEdit={methods.handleEditTenantPreset} onDelete={methods.handleDeleteTenantPreset} /></div>
        </div>
      )}
    </motion.div>
    
    <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border overflow-hidden`, theme.bgCard, theme.borderSubtle)}>
      <h3 className={theme.textH3 + " mb-2"} style={poppinsFont}>Global Preset Library</h3>
      <p className={theme.textBody + " mb-6"}>Swipe to explore. Click 'Hide' (top right of image) to remove them from your booth.</p>
      <div className="-mx-8 px-4"><SimpleCarousel presets={state.globalPresets} hiddenList={state.settings.hiddenGlobalPresets} mode="global" onToggle={methods.handleToggleGlobalPreset} /></div>
    </motion.div>
  </div>
);

export default PresetsTab;