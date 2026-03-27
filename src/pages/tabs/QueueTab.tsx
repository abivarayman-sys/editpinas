import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, X, Check } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin'; // Make sure this path is correct based on your folder structure

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const QueueTab = ({ state, methods }: any) => (
  <div className="space-y-6">
    <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>Verification Queue</motion.h2>
    
    {state.pendingTransactions.length === 0 ? (
      <motion.div variants={itemVariants} className={cn(`p-12 rounded-[2rem] text-center shadow-xl border`, theme.bgCard, theme.borderSubtle)}>
        <CheckCircle2 className="w-16 h-16 text-neutral-600 mx-auto mb-4" strokeWidth={1.5} />
        <p className={theme.textH3}>No pending transactions</p>
        <p className={theme.textBody}>You're all caught up!</p>
      </motion.div>
    ) : (
      <div className="grid grid-cols-1 gap-4">
        {state.pendingTransactions.map((tx:any) => (
          <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} key={tx.id} className={cn(`p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border`, theme.bgCard, theme.borderSubtle)}>
            <div>
              <p className={theme.textLabel}>User UID: <span className="text-white ml-1">{tx.userId}</span></p>
              <p className="text-2xl md:text-3xl font-black text-white mt-1 mb-2 tracking-tighter" style={poppinsFont}>
                {state.settings.currency === 'USD' ? '$' : '₱'}{tx.amount} <span className="text-[#5A5CE6] text-lg font-bold">({tx.credits} CR)</span>
              </p>
              <p className="text-xs font-mono text-neutral-400 bg-black/40 inline-block px-3 py-1.5 rounded-lg border border-white/5">Ref: {tx.gcashReference}</p>
              <p className="text-[10px] text-neutral-500 mt-2 font-bold uppercase tracking-widest">{new Date(tx.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => methods.handleRejectTransaction(tx.id, tx.userId)} className="flex-1 md:flex-none p-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors flex justify-center items-center">
                <X className="w-6 h-6" />
              </button>
              <button onClick={() => methods.handleVerifyTransaction(tx.id, tx.userId, tx.credits)} className={theme.btnPrimary + " flex-[2] md:flex-none flex items-center justify-center gap-2 py-4 rounded-2xl shadow-none"}>
                <Check className="w-5 h-5" /> Verify & Credit
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

export default QueueTab;