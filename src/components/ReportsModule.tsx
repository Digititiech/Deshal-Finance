import React, { useState, useMemo } from 'react';
import { Branch, Income, Expense, SystemSettings, Invoice, Receipt, Customer, ProductItem, InventoryMovement } from '../types';
import { 
  Download, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Search, 
  Building, 
  DollarSign, 
  Percent, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Users, 
  Brain, 
  ArrowUpRight, 
  ArrowDownRight,
  Printer,
  Package
} from 'lucide-react';

interface ReportsModuleProps {
  branches: Branch[];
  income: Income[];
  expenses: Expense[];
  invoices?: Invoice[];
  receipts?: Receipt[];
  customers?: Customer[];
  products?: ProductItem[];
  movements?: InventoryMovement[];
  lang: 'en' | 'ar';
  systemSettings: SystemSettings;
}

type ReportSubTab = 'dashboard' | 'pl' | 'vat' | 'receivables' | 'inventory' | 'copilot';

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  branches,
  income = [],
  expenses = [],
  invoices = [],
  receipts = [],
  customers = [],
  products = [],
  movements = [],
  lang,
  systemSettings
}) => {
  // Navigation & Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<ReportSubTab>('dashboard');

  // Filter States
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'this-month' | 'this-quarter' | 'this-year' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Currency utility
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: systemSettings.primaryCurrency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 1. Core Filter Logic
  const checkInPeriod = (dateStr: string) => {
    if (!dateStr) return true;
    const itemDate = new Date(dateStr);
    const now = new Date();
    
    if (selectedPeriod === 'all') return true;
    if (selectedPeriod === 'this-month') {
      return itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth();
    }
    if (selectedPeriod === 'this-quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const itemQuarter = Math.floor(itemDate.getMonth() / 3);
      return itemDate.getFullYear() === now.getFullYear() && currentQuarter === itemQuarter;
    }
    if (selectedPeriod === 'this-year') {
      return itemDate.getFullYear() === now.getFullYear();
    }
    if (selectedPeriod === 'custom') {
      if (customStartDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) return false;
      }
      if (customEndDate) {
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) return false;
      }
      return true;
    }
    return true;
  };

  // Matches text queries
  const matchesSearch = (text: string | undefined, arText: string | undefined, query: string) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    return (
      (text || '').toLowerCase().includes(q) ||
      (arText || '').toLowerCase().includes(q)
    );
  };

  // Filtered lists
  const filteredIncome = useMemo(() => {
    return income.filter(inc => {
      const bMatch = selectedBranchId === 'all' || inc.branchId === selectedBranchId;
      const pMatch = checkInPeriod(inc.date);
      const sMatch = matchesSearch(inc.source, inc.sourceAr, searchQuery) || 
                     matchesSearch(inc.description, inc.descriptionAr, searchQuery);
      return bMatch && pMatch && sMatch;
    });
  }, [income, selectedBranchId, selectedPeriod, customStartDate, customEndDate, searchQuery]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const bMatch = selectedBranchId === 'all' || exp.branchId === selectedBranchId;
      const pMatch = checkInPeriod(exp.date);
      const sMatch = matchesSearch(exp.entity, exp.entityAr, searchQuery) || 
                     matchesSearch(exp.description, exp.descriptionAr, searchQuery) ||
                     matchesSearch(exp.category, exp.category, searchQuery); // category is EN
      return bMatch && pMatch && sMatch;
    });
  }, [expenses, selectedBranchId, selectedPeriod, customStartDate, customEndDate, searchQuery]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const bMatch = selectedBranchId === 'all' || inv.branchId === selectedBranchId;
      const pMatch = checkInPeriod(inv.issueDate);
      return bMatch && pMatch;
    });
  }, [invoices, selectedBranchId, selectedPeriod, customStartDate, customEndDate]);

  // Aggregated KPIs
  const totalInflow = useMemo(() => filteredIncome.reduce((sum, item) => sum + item.amount, 0), [filteredIncome]);
  const totalOutflow = useMemo(() => filteredExpenses.reduce((sum, item) => sum + item.amount, 0), [filteredExpenses]);
  const netMargin = totalInflow - totalOutflow;
  const operationalRatio = totalInflow > 0 ? (netMargin / totalInflow) * 100 : 0;

  // Branch visual metrics
  const branchProfitShare = useMemo(() => {
    return branches.map(br => {
      const brInflow = income
        .filter(i => i.branchId === br.id && checkInPeriod(i.date))
        .reduce((s, i) => s + i.amount, 0);
      const brOutflow = expenses
        .filter(e => e.branchId === br.id && checkInPeriod(e.date))
        .reduce((s, e) => s + e.amount, 0);
      const brNet = brInflow - brOutflow;
      return {
        name: br.name,
        nameAr: br.nameAr,
        id: br.id,
        inflow: brInflow,
        outflow: brOutflow,
        net: brNet
      };
    }).sort((a, b) => b.net - a.net);
  }, [branches, income, expenses, selectedPeriod, customStartDate, customEndDate]);

  // Dynamic Monthly chart data
  const monthlyChartData = useMemo(() => {
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const monthlyMap: { [key: string]: { inflow: number; outflow: number } } = {};
    
    filteredIncome.forEach(i => {
      if (!i.date) return;
      const d = new Date(i.date);
      const m = d.getMonth();
      const y = d.getFullYear();
      const key = `${y}-${m}`;
      if (!monthlyMap[key]) monthlyMap[key] = { inflow: 0, outflow: 0 };
      monthlyMap[key].inflow += i.amount;
    });
    
    filteredExpenses.forEach(e => {
      if (!e.date) return;
      const d = new Date(e.date);
      const m = d.getMonth();
      const y = d.getFullYear();
      const key = `${y}-${m}`;
      if (!monthlyMap[key]) monthlyMap[key] = { inflow: 0, outflow: 0 };
      monthlyMap[key].outflow += e.amount;
    });
    
    const sortedKeys = Object.keys(monthlyMap).sort((a, b) => {
      const [yA, mA] = a.split('-').map(Number);
      const [yB, mB] = b.split('-').map(Number);
      return yA !== yB ? yA - yB : mA - mB;
    });
    
    if (sortedKeys.length === 0) {
      // Return 6 standard months placeholder
      return Array.from({ length: 6 }).map((_, idx) => {
        const d = new Date();
        d.setMonth(d.getMonth() - 5 + idx);
        const m = d.getMonth();
        return {
          label: lang === 'ar' ? monthsAr[m] : monthsEn[m],
          inflow: idx === 1 ? 5000 : idx === 3 ? 9000 : 0,
          outflow: idx === 1 ? 2500 : idx === 3 ? 4000 : 0
        };
      });
    }
    
    return sortedKeys.slice(-6).map(key => {
      const [y, m] = key.split('-').map(Number);
      return {
        label: lang === 'ar' ? `${monthsAr[m]} ${y}` : `${monthsEn[m]} ${y}`,
        inflow: monthlyMap[key].inflow,
        outflow: monthlyMap[key].outflow
      };
    });
  }, [filteredIncome, filteredExpenses, lang]);

  // Accounts Receivable Aging list
  const customerDebts = useMemo(() => {
    const unpaidInvoices = invoices.filter(inv => {
      const bMatch = selectedBranchId === 'all' || inv.branchId === selectedBranchId;
      const pMatch = checkInPeriod(inv.issueDate);
      return inv.status !== 'Paid' && bMatch && pMatch;
    });

    const debtsMap: { [custId: string]: { name: string; nameAr: string; outstanding: number; count: number; risk: string } } = {};

    unpaidInvoices.forEach(inv => {
      const custId = inv.customerId;
      const remaining = inv.totalAmount - inv.paidAmount;
      if (remaining <= 0) return;

      if (!debtsMap[custId]) {
        const custObj = customers.find(c => c.id === custId);
        debtsMap[custId] = {
          name: custObj ? custObj.name : `Customer ID #${custId.slice(0, 4)}`,
          nameAr: custObj ? custObj.nameAr : `عميل كود #${custId.slice(0, 4)}`,
          outstanding: 0,
          count: 0,
          risk: remaining > 10000 ? 'High' : 'Normal'
        };
      }
      debtsMap[custId].outstanding += remaining;
      debtsMap[custId].count += 1;
    });

    return Object.values(debtsMap).sort((a, b) => b.outstanding - a.outstanding);
  }, [invoices, customers, selectedBranchId, selectedPeriod, customStartDate, customEndDate]);

  // --- 1.5 Inventory & Stock Audit Analytics useMemos ---
  const filteredProducts = useMemo(() => {
    return products.filter(prod => {
      const sMatch = matchesSearch(prod.name, prod.nameAr, searchQuery) ||
                     matchesSearch(prod.sku, prod.sku, searchQuery) ||
                     matchesSearch(prod.category, prod.categoryAr, searchQuery);
      return sMatch;
    });
  }, [products, searchQuery]);

  const filteredMovements = useMemo(() => {
    return movements.filter(mov => {
      const bMatch = selectedBranchId === 'all' || mov.branchId === selectedBranchId;
      const pMatch = checkInPeriod(mov.date);
      return bMatch && pMatch;
    });
  }, [movements, selectedBranchId, selectedPeriod, customStartDate, customEndDate]);

  const inventoryStats = useMemo(() => {
    let totalItemsCount = 0;
    let totalServicesCount = 0;
    let totalQty = 0;
    let totalCostValuation = 0;
    let totalPriceValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(prod => {
      if (prod.type === 'Service') {
        totalServicesCount += 1;
      } else {
        totalItemsCount += 1;
        totalQty += prod.stock;
        totalCostValuation += (prod.cost || 0) * prod.stock;
        totalPriceValuation += (prod.price || 0) * prod.stock;

        if (prod.stock === 0) {
          outOfStockCount += 1;
        } else if (prod.stock <= (prod.minStockAlert || 5)) {
          lowStockCount += 1;
        }
      }
    });

    const potentialProfit = totalPriceValuation - totalCostValuation;

    return {
      totalItemsCount,
      totalServicesCount,
      totalQty,
      totalCostValuation,
      totalPriceValuation,
      potentialProfit,
      lowStockCount,
      outOfStockCount
    };
  }, [products]);

  // Grouping by Category
  const inventoryCategoryStats = useMemo(() => {
    const categoriesMap: { [cat: string]: { name: string; nameAr: string; count: number; totalStock: number; totalCost: number } } = {};

    products.forEach(prod => {
      if (prod.type !== 'Product') return;
      const catKey = prod.category || 'Uncategorized';
      if (!categoriesMap[catKey]) {
        categoriesMap[catKey] = {
          name: prod.category || 'Uncategorized',
          nameAr: prod.categoryAr || 'غير مصنف',
          count: 0,
          totalStock: 0,
          totalCost: 0
        };
      }
      categoriesMap[catKey].count += 1;
      categoriesMap[catKey].totalStock += prod.stock;
      categoriesMap[catKey].totalCost += (prod.cost || 0) * prod.stock;
    });

    return Object.values(categoriesMap).sort((a, b) => b.totalCost - a.totalCost);
  }, [products]);

  // 2. Comprehensive CSV / JSON statement export
  const handleExportCSV = () => {
    const headers = lang === 'ar' 
      ? ['النوع', 'المصدر/الجهة', 'الفرع', 'القيمة', 'التاريخ', 'التصنيف/طبيعة البند']
      : ['Type', 'Source/Entity', 'Branch', 'Amount', 'Date', 'Category/Details'];
    
    const rows = [
      ...filteredIncome.map(i => {
        const b = branches.find(x => x.id === i.branchId);
        return [
          lang === 'ar' ? 'وارد (دخل)' : 'Inflow (Income)',
          lang === 'ar' ? i.sourceAr || i.source : i.source,
          lang === 'ar' ? b?.nameAr || b?.name : b?.name || 'All',
          i.amount,
          i.date,
          lang === 'ar' ? i.descriptionAr || i.description || 'عائدات' : i.description || 'Revenue'
        ];
      }),
      ...filteredExpenses.map(e => {
        const b = branches.find(x => x.id === e.branchId);
        return [
          lang === 'ar' ? 'صادر (مصروف)' : 'Outflow (Expense)',
          lang === 'ar' ? e.entityAr || e.entity : e.entity,
          lang === 'ar' ? b?.nameAr || b?.name : b?.name || 'All',
          e.amount,
          e.date,
          `${e.category} - ${lang === 'ar' ? e.descriptionAr || '' : e.description || ''}`
        ];
      })
    ];

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `detailed_financial_ledger_statement_${Date.now()}.csv`;
    link.click();
  };

  // General audit JSON trigger
  const handleTriggerExportJSON = () => {
    const payload = {
      generator: "Executive Audit Ledger Portal",
      timestamp: new Date().toISOString(),
      currency: systemSettings.primaryCurrency,
      filters: {
        branch: selectedBranchId,
        period: selectedPeriod,
        startDate: customStartDate,
        endDate: customEndDate,
        search: searchQuery
      },
      summary: {
        totalRevenue: totalInflow,
        totalExpenses: totalOutflow,
        netProfit: netMargin,
        operatingRatio: `${operationalRatio.toFixed(2)}%`,
        vatEstimatedDebt: systemSettings.vatCompliance ? (totalInflow - totalOutflow) * ((systemSettings.vatRatePct || 15) / 100) : 0
      },
      branchShares: branchProfitShare,
      agingReceivables: customerDebts,
      inventorySummary: inventoryStats
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `executive_finance_audit_bundle_${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="space-y-6 font-sans text-start animate-fade-in printable-area" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 1. Header Banner */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-100 pb-5 no-print">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-800 mb-1 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            {lang === 'ar' ? 'بوابة التقارير المالية والتحليلات التنفيذية' : 'Executive Audit & Financial Reports'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' 
              ? 'أدوات المراقبة الاستراتيجية، توازنات ليدجر، قياس كفاءة الفروع، مستحقات الضريبية ودعم متخذي القرار.' 
              : 'Corporate ledger balances, branch performance ratios, tax compliance intelligence, and executive support.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Print PDF Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition duration-100 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>{lang === 'ar' ? 'طباعة / تصدير PDF' : 'Print / Export PDF'}</span>
          </button>

          {/* CSV Excel Ledger */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition duration-100 cursor-pointer"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'تصدير ليدجر Excel' : 'Export Excel CSV'}</span>
          </button>

          {/* JSON Statement */}
          <button
            onClick={handleTriggerExportJSON}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl shadow-sm transition duration-100 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'موازنة المراجعة الموحدة JSON' : 'Generate Core JSON Audit'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Area */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4 no-print select-none">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          {lang === 'ar' ? 'محرك الفلترة الذكية والبحث ليدجر' : 'Smart Ledger Filtering & Query Controls'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Branch Target Selector */}
          <div className="space-y-1.5">
            <label className="text-xxs font-black text-slate-500 uppercase block">{lang === 'ar' ? 'فرع التشغيل المعني' : 'Target Branch'}</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 ltr:block rtl:hidden" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-55 border border-slate-200 hover:border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">{lang === 'ar' ? 'جميع الفروع / موحد' : 'All Branches / Consolidated'}</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{lang === 'ar' ? b.nameAr : b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Period Picker */}
          <div className="space-y-1.5">
            <label className="text-xxs font-black text-slate-500 uppercase block">{lang === 'ar' ? 'النطاق والموجّه المالي' : 'Reporting Period'}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 ltr:block rtl:hidden" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-55 border border-slate-200 hover:border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">{lang === 'ar' ? 'كل البيانات / تراكمي' : 'All Time Ledger'}</option>
                <option value="this-month">{lang === 'ar' ? 'هذا الشهر' : 'This Current Month'}</option>
                <option value="this-quarter">{lang === 'ar' ? 'الربع المالي الحالي' : 'This Financial Quarter'}</option>
                <option value="this-year">{lang === 'ar' ? 'السنة المالية الجارية' : 'This Current Year'}</option>
                <option value="custom">{lang === 'ar' ? 'نطاق تاريخ مخصص...' : 'Custom Date Window...'}</option>
              </select>
            </div>
          </div>

          {/* Description/Entity query */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xxs font-black text-slate-500 uppercase block">{lang === 'ar' ? 'بحث وتدقيق في الكلمات والوصف' : 'Search Reference / Description'}</label>
            <div className="relative">
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث حسب المصدر، الوصف، جهة الصرف، التصنيف...' : 'Search source, entity, description, category...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-3 py-2 text-xs bg-slate-55 border border-slate-200 hover:border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

        </div>

        {/* Custom date picker pop-down */}
        {selectedPeriod === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-150 rounded-xl mt-3 animate-fade-in">
            <div className="space-y-1">
              <span className="text-xxs font-bold text-slate-500 block">{lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}</span>
              <input 
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xxs font-bold text-slate-500 block">{lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}</span>
              <input 
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Core KPIs Dashboard Cards (Visible on print & screen) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Net Margin */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-normal">
                {lang === 'ar' ? 'صافي الموازنة اليدجر للفرع' : 'Audited Net Margin'}
              </span>
              <span className={`text-md sm:text-lg font-mono font-bold block mt-1.5 ${netMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(netMargin)}
              </span>
            </div>
            <div className={`p-1.5 rounded-lg ${netMargin >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {netMargin >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
          </div>
          <span className="text-[9px] text-slate-400 mt-3 block">
            {lang === 'ar' ? 'الوارد المخصوم من جميع النفقات المنقحة' : 'Direct inflow sum after deducting operating liabilities'}
          </span>
        </div>

        {/* KPI 2: Operating Efficiency Ratio */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-normal">
                {lang === 'ar' ? 'نسبة كفاءة التشغيل الموحدة (هامش الأرباح)' : 'Operating Profit Margin'}
              </span>
              <span className={`text-md sm:text-lg font-mono font-bold block mt-1.5 ${operationalRatio >= 30 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {operationalRatio.toFixed(1)}%
              </span>
            </div>
            <div className={`p-1.5 rounded-lg ${operationalRatio >= 30 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full ${operationalRatio >= 30 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
              style={{ width: `${Math.max(0, Math.min(100, Math.round(operationalRatio)))}%` }}
            ></div>
          </div>
        </div>

        {/* KPI 3: Inflows / Revenue */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-normal">
                {lang === 'ar' ? 'إجمالي الودائع الواردة' : 'Gross Ledger Inflows'}
              </span>
              <span className="text-md sm:text-lg font-mono font-bold text-slate-800 block mt-1.5">
                {formatCurrency(totalInflow)}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[9px] text-blue-500/80 mt-3 block font-medium">
            {lang === 'ar' ? `${filteredIncome.length} سندات دفع وتشغيل مفعّلة` : `${filteredIncome.length} cash ledger entries`}
          </span>
        </div>

        {/* KPI 4: Vat Compliance Liability or Total Expenses */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-normal">
                {systemSettings.vatCompliance 
                  ? (lang === 'ar' ? `الضريبة التقديرية (${systemSettings.vatRatePct || 15}%)` : `Est. Net VAT Liability (${systemSettings.vatRatePct || 15}%)`)
                  : (lang === 'ar' ? 'إجمالي المصروفات الخارجة' : 'Gross Ledger Outflows')}
              </span>
              <span className="text-md sm:text-lg font-mono font-bold text-rose-600 block mt-1.5">
                {systemSettings.vatCompliance 
                  ? formatCurrency((totalInflow - totalOutflow) * ((systemSettings.vatRatePct || 15) / 100))
                  : formatCurrency(totalOutflow)}
              </span>
            </div>
            <div className={`p-1.5 rounded-lg ${systemSettings.vatCompliance ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-600'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[9px] text-slate-400 mt-3 block">
            {systemSettings.vatCompliance 
              ? (lang === 'ar' ? 'نظام الضريبة مفعّل بناء على لائحة الهيئة' : 'Calculated automatically on net ledger profit margins')
              : (lang === 'ar' ? `${filteredExpenses.length} مصروفات مسجلة تشغيلياً` : `${filteredExpenses.length} audited operational outlays`)}
          </span>
        </div>
      </div>

      {/* 4. Sub-Reporting Sub-Tabs Layout */}
      <div className="bg-slate-100 hover:bg-slate-100/90 border border-slate-200/60 p-1 rounded-xl flex flex-wrap gap-1 no-print select-none">
        
        {/* Dashboard Tab */}
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xxs font-black rounded-lg transition-all duration-100 cursor-pointer ${activeSubTab === 'dashboard' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'لوحة الأداء العام' : 'Consolidated Analytics'}</span>
        </button>

        {/* P&L Statement Tab */}
        <button
          onClick={() => setActiveSubTab('pl')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xxs font-black rounded-lg transition-all duration-100 cursor-pointer ${activeSubTab === 'pl' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'قائمة الأرباح والخسائر P&L' : 'Profit & Loss Statement'}</span>
        </button>

        {/* VAT Audit Tab */}
        <button
          onClick={() => setActiveSubTab('vat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xxs font-black rounded-lg transition-all duration-100 cursor-pointer ${activeSubTab === 'vat' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'ضريبة القيمة المضافة ومطابقة الذمم' : 'VAT Audits & Tax'}</span>
        </button>

        {/* Accounts Receivables & aging */}
        <button
          onClick={() => setActiveSubTab('receivables')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xxs font-black rounded-lg transition-all duration-100 cursor-pointer ${activeSubTab === 'receivables' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'أعمار الديون والذمم المدينة' : 'Accounts Receivable (Aging)'}</span>
        </button>

        {/* Inventory & Warehouse Reports Tab */}
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xxs font-black rounded-lg transition-all duration-100 cursor-pointer ${activeSubTab === 'inventory' ? 'bg-white text-slate-805 shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
        >
          <Package className="w-3.5 h-3.5 text-blue-600" />
          <span>{lang === 'ar' ? 'تقارير المخزون ومستويات المواد' : 'Inventory & Warehouse Ledger'}</span>
        </button>

        {/* Executive Decisions Advisory Tab */}
        <button
          onClick={() => setActiveSubTab('copilot')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xxs font-black rounded-lg transition-all duration-100 cursor-pointer ${activeSubTab === 'copilot' ? 'bg-white text-slate-805 shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
        >
          <Brain className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'ar' ? 'المستشار التنفيذي والقرارات الإدارية' : 'Executive AI Strategy Copilot'}</span>
        </button>
      </div>

      {/* 5. Sub-Views Contents Rendering */}

      {/* TAB 1: Consolidated Dashboard Summary */}
      {activeSubTab === 'dashboard' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Main Visual dynamic graph of inflows vs outflows */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl xl:col-span-2 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                {lang === 'ar' ? 'مقارن حركة النقد ومستويات التدفق (آخر 6 أشهر مفعّلة)' : 'Liquidity Flow Dynamics (Last 6 Active Months)'}
              </h3>
              <span className="text-xxs text-slate-400 mt-1 block">
                {lang === 'ar' ? 'تدقيق السيولة الداخلة مقابل الخارجة استناداً إلى القيود المرشحة' : 'Inflow versus Outlay distributed chromatographically'}
              </span>
            </div>

            {/* Custom Modern Pure SVG double-bar chart */}
            <div className="h-64 w-full flex items-center justify-center bg-slate-50 rounded-xl border border-slate-250/60 p-4 mt-4 relative">
              <svg className="w-full h-full" viewBox="0 0 500 240" preserveAspectRatio="none">
                {/* Horizontal gridlines */}
                <line x1="30" y1="40" x2="480" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="90" x2="480" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="190" x2="480" y2="190" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 2" />

                {/* Draw Month Double Bars */}
                {monthlyChartData.map((data, idx) => {
                  const barWidth = 22;
                  const spacing = 75;
                  const xOrigin = 55 + idx * spacing;
                  
                  // Calculate heights scaling based on max flow in dataset
                  const maxVal = Math.max(...monthlyChartData.map(d => Math.max(d.inflow, d.outflow)), 8000);
                  
                  const inflowHeight = (data.inflow / maxVal) * 140;
                  const outflowHeight = (data.outflow / maxVal) * 140;

                  return (
                    <g key={idx} className="transition-all duration-300">
                      {/* Inflow bar (Emerald) */}
                      <rect 
                        x={xOrigin} 
                        y={190 - inflowHeight} 
                        width={barWidth} 
                        height={Math.max(3, inflowHeight)} 
                        fill="url(#emerald-grad)" 
                        rx="3" 
                        className="hover:opacity-90 cursor-pointer"
                      />
                      {/* Outflow bar (Amber/Rose) */}
                      <rect 
                        x={xOrigin + barWidth + 4} 
                        y={190 - outflowHeight} 
                        width={barWidth} 
                        height={Math.max(3, outflowHeight)} 
                        fill="url(#rose-grad)" 
                        rx="3" 
                        className="hover:opacity-90 cursor-pointer"
                      />

                      {/* Display brief numerical representations above bar on hover */}
                      <text x={xOrigin + barWidth} y={190 - Math.max(inflowHeight, 15) - 6} textAnchor="middle" className="fill-emerald-700 font-mono text-[8px] font-bold">
                        {data.inflow > 0 ? formatCurrency(data.inflow) : ''}
                      </text>

                      {/* X-axis custom month label */}
                      <text x={xOrigin + barWidth} y="210" textAnchor="middle" className="fill-slate-500 font-sans text-[9px] font-bold">
                        {data.label}
                      </text>
                    </g>
                  );
                })}

                {/* SVG definitions for gradients */}
                <defs>
                  <linearGradient id="emerald-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="rose-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Custom chart legend indicators */}
            <div className="flex justify-center items-center gap-6 mt-4 text-xxs font-bold text-slate-500 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-r from-emerald-600 to-emerald-400"></span>
                <span>{lang === 'ar' ? 'السيولة الواردة (الدخل)' : 'Inflow Revenue'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-r from-rose-600 to-rose-400"></span>
                <span>{lang === 'ar' ? 'السيولة المصروفة (العامة)' : 'Outflow Expenses'}</span>
              </div>
            </div>
          </div>

          {/* Regional Branch yield progress metrics */}
          <div className="bg-white border border-slate-205/90 p-6 rounded-2xl xl:col-span-1 space-y-4 shadow-sm text-start">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                {lang === 'ar' ? 'المساهمات والتشغيل الإقليمي للفروع' : 'Branch Contribution Matrix'}
              </h3>
              <span className="text-xxs text-slate-400 mt-1 block">
                {lang === 'ar' ? 'ترتيب فروع المؤسسة تنازلياً مع الحصص المالية الصافية' : 'Arranged by highest net operational performance ratio'}
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {branchProfitShare.map((b, idx) => {
                const maxNet = Math.max(...branchProfitShare.map(x => x.net), 1);
                const pct = Math.max(5, Math.min(100, Math.round((b.net / maxNet) * 100)));

                return (
                  <div key={b.id} className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition duration-100">
                    <div className="flex justify-between text-xxs font-bold mb-1.5">
                      <span className="text-slate-700">
                        {lang === 'ar' ? b.nameAr : b.name}
                      </span>
                      <span className={`font-mono ${b.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(b.net)}
                      </span>
                    </div>

                    {/* Progress container */}
                    <div className="w-full bg-slate-100 h-2 rounded-full relative overflow-hidden mb-1.5">
                      <div 
                        className={`h-full rounded-full ${b.net >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-rose-500'}`}
                        style={{ width: `${b.net >= 0 ? pct : 100}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-slate-400 font-semibold leading-none">
                      <span>{lang === 'ar' ? `الصادر: ${formatCurrency(b.outflow)}` : `Outflow: ${formatCurrency(b.outflow)}`}</span>
                      <span>{lang === 'ar' ? `الوارد: ${formatCurrency(b.inflow)}` : `Inflow: ${formatCurrency(b.inflow)}`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Detailed Profit & Loss Standard Accounting Statement (P&L) */}
      {activeSubTab === 'pl' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
          
          <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase">
                {lang === 'ar' ? 'بيان الدخل وقائمة الأرباح والخسائر الموحدة' : 'Consolidated Income Statement (P&L)'}
              </h3>
              <p className="text-xxs text-slate-400 mt-1">
                {lang === 'ar' ? 'فترات الفلترة المعلمة والوارد من العمليات المصنفة والمصروفات الإقرارية' : 'Standard accounting statement computed with dynamic transaction parameters'}
              </p>
            </div>
            <div className="text-right text-[10px] font-mono text-slate-500">
              <div>{lang === 'ar' ? 'تاريخ التوليد:' : 'Accrual Basis Period:'}</div>
              <span className="font-bold underline">{selectedPeriod.toUpperCase()}</span>
            </div>
          </div>

          <table className="w-full text-xxs leading-relaxed border-collapse text-start">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-500 uppercase font-black">
                <th className="py-2.5 text-start">{lang === 'ar' ? 'بند ومصدر المعطى المالي' : 'Revenue & Expenses Classifications'}</th>
                <th className="py-2.5 text-end font-mono">{lang === 'ar' ? 'التشغيلي المباشر' : 'Operational Amount'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-705">
              
              {/* REVENUE SECTION */}
              <tr className="bg-slate-50 font-black text-slate-800">
                <td className="py-3 px-2" colSpan={2}>
                  {lang === 'ar' ? '1. الإيرادات والسيولة الواردة المتراكمة' : '1. OPERATING REVENUES'}
                </td>
              </tr>
              {filteredIncome.length === 0 ? (
                <tr>
                  <td className="py-2.5 px-4 italic text-slate-400" colSpan={2}>
                    {lang === 'ar' ? '(لا يوجد سجلات واردة مرشحة حالياً)' : '(No matching revenue entries to display)'}
                  </td>
                </tr>
              ) : (
                Object.entries(
                  filteredIncome.reduce((acc, current) => {
                    const key = lang === 'ar' ? (current.sourceAr || current.source) : current.source;
                    acc[key] = (acc[key] || 0) + current.amount;
                    return acc;
                  }, {} as { [key: string]: number })
                ).map(([src, sum]) => (
                  <tr key={src} className="hover:bg-slate-50/50">
                    <td className="py-2 px-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{src}</span>
                    </td>
                    <td className="py-2 px-2 text-end font-mono font-medium text-emerald-600">{formatCurrency(sum as number)}</td>
                  </tr>
                ))
              )}
              <tr className="bg-emerald-50 border-t border-b border-emerald-200 font-extrabold text-emerald-900">
                <td className="py-2.5 px-4">{lang === 'ar' ? 'إجمالي المقبوضات وموارد التشغيل (Gross)' : 'Total Operating Revenues (Gross)'}</td>
                <td className="py-2.5 px-2 text-end font-mono">{formatCurrency(totalInflow)}</td>
              </tr>

              {/* COGS & EXPENSES SECTION */}
              <tr className="bg-slate-50 font-black text-slate-800">
                <td className="py-3 px-2" colSpan={2}>
                  {lang === 'ar' ? '2. المصروفات التشغيلية والنفقات العامة' : '2. OPERATING CHANNELS & EXPENSES'}
                </td>
              </tr>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td className="py-2.5 px-4 italic text-slate-400" colSpan={2}>
                    {lang === 'ar' ? '(لا يوجد سجلات مصروفات مرشحة حالياً)' : '(No matching expense entries to display)'}
                  </td>
                </tr>
              ) : (
                Object.entries(
                  filteredExpenses.reduce((acc, current) => {
                    const key = current.category; // Category is En enum type
                    acc[key] = (acc[key] || 0) + current.amount;
                    return acc;
                  }, {} as { [key: string]: number })
                ).map(([cat, sum]) => (
                  <tr key={cat} className="hover:bg-slate-50/50">
                    <td className="py-2 px-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <span>{cat}</span>
                    </td>
                    <td className="py-2 px-2 text-end font-mono font-medium text-rose-500">{formatCurrency(sum as number)}</td>
                  </tr>
                ))
              )}
              <tr className="bg-rose-50 border-t border-b border-rose-200 font-extrabold text-rose-900">
                <td className="py-2.5 px-4">{lang === 'ar' ? 'إجمالي التكاليف العامة والمستهلكة' : 'Total Operating Outlays (OPEX)'}</td>
                <td className="py-2.5 px-2 text-end font-mono">{formatCurrency(totalOutflow)}</td>
              </tr>

              {/* EBITDA / Net Operating Profit */}
              <tr className="bg-slate-700 text-white font-extrabold">
                <td className="py-3 px-4 rounded-s-xl">
                  {lang === 'ar' ? 'صافي الموازنة قبل الاقتطاعات الذاتية والسماحات' : 'NET OPERATING PROFIT (EBITDA)'}
                </td>
                <td className="py-3 px-2 text-end font-mono rounded-e-xl">
                  {formatCurrency(netMargin)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Graphical percentage of expenditures limit visual gauge bar */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-700 block">
                {lang === 'ar' ? 'نسبة الهامش المقاص التشغيلي (OPEX-to-Revenue Ratio)' : 'Operating Overhead Efficiency Quotient'}
              </span>
              <p className="text-[9px] text-slate-400">
                {lang === 'ar' ? 'القيمة الصحية المعتمدة هي بقاء النفقات أقل من 65% من حاصل الودائع لتجنب المخاطر.' : 'Ideally, target staying below 65% to protect cash flows.'}
              </p>
            </div>
            
            <div className="w-full md:w-60 space-y-1 flex-shrink-0">
              <div className="flex justify-between text-[10px] font-mono font-black">
                <span>
                  {totalInflow > 0 ? ((totalOutflow / totalInflow) * 100).toFixed(1) : '0'}%
                </span>
                <span className="text-slate-400">{lang === 'ar' ? 'الحد الصحي: 65%' : 'Limit: 65%'}</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${ (totalInflow > 0 && (totalOutflow / totalInflow) > 0.65) ? 'bg-rose-500' : 'bg-emerald-500' }`}
                  style={{ width: `${Math.min(100, Math.round((totalInflow > 0 ? (totalOutflow / totalInflow) : 0) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VAT Legal Audit & Tax Compliance Report */}
      {activeSubTab === 'vat' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase">{lang === 'ar' ? 'تقرير التمويل والامتياز الضريبي وضريبة المضافة' : 'VAT Auditing & Tax Compliance Board'}</h3>
              <span className="text-xxs text-slate-400 block">{lang === 'ar' ? 'مواءمة الضريبة المضافة (VAT) المدخلة والمخرجة بناءً على لائحة الزكاة والضريبة والجمارك.' : 'Output and Input tax auditing structures compiled in sync with regulations.'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Output Tax card */}
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-start">
              <span className="text-xxs font-bold text-slate-500 uppercase block">{lang === 'ar' ? 'الضريبة المحصلة من المبيعات والوارد' : 'Output Tax Collected (On Revenues)'}</span>
              <span className="text-md sm:text-lg font-mono font-bold text-emerald-600 block mt-1.5">
                {formatCurrency(totalInflow * ((systemSettings.vatRatePct || 15) / 100))}
              </span>
              <p className="text-[9px] text-slate-400 mt-2">
                {lang === 'ar' ? `المعدل المطبق في حسابات السند: ${systemSettings.vatRatePct}%` : `Calculated standard VAT rate of ${systemSettings.vatRatePct}%`}
              </p>
            </div>

            {/* Input Tax card */}
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-start">
              <span className="text-xxs font-bold text-slate-500 uppercase block">{lang === 'ar' ? 'ضريبة المدخلات المدفوعة للموردين' : 'Input Tax Paid (On Expenditures)'}</span>
              <span className="text-md sm:text-lg font-mono font-bold text-rose-500 block mt-1.5">
                {formatCurrency(totalOutflow * ((systemSettings.vatRatePct || 15) / 100))}
              </span>
              <p className="text-[9px] text-slate-400 mt-2">
                {lang === 'ar' ? 'الضريبة المستردة من المشتريات المرخصة' : 'Claimable deductible tax paid on business goods'}
              </p>
            </div>

            {/* VAT Payable Net card */}
            <div className="bg-slate-50 border border-amber-200 p-4 rounded-xl text-start">
              <span className="text-xxs font-bold text-slate-500 uppercase block">{lang === 'ar' ? 'صافي مستحقات الضريبة الواجب دفعها' : 'Net Tax Payable (To Authority)'}</span>
              <span className="text-md sm:text-lg font-mono font-bold text-slate-800 block mt-1.5">
                {formatCurrency((totalInflow - totalOutflow) * ((systemSettings.vatRatePct || 15) / 100))}
              </span>
              <p className="text-[9px] text-slate-400 mt-2">
                {lang === 'ar' ? 'صافي مستحق الإقرار للربع المعقد' : 'Liability balance file prepared for compliance lodging'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex items-start gap-3 text-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-[10px] text-amber-900 block font-black leading-none">{lang === 'ar' ? 'التنبيه والإرشاد الضريبي القانوني:' : 'Corporate Tax Notice & Guidelines:'}</strong>
              <p className="text-[9px] text-slate-600 leading-normal">
                {lang === 'ar' 
                  ? 'هذه الأرقام هي تقديرات مالية مبسطة تعتمد على إعدادات السيستم القياسية ونسب ليدجر. يجب تدقيق جميع الفواتير والمبرزات بشكل فردي للتحقق من الأرقام النهائية قبل رفع الإقرارات لضمان الامتثال التام مع القواعد الحكومية وتجنب الغرامات المالية.'
                  : 'Calculations are intended for managerial decision support. Please ensure complete physical audits of designated sales receipt logs and expense invoices before committing VAT filings to tax compliance portals.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Accounts Receivable Aging and outstanding debts */}
      {activeSubTab === 'receivables' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-start">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                {lang === 'ar' ? 'تقرير الذمم المدينة المستحقة وأعمار الديون' : 'Accounts Receivable Debt Aging Report'}
              </h3>
              <span className="text-xxs text-slate-400 mt-1 block">
                {lang === 'ar' ? 'قائمة تفصيلية بالعملاء الذين يملكون فواتير مستحقة غير مدفوعة أو مدفوعة كلياً' : 'Complete invoice outstanding balances distributed by customer tracking accounts.'}
              </span>
            </div>
          </div>

          {customerDebts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <strong className="text-xs font-black text-slate-800 block mb-1">
                {lang === 'ar' ? 'كل المديونيات والذمم محصلة بالكامل!' : 'No Outstanding Accounts Receivable!'}
              </strong>
              <p className="text-xxs text-slate-500">
                {lang === 'ar' ? 'تظهر البيانات أن جميع فواتير العملاء ضمن الفلتر مدفوعة بشكل كامل.' : 'All clients within selected filter parameters have fully discharged balances.'}
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 text-[10px] text-slate-500 font-extrabold uppercase grid grid-cols-4 select-none">
                <div className="col-span-2">{lang === 'ar' ? 'اسم العميل الملتزم' : 'Customer Client Account'}</div>
                <div className="text-center">{lang === 'ar' ? 'عدد الفواتير المستحقة' : 'Due Invoices'}</div>
                <div className="text-end">{lang === 'ar' ? 'إجمالي الدين المستحق' : 'Outstanding Balance'}</div>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {customerDebts.map((item, idx) => (
                  <div key={idx} className="px-4 py-3.5 grid grid-cols-4 items-center text-xxs hover:bg-slate-50/40">
                    <div className="col-span-2 space-y-1">
                      <div className="font-bold text-slate-800">{lang === 'ar' ? item.nameAr : item.name}</div>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${item.risk === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600' }`}>
                        {lang === 'ar' 
                          ? (item.risk === 'High' ? 'خطورة مالية مرتفعة' : 'تصنيف اعتيادي')
                          : `${item.risk} Risk Category`}
                      </span>
                    </div>

                    <div className="text-center font-mono font-semibold text-slate-600">
                      {item.count} {lang === 'ar' ? 'فاتورة' : 'invoice(s)'}
                    </div>

                    <div className="text-end font-mono font-bold text-rose-600">
                      {formatCurrency(item.outstanding)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-xxs text-slate-500">
                <span>{lang === 'ar' ? `المجموع الإجمالي للذمم التشغيلية المعلقة: ` : `Total outstanding trade receivables under scope: `}</span>
                <strong className="text-rose-600 font-mono font-bold">
                  {formatCurrency(customerDebts.reduce((sum, item) => sum + item.outstanding, 0))}
                </strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4.5: Inventory & Warehouse Reports Module */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in text-start">
          
          {/* Bento Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Unique SKUs */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-normal">
                    {lang === 'ar' ? 'إجمالي الأصناف المسجلة' : 'Cataloged SKUs & Items'}
                  </span>
                  <span className="text-xl font-bold text-slate-800 block mt-1.5 font-mono">
                    {inventoryStats.totalItemsCount} 
                    <span className="text-xs text-slate-400 font-sans font-normal ltr:ml-1.5 rtl:mr-1.5">
                      {lang === 'ar' ? `(${inventoryStats.totalServicesCount} خدمة)` : `(${inventoryStats.totalServicesCount} services)`}
                    </span>
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-3 block">
                {lang === 'ar' ? 'المنتجات الملموسة والخدمات المسجلة بالنظام' : 'Physical retail items and cataloged services'}
              </span>
            </div>

            {/* Card 2: Total Units In Warehouse */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-normal">
                    {lang === 'ar' ? 'إجمالي القطع المتوفرة' : 'Total Units Stocked'}
                  </span>
                  <span className="text-xl font-bold text-slate-800 block mt-1.5 font-mono">
                    {new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US').format(inventoryStats.totalQty)}
                    <span className="text-xs text-slate-400 font-sans font-normal ltr:ml-1.5 rtl:mr-1.5">
                      {lang === 'ar' ? 'وحدة' : 'units'}
                    </span>
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-3 block">
                {lang === 'ar' ? 'حساب الحجم التراكمي لقطع المستودعات' : 'Cumulative unit count currently on hand'}
              </span>
            </div>

            {/* Card 3: Capital Balance Valuation (Cost Basis) */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-normal text-amber-700">
                    {lang === 'ar' ? 'تقييم رأس المال (التكلفة)' : 'Cost Capital Valuation'}
                  </span>
                  <span className="text-xl font-bold text-amber-700 block mt-1.5 font-mono">
                    {formatCurrency(inventoryStats.totalCostValuation)}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-3 block">
                {lang === 'ar' ? 'قيمة الأصول المخزنة على أساس سعر تكلفة الشراء' : 'Total physical asset value based on supplier cost'}
              </span>
            </div>

            {/* Card 4: Potential Sales Valuation & Margin */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-normal text-emerald-600">
                    {lang === 'ar' ? 'القيمة السوقية وهامش الربح' : 'Retail selling & margin'}
                  </span>
                  <span className="text-xl font-bold text-emerald-600 block mt-1.5 font-mono">
                    {formatCurrency(inventoryStats.totalPriceValuation)}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-3 block font-medium">
                {lang === 'ar' 
                  ? `الأرباح الكامنة: ${formatCurrency(inventoryStats.potentialProfit)}` 
                  : `Expected gross profit: ${formatCurrency(inventoryStats.potentialProfit)}`}
              </span>
            </div>

          </div>

          {/* Quick Warning Bar for low or out-of-stock items */}
          {(inventoryStats.lowStockCount > 0 || inventoryStats.outOfStockCount > 0) && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 no-print">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {lang === 'ar' ? 'تنبيه مستويات المخزون والصيانة الإمدادية' : 'Inventory Safety Restock Warning Indicator'}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {lang === 'ar'
                      ? `تم رصد عدد ${inventoryStats.outOfStockCount} صنف نافذ بالكامل، وصنف عدد ${inventoryStats.lowStockCount} يقترب من الحد الأدنى الحرج.`
                      : `Identified ${inventoryStats.outOfStockCount} items dry out-of-stock, and ${inventoryStats.lowStockCount} items critically close to minimum safety thresholds.`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {inventoryStats.outOfStockCount > 0 && (
                  <span className="px-2 py-1 bg-rose-100 text-rose-800 text-[10px] font-black rounded-lg">
                    {lang === 'ar' ? `${inventoryStats.outOfStockCount} نافذ` : `${inventoryStats.outOfStockCount} Dry`}
                  </span>
                )}
                {inventoryStats.lowStockCount > 0 && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg">
                    {lang === 'ar' ? `${inventoryStats.lowStockCount} منخفض` : `${inventoryStats.lowStockCount} Warning`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Low Stock Watchlist & Category Breakdown in columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Column 1: Low / On Threshold Items Watchlist */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                {lang === 'ar' ? 'قائمة المتابعة وصيانة النقص (عاجل)' : 'Low & Empty Stock Maintenance List'}
              </h3>
              
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 space-y-0 text-xs">
                {products.filter(p => p.type === 'Product' && p.stock <= (p.minStockAlert || 5)).length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    {lang === 'ar' ? 'جميع مستويات المواد خضراء وآمنة!' : 'All stock levels are perfectly healthy and green!'}
                  </div>
                ) : (
                  products.filter(p => p.type === 'Product' && p.stock <= (p.minStockAlert || 5))
                    .sort((a, b) => a.stock - b.stock)
                    .map((prod) => {
                      const percentage = prod.minStockAlert > 0 ? (prod.stock / prod.minStockAlert) * 100 : 0;
                      return (
                        <div key={prod.id} className="py-3 flex justify-between items-center gap-4">
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 block truncate">{lang === 'ar' ? prod.nameAr : prod.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-end shrink-0">
                              <span className={`font-mono font-bold block ${prod.stock === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                                {prod.stock} / {prod.minStockAlert}
                              </span>
                              <span className="text-[9px] text-slate-400 uppercase block">{lang === 'ar' ? 'الكمية الحالية' : 'Stock level'}</span>
                            </div>
                            
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${
                              prod.stock === 0 
                                ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {prod.stock === 0 
                                ? (lang === 'ar' ? 'نافذ' : 'CRITICAL') 
                                : (lang === 'ar' ? 'منخفض' : 'LOW')}
                            </span>
                          </div>
                        </div>
                      )
                    })
                )}
              </div>
            </div>

            {/* Column 2: Category distribution and capital tied up */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <PieChart className="w-4 h-4 text-blue-600" />
                {lang === 'ar' ? 'توزيع الأصول الرأسمالية والقطع بالجمهرة' : 'Category Distribution & Tied-Up Capital'}
              </h3>
              
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 space-y-0 text-xs">
                {inventoryCategoryStats.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    {lang === 'ar' ? 'لا يوجد تصنيفات مسجلة' : 'No categorized inventory values registered'}
                  </div>
                ) : (
                  inventoryCategoryStats.map((cat, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center gap-4">
                      <div>
                        <span className="font-bold text-slate-800 block">{lang === 'ar' ? cat.nameAr : cat.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {lang === 'ar' 
                            ? `${cat.count} أصناف مادية - ${cat.totalStock} قطعة` 
                            : `${cat.count} unique physical items - ${cat.totalStock} units on shelf`}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="font-mono font-bold text-slate-800 block">{formatCurrency(cat.totalCost)}</span>
                        <span className="text-[9px] text-slate-400 block uppercase">{lang === 'ar' ? 'قيمة المخزون الكلي' : 'Capital share'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Stock Movements Timeline of selected Period and Branch */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-emerald-600" />
              {lang === 'ar' 
                ? 'سجل حركة ونقل المخازن (المناقلات والوارد)' 
                : 'Stock Movements Timeline & Action Ledger'
              }
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 pb-2">
                    <th className="py-2 text-start font-bold uppercase">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="py-2 text-start font-bold uppercase">{lang === 'ar' ? 'المنتج المعني' : 'Target Product'}</th>
                    <th className="py-2 text-start font-bold uppercase">{lang === 'ar' ? 'نوع الحركة' : 'Action'}</th>
                    <th className="py-2 text-end font-bold uppercase">{lang === 'ar' ? 'الكمية' : 'Quantity'}</th>
                    <th className="py-2 text-start font-bold uppercase ltr:pl-4 rtl:pr-4">{lang === 'ar' ? 'المرجع والمستند' : 'Reference Doc'}</th>
                    <th className="py-2 text-start font-bold uppercase">{lang === 'ar' ? 'ملاحظات الحركة' : 'Notes / Explanations'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        {lang === 'ar' ? 'لا توجد حركات مخزنية مسجلة خلال النطاق' : 'No warehouse stock updates registered during specified periods'}
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.slice(0, 15).map((mov) => {
                      const relPrd = products.find(p => p.id === mov.productId);
                      return (
                        <tr key={mov.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-2.5 font-mono text-slate-500 whitespace-nowrap">{mov.date}</td>
                          <td className="py-2.5">
                            <span className="font-bold text-slate-800 block">
                              {relPrd ? (lang === 'ar' ? relPrd.nameAr : relPrd.name) : `ID: #${mov.productId.slice(0, 4)}`}
                            </span>
                            {relPrd && <span className="text-[10px] text-slate-400 font-mono">SKU: {relPrd.sku}</span>}
                          </td>
                          <td className="py-2.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                              mov.type === 'In'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {mov.type === 'In' ? (lang === 'ar' ? 'إدخال (وارد)' : 'Stock Inflow (IN)') : (lang === 'ar' ? 'صرف (مبيعات)' : 'Stock Outflow (OUT)')}
                            </span>
                          </td>
                          <td className={`py-2.5 text-end font-mono font-bold ${mov.type === 'In' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {mov.type === 'In' ? '+' : '-'}{mov.quantity}
                          </td>
                          <td className="py-2.5 ltr:pl-4 rtl:pr-4 font-mono text-[10px] text-slate-500">{mov.reference}</td>
                          <td className="py-2.5 text-slate-500 max-w-xs truncate">{lang === 'ar' ? mov.notesAr || mov.notes : mov.notes}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Master Inventory Detailed Catalog list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {lang === 'ar' ? 'كشف الجرد العام والضبط المالي للمخازن' : 'Consolidated Physical Stock Ledger Catalog'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {lang === 'ar' ? 'تصفية وبحث في جميع السلع والمواد تشمل التكلفة والأرباح الكامنة.' : 'Live warehouse sheet of item costs, assets, and warning thresholds.'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 pb-2">
                    <th className="py-2 text-start font-bold uppercase">SKU / Code</th>
                    <th className="py-2 text-start font-bold uppercase">{lang === 'ar' ? 'اسم المادة' : 'Product Detail'}</th>
                    <th className="py-2 text-start font-bold uppercase">{lang === 'ar' ? 'التصنيف' : 'Category'}</th>
                    <th className="py-2 text-end font-bold uppercase">{lang === 'ar' ? 'سعر التكلفة' : 'Unit Cost'}</th>
                    <th className="py-2 text-end font-bold uppercase">{lang === 'ar' ? 'سعر البيع' : 'Retail Price'}</th>
                    <th className="py-2 text-center font-bold uppercase">{lang === 'ar' ? 'الرصيد المتاح' : 'Available Stock'}</th>
                    <th className="py-2 text-end font-bold uppercase">{lang === 'ar' ? 'رأس مال المادة' : 'Tied Capital (Cost)'}</th>
                    <th className="py-2 text-start font-bold uppercase ltr:pl-4 rtl:pr-4">{lang === 'ar' ? 'حالة التوازن' : 'Health'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        {lang === 'ar' ? 'لا يوجد مواد مطابقة للبحث الحالي' : 'No items matched your ledger search query.'}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const tiedAmt = (prod.cost || 0) * prod.stock;
                      const isService = prod.type === 'Service';
                      const isOos = prod.stock === 0;
                      const isLow = !isService && prod.stock <= (prod.minStockAlert || 5);

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 font-mono font-medium text-slate-500 whitespace-nowrap">{prod.sku}</td>
                          <td className="py-3">
                            <span className="font-bold text-slate-800 block">{lang === 'ar' ? prod.nameAr : prod.name}</span>
                            <span className="text-[10px] text-slate-400 block max-w-xs truncate">{lang === 'ar' ? prod.descriptionAr : prod.description}</span>
                          </td>
                          <td className="py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px]">
                              {lang === 'ar' ? prod.categoryAr || prod.category : prod.category}
                            </span>
                          </td>
                          <td className="py-3 text-end font-mono text-slate-600">{formatCurrency(prod.cost || 0)}</td>
                          <td className="py-3 text-end font-mono text-slate-800">{formatCurrency(prod.price || 0)}</td>
                          <td className="py-3 text-center">
                            {isService ? (
                              <span className="text-slate-400 italic text-[11px]">{lang === 'ar' ? 'لا محدود (خدمة)' : 'N/A (Service)'}</span>
                            ) : (
                              <span className={`font-mono font-bold text-md ${isOos ? 'text-rose-600' : isLow ? 'text-amber-500' : 'text-slate-800'}`}>
                                {prod.stock}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-end font-mono font-bold text-slate-800">
                            {isService ? '-' : formatCurrency(tiedAmt)}
                          </td>
                          <td className="py-3 ltr:pl-4 rtl:pr-4 whitespace-nowrap">
                            {isService ? (
                              <span className="w-2 h-2 rounded-full bg-slate-200 inline-block align-middle ltr:mr-1.5 rtl:ml-1.5"></span>
                            ) : isOos ? (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[9px] font-black">
                                {lang === 'ar' ? 'غير متوفر' : 'OUT-OF-STOCK'}
                              </span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-black">
                                {lang === 'ar' ? 'منخفض' : 'LOW LIMIT'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-black">
                                {lang === 'ar' ? 'ممتلئ' : 'SAFE'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: AI Operational Advisory Copilot */}
      {activeSubTab === 'copilot' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-start">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Brain className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase">{lang === 'ar' ? 'مرشد القرارات والمجلس الإداري المالي التشغيلي' : 'Corporate Strategy Advisor & Board Room Audit'}</h3>
              <span className="text-xxs text-slate-400 block">{lang === 'ar' ? 'مؤشرات فورية لمتخذي القرار تترجم البيانات المالية إلى حلول تشغيلية قابلة للتطبيق.' : 'Data-driven consultative reports highlighting cash runway, cost leaks, and credit risks.'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Health Score Column */}
            <div className="bg-slate-50/80 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between align-stretch text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">{lang === 'ar' ? 'مؤشر كفاءة التشغيل الموحد' : 'Unified Business Score'}</span>
                <div className="my-4 inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-emerald-500 bg-white font-mono text-3xl font-bold text-slate-800 shadow-xs">
                  {netMargin > 0 && operationalRatio > 35 ? 'A' : netMargin > 0 ? 'B' : 'D'}
                </div>
                <div className="text-slate-700 font-bold text-xxs leading-normal mt-2">
                  {netMargin > 0 && operationalRatio > 35 
                    ? (lang === 'ar' ? 'أداء مالي مميز - هوامش سليمة للغاية' : 'High Performance Margin - Growth Accruals')
                    : netMargin > 0 
                      ? (lang === 'ar' ? 'حالة مستقرة - يرجى مراجعة Overhead' : 'Stable Overhead - Action Recommended')
                      : (lang === 'ar' ? 'تنبيه التدفق النقدي منقاد للسالب' : 'Negative cash velocity trend alert')}
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-3 mt-4 text-[9px] text-slate-400 font-medium">
                {lang === 'ar' ? 'تقييم يعتمد على توازنات ليدجر والسيولة المتولدة' : 'Algorithmic letter grading evaluated continuously'}
              </div>
            </div>

            {/* Strategy Consultative Bullet Points (Dynamic evaluation based on actual values) */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xxs font-black text-slate-450 uppercase tracking-wider">{lang === 'ar' ? 'التوجيهات والتوصيات التشغيلية المطلوبة عاجلاً' : 'Operational Advisory & Board Recommendations'}</h4>
              
              <div className="space-y-3 font-sans">
                
                {/* 1. Inflow-to-Outflow Burn rate guidance */}
                <div className="flex gap-2.5 items-start text-xxs leading-normal">
                  <div className="p-1 rounded bg-blue-50 text-blue-600 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-slate-800 text-[10px] block font-bold">
                      {lang === 'ar' ? '1. تقييم استدامة الموارد المالية العاجلة' : '1. Financial Liquidity Sustainment'}
                    </strong>
                    <span className="text-slate-500 text-[9px] block mt-0.5">
                      {netMargin >= 0 
                        ? (lang === 'ar' 
                          ? `هوامش الأرباح الحالية هي ${formatCurrency(netMargin)} بمعدل استرداد ${operationalRatio.toFixed(1)}%. كفاءة تشغيل الفروع ملائمة، وننصح بخصخصة ربع الاحتياطيات النقدية لمقابلة التحديثات.`
                          : `The current operating profits are ${formatCurrency(netMargin)} with an operational profit margin of ${operationalRatio.toFixed(1)}%. Dynamic ratios look excellent under scope.`)
                        : (lang === 'ar'
                          ? `تنبيه: تسجل الموازنة انخفاضاً سالباً بقيمة ${formatCurrency(netMargin)}. يوصى على الفور بتخفيض ميزانيات الفئات الإدارية والخدمية لمدة 45 يوماً ريثما يتم تفعيل تحصيل الذمم.`
                          : `Attention required: Outlays exceed incoming payments by ${formatCurrency(Math.abs(netMargin))}. Urget overhead reduction protocol is advised.`)}
                    </span>
                  </div>
                </div>

                {/* 2. Outstanding Balance Debt Warnings */}
                <div className="flex gap-2.5 items-start text-xxs leading-normal">
                  <div className="p-1 rounded bg-yellow-50 text-yellow-600 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-slate-800 text-[10px] block font-bold">
                      {lang === 'ar' ? '2. استرداد الديون المستحقة وتقليل Credit risk' : '2. Trade Receivables Acceleration'}
                    </strong>
                    <span className="text-slate-500 text-[9px] block mt-0.5">
                      {customerDebts.length > 0 
                        ? (lang === 'ar' 
                          ? `إجمالي الذمم المعلقة المطالب بها تحت التحصيل هو ${formatCurrency(customerDebts.reduce((s, x) => s + x.outstanding, 0))}. نوصي بفصل الفواتير التي تجاوزت 30 يوماً واستحقاق سندات الدفع آلياً.`
                          : `There are trade accounts receivables totaling ${formatCurrency(customerDebts.reduce((s, x) => s + x.outstanding, 0))}. Accelerated collection rules should be enforced.`)
                        : (lang === 'ar'
                          ? 'حسابات الديون مميزة وسليمة، لم يسجل السيستم أي تأخيرات في سداد فواتير عملائك. استمر بالسماحات الائتمانية الحالية.'
                          : 'No outstanding debt recorded. Current customer payment term structures are optimal.')}
                    </span>
                  </div>
                </div>

                {/* 3. Branch leakage check */}
                {branchProfitShare.some(b => b.net < 0) && (
                  <div className="flex gap-2.5 items-start text-xxs leading-normal">
                    <div className="p-1 rounded bg-rose-50 text-rose-600 mt-0.5 animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-slate-850 text-[10px] block font-bold">
                        {lang === 'ar' ? '3. معالجة تسرب السيول في الفروع تحت المراجعة' : '3. Targeted Branch Core Audit Required'}
                      </strong>
                      <span className="text-rose-650 text-[9px] block mt-0.5">
                        {lang === 'ar' 
                          ? `يسجل الفرع (${branchProfitShare.find(b => b.net < 0)?.nameAr || 'المبين'}) موازنة تشغيلية خاسرة. نوصي بتجميد المصاريف الإدارية والتحقق من مصادفة تكاليف البوابة.`
                          : `The branch (${branchProfitShare.find(b => b.net < 0)?.name || 'indicated'}) has negative net margins. Targeted operational evaluation recommended.`}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 4. Tax/VAT preparation */}
                {systemSettings.vatCompliance && (
                  <div className="flex gap-2.5 items-start text-xxs leading-normal">
                    <div className="p-1 rounded bg-slate-100 text-slate-700 mt-0.5">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-slate-800 text-[10px] block font-bold">
                        {lang === 'ar' ? '4. تحزيم مخصص الاستحقاق الضريبي لربط الإقرارات' : '4. Strategic Quarterly VAT Allocation'}
                      </strong>
                      <span className="text-slate-500 text-[9px] block mt-0.5">
                        {lang === 'ar' 
                          ? `حجم تداول التدفق الضريبي يتطلب مخصص نقدي مستمر بقيمة ${formatCurrency((totalInflow - totalOutflow) * ((systemSettings.vatRatePct || 15) / 100))}. ننصحك بفصل هذه القيمة في حساب ضامن آمن.`
                          : `Based on a standard rate of ${systemSettings.vatRatePct || 15}%, we recommend mapping a cash liquidity reserve of ${formatCurrency((totalInflow - totalOutflow) * ((systemSettings.vatRatePct || 15) / 100))} for local VAT compliance.`}
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. Deep Technical Ledger Audit Statement List (Footer on print & screen) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-start">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              {lang === 'ar' ? 'سجلات المراجعة المدققة المرشحة حالياً وبنود ليدجر' : 'Audited Ledger Transaction Streams'}
            </h3>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {lang === 'ar' 
                ? `الحاصل الإجمالي المدمج: ${filteredIncome.length} دخل، و ${filteredExpenses.length} مصروفات بناء على الفلاتر المدققة` 
                : `${filteredIncome.length} revenue and ${filteredExpenses.length} expense rows matched.`}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xxs text-start leading-relaxed min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold select-none uppercase">
                <th className="py-2 px-3 text-start">{lang === 'ar' ? 'التصنيف والمصدر' : 'Stream / Source'}</th>
                <th className="py-2 px-3 text-center">{lang === 'ar' ? 'الفرع المعين' : 'Branch'}</th>
                <th className="py-2 px-3 text-center">{lang === 'ar' ? 'طريقة الدفع/البند' : 'Payment Type/Class'}</th>
                <th className="py-2 px-3 text-center">{lang === 'ar' ? 'التاريخ' : 'Occurrence Date'}</th>
                <th className="py-2 px-3 text-end">{lang === 'ar' ? 'القيمة' : 'Amount'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredIncome.map(inc => {
                const b = branches.find(br => br.id === inc.branchId);
                return (
                  <tr key={inc.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800">{lang === 'ar' ? inc.sourceAr || inc.source : inc.source}</div>
                      <span className="text-[9px] text-slate-400 block">{lang === 'ar' ? inc.descriptionAr || inc.description : inc.description}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-600">
                      {lang === 'ar' ? b?.nameAr || b?.name : b?.name || 'Consolidated'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                        {lang === 'ar' ? 'وارد (دخل)' : 'Inflow Revenue'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {inc.date}
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-emerald-600">
                      {formatCurrency(inc.amount)}
                    </td>
                  </tr>
                );
              })}

              {filteredExpenses.map(exp => {
                const b = branches.find(br => br.id === exp.branchId);
                return (
                  <tr key={exp.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800">{lang === 'ar' ? exp.entityAr || exp.entity : exp.entity}</div>
                      <span className="text-[9px] text-slate-400 block">{lang === 'ar' ? exp.category + ' - ' + (exp.descriptionAr || exp.description || '') : exp.category + ' - ' + (exp.description || '')}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-600">
                      {lang === 'ar' ? b?.nameAr || b?.name : b?.name || 'Consolidated'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[9px]">
                        {lang === 'ar' ? 'صادر (مصروف)' : 'Outflow Expense'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {exp.date}
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-rose-600">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                );
              })}

              {filteredIncome.length === 0 && filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium italic">
                    {lang === 'ar' ? 'لا توجد فواتير أو نفقات مطابقة لإعدادات التصفية والبحث حالياً.' : 'No income or expense records matched the criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};
