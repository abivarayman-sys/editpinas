import React from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin';

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const ReferralsTab = ({ state }: any) => (
  <div className="space-y-6 max-w-4xl">
    <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>Referral Leaderboard</motion.h2>
    <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border`, theme.bgCard, theme.borderSubtle)}>
      <div className="flex items-center gap-6 mb-8 bg-black/30 p-6 rounded-3xl border border-white/5">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20">
            <Gift className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white uppercase tracking-wide" style={poppinsFont}>Top Inviters</p>
            <p className={theme.textBody + " mt-1"}>Users who have brought the most people to the booth.</p>
          </div>
      </div>
      <div className="space-y-4">
          {['Rayman Abiva', 'John Doe', 'Jane Smith'].map((name, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-[#0B0D17] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${i===0?'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30': i===1?'bg-neutral-300/20 text-neutral-300 border border-neutral-300/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>#{i+1}</div>
                <p className={theme.textH3} style={poppinsFont}>{name}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-white tracking-wide text-lg">{15 - (i*4)} <span className="text-[10px] text-neutral-500 tracking-widest">INVITES</span></p>
                <p className="text-[10px] font-bold text-[#5A5CE6] uppercase tracking-widest mt-0.5">Earned {(15-(i*4))*10} CR</p>
              </div>
            </div>
          ))}
        </div>
    </motion.div>
  </div>
);

export default ReferralsTab;