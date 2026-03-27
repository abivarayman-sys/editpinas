import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Edit2, Save, X, Ban, UserX, Trash2 } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin';

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const UsersTab = ({ state, methods }: any) => (
  <div className="space-y-6">
    <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>User Management</motion.h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {state.users.map((u:any) => (
        <motion.div variants={itemVariants} key={u.uid} className={cn(`rounded-[2rem] shadow-xl flex flex-col overflow-hidden border`, theme.bgCard, theme.borderSubtle)}>
          <div className={cn(`p-6 border-b flex justify-between items-start`, theme.bgInput, theme.borderSubtle)}>
            <div className="truncate pr-4">
              <p className={theme.textH3 + " truncate"} style={poppinsFont}>{u.displayName || 'Unknown User'}</p>
              <p className={theme.textLabel + " truncate mt-1"}>{u.email}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-widest uppercase shrink-0 ${u.status === 'banned' ? 'bg-red-500 text-white' : u.status === 'deactivated' ? 'bg-neutral-600 text-white' : 'bg-green-500/20 text-green-400'}`}>{u.status || 'Active'}</span>
          </div>
          <div className="p-6 grid grid-cols-2 gap-5">
            <div className="col-span-2 bg-[#5A5CE6]/10 border border-[#5A5CE6]/20 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Credit Balance</p>
                {state.editingUserId === u.uid ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="number" min="0" value={state.tempUserCredits} onChange={e => methods.setTempUserCredits(e.target.value === '' ? 0 : Number(e.target.value))} className="w-20 bg-black border border-[#5A5CE6]/50 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none" />
                    <button onClick={() => methods.handleSaveUserCredits(u.uid)} className="p-2 bg-[#5A5CE6] text-white rounded-lg hover:bg-[#4a4cd6] transition-colors"><Save className="w-4 h-4" /></button>
                    <button onClick={() => methods.setEditingUserId(null)} className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-2xl font-black text-white tracking-wide" style={poppinsFont}>{u.credits || 0}</p>
                    <button onClick={() => { methods.setEditingUserId(u.uid); methods.setTempUserCredits(u.credits || 0); }} className="text-[#5A5CE6] hover:text-white transition-colors bg-white/5 p-1.5 rounded-md"><Edit2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <Coins className="w-8 h-8 text-[#5A5CE6]/40" />
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Generated</p>
              <p className="text-lg font-black text-white mt-1">{u.photosGenerated || 0} <span className="text-[10px] text-neutral-500">PICS</span></p>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Referrals</p>
              <p className="text-lg font-black text-white mt-1">{u.referralCount || 0} <span className="text-[10px] text-neutral-500">USERS</span></p>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-3">
            <div className="flex justify-between items-center text-xs"><span className={theme.textLabel}>Account Type:</span><span className={`font-bold uppercase tracking-widest text-[10px] ${(u.totalCreditPurchased || 0) > 0 ? 'text-yellow-400' : 'text-neutral-500'}`}>{(u.totalCreditPurchased || 0) > 0 ? 'Paid User' : 'Free Tier'}</span></div>
            <div className="flex justify-between items-center text-xs"><span className={theme.textLabel}>Last Purchase:</span><span className="text-white font-mono text-[10px] font-bold">{u.lastPurchaseDate ? new Date(u.lastPurchaseDate).toLocaleDateString() : 'N/A'}</span></div>
          </div>
          <div className="mt-auto grid grid-cols-3 border-t border-white/5 divide-x divide-white/5 bg-black/20">
            <button onClick={() => methods.handleUpdateUserStatus(u.uid, u.status === 'banned' ? 'active' : 'banned')} className="p-4 text-[10px] font-black tracking-widest uppercase hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-1.5 text-red-400"><Ban className="w-4 h-4" /> {u.status === 'banned' ? 'Unban' : 'Ban'}</button>
            <button onClick={() => methods.handleUpdateUserStatus(u.uid, u.status === 'deactivated' ? 'active' : 'deactivated')} className="p-4 text-[10px] font-black tracking-widest uppercase hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-1.5 text-orange-400"><UserX className="w-4 h-4" /> {u.status === 'deactivated' ? 'Activate' : 'Deactivate'}</button>
            <button onClick={() => methods.handleDeleteUser(u.uid)} className="p-4 text-[10px] font-black tracking-widest uppercase hover:bg-red-500/10 transition-colors flex flex-col items-center justify-center gap-1.5 text-red-500"><Trash2 className="w-4 h-4" /> Delete</button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);
export default UsersTab;