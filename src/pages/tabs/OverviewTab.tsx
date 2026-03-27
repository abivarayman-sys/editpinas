import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Wallet, Zap, CreditCard, Clock, Activity, ArrowRight } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin'; 

const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

const itemVariants = { 
  hidden: { opacity: 0, y: 20 }, 
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const OverviewTab = ({ state, methods }: any) => (
  <div className="space-y-6 max-w-5xl">
    
    {/* Welcome Header */}
    <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
      <div>
        <h2 className={theme.textH1} style={poppinsFont}>Workspace Overview</h2>
        <p className={theme.textBody}>Welcome back. Here is the current operational status of your studio.</p>
      </div>
    </motion.div>

    {/* 1. MAIN CREDIT METER (Operational Health) */}
    <motion.div variants={itemVariants} className={cn(`p-6 md:p-8 rounded-[2rem] shadow-xl border flex flex-col md:flex-row items-center gap-6 relative overflow-hidden`, theme.bgCard, theme.borderSubtle)}>
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Zap className="w-48 h-48" />
      </div>
      <div className="flex-1 w-full relative z-10">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Tenant Operational Credits</p>
            <p className="text-4xl md:text-5xl font-black text-white mt-1" style={poppinsFont}>
              {state.currentTenant.creditsBalance || 0} <span className="text-lg text-neutral-500">CR</span>
            </p>
          </div>
          <button onClick={() => state.setShowBuyCreditsModal(true)} className="bg-[#5A5CE6] hover:bg-[#4a4cd6] text-white text-[10px] px-5 py-2.5 rounded-xl shadow-md font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
            <Zap className="w-4 h-4" /> Top Up
          </button>
        </div>
        
        <div className="h-4 w-full bg-[#0B0D17] rounded-full overflow-hidden border border-white/5 shadow-inner mt-5">
          <div className={cn("h-full transition-all duration-1000", state.meterColor)} style={{ width: `${state.meterPercentage}%` }} />
        </div>
        <div className="flex justify-between text-[9px] uppercase font-bold text-neutral-500 mt-2">
          <span>Depletion Meter</span>
          <span className={state.meterPercentage < 20 ? 'text-red-400' : 'text-green-400'}>{state.meterPercentage < 20 ? 'Critical Low' : 'Healthy'}</span>
        </div>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      
      {/* 2. PENDING ACTION ITEMS (Verification Queue) */}
      <motion.div variants={itemVariants} className={cn(`p-6 rounded-[2rem] border shadow-xl flex flex-col`, theme.bgCard, theme.borderSubtle)}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={cn(theme.textH3, "flex items-center gap-2")} style={poppinsFont}><Clock className="w-5 h-5 text-yellow-500"/> Action Required</h3>
          {state.pendingTransactions.length > 0 && <span className="bg-red-500 text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md">{state.pendingTransactions.length} Pending</span>}
        </div>
        
        {state.pendingTransactions.length === 0 ? (
          <div className="text-center py-10 my-auto">
              <CheckCircle2 className="w-12 h-12 text-neutral-700 mx-auto mb-3" strokeWidth={1.5} />
              <p className={theme.textLabel}>No pending payments.</p>
              <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mt-1">You are all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.pendingTransactions.slice(0,3).map((tx:any) => (
              <div key={tx.id} className={cn(`flex justify-between items-center p-4 rounded-2xl border`, theme.bgInput, theme.borderSubtle)}>
                <div>
                  <p className="font-black text-sm text-white tracking-wide">{state.settings.currency === 'USD' ? '$' : '₱'}{tx.amount} <span className="text-yellow-500 text-xs">({tx.credits} CR)</span></p>
                  <p className="text-[9px] text-neutral-500 font-bold tracking-widest uppercase mt-1">Ref: {tx.gcashReference}</p>
                </div>
                <button onClick={() => { methods.setActiveTab('queue'); methods.setIsSidebarOpen(false); }} className={theme.btnWhite + " px-4 py-2 shadow-none text-[10px]"}>Review</button>
              </div>
            ))}
            {state.pendingTransactions.length > 3 && (
              <button onClick={() => { methods.setActiveTab('queue'); methods.setIsSidebarOpen(false); }} className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-2 mt-2">
                View All {state.pendingTransactions.length} Pending <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* 3. SYSTEM STATUS & INTEGRATIONS */}
      <motion.div variants={itemVariants} className={cn(`p-6 rounded-[2rem] border shadow-xl flex flex-col`, theme.bgCard, theme.borderSubtle)}>
          <h3 className={cn(theme.textH3, "mb-6 flex items-center gap-2")} style={poppinsFont}><Activity className="w-5 h-5 text-green-400"/> System Status</h3>
          <div className="space-y-4 my-auto">
            
            {/* Gateway Status */}
            <div className={cn(`flex items-center justify-between p-5 rounded-2xl border cursor-pointer hover:border-white/20 transition-colors`, theme.bgInput, theme.borderSubtle)} onClick={() => methods.setActiveTab('payment')}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${state.settings.gatewayEnabled ? 'bg-green-500/10' : 'bg-neutral-800'}`}>
                    <CreditCard className={`w-5 h-5 ${state.settings.gatewayEnabled ? 'text-green-400' : 'text-neutral-500'}`} />
                  </div>
                  <div>
                      <p className="font-bold text-sm text-white tracking-wide">Auto-Payment Gateway</p>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">{state.settings.gatewayEnabled ? 'Online & Receiving' : 'Offline'}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest ${state.settings.gatewayEnabled ? 'bg-green-500 text-black' : 'bg-neutral-700 text-white'}`}>
                  {state.settings.gatewayEnabled ? 'Active' : 'Setup'}
                </span>
            </div>

            {/* GCash Status */}
            <div className={cn(`flex items-center justify-between p-5 rounded-2xl border cursor-pointer hover:border-white/20 transition-colors`, theme.bgInput, theme.borderSubtle)} onClick={() => methods.setActiveTab('payment')}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${state.settings.gcashNumber ? 'bg-blue-500/10' : 'bg-neutral-800'}`}>
                    <Wallet className={`w-5 h-5 ${state.settings.gcashNumber ? 'text-blue-400' : 'text-neutral-500'}`} />
                  </div>
                  <div>
                      <p className="font-bold text-sm text-white tracking-wide">Manual GCash</p>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">{state.settings.gcashNumber ? 'Receiving Payments' : 'No number configured'}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest ${state.settings.gcashNumber ? 'bg-blue-500 text-white' : 'bg-neutral-700 text-white'}`}>
                  {state.settings.gcashNumber ? 'Active' : 'Setup'}
                </span>
            </div>
            
          </div>
      </motion.div>
    </div>
  </div>
);

export default OverviewTab;