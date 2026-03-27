import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Maximize2 } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../CoreEngine';

const PresetCarousel = ({ items, handleSelect }: { items: any[], handleSelect: Function }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragConstraint, setDragConstraint] = useState(0);

  useEffect(() => {
    if (carouselRef.current) setDragConstraint(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
  }, [items]);

  return (
    <div ref={carouselRef} className="overflow-hidden w-full cursor-grab active:cursor-grabbing py-8 perspective-[1500px]">
      <motion.div drag="x" dragConstraints={{ right: 0, left: -dragConstraint - 64 }} dragElastic={0.2} dragMomentum={true} className="flex gap-6 w-max px-6 md:px-12">
        {items.map((p) => (
          <motion.div key={p.id} onClick={() => handleSelect(p)} className={cn(`w-[220px] md:w-[280px] aspect-[3/4] rounded-3xl relative preserve-3d overflow-hidden border group cursor-pointer shadow-xl`, theme.borderSubtle, theme.bgCard)} whileHover={{ scale: 1.05, rotateY: -8, rotateX: 4, z: 20 }} whileDrag={{ scale: 0.95, rotateY: 15, transition: { duration: 0.3 } }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            {p.thumbnailBase64 ? <img src={p.thumbnailBase64} alt={p.styleName} className="w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110" /> : <div className={cn(`w-full h-full flex items-center justify-center`, theme.textLabel)}>No Cover</div>}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-20 pointer-events-none">
              <div className="flex flex-wrap gap-1 mb-2">
                {p.categories?.slice(0,2).map((c: string, i: number) => <span key={i} className="text-[8px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded backdrop-blur-sm">{c}</span>)}
                {!p.isGlobal && <span className="text-[8px] font-bold uppercase tracking-widest text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded backdrop-blur-sm">Custom</span>}
              </div>
              <h3 className={theme.textH3}>{p.styleName}</h3>
            </div>
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 className="w-4 h-4 text-white" /></div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default function StylesView({ state, methods }: any) {
  return (
    <motion.div key="styles" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col">
      <div className="px-4 md:px-12 pt-8 pb-4 z-10 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" strokeWidth={1.5} />
          <input type="text" placeholder="Search styles or themes..." value={state.searchQuery} onChange={(e) => methods.setSearchQuery(e.target.value)} className={cn(`w-full rounded-full py-3 pl-12 pr-4 text-sm text-white focus:outline-none transition-colors border`, theme.bgInput, theme.borderSubtle, theme.borderFocus)} />
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" strokeWidth={1.5} />
          <select value={state.selectedCategory} onChange={(e) => methods.setSelectedCategory(e.target.value)} className={cn(`w-full rounded-full py-3 pl-10 pr-4 text-xs font-bold uppercase tracking-widest text-indigo-400 focus:outline-none transition-colors appearance-none cursor-pointer border`, theme.bgInput, theme.borderSubtle, theme.borderFocus)}>
            <option value="All">All Categories</option>
            {state.categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="px-4 md:px-12 pt-4 z-10">
        <h2 className={theme.textH1}>Select Your Style</h2>
        <p className={theme.textBody}>Swipe to explore {state.filteredPresets.length} available presets.</p>
      </div>
      <div className="flex-1 flex items-center min-h-[450px]">
        {state.isLoading ? <div className="w-full text-center text-neutral-500 font-bold tracking-widest uppercase animate-pulse">Loading Studio...</div> 
        : state.filteredPresets.length === 0 ? <div className="w-full text-center text-neutral-500 font-bold tracking-widest uppercase">No styles found.</div>
        : <PresetCarousel items={state.filteredPresets} handleSelect={methods.handleSelectForPreview} />}
      </div>
    </motion.div>
  );
}