import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  ReceiptText, 
  CreditCard, 
  Users, 
  Store, 
  UserCheck, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  LogOut,
  Scale,
  Package
} from 'lucide-react';

export type TabId = 'DASHBOARD' | 'INCOME' | 'EXPENSES' | 'INVOICES' | 'RECEIPTS' | 'ADJUSTMENTS' | 'INVENTORY' | 'CUSTOMERS' | 'BRANCHES' | 'EMPLOYEES' | 'REPORTS' | 'SETTINGS';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  lang: 'en' | 'ar';
  userRole?: UserRole;
  logout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, lang, userRole, logout }) => {
  const navItems: { id: TabId; label: string; labelAr: string; icon: React.ComponentType<{ className?: string }>; minRole?: UserRole[] }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', labelAr: 'لوحة القيادة', icon: LayoutDashboard },
    { id: 'INCOME', label: 'Income', labelAr: 'الإيرادات', icon: TrendingUp },
    { id: 'EXPENSES', label: 'Expenses', labelAr: 'المصروفات', icon: TrendingDown },
    { id: 'INVOICES', label: 'Invoices', labelAr: 'الفواتير', icon: ReceiptText },
    { id: 'RECEIPTS', label: 'Receipts', labelAr: 'سندات القبض', icon: CreditCard },
    { id: 'ADJUSTMENTS', label: 'Adjustments (CN/DN)', labelAr: 'التسويات والخصومات', icon: Scale },
    { id: 'INVENTORY', label: 'Products & Stock', labelAr: 'المنتجات والمخزون', icon: Package },
    { id: 'CUSTOMERS', label: 'Customers', labelAr: 'العملاء', icon: Users },
    { id: 'BRANCHES', label: 'Branches', labelAr: 'الفروع', icon: Store },
    { id: 'EMPLOYEES', label: 'Employees', labelAr: 'الموظفين', icon: UserCheck },
    { id: 'REPORTS', label: 'Reports', labelAr: 'التقارير المالية', icon: BarChart3 },
    { id: 'SETTINGS', label: 'Portal Settings', labelAr: 'الإعدادات', icon: Settings, minRole: ['Super Admin', 'Admin', 'Manager'] }
  ];

  // Helper to check user privileges
  const hasAccess = (itemMinRole?: UserRole[]) => {
    if (!itemMinRole) return true;
    if (!userRole) return false;
    return itemMinRole.includes(userRole);
  };

  return (
    <aside className="w-64 max-w-xs shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-20 transition-all duration-300">
      {/* Brand area */}
      <div className="p-6 border-b border-slate-200 flex items-center space-x-3 space-x-reverse justify-start">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-mono text-xl font-bold shadow-xs shrink-0">
          N
        </div>
        <div className="text-left">
          <h2 className="text-sm font-bold text-slate-800 tracking-wider">
            {lang === 'ar' ? 'نيكسوس كابيتال' : 'NEXUS CO.'}
          </h2>
          <span className="text-[10px] text-emerald-600 font-mono tracking-wider">
            {lang === 'ar' ? 'البوابة المالية الداخلية' : 'FINANCIAL PORTAL'}
          </span>
        </div>
      </div>

      {/* Role label banner */}
      <div className="px-4 py-3 mx-4 my-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3 space-x-reverse shrink-0">
        <ShieldCheck className="text-amber-500 w-5 h-5 shrink-0" />
        <div className="text-xs truncate text-left">
          <div className="font-semibold text-slate-800 truncate">
            {userRole === 'Super Admin' ? (lang === 'ar' ? 'شريك رئيسي' : 'Senior Partner') : (userRole === 'Admin' ? (lang === 'ar' ? 'مشرف النظام' : 'Tech Administrator') : (lang === 'ar' ? 'مستخدم معتمد' : 'Authorized Personnel'))}
          </div>
          <span className="text-[10px] text-slate-400 font-mono block truncate">
            {lang === 'ar' ? `دور: ${userRole}` : `Privilege: ${userRole}`}
          </span>
        </div>
      </div>

      {/* Navigation options */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isSelected = activeTab === item.id;
          const allowed = hasAccess(item.minRole);
          const IconComponent = item.icon;
          
          if (!allowed) return null;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition duration-150 relative font-sans cursor-pointer ${
                isSelected 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100' 
                  : 'text-slate-505 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <IconComponent className={`w-5 h-5 shrink-0 ${isSelected ? 'text-emerald-605 text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-xs text-start">
                {lang === 'ar' ? item.labelAr : item.label}
              </span>
              {isSelected && (
                <div className={`absolute w-1.5 h-6 rounded-md bg-emerald-600 top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'left-2' : 'right-2'}`}></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Core signout */}
      <div className="p-4 border-t border-slate-200 shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{lang === 'ar' ? 'إنهاء الجلسة الآمنة' : 'Terminate Session'}</span>
        </button>
      </div>
    </aside>
  );
};
