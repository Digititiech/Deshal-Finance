import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  FileCheck2, 
  PlusCircle, 
  MinusCircle, 
  Calendar, 
  User, 
  ShieldAlert, 
  Activity, 
  Check, 
  X,
  FileText
} from 'lucide-react';
import { FinancialAdjustment, Customer, Invoice, Branch, UserRole, SystemSettings } from '../types';

interface AdjustmentsModuleProps {
  adjustments: FinancialAdjustment[];
  filteredAdjustments: FinancialAdjustment[];
  customers: Customer[];
  invoices: Invoice[];
  branches: Branch[];
  addAdjustment: (item: Omit<FinancialAdjustment, 'id' | 'noteNumber'>) => FinancialAdjustment;
  editAdjustmentStatus: (id: string, status: 'Approved' | 'Pending' | 'Rejected') => void;
  lang: 'en' | 'ar';
  userRole?: UserRole;
  currentUserId?: string;
  systemSettings: SystemSettings;
}

export const AdjustmentsModule: React.FC<AdjustmentsModuleProps> = ({
  adjustments,
  filteredAdjustments,
  customers,
  invoices,
  branches,
  addAdjustment,
  editAdjustmentStatus,
  lang,
  userRole,
  currentUserId,
  systemSettings
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Credit Note' | 'Debit Note'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<FinancialAdjustment | null>(null);

  // Form State
  const [type, setType] = useState<'Credit Note' | 'Debit Note'>('Credit Note');
  const [customerId, setCustomerId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [reasonAr, setReasonAr] = useState('');
  const [branchId, setBranchId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isEditable = userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Manager';

  // Process data list matching filters
  const filteredList = filteredAdjustments.filter(item => {
    const matchesSearch = 
      item.noteNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.reason.toLowerCase().includes(search.toLowerCase()) ||
      item.reasonAr.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const totalAdjustedAmt = filteredList.reduce((sum, current) => sum + current.amount, 0);
  const totalCreditAmt = filteredList.filter(a => a.type === 'Credit Note').reduce((sum, item) => sum + item.amount, 0);
  const totalDebitAmt = filteredList.filter(a => a.type === 'Debit Note').reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setErrorMsg(lang === 'ar' ? 'يرجى تحديد العميل' : 'Please select a customer');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg(lang === 'ar' ? 'يرجى إدخال مبلغ صحيح' : 'Please specify a valid amount');
      return;
    }
    if (!reason || !reasonAr) {
      setErrorMsg(lang === 'ar' ? 'يرجى تعبئة الحقلين الخاصين بالسبب باللغتين' : 'Please describe the reason in both languages');
      return;
    }
    if (!branchId) {
      setErrorMsg(lang === 'ar' ? 'يرجى تحديد الفرع' : 'Please select a branch');
      return;
    }

    addAdjustment({
      type,
      customerId,
      invoiceId: invoiceId || undefined,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      reason,
      reasonAr,
      branchId,
      status: 'Pending',
      createdBy: userRole || 'System Agent'
    });

    // Reset fields
    setType('Credit Note');
    setCustomerId('');
    setInvoiceId('');
    setAmount('');
    setReason('');
    setReasonAr('');
    setErrorMsg('');
    setIsAdding(false);
  };

  const getCustomerName = (id: string) => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return lang === 'ar' ? 'عميل عام' : 'General Customer';
    return lang === 'ar' ? cust.nameAr : cust.name;
  };

  const getBranchName = (id: string) => {
    const br = branches.find(b => b.id === id);
    if (!br) return lang === 'ar' ? 'عام' : 'Global';
    return lang === 'ar' ? br.nameAr : br.name;
  };

  const getInvoiceNumber = (id?: string) => {
    if (!id) return lang === 'ar' ? 'مستقل / عام' : 'General Surcharge';
    const inv = invoices.find(i => i.id === id);
    return inv ? inv.invoiceNumber : id;
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            {lang === 'ar' ? 'التسويات والخصومات المالية' : 'Financial Adjustments'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar' 
              ? 'إدارة وإصدار الإشعارات الدائنة والمدينة لتعديل قيم المبيعات والفواتير والامتثال الضريبي' 
              : 'Regulate Credit Notes and Debit Notes to adjust invoice balances and client receivables.'}
          </p>
        </div>
        
        {isEditable && (
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setSelectedAdjustment(null);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl cursor-pointer duration-150 text-xs border-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إصدار إشعار مالي' : 'Issue adjustment (CN/DN)'}</span>
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Credit Notes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'إجمالي الإشعارات الدائنة' : 'Total Credit Notes (CN)'}
            </span>
            <div className="text-xl font-extrabold text-rose-600 font-mono">
              {totalCreditAmt.toLocaleString()} <span className="text-xs text-slate-400 font-sans">SAR</span>
            </div>
            <span className="text-[9px] text-slate-400 block">
              {lang === 'ar' ? 'تخفيضات ومستردات للعملاء' : 'Reduces customer receivable balance'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <MinusCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Debit Notes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'إجمالي الإشعارات المدينة' : 'Total Debit Notes (DN)'}
            </span>
            <div className="text-xl font-extrabold text-emerald-600 font-mono">
              {totalDebitAmt.toLocaleString()} <span className="text-xs text-slate-400 font-sans">SAR</span>
            </div>
            <span className="text-[9px] text-slate-400 block">
              {lang === 'ar' ? 'إضافات ورسوم إضافية' : 'Increases customer balance'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <PlusCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Adjustments Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'إجمالي المعاملات قيد التدقيق' : 'Pending Approvals'}
            </span>
            <div className="text-xl font-extrabold text-amber-500 font-mono">
              {filteredList.filter(a => a.status === 'Pending').length} <span className="text-xs text-slate-400 font-sans">{lang === 'ar' ? 'سندات' : 'items'}</span>
            </div>
            <span className="text-[9px] text-slate-400 block">
              {lang === 'ar' ? 'بانتظار موافقة الإدارة' : 'Requiring director approval'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Create form or search area */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">
              {lang === 'ar' ? 'إصدار إشعار مالي جديد (تسوية)' : 'Issue New Adjusting / Correction Voucher'}
            </h3>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1 rounded-lg border-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans text-start">
            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Type Selection */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'نوع الإشعار' : 'Adjustment Type'}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'Credit Note' | 'Debit Note')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans"
                >
                  <option value="Credit Note">{lang === 'ar' ? 'إشعار دائن (تخفيض / خصم - Credit)' : 'Credit Note (CN - Discount)'}</option>
                  <option value="Debit Note">{lang === 'ar' ? 'إشعار مدين (إضافة / رسم - Debit)' : 'Debit Note (DN - Surcharge)'}</option>
                </select>
              </div>

              {/* Customer selection */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'العميل المستفيد' : 'Beneficiary Customer'}</label>
                <select
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    setInvoiceId(''); // Reset invoice selection
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans"
                >
                  <option value="">{lang === 'ar' ? '-- اختر العميل --' : '-- Choose Customer --'}</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {lang === 'ar' ? `${c.nameAr} (${c.code})` : `${c.name} (${c.code})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked Invoice */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">
                  {lang === 'ar' ? 'الفاتورة المرتبطة (إختياري)' : 'Corresponding Invoice (Optional)'}
                </label>
                <select
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans font-mono"
                  disabled={!customerId}
                >
                  <option value="">{lang === 'ar' ? 'مستقل / تسوية حساب عامة' : 'Unlinked / General Account balancing'}</option>
                  {invoices
                    .filter(i => i.customerId === customerId)
                    .map(i => (
                      <option key={i.id} value={i.id}>
                        {i.invoiceNumber} (Total: {i.totalAmount} SAR)
                      </option>
                    ))}
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Amount */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'المبلغ المطلوب (بدون ضريبة)' : 'Adjustment Value (Before Tax)'}</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              {/* Branch */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'الفرع المصدر للطلب' : 'Filing Branch'}</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans"
                >
                  <option value="">{lang === 'ar' ? '-- اختر الفرع --' : '-- Choose Branch --'}</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{lang === 'ar' ? b.nameAr : b.name}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Reasons block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'السبب بالتفصيل (English)' : 'Justification Reason (English)'}</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Compensation for shipping damages or service audit drop"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans"
                />
              </div>
              <div>
                <label className="text-slate-500 font-bold block mb-1">{lang === 'ar' ? 'السبب بالتفصيل (باللغة العربية)' : 'Justification Reason (Arabic)'}</label>
                <input
                  type="text"
                  value={reasonAr}
                  onChange={(e) => setReasonAr(e.target.value)}
                  placeholder="مثال: خصم تسوية لقاء عجز في تلبية متطلبات النظام المتفق عليها"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-sans"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="py-2.5 px-6 rounded-xl hover:bg-slate-100 font-bold text-slate-500 cursor-pointer text-xs transition duration-150 border border-slate-200 bg-white"
              >
                {lang === 'ar' ? 'إلغاء' : 'Discard'}
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white cursor-pointer text-xs transition duration-150 border-0 shadow-sm"
              >
                {lang === 'ar' ? 'تقديم للموافقة' : 'Submit Voucher for Audit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main filter & table search */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Filter bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
          
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث عبر رقم السند أو السبب...' : 'Search note number or reason...'}
              className="w-full bg-white border border-slate-200 text-slate-800 pl-9 pr-4 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
            />
          </div>

          {/* Quick tab filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end text-xxs font-bold">
            
            {/* CN/DN Type */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setFilterType('All')}
                className={`px-2.5 py-1.2 rounded-md transition cursor-pointer border-0 ${filterType === 'All' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {lang === 'ar' ? 'الكل' : 'All Types'}
              </button>
              <button
                onClick={() => setFilterType('Credit Note')}
                className={`px-2.5 py-1.2 rounded-md transition cursor-pointer border-0 ${filterType === 'Credit Note' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {lang === 'ar' ? 'دائن CN' : 'Credit Note'}
              </button>
              <button
                onClick={() => setFilterType('Debit Note')}
                className={`px-2.5 py-1.2 rounded-md transition cursor-pointer border-0 ${filterType === 'Debit Note' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {lang === 'ar' ? 'مدين DN' : 'Debit Note'}
              </button>
            </div>

            {/* Verification status */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setFilterStatus('All')}
                className={`px-2.5 py-1.2 rounded-md transition cursor-pointer border-0 ${filterStatus === 'All' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {lang === 'ar' ? 'كل الحالات' : 'All Statuses'}
              </button>
              <button
                onClick={() => setFilterStatus('Approved')}
                className={`px-2.5 py-1.2 rounded-md transition cursor-pointer border-0 ${filterStatus === 'Approved' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
              >
                {lang === 'ar' ? 'معتمد' : 'Approved'}
              </button>
              <button
                onClick={() => setFilterStatus('Pending')}
                className={`px-2.5 py-1.2 rounded-md transition cursor-pointer border-0 ${filterStatus === 'Pending' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-amber-50 hover:text-amber-700'}`}
              >
                {lang === 'ar' ? 'تحت التدقيق' : 'Pending'}
              </button>
              <button
                onClick={() => setFilterStatus('Rejected')}
                className={`px-2.5 py-1.2 rounded-md transition cursor-pointer border-0 ${filterStatus === 'Rejected' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-700'}`}
              >
                {lang === 'ar' ? 'مرفوض' : 'Rejected'}
              </button>
            </div>

          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-start">
                <th className="p-4 text-start">{lang === 'ar' ? 'رقم الإشعار' : 'Note Number'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'النوع' : 'Category'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'الفاتورة المرتبطة' : 'Linked Invoice'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'الفرع' : 'Branch'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'المبلغ الخاضع' : 'Adjusted Value'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-4 text-center">{lang === 'ar' ? 'إجراءات التدقيق' : 'Audit Control'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold italic">
                    {lang === 'ar' ? 'لا يوجد تسويات أو إشعارات مطابقة للمرشحات المحددة' : 'No adjustments or correction logs found.'}
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70 duration-100 text-start align-middle">
                      {/* Note number */}
                      <td className="p-4 font-mono font-bold text-slate-800">
                        <button
                          onClick={() => setSelectedAdjustment(item)}
                          className="text-emerald-600 hover:underline cursor-pointer font-bold border-0 bg-transparent text-xs p-0 text-start font-mono"
                        >
                          {item.noteNumber}
                        </button>
                      </td>
                      
                      {/* Note type */}
                      <td className="p-4 font-sans">
                        <span className={`inline-flex items-center gap-1 font-bold rounded-lg text-[10px] px-2 py-0.5 ${
                          item.type === 'Credit Note' 
                            ? 'text-rose-600 bg-rose-50' 
                            : 'text-emerald-700 bg-emerald-50'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'Credit Note' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                          {lang === 'ar' 
                            ? (item.type === 'Credit Note' ? 'إشعار دائن CN' : 'إشعار مدين DN')
                            : item.type}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-4 font-semibold text-slate-700 max-w-[120px] truncate">
                        {getCustomerName(item.customerId)}
                      </td>

                      {/* Linked original invoice */}
                      <td className="p-4 font-mono text-slate-500 text-[11px]">
                        {getInvoiceNumber(item.invoiceId)}
                      </td>

                      {/* Branch office */}
                      <td className="p-4 text-slate-500 font-semibold">
                        {getBranchName(item.branchId)}
                      </td>

                      {/* Impact Cost */}
                      <td className="p-4 font-mono font-extrabold text-slate-900 text-sm">
                        {item.type === 'Credit Note' ? '-' : '+'}{item.amount.toLocaleString()} <span className="text-[10px] font-sans text-slate-400 font-normal">SAR</span>
                      </td>

                      {/* Verif status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold select-none ${
                          item.status === 'Approved' 
                            ? 'bg-emerald-150 bg-emerald-50 text-emerald-700' 
                            : item.status === 'Pending' 
                              ? 'bg-amber-50 text-amber-600' 
                              : 'bg-rose-50 text-rose-600'
                        }`}>
                          {lang === 'ar' 
                            ? (item.status === 'Approved' ? 'معتمد' : item.status === 'Pending' ? 'قيد الانتظار' : 'مرفوض')
                            : item.status}
                        </span>
                      </td>

                      {/* Approve / Reject controls for administrators */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status === 'Pending' && isEditable ? (
                            <>
                              <button
                                onClick={() => editAdjustmentStatus(item.id, 'Approved')}
                                className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-lg cursor-pointer border-0 bg-transparent duration-150 tooltip"
                                title={lang === 'ar' ? 'اعتماد وإجراء التعديل' : 'Approve and Adjust ledger'}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => editAdjustmentStatus(item.id, 'Rejected')}
                                className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg cursor-pointer border-0 bg-transparent duration-150 tooltips"
                                title={lang === 'ar' ? 'رفض السند' : 'Reject correction'}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedAdjustment(item)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer border-0"
                            >
                              {lang === 'ar' ? 'معاينة السند' : 'View voucher'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* DETAILED LEDGER/MOCKUP VIEW POPUP MODAL (PRINTABLE DESIGNS) */}
      {selectedAdjustment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-350 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-in">
            
            {/* Modal Header bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>
                  {lang === 'ar' 
                    ? `مستند تسوية رسمي: ${selectedAdjustment.noteNumber}` 
                    : `Correction Document: ${selectedAdjustment.noteNumber}`}
                </span>
              </h3>
              <button
                onClick={() => setSelectedAdjustment(null)}
                className="text-slate-400 hover:text-slate-650 bg-slate-200/50 hover:bg-slate-200 p-1 rounded-lg border-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Mockup Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-slate-700 bg-slate-100 text-start">
              
              {/* THE WRAPPER TETHERED FOR THE PRINT SELECTOR */}
              <div className="printable-area bg-white p-6 rounded-xl border border-slate-200 space-y-6 font-sans text-start shadow-inner">
                
                {/* Visual Title Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                  <div className="text-left space-y-1">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                      {selectedAdjustment.type === 'Credit Note' 
                        ? (lang === 'ar' ? 'إشعار دائن ضريبي معتمد' : 'TAX CREDIT NOTE') 
                        : (lang === 'ar' ? 'إشعار مدين ضريبي رسمي' : 'TAX DEBIT NOTE')}
                    </h2>
                    <span className="text-[10px] bg-slate-900 text-white py-0.5 px-2 rounded-md font-mono mt-0.5 inline-block">
                      {selectedAdjustment.noteNumber}
                    </span>
                    <p className="text-[8px] text-slate-400">
                      {selectedAdjustment.type === 'Credit Note' 
                        ? (lang === 'ar' ? 'صادرة لتسوية وتعديل حساب مالي دائن للعميل' : 'Issued to reverse receivable and credit the customer ledger')
                        : (lang === 'ar' ? 'صادرة لتسجيل أعباء أو مبالغ مدينة إضافية' : 'Issued to record supplemental receivable or debit surcharges')}
                    </p>
                  </div>
                  
                  {/* Dynamic corporate branding */}
                  <div className="text-right">
                    {systemSettings.logoUrl ? (
                      <div className="mb-1 flex justify-end">
                        <img 
                          src={systemSettings.logoUrl} 
                          alt="Company Logo" 
                          className="h-9 max-w-[120px] object-contain rounded-lg shadow-sm bg-white p-1"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-emerald-600 text-white flex items-center justify-center rounded-lg font-mono font-bold text-xs ml-auto mr-0">
                        {(systemSettings.companyName || 'N')[0]}
                      </div>
                    )}
                    <span className="text-xs text-slate-850 font-bold block mt-1">
                      {lang === 'ar' ? systemSettings.companyNameAr : systemSettings.companyName}
                    </span>
                  </div>
                </div>

                {/* Meta details alignment blocks */}
                <div className="grid grid-cols-2 gap-4 text-[10px] border-b border-slate-100 pb-4">
                  <div className="space-y-1 text-left">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider">{lang === 'ar' ? 'مصدر السند المالي:' : 'CLEARANCE OFFICE:'}</span>
                    <p className="font-extrabold text-slate-800">{lang === 'ar' ? systemSettings.companyNameAr : systemSettings.companyName}</p>
                    <p className="text-slate-500">{lang === 'ar' ? systemSettings.companyAddressAr : systemSettings.companyAddress}</p>
                    <p className="text-slate-400 font-mono">{systemSettings.companyPhone} | {systemSettings.companyEmail}</p>
                    <p className="text-emerald-600 font-mono font-bold">{lang === 'ar' ? 'الرقم الضريبي الموحد:' : 'Tax Registration ID:'} {systemSettings.registrationNo}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider">{lang === 'ar' ? 'تفاصيل تاريخ الإصدار والعميل:' : 'MEMORANDUM DETAILS:'}</span>
                    <p className="text-slate-700 font-bold"><span className="text-slate-400 font-normal">{lang === 'ar' ? 'العميل الموجه له:' : 'Beneficiary:'}</span> {getCustomerName(selectedAdjustment.customerId)}</p>
                    <p className="text-slate-600 font-bold"><span className="text-slate-400 font-normal">{lang === 'ar' ? 'تاريخ السند:' : 'Issue Date:'}</span> {selectedAdjustment.date}</p>
                    <p className="text-slate-600 font-bold"><span className="text-slate-400 font-normal">{lang === 'ar' ? 'الفرع المصدر:' : 'Source branch:'}</span> {getBranchName(selectedAdjustment.branchId)}</p>
                    <p className="text-slate-600 font-bold"><span className="text-slate-400 font-normal">{lang === 'ar' ? 'رقم الفاتورة الأصلية:' : 'Linked Invoice Ref:'}</span> {getInvoiceNumber(selectedAdjustment.invoiceId)}</p>
                  </div>
                </div>

                {/* Justification descriptive ledger */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider text-left">
                    {lang === 'ar' ? 'وصف تسوية الحساب والسبب الحقيقي والتصريح:' : 'Statement of Adjustment Justification:'}
                  </span>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-[11px] space-y-2 text-start">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">English Description:</span>
                      <p className="italic font-sans text-slate-700">{selectedAdjustment.reason}</p>
                    </div>
                    <div className="border-t border-slate-200/50 pt-2 text-right dir-rtl">
                      <span className="text-[9px] text-slate-400 block font-bold text-start">السبب الموثق باللغة العربية:</span>
                      <p className="italic font-sans text-slate-700 text-start">{selectedAdjustment.reasonAr}</p>
                    </div>
                  </div>
                </div>

                {/* Total settled cost metrics */}
                <div className="flex justify-between items-center bg-slate-900 text-white rounded-xl p-4 shadow-md/5">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-300 uppercase block tracking-wider font-bold">
                      {lang === 'ar' ? 'القيمة المتأثرة الإجمالية للتعديل' : 'AUTHORIZED TRANSACTION VALUE'}
                    </span>
                    <span className="text-[8px] text-slate-400 font-semibold italic block">
                      {lang === 'ar' ? 'حسب تدقيقات الحساب الداخلي والامتثال' : 'In compliance with local corporate audit rules'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg font-black text-white">
                      {selectedAdjustment.amount.toLocaleString()} <span className="text-xs">SAR</span>
                    </span>
                  </div>
                </div>

                {/* Micro approval signature stamp section */}
                {(systemSettings.showSealOnInvoices || systemSettings.showSignatureOnInvoices) && (
                  <div className="border-t border-slate-200/60 pt-4 grid grid-cols-2 gap-4 items-center min-h-[96px] bg-slate-50/50 rounded-xl p-4 border border-dashed border-slate-200">
                    
                    {/* Seal representation */}
                    <div className="text-left space-y-1">
                      {systemSettings.showSealOnInvoices && (
                        <div>
                          <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider mb-1">
                            {lang === 'ar' ? 'الختم الضريبي الرسمي للشركة:' : 'CORPORATE DIGITAL AUDIT SEAL:'}
                          </span>
                          {systemSettings.companySealUrl ? (
                            <div className="w-20 h-20 flex items-center justify-start overflow-hidden">
                              <img 
                                src={systemSettings.companySealUrl} 
                                alt="Official Corporation Seal" 
                                className="max-w-full max-h-full object-contain mix-blend-multiply opacity-95 rotate-[-2deg]"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-full border-4 border-double border-emerald-600/70 flex flex-col items-center justify-center p-1 text-emerald-600/85 font-bold uppercase rotate-[-3deg] text-[6px] select-none scale-90">
                              <span className="font-bold opacity-60">CORP AUDIT</span>
                              <span className="w-full border-t border-b border-emerald-600/30 font-extrabold truncate text-center my-0.5">{getBranchName(selectedAdjustment.branchId)}</span>
                              <span className="bg-emerald-600 text-white px-1 rounded font-extrabold text-[5px] scale-95 uppercase">APPROVED</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Signature representation */}
                    <div className="text-right space-y-1 text-right text-xs">
                      {systemSettings.showSignatureOnInvoices && (
                        <div>
                          <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider mb-1">
                            {lang === 'ar' ? 'توقيع المدير المعتمد للتدقيق:' : 'AUTHORIZED SPECIMEN SIGNATURE:'}
                          </span>
                          {systemSettings.authorizedSignatureUrl ? (
                            <div className="h-10 w-32 flex items-center justify-end overflow-hidden mb-1">
                              <img 
                                src={systemSettings.authorizedSignatureUrl} 
                                alt="Official Signature" 
                                className="max-h-full object-contain mix-blend-multiply opacity-95"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <p className="font-serif italic text-slate-650 font-bold text-sm rotate-[-1deg] border-b border-slate-200 border-dashed inline-block px-4 py-0.5">
                              {selectedAdjustment.createdBy}
                            </p>
                          )}
                          <span className="text-[7px] text-slate-400 block font-mono">
                            {lang === 'ar' ? 'الحالة الحالية: معتمدة ومطابقة كلياً دفترياً' : 'Ledger altered & synchronized with branches'}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 text-xxs font-bold">
              <span className="text-slate-400 font-mono">
                {lang === 'ar' ? 'موثق رقمياً بختم الشركة' : 'Secure corporate stamp applied'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const existing = document.getElementById('print-size-style');
                    if (existing) existing.remove();
                    const style = document.createElement('style');
                    style.id = 'print-size-style';
                    style.innerHTML = `@media print { @page { size: A4; margin: 15mm; } }`;
                    document.head.appendChild(style);
                    window.print();
                  }}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs rounded-xl transition duration-100 border-0 flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'طباعة / PDF' : 'Print / PDF'}</span>
                </button>
                <button
                  onClick={() => setSelectedAdjustment(null)}
                  className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer text-xs rounded-xl transition duration-100 border-0"
                >
                  {lang === 'ar' ? 'إغلاق المعاينة' : 'Dismiss Viewer'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
