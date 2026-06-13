import React, { useState } from 'react';
import { Vendor, Payable, PayablePayment, Branch, UserRole, SystemSettings, InvoiceStatus } from '../types';
import { 
  PlusCircle, 
  Search, 
  X, 
  Edit, 
  Trash2,
  Mail, 
  Phone, 
  MapPin, 
  Folder,
  Coins,
  CheckCircle2,
  AlertCircle,
  Building,
  Plus,
  Calendar,
  FileText
} from 'lucide-react';

interface PayablesModuleProps {
  vendors: Vendor[];
  payables: Payable[];
  filteredPayables: Payable[];
  payablePayments: PayablePayment[];
  filteredPayablePayments: PayablePayment[];
  branches: Branch[];
  addVendor: (item: Omit<Vendor, 'id'>) => Promise<Vendor>;
  editVendor: (item: Vendor) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  addPayable: (item: Omit<Payable, 'id' | 'paidAmount' | 'status'>) => Promise<Payable>;
  deletePayable: (id: string) => Promise<void>;
  recordPayablePayment: (item: Omit<PayablePayment, 'id'>) => Promise<PayablePayment>;
  deletePayablePayment: (id: string) => Promise<void>;
  lang: 'en' | 'ar';
  userRole?: UserRole;
  systemSettings: SystemSettings;
}

export const PayablesModule: React.FC<PayablesModuleProps> = ({
  vendors,
  payables,
  filteredPayables,
  payablePayments,
  filteredPayablePayments,
  branches,
  addVendor,
  editVendor,
  deleteVendor,
  addPayable,
  deletePayable,
  recordPayablePayment,
  deletePayablePayment,
  lang,
  userRole,
  systemSettings
}) => {
  // Navigation Tabs: 'PAYABLES' | 'VENDORS'
  const [activeSubTab, setActiveSubTab] = useState<'PAYABLES' | 'VENDORS'>('PAYABLES');
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Drawer / details state
  const [activePayable, setActivePayable] = useState<Payable | null>(null);

  // Modals state
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  const [showPayableModal, setShowPayableModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Form inputs: Vendor
  const [vName, setVName] = useState('');
  const [vNameAr, setVNameAr] = useState('');
  const [vCode, setVCode] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vAddress, setVAddress] = useState('');
  const [vAddressAr, setVAddressAr] = useState('');

  // Form inputs: Payable
  const [pBillNumber, setPBillNumber] = useState('');
  const [pVendorId, setPVendorId] = useState('');
  const [pBranchId, setPBranchId] = useState('');
  const [pIssueDate, setPIssueDate] = useState('');
  const [pDueDate, setPDueDate] = useState('');
  const [pTotalAmount, setPTotalAmount] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pDescAr, setPDescAr] = useState('');

  // Form inputs: Payable Payment
  const [pmAmount, setPmAmount] = useState('');
  const [pmDate, setPmDate] = useState('');
  const [pmMethod, setPmMethod] = useState('Bank Transfer');
  const [pmNotes, setPmNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helpers
  const getVendorName = (vId: string) => {
    const v = vendors.find(item => item.id === vId);
    if (!v) return '-';
    return lang === 'ar' ? v.nameAr : v.name;
  };

  const getBranchName = (bId: string) => {
    const b = branches.find(item => item.id === bId);
    if (!b) return '-';
    return lang === 'ar' ? b.nameAr : b.name;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: systemSettings.primaryCurrency || 'SAR'
    }).format(amount);
  };

  // Vendor actions handlers
  const handleOpenCreateVendor = () => {
    setEditingVendor(null);
    setVName('');
    setVNameAr('');
    setVCode('');
    setVEmail('');
    setVPhone('');
    setVAddress('');
    setVAddressAr('');
    setErrorMsg(null);
    setShowVendorModal(true);
  };

  const handleOpenEditVendor = (v: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVendor(v);
    setVName(v.name);
    setVNameAr(v.nameAr);
    setVCode(v.code);
    setVEmail(v.contactEmail);
    setVPhone(v.phone);
    setVAddress(v.address);
    setVAddressAr(v.addressAr);
    setErrorMsg(null);
    setShowVendorModal(true);
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName || !vCode || !vEmail) return;

    setErrorMsg(null);
    const payload = {
      name: vName,
      nameAr: vNameAr || vName,
      code: vCode.toUpperCase().slice(0, 3),
      contactEmail: vEmail,
      phone: vPhone,
      address: vAddress,
      addressAr: vAddressAr || vAddress
    };

    try {
      if (editingVendor) {
        await editVendor({ ...editingVendor, ...payload });
      } else {
        await addVendor(payload);
      }
      setShowVendorModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save vendor details.');
    }
  };

  const handleDeleteVendor = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المورد نهائياً؟' : 'Are you sure you want to delete this vendor?')) {
      try {
        await deleteVendor(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete vendor.');
      }
    }
  };

  // Payable actions handlers
  const handleOpenCreatePayable = () => {
    if (vendors.length === 0) {
      alert(lang === 'ar' ? 'يرجى إضافة مورد أولاً قبل تسجيل فاتورة.' : 'Please add a vendor first before recording a bill.');
      return;
    }
    setPBillNumber(`BILL-${Date.now().toString().slice(-6)}`);
    setPVendorId(vendors[0].id);
    setPBranchId(branches[0]?.id || '');
    setPIssueDate(new Date().toISOString().split('T')[0]);
    setPDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setPTotalAmount('');
    setPDesc('');
    setPDescAr('');
    setErrorMsg(null);
    setShowPayableModal(true);
  };

  const handlePayableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pBillNumber || !pVendorId || !pBranchId || !pTotalAmount) return;

    setErrorMsg(null);
    const payload = {
      payableNumber: pBillNumber,
      vendorId: pVendorId,
      branchId: pBranchId,
      issueDate: pIssueDate,
      dueDate: pDueDate,
      totalAmount: parseFloat(pTotalAmount) || 0,
      description: pDesc,
      descriptionAr: pDescAr || pDesc
    };

    try {
      await addPayable(payload);
      setShowPayableModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save bill record.');
    }
  };

  const handleDeletePayable = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الالتزام نهائياً؟' : 'Are you sure you want to delete this payable record?')) {
      try {
        await deletePayable(id);
        if (activePayable?.id === id) {
          setActivePayable(null);
        }
      } catch (err: any) {
        alert(err.message || 'Failed to delete record.');
      }
    }
  };

  // Payment record handlers
  const handleOpenRecordPayment = () => {
    if (!activePayable) return;
    const remaining = Number(activePayable.totalAmount) - Number(activePayable.paidAmount);
    setPmAmount(remaining.toString());
    setPmDate(new Date().toISOString().split('T')[0]);
    setPmMethod('Bank Transfer');
    setPmNotes('');
    setErrorMsg(null);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePayable || !pmAmount) return;

    setErrorMsg(null);
    const amountVal = parseFloat(pmAmount);
    const remaining = Number(activePayable.totalAmount) - Number(activePayable.paidAmount);
    
    if (amountVal <= 0 || amountVal > remaining) {
      setErrorMsg(lang === 'ar' 
        ? 'يجب أن يكون مبلغ السداد أكبر من صفر ولا يتجاوز المبلغ المتبقي المستحق.' 
        : 'Payment amount must be greater than zero and cannot exceed the remaining due amount.');
      return;
    }

    const payload = {
      paymentNumber: `PAY-REC-${Date.now().toString().slice(-6)}`,
      payableId: activePayable.id,
      amount: amountVal,
      date: pmDate,
      paymentMethod: pmMethod,
      branchId: activePayable.branchId,
      notes: pmNotes
    };

    try {
      await recordPayablePayment(payload);
      
      // Update active local details state
      const updatedPaid = Number(activePayable.paidAmount) + amountVal;
      const updatedStatus: InvoiceStatus = updatedPaid >= Number(activePayable.totalAmount) ? 'Paid' : 'Partial';
      setActivePayable({
        ...activePayable,
        paidAmount: updatedPaid,
        status: updatedStatus
      });

      setShowPaymentModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save payment record.');
    }
  };

  const handleDeletePayment = async (payId: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا السداد؟' : 'Are you sure you want to delete this payment record?')) {
      try {
        const payment = payablePayments.find(p => p.id === payId);
        await deletePayablePayment(payId);
        
        if (activePayable && payment) {
          const updatedPaid = Math.max(0, Number(activePayable.paidAmount) - Number(payment.amount));
          const updatedStatus: InvoiceStatus = updatedPaid >= Number(activePayable.totalAmount) 
            ? 'Paid' 
            : (updatedPaid > 0 ? 'Partial' : 'Unpaid');
          
          setActivePayable({
            ...activePayable,
            paidAmount: updatedPaid,
            status: updatedStatus
          });
        }
      } catch (err: any) {
        alert(err.message || 'Failed to delete payment.');
      }
    }
  };

  // State filtering logic
  const filteredPayablesData = filteredPayables.filter(p => {
    const matchSearch = p.payableNumber.toLowerCase().includes(search.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.descriptionAr && p.descriptionAr.toLowerCase().includes(search.toLowerCase()));

    const matchVendor = vendorFilter === 'all' || p.vendorId === vendorFilter;
    const matchBranch = branchFilter === 'all' || p.branchId === branchFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchSearch && matchVendor && matchBranch && matchStatus;
  });

  const filteredVendorsData = vendors.filter(v => {
    return v.name.toLowerCase().includes(search.toLowerCase()) || 
      v.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.contactEmail.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 text-start font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Title area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in font-sans">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mb-1">
            {lang === 'ar' ? 'إدارة الحسابات الدائنة والالتزامات' : 'Accounts Payable Ledger'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' ? 'تسجيل فواتير الموردين والالتزامات المالية، وربطها بالمدفوعات والمستندات الدائنة' : 'Track vendor bills, payment disbursements, and outstanding payables.'}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          {(userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Manager') && (
            <>
              <button
                onClick={handleOpenCreateVendor}
                className="flex items-center space-x-1.5 space-x-reverse px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition duration-150 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>{lang === 'ar' ? 'مورد جديد' : 'New Vendor'}</span>
              </button>

              <button
                onClick={handleOpenCreatePayable}
                className="flex items-center space-x-1.5 space-x-reverse px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl shadow-sm transition duration-150 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>{lang === 'ar' ? 'تسجيل فاتورة مورد' : 'Record Vendor Bill'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => { setActiveSubTab('PAYABLES'); setSearch(''); }}
          className={`pb-3 font-sans text-xs font-bold transition-all relative ${
            activeSubTab === 'PAYABLES' ? 'text-emerald-600 font-semibold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          {lang === 'ar' ? 'فواتير الالتزامات المستحقة' : 'Bills & Payables'}
          {activeSubTab === 'PAYABLES' && <div className="absolute h-0.5 bg-emerald-600 bottom-0 left-0 right-0 rounded-t-md"></div>}
        </button>
        <button
          onClick={() => { setActiveSubTab('VENDORS'); setSearch(''); }}
          className={`pb-3 font-sans text-xs font-bold transition-all relative ${
            activeSubTab === 'VENDORS' ? 'text-emerald-600 font-semibold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          {lang === 'ar' ? 'سجل الموردين' : 'Suppliers & Vendors'}
          {activeSubTab === 'VENDORS' && <div className="absolute h-0.5 bg-emerald-600 bottom-0 left-0 right-0 rounded-t-md"></div>}
        </button>
      </div>

      {/* Filter and Content depending on Tab */}
      {activeSubTab === 'PAYABLES' ? (
        <>
          {/* Advanced filter row */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={lang === 'ar' ? 'البحث عن رقم الفاتورة أو الوصف...' : 'Search Bill # or notes...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 text-xs rounded-xl ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 outline-none font-sans shadow-sm`}
              />
              <Search className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
            </div>

            {/* Vendor Filter */}
            <div>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 text-xs rounded-xl p-2.5 outline-none shadow-sm"
              >
                <option value="all">{lang === 'ar' ? 'كل الموردين' : 'All Vendors'}</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{lang === 'ar' ? v.nameAr : v.name}</option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                disabled={userRole === 'Employee' || userRole === 'Manager'}
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 text-xs rounded-xl p-2.5 outline-none shadow-sm"
              >
                <option value="all">{lang === 'ar' ? 'جميع الفروع' : 'All Branches'}</option>
                {branches.map(br => (
                  <option key={br.id} value={br.id}>{lang === 'ar' ? br.nameAr : br.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 text-xs rounded-xl p-2.5 outline-none shadow-sm"
              >
                <option value="all">{lang === 'ar' ? 'كل حالات السداد' : 'All Statuses'}</option>
                <option value="Unpaid">{lang === 'ar' ? 'غير مدفوع' : 'Unpaid'}</option>
                <option value="Partial">{lang === 'ar' ? 'مدفوع جزئياً' : 'Partial'}</option>
                <option value="Paid">{lang === 'ar' ? 'مدفوع بالكامل' : 'Paid'}</option>
              </select>
            </div>
          </div>

          {/* Grid Layout splits into drawer list */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start font-sans">
            <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPayablesData.map((payable) => {
                const isActive = activePayable?.id === payable.id;
                const remaining = Number(payable.totalAmount) - Number(payable.paidAmount);

                return (
                  <div
                    key={payable.id}
                    onClick={() => setActivePayable(payable)}
                    className={`flex flex-col justify-between p-5 bg-white rounded-2xl cursor-pointer border ${
                      isActive 
                        ? 'border-emerald-500 bg-emerald-50/5 shadow' 
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                    } duration-150 relative overflow-hidden group text-start`}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div>
                          <strong className="text-xs font-bold font-mono text-slate-800 uppercase block">{payable.payableNumber}</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{getVendorName(payable.vendorId)}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                            payable.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            payable.status === 'Partial' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                            'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {lang === 'ar' 
                              ? (payable.status === 'Paid' ? 'مسدد' : (payable.status === 'Partial' ? 'جزئي' : 'غير مسدد')) 
                              : payable.status}
                          </span>

                          {(userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Manager') && (
                            <button
                              onClick={(e) => handleDeletePayable(payable.id, e)}
                              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center cursor-pointer duration-150 border border-slate-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xxs text-slate-500 line-clamp-1 mb-4">
                        {lang === 'ar' ? payable.descriptionAr : payable.description}
                      </p>
                    </div>

                    {/* Financial details */}
                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xxs font-mono">
                      <div>
                        <span className="text-slate-400 block leading-tight">{lang === 'ar' ? 'الالتزام الكلي' : 'Total Bill'}</span>
                        <strong className="text-slate-800 font-bold font-mono text-xs mt-0.5 block">{formatCurrency(payable.totalAmount)}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block leading-tight">{lang === 'ar' ? 'المتبقي المستحق' : 'Remaining due'}</span>
                        <strong className={`font-bold font-mono text-xs mt-0.5 block ${remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(remaining)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredPayablesData.length === 0 && (
                <div className="sm:col-span-2 text-center py-20 bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
                  {lang === 'ar' ? 'لا يوجد فواتير التزامات دائنة مطابقة.' : 'No payable invoices found.'}
                </div>
              )}
            </div>

            {/* Expansion panel for payments made */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-start">
              {activePayable ? (
                <div className="space-y-6">
                  {/* Bill title */}
                  <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 font-mono uppercase block">{activePayable.payableNumber}</h3>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        {lang === 'ar' ? 'تفاصيل السداد والالتزام' : 'disbursement statement'}
                      </span>
                    </div>
                    <button
                      onClick={() => setActivePayable(null)}
                      className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded duration-105 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bill statistics summary */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xxs font-mono text-slate-500">
                    <div>
                      <span className="block">{lang === 'ar' ? 'المستحق للمورد:' : 'Supplier Vendor:'}</span>
                      <strong className="text-slate-800 font-bold block mt-1 font-sans">{getVendorName(activePayable.vendorId)}</strong>
                    </div>
                    <div>
                      <span className="block">{lang === 'ar' ? 'الفرع المستفيد:' : 'Dispatched Branch:'}</span>
                      <strong className="text-slate-800 font-bold block mt-1 font-sans">{getBranchName(activePayable.branchId)}</strong>
                    </div>
                    <div className="border-t border-slate-200/60 pt-3">
                      <span className="block">{lang === 'ar' ? 'تاريخ الاستحقاق:' : 'Due Date:'}</span>
                      <strong className="text-slate-700 block mt-1"><Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> {activePayable.dueDate}</strong>
                    </div>
                    <div className="border-t border-slate-200/60 pt-3">
                      <span className="block">{lang === 'ar' ? 'الحالة المالية:' : 'Disbursement Status:'}</span>
                      <strong className={`block mt-1 font-sans uppercase font-bold ${
                        activePayable.status === 'Paid' ? 'text-emerald-600' :
                        activePayable.status === 'Partial' ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {lang === 'ar' ? (activePayable.status === 'Paid' ? 'مدفوع' : (activePayable.status === 'Partial' ? 'جزئي' : 'غير مدفوع')) : activePayable.status}
                      </strong>
                    </div>
                  </div>

                  {/* Linked Payments disbursements list */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === 'ar' ? 'سندات الدفع المرتبطة' : 'Linked Disbursement Records'}
                      </h4>

                      {activePayable.status !== 'Paid' && (userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Manager') && (
                        <button
                          onClick={handleOpenRecordPayment}
                          className="flex items-center space-x-1 space-x-reverse px-2.5 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-[10px] rounded-lg border border-emerald-100 transition duration-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{lang === 'ar' ? 'سداد دفعة' : 'Disburse Payment'}</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                      {payablePayments.filter(p => p.payableId === activePayable.id).map(pm => (
                        <div key={pm.id} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xxs relative group">
                          <div>
                            <span className="font-mono text-slate-700 font-bold block">{pm.paymentNumber}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{pm.date} • {pm.paymentMethod}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <strong className="font-mono text-slate-800 font-bold block">{formatCurrency(pm.amount)}</strong>
                            
                            {(userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Manager') && (
                              <button
                                onClick={() => handleDeletePayment(pm.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 text-rose-600 rounded duration-100 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {payablePayments.filter(p => p.payableId === activePayable.id).length === 0 && (
                        <div className="text-center py-8 text-slate-400 italic text-xxs bg-slate-50 border border-dashed border-slate-200 rounded-xl block">
                          {lang === 'ar' ? 'لا يوجد دفعات مسجلة لهذه الفاتورة بعد.' : 'No payments disbursed against this bill yet.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                  <Coins className="w-10 h-10 mb-4 text-slate-300" />
                  <p className="text-xs font-bold text-slate-800">{lang === 'ar' ? 'حدد التزاماً مالياً لعرض التفاصيل' : 'Select payable bill record'}</p>
                  <p className="text-xxs max-w-xs mt-2 leading-relaxed">
                    {lang === 'ar' ? 'سيتم عرض تواريخ السداد وسجلات الدفعات المرتبطة بالفاتورة الدائنة المحددة هنا.' : 'Disbursement schedules, partial transactions list, and vendor matching detail are loaded instantly.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // Suppliers/Vendors Tab
        <>
          {/* Search bar */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
            <div className="relative">
              <input
                type="text"
                placeholder={lang === 'ar' ? 'البحث عن مورد بالاسم، الرمز، البريد...' : 'Search supplier vendor name, acronym code, email...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 text-xs rounded-xl ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 outline-none font-sans shadow-sm`}
              />
              <Search className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
            </div>
          </div>

          {/* Vendors list cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-sans">
            {filteredVendorsData.map((vendor) => {
              const vendorPayables = payables.filter(p => p.vendorId === vendor.id);
              const totalBillsVal = vendorPayables.reduce((sum, p) => sum + p.totalAmount, 0);
              const totalPaidVal = vendorPayables.reduce((sum, p) => sum + p.paidAmount, 0);
              const totalRemainingVal = totalBillsVal - totalPaidVal;

              return (
                <div
                  key={vendor.id}
                  className="bg-white border border-slate-200 hover:border-slate-350 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between group h-[220px]"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex items-center space-x-3 space-x-reverse text-start">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {vendor.code}
                        </div>
                        <div className="truncate text-left">
                          <h4 className="text-xs font-bold text-slate-800 uppercase truncate group-hover:text-emerald-700 duration-100">
                            {lang === 'ar' ? vendor.nameAr : vendor.name}
                          </h4>
                          <span className="text-xxs text-slate-400 block mt-0.5 truncate max-w-[140px] font-mono leading-none">{vendor.contactEmail}</span>
                        </div>
                      </div>

                      {(userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Manager') && (
                        <div className="flex gap-1 items-center shrink-0">
                          <button
                            onClick={(e) => handleOpenEditVendor(vendor, e)}
                            className="w-6 h-6 rounded-md bg-slate-50 hover:bg-slate-100 hover:text-emerald-750 text-slate-400 flex items-center justify-center cursor-pointer border border-slate-200 transition duration-100"
                            title={lang === 'ar' ? 'تعديل البيانات' : 'Update coordinates'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteVendor(vendor.id, e)}
                            className="w-6 h-6 rounded-md bg-slate-50 hover:bg-rose-50 text-rose-600 flex items-center justify-center cursor-pointer border border-slate-200 transition duration-100"
                            title={lang === 'ar' ? 'حذف المورد' : 'Delete Vendor'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-1.5 text-xxs text-slate-500 font-mono mt-4 text-start">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{lang === 'ar' ? 'الهاتف:' : 'Phone Line:'}</span>
                        <span>{vendor.phone || '-'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 shrink-0">{lang === 'ar' ? 'العنوان:' : 'Address:'}</span>
                        <span className="truncate max-w-[140px]">{lang === 'ar' ? vendor.addressAr : vendor.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary math */}
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xxs font-mono text-start">
                    <div>
                      <span className="text-slate-400 block leading-tight">{lang === 'ar' ? 'الفواتير' : 'Bills'}</span>
                      <strong className="text-slate-700 block font-bold font-sans mt-0.5">{vendorPayables.length}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block leading-tight">{lang === 'ar' ? 'الالتزام المتبقي' : 'Unpaid due'}</span>
                      <strong className={`font-bold font-mono block mt-0.5 ${totalRemainingVal > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(totalRemainingVal)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredVendorsData.length === 0 && (
              <div className="sm:col-span-2 md:col-span-3 text-center py-20 bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
                {lang === 'ar' ? 'لا يوجد موردين مطابقين للبحث.' : 'Zero Supplier directories matched.'}
              </div>
            )}
          </div>
        </>
      )}

      {/* Popups: Add / Edit Vendor Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-slide-in text-slate-800">
            <button
              onClick={() => setShowVendorModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 flex items-center justify-center duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 text-start">
              <Building className="w-5 h-5 text-emerald-600" />
              <span>
                {editingVendor 
                  ? (lang === 'ar' ? 'تعديل بيانات المورد المعني' : 'Update Supplier Coordinates') 
                  : (lang === 'ar' ? 'تسجيل وقيد مورد جديد' : 'Onboard Supplier Vendor')}
              </span>
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-250 border-rose-200 text-rose-600 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleVendorSubmit} className="space-y-4 text-xs text-start">
              <div className="grid grid-cols-2 gap-3">
                {/* Name Eng */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'اسم المورد (ENG)' : 'Vendor Name (English)'}</label>
                  <input
                    type="text"
                    required
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    placeholder="e.g. Acme Supplier Inc"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>

                {/* Name Ar */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'اسم المورد (عربي)' : 'Vendor Name (Arabic)'}</label>
                  <input
                    type="text"
                    value={vNameAr}
                    onChange={(e) => setVNameAr(e.target.value)}
                    placeholder="مثال: شركة أكمي للموردين"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Code */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'رمز المعرف (e.g. ACM)' : 'Acronym Code (e.g. ACM)'}</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={vCode}
                    onChange={(e) => setVCode(e.target.value)}
                    placeholder="e.g. ACM"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 uppercase rounded-xl p-2.5 outline-none font-mono font-bold shadow-sm"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'هاتف التواصل' : 'Contact Phone line'}</label>
                  <input
                    type="text"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    placeholder="e.g. +966-500-0000"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'البريد الإلكتروني للطلبات' : 'Orders Email Address'}</label>
                <input
                  type="email"
                  required
                  value={vEmail}
                  onChange={(e) => setVEmail(e.target.value)}
                  placeholder="e.g. purchase@acme.com"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                />
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'المقر المسجل (ENG)' : 'Registered Address (English)'}</label>
                  <input
                    type="text"
                    value={vAddress}
                    onChange={(e) => setVAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'المقر المسجل (عربي)' : 'Registered Address (Arabic)'}</label>
                  <input
                    type="text"
                    value={vAddressAr}
                    onChange={(e) => setVAddressAr(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl transition duration-100 cursor-pointer text-center"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Discard'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer text-center shadow-md shadow-emerald-500/10"
                >
                  {lang === 'ar' ? 'حفظ البيانات' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popups: Record Payable Bill Modal */}
      {showPayableModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-slide-in text-slate-800">
            <button
              onClick={() => setShowPayableModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 flex items-center justify-center duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 text-start">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'ar' ? 'تسجيل وقيد فاتورة التزام مستحقة' : 'Record Accounts Payable Bill'}</span>
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePayableSubmit} className="space-y-4 text-xs text-start">
              <div className="grid grid-cols-2 gap-3">
                {/* Bill number */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'رقم الفاتورة' : 'Bill Invoice Number'}</label>
                  <input
                    type="text"
                    required
                    value={pBillNumber}
                    onChange={(e) => setPBillNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono font-bold shadow-sm"
                  />
                </div>

                {/* Total amount */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'مبلغ الفاتورة الكلي ($)' : 'Total Bill Amount ($)'}</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={pTotalAmount}
                    onChange={(e) => setPTotalAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono font-bold shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Vendor selection */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'المورد الدائن' : 'Creditor Vendor'}</label>
                  <select
                    value={pVendorId}
                    onChange={(e) => setPVendorId(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 rounded-xl p-2.5 outline-none shadow-sm"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{lang === 'ar' ? v.nameAr : v.name}</option>
                    ))}
                  </select>
                </div>

                {/* Branch selection */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'فرع تسجيل المعاملة' : 'Dispatched Branch'}</label>
                  <select
                    value={pBranchId}
                    onChange={(e) => setPBranchId(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 rounded-xl p-2.5 outline-none shadow-sm"
                  >
                    {branches.map(br => (
                      <option key={br.id} value={br.id}>{lang === 'ar' ? br.nameAr : br.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Issue date */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'تاريخ الفاتورة' : 'Issue Date'}</label>
                  <input
                    type="date"
                    required
                    value={pIssueDate}
                    onChange={(e) => setPIssueDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                  />
                </div>

                {/* Due date */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
                  <input
                    type="date"
                    required
                    value={pDueDate}
                    onChange={(e) => setPDueDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Desc Eng */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'وصف أو بيان المعاملة (ENG)' : 'Bill Description (English)'}</label>
                  <input
                    type="text"
                    required
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    placeholder="e.g. Q3 hosting invoice"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>

                {/* Desc Ar */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'وصف أو بيان المعاملة (عربي)' : 'Bill Description (Arabic)'}</label>
                  <input
                    type="text"
                    value={pDescAr}
                    onChange={(e) => setPDescAr(e.target.value)}
                    placeholder="مثال: فاتورة استضافة الخوادم"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayableModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl transition duration-100 cursor-pointer text-center"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Discard'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer text-center shadow-md shadow-emerald-500/10"
                >
                  {lang === 'ar' ? 'تسجيل الفاتورة' : 'Record Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popups: Record Payable Payment Modal */}
      {showPaymentModal && activePayable && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-slide-in text-slate-800">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 flex items-center justify-center duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 text-start">
              <Coins className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'ar' ? 'تسجيل دفعة سداد التزام مالي' : 'Disburse Payable Payment'}</span>
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-250 border-rose-200 text-rose-600 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs text-start">
              <div className="grid grid-cols-2 gap-3">
                {/* Payment Amount */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'مبلغ السداد ($)' : 'Disbursement Amount ($)'}</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={pmAmount}
                    onChange={(e) => setPmAmount(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono font-bold shadow-sm"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'طريقة السداد' : 'Payment Method'}</label>
                  <select
                    value={pmMethod}
                    onChange={(e) => setPmMethod(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 rounded-xl p-2.5 outline-none shadow-sm"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Corporate Credit">Corporate Credit</option>
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'تاريخ السداد' : 'Disbursement Date'}</label>
                <input
                  type="date"
                  required
                  value={pmDate}
                  onChange={(e) => setPmDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}</label>
                <textarea
                  value={pmNotes}
                  onChange={(e) => setPmNotes(e.target.value)}
                  placeholder="e.g. Wire transfer reference #9921"
                  rows={3}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-750 text-slate-700 font-bold rounded-xl transition duration-100 cursor-pointer text-center"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Discard'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer text-center shadow-md shadow-emerald-500/10"
                >
                  {lang === 'ar' ? 'تسجيل سند الدفع' : 'Disburse Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
