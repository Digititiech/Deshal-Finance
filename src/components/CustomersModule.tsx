import React, { useState, useEffect } from 'react';
import { Customer, Invoice, UserRole } from '../types';
import { 
  PlusCircle, 
  Search, 
  X, 
  Edit, 
  User, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  BookOpen, 
  Folder 
} from 'lucide-react';

interface CustomersModuleProps {
  customers: Customer[];
  invoices: Invoice[];
  addCustomer: (item: Omit<Customer, 'id'>) => Customer;
  editCustomer: (item: Customer) => void;
  deleteCustomer: (id: string) => void;
  lang: 'en' | 'ar';
  userRole?: UserRole;
  quickActionTrigger?: string | null;
  clearQuickAction?: () => void;
}

export const CustomersModule: React.FC<CustomersModuleProps> = ({
  customers,
  invoices,
  addCustomer,
  editCustomer,
  deleteCustomer,
  lang,
  userRole,
  quickActionTrigger,
  clearQuickAction
}) => {
  const [search, setSearch] = useState('');
  
  // Create / Edit modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressAr, setAddressAr] = useState('');

  // Client Details panel state
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (quickActionTrigger === 'ADD_CUSTOMER') {
      setEditingCustomer(null);
      setName('');
      setNameAr('');
      setCode('');
      setEmail('');
      setPhone('');
      setAddress('');
      setAddressAr('');
      setShowFormModal(true);
      if (clearQuickAction) clearQuickAction();
    }
  }, [quickActionTrigger, clearQuickAction]);

  // Helper selectors
  const getCustomerStats = (cusId: string) => {
    const clientInvoices = invoices.filter(i => i.customerId === cusId);
    const totalBillings = clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = clientInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalDue = totalBillings - totalPaid;
    return { totalBillings, totalPaid, totalDue, count: clientInvoices.length };
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setName('');
    setNameAr('');
    setCode('');
    setEmail('');
    setPhone('');
    setAddress('');
    setAddressAr('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering details card activation
    setEditingCustomer(c);
    setName(c.name);
    setNameAr(c.nameAr);
    setCode(c.code);
    setEmail(c.contactEmail);
    setPhone(c.phone);
    setAddress(c.address);
    setAddressAr(c.addressAr);
    setShowFormModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !email) return;

    const payload = {
      name,
      nameAr: nameAr || name,
      code: code.toUpperCase().slice(0, 3),
      contactEmail: email,
      phone,
      address,
      addressAr: addressAr || address
    };

    if (editingCustomer) {
      editCustomer({ ...editingCustomer, ...payload });
    } else {
      addCustomer(payload);
    }

    setShowFormModal(false);
  };

  const handleRowClick = (c: Customer) => {
    setActiveCustomer(c);
  };

  // Filter processes
  const processedData = customers.filter(c => {
    return c.name.toLowerCase().includes(search.toLowerCase()) || 
           c.nameAr.toLowerCase().includes(search.toLowerCase()) ||
           c.code.toLowerCase().includes(search.toLowerCase()) ||
           c.contactEmail.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 text-start" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Head triggers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in font-sans">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mb-1">
            {lang === 'ar' ? 'سجل العملاء وإدارة الفواتير' : 'CRM Customer Database'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' ? 'إثبات العملاء المسجلين، قياس إجمالي المبيعات، ومراقبة الائتمان المكشوف والمستحق لـ ليدجر' : 'Client directories details, total invoices ratios, and unified receivables profiling.'}
          </p>
        </div>

        {(userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Accountant') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 space-x-reverse px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl shadow-sm transition duration-150 active:scale-95 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'إضافة عميل جديد' : 'Onboard Client'}</span>
          </button>
        )}
      </div>

      {/* Filter box */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
        <div className="relative">
          <input
            type="text"
            placeholder={lang === 'ar' ? 'البحث عن اسم العميل، البريد الإلكتروني أو كود العميل...' : 'Search customer directory name, contact or code...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 text-xs rounded-xl ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 outline-none font-sans shadow-sm`}
          />
          <Search className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start font-sans">
        {/* Customers grid cards */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {processedData.map((client) => {
            const stats = getCustomerStats(client.id);
            const isTarget = activeCustomer?.id === client.id;

            return (
              <div
                key={client.id}
                onClick={() => handleRowClick(client)}
                className={`flex flex-col justify-between p-5 bg-white rounded-2xl cursor-pointer border ${
                  isTarget 
                    ? 'border-emerald-500 bg-emerald-50/5 shadow' 
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                } duration-150 relative overflow-hidden group`}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-3.5 space-x-reverse font-sans text-start">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {client.code}
                    </div>
                    <div className="truncate text-left">
                      <h4 className="text-xs font-bold text-slate-805 text-slate-800 group-hover:text-emerald-700 truncate uppercase leading-tight duration-100">
                        {lang === 'ar' ? client.nameAr : client.name}
                      </h4>
                      <span className="text-xxs text-slate-400 truncate block mt-1 leading-none">{client.contactEmail}</span>
                    </div>
                  </div>
                  
                  {/* Action tags */}
                  {(userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Accountant') && (
                    <button
                      onClick={(e) => handleOpenEdit(client, e)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 hover:text-emerald-700 text-slate-500 flex items-center justify-center duration-150 shrink-0 cursor-pointer"
                      title={lang === 'ar' ? 'تعديل البيانات' : 'Update coordinates'}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* mini calculations block */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xxs font-mono text-slate-400 text-start">
                  <div>
                    <span>{lang === 'ar' ? 'الفواتير' : 'Invoices'}</span>
                    <strong className="text-slate-800 block font-bold leading-tight mt-1 font-sans">{stats.count}</strong>
                  </div>
                  <div>
                    <span>{lang === 'ar' ? 'إجمالي المقبوض' : 'Total payments'}</span>
                    <strong className="text-emerald-600 block font-bold mt-1 font-mono">${stats.totalPaid.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
                  </div>
                  <div>
                    <span>{lang === 'ar' ? 'الرصيد المكشوف' : 'Aging due'}</span>
                    <strong className="text-rose-600 block font-bold mt-1 font-mono">${stats.totalDue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
                  </div>
                </div>
              </div>
            );
          })}
          {processedData.length === 0 && (
            <div className="sm:col-span-2 text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
              {lang === 'ar' ? 'لا يوجد عملاء مطابقين للبحث.' : 'Zero directory items matched.'}
            </div>
          )}
        </div>

        {/* Client Ledger profiling details expanded drawer side */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {activeCustomer ? (
            <div className="space-y-6 text-start">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold font-mono flex items-center justify-center text-xs shadow-inner">
                    {activeCustomer.code}
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-bold text-slate-805 text-slate-800 uppercase leading-tight">{lang === 'ar' ? activeCustomer.nameAr : activeCustomer.name}</h3>
                    <span className="text-xxs text-slate-400 font-mono mt-1 block leading-none">{lang === 'ar' ? 'المطالبات الفردية النشطة' : 'Receivables profile'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveCustomer(null)}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded duration-105 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* detailed text metrics */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-150 border-slate-200 text-xxs font-mono text-slate-500">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {lang === 'ar' ? 'قناة التواصل:' : 'Phone Line:'}</span>
                  <span className="text-slate-700 font-sans">{activeCustomer.phone || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {lang === 'ar' ? 'البريد المعتمد:' : 'E-Mail:'}</span>
                  <span className="text-slate-700 select-all font-sans">{activeCustomer.contactEmail}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="shrink-0 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {lang === 'ar' ? 'العنوان المسجل:' : 'Corporate Address:'}</span>
                  <span className="text-slate-700 font-sans text-right max-w-[180px] leading-relaxed truncate block">{lang === 'ar' ? activeCustomer.addressAr : activeCustomer.address}</span>
                </div>
              </div>

              {/* client associated invoices list */}
              <div>
                <h4 className="text-xxs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                  {lang === 'ar' ? 'الفواتير والمنظومة المالية المرتبطة' : 'Linked Invoice Ledger Statements'}
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {invoices.filter(i => i.customerId === activeCustomer.id).map(inv => (
                    <div key={inv.id} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-150 text-xxs">
                      <div>
                        <span className="font-mono text-slate-700 font-bold block">{inv.invoiceNumber}</span>
                        <span className="text-xxs text-slate-400 font-mono mt-0.5 block">{inv.dueDate}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-slate-800 font-bold block">${inv.totalAmount.toLocaleString()}</span>
                        <span className={`text-[9px] font-bold mt-1 block uppercase ${
                          inv.status === 'Paid' ? 'text-emerald-600' :
                          inv.status === 'Partial' ? 'text-amber-600' : 'text-rose-600'
                        }`}>{inv.status}</span>
                      </div>
                    </div>
                  ))}
                  {invoices.filter(i => i.customerId === activeCustomer.id).length === 0 && (
                    <p className="text-center py-6 text-slate-400 italic text-xxs block">
                      {lang === 'ar' ? 'لا توجد فواتير معلقة لهذا العميل.' : 'No invoices associated with client.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
              <Folder className="w-10 h-10 mb-4 text-slate-300" />
              <p className="text-xs font-bold text-slate-800">{lang === 'ar' ? 'حدد عميلاً لعرض ملف البيانات' : 'Select client profile from the left'}</p>
              <p className="text-xxs max-w-xs mt-2 leading-relaxed">
                {lang === 'ar' ? 'سيتم عرض كود المعاملات، الفواتير المتراكمة ونسب الائتمان وسقوف السداد هنا فوراً.' : 'Click any of onboarded accounts keycards to pull real-time cash ledger matches.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Popups Forms Creator */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-slide-in font-sans text-slate-850 text-slate-800">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 flex items-center justify-center duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 text-start">
              <User className="w-5 h-5 text-emerald-600" />
              <span>{editingCustomer ? (lang === 'ar' ? 'تعديل بيانات العميل' : 'Update Client coordinates') : (lang === 'ar' ? 'تسجيل وقيد عميل جديد' : 'Onboard Client profile')}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-start">
              {/* Code */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'رمز العميل المكون من أول حرفين (مثلاً NC)' : 'Client Acronym Code (e.g. NC)'}</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. VS"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 uppercase rounded-xl p-2.5 outline-none font-mono font-bold shadow-sm"
                />
              </div>

              {/* Name Eng */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'اسم العميل (ENG)' : 'Customer Name (English)'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vanguard Systems Co"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                />
              </div>

              {/* Name Ar */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'اسم العميل (عربي)' : 'Customer Name (Arabic)'}</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: شركة فانغارد للأنظمة"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'البريد الإلكتروني للفواتير' : 'Billing Contact Email'}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. accounts@vanguard.com"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'قناة اتصال أو هاتف' : 'Corporate Phone Line'}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1-555-0922"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 text-slate-805 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                />
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'العنوان الجغرافي (ENG)' : 'Registered Address (English)'}</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'العنوان الجغرافي (AR)' : 'Registered Address (Arabic)'}</label>
                  <textarea
                    rows={3}
                    value={addressAr}
                    onChange={(e) => setAddressAr(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-705 text-slate-700 font-bold rounded-xl transition duration-100 cursor-pointer text-center"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Discard'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer text-center shadow-md shadow-emerald-500/10"
                >
                  {lang === 'ar' ? 'حفظ البيانات' : 'Commit Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
