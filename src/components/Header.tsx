import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Branch, User, ProductItem, Expense, Invoice, FinancialAdjustment, SystemSettings } from '../types';
import { 
  Menu, 
  Building, 
  ChevronDown, 
  Globe, 
  Bell,
  AlertTriangle,
  Check,
  ShieldAlert,
  X,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  language: 'en' | 'ar';
  toggleLanguage: () => void;
  currentBranchId: string;
  setCurrentBranchId: (id: string) => void;
  branches: Branch[];
  onOpenMobileNav?: () => void;
  totalIncome: number;
  totalExpenses: number;
  products: ProductItem[];
  expenses: Expense[];
  invoices: Invoice[];
  adjustments: FinancialAdjustment[];
  systemSettings: SystemSettings;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  language,
  toggleLanguage,
  currentBranchId,
  setCurrentBranchId,
  branches,
  onOpenMobileNav,
  totalIncome,
  totalExpenses,
  products,
  expenses,
  invoices,
  adjustments,
  systemSettings
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const prevWarningIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  // Interface for computed warning objects
  interface ActiveWarning {
    id: string;
    type: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    titleAr: string;
    message: string;
    messageAr: string;
    date: string;
  }

  // Compile active warnings dynamically based on current branch selection
  const activeWarnings = useMemo(() => {
    const list: ActiveWarning[] = [];

    // 1. Low stock items
    products.forEach(p => {
      if (p.type === 'Product' && p.stock <= p.minStockAlert) {
        const isOut = p.stock === 0;
        list.push({
          id: `stock_${p.id}_${p.stock}`,
          type: isOut ? 'CRITICAL' : 'WARNING',
          title: isOut ? 'Product Out of Stock' : 'Low Stock Warning',
          titleAr: isOut ? 'نفاد مخزون المنتج' : 'تنبيه انخفاض المخزون',
          message: `${p.name} (${p.sku}) has only ${p.stock} units left.`,
          messageAr: `المنتج ${p.nameAr} (${p.sku}) يتبقى منه ${p.stock} وحدات فقط.`,
          date: new Date().toISOString().split('T')[0]
        });
      }
    });

    // 2. Pending and Flagged expenses
    expenses.forEach(e => {
      if (currentBranchId !== 'all' && e.branchId !== currentBranchId) return;
      if (e.status === 'Pending') {
        list.push({
          id: `expense_pending_${e.id}`,
          type: 'INFO',
          title: 'Pending Expense Approval',
          titleAr: 'نفقة قيد الموافقة',
          message: `Disbursement of ${e.amount.toLocaleString()} SAR for ${e.entity} requires review.`,
          messageAr: `مصروف بقيمة ${e.amount.toLocaleString()} ر.س للجهة ${e.entityAr} يتطلب موافقة مالية.`,
          date: e.date
        });
      } else if (e.status === 'Flagged') {
        list.push({
          id: `expense_flagged_${e.id}`,
          type: 'CRITICAL',
          title: 'Flagged Expense Warning',
          titleAr: 'تحذير مصروف ملحوظ للمراجعة',
          message: `Expense of ${e.amount.toLocaleString()} SAR for ${e.entity} is flagged for audit revision.`,
          messageAr: `المصروف بقيمة ${e.amount.toLocaleString()} ر.س للجهة ${e.entityAr} تم تعليمه للتدقيق والمراجعة.`,
          date: e.date
        });
      }
    });

    // 3. Overdue invoices
    invoices.forEach(inv => {
      if (currentBranchId !== 'all' && inv.branchId !== currentBranchId) return;
      if (inv.status !== 'Paid') {
        const isOverdue = new Date(inv.dueDate) < new Date();
        if (isOverdue) {
          const remaining = inv.totalAmount - inv.paidAmount;
          list.push({
            id: `invoice_overdue_${inv.id}`,
            type: 'CRITICAL',
            title: 'Invoice Overdue Alert',
            titleAr: 'تنبيه فاتورة متأخرة السداد',
            message: `Invoice ${inv.invoiceNumber} is past its due date. Outstanding: ${remaining.toLocaleString()} SAR.`,
            messageAr: `الفاتورة ${inv.invoiceNumber} متأخرة السداد. الرصيد المستحق: ${remaining.toLocaleString()} ر.س.`,
            date: inv.dueDate
          });
        }
      }
    });

    // 4. Pending financial credit/debit adjustments
    adjustments.forEach(adj => {
      if (currentBranchId !== 'all' && adj.branchId !== currentBranchId) return;
      if (adj.status === 'Pending') {
        list.push({
          id: `adj_pending_${adj.id}`,
          type: 'INFO',
          title: 'Pending Adjustment Approval',
          titleAr: 'تسوية مالية قيد الموافقة',
          message: `Adjustment note ${adj.noteNumber} (${adj.type}) is awaiting approval.`,
          messageAr: `إشعار التسوية ${adj.noteNumber} (${adj.type === 'Credit Note' ? 'إشعار دائن' : 'إشعار مدين'}) بانتظار الاعتماد.`,
          date: adj.date
        });
      }
    });

    // Filter out user dismissed warning items
    return list.filter(w => !dismissedAlerts.includes(w.id));
  }, [products, expenses, invoices, adjustments, currentBranchId, dismissedAlerts]);

  // Request browser desktop push notifications permission
  const requestNotificationPermission = () => {
    if (!('Notification' in window)) return;
    Notification.requestPermission().then(permission => {
      setPermissionStatus(permission);
    });
  };

  // Dispatch browser desktop push notification
  const sendNativePushNotification = (title: string, body: string) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxPFJPUbTXVTeuuxzBY50Ec-BA8BByUOCCPfpJo5eu6KmfMFPK4oarc2uXpFTqb9JEUFIt3GVQ5drmaQqFK5W9usyR0P8DFy8ek3LWPpHJNf2uzQvjZZNyrhfjYPFI6nfwZbPhjN2f6Eniw0PgRw2ldQCHigeYpEmyIntXgjqaRAimwkgoed8Rb-xVWWRIE27m7UFIMXUI2vJWClsik_pAcnTeGQeTakpS-jlmMFhSm8tsGFuHtjlyBK1nagLhVQuuOE9ReHQu8TU'
      });
    }
  };

  // Sync state & trigger live desktop push notifications when new warning items occur
  useEffect(() => {
    if (!systemSettings.realTimeNotifications) return;

    // Filter current warning items to see what was not previously processed
    const currentIds = new Set(activeWarnings.map(w => w.id));
    const newWarnings = activeWarnings.filter(w => !prevWarningIdsRef.current.has(w.id));

    // Update historical ref cache
    prevWarningIdsRef.current = currentIds;

    // Only dispatch notification alerts if the system has completed its initial state compilation
    if (isInitializedRef.current && newWarnings.length > 0) {
      newWarnings.forEach(w => {
        const title = language === 'ar' ? w.titleAr : w.title;
        const msg = language === 'ar' ? w.messageAr : w.message;
        sendNativePushNotification(title, msg);
      });
    }

    isInitializedRef.current = true;
  }, [activeWarnings, language, systemSettings.realTimeNotifications]);

  // Handle simulation trigger to test Web Push Notifications instantly
  const handleSimulateAlert = () => {
    const testTitle = language === 'ar' ? '🔔 بوابة التدقيق - إشعار مباشر' : '🔔 Audit Portal - Real-Time Alert';
    const testBody = language === 'ar' 
      ? 'نظام الإخطارات المباشرة للمستندات والامتثال يعمل بشكل ممتاز على هذا الجهاز.' 
      : 'Real-time corporate compliance and document alerts are fully active on this device.';

    if (!('Notification' in window)) {
      alert(language === 'ar' 
        ? 'إشعارات المتصفح غير مدعومة على هذا البرنامج.' 
        : 'Desktop push notifications are not supported on this browser.');
      return;
    }

    if (Notification.permission === 'granted') {
      sendNativePushNotification(testTitle, testBody);
    } else {
      Notification.requestPermission().then(permission => {
        setPermissionStatus(permission);
        if (permission === 'granted') {
          sendNativePushNotification(testTitle, testBody);
        } else {
          alert(language === 'ar' 
            ? 'يرجى السماح بالإشعارات في إعدادات المتصفح لإتمام الاختبار.' 
            : 'Please grant notification access in your browser settings to perform this test.');
        }
      });
    }
  };

  // Handle clearing all warning items (Mark all as read)
  const handleMarkAllAsRead = () => {
    const allIds = activeWarnings.map(w => w.id);
    setDismissedAlerts(prev => [...prev, ...allIds]);
  };

  // Filter available branches based on User permissions
  const allowedBranches = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Accountant'
    ? [{ id: 'all', name: 'All Branches', nameAr: 'جميع الفروع' }, ...branches]
    : branches.filter(b => b.id === currentUser?.branchId);

  const activeBranchName = currentBranchId === 'all'
    ? (language === 'ar' ? 'جميع الفروع' : 'All Regional Hubs')
    : (language === 'ar' 
        ? branches.find(b => b.id === currentBranchId)?.nameAr 
        : branches.find(b => b.id === currentBranchId)?.name);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 shrink-0 px-6 flex items-center justify-between relative z-10 w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile navigator drawer trigger */}
      <div className="flex items-center space-x-4 space-x-reverse">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 border border-slate-200 active:scale-95 duration-100 cursor-pointer"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        {/* Global branch workspace domain selector */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <Building className="text-slate-400 w-5 h-5 hidden md:inline shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-emerald-600 font-mono tracking-wider leading-none uppercase font-bold">
              {language === 'ar' ? 'مجال العمل النشط' : 'Active Division Portal'}
            </span>
            <div className="relative mt-1">
              <select
                value={currentBranchId}
                onChange={(e) => setCurrentBranchId(e.target.value)}
                disabled={currentUser?.role === 'Employee' || currentUser?.role === 'Manager'}
                className={`bg-transparent border-none py-0 ${language === 'ar' ? 'pl-6 pr-0' : 'pr-6 pl-0'} text-xs font-bold text-slate-800 focus:outline-none cursor-pointer select-none appearance-none`}
              >
                {allowedBranches.map(br => (
                  <option key={br.id} value={br.id} className="bg-white border-none text-slate-800 py-1 font-bold text-xs">
                    {language === 'ar' ? br.nameAr : br.name}
                  </option>
                ))}
              </select>
              {/* Custom arrow indicator */}
              <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 flex items-center`}>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded micro stats widget */}
      <div className="hidden lg:flex items-center space-x-6 space-x-reverse">
        <div className="flex items-center space-x-2 space-x-reverse border-r border-slate-200 px-4">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            {language === 'ar' ? 'الإيرادات فرع:' : 'Branch Revenue:'}
          </span>
          <span className="text-xs font-bold text-emerald-600">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse px-4">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            {language === 'ar' ? 'المصروفات فرع:' : 'Branch Expenses:'}
          </span>
          <span className="text-xs font-bold text-rose-600">{formatCurrency(totalExpenses)}</span>
        </div>
      </div>

      {/* Settings, Language Toggle and Profile widgets */}
      <div className="flex items-center space-x-4 space-x-reverse relative">
        {/* Language Toggler */}
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition duration-150 active:scale-95 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* Auditor direct alert indicator with dropdown feed */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100/80 hover:text-emerald-600 cursor-pointer duration-150 relative"
            title={language === 'ar' ? 'التنبيهات والإخطارات المباشرة' : 'Real-time Warnings Feed'}
          >
            <Bell className="w-4 h-4 text-slate-500" />
            {systemSettings.realTimeNotifications && activeWarnings.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-mono text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {activeWarnings.length}
              </span>
            )}
          </button>

          {showAlertsMenu && (
            <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-30 space-y-3 font-sans text-start`} style={{ maxHeight: '450px', overflowY: 'auto' }}>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  {language === 'ar' ? 'الإخطارات والتنبيهات المباشرة' : 'Warnings & Compliance'}
                </span>
                {systemSettings.realTimeNotifications && activeWarnings.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[9px] text-emerald-600 hover:text-emerald-700 font-bold bg-transparent border-0 cursor-pointer"
                  >
                    {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                  </button>
                )}
              </div>

              {/* Push notifications permission banner */}
              {permissionStatus !== 'granted' && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xxs leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>{language === 'ar' ? 'تفعيل الإشعارات المباشرة' : 'Enable Device Push Alerts'}</span>
                  </div>
                  <p className="text-[9px] text-slate-500">
                    {language === 'ar' 
                      ? 'احصل على إشعارات فورية على جهازك مباشرة عند وجود أي مخاطر أو نقص في المواد.' 
                      : 'Receive native desktop alerts as soon as low stock alerts or compliance risks arise.'}
                  </p>
                  {permissionStatus === 'denied' ? (
                    <span className="text-[9px] text-rose-600 font-bold block">
                      {language === 'ar' ? '⚠️ الإشعارات محجوبة في المتصفح.' : '⚠️ Alerts blocked in browser settings.'}
                    </span>
                  ) : (
                    <button
                      onClick={requestNotificationPermission}
                      className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg border-0 cursor-pointer active:scale-95 duration-100"
                    >
                      {language === 'ar' ? 'السماح بالإشعارات' : 'Grant Permission'}
                    </button>
                  )}
                </div>
              )}

              {/* Warnings list */}
              <div className="space-y-2">
                {!systemSettings.realTimeNotifications ? (
                  <div className="py-6 text-center text-slate-400 text-xxs italic">
                    {language === 'ar' 
                      ? 'تم كتم التنبيهات الفورية من إعدادات السيستم لحماية الخصوصية.' 
                      : 'Real-time notifications are muted in system preferences.'}
                  </div>
                ) : activeWarnings.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xxs flex flex-col items-center justify-center gap-2">
                    <Check className="w-8 h-8 text-emerald-600 bg-emerald-50 p-2 rounded-full" />
                    <span className="font-bold text-slate-700">
                      {language === 'ar' ? 'جميع الأنظمة مستقرة وآمنة' : 'All Systems Nominal'}
                    </span>
                    <p className="text-[9px] text-slate-400">
                      {language === 'ar' 
                        ? 'لا توجد متأخرات دفع أو نفقات معلقة أو عجز في المخزون.' 
                        : 'No stock deficits, overdue invoices, or pending approvals.'}
                    </p>
                  </div>
                ) : (
                  activeWarnings.map(w => {
                    const badgeColor = w.type === 'CRITICAL' 
                      ? 'bg-rose-50 text-rose-650 border-rose-100 text-rose-600' 
                      : w.type === 'WARNING' 
                        ? 'bg-amber-50 text-amber-650 border-amber-100 text-amber-600' 
                        : 'bg-indigo-50 text-indigo-650 border-indigo-100 text-indigo-600';

                    return (
                      <div key={w.id} className="p-2.5 bg-white border border-slate-150 rounded-xl hover:bg-slate-50 duration-100 space-y-1 relative group text-xxs">
                        {/* Dismiss single warning */}
                        <button
                          onClick={() => setDismissedAlerts(prev => [...prev, w.id])}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer duration-100"
                          title={language === 'ar' ? 'تجاهل' : 'Dismiss'}
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex px-1.5 py-0.2 rounded font-bold text-[8px] uppercase border ${badgeColor}`}>
                            {w.type === 'CRITICAL' ? (language === 'ar' ? 'عاجل' : 'Critical') : w.type === 'WARNING' ? (language === 'ar' ? 'تحذير' : 'Warning') : (language === 'ar' ? 'إقرار' : 'Info')}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400 font-semibold">{w.date}</span>
                        </div>
                        <h4 className="font-black text-slate-800 text-[10px] leading-tight">
                          {language === 'ar' ? w.titleAr : w.title}
                        </h4>
                        <p className="text-[9px] text-slate-500 leading-normal">
                          {language === 'ar' ? w.messageAr : w.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Simulation test triggers footer */}
              <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-[10px] font-bold">
                <button
                  onClick={handleSimulateAlert}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer transition active:scale-95 duration-100 border-0 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{language === 'ar' ? 'إرسال إشعار تجريبي' : 'Simulate Device Alert'}</span>
                </button>
                <button
                  onClick={() => setShowAlertsMenu(false)}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg cursor-pointer transition active:scale-95 duration-100 border-0"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>

            </div>
          )}
        </div>

        {/* User Card trigger */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 space-x-reverse hover:opacity-90 active:scale-95 duration-100 cursor-pointer"
          >
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-none">
                {language === 'ar' ? currentUser?.nameAr : currentUser?.name}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wide mt-1">
                {currentUser?.role === 'Super Admin' 
                  ? (language === 'ar' ? 'المشرف العام' : 'Super Admin') 
                  : (currentUser?.role || 'Guest')}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:inline shrink-0" />
          </button>

          {showProfileMenu && (
            <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30`}>
              <div className="px-3 py-2 border-b border-slate-100 mb-2 text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{language === 'ar' ? 'المستخدم الحالي' : 'Current profile'}</span>
                <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.email}</p>
              </div>

              <div className="px-3 py-2 space-y-2 text-[10px] text-slate-500 text-left">
                <div className="flex justify-between">
                  <span>{language === 'ar' ? 'الفرع:' : 'Division Hub:'}</span>
                  <span className="font-bold text-slate-805 text-slate-800">{activeBranchName}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'ar' ? 'الأذونات:' : 'Privilege Class:'}</span>
                  <span className="font-bold text-emerald-600">{currentUser?.role}</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-center mt-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition duration-105 cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق القائمة' : 'Close Details'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
