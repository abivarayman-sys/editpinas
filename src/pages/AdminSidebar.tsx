import React from 'react';
import { 
  LayoutDashboard, BarChart3, CreditCard, Users, MessageSquare, 
  Ticket, Gift, Tag, Wallet, Settings, Database, LogOut, X, Coins, Wand2 
} from 'lucide-react';
import { theme } from '../theme.config'; // Adjust path if necessary
import { cn } from '../pages/ResellerAdmin'; // Adjust path to where cn is exported

const poppinsFont = { fontFamily: "'Poppins', sans-serif" };

const NavGroup = ({ title, items, activeTab, setActiveTab, setIsSidebarOpen }: any) => (
  <div className="mb-8">
    <p className={cn(theme.textLabel, "mb-3 px-4")} style={poppinsFont}>{title}</p>
    <div className="space-y-1">
      {items.map((item: any) => (
        <button 
          key={item.id} 
          onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); window.scrollTo(0,0); }}
          className={cn(`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-bold tracking-wide uppercase transition-all duration-300`, activeTab === item.id ? 'bg-[#5A5CE6] text-white shadow-[0_4px_15px_rgba(90,92,230,0.3)]' : 'text-neutral-400 hover:bg-[#151828] hover:text-white hover:translate-x-1')}
        >
          <div className="flex items-center gap-3"><item.icon className="w-5 h-5" strokeWidth={1.5} /> {item.label}</div>
          {item.badge !== undefined && item.badge > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{item.badge}</span>}
        </button>
      ))}
    </div>
  </div>
);

export default function AdminSidebar({ 
  currentTenant, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  activeTab, 
  setActiveTab, 
  pendingTransactionsCount, 
  onLogout 
}: any) {
  return (
    <aside className={cn(`fixed inset-y-0 left-0 z-50 w-72 border-r flex flex-col h-[100dvh] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`, theme.bgApp, theme.borderSubtle)}>
      <div className={cn(`p-6 flex justify-between items-center border-b`, theme.borderSubtle)}>
        <div>
          <h1 className={cn(theme.textH3, "truncate")} style={poppinsFont}>{currentTenant?.brandName || 'ADMIN'}</h1>
          <p className={theme.textLabel}>Workspace</p>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-neutral-400"><X className="w-5 h-5" /></button>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto hide-scrollbar">
        <NavGroup title="Dashboard" items={[{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'insights', label: 'Insights', icon: BarChart3 }]} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
        <NavGroup title="Operations" items={[{ id: 'queue', label: 'Verification Queue', icon: CreditCard, badge: pendingTransactionsCount }, { id: 'users', label: 'User Management', icon: Users }, { id: 'support', label: 'Support & Bots', icon: MessageSquare }]} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
        <NavGroup title="Growth" items={[{ id: 'promos', label: 'Promo Campaigns', icon: Ticket }, { id: 'referrals', label: 'Referrals', icon: Gift }]} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
        <NavGroup title="Economy" items={[{ id: 'pricing', label: 'Packages Pricing', icon: Tag }, { id: 'payment', label: 'Payment Setup', icon: Wallet }, { id: 'costs', label: 'Credit System', icon: Coins }]} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
        <NavGroup title="Customization" items={[{ id: 'presets', label: 'Styles & Presets', icon: Wand2 }, { id: 'settings', label: 'General Settings', icon: Settings }, { id: 'system', label: 'System & Data', icon: Database }]} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
      </nav>

      <div className={cn(`p-4 border-t shrink-0`, theme.borderSubtle)}>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-bold tracking-wide uppercase text-neutral-400 hover:bg-[#151828] transition-colors">
          <LogOut className="w-5 h-5" strokeWidth={1.5} /> Exit Workspace
        </button>
      </div>
    </aside>
  );
}