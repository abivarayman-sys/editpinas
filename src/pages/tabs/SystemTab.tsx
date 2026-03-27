import React from 'react';
import { motion } from 'framer-motion';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { theme } from '../../theme.config';
import { cn } from '../ResellerAdmin'; // Make sure this path is correct based on your folder structure

// Professional Font Styles
const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

// Animation Variants
const itemVariants = { 
  hidden: { opacity: 0, y: 20, scale: 0.95 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.6 } } 
};

const SystemTab = ({ state, methods }: any) => (
  <div className="space-y-6 max-w-2xl">
    <motion.h2 variants={itemVariants} className={theme.textH1} style={poppinsFont}>System & Data</motion.h2>
    
    <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border border-red-500/20 bg-red-900/10`)}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className={cn(theme.textH3, "text-red-400 mb-1")} style={poppinsFont}>Maintenance Mode</h3>
          <p className={theme.textBody}>Lock the app for updates. Users will see a 'Be Right Back' screen.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={state.settings.maintenanceMode || false} 
            onChange={e => { 
              methods.setSettings({...state.settings, maintenanceMode: e.target.checked}); 
              methods.handleSaveSettings(); 
            }} 
            className="sr-only peer" 
          />
          <div className="w-14 h-7 bg-black/50 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-500 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 border border-red-500/30"></div>
        </label>
      </div>
    </motion.div>

    <motion.div variants={itemVariants} className={cn(`p-8 rounded-[2rem] shadow-xl border space-y-6`, theme.bgCard, theme.borderSubtle)}>
      <div>
        <h3 className={theme.textH3 + " mb-2"} style={poppinsFont}>Data Backup</h3>
        <p className={theme.textBody + " mb-6"}>Export your configuration settings and user data for safekeeping.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => toast.info("Data Export triggered. Check downloads folder.")} 
            className={theme.btnWhite + " shadow-none py-4 flex items-center justify-center gap-2"}
          >
            <Download className="w-4 h-4" strokeWidth={2}/> Export Backup
          </button>
          <button 
            onClick={() => toast.error("Please select a valid .json backup file.")} 
            className={cn(theme.btnSecondary, "py-4 flex items-center justify-center gap-2 border border-white/5")}
          >
            <Upload className="w-4 h-4" strokeWidth={2}/> Import Data
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

export default SystemTab;