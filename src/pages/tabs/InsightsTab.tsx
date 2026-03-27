import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Image as ImageIcon, Coins, TrendingUp, CheckCircle2 } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin'; 

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const InsightsTab = ({ state, methods }: any) => (
  <div className="space-y-6">
    <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>Analytics Dashboard</motion.h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div variants={itemVariants} className={cn(`p-6 rounded-[2rem] shadow-xl border`, theme.bgCard, theme.borderSubtle)}>
          <div className="flex items-center justify-between mb-4">
            <p className={theme.textLabel}>Total Revenue</p>
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center"><Activity className="w-4 h-4 text-green-400" /></div>
          </div>
          <p className="text-3xl font-black text-white" style={poppinsFont}>{state.settings.currency === 'USD' ? '$' : '₱'}{methods.calculateTotalRevenue()}</p>
      </motion.div>

      <motion.div variants={itemVariants} className={cn(`p-6 rounded-[2rem] shadow-xl border`, theme.bgCard, theme.borderSubtle)}>
          <div className="flex items-center justify-between mb-4">
            <p className={theme.textLabel}>Pending Revenue</p>
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center"><Clock className="w-4 h-4 text-orange-400" /></div>
          </div>
          <p className="text-3xl font-black text-white" style={poppinsFont}>{state.settings.currency === 'USD' ? '$' : '₱'}{methods.calculatePendingRevenue()}</p>
      </motion.div>

      <motion.div variants={itemVariants} className={cn(`p-6 rounded-[2rem] shadow-xl border`, theme.bgCard, theme.borderSubtle)}>
          <div className="flex items-center justify-between mb-4">
            <p className={theme.textLabel}>Images Generated</p>
            <div className="w-8 h-8 bg-[#5A5CE6]/20 rounded-lg flex items-center justify-center"><ImageIcon className="w-4 h-4 text-[#5A5CE6]" /></div>
          </div>
          <p className="text-3xl font-black text-white" style={poppinsFont}>{methods.calculateTotalGenerations()}</p>
      </motion.div>

      <motion.div variants={itemVariants} className={cn(`p-6 rounded-[2rem] shadow-xl border`, theme.bgCard, theme.borderSubtle)}>
          <div className="flex items-center justify-between mb-4">
            <p className={theme.textLabel}>Avg. User Balance</p>
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center"><Coins className="w-4 h-4 text-yellow-400" /></div>
          </div>
          <p className="text-3xl font-black text-white" style={poppinsFont}>{methods.calculateAverageBalance()} <span className="text-sm text-neutral-500 font-medium">CR</span></p>
      </motion.div>
    </div>

    <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border mt-6`, theme.bgCard, theme.borderSubtle)}>
        <h3 className={cn(theme.textH3, "mb-6 flex items-center gap-2")} style={poppinsFont}><TrendingUp className="w-5 h-5 text-[#5A5CE6]" /> Recent Transactions</h3>
        {state.verifiedTransactions.length === 0 ? (
          <p className={theme.textBody}>No completed transactions yet.</p>
        ) : (
          <div className="space-y-4">
            {state.verifiedTransactions.slice(0, 5).map((tx:any) => (
              <div key={tx.id} className={cn(`flex items-center justify-between p-4 rounded-2xl border`, theme.bgInput, theme.borderSubtle)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
                  <div>
                    <p className="text-white font-bold text-sm">{tx.userId}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-black">{state.settings.currency === 'USD' ? '$' : '₱'}{tx.amount}</p>
                  <p className="text-[#5A5CE6] font-bold text-[10px] uppercase tracking-widest mt-1">+{tx.credits} CR</p>
                </div>
              </div>
            ))}
          </div>
        )}
    </motion.div>
  </div>
);

export default InsightsTab;