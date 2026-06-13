import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, Customer, Branch, InvoiceStatus, UserRole, SystemSettings } from '../types';
import { 
  PlusCircle, 
  Search, 
  Trash2, 
  X, 
  FileText, 
  Printer, 
  Coins, 
  Banknote, 
  FileCheck2, 
  Plus, 
  User, 
  Calendar, 
  Check, 
  CreditCard 
} from 'lucide-react';

interface InvoicesModuleProps {
  invoices: Invoice[];
  filteredInvoices: Invoice[];
  customers: Customer[];
  branches: Branch[];
  createInvoice: (item: any) => Invoice;
  deleteInvoice: (id: string) => void;
  recordReceipt: (item: any) => any;
  lang: 'en' | 'ar';
  userRole?: UserRole;
  systemSettings: SystemSettings;
  quickActionTrigger?: string | null;
  clearQuickAction?: () => void;
}

export const InvoicesModule: React.FC<InvoicesModuleProps> = ({
  invoices,
  filteredInvoices,
  customers,
  branches,
  createInvoice,
  deleteInvoice,
  recordReceipt,
  lang,
  userRole,
  systemSettings,
  quickActionTrigger,
  clearQuickAction
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    // Dynamically retrieve configured grace due days from systemSettings
    const offset = systemSettings.defaultDueDays ?? 30;
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  });
  
  // Dynamic line items state for invoice wizard
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { description: 'Development Deliverables', descriptionAr: 'تسليمات برمجية', price: 2500, quantity: 1 }
  ]);

  // Invoice Detail Viewer State
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [layoutZoom, setLayoutZoom] = useState<number>(100);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);
  const [previewPaperSize, setPreviewPaperSize] = useState<'A4' | 'A5'>('A4');
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Pay Capture State in Invoice View Dialog
  const [showCollectForm, setShowCollectForm] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');
  const [collectMethod, setCollectMethod] = useState('Bank Transfer');
  const [collectNotes, setCollectNotes] = useState('');

  useEffect(() => {
    if (quickActionTrigger === 'CREATE_INVOICE') {
      setShowCreateModal(true);
      if (clearQuickAction) clearQuickAction();
    }
  }, [quickActionTrigger, clearQuickAction]);

  // Currency utility based on dynamic primaryCurrency settings
  const getCurrencySymbol = () => {
    const curr = systemSettings.primaryCurrency || 'USD';
    switch (curr) {
      case 'OMR': return lang === 'ar' ? ' ر.ع' : ' OMR';
      case 'SAR': return lang === 'ar' ? ' ر.س' : ' SAR';
      case 'EUR': return ' €';
      case 'USD':
      default: return ' $';
    }
  };

  const formatWithCurrency = (val: number) => {
    const sym = getCurrencySymbol();
    const formatted = val.toLocaleString('en-US', { minimumFractionDigits: 2 });
    // In Arabic format, SAR/OMR suffix looks cleaner on left/right depending on structure
    if ((systemSettings.primaryCurrency === 'SAR' || systemSettings.primaryCurrency === 'OMR') && lang === 'ar') {
      return `${formatted}${sym}`;
    }
    return `${sym}${formatted}`;
  };

  const getCustomer = (cusId: string) => {
    return customers.find(c => c.id === cusId) || { name: 'Direct Client', nameAr: 'عميل مباشر', code: 'DC', contactEmail: 'info@directclient.com' };
  };

  const getBranchName = (brId: string) => {
    const b = branches.find(item => item.id === brId);
    if (!b) return '-';
    return lang === 'ar' ? b.nameAr : b.name;
  };

  const calculateFormTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Add line item row to the builder
  const handleAddLineRow = () => {
    setLineItems(prev => [...prev, { description: '', descriptionAr: '', price: 0, quantity: 1 }]);
  };

  // Remove line item row from builder
  const handleRemoveLineRow = (idx: number) => {
    if (lineItems.length === 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLineValueChange = (idx: number, key: keyof InvoiceItem, val: string | number) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, [key]: val };
      }
      return item;
    }));
  };

  const handleSaveInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.some(item => !item.description || item.price <= 0 || item.quantity <= 0)) return;

    createInvoice({
      customerId: selectedCustomerId,
      branchId: selectedBranchId,
      issueDate,
      dueDate,
      items: lineItems,
      status: 'Unpaid'
    });

    // Reset wizard
    setLineItems([{ description: 'Development Deliverables', descriptionAr: 'تسليمات برمجية', price: 2500, quantity: 1 }]);
    setShowCreateModal(false);
  };

  // Record a payment directly inside the Invoice Detail Dialog
  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewInvoice || !collectAmount) return;

    const amt = parseFloat(collectAmount);
    if (amt <= 0 || amt > (viewInvoice.totalAmount - viewInvoice.paidAmount)) return;

    recordReceipt({
      invoiceId: viewInvoice.id,
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: collectMethod,
      branchId: viewInvoice.branchId,
      notes: collectNotes || `Collection receipt for ${viewInvoice.invoiceNumber}`
    });

    // Trigger state updating inside current detail view frame so the client sees updates immediately
    const updatedPaid = viewInvoice.paidAmount + amt;
    const isCompleted = updatedPaid >= viewInvoice.totalAmount;
    
    setViewInvoice(prev => {
      if (!prev) return null;
      return {
        ...prev,
        paidAmount: updatedPaid,
        status: isCompleted ? 'Paid' : 'Partial'
      };
    });

    // Reset Collect form
    setCollectAmount('');
    setCollectNotes('');
    setShowCollectForm(false);
  };

  // Filter processes
  const processedData = filteredInvoices.filter(item => {
    const customer = getCustomer(item.customerId);
    const matchSearch = customer.name.toLowerCase().includes(search.toLowerCase()) || 
      customer.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      item.invoiceNumber.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-start" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Head section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mb-1">
            {lang === 'ar' ? 'إدارة وتوليد الفواتير الضريبية' : 'Receivables Billing Portal'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' ? 'توليد ومطابقة الفواتير مع حساب الضريبة ونسب التحصيل ومراجعة حواشي تسيير السيولة النقدية' : 'Draft professional invoices, distribute regional tax quotas, and confirm clearance slips.'}
          </p>
        </div>
        
        {/* Creation button trigger */}
        {(userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Accountant') && (
          <button
            onClick={() => {
              // Recalculate default due date dynamically when opening modal
              const d = new Date();
              const offset = systemSettings.defaultDueDays ?? 30;
              d.setDate(d.getDate() + offset);
              setDueDate(d.toISOString().split('T')[0]);
              setIssueDate(new Date().toISOString().split('T')[0]);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 duration-150 text-xs shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إصدار فاتورة جديدة' : 'Issue New Invoice'}</span>
          </button>
        )}
      </div>

      {/* Search and filters bar */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={lang === 'ar' ? 'البحث عن طريق العميل، رقم الفاتورة أو رمز المطالبة...' : 'Find by customer name, ref prefix, identifier...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 text-xs rounded-xl ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 outline-none font-sans shadow-sm`}
          />
          <Search className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
        </div>

        {/* State Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 text-xs rounded-xl p-2.5 outline-none shadow-sm font-sans"
          >
            <option value="all">{lang === 'ar' ? 'جميع المطالبات المالية' : 'All Ledger Bill statuses'}</option>
            <option value="Unpaid">{lang === 'ar' ? 'مستحقة للدفع (غير مسددة)' : 'Outstanding / Unpaid'}</option>
            <option value="Partial">{lang === 'ar' ? 'مسددة جزئياً' : 'Partial Settlements'}</option>
            <option value="Paid">{lang === 'ar' ? 'مسواة بالكامل (مدفوعة)' : 'Paid / Settled'}</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden animate-fade-in">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left font-sans border-collapse" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-xxs font-bold uppercase tracking-wider text-slate-500 text-start">
                <th className="py-4 px-5">{lang === 'ar' ? 'رقم الفاتورة والعميل المعني' : 'Invoice Reference'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'الفرع المصدر' : 'Issuing Branch'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'القيمة الشاملة' : 'Billing Amount'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'المحصل الموثق' : 'Collected Credit'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'الحالة المالية' : 'Payment Status'}</th>
                <th className="py-4 px-5 text-center">{lang === 'ar' ? 'توصيل وتدقيق' : 'Inspect'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {processedData.map((item) => {
                const customer = getCustomer(item.customerId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 duration-100 text-xs">
                    <td className="py-4 px-5 font-sans text-start">
                      <div>
                        <span className="font-mono text-slate-400 font-semibold block">{item.invoiceNumber}</span>
                        <span className="font-bold text-slate-800 mt-1 block">
                          {lang === 'ar' ? customer.nameAr : customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-start">
                      <span className="text-xxs font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                        {getBranchName(item.branchId)}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-slate-800 text-start">
                      {formatWithCurrency(item.totalAmount)}
                    </td>
                    <td className="py-4 px-5 font-mono text-emerald-600 font-semibold text-start">
                      {formatWithCurrency(item.paidAmount)}
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-500 text-start">
                      {item.dueDate}
                    </td>
                    <td className="py-4 px-5 text-start">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                        item.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        item.status === 'Partial' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        <span>
                          {item.status === 'Paid' ? (lang === 'ar' ? 'مدفوعة كاملة' : 'Paid') :
                           item.status === 'Partial' ? (lang === 'ar' ? 'مدفوعة جزئياً' : 'Partial') :
                           (lang === 'ar' ? 'مستحقة للدفع' : 'Unpaid')}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => setViewInvoice(item)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-emerald-600 hover:text-emerald-700 rounded-lg text-xxs font-bold transition flex items-center justify-center space-x-1 space-x-reverse cursor-pointer border border-slate-200 shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'عرض السند' : 'Detail'}</span>
                        </button>
                        
                        {/* Dynamic Delete restriction check */}
                        {((systemSettings.restrictInvoiceDeletion ? userRole === 'Super Admin' : (userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Accountant'))) && (
                          <button
                            onClick={() => deleteInvoice(item.id)}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg duration-100 cursor-pointer inline-flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {processedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs font-sans">
                    {lang === 'ar' ? 'لا توجد فواتير مطابقة للبحث.' : 'No invoices matched billing filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice creation Wizard Drawer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar animate-slide-in text-slate-800" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* Close button icon */}
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 flex items-center justify-center duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-850 text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2 text-start">
              <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{lang === 'ar' ? 'إنشاء فاتورة محاسبية جديدة' : 'Compile Corporate Invoice Document'}</span>
            </h3>

            {/* Creation Wizard Form */}
            <form onSubmit={handleSaveInvoiceSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer client target selection */}
                <div>
                  <label className="text-slate-505 text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'العميل المدين المستلم:' : 'Target Debtor Client:'}</label>
                  <div className="relative">
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-700 p-2.5 rounded-xl outline-none shadow-sm font-sans"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {lang === 'ar' ? `${c.code} - ${c.nameAr}` : `${c.code} - ${c.name}`}
                        </option>
                      ))}
                    </select>
                    <User className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none`} />
                  </div>
                </div>

                {/* Issuing Branch hub selection */}
                <div>
                  <label className="text-slate-505 text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الفرع الإقليمي المصدر:' : 'Issuing Regional Hub:'}</label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 p-2.5 rounded-xl outline-none shadow-sm font-sans"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {lang === 'ar' ? b.nameAr : b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Issue Date */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'تاريخ كشف الفاتورة:' : 'Billing issue date:'}</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 p-2.5 rounded-xl outline-none font-mono shadow-sm"
                    />
                    <Calendar className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none`} />
                  </div>
                </div>

                {/* Due Credit cycle Date */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'تاريخ الحلول والاستحقاق المعتمد:' : 'Due date block:'}</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 p-2.5 rounded-xl outline-none font-mono shadow-sm"
                    />
                    <Calendar className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none`} />
                  </div>
                </div>
              </div>

              {/* Line items dynamic list builder */}
              <div className="space-y-3.5 border-t border-slate-100 pt-4 text-start">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 block">{lang === 'ar' ? 'بنود التكليف والخدمات المدرجة:' : 'Services Item list ledger:'}</h4>
                  <button
                    type="button"
                    onClick={handleAddLineRow}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-xxs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'إضافة خدمة' : 'Append row'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {lineItems.map((line, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200 items-end">
                      
                      {/* Description En */}
                      <div className="flex-1 min-w-0">
                        <label className="text-xxs text-slate-400 block mb-0.5">{lang === 'ar' ? 'الوصف بالإنجليزية' : 'Description (English)'}</label>
                        <input
                          type="text"
                          required
                          value={line.description}
                          placeholder="Web design / Cloud setup"
                          onChange={(e) => handleLineValueChange(idx, 'description', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xxs rounded-lg p-2 outline-none"
                        />
                      </div>

                      {/* Description Ar */}
                      <div className="flex-1 min-w-0">
                        <label className="text-xxs text-slate-400 block mb-0.5">{lang === 'ar' ? 'الوصف بالعربية' : 'Description (Arabic)'}</label>
                        <input
                          type="text"
                          required
                          value={line.descriptionAr}
                          placeholder="تصميم موقع / تهيئة سحابية"
                          onChange={(e) => handleLineValueChange(idx, 'descriptionAr', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xxs rounded-lg p-2 outline-none font-sans"
                        />
                      </div>

                      {/* Price input */}
                      <div className="w-20">
                        <label className="text-xxs text-slate-400 block mb-0.5">{lang === 'ar' ? 'السعر' : 'Price'}</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={line.price || ''}
                          onChange={(e) => handleLineValueChange(idx, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xxs font-mono rounded-lg p-2 outline-none"
                        />
                      </div>

                      {/* Qty */}
                      <div className="w-14">
                        <label className="text-xxs text-slate-400 block mb-0.5">{lang === 'ar' ? 'الكمية' : 'Qty'}</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleLineValueChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xxs font-mono rounded-lg p-2 outline-none"
                        />
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveLineRow(idx)}
                        disabled={lineItems.length === 1}
                        className="p-1.5 mb-0.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer inline-flex items-center justify-center hover:bg-rose-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live tax calculations based on VAT settings */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-mono text-xxs text-slate-500 shadow-inner">
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'المجموع الأساسي المستحق:' : 'Taxable Subtotal:'}</span>
                  <span className="font-bold text-slate-700">{formatWithCurrency(calculateFormTotal())}</span>
                </div>
                {systemSettings.vatCompliance && (
                  <div className="flex justify-between text-slate-500">
                    <span>{lang === 'ar' ? `ضريبة القيمة المضافة (${systemSettings.vatRatePct || 15}%):` : `VAT Tax (${systemSettings.vatRatePct || 15}%):`}</span>
                    <span className="font-bold text-slate-700">+{formatWithCurrency(calculateFormTotal() * (systemSettings.vatRatePct ?? 15) / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-xs font-bold text-emerald-600">
                  <span>{lang === 'ar' ? 'إجمالي قيمة الفاتورة المصدرة:' : 'Issued Invoice Gross Total:'}</span>
                  <span>{formatWithCurrency(systemSettings.vatCompliance ? calculateFormTotal() * (1 + (systemSettings.vatRatePct ?? 15) / 100) : calculateFormTotal())}</span>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl transition duration-100 cursor-pointer text-center text-xs"
                >
                  {lang === 'ar' ? 'إلغاء المطالبة' : 'Discard Invoice'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer text-center shadow-md shadow-emerald-600/10 text-xs"
                >
                  {lang === 'ar' ? 'تأكيد وإصدار الفاتورة' : 'Approve & Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable View Detail Dialog */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full p-6 shadow-2xl relative max-h-[95vh] flex flex-col overflow-hidden text-slate-800" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* Close */}
            <button
              onClick={() => setViewInvoice(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 flex items-center justify-center duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2 flex items-center gap-2 text-start shrink-0">
              <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{lang === 'ar' ? 'منصة تدقيق المخطط ومعاينة الطباعة للفاتورة' : 'Invoice Live Printing Layout verification desk'}</span>
            </h3>

            {/* Split work environment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden text-start">
              
              {/* Left Column: Interactive Audit Workspace Controls */}
              <div className="lg:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-4 shrink-0">
                <div className="space-y-4 text-xs">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block font-mono">
                      {lang === 'ar' ? 'منصة تدقيق المخطط والطباعة' : 'LAYOUT PROOFING STATION'}
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-[10px]">
                      {lang === 'ar' ? 'ضوابط التحقق من قياسات الصفحة والطباعة' : 'Verify physical formatting parameters'}
                    </h4>
                  </div>

                  {/* Sandbox Print restrictions notice banner */}
                  {isInsideIframe && (
                    <div className="bg-amber-50/80 border border-amber-200/95 rounded-xl p-3 text-[10px] text-amber-800 space-y-1 leading-normal no-print">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span>{lang === 'ar' ? 'توضيح أمن المتصفح للطباعة:' : 'Browser Sandbox Notice:'}</span>
                      </div>
                      <p className="text-[9px] text-slate-600 leading-tight">
                        {lang === 'ar' 
                          ? 'تمنع حمايات المتصفح الحديثة المزامنة والطباعة من داخل الإطارات الفرعية (IFRAME). للطباعة، يرجى تشغيل المنصة في نافذة مستقلة عن طريق الضغط على زر "فتح نافذة جديدة" بمؤشر المتصفح في الأعلى.'
                          : 'Desktop browsers block printing inside sandboxed iframe previews. To print, please click the "Open in new tab" icon in the top header menu to launch the application full screen.'}
                      </p>
                    </div>
                  )}

                  {/* Paper size setting */}
                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-500 uppercase block">
                      {lang === 'ar' ? 'تحديد قياس الصفحة المستهدف:' : 'Target Paper Size:'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewPaperSize('A4')}
                        className={`py-1.5 px-3 rounded-lg border text-xxs font-bold duration-100 cursor-pointer ${
                          previewPaperSize === 'A4'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-755 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        A4 Format (Port)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewPaperSize('A5')}
                        className={`py-1.5 px-3 rounded-lg border text-xxs font-bold duration-100 cursor-pointer ${
                          previewPaperSize === 'A5'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-755 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        A5 Compact
                      </button>
                    </div>
                  </div>

                  {/* Zoom controller */}
                  <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-xxs">
                      <span className="font-bold text-slate-500 uppercase">{lang === 'ar' ? 'مقياس المعاينة البصرية:' : 'Virtual Scale Zoom:'}</span>
                      <span className="font-mono text-emerald-600 font-bold">{layoutZoom}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="120"
                      value={layoutZoom}
                      onChange={(e) => setLayoutZoom(Number(e.target.value))}
                      className="w-full accent-emerald-600 bg-slate-200 h-1 rounded cursor-pointer"
                    />
                    <p className="text-[8px] text-slate-400">
                      {lang === 'ar' ? 'لا يؤثر التكبير البصري على حجم الفاتورة المطبوعة الفعلي' : 'Visual scaling only. Fits layout preview smoothly to check alignments'}
                    </p>
                  </div>

                  {/* Layout Helper Lines guidelines */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xxs font-bold text-slate-700 uppercase">{lang === 'ar' ? 'خطوط توجيه المحاذاة:' : 'Page Margin Guides:'}</span>
                      <button
                        type="button"
                        onClick={() => setShowGuidelines(!showGuidelines)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          showGuidelines ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          showGuidelines ? (lang === 'ar' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    <p className="text-[8px] text-slate-400 leading-tight">
                      {lang === 'ar' ? 'إظهار شبكة وهوامش توجيهية لقياس كفاءة محاذاة البيانات بالمستصف المالي' : 'Draw margins layout helper grids around elements on the screen (auto-hidden when printing)'}
                    </p>
                  </div>

                  {/* Print checklist */}
                  <div className="space-y-1.5">
                    <span className="text-xxs font-bold text-slate-500 uppercase block">{lang === 'ar' ? 'تأكيد سلامة المخطط:' : 'Pre-flight Spec Check:'}</span>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-[9px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{lang === 'ar' ? 'شعار الجهة المصدرة وقنوات التواصل مدققة' : 'Brand header and phone aligned'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{lang === 'ar' ? 'الرقم الموحد والضريبي للمطالبة معتمد' : 'Tax Registration ID visible'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{lang === 'ar' ? 'ختم الاعتماد وشروط السداد مدرجة' : 'Seal & Terms and Conditions rendered'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outstanding Payment Capture nested inside workspace */}
                {viewInvoice.status !== 'Paid' && (userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Accountant') && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xxs mt-auto shrink-0 shadow-sm">
                    {!showCollectForm ? (
                      <button
                        onClick={() => {
                          setCollectAmount((viewInvoice.totalAmount - viewInvoice.paidAmount).toString());
                          setShowCollectForm(true);
                        }}
                        className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xxs rounded-lg flex items-center justify-center gap-1.5 duration-100 cursor-pointer shadow-sm border-0 animate-none"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تسجيل دفعة سداد' : 'Record Payment Invoice'}</span>
                      </button>
                    ) : (
                      <form onSubmit={handleCollectSubmit} className="space-y-2 text-xxs animate-none">
                        <h4 className="font-bold text-slate-705 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-emerald-600 animate-none" />
                          <span>{lang === 'ar' ? 'بيانات تدوين الدفعة' : 'Record custom receipt step'}</span>
                        </h4>
                        
                        <div className="space-y-1 animate-none">
                          <label className="text-slate-400 block font-semibold">{lang === 'ar' ? 'المبلغ' : 'Amount'}</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            max={viewInvoice.totalAmount - viewInvoice.paidAmount}
                            value={collectAmount}
                            onChange={(e) => setCollectAmount(e.target.value)}
                            className="w-full bg-slate-55 border border-slate-205 text-slate-800 p-1.5 rounded-md font-mono text-xxs bg-white animate-none"
                          />
                        </div>

                        <div className="space-y-1 animate-none">
                          <label className="text-slate-400 block font-semibold">{lang === 'ar' ? 'قناة الاستلام' : 'Method'}</label>
                          <select
                            value={collectMethod}
                            onChange={(e) => setCollectMethod(e.target.value)}
                            className="w-full bg-slate-55 border border-slate-205 text-slate-705 p-1 rounded-md text-xxs bg-white animate-none"
                          >
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="Corporate Credit">Corporate Credit</option>
                          </select>
                        </div>

                        <div className="space-y-1 animate-none">
                          <label className="text-slate-400 block font-semibold">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</label>
                          <textarea
                            value={collectNotes}
                            onChange={(e) => setCollectNotes(e.target.value)}
                            placeholder={lang === 'ar' ? 'ملاحظات الدفعة المستلمة...' : 'Receipt notes...'}
                            rows={2}
                            className="w-full bg-slate-55 border border-slate-205 text-slate-800 p-1.5 rounded-md text-xxs bg-white animate-none outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="flex gap-1 justify-end pt-1 animate-none">
                          <button
                            type="button"
                            onClick={() => setShowCollectForm(false)}
                            className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] cursor-pointer"
                          >
                            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>
                          <button
                            type="submit"
                            className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[9px] cursor-pointer"
                          >
                            {lang === 'ar' ? 'حفظ' : 'Collect'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Physical Paper Stage Preview Wrapper */}
              <div className="lg:col-span-8 bg-slate-100 rounded-xl border border-slate-200 p-6 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start min-h-[350px]">
                
                {/* Visual simulator guide bar */}
                <span className="mb-3 text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono flex items-center gap-1 tracking-wider uppercase font-bold text-center select-none">
                  <span>Paper Simulated Viewport:</span>
                  <strong className="text-emerald-400">{previewPaperSize} LIMITS</strong>
                  <span>| Scale:</span>
                  <strong>{layoutZoom}%</strong>
                </span>

                {/* Simulated Sheet container */}
                <div 
                  className="w-full transition-all duration-150 origin-top" 
                  style={{ transform: `scale(${layoutZoom / 100})`, transformOrigin: 'top center' }}
                >
                  
                  {/* THE REAL PRINTABLE CORE DOCUMENT BLOCK */}
                  <div className={`printable-area bg-white text-slate-705 p-6 rounded-xl border space-y-6 font-sans text-start shadow-xl relative ${
                    showGuidelines ? 'outline-dashed outline-2 outline-emerald-500/50 outline-offset-1 ring-4 ring-emerald-500/5 bg-slate-100' : 'border-slate-200'
                  }`}>
                    
                    {/* Visual markers for guidelines */}
                    {showGuidelines && (
                      <div className="absolute top-0 left-0 right-0 h-4 border-b border-dashed border-red-400 flex items-center justify-between px-2 text-[7px] text-red-750 select-none z-10 bg-red-50/85">
                        <span>Top Margin Guide (15mm)</span>
                        <span>Alignment: Grid OK</span>
                      </div>
                    )}

              
              {/* Header block logo / info */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 uppercase font-mono tracking-widest">{viewInvoice.invoiceNumber}</h4>
                  <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'الرمز التعريفي للمطالبة:' : 'Electronic Billing Reference:'} {viewInvoice.id}</p>
                </div>
                
                {/* Dynamically loads company branding parameters from systemSettings */}
                <div className="text-right">
                  {systemSettings.logoUrl ? (
                    <div className="mb-1.5 flex justify-end">
                      <img 
                        src={systemSettings.logoUrl} 
                        alt="Company Logo" 
                        className="h-10 max-w-[140px] object-contain rounded-lg shadow-sm border border-slate-100 bg-white p-1"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-emerald-600 text-white flex items-center justify-center rounded-lg font-mono font-bold text-xs shadow shadow-emerald-600/10 ml-auto mr-0 animate-pulse">
                      {(systemSettings.companyName || 'N')[0]}
                    </div>
                  )}
                  <span className="text-xs text-slate-800 tracking-wider uppercase font-bold block mt-1.5">
                    {lang === 'ar' ? systemSettings.companyNameAr : systemSettings.companyName}
                  </span>
                </div>
              </div>

              {/* Metadata block dates / clients */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xxs">
                <div className="space-y-2">
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase">{lang === 'ar' ? 'من الجهة المصدرة التجارية:' : 'Issued From Treasury:'}</span>
                    <span className="font-bold text-slate-800 block text-[11px] mt-0.5">{lang === 'ar' ? systemSettings.companyNameAr : systemSettings.companyName}</span>
                    <span className="text-slate-500 block truncate leading-tight mt-0.5">
                      {lang === 'ar' ? systemSettings.companyAddressAr : systemSettings.companyAddress}
                    </span>
                    <span className="text-slate-400 block font-mono mt-0.5">{systemSettings.companyPhone} | {systemSettings.companyEmail}</span>
                    <span className="text-emerald-600 font-mono font-bold block mt-0.5">{lang === 'ar' ? 'الرقم الضريبي الموحد:' : 'Tax Registration ID:'} {systemSettings.registrationNo}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase">{lang === 'ar' ? 'العميل المدين الموجه له:' : 'Billed To Customer:'}</span>
                    <span className="text-slate-800 block font-bold text-[11px] mt-0.5">{lang === 'ar' ? getCustomer(viewInvoice.customerId).nameAr : getCustomer(viewInvoice.customerId).name}</span>
                    <span className="text-slate-400 block truncate mt-0.5">{getCustomer(viewInvoice.customerId).contactEmail}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200/50 space-y-0.5 text-slate-600">
                    <p><span className="text-slate-400">{lang === 'ar' ? 'تاريخ التكليف:' : 'Issue Date:'}</span> <strong className="text-slate-700">{viewInvoice.issueDate}</strong></p>
                    <p><span className="text-slate-400">{lang === 'ar' ? 'تاريخ الاستحقاق:' : 'Due Date:'}</span> <strong className="text-slate-800">{viewInvoice.dueDate}</strong></p>
                    <p><span className="text-slate-400">{lang === 'ar' ? 'الفرع المستحق:' : 'Branch Audited:'}</span> <strong className="text-slate-700">{getBranchName(viewInvoice.branchId)}</strong></p>
                  </div>
                </div>
              </div>

              {/* Items grid */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xxs shadow-sm">
                <div className="bg-slate-100/80 border-b border-slate-200 px-4 py-2 text-slate-500 font-bold uppercase tracking-wider text-start grid grid-cols-4 select-none">
                  <div className="col-span-2">{lang === 'ar' ? 'البند والخدمة المعنية' : 'Service Item'}</div>
                  <div className="text-center">{lang === 'ar' ? 'القيمة الإفرادية' : 'Rate'}</div>
                  <div className="text-center">{lang === 'ar' ? 'الكمية' : 'Qty'}</div>
                </div>
                <div className="divide-y divide-slate-100 bg-white text-slate-700">
                  {viewInvoice.items.map((line, idx) => (
                    <div key={idx} className="px-4 py-2.5 grid grid-cols-4 items-center">
                      <div className="col-span-2 text-start">
                        <span className="font-bold text-slate-805">{lang === 'ar' ? line.descriptionAr : line.description}</span>
                      </div>
                      <div className="text-center font-mono font-medium text-slate-600">
                        {formatWithCurrency(line.price)}
                      </div>
                      <div className="text-center font-mono font-medium text-slate-600">{line.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end border-t border-slate-150 pt-4 text-xxs font-mono text-slate-650 shrink-0 select-none">
                <div className="w-56 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-xs">
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'إجمالي الدفعات المقبوضة:' : 'Aggregate Payments Credit:'}</span>
                    <span className="text-emerald-600 font-semibold font-mono">
                      {formatWithCurrency(viewInvoice.paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'دائن مفتوح ومكشوف:' : 'Outstanding Owed Debt:'}</span>
                    <span className="text-rose-600 font-semibold font-mono">
                      {formatWithCurrency(viewInvoice.totalAmount - viewInvoice.paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 text-slate-900 font-black">
                    <span>{lang === 'ar' ? 'المجموع المستحق المفوتر:' : 'Billing Gross Sum:'}</span>
                    <span className="text-slate-850 font-mono">
                      {formatWithCurrency(viewInvoice.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stamp & Authorized signing */}
              {(systemSettings.showSealOnInvoices || systemSettings.showSignatureOnInvoices) && (
                <div className="border-t border-slate-200/80 pt-4 grid grid-cols-2 gap-4 items-center min-h-[96px] bg-white rounded-xl p-4 border border-slate-100">
                  
                  {/* Left: Official Circular Stamp / Seal */}
                  <div className="flex justify-start items-center">
                    {systemSettings.showSealOnInvoices && (
                      <div className="relative">
                        {systemSettings.companySealUrl ? (
                          <div className="w-24 h-24 flex items-center justify-center overflow-hidden">
                            <img 
                              src={systemSettings.companySealUrl} 
                              alt="Official Corporation Seal" 
                              className="max-w-full max-h-full object-contain mix-blend-multiply opacity-95 rotate-[-4deg]"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          /* Beautifully crafted CSS official audit stamp */
                          <div 
                            className="w-24 h-24 rounded-full border-4 border-double border-emerald-600/90 bg-emerald-50/10 flex flex-col items-center justify-center text-center p-2 text-emerald-600/95 font-bold uppercase rotate-[-6deg] select-none shadow-sm/5 shrink-0"
                            style={{ fontSize: '7px', lineHeight: '1.1' }}
                          >
                            <span className="tracking-widest block font-bold text-[6px] opacity-75">{lang === 'ar' ? 'البوابة المالية للمطابقة' : 'NEXUS FINANCE AUDIT'}</span>
                            <div className="w-full border-t border-b border-emerald-600/50 py-0.5 my-1 text-[8px] font-extrabold tracking-tight truncate max-w-full px-0.5">
                              {lang === 'ar' 
                                ? (systemSettings.companySealNameAr || 'خزينة نكسس') 
                                : (systemSettings.companySealName || 'NEXUS GROUP')}
                            </div>
                            <span className="text-[6px] bg-emerald-600 text-white rounded px-1 scale-90 py-0.2 block max-w-full truncate">{lang === 'ar' ? 'ختم معتمد' : 'APPROVED'}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Signature Pad / Hand-writing sign */}
                  <div className="flex flex-col items-end text-right">
                    {systemSettings.showSignatureOnInvoices && (
                      <div className="space-y-1">
                        <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">
                          {lang === 'ar' ? 'التوقيع المعتمد للإدارة المالية:' : 'Finance Authorized Signatory:'}
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
                          /* Stylized premium handwriting signature mockup */
                          <div className="font-serif italic text-sm font-bold text-slate-700 opacity-80 py-1 pr-4 pl-8 border-b border-dashed border-slate-300 inline-block rotate-[-2deg] select-none">
                            {lang === 'ar' 
                              ? (systemSettings.authorizedSignatureNameAr || 'التوقيع المعتمد')
                              : (systemSettings.authorizedSignatureName ? systemSettings.authorizedSignatureName.slice(0, 20) + '...' : 'Nexus Finance Auth')}
                          </div>
                        )}
                        
                        <span className="text-[9px] text-slate-600 font-bold block mt-1">
                          {lang === 'ar' 
                            ? (systemSettings.authorizedSignatureNameAr || 'المدير الإقليمي للعمليات الخارجية') 
                            : (systemSettings.authorizedSignatureName || 'Authorized Corporate Audit Officer')}
                        </span>
                        <span className="text-[7px] text-slate-400 font-mono block tracking-tight uppercase leading-none">
                          {lang === 'ar' ? 'هوية المعاملة موثقة إلكترونياً' : 'E-transaction sealed & dispatched'}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Custom registered Terms and conditions from systemSettings */}
              {(systemSettings.invoiceFooterTerms || systemSettings.invoiceFooterTermsAr) && (
                <div className="mt-4 pt-3 border-t border-slate-200 text-[9px] text-slate-400 leading-normal italic text-start">
                  <span className="font-bold uppercase block not-italic mb-1 text-slate-500">
                    {lang === 'ar' ? 'شروط وإخلاء المسؤولية المعتمدة:' : 'Approved Terms & Conditions:'}
                  </span>
                  <p className="leading-relaxed">
                    {lang === 'ar' ? systemSettings.invoiceFooterTermsAr : systemSettings.invoiceFooterTerms}
                  </p>
                </div>
              )}

            </div>

                </div>

              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="mt-4 pt-3 border-t border-slate-150 flex justify-between items-center text-xxs font-mono text-slate-400 shrink-0">
              <span className="flex items-center gap-1.5 font-bold text-slate-550">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span>{lang === 'ar' ? 'التخطيط جاهز للطباعة ومتوافق مع قياس الورقة' : 'Verification Complete. Press button to route to network printer'}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const existing = document.getElementById('print-size-style');
                    if (existing) existing.remove();
                    const style = document.createElement('style');
                    style.id = 'print-size-style';
                    // Sets print layout based on current selected preview paper format size!
                    style.innerHTML = `@media print { @page { size: ${previewPaperSize}; margin: 10mm; } }`;
                    document.head.appendChild(style);
                    window.print();
                  }}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer text-xs rounded-xl transition duration-100 border-0 flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تأكيد وطباعة الفاتورة' : 'Print Invoice Statement'}</span>
                </button>
                <button
                  onClick={() => setViewInvoice(null)}
                  className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer text-xs rounded-xl transition duration-100 border-0"
                >
                  {lang === 'ar' ? 'إلغاء المعاينة' : 'Exit Proofing'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
