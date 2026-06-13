import React, { useState } from 'react';
import { Receipt, Invoice, Branch, UserRole, SystemSettings } from '../types';
import { Search, Trash2, Eye, X, FileCheck2, Printer } from 'lucide-react';

interface ReceiptsModuleProps {
  receipts: Receipt[];
  filteredReceipts: Receipt[];
  invoices: Invoice[];
  branches: Branch[];
  deleteReceipt: (id: string) => void;
  lang: 'en' | 'ar';
  userRole?: UserRole;
  systemSettings: SystemSettings;
}

export const ReceiptsModule: React.FC<ReceiptsModuleProps> = ({
  receipts,
  filteredReceipts,
  invoices,
  branches,
  deleteReceipt,
  lang,
  userRole,
  systemSettings
}) => {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Currency formatting helper
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
    if ((systemSettings.primaryCurrency === 'SAR' || systemSettings.primaryCurrency === 'OMR') && lang === 'ar') {
      return `${formatted}${sym}`;
    }
    return `${sym}${formatted}`;
  };

  const getBranchName = (brId: string) => {
    const b = branches.find(item => item.id === brId);
    if (!b) return '-';
    return lang === 'ar' ? b.nameAr : b.name;
  };

  const getInvoiceNumber = (invId: string) => {
    const inv = invoices.find(i => i.id === invId);
    return inv ? inv.invoiceNumber : 'DIRECT DEPOSIT';
  };

  const getInvoiceDetails = (invId: string) => {
    return invoices.find(i => i.id === invId);
  };

  // Processing & filtering data
  const processedData = filteredReceipts.filter(item => {
    const matchSearch = item.receiptNumber.toLowerCase().includes(search.toLowerCase()) || 
      (item.notes || '').toLowerCase().includes(search.toLowerCase());
      
    const matchBranch = branchFilter === 'all' || item.branchId === branchFilter;

    return matchSearch && matchBranch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans text-start" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Head section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mb-1">
            {lang === 'ar' ? 'سندات المقبوضات والتحصيل' : 'Receipts Ledger & Collections'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' ? 'توثيق مقاصة الفواتير، المقبوضات المحمية وحافظات تتبّع الائتمان المقبوض والمودع في حسابات الشركة' : 'Tracking bank wire receipts, checking cash accounts, and matching invoice clearings.'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={lang === 'ar' ? 'البحث في أرقام سندات القبض والملاحظات...' : 'Search receipts notes & numbers...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 text-xs rounded-xl ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 outline-none font-sans shadow-sm`}
          />
          <Search className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
        </div>

        {/* Branch branchFilter */}
        <div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            disabled={userRole === 'Employee' || userRole === 'Manager'}
            className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-705 text-slate-700 text-xs rounded-xl p-2.5 outline-none shadow-sm"
          >
            <option value="all">{lang === 'ar' ? 'جميع الفروع الإقليمية' : 'All Regional Hubs'}</option>
            {branches.map(br => (
              <option key={br.id} value={br.id}>
                {lang === 'ar' ? br.nameAr : br.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left font-sans border-collapse" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-xxs font-bold uppercase tracking-wider text-slate-500 text-start">
                <th className="py-4 px-5">{lang === 'ar' ? 'رقم السند وملاحظات التحصيل' : 'Receipt Details'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'الفاتورة المرتبطة' : 'Linked Invoice'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'مبلغ التحصيل ليدجر' : 'Settlement Paid'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'الفرع المستفيد' : 'Assigned Hub'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'تاريخ المقاصة' : 'Posting Date'}</th>
                <th className="py-4 px-5">{lang === 'ar' ? 'قناة الدفع' : 'Payment Channel'}</th>
                <th className="py-4 px-5 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs text-start">
              {processedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 duration-100">
                  <td className="py-4 px-5">
                    <div>
                      <span className="font-mono text-emerald-600 font-bold block">{item.receiptNumber}</span>
                      {item.notes && (
                        <p className="text-xxs text-slate-400 mt-1 max-w-sm truncate">{item.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono font-semibold text-slate-500">
                    {getInvoiceNumber(item.invoiceId)}
                  </td>
                  <td className="py-4 px-5 font-mono font-bold text-emerald-600">
                    +{formatWithCurrency(item.amount)}
                  </td>
                  <td className="py-4 px-5 mr-1 font-sans">
                    <span className="text-xxs font-semibold inline-flex bg-slate-50 px-2 py-0.5 rounded border border-slate-150 text-slate-600">
                      {getBranchName(item.branchId)}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-505 text-slate-500">
                    {item.date}
                  </td>
                  <td className="py-4 px-5 font-bold font-mono text-xxs text-slate-500 uppercase">
                    {item.paymentMethod}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="flex justify-center items-center gap-1.5">
                      <button
                        onClick={() => setSelectedReceipt(item)}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-emerald-600 hover:text-emerald-700 rounded-lg text-xxs font-bold transition flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'معاينة' : 'Detail'}</span>
                      </button>
                      
                      {userRole === 'Super Admin' && (
                        <button
                          onClick={() => deleteReceipt(item.id)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg duration-100 cursor-pointer inline-flex items-center justify-center"
                          title={lang === 'ar' ? 'إبطال تجميع الدفعة' : 'Revert disbursement collected credit'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {processedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs font-sans">
                    {lang === 'ar' ? 'لا توجد سندات قبض متراكمة مطابقة للفلاتر.' : 'No receipt logs recorded for selected workspace.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Printable Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar animate-slide-in text-slate-800" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* Close */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 flex items-center justify-center duration-150 cursor-pointer text-center"
            >
              <X className="w-4 h-4 shrink-0 mx-auto" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{lang === 'ar' ? 'معاينة سند القبض الرسمي والتحصيل' : 'Treasury Receipt Clearance Print'}</span>
            </h3>

            {/* Receipt layout */}
            <div className="printable-area bg-slate-50 text-slate-700 p-6 rounded-xl border border-slate-200 space-y-6 font-sans text-start shadow-inner">
              
              {/* Logo & header */}
              <div className="flex justify-between items-start border-b border-slate-250 border-slate-200 pb-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-widest">{selectedReceipt.receiptNumber}</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">{lang === 'ar' ? 'رقم المقاصة النظامي:' : 'Internal Settlement ID:'} {selectedReceipt.id}</p>
                </div>

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
                    <div className="w-7 h-7 bg-emerald-600 text-white flex items-center justify-center rounded-lg font-mono font-bold text-xxs shadow shadow-emerald-600/10 ml-auto mr-0">
                      {(systemSettings.companyName || 'N')[0]}
                    </div>
                  )}
                  <span className="text-xs text-slate-850 font-bold block mt-1">
                    {lang === 'ar' ? systemSettings.companyNameAr : systemSettings.companyName}
                  </span>
                </div>
              </div>

              {/* Legal information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xxs leading-relaxed">
                <div>
                  <span className="block text-slate-400 font-semibold uppercase">{lang === 'ar' ? 'مصدر السند المالي:' : 'Clearance Office:'}</span>
                  <span className="font-bold text-slate-850 text-slate-800 block text-[10px] mt-0.5">{lang === 'ar' ? systemSettings.companyNameAr : systemSettings.companyName}</span>
                  <span className="text-slate-500 block truncate mt-0.5">
                    {lang === 'ar' ? systemSettings.companyAddressAr : systemSettings.companyAddress}
                  </span>
                  <span className="text-slate-400 block font-mono mt-0.5">{systemSettings.companyPhone}</span>
                  <span className="text-emerald-600 font-mono font-bold block mt-0.5">{lang === 'ar' ? 'الرقم الضريبي للمنشأة:' : 'Tax Registration ID:'} {systemSettings.registrationNo}</span>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <p><span className="text-slate-400 font-semibold">{lang === 'ar' ? 'تاريخ المعاملة:' : 'Clearance Date:'}</span> <strong className="text-slate-800 font-mono">{selectedReceipt.date}</strong></p>
                  <p><span className="text-slate-400 font-semibold">{lang === 'ar' ? 'قناة الدفع الموثقة:' : 'Method Route:'}</span> <strong className="text-slate-700 bg-slate-100 border border-slate-200 rounded px-1.5 font-mono">{selectedReceipt.paymentMethod}</strong></p>
                  <p><span className="text-slate-400 font-semibold">{lang === 'ar' ? 'الفرع المستلم:' : 'Auditing Office:'}</span> <strong className="text-slate-700">{getBranchName(selectedReceipt.branchId)}</strong></p>
                  <p><span className="text-slate-400 font-semibold">{lang === 'ar' ? 'الفاتورة المرجعية:' : 'Linked Invoice Ref:'}</span> <strong className="text-slate-800 font-mono">{getInvoiceNumber(selectedReceipt.invoiceId)}</strong></p>
                </div>
              </div>

              {/* Amount showcase */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
                <div className="text-start space-y-0.5">
                  <span className="text-slate-400 font-bold block text-xxs uppercase tracking-wider">{lang === 'ar' ? 'محتوى وبند تبرئة الذمة' : 'RECEIPT ANNOTATION'}</span>
                  <p className="text-slate-600 text-xxs leading-normal italic">
                    {selectedReceipt.notes || (lang === 'ar' ? 'تمت مقاصة وتحصيل الدفعة المالية بنجاح' : 'Payment received and processed into dynamic cash accounting log.')}
                  </p>
                </div>

                <div className="text-right border-r sm:border-l-0 sm:border-r border-slate-200 pr-4 pl-0 rtl:pl-4 rtl:pr-0">
                  <span className="text-slate-450 uppercase text-[10px] font-bold block">{lang === 'ar' ? 'المبلغ المستلم المقبوض' : 'Cleared Paid Amount'}</span>
                  <p className="text-sm font-bold font-mono text-emerald-600 block mt-1">
                    +{formatWithCurrency(selectedReceipt.amount)}
                  </p>
                </div>
              </div>

              {/* Digital Seal & Signature Section */}
              {(systemSettings.showSealOnInvoices || systemSettings.showSignatureOnInvoices) && (
                <div className="border-t border-slate-200/80 pt-4 grid grid-cols-2 gap-4 items-center min-h-[96px] bg-white rounded-xl p-4 shadow-sm/10 border border-slate-100">
                  
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

              {/* Terms and conditions */}
              {(systemSettings.receiptFooterTerms || systemSettings.receiptFooterTermsAr) && (
                <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 leading-normal italic text-start">
                  <span className="font-bold uppercase block not-italic mb-1 text-slate-500">
                    {lang === 'ar' ? 'شروط وإخلاء مسؤولية سند القبض:' : 'Approved Receipt Terms:'}
                  </span>
                  <p className="leading-relaxed">
                    {lang === 'ar' ? systemSettings.receiptFooterTermsAr : systemSettings.receiptFooterTerms}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-150 flex justify-between items-center text-xxs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>{lang === 'ar' ? 'سند تحصيل موقع إلكترونياً' : 'Seal verified & recorded'}</span>
              </span>
              <div className="flex gap-2">
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
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs rounded-xl transition duration-100 border-0 flex items-center gap-1.5 shadow-sm animate-pulse-subtle"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'طباعة / PDF' : 'Print / PDF'}</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-850 text-white font-bold cursor-pointer text-xs rounded-xl transition duration-100 border-0"
                >
                  {lang === 'ar' ? 'إغلاق السند' : 'Dismiss'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
