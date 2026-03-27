import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CreditCard, Upload } from 'lucide-react';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin';

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const PaymentSetupTab = ({ state, methods }: any) => (
  <div className="space-y-6 max-w-3xl">
    <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>Payment Setup</motion.h2>
    <div className="space-y-6">
      <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] border shadow-xl space-y-6`, theme.bgCard, theme.borderSubtle)}>
        <h3 className={cn(theme.textH3, "flex items-center gap-2 border-b border-white/5 pb-4")} style={poppinsFont}><Zap className="w-5 h-5 text-[#5A5CE6]" /> Automated Gateway</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className={theme.textLabel}>Enable Gateway (PayMongo, Xendit)</p>
            <p className={theme.textBody + " mt-1"}>Allow users to pay directly via an automated gateway.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={state.settings.gatewayEnabled || false} onChange={e => methods.setSettings({...state.settings, gatewayEnabled: e.target.checked})} className="sr-only peer" />
            <div className="w-14 h-7 bg-[#080A12] rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-500 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#5A5CE6] border border-white/5"></div>
          </label>
        </div>
        {state.settings.gatewayEnabled && (
          <div className="pt-2">
            <label className={cn(theme.textLabel, "mb-2 block")}>Gateway Snippet / API Link</label>
            <textarea value={state.settings.gatewaySnippet || ''} onChange={e => methods.setSettings({...state.settings, gatewaySnippet: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none min-h-[120px] transition-colors text-white`, theme.bgInput, theme.textBody, theme.borderSubtle, theme.borderFocus)} placeholder="Paste your secure integration script or API endpoint here..." />
          </div>
        )}
      </motion.div>
      <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] border shadow-xl space-y-6`, theme.bgCard, theme.borderSubtle)}>
        <h3 className={cn(theme.textH3, "flex items-center gap-2 border-b border-white/5 pb-4")} style={poppinsFont}><CreditCard className="w-5 h-5 text-[#5A5CE6]" /> Manual Transfer (GCash)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={cn(theme.textLabel, "mb-2 block")}>GCash Account Name</label>
            <input type="text" value={state.settings.gcashName || ''} onChange={e => methods.setSettings({...state.settings, gcashName: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none transition-colors text-white`, theme.bgInput, theme.textBody, theme.borderSubtle, theme.borderFocus)} placeholder="Juan Dela Cruz" />
          </div>
          <div>
            <label className={cn(theme.textLabel, "mb-2 block")}>GCash Number</label>
            <input type="text" value={state.settings.gcashNumber || ''} onChange={e => methods.setSettings({...state.settings, gcashNumber: e.target.value})} className={cn(`w-full rounded-2xl px-5 py-4 border outline-none font-mono transition-colors text-white`, theme.bgInput, theme.textBody, theme.borderSubtle, theme.borderFocus)} placeholder="09170000000" />
          </div>
          <div className="md:col-span-2">
            <label className={cn(theme.textLabel, "mb-2 block")}>Upload GCash QR Code</label>
            <div className="flex items-center gap-6">
              <label className={cn(`flex flex-1 flex-col items-center justify-center gap-3 border-2 border-dashed rounded-3xl py-8 cursor-pointer transition-colors group`, theme.bgInput, theme.borderSubtle, "hover:border-[#5A5CE6]/50 hover:bg-[#5A5CE6]/5")}>
                <Upload className="w-8 h-8 text-[#5A5CE6] group-hover:scale-110 transition-transform" />
                <span className={theme.textH3} style={poppinsFont}>Select Image</span>
                <input type="file" accept="image/*" onChange={(e) => methods.handleImageUpload(e, 'qrCodeBase64')} className="hidden" />
              </label>
              {state.settings.qrCodeBase64 && <img src={state.settings.qrCodeBase64} alt="QR" className="h-32 w-32 object-cover rounded-2xl border border-white/10 shrink-0 shadow-lg" />}
            </div>
          </div>
          <div className="md:col-span-2 mt-2">
            <label className={cn(theme.textLabel, "mb-2 block")}>Upload Sample Receipt</label>
            <p className={theme.textBody + " mb-4"}>This image will be shown as a guideline to users before they upload their payment proof.</p>
            <div className="flex items-center gap-6">
              <label className={cn(`flex flex-1 flex-col items-center justify-center gap-3 border-2 border-dashed rounded-3xl py-8 cursor-pointer transition-colors group`, theme.bgInput, theme.borderSubtle, "hover:border-yellow-500/50 hover:bg-yellow-500/5")}>
                <Upload className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className={theme.textH3} style={poppinsFont}>Select Sample</span>
                <input type="file" accept="image/*" onChange={(e) => methods.handleImageUpload(e, 'sampleScreenshotBase64')} className="hidden" />
              </label>
              {state.settings.sampleScreenshotBase64 && <img src={state.settings.sampleScreenshotBase64} alt="Sample Receipt" className="h-32 w-32 object-cover rounded-2xl border border-white/10 shrink-0 shadow-lg" />}
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="pt-6 pb-12 flex justify-end">
        <button onClick={methods.handleSaveSettings} className={theme.btnPrimary + " w-full md:w-auto md:px-12 py-4"}>{state.isSaving ? 'SAVING...' : 'SAVE PAYMENT SETUP'}</button>
      </motion.div>
    </div>
  </div>
);

export default PaymentSetupTab;