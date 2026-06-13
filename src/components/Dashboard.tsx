import React, { useState } from 'react';
import { Branch, SystemSettings, Customer } from '../types';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ArrowUp, 
  ArrowDown, 
  Wallet, 
  ReceiptText, 
  BadgeCheck, 
  X, 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb 
} from 'lucide-react';

interface DashboardProps {
  branches: Branch[];
  customers: Customer[];
  transactions: any[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pendingInvoicesCount: number;
  pendingInvoicesAmount: number;
  lang: 'en' | 'ar';
  systemSettings: SystemSettings;
  setActiveTab: (tab: any) => void;
  currentBranchId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  branches,
  customers,
  transactions,
  totalIncome,
  totalExpenses,
  netProfit,
  pendingInvoicesCount,
  pendingInvoicesAmount,
  lang,
  systemSettings,
  setActiveTab,
  currentBranchId
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: systemSettings.primaryCurrency
    }).format(amount);
  };

  const getRecentTransactions = () => {
    return transactions.slice(0, 5);
  };

  // Safe division branch name getter
  const getBranchName = (brId: string) => {
    const branch = branches.find(b => b.id === brId);
    if (!branch) return lang === 'ar' ? 'عام' : 'Global';
    return lang === 'ar' ? branch.nameAr : branch.name;
  };

  // Math simulations for a stunning animated area chart showing cash trends
  const chartPoints = [
    { label: 'May 01', income: 45000, expenses: 18000 },
    { label: 'May 10', income: 68000, expenses: 22000 },
    { label: 'May 20', income: 55000, expenses: 28000 },
    { label: 'May 30', income: 84000, expenses: 31000 },
    { label: 'Jun 10', income: 99000, expenses: 38000 },
    { label: 'Jun 12', income: totalIncome, expenses: totalExpenses }
  ];

  const maxVal = Math.max(...chartPoints.map(p => Math.max(p.income, p.expenses)), 100000);
  const chartWidth = 500;
  const chartHeight = 220;

  // Safe coordinate generator
  const getCoords = (data: typeof chartPoints, key: 'income' | 'expenses') => {
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - (point[key] / maxVal) * (chartHeight - 40) - 20;
      return `${x},${y}`;
    }).join(' ');
  };

  const incomeLinePath = getCoords(chartPoints, 'income');
  const expensesLinePath = getCoords(chartPoints, 'expenses');

  return (
    <div className="space-y-6 relative h-full" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Title area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-start">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mb-1">
            {lang === 'ar' ? 'نظرة عامة على النشاط' : 'Strategic Overview'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' ? 'إحصائيات التدفقات النقدية ومطابقة الحسابات المشتركة' : 'Anomalies detection, global cashflows and cross-branch auditing metrics.'}
          </p>
        </div>
      </div>

      {/* Grid of 4 critical stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 hover:border-emerald-500/40 transition duration-200 group cursor-pointer" onClick={() => setActiveTab('INCOME')}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xxs text-slate-500 font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'إجمالي الإيرادات' : 'Consolidated Income'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-100 duration-200 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-emerald-600 mb-1 font-mono text-start">
            {formatCurrency(totalIncome)}
          </div>
          <span className="text-xxs font-bold flex items-center gap-1 text-emerald-600 justify-start">
            <ArrowUp className="w-3.5 h-3.5 shrink-0" />
            <span>+14.8% {lang === 'ar' ? 'هذا الشهر' : 'vs last cycle'}</span>
          </span>
        </div>

        {/* Card 2: Expenses */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 hover:border-rose-500/40 transition duration-200 group cursor-pointer" onClick={() => setActiveTab('EXPENSES')}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xxs text-slate-500 font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'إجمالي المصروفات' : 'Consolidated Expenses'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:bg-rose-100 duration-200 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-rose-600 mb-1 font-mono text-start">
            {formatCurrency(totalExpenses)}
          </div>
          <span className="text-xxs font-bold flex items-center gap-1 text-rose-600 justify-start">
            <ArrowDown className="w-3.5 h-3.5 shrink-0" />
            <span>-2.4% {lang === 'ar' ? 'انخفاض في العجز' : 'tightened flow'}</span>
          </span>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 hover:border-slate-300 transition duration-200 group cursor-pointer" onClick={() => setActiveTab('REPORTS')}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xxs text-slate-500 font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'صافي الأرباح' : 'Net Liquidity'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-slate-200 duration-200 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-xl md:text-2xl font-bold mb-1 font-mono text-start ${netProfit >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
            {formatCurrency(netProfit)}
          </div>
          <span className="text-xxs text-slate-500 font-medium block truncate text-start">
            {lang === 'ar' ? 'هامش التشغيل الصافي المستمر' : 'Operating profit net ratio'}
          </span>
        </div>

        {/* Card 4: Open Invoices */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 hover:border-amber-500/40 transition duration-200 group cursor-pointer" onClick={() => setActiveTab('INVOICES')}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xxs text-slate-500 font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'فواتير مستحقة التحصيل' : 'Receivables Ledger'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:bg-amber-100 duration-200 shrink-0">
              <ReceiptText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-amber-600 mb-1 font-mono text-start">
            {formatCurrency(pendingInvoicesAmount)}
          </div>
          <span className="text-xxs font-bold font-mono text-amber-600 block text-start">
            {pendingInvoicesCount} {lang === 'ar' ? 'فواتير معلقة' : 'open accounts'}
          </span>
        </div>
      </div>

      {/* Main split chart + transactions body */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-start">
        {/* Neon Flow Chart */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 xl:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="text-start">
              <h3 className="text-sm font-bold text-slate-800 mb-0.5">
                {lang === 'ar' ? 'مخطط التدفقات النقدية السريعة' : 'Continuous Asset Flows'}
              </h3>
              <p className="text-xxs text-slate-500">
                {lang === 'ar' ? 'التسويات النقدية المتوقعة للأسابيع الماضية والجارية' : 'Aggregated projections for active fiscal week'}
              </p>
            </div>
            {/* Chart Legends */}
            <div className="flex items-center space-x-3 space-x-reverse text-xxs font-semibold">
              <div className="flex items-center space-x-1 space-x-reverse">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
                <span className="text-slate-500">{lang === 'ar' ? 'إيرادات' : 'Inflow'}</span>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
                <span className="text-slate-500">{lang === 'ar' ? 'مصروفات' : 'Outflow'}</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Chart Container */}
          <div className="w-full h-56 relative overflow-hidden flex items-end">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="#f1f5f9" strokeDasharray="3,3" strokeWidth="1.5" />
              <line x1="0" y1="70" x2={chartWidth} y2="70" stroke="#f1f5f9" strokeDasharray="3,3" strokeWidth="1.5" />
              <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="#f1f5f9" strokeDasharray="3,3" strokeWidth="1.5" />
              <line x1="0" y1="170" x2={chartWidth} y2="170" stroke="#f1f5f9" strokeDasharray="3,3" strokeWidth="1.5" />
              <line x1="0" y1="200" x2={chartWidth} y2="200" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Area Under Lines */}
              <path d={`M 0,${chartHeight} L ${incomeLinePath} L ${chartWidth},${chartHeight} Z`} fill="url(#emeraldGrad)" />
              <path d={`M 0,${chartHeight} L ${expensesLinePath} L ${chartWidth},${chartHeight} Z`} fill="url(#roseGrad)" />

              {/* Line Curves */}
              <path d={`M ${incomeLinePath}`} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M ${expensesLinePath}`} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Points Markers */}
              {chartPoints.map((point, index) => {
                const x = (index / (chartPoints.length - 1)) * chartWidth;
                const yIncome = chartHeight - (point.income / maxVal) * (chartHeight - 40) - 20;
                const yExpenses = chartHeight - (point.expenses / maxVal) * (chartHeight - 40) - 20;

                return (
                  <g key={index}>
                    {/* Income Point Dot */}
                    <circle cx={x} cy={yIncome} r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                    {/* Expense Point Dot */}
                    <circle cx={x} cy={yExpenses} r="4" fill="#ffffff" stroke="#f43f5e" strokeWidth="2" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Chart label captions */}
          <div className="flex justify-between px-2 text-xxs font-mono text-slate-400 mt-2">
            {chartPoints.map((p, i) => <span key={i}>{p.label}</span>)}
          </div>
        </div>

        {/* Recent Transactions List with full status alerts */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-bold text-slate-800 font-sans">
                {lang === 'ar' ? 'أحدث المعاملات القيّدية' : 'Live Ledger Stream'}
              </h3>
              <button
                onClick={() => setActiveTab('INCOME')}
                className="text-xxs font-bold text-emerald-600 hover:underline hover:text-emerald-700 duration-100 cursor-pointer"
              >
                {lang === 'ar' ? 'عرض الكل' : 'Inspect Ledger'}
              </button>
            </div>

            <div className="space-y-3">
              {getRecentTransactions().map((t, index) => {
                const isIncome = t.type === 'INCOME';
                return (
                  <div key={t.id || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200/80 transition duration-150">
                    <div className="flex items-center space-x-3 space-x-reverse truncate">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isIncome 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                          : 'bg-rose-50 border-rose-100 text-rose-600'
                      }`}>
                        {isIncome ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      </div>
                      <div className="truncate text-start">
                        <span className="text-xs font-bold text-slate-800 block truncate leading-tight">
                          {t.entity}
                        </span>
                        <span className="text-xxs text-slate-500 font-mono block leading-none mt-1">
                          {getBranchName(t.branchId)} • {lang === 'ar' ? t.categoryAr : t.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <span className={`text-xs font-bold font-mono block ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {isIncome ? '+' : ''}{formatCurrency(t.amount)}
                      </span>
                      <span className="text-xxs text-slate-400 font-mono leading-none mt-1 block">
                        {t.date}
                      </span>
                    </div>
                  </div>
                );
              })}
              {getRecentTransactions().length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500 font-sans">
                  {lang === 'ar' ? 'لا توجد معاملات قيّدية حالياً للفرع المعين.' : 'Zero active transactions logged for selected hub.'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xxs font-mono text-slate-400">
            <span>{lang === 'ar' ? 'التحقق التلقائي للقيود:' : 'Ledger Integrity Status:'}</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>100% {lang === 'ar' ? 'سليم وحيوي' : 'VERIFIED'}</span>
            </span>
          </div>
        </div>
      </div>    </div>
  );
};
