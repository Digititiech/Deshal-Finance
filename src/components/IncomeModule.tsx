import React, { useState, useEffect } from 'react';
import { Income, PaymentMethod, Branch, UserRole, Customer, SystemSettings, Invoice } from '../types';
import { 
  Download, 
  PlusCircle, 
  Search, 
  ArrowDown, 
  ArrowUp, 
  Trash2, 
  X, 
  CreditCard,
  Printer
} from 'lucide-react';

interface IncomeModuleProps {
  income: Income[];
  filteredIncome: Income[];
  invoices: Invoice[];
  filteredInvoices: Invoice[];
  branches: Branch[];
  customers: Customer[];
  addIncome: (item: Omit<Income, 'id'>) => Income;
  addCustomer: (item: Omit<Customer, 'id'>) => Customer;
  deleteIncome: (id: string) => void;
  lang: 'en' | 'ar';
  userRole?: UserRole;
  systemSettings: SystemSettings;
  quickActionTrigger?: string | null;
  clearQuickAction?: () => void;
}

export const IncomeModule: React.FC<IncomeModuleProps> = ({
  income,
  filteredIncome,
  invoices,
  filteredInvoices,
  branches,
  customers,
  addIncome,
  addCustomer,
  deleteIncome,
  lang,
  userRole,
  systemSettings,
  quickActionTrigger,
  clearQuickAction
}) => {
  const [viewingVoucher, setViewingVoucher] = useState<Income | null>(null);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'amount' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('custom');
  const [saveNewCustomer, setSaveNewCustomer] = useState(true);
  const [newSource, setNewSource] = useState('');
  const [newSourceAr, setNewSourceAr] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBranch, setNewBranch] = useState(branches[0]?.id || '');
  const [newMethod, setNewMethod] = useState<PaymentMethod>('Bank Transfer');
  const [newDesc, setNewDesc] = useState('');
  const [newDescAr, setNewDescAr] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    if (invId) {
      const inv = invoices.find(i => i.id === invId);
      if (inv) {
        const outstanding = inv.totalAmount - inv.paidAmount;
        setNewAmount(outstanding.toString());
        
        // Find matching customer
        const cust = customers.find(c => c.id === inv.customerId);
        if (cust) {
          setNewSource(cust.name);
          setNewSourceAr(cust.nameAr);
          setSelectedCustomerId(cust.id);
          setSaveNewCustomer(false); // Customer exists
        }
        if (inv.branchId) {
          setNewBranch(inv.branchId);
        }
      }
    } else {
      setNewAmount('');
      setNewSource('');
      setNewSourceAr('');
      setSelectedCustomerId('custom');
      setSaveNewCustomer(true);
    }
  };

  useEffect(() => {
    if (quickActionTrigger === 'RECORD_INCOME') {
      setShowAddModal(true);
      if (clearQuickAction) clearQuickAction();
    }
  }, [quickActionTrigger, clearQuickAction]);

  // Handle adding new income record
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource || !newAmount) return;

    if (selectedCustomerId === 'custom' && saveNewCustomer) {
      addCustomer({
        name: newSource,
        nameAr: newSourceAr || newSource,
        code: `CUS-${Date.now().toString().slice(-4)}`,
        contactEmail: `${newSource.toLowerCase().replace(/\s+/g, '') || `cus_${Date.now()}`}@example.com`,
        phone: '+968 9000 0000',
        address: 'Oman',
        addressAr: 'عمان'
      });
    }

    addIncome({
      source: newSource,
      sourceAr: newSourceAr || newSource,
      amount: parseFloat(newAmount),
      date: newDate,
      branchId: newBranch,
      paymentMethod: newMethod,
      description: newDesc,
      descriptionAr: newDescAr || newDesc,
      invoiceId: selectedInvoiceId || undefined
    });

    // Reset fields
    setNewSource('');
    setNewSourceAr('');
    setSelectedCustomerId('custom');
    setSaveNewCustomer(true);
    setNewAmount('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewDesc('');
    setNewDescAr('');
    setSelectedInvoiceId('');
    setShowAddModal(false);
  };

  const getBranchName = (brId: string) => {
    const b = branches.find(item => item.id === brId);
    if (!b) return '-';
    return lang === 'ar' ? b.nameAr : b.name;
  };

  // Processing & filtering data
  const processedData = filteredIncome
    .filter(item => {
      const matchSearch = (lang === 'ar' ? item.sourceAr : item.source)
        .toLowerCase()
        .includes(search.toLowerCase()) || 
        (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.descriptionAr || '').toLowerCase().includes(search.toLowerCase());
        
      const matchMethod = methodFilter === 'all' || item.paymentMethod === methodFilter;
      const matchBranch = branchFilter === 'all' || item.branchId === branchFilter;

      return matchSearch && matchMethod && matchBranch;
    })
    .sort((a, b) => {
      let multiplier = sortOrder === 'desc' ? -1 : 1;
      if (sortBy === 'amount') {
        return (a.amount - b.amount) * multiplier;
      } else {
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier;
      }
    });

  // Calculate pages
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData.slice(startIdx, startIdx + itemsPerPage);

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = lang === 'ar' 
      ? 'رقم التعريف,المصدر,القيمة,التاريخ,الفرع,طريقة الدفع,الوصف\n'
      : 'ID,Source,Amount,Date,Branch,Payment Method,Description\n';
      
    const rows = processedData.map(item => {
      const sourceTxt = lang === 'ar' ? item.sourceAr : item.source;
      const descTxt = lang === 'ar' ? (item.descriptionAr || '') : (item.description || '');
      const branchName = getBranchName(item.branchId);
      return `${item.id},"${sourceTxt}",${item.amount},${item.date},"${branchName}","${item.paymentMethod}","${descTxt}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger_inflow_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Title area with Export & Create actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-start">
          <h1 className="text-xl font-bold tracking-tight text-slate-805 text-slate-800 mb-1">
            {lang === 'ar' ? 'سجل المقبوضات والإيرادات' : 'Consolidated Income Ledger'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' ? 'توثيق الحسابات الواردة وضبط طرق الدفع والودائع المصرفية' : 'Comprehensive directory tracking cash bank transfers, retainers, and incoming accounts billing.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse shrink-0 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 space-x-reverse px-4 py-2 bg-white hover:bg-slate-50 font-bold border border-slate-200 text-slate-700 text-xs rounded-xl transition duration-150 active:scale-95 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>
          
          {(userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Accountant') && (
            <button
              onClick={() => {
                if (branches.length > 0) setNewBranch(branches[0].id);
                setShowAddModal(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 space-x-reverse px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl shadow-sm transition duration-150 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>{lang === 'ar' ? 'تسجيل إيداع وارد' : 'Record Deposit'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={lang === 'ar' ? 'البحث في المعاملات...' : 'Search ledger sources...'}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className={`w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-805 text-slate-800 text-xs rounded-xl ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 outline-none font-sans`}
          />
          <Search className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
        </div>

        {/* Method Filter */}
        <div>
          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-750 text-slate-700 text-xs rounded-xl p-2.5 outline-none"
          >
            <option value="all">{lang === 'ar' ? 'كل طرق الدفع' : 'All Methods'}</option>
            <option value="Bank Transfer">{lang === 'ar' ? 'حوالة بنكية' : 'Bank Transfer'}</option>
            <option value="Cash">{lang === 'ar' ? 'نقدي' : 'Cash'}</option>
            <option value="Corporate Credit">{lang === 'ar' ? 'بطاقة الائتمان' : 'Corporate Credit'}</option>
          </select>
        </div>

        {/* Branch filter */}
        <div>
          <select
            value={branchFilter}
            onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
            disabled={userRole === 'Employee' || userRole === 'Manager'}
            className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-750 text-slate-700 text-xs rounded-xl p-2.5 outline-none"
          >
            <option value="all">{lang === 'ar' ? 'جميع الفروع الإقليمية' : 'All Regional Hubs'}</option>
            {branches.map(br => (
              <option key={br.id} value={br.id}>
                {lang === 'ar' ? br.nameAr : br.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort triggers */}
        <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1 h-full items-center">
          <button
            onClick={() => setSortBy(sortBy === 'amount' ? 'date' : 'amount')}
            className="flex-1 py-1.5 rounded-lg text-xxs font-bold text-slate-500 hover:text-slate-800 cursor-pointer text-center duration-150"
          >
            {sortBy === 'amount' ? (lang === 'ar' ? 'حسب: القيمة' : 'By: Amount') : (lang === 'ar' ? 'حسب: التاريخ' : 'By: Date')}
          </button>
          <div className="h-4 w-px bg-slate-200"></div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 duration-150 cursor-pointer"
          >
            {sortOrder === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Primary Table Ledger Grid */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden text-start">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left font-sans border-collapse" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-xxs font-bold uppercase tracking-wider text-slate-500 text-start">
                <th className="py-4 px-5">{lang === 'ar' ? 'جهة الإيداع ومصدر الدخل' : 'Inflow Source'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'القيمة المالية' : 'Fiscal Amount'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'التاريخ الفعلي' : 'Effective Date'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'الموقع أو الفرع' : 'Local Branch'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'طريقة الاستلام' : 'Method'}</th>
                <th className="py-4 px-5 text-center">{lang === 'ar' ? 'سند المقبوضات' : 'Voucher Receipt'}</th>
                {userRole === 'Super Admin' && <th className="py-4 px-5 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 duration-100 text-xs">
                  <td className="py-4 px-5">
                    <div>
                      <span className="font-bold text-slate-800 leading-tight block">
                        {lang === 'ar' ? item.sourceAr : item.source}
                      </span>
                      {item.description && (
                        <p className="text-xxs text-slate-400 mt-1 max-w-sm truncate leading-none">
                          {lang === 'ar' ? item.descriptionAr : item.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono font-bold text-emerald-600">
                    +${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-500">
                    {item.date}
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex bg-slate-50 border border-slate-100 font-semibold px-2.5 py-1 rounded-lg text-xxs text-slate-600">
                      {getBranchName(item.branchId)}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-xxs font-semibold text-slate-500">
                      {item.paymentMethod}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <button
                      onClick={() => setViewingVoucher(item)}
                      className="text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg duration-150 cursor-pointer inline-flex items-center justify-center gap-1 text-xxs font-bold border border-slate-200 hover:border-emerald-200 bg-white shadow-sm"
                      title={lang === 'ar' ? 'عرض سند القبض الرسمي' : 'View official Cash Receipt Voucher'}
                    >
                      <Printer className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'سند القبض' : 'Voucher'}</span>
                    </button>
                  </td>
                  {userRole === 'Super Admin' && (
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => deleteIncome(item.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg duration-150 cursor-pointer inline-flex items-center justify-center"
                        title={lang === 'ar' ? 'حذف المعاملة' : 'Revert Transaction'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={userRole === 'Super Admin' ? 6 : 5} className="py-12 text-center text-xs text-slate-500 font-sans">
                    {lang === 'ar' ? 'لا توجد قيود إيرادات مطابقة للفلاتر النشطة.' : 'No continuous inflow matches your designated filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Unified Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-4 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between text-xxs font-mono text-slate-500" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <span>
              {lang === 'ar' ? `صفحة ${currentPage} من أصل ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-2.5 py-1.5 bg-white border border-slate-205 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 duration-100 cursor-pointer"
              >
                {lang === 'ar' ? 'السابق' : 'Prev'}
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-2.5 py-1.5 bg-white border border-slate-205 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 duration-100 cursor-pointer"
              >
                {lang === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Popups (Add Income Modal) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-slide-in text-slate-800" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Close button */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 flex items-center justify-center duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 text-start">
              <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{lang === 'ar' ? 'تسجيل معاملة دخل جديدة' : 'Record External Inflow'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-start">
              {/* Optional: Associate with Sales Invoice */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">
                  {lang === 'ar' ? 'ربط بفاتورة مبيعات (اختياري)' : 'Link to Sales Invoice (Optional)'}
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm font-bold"
                >
                  <option value="">{lang === 'ar' ? '--- اختر فاتورة لربط الدفعة بها ---' : '--- Select Invoice to Link Inflow ---'}</option>
                  {invoices
                    .filter(i => i.status !== 'Paid')
                    .map(inv => {
                      const cust = customers.find(c => c.id === inv.customerId);
                      const custName = cust ? (lang === 'ar' ? cust.nameAr : cust.name) : '-';
                      const outstanding = inv.totalAmount - inv.paidAmount;
                      const formattedOut = (systemSettings.primaryCurrency === 'SAR' || systemSettings.primaryCurrency === 'OMR') && lang === 'ar'
                        ? `${outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${systemSettings.primaryCurrency || 'OMR'}`
                        : `${systemSettings.primaryCurrency || 'OMR'} ${outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                      return (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} - {custName} ({lang === 'ar' ? `المتبقي: ${formattedOut}` : `Bal: ${formattedOut}`})
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Customer / Source Dropdown Selection */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">
                  {lang === 'ar' ? 'العميل أو جهة مصدر الإيراد' : 'Client / Inflow Source'}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCustomerId(val);
                    if (val !== 'custom') {
                      const found = customers.find(c => c.id === val);
                      if (found) {
                        setNewSource(found.name);
                        setNewSourceAr(found.nameAr);
                      }
                    } else {
                      setNewSource('');
                      setNewSourceAr('');
                    }
                  }}
                  className="w-full bg-white border border-slate-205 border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm font-bold"
                >
                  <option value="custom">{lang === 'ar' ? '➕ مصدر مخصص / إضافة عميل جديد' : '➕ Custom Source / Add New Customer'}</option>
                  {customers.map(cus => (
                    <option key={cus.id} value={cus.id}>
                      {lang === 'ar' ? cus.nameAr : cus.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional custom customer inputs if "custom" is selected */}
              {selectedCustomerId === 'custom' && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 animate-fade-in">
                  {/* English Source name */}
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-bold text-[10px]">{lang === 'ar' ? 'اسم المصدر الجديد (بالإنجليزي)' : 'New Source Name (English)'}</label>
                    <input
                      type="text"
                      required={selectedCustomerId === 'custom'}
                      placeholder="e.g. Acme Billing Ltd"
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2 outline-none font-sans shadow-sm"
                    />
                  </div>

                  {/* Arabic Source name */}
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-bold text-[10px]">{lang === 'ar' ? 'اسم المصدر الجديد (بالعربي)' : 'New Source Name (Arabic)'}</label>
                    <input
                      type="text"
                      required={selectedCustomerId === 'custom'}
                      placeholder="مثال: شركة إكني المحدودة"
                      value={newSourceAr}
                      onChange={(e) => setNewSourceAr(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2 outline-none font-sans shadow-sm"
                    />
                  </div>

                  {/* Save New Customer option */}
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer text-[10px] text-slate-600 mt-1">
                    <input
                      type="checkbox"
                      checked={saveNewCustomer}
                      onChange={(e) => setSaveNewCustomer(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-600 rounded shrink-0"
                    />
                    <span className="font-semibold pl-1">
                      {lang === 'ar' ? 'حفظ البيانات تلقائياً كعميل في النظام' : 'Save as a permanent Customer in system'}
                    </span>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Amount */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'المبلغ الكلي ($)' : 'Inflow Value ($)'}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="12500"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'تاريخ التقييد' : 'Effective Date'}</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-805 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Branch */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الفرع المستفيد' : 'Assigned Hub'}</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 rounded-xl p-2.5 outline-none shadow-sm"
                  >
                    {branches.map(br => (
                      <option key={br.id} value={br.id}>
                        {lang === 'ar' ? br.nameAr : br.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Method */}
                <div>
                  <label className="text-slate-400 block mb-1 font-bold">{lang === 'ar' ? 'طريقة الاستلام' : 'Deposit Method'}</label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-705 text-slate-700 rounded-xl p-2.5 outline-none shadow-sm"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Corporate Credit">Corporate Credit</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'شرح المعاملة (ENG)' : 'Memo (English)'}</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'شرح المعاملة (AR)' : 'Memo (Arabic)'}</label>
                  <textarea
                    rows={2}
                    value={newDescAr}
                    onChange={(e) => setNewDescAr(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl transition duration-100 cursor-pointer text-center"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Discard'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer text-center"
                >
                  {lang === 'ar' ? 'حفظ الدخل' : 'Commit Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED BRANDED PRINTABLE CASH RECEIPT VOUCHER (A5 SIZE) */}
      {viewingVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-in">
            
            {/* Modal Control Head */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>
                  {lang === 'ar' 
                    ? `سند قبض رقم: RV-${viewingVoucher.id.slice(-6).toUpperCase()}` 
                    : `Receipt Voucher: RV-${viewingVoucher.id.slice(-6).toUpperCase()}`}
                </span>
              </h3>
              <button
                onClick={() => setViewingVoucher(null)}
                className="text-slate-400 hover:text-slate-650 bg-slate-200/50 hover:bg-slate-200 p-1 rounded-lg border-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Mockup Area - Styled for A5 Formats */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 text-start custom-scrollbar">
              
              {/* THE WRAPPER TARGETED BY THE MEDIA-PRINT TARGET */}
              <div className="printable-area bg-white p-5 rounded-lg border border-slate-200 space-y-5 font-sans relative text-xs shadow-inner">
                
                {/* Official Structured Letterhead */}
                <div className="flex justify-between items-start border-b border-double border-slate-300 pb-4">
                  <div className="text-left space-y-0.5">
                    <span className="text-xs font-black text-slate-800 block">
                      {lang === 'ar' ? systemSettings.companyNameAr : systemSettings.companyName}
                    </span>
                    <p className="text-[9px] text-slate-500 max-w-[200px] leading-tight">
                      {lang === 'ar' ? systemSettings.companyAddressAr : systemSettings.companyAddress}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono">
                      {systemSettings.companyPhone} | {systemSettings.companyEmail}
                    </p>
                  </div>

                  <div className="text-center">
                    {systemSettings.logoUrl ? (
                      <img 
                        src={systemSettings.logoUrl} 
                        alt="Company Logo" 
                        className="h-9 max-w-[100px] object-contain rounded-lg bg-white p-1 shadow-sm mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-emerald-600 text-white flex items-center justify-center rounded-lg font-mono font-bold text-xs mx-auto">
                        {(systemSettings.companyName || 'C')[0]}
                      </div>
                    )}
                    <span className="text-[8px] text-emerald-600 uppercase font-mono font-bold tracking-wider mt-1 block">
                      {lang === 'ar' ? 'سند قبض معتمد' : 'OFFICIAL INFLOW'}
                    </span>
                  </div>

                  <div className="text-right space-y-0.5 text-[9px] font-mono">
                    <p className="text-slate-800"><span className="text-slate-400">{lang === 'ar' ? 'رقم السند:' : 'Voucher No:'}</span> <strong className="text-slate-900">RV-{viewingVoucher.id.slice(-6).toUpperCase()}</strong></p>
                    <p className="text-slate-500"><span className="text-slate-400">{lang === 'ar' ? 'التاريخ:' : 'Date:'}</span> {viewingVoucher.date}</p>
                    <p className="text-slate-600"><span className="text-slate-400">{lang === 'ar' ? 'الرقم الموحد:' : 'Reg No:'}</span> {systemSettings.registrationNo}</p>
                  </div>
                </div>

                {/* Subtitle Card */}
                <div className="text-center py-2 border-b border-slate-100 bg-slate-50/75 rounded-lg">
                  <h2 className="text-sm font-black text-slate-850 tracking-wide uppercase">
                    {lang === 'ar' ? 'سند قبض نقدي / مسترد رسمي' : 'CASH RECEIPT VOUCHER'}
                  </h2>
                  <p className="text-[8px] text-slate-400 tracking-wider">
                    {lang === 'ar' ? 'مستند إثبات مالي لتسجيل المقبوضات وتدقيق الحساب الدفتري' : 'Financial voucher issued for customer payments and cash tracking reconciliation'}
                  </p>
                </div>

                {/* Primary Form Fields Block */}
                <div className="space-y-3 text-[10px]">
                  
                  {/* Row 1: Received From */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
                    <span className="col-span-3 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'استلمنا من السيد/ة:' : 'RECEIVED FROM:'}
                    </span>
                    <p className="col-span-9 font-extrabold text-slate-900 text-start">
                      {lang === 'ar' ? viewingVoucher.sourceAr : viewingVoucher.source}
                    </p>
                  </div>

                  {/* Row 2: Sum Of */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
                    <span className="col-span-3 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'مبلغ وقدره:' : 'THE SUM OF:'}
                    </span>
                    <p className="col-span-9 font-bold text-slate-800 font-mono text-start">
                      ${viewingVoucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {systemSettings.primaryCurrency || 'USD'}
                    </p>
                  </div>

                  {/* Row 3: For Payment of */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
                    <span className="col-span-3 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'وذلك مقابل:' : 'FOR PAYMENT OF:'}
                    </span>
                    <p className="col-span-9 text-slate-705 italic text-start">
                      {viewingVoucher.descriptionAr && lang === 'ar' ? viewingVoucher.descriptionAr : (viewingVoucher.description || 'Income entry transaction recorded')}
                    </p>
                  </div>

                  {/* Row 4: Details & Payment Method */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5 text-left font-mono text-[9px]">
                      <span className="text-slate-400 block font-bold uppercase tracking-wider">{lang === 'ar' ? 'طريقة القبض والاستلام:' : 'METHOD OF RECEIVING:'}</span>
                      <p className="text-emerald-700 font-bold">{viewingVoucher.paymentMethod}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5 text-right font-mono text-[9px]">
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-right">{lang === 'ar' ? 'الفرع المستلم والمسؤول:' : 'COLLECTING BRANCH:'}</span>
                      <p className="text-slate-700 font-bold">{getBranchName(viewingVoucher.branchId)}</p>
                    </div>
                  </div>

                </div>

                {/* Total Visual Box */}
                <div className="flex justify-between items-center bg-emerald-600 text-white rounded-lg p-3 shadow-sm font-mono">
                  <span className="text-[10px] font-bold uppercase">
                    {lang === 'ar' ? 'القيمة الصافية المقبوضة' : 'NET CASH RECEIVED'}
                  </span>
                  <span className="text-xs font-black">
                    ${viewingVoucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {systemSettings.primaryCurrency || 'USD'}
                  </span>
                </div>

                {/* Sign-off & Seal section */}
                <div className="border-t border-slate-150 pt-3 grid grid-cols-2 gap-2 min-h-[80px] items-center">
                  
                  {/* Seal display */}
                  <div className="text-left space-y-1">
                    {systemSettings.showSealOnInvoices && (
                      <div>
                        {systemSettings.companySealUrl ? (
                          <img 
                            src={systemSettings.companySealUrl} 
                            alt="Company Seal" 
                            className="h-14 w-14 object-contain mix-blend-multiply opacity-90 rotate-[-1deg]"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full border-4 border-double border-emerald-600/60 flex flex-col items-center justify-center text-emerald-600/80 font-bold text-[5px] select-none scale-90 rotate-[-4deg]">
                            <span>AUDITED</span>
                            <span className="w-full border-t border-b border-emerald-600/20 py-0.5 my-0.5 text-center truncate scale-95">{systemSettings.companyName}</span>
                            <span className="font-extrabold">APPROVED</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Signature display */}
                  <div className="text-right space-y-0.5 text-right">
                    <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider">
                      {lang === 'ar' ? 'توقيع المحصل المعتمد:' : 'COLLECTOR SPECIMEN:'}
                    </span>
                    {systemSettings.showSignatureOnInvoices && systemSettings.authorizedSignatureUrl ? (
                      <div className="h-8 w-24 flex items-center justify-end overflow-hidden ml-auto mr-0">
                        <img 
                          src={systemSettings.authorizedSignatureUrl} 
                          alt="Signature Seal" 
                          className="max-h-full object-contain mix-blend-multiply opacity-95"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <p className="font-serif italic text-slate-600 font-bold text-xs rotate-[-1deg] border-b border-slate-200 border-dashed inline-block px-3 py-0.5 text-right">
                        {lang === 'ar' ? 'أمين المقبوضات' : 'Authorized Signee'}
                      </p>
                    )}
                  </div>

                </div>

              </div>
              
            </div>

            {/* Bottom Actions footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 text-xxs font-bold">
              <span className="text-slate-400 font-mono">
                {lang === 'ar' ? 'سند قبض رسمي - قياس A5 مناسب' : 'Certified Revenue voucher - optimized A5 paper'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const existing = document.getElementById('print-size-style');
                    if (existing) existing.remove();
                    const style = document.createElement('style');
                    style.id = 'print-size-style';
                    style.innerHTML = `@media print { @page { size: A5; margin: 10mm; } }`;
                    document.head.appendChild(style);
                    window.print();
                  }}
                  className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs rounded-lg transition duration-100 border-0 flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'طباعة / PDF' : 'Print / PDF'}</span>
                </button>
                <button
                  onClick={() => setViewingVoucher(null)}
                  className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer text-xs rounded-lg transition duration-100 border-0"
                >
                  {lang === 'ar' ? 'إغلاق' : 'Dismiss'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
