import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, ExpenseStatus, Branch, UserRole, Customer, SystemSettings } from '../types';
import { 
  Download, 
  PlusCircle, 
  Search, 
  ArrowDown, 
  ArrowUp, 
  Trash2, 
  X, 
  FileText, 
  Check, 
  AlertTriangle, 
  Receipt,
  FileCheck2,
  Printer
} from 'lucide-react';

interface ExpensesModuleProps {
  expenses: Expense[];
  filteredExpenses: Expense[];
  branches: Branch[];
  customers: Customer[];
  addExpense: (item: Omit<Expense, 'id'>) => Expense;
  addCustomer: (item: Omit<Customer, 'id'>) => Customer;
  deleteExpense: (id: string) => void;
  lang: 'en' | 'ar';
  userRole?: UserRole;
  systemSettings: SystemSettings;
  quickActionTrigger?: string | null;
  clearQuickAction?: () => void;
}

export const ExpensesModule: React.FC<ExpensesModuleProps> = ({
  expenses,
  filteredExpenses,
  branches,
  customers,
  addExpense,
  addCustomer,
  deleteExpense,
  lang,
  userRole,
  systemSettings,
  quickActionTrigger,
  clearQuickAction
}) => {
  const [viewingPaymentVoucher, setViewingPaymentVoucher] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
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
  const [newEntity, setNewEntity] = useState('');
  const [newEntityAr, setNewEntityAr] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBranch, setNewBranch] = useState(branches[0]?.id || '');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Utilities');
  const [newStatus, setNewStatus] = useState<ExpenseStatus>('Approved');
  const [newDesc, setNewDesc] = useState('');
  const [newDescAr, setNewDescAr] = useState('');
  
  // Base64 upload file storage
  const [fileName, setFileName] = useState('');
  const [attachmentData, setAttachmentData] = useState('');

  useEffect(() => {
    if (quickActionTrigger === 'RECORD_EXPENSE') {
      setShowAddModal(true);
      if (clearQuickAction) clearQuickAction();
    }
  }, [quickActionTrigger, clearQuickAction]);

  // View Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<Expense | null>(null);

  // Read file as base64 data url for durable client-side persistence
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachmentData(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntity || !newAmount) return;

    if (selectedCustomerId === 'custom' && saveNewCustomer) {
      addCustomer({
        name: newEntity,
        nameAr: newEntityAr || newEntity,
        code: `CUS-${Date.now().toString().slice(-4)}`,
        contactEmail: `${newEntity.toLowerCase().replace(/\s+/g, '') || `cus_${Date.now()}`}@example.com`,
        phone: '+968 9000 0000',
        address: 'Oman',
        addressAr: 'عمان'
      });
    }

    addExpense({
      entity: newEntity,
      entityAr: newEntityAr || newEntity,
      amount: parseFloat(newAmount),
      date: newDate,
      branchId: newBranch,
      category: newCategory,
      status: newStatus,
      attachmentUrl: attachmentData || undefined,
      fileName: fileName || undefined,
      description: newDesc,
      descriptionAr: newDescAr || newDesc
    });

    // Reset fields
    setNewEntity('');
    setNewEntityAr('');
    setSelectedCustomerId('custom');
    setSaveNewCustomer(true);
    setNewAmount('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewDesc('');
    setNewDescAr('');
    setFileName('');
    setAttachmentData('');
    setShowAddModal(false);
  };

  const getBranchName = (brId: string) => {
    const b = branches.find(item => item.id === brId);
    if (!b) return '-';
    return lang === 'ar' ? b.nameAr : b.name;
  };

  // Convert English category names to beautiful Arabic tags
  const getCategoryTranslation = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Rent': return lang === 'ar' ? 'إيجار فروع' : 'Rent';
      case 'Payroll': return lang === 'ar' ? 'رواتب الموظفين' : 'Payroll';
      case 'Utilities': return lang === 'ar' ? 'مرافق عامة' : 'Utilities';
      case 'Infrastructure': return lang === 'ar' ? 'بنية تحتية' : 'Infrastructure';
      case 'Fees': return lang === 'ar' ? 'رسوم وعمولات' : 'Fees';
      default: return cat;
    }
  };

  // Filters mapping
  const processedData = filteredExpenses
    .filter(item => {
      const matchSearch = (lang === 'ar' ? item.entityAr : item.entity)
        .toLowerCase()
        .includes(search.toLowerCase()) || 
        (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.descriptionAr || '').toLowerCase().includes(search.toLowerCase());

      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchBranch = branchFilter === 'all' || item.branchId === branchFilter;

      return matchSearch && matchCategory && matchBranch;
    })
    .sort((a, b) => {
      let multiplier = sortOrder === 'desc' ? -1 : 1;
      if (sortBy === 'amount') {
        return (a.amount - b.amount) * multiplier;
      } else {
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier;
      }
    });

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData.slice(startIdx, startIdx + itemsPerPage);

  const handleExportCSV = () => {
    const headers = lang === 'ar'
      ? 'رقم التعريف,الجهة,القيمة,التاريخ,الفرع,التصنيف,الحالة\n'
      : 'ID,Entity,Amount,Date,Branch,Category,Status\n';

    const rows = processedData.map(item => {
      const entityTxt = lang === 'ar' ? item.entityAr : item.entity;
      const branchName = getBranchName(item.branchId);
      return `${item.id},"${entityTxt}",${item.amount},${item.date},"${branchName}","${item.category}","${item.status}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger_outflow_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Title widgets */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-start">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mb-1">
            {lang === 'ar' ? 'سجل المدفوعات والمصروفات' : 'Consolidated Outflows Ledger'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' ? 'إثبات نفقات المكاتب والرواتب الشهرية وتدقيق المرفقات الرسمية وثبوتيات السداد' : 'Tracking payroll, renting overheads, infrastructure subscriptions, and vendor invoice settlements.'}
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
              <span>{lang === 'ar' ? 'تقييد نفقة جديدة' : 'Record Disbursement'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories summary progress bars widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {(['Rent', 'Payroll', 'Utilities', 'Infrastructure', 'Fees'] as ExpenseCategory[]).map(cat => {
          const catSum = filteredExpenses.filter(e => e.category === cat).reduce((sum, current) => sum + current.amount, 0);
          const totalSum = filteredExpenses.reduce((sum, current) => sum + current.amount, 1);
          const pct = Math.max(2, Math.min(100, Math.round((catSum / totalSum) * 100)));

          return (
            <div key={cat} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between shadow-sm text-start">
              <div>
                <span className="text-xxs font-bold text-slate-500 uppercase tracking-wide truncate block">{getCategoryTranslation(cat)}</span>
                <span className="text-sm font-bold text-slate-800 font-mono block mt-1">${catSum.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 relative overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    cat === 'Rent' ? 'bg-indigo-500' :
                    cat === 'Payroll' ? 'bg-violet-500' :
                    cat === 'Utilities' ? 'bg-orange-500' :
                    cat === 'Infrastructure' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Area */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={lang === 'ar' ? 'البحث عن مدفوعات...' : 'Search disbursements...'}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className={`w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-805 text-slate-850 text-xs rounded-xl ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 outline-none font-sans shadow-sm`}
          />
          <Search className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
        </div>

        {/* Categories Select filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 text-xs rounded-xl p-2.5 outline-none shadow-sm"
          >
            <option value="all">{lang === 'ar' ? 'كل تصنيفات النفقات' : 'All Expense Categories'}</option>
            <option value="Rent">{lang === 'ar' ? 'الإيجارات والعقارات' : 'Rent'}</option>
            <option value="Payroll">{lang === 'ar' ? 'سداد الرواتب والأجور' : 'Payroll'}</option>
            <option value="Utilities">{lang === 'ar' ? 'المرافق والخدميات' : 'Utilities'}</option>
            <option value="Infrastructure">{lang === 'ar' ? 'البنية السحابية والمعدات' : 'Infrastructure'}</option>
            <option value="Fees">{lang === 'ar' ? 'رسوم وضرائب تشغيلية' : 'Fees'}</option>
          </select>
        </div>

        {/* Branch Filter */}
        <div>
          <select
            value={branchFilter}
            onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
            disabled={userRole === 'Employee' || userRole === 'Manager'}
            className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 text-xs rounded-xl p-2.5 outline-none shadow-sm"
          >
            <option value="all">{lang === 'ar' ? 'جميع الفروع الإقليمية' : 'All Regional Hubs'}</option>
            {branches.map(br => (
              <option key={br.id} value={br.id}>
                {lang === 'ar' ? br.nameAr : br.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting buttons */}
        <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1 h-full items-center">
          <button
            onClick={() => setSortBy(sortBy === 'amount' ? 'date' : 'amount')}
            className="flex-1 py-1.5 rounded-lg text-xxs font-bold text-slate-550 text-slate-500 hover:text-slate-800 cursor-pointer text-center duration-150"
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

      {/* Table listing */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden text-start">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left font-sans border-collapse" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-xxs font-bold uppercase tracking-wider text-slate-500 text-start">
                <th className="py-4 px-5">{lang === 'ar' ? 'مستلم الدفعة وموضوع الصرف' : 'Beneficiary & Memo'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'القيمة والمصروف' : 'Fiscal Value'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'تاريخ التقييد' : 'Effective Date'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'التصنيف العملي' : 'Category'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'إثبات ومرفقات' : 'Audit Receipt'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'حالة الاعتماد' : 'Auditing Status'}</th>
                <th className="py-4 px-5 text-center">{lang === 'ar' ? 'سند الصرف' : 'Receipt Voucher'}</th>
                {userRole === 'Super Admin' && <th className="py-4 px-5 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 duration-105 text-xs">
                  <td className="py-4 px-5">
                    <div>
                      <span className="font-bold text-slate-800 leading-tight block">
                        {lang === 'ar' ? item.entityAr : item.entity}
                      </span>
                      <p className="text-xxs text-slate-400 mt-1 max-w-sm truncate">
                        {getBranchName(item.branchId)} • {lang === 'ar' ? item.descriptionAr : item.description}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono font-bold text-rose-600">
                    -${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-500">
                    {item.date}
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-xxs font-semibold inline-flex bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-slate-600">
                      {getCategoryTranslation(item.category)}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    {item.attachmentUrl ? (
                      <button
                        onClick={() => setActiveReceipt(item)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-emerald-600 hover:text-emerald-700 text-xxs font-bold rounded-lg flex items-center space-x-1 space-x-reverse transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{item.fileName || (lang === 'ar' ? 'عرض السند' : 'View Attach')}</span>
                      </button>
                    ) : (
                      <span className="text-xxs text-slate-400 font-mono italic">
                        {lang === 'ar' ? 'بدون مرفقات' : 'no proof uploaded'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                      item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      item.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      <span className="w-1 h-1 rounded-full bg-current"></span>
                      <span>
                        {item.status === 'Approved' ? (lang === 'ar' ? 'معتمد' : 'Approved') :
                         item.status === 'Pending' ? (lang === 'ar' ? 'قيد الانتظار' : 'Pending') :
                         (lang === 'ar' ? 'ملحوظ للمراجعة' : 'Flagged')}
                      </span>
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <button
                      onClick={() => setViewingPaymentVoucher(item)}
                      className="text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg duration-150 cursor-pointer inline-flex items-center justify-center gap-1 text-xxs font-bold border border-slate-200 hover:border-emerald-200 bg-white shadow-sm font-sans"
                      title={lang === 'ar' ? 'عرض سند صرف رسمي' : 'View official Cash Payment Voucher'}
                    >
                      <Printer className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'سند الصرف' : 'Voucher'}</span>
                    </button>
                  </td>
                  {userRole === 'Super Admin' && (
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => deleteExpense(item.id)}
                        className="text-slate-405 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg duration-150 cursor-pointer inline-flex items-center justify-center"
                        title={lang === 'ar' ? 'إلغاء النفقة' : 'Revert disbursement'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={userRole === 'Super Admin' ? 7 : 6} className="py-12 text-center text-xs text-slate-500 font-sans">
                    {lang === 'ar' ? 'لا توجد قيود نفقات بمطابقة الفلاتر النشطة.' : 'No continuous outflow matches your designated filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between text-xxs font-mono text-slate-500" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <span>
              {lang === 'ar' ? `صفحة ${currentPage} من أصل ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-slate-600"
              >
                {lang === 'ar' ? 'السابق' : 'Prev'}
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-slate-600"
              >
                {lang === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Popup */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-slide-in text-slate-800" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Close */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 flex items-center justify-center duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 text-start">
              <Receipt className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{lang === 'ar' ? 'تقييد نفقة أو صرف مخرجات' : 'Create Disbursement Receipt'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-start">
              {/* Customer / Beneficiary Dropdown Selection */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">
                  {lang === 'ar' ? 'الجهة المستفيدة / العميل المستلم' : 'Beneficiary Entity / Client'}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCustomerId(val);
                    if (val !== 'custom') {
                      const found = customers.find(c => c.id === val);
                      if (found) {
                        setNewEntity(found.name);
                        setNewEntityAr(found.nameAr);
                      }
                    } else {
                      setNewEntity('');
                      setNewEntityAr('');
                    }
                  }}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm font-bold"
                >
                  <option value="custom">{lang === 'ar' ? '➕ مستفيد مخصص / إضافة عميل جديدة' : '➕ Custom / Add New Customer'}</option>
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
                  {/* English Beneficiary name */}
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-bold text-[10px]">{lang === 'ar' ? 'اسم المستفيد الجديد (بالإنجليزي)' : 'New Beneficiary Name (English)'}</label>
                    <input
                      type="text"
                      required={selectedCustomerId === 'custom'}
                      placeholder="e.g. AWS Europe Hosting"
                      value={newEntity}
                      onChange={(e) => setNewEntity(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2 outline-none font-sans shadow-sm"
                    />
                  </div>

                  {/* Arabic Beneficiary name */}
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-bold text-[10px]">{lang === 'ar' ? 'اسم المستفيد الجديد (بالعربي)' : 'New Beneficiary Name (Arabic)'}</label>
                    <input
                      type="text"
                      required={selectedCustomerId === 'custom'}
                      placeholder="مثال: خدمات سحابة أمازون"
                      value={newEntityAr}
                      onChange={(e) => setNewEntityAr(e.target.value)}
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
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'القيمة الإجمالية ($)' : 'Disbursement Amount ($)'}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="12450.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-804 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Effective Date'}</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Branch */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'فرع الصرف' : 'Origin Branch'}</label>
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

                {/* Category */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'التصنيف المحاسبي' : 'Ledger Category'}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 rounded-xl p-2.5 outline-none shadow-sm"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Fees">Fees</option>
                  </select>
                </div>
              </div>

              {/* Upload input files */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'أرفق مستند أو ثبوت سداد (صورة/ملف)' : 'Proof of Payment / Audit Receipt'}</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-inner">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="receipt-file-input"
                  />
                  <label
                    htmlFor="receipt-file-input"
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-xxs font-bold text-slate-700 rounded-lg cursor-pointer transition active:scale-95 duration-100 shadow-sm"
                  >
                    {lang === 'ar' ? 'اختر مستند' : 'Choose File'}
                  </label>
                  <span className="text-xxs text-slate-500 font-mono truncate max-w-[200px]">
                    {fileName || (lang === 'ar' ? 'لا يوجد مرفقات' : 'no file attached')}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'شرح النفقة (ENG)' : 'Memo (English)'}</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'شرح النفقة (AR)' : 'Memo (Arabic)'}</label>
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
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-705 text-slate-700 font-bold rounded-xl transition duration-100 cursor-pointer text-center"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Discard'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-750 text-white font-bold rounded-xl transition duration-150 cursor-pointer text-center shadow-md shadow-rose-600/10"
                >
                  {lang === 'ar' ? 'حفظ الصرف' : 'Commit Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Attachment Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-slide-in text-slate-800" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Close */}
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-55 hover:bg-slate-100 border border-slate-150 text-slate-500 flex items-center justify-center duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-100 pb-3 text-start">
              <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{lang === 'ar' ? 'مطابقة مستند الإثبات والتحقق المحاسبي' : 'Payment Audit Attachment Document'}</span>
            </h3>

            <div className="space-y-4 text-start">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xxs font-mono text-slate-500">
                <div>
                  <span className="block text-slate-400 uppercase">{lang === 'ar' ? 'رقم النفقة المعني:' : 'Disbursement Reference:'}</span>
                  <span className="text-slate-800 font-bold">{activeReceipt.id}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase">{lang === 'ar' ? 'الجهة المدفوع لها:' : 'Beneficiary Benefactor:'}</span>
                  <span className="text-slate-800 font-bold">{lang === 'ar' ? activeReceipt.entityAr : activeReceipt.entity}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase">{lang === 'ar' ? 'التسجيل والتقييد:' : 'Logged Timestamp:'}</span>
                  <span className="text-slate-700 font-bold">{activeReceipt.date}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase">{lang === 'ar' ? 'القيمة المحسومة:' : 'Fiscal Value:'}</span>
                  <span className="text-rose-600 font-bold">${activeReceipt.amount.toLocaleString()} USD</span>
                </div>
              </div>

              {/* View the actual file (Base64 data or mock rendering) */}
              <div className="border border-slate-205 border-slate-200 bg-slate-50 rounded-xl overflow-hidden max-h-[300px] flex items-center justify-center relative p-6 shadow-inner">
                {activeReceipt.attachmentUrl?.startsWith('data:image/') ? (
                  <img
                    src={activeReceipt.attachmentUrl}
                    alt="Uploaded receipt proof"
                    referrerPolicy="no-referrer"
                    className="max-h-[250px] object-contain rounded shadow"
                  />
                ) : activeReceipt.attachmentUrl?.startsWith('data:application/pdf') ? (
                  <div className="flex flex-col items-center space-y-2 p-8 text-xs text-slate-500">
                    <FileText className="w-8 h-8 text-rose-600" />
                    <span>{lang === 'ar' ? 'ملف مستند PDF مدمج' : 'Embedded PDF File'}</span>
                    <a
                      href={activeReceipt.attachmentUrl}
                      download={activeReceipt.fileName || "attachment.pdf"}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold mt-2 hover:underline inline-block duration-100"
                    >
                      {lang === 'ar' ? 'تحميل ملف PDF' : 'Download Audit PDF'}
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 py-10 text-slate-500 text-xxs">
                    <Check className="w-8 h-8 text-emerald-600 bg-emerald-100 p-1.5 rounded-full" />
                    <span className="font-bold text-slate-700 text-xs mt-1">{lang === 'ar' ? 'إثبات معتمد ورقمي' : 'Digitally Certified Bill Statement'}</span>
                    <p className="max-w-[220px] text-center leading-relaxed mt-2 text-slate-400">
                      {lang === 'ar' ? 'تمت المطابقة والفوترة المصرفية تلقائياً برقم تأكيد التحويل الجاري.' : 'Electronic sweep bank reconciliation is fully complete.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveReceipt(null)}
                className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition duration-100 cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق ومتابعة التدقيق' : 'Dismiss Proof'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED BRANDED PRINTABLE CASH PAYMENT VOUCHER (A5 SIZE) */}
      {viewingPaymentVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-in">
            
            {/* Modal Control Head */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Printer className="w-4 h-4 text-rose-600" />
                <span>
                  {lang === 'ar' 
                    ? `سند صرف رقم: PV-${viewingPaymentVoucher.id.slice(-6).toUpperCase()}` 
                    : `Disbursement Voucher: PV-${viewingPaymentVoucher.id.slice(-6).toUpperCase()}`}
                </span>
              </h3>
              <button
                onClick={() => setViewingPaymentVoucher(null)}
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
                      <div className="w-8 h-8 bg-rose-600 text-white flex items-center justify-center rounded-lg font-mono font-bold text-xs mx-auto">
                        {(systemSettings.companyName || 'C')[0]}
                      </div>
                    )}
                    <span className="text-[8px] text-rose-600 uppercase font-mono font-bold tracking-wider mt-1 block">
                      {lang === 'ar' ? 'سند صرف معتمد' : 'OFFICIAL DEBIT'}
                    </span>
                  </div>

                  <div className="text-right space-y-0.5 text-[9px] font-mono">
                    <p className="text-slate-800"><span className="text-slate-400">{lang === 'ar' ? 'رقم السند:' : 'Voucher No:'}</span> <strong className="text-slate-900">PV-{viewingPaymentVoucher.id.slice(-6).toUpperCase()}</strong></p>
                    <p className="text-slate-500"><span className="text-slate-400">{lang === 'ar' ? 'التاريخ:' : 'Date:'}</span> {viewingPaymentVoucher.date}</p>
                    <p className="text-slate-600"><span className="text-slate-400">{lang === 'ar' ? 'الرقم الموحد:' : 'Reg No:'}</span> {systemSettings.registrationNo}</p>
                  </div>
                </div>

                {/* Subtitle Card */}
                <div className="text-center py-2 border-b border-rose-100 bg-rose-50/75 rounded-lg">
                  <h2 className="text-sm font-black text-rose-900 tracking-wide uppercase">
                    {lang === 'ar' ? 'سند صرف نقدي رسمي' : 'CASH PAYMENT VOUCHER'}
                  </h2>
                  <p className="text-[8px] text-slate-400 tracking-wider">
                    {lang === 'ar' ? 'مستند صرف رسمي صالح لتدقيق الحساب الدفتري ودفع النفقات' : 'Corporate receipt voucher issued for authorized business expenditures and audit compliance'}
                  </p>
                </div>

                {/* Primary Form Fields Block */}
                <div className="space-y-3 text-[10px]">
                  
                  {/* Row 1: Paid To */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
                    <span className="col-span-3 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'اصرفوا بموجبه للسيد/ة:' : 'PAID TO PARTY:'}
                    </span>
                    <p className="col-span-9 font-extrabold text-slate-900 text-start">
                      {lang === 'ar' ? viewingPaymentVoucher.entityAr : viewingPaymentVoucher.entity}
                    </p>
                  </div>

                  {/* Row 2: Sum Of */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
                    <span className="col-span-3 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'مبلغ وقدره:' : 'THE SUM OF:'}
                    </span>
                    <p className="col-span-9 font-bold text-rose-650 font-mono text-start">
                      ${viewingPaymentVoucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {systemSettings.primaryCurrency || 'USD'}
                    </p>
                  </div>

                  {/* Row 3: For Payment of */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-100 pb-2">
                    <span className="col-span-3 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'وذلك مقابل:' : 'FOR PAYMENT OF:'}
                    </span>
                    <p className="col-span-9 text-slate-705 italic text-start">
                      {viewingPaymentVoucher.descriptionAr && lang === 'ar' ? viewingPaymentVoucher.descriptionAr : (viewingPaymentVoucher.description || 'Expense entry transaction logged')}
                    </p>
                  </div>

                  {/* Row 4: Category & Branch */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5 text-left font-mono text-[9px]">
                      <span className="text-slate-400 block font-bold uppercase tracking-wider">{lang === 'ar' ? 'التصنيف المعتمد للدخل:' : 'EXPENSE BUDGET CATEGORY:'}</span>
                      <p className="text-rose-700 font-bold">{getCategoryTranslation(viewingPaymentVoucher.category)}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5 text-right font-mono text-[9px]">
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-right">{lang === 'ar' ? 'الفرع المصدر والمكلف:' : 'EXPENSING BRANCH:'}</span>
                      <p className="text-slate-705 text-slate-700 font-bold">{getBranchName(viewingPaymentVoucher.branchId)}</p>
                    </div>
                  </div>

                </div>

                {/* Total Visual Box */}
                <div className="flex justify-between items-center bg-rose-600 text-white rounded-lg p-3 shadow-sm font-mono">
                  <span className="text-[10px] font-bold uppercase">
                    {lang === 'ar' ? 'القيمة الإجمالية المنصرفة' : 'NET DISBURSEMENT TOTAL'}
                  </span>
                  <span className="text-xs font-black">
                    ${viewingPaymentVoucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {systemSettings.primaryCurrency || 'USD'}
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
                            className="h-14 w-14 object-contain mix-blend-multiply opacity-90 rotate-[#1deg]"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full border-4 border-double border-rose-600/60 flex flex-col items-center justify-center text-rose-600/85 font-bold text-[5px] select-none scale-90 rotate-[-2deg]">
                            <span>DISBURSED</span>
                            <span className="w-full border-t border-b border-rose-600/20 py-0.5 my-0.5 text-center truncate scale-95">{systemSettings.companyName}</span>
                            <span className="font-extrabold">APPROVED</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Signature display */}
                  <div className="text-right space-y-0.5 text-right">
                    <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider">
                      {lang === 'ar' ? 'توقيع المدير والمدقق:' : 'CHIEF AUDITOR SPECIMEN:'}
                    </span>
                    {systemSettings.showSignatureOnInvoices && systemSettings.authorizedSignatureUrl ? (
                      <div className="h-8 w-24 flex items-center justify-end overflow-hidden ml-auto mr-0">
                        <img 
                          src={systemSettings.authorizedSignatureUrl} 
                          alt="Signature Specimen" 
                          className="max-h-full object-contain mix-blend-multiply opacity-95"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <p className="font-serif italic text-slate-600 font-bold text-xs rotate-[-1deg] border-b border-slate-200 border-dashed inline-block px-3 py-0.5 text-right">
                        {lang === 'ar' ? 'أمين المقبوضات' : 'Authorized Controller'}
                      </p>
                    )}
                  </div>

                </div>

              </div>
              
            </div>

            {/* Bottom Actions footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 text-xxs font-bold">
              <span className="text-slate-400 font-mono">
                {lang === 'ar' ? 'سند صرف رسمي للنفقات - قياس A5 مناسب' : 'Certified Expense ledger voucher - optimized A5 paper'}
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
                  className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer text-xs rounded-lg transition duration-100 border-0 flex items-center gap-1 shadow-sm font-sans"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'طباعة / PDF' : 'Print / PDF'}</span>
                </button>
                <button
                  onClick={() => setViewingPaymentVoucher(null)}
                  className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer text-xs rounded-lg transition duration-100 border-0 font-sans"
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
