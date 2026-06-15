import React, { useState, useEffect } from 'react';
import { PettyCashVoucher, Branch, Employee, User, SystemSettings, UserRole } from '../types';
import { 
  Wallet, 
  PlusCircle, 
  Search, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Check, 
  X, 
  Trash2, 
  Printer, 
  Download, 
  AlertTriangle,
  Coins,
  FileText,
  Eye,
  Calendar,
  UserCheck,
  Mail,
  Send,
  Loader2
} from 'lucide-react';
import { supabase } from '../supabase';
import { generatePettyCashPdf } from '../utils/pdfGenerator';


interface PettyCashModuleProps {
  vouchers: PettyCashVoucher[];
  filteredVouchers: PettyCashVoucher[];
  branches: Branch[];
  employees: Employee[];
  addVoucher: (item: Omit<PettyCashVoucher, 'id' | 'status' | 'approvedBy'>) => Promise<PettyCashVoucher>;
  approveVoucher: (id: string, approvedByEmail: string) => Promise<void>;
  rejectVoucher: (id: string, approvedByEmail: string) => Promise<void>;
  deleteVoucher: (id: string) => Promise<void>;
  lang: 'en' | 'ar';
  userRole?: UserRole;
  currentUser: User;
  systemSettings: SystemSettings;
}

export const PettyCashModule: React.FC<PettyCashModuleProps> = ({
  vouchers,
  filteredVouchers,
  branches,
  employees,
  addVoucher,
  approveVoucher,
  rejectVoucher,
  deleteVoucher,
  lang,
  userRole,
  currentUser,
  systemSettings
}) => {
  const [viewingPaymentVoucher, setViewingPaymentVoucher] = useState<PettyCashVoucher | null>(null);
  const [search, setSearch] = useState('');

  // --- Email Send State ---
  const [emailTarget, setEmailTarget] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  useEffect(() => {
    if (viewingPaymentVoucher) {
      const requester = viewingPaymentVoucher.requestedBy || '';
      const matchedEmp = employees.find(e => 
        e.name.toLowerCase() === requester.toLowerCase() || 
        (e.nameAr && e.nameAr === requester) || 
        e.email.toLowerCase() === requester.toLowerCase()
      );
      setEmailTarget(matchedEmp ? matchedEmp.email : '');
      setShowEmailInput(false);
      setEmailError('');
      setEmailSuccess('');
    }
  }, [viewingPaymentVoucher, employees]);

  const handleSendEmail = async () => {
    if (!emailTarget.trim() || !emailTarget.includes('@')) {
      setEmailError(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }

    setIsSendingEmail(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const hubName = getBranchName(viewingPaymentVoucher!.branchId);
      const voucherNo = `PCV-${viewingPaymentVoucher!.id.slice(-6).toUpperCase()}`;

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

      const mailSubject = lang === 'ar' 
        ? `سند نقدية نثرية رسمي: ${voucherNo}` 
        : `Official Petty Cash Voucher: ${voucherNo}`;

      const mailHtml = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: #e11d48; padding: 24px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">${lang === 'ar' ? 'سند صرف نقدية نثرية معتمد' : 'Petty Cash Voucher'}</h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-family: monospace; font-size: 14px;">${voucherNo}</p>
          </div>
          
          <div style="padding: 24px; background: #fafafa;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'منشأة الصرف:' : 'Corporation:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b;"><b>${lang === 'ar' ? systemSettings.companyNameAr : systemSettings.companyName}</b></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'المستفيد (الموظف):' : 'Requested By (Employee):'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b;"><b>${viewingPaymentVoucher!.requestedBy}</b></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'تاريخ السند:' : 'Voucher Date:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b; font-family: monospace;">${viewingPaymentVoucher!.date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'الفرع المستحق:' : 'Branch Audited:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b;">${hubName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'تصنيف الموازنة:' : 'Budget Category:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b;">${getCategoryTranslation(viewingPaymentVoucher!.category)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><b>${lang === 'ar' ? 'الحالة المعيارية:' : 'Voucher Status:'}</b></td>
                <td style="padding: 6px 0; text-align: right; color: #1e293b; font-weight: bold; text-transform: uppercase;">${viewingPaymentVoucher!.status}</td>
              </tr>
            </table>

            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: right;">
              <div>
                <span style="font-size: 10px; color: #94a3b8; font-weight: bold; display: block; text-transform: uppercase;">${lang === 'ar' ? 'بيان الصرف وتبرير العجز' : 'DISBURSEMENT ANNOTATION'}</span>
                <p style="font-size: 11px; color: #475569; margin: 4px 0 0 0; font-style: italic;">
                  ${(lang === 'ar' ? viewingPaymentVoucher!.descriptionAr : viewingPaymentVoucher!.description) || (lang === 'ar' ? 'تم قيد وتسجيل مصروفات النقدية النثرية بنجاح' : 'Petty cash disbursement cleared.')}
                </p>
               </div>
               <div style="text-align: right; margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                 <span style="font-size: 10px; color: #94a3b8; font-weight: bold; display: block;">${lang === 'ar' ? 'مبلغ الصرف الفعلي' : 'Voucher Disbursed Value'}</span>
                 <span style="font-size: 16px; font-weight: bold; color: #e11d48; font-family: monospace; display: block; margin-top: 4px;">-${formatWithCurrency(viewingPaymentVoucher!.amount)}</span>
               </div>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 9px; color: #94a3b8; font-style: italic;">
              <span style="font-weight: bold; display: block; margin-bottom: 2px; color: #64748b; not-italic;">${lang === 'ar' ? 'إقرار ومطابقة:' : 'Compliance Note:'}</span>
              ${lang === 'ar' 
                ? 'تم صرف المبالغ النثرية بناءً على الفواتير المرفقة والمعتمدة رسمياً.' 
                : 'Petty cash disbursement matches verified billing and attachment receipts.'}
            </div>
          </div>

          <div style="background: #e2e8f0; padding: 12px; text-align: center; font-size: 10px; color: #64748b; font-family: monospace;">
            Secured by Nexus Capital Audit System v3.1.0
          </div>
        </div>
      `;

      const base64Pdf = await generatePettyCashPdf(viewingPaymentVoucher!, systemSettings, lang);

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailTarget,
          subject: mailSubject,
          text: `Petty cash voucher ${voucherNo} requested by ${viewingPaymentVoucher!.requestedBy}. Amount: ${viewingPaymentVoucher!.amount} OMR. Status: ${viewingPaymentVoucher!.status}.`,
          html: mailHtml,
          attachments: [
            {
              filename: `PettyCash-${viewingPaymentVoucher!.id}.pdf`,
              content: base64Pdf,
              encoding: 'base64',
              contentType: 'application/pdf'
            }
          ]
        }
      });

      if (error) throw error;

      setEmailSuccess(lang === 'ar' ? 'تم إرسال السند بنجاح إلى البريد الإلكتروني!' : 'Petty cash voucher dispatched successfully via email!');
      setTimeout(() => {
        setShowEmailInput(false);
        setEmailSuccess('');
      }, 3000);
    } catch (err: any) {
      setEmailError(lang === 'ar' ? 'فشل الإرسال: ' + (err.message || 'خطأ غير معروف') : 'Failed to send: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSendingEmail(false);
    }
  };
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'amount' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [showReplenishModal, setShowReplenishModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);

  // Forms State
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBranch, setNewBranch] = useState(branches[0]?.id || '');
  const [newCategory, setNewCategory] = useState('Office Supplies');
  const [newDesc, setNewDesc] = useState('');
  const [newDescAr, setNewDescAr] = useState('');
  const [attachmentData, setAttachmentData] = useState('');
  const [fileName, setFileName] = useState('');

  // Custom categories list that persists in localStorage
  const KEY_CUSTOM_CATEGORIES = 'fms_petty_cash_custom_categories';
  const DEFAULT_CATEGORIES = [
    { id: 'Office Supplies', name: 'Office Supplies', nameAr: 'أدوات مكتبية وقرطاسية' },
    { id: 'Refreshments', name: 'Refreshments', nameAr: 'ضيافة ومأكولات' },
    { id: 'Travel', name: 'Travel', nameAr: 'أجور سفر وتنقيل' },
    { id: 'Maintenance', name: 'Maintenance', nameAr: 'صيانة دورية خفيفة' },
    { id: 'Utilities', name: 'Utilities', nameAr: 'خدمات وفواتير حكومية' },
    { id: 'Miscellaneous', name: 'Miscellaneous', nameAr: 'مصاريف نثرية أخرى' }
  ];
  const [categories, setCategories] = useState<{ id: string; name: string; nameAr: string }[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
    const stored = localStorage.getItem(KEY_CUSTOM_CATEGORIES);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const combined = [...DEFAULT_CATEGORIES];
        parsed.forEach((c: any) => {
          if (!combined.some(item => item.id === c.id)) {
            combined.push(c);
          }
        });
        return combined;
      } catch (e) {
        return DEFAULT_CATEGORIES;
      }
    }
    return DEFAULT_CATEGORIES;
  });

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [categoryNameEn, setCategoryNameEn] = useState('');
  const [categoryNameAr, setCategoryNameAr] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryNameEn.trim() || !categoryNameAr.trim()) return;
    
    const newId = categoryNameEn.trim();
    if (categories.some(c => c.id.toLowerCase() === newId.toLowerCase())) {
      alert(lang === 'ar' ? 'هذا التصنيف موجود بالفعل!' : 'This category already exists!');
      return;
    }

    const newCat = {
      id: newId,
      name: newId,
      nameAr: categoryNameAr.trim()
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    if (typeof window !== 'undefined') {
      const customOnes = updated.filter(c => !DEFAULT_CATEGORIES.some(d => d.id === c.id));
      localStorage.setItem(KEY_CUSTOM_CATEGORIES, JSON.stringify(customOnes));
    }

    setNewCategory(newId);
    setCategoryNameEn('');
    setCategoryNameAr('');
    setShowAddCategoryModal(false);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // File Upload to Base64
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

  // Safe Balance Calculations
  const totalReplenishments = filteredVouchers
    .filter(v => v.type === 'Replenishment' && v.status === 'Approved')
    .reduce((sum, v) => sum + Number(v.amount), 0);

  const totalApprovedDisbursements = filteredVouchers
    .filter(v => v.type === 'Disbursement' && v.status === 'Approved')
    .reduce((sum, v) => sum + Number(v.amount), 0);

  const safeBalance = totalReplenishments - totalApprovedDisbursements;

  const pendingDisbursementsCount = filteredVouchers
    .filter(v => v.type === 'Disbursement' && v.status === 'Pending').length;

  const pendingDisbursementsAmount = filteredVouchers
    .filter(v => v.type === 'Disbursement' && v.status === 'Pending')
    .reduce((sum, v) => sum + Number(v.amount), 0);

  const getBranchName = (brId: string) => {
    const b = branches.find(item => item.id === brId);
    if (!b) return '-';
    return lang === 'ar' ? b.nameAr : b.name;
  };

  const getEmployeeName = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) return lang === 'ar' ? emp.nameAr : emp.name;
    const empByEmail = employees.find(e => e.email === empId);
    if (empByEmail) return lang === 'ar' ? empByEmail.nameAr : empByEmail.name;
    return empId;
  };

  const getCurrencySymbol = () => {
    const curr = systemSettings.primaryCurrency || 'OMR';
    if (curr === 'SAR') return lang === 'ar' ? 'ر.س' : 'SAR';
    if (curr === 'OMR') return lang === 'ar' ? 'ر.ع.' : 'OMR';
    if (curr === 'EUR') return '€';
    return '$';
  };

  const formatWithCurrency = (val: number) => {
    const sym = getCurrencySymbol();
    if ((systemSettings.primaryCurrency === 'SAR' || systemSettings.primaryCurrency === 'OMR') && lang === 'ar') {
      return `${val.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${sym}`;
    }
    return `${sym} ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getCategoryTranslation = (cat: string) => {
    const matched = categories.find(c => c.id === cat || c.name === cat);
    if (matched) {
      return lang === 'ar' ? matched.nameAr : matched.name;
    }
    const dict: Record<string, string> = {
      'Top-up': lang === 'ar' ? 'تغذية الصندوق' : 'Top-up',
      'Office Supplies': lang === 'ar' ? 'قرطاسية ومستلزمات مكتب' : 'Office Supplies',
      'Refreshments': lang === 'ar' ? 'ضيافة ومأكولات' : 'Refreshments',
      'Meals & Entertainment': lang === 'ar' ? 'وجبات وضيافة' : 'Meals & Entertainment',
      'Travel': lang === 'ar' ? 'مواصلات وانتقالات' : 'Travel',
      'Taxi': lang === 'ar' ? 'أجرة سيارات' : 'Taxi',
      'Maintenance': lang === 'ar' ? 'صيانة وإصلاحات خفيفة' : 'Maintenance',
      'Utilities': lang === 'ar' ? 'خدمات عامة وفواتير' : 'Utilities',
      'Miscellaneous': lang === 'ar' ? 'نثريات متنوعة' : 'Miscellaneous'
    };
    return dict[cat] || cat;
  };

  const getStatusBadgeClass = (status: PettyCashVoucher['status']) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
      case 'Pending':
        return 'text-amber-700 bg-amber-50 border border-amber-100';
      case 'Rejected':
        return 'text-rose-700 bg-rose-50 border border-rose-100';
      default:
        return 'text-slate-700 bg-slate-50 border border-slate-100';
    }
  };

  const getStatusLabel = (status: PettyCashVoucher['status']) => {
    switch (status) {
      case 'Approved':
        return lang === 'ar' ? 'معتمد' : 'Approved';
      case 'Pending':
        return lang === 'ar' ? 'معلق' : 'Pending';
      case 'Rejected':
        return lang === 'ar' ? 'مرفوض' : 'Rejected';
      default:
        return status;
    }
  };

  const handleReplenishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || isNaN(Number(newAmount)) || Number(newAmount) <= 0) return;

    const matchedEmp = employees.find(e => e.email === currentUser.email);
    const requestedById = matchedEmp ? matchedEmp.id : currentUser.uid;

    await addVoucher({
      voucherNumber: `PCV-TOP-${Date.now().toString().slice(-5)}`,
      branchId: newBranch,
      amount: parseFloat(newAmount),
      type: 'Replenishment',
      category: 'Top-up',
      date: newDate,
      description: newDesc || 'Replenished Safe Cash Drawer',
      descriptionAr: newDescAr || 'تغذية صندوق النقدية النثرية',
      requestedBy: requestedById
    });

    // Reset fields
    setNewAmount('');
    setNewDesc('');
    setNewDescAr('');
    setShowReplenishModal(false);
  };

  const handleDisburseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || isNaN(Number(newAmount)) || Number(newAmount) <= 0) return;

    const matchedEmp = employees.find(e => e.email === currentUser.email);
    const requestedById = matchedEmp ? matchedEmp.id : currentUser.uid;

    await addVoucher({
      voucherNumber: `PCV-OUT-${Date.now().toString().slice(-5)}`,
      branchId: newBranch,
      amount: parseFloat(newAmount),
      type: 'Disbursement',
      category: newCategory,
      date: newDate,
      description: newDesc,
      descriptionAr: newDescAr,
      requestedBy: requestedById,
      receiptUrl: attachmentData || undefined
    });

    // Reset fields
    setNewAmount('');
    setNewDesc('');
    setNewDescAr('');
    setFileName('');
    setAttachmentData('');
    setShowDisburseModal(false);
  };

  // Filter Data
  const processedData = filteredVouchers
    .filter(item => {
      const matchSearch = 
        item.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.descriptionAr || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'all' || item.type === typeFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchBranch = branchFilter === 'all' || item.branchId === branchFilter;

      return matchSearch && matchType && matchStatus && matchBranch;
    })
    .sort((a, b) => {
      let multiplier = sortOrder === 'desc' ? -1 : 1;
      if (sortBy === 'amount') {
        return (Number(a.amount) - Number(b.amount)) * multiplier;
      } else {
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier;
      }
    });

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData.slice(startIdx, startIdx + itemsPerPage);

  const handleExportCSV = () => {
    const headers = lang === 'ar'
      ? 'رقم السند,التاريخ,الفرع,التصنيف,النوع,القيمة,بواسطة,الاعتماد,الحالة\n'
      : 'Voucher Number,Date,Branch,Category,Type,Amount,Requested By,Approved By,Status\n';

    const rows = processedData.map(item => {
      const branchName = getBranchName(item.branchId);
      const reqBy = getEmployeeName(item.requestedBy);
      const appBy = item.approvedBy || '-';
      const desc = lang === 'ar' ? (item.descriptionAr || item.description) : (item.description || '');
      return `"${item.voucherNumber}","${item.date}","${branchName}","${item.category}","${item.type}",${item.amount},"${reqBy}","${appBy}","${item.status}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `petty_cash_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApprove = async (id: string) => {
    await approveVoucher(id, currentUser.email);
  };

  const handleReject = async (id: string) => {
    await rejectVoucher(id, currentUser.email);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا القيد تماماً؟' : 'Are you sure you want to permanently delete this voucher entry?')) {
      await deleteVoucher(id);
    }
  };

  const isAuditor = userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Manager';

  return (
    <div className="space-y-6 animate-fade-in no-print" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Title Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-start">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mb-1">
            {lang === 'ar' ? 'إدارة صندوق النقدية النثرية' : 'Petty Cash Safe & Custody'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' 
              ? 'تسجيل تغذية الصناديق الإقليمية، وإثبات سندات الصرف للمصروفات الفورية، واعتماد سندات الأطراف والموظفين.' 
              : 'Record cash replenishments, dispatch minor outflow vouchers, audit regional drawers, and authorize custodian invoices.'}
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
          
          {isAuditor && (
            <button
              onClick={() => {
                if (branches.length > 0) setNewBranch(branches[0].id);
                setNewDate(new Date().toISOString().split('T')[0]);
                setShowReplenishModal(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 space-x-reverse px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl shadow-sm transition duration-150 active:scale-95 cursor-pointer"
            >
              <ArrowDownCircle className="w-4 h-4 shrink-0" />
              <span>{lang === 'ar' ? 'تغذية الصندوق / إيداع' : 'Record Top-up'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (branches.length > 0) setNewBranch(branches[0].id);
              setNewDate(new Date().toISOString().split('T')[0]);
              setShowDisburseModal(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 space-x-reverse px-4 py-2 bg-rose-600 hover:bg-rose-700 font-bold text-white text-xs rounded-xl shadow-sm transition duration-150 active:scale-95 cursor-pointer"
          >
            <ArrowUpCircle className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'طلب صرف نقدية' : 'Request Outflow'}</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Safe Balance */}
        <div className={`bg-white border p-5 rounded-2xl shadow-xs flex items-center justify-between ${
          safeBalance > 0 
            ? 'border-emerald-200 bg-emerald-50/20' 
            : safeBalance === 0 
              ? 'border-amber-200 bg-amber-50/20' 
              : 'border-rose-200 bg-rose-50/20'
        }`}>
          <div className="text-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {lang === 'ar' ? 'الرصيد الحالي للخزينة' : 'Current Safe Balance'}
            </span>
            <h3 className={`text-2xl font-mono tracking-normal font-black ${
              safeBalance > 0 
                ? 'text-emerald-600' 
                : safeBalance === 0 
                  ? 'text-amber-600' 
                  : 'text-rose-600'
            }`}>
              {formatWithCurrency(safeBalance)}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            safeBalance > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
          }`}>
            <Wallet className="w-5 h-5 shrink-0" />
          </div>
        </div>

        {/* Metric 2: Pending Outflows */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="text-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {lang === 'ar' ? 'سندات معلقة (قيد الانتظار)' : 'Pending Outflows'}
            </span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-mono tracking-normal font-black text-amber-600">
                {formatWithCurrency(pendingDisbursementsAmount)}
              </h3>
              <span className="text-xxs text-slate-400 font-mono">
                ({pendingDisbursementsCount} {lang === 'ar' ? 'سندات' : 'items'})
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 shrink-0" />
          </div>
        </div>

        {/* Metric 3: Replenishments */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="text-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {lang === 'ar' ? 'إجمالي المقبوضات والتغذية' : 'Total Top-ups (Inflow)'}
            </span>
            <h3 className="text-2xl font-mono tracking-normal font-black text-slate-800">
              {formatWithCurrency(totalReplenishments)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-550 text-slate-500 flex items-center justify-center">
            <Coins className="w-5 h-5 shrink-0" />
          </div>
        </div>

        {/* Metric 4: Approved Disbursements */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="text-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {lang === 'ar' ? 'إجمالي نفقات الصندوق المعتمدة' : 'Approved Outflows'}
            </span>
            <h3 className="text-2xl font-mono tracking-normal font-black text-slate-800">
              {formatWithCurrency(totalApprovedDisbursements)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <FileText className="w-5 h-5 shrink-0" />
          </div>
        </div>
      </div>

      {/* Ledger Controls Panel */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center select-none">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className={`absolute w-4 h-4 top-1/2 -translate-y-1/2 text-slate-400 ${lang === 'ar' ? 'left-3' : 'right-3'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'البحث برقم السند أو التفاصيل...' : 'Search voucher # or description...'}
            className="w-full pl-3 pr-3 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl py-2.5 outline-hidden focus:ring-1 focus:ring-emerald-500 font-sans transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Branch Filter */}
          <div className="flex flex-col text-start">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              {lang === 'ar' ? 'تصفية الفروع' : 'Branch Filter'}
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer font-sans"
            >
              <option value="all">{lang === 'ar' ? 'كافة الفروع النشطة' : 'All Branches'}</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{lang === 'ar' ? b.nameAr : b.name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex flex-col text-start">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              {lang === 'ar' ? 'نوع الحركة' : 'Voucher Type'}
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer font-sans"
            >
              <option value="all">{lang === 'ar' ? 'الكل' : 'All Types'}</option>
              <option value="Replenishment">{lang === 'ar' ? 'تغذية وإيداع' : 'Replenishment'}</option>
              <option value="Disbursement">{lang === 'ar' ? 'صرف وتدفق خارج' : 'Disbursement'}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col text-start">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              {lang === 'ar' ? 'حالة القيد' : 'Status'}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer font-sans"
            >
              <option value="all">{lang === 'ar' ? 'كافة الحالات' : 'All Statuses'}</option>
              <option value="Pending">{lang === 'ar' ? 'معلق / قيد المراجعة' : 'Pending'}</option>
              <option value="Approved">{lang === 'ar' ? 'معتمد ومثبت' : 'Approved'}</option>
              <option value="Rejected">{lang === 'ar' ? 'مرفوض' : 'Rejected'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden select-text">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase">
                <th className="py-4 px-5 text-start">{lang === 'ar' ? 'رقم السند' : 'Voucher No.'}</th>
                <th className="py-4 px-4 text-start">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="py-4 px-4 text-start">{lang === 'ar' ? 'الفرع' : 'Branch'}</th>
                <th className="py-4 px-4 text-start">{lang === 'ar' ? 'التصنيف' : 'Category'}</th>
                <th className="py-4 px-4 text-start">{lang === 'ar' ? 'النوع' : 'Type'}</th>
                <th className="py-4 px-4 text-start">{lang === 'ar' ? 'القيمة' : 'Amount'}</th>
                <th className="py-4 px-4 text-start">{lang === 'ar' ? 'طلب بواسطة' : 'Requested By'}</th>
                <th className="py-4 px-4 text-start">{lang === 'ar' ? 'حالة السند' : 'Status'}</th>
                <th className="py-4 px-5 text-end">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans font-medium">
                    {lang === 'ar' ? 'لم يتم العثور على أي قيود وسندات خزينة' : 'No petty cash records found matching filters'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const isReplenish = item.type === 'Replenishment';
                  const amountVal = Number(item.amount);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-800 text-start">
                        {item.voucherNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-550 text-slate-500 text-start">
                        {item.date}
                      </td>
                      <td className="py-3.5 px-4 text-start">
                        {getBranchName(item.branchId)}
                      </td>
                      <td className="py-3.5 px-4 text-start">
                        {getCategoryTranslation(item.category)}
                      </td>
                      <td className="py-3.5 px-4 text-start">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          isReplenish ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isReplenish ? '+' : '-'} {lang === 'ar' ? (isReplenish ? 'تغذية' : 'صرف') : item.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-start">
                        {formatWithCurrency(amountVal)}
                      </td>
                      <td className="py-3.5 px-4 text-start text-slate-550 text-slate-500">
                        {getEmployeeName(item.requestedBy)}
                      </td>
                      <td className="py-3.5 px-4 text-start">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-end font-sans">
                        <div className="flex items-center justify-end gap-1.5 no-print">
                          {/* Details / Print */}
                          <button
                            onClick={() => setViewingPaymentVoucher(item)}
                            title={lang === 'ar' ? 'عرض السند / طباعة' : 'View Voucher & Print'}
                            className="p-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-md cursor-pointer transition active:scale-90"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Manager Actions for Pending disbursements */}
                          {isAuditor && item.status === 'Pending' && !isReplenish && (
                            <>
                              <button
                                onClick={() => handleApprove(item.id)}
                                title={lang === 'ar' ? 'اعتماد وصرف' : 'Approve Disbursement'}
                                className="p-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-md cursor-pointer transition active:scale-90"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                title={lang === 'ar' ? 'رفض السند' : 'Reject Disbursement'}
                                className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-md cursor-pointer transition active:scale-90"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Audit Delete for Super Admin / Admin */}
                          {(userRole === 'Super Admin' || userRole === 'Admin') && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              title={lang === 'ar' ? 'حذف القيد' : 'Delete Log'}
                              className="p-1 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 border border-slate-200 text-slate-400 rounded-md cursor-pointer transition active:scale-90"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between select-none">
            <span className="text-xxs text-slate-450 text-slate-500">
              {lang === 'ar' 
                ? `عرض ${startIdx + 1} إلى ${Math.min(startIdx + itemsPerPage, processedData.length)} من إجمالي ${processedData.length} سند`
                : `Showing ${startIdx + 1} to ${Math.min(startIdx + itemsPerPage, processedData.length)} of ${processedData.length} entries`}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1 text-xxs font-bold bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition active:scale-95"
              >
                {lang === 'ar' ? 'السابق' : 'Previous'}
              </button>
              <span className="text-xxs font-bold px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1 text-xxs font-bold bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition active:scale-95"
              >
                {lang === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replenish (Top-up) Modal */}
      {showReplenishModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="text-start">
                <h3 className="text-sm font-bold text-slate-800">
                  {lang === 'ar' ? 'تغذية صندوق النقدية النثرية' : 'Petty Cash Replenishment'}
                </h3>
                <span className="text-[10px] text-slate-400">
                  {lang === 'ar' ? 'إيداع رصيد نقدي جديد في صندوق عهدة الفرع' : 'Allocate bank funds as physical safe drawer cash'}
                </span>
              </div>
              <button
                onClick={() => setShowReplenishModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReplenishSubmit} className="p-5 space-y-4 text-start text-xs">
              {/* Amount */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'قيمة الإيداع (مبلغ التغذية)' : 'Replenish Amount'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-3 pr-3 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl py-2.5 outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                  />
                  <span className={`absolute top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold ${lang === 'ar' ? 'left-3' : 'right-3'}`}>
                    {systemSettings.primaryCurrency}
                  </span>
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'صندوق فرع عهدة:' : 'Destination Drawer Branch:'}
                </label>
                <select
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer font-sans"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{lang === 'ar' ? b.nameAr : b.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'تاريخ التغذية' : 'Top-up Date'}
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Description EN (Multi-line) */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'الوصف الإيضاحي (إنجليزي)' : 'Description (English)'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Replenishment notes..."
                  className="w-full text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl py-2 px-3 outline-hidden focus:ring-1 focus:ring-emerald-500 font-sans"
                />
              </div>

              {/* Description AR (Multi-line) */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'تفاصيل السند (عربي)' : 'Details & Reference (Arabic)'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescAr}
                  onChange={(e) => setNewDescAr(e.target.value)}
                  placeholder="تفاصيل التغذية والمستند المحاسبي..."
                  className="w-full text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl py-2 px-3 outline-hidden focus:ring-1 focus:ring-emerald-500 font-sans"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 select-none">
                <button
                  type="button"
                  onClick={() => setShowReplenishModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition duration-150 cursor-pointer active:scale-95"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تأكيد وحفظ الإيداع' : 'Deposit & Replenish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disburse (Disbursement) Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="text-start">
                <h3 className="text-sm font-bold text-slate-800">
                  {lang === 'ar' ? 'طلب صرف عهدة نقدية نثرية' : 'Request Petty Cash Outflow'}
                </h3>
                <span className="text-[10px] text-slate-400">
                  {lang === 'ar' ? 'تقييد نفقة فورية جديدة لصالح الموظف أو الطرف الطالب' : 'Request cash payout for immediate office needs'}
                </span>
              </div>
              <button
                onClick={() => setShowDisburseModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDisburseSubmit} className="p-5 space-y-4 text-start text-xs">
              {/* Amount */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'قيمة المبلغ المطلوب صرفه:' : 'Payout Amount Required:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-3 pr-3 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl py-2.5 outline-hidden focus:ring-1 focus:ring-rose-500 font-mono font-bold"
                  />
                  <span className={`absolute top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold ${lang === 'ar' ? 'left-3' : 'right-3'}`}>
                    {systemSettings.primaryCurrency}
                  </span>
                </div>
              </div>

              {/* Destination Branch */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'الفرع المصدر للدفعة:' : 'Expensing Safe Branch:'}
                </label>
                <select
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-hidden focus:ring-1 focus:ring-rose-500 cursor-pointer font-sans"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{lang === 'ar' ? b.nameAr : b.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'تاريخ المعاملة' : 'Voucher Date'}
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-hidden focus:ring-1 focus:ring-rose-500 font-mono"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'التصنيف المحاسبي للنفقة:' : 'Safe Ledger Category:'}
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-hidden focus:ring-1 focus:ring-rose-500 cursor-pointer font-sans"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ar' ? c.nameAr : c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(true)}
                    title={lang === 'ar' ? 'إضافة تصنيف جديد' : 'Add New Category'}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl cursor-pointer transition active:scale-95 flex items-center justify-center shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description EN (Multi-line) */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'تفاصيل السند والمبررات (إنجليزي)' : 'Expense Justification (English)'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Justify and detail of this disbursement..."
                  className="w-full text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl py-2 px-3 outline-hidden focus:ring-1 focus:ring-rose-500 font-sans"
                />
              </div>

              {/* Description AR (Multi-line) */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'تفاصيل السند (عربي)' : 'Disbursement Description (Arabic)'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescAr}
                  onChange={(e) => setNewDescAr(e.target.value)}
                  placeholder="تفاصيل صرف المبالغ النثرية..."
                  className="w-full text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl py-2 px-3 outline-hidden focus:ring-1 focus:ring-rose-500 font-sans"
                />
              </div>

              {/* Receipt upload */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'إرفاق ثبوتية الصرف / الفاتورة (اختياري)' : 'Upload Supporting Receipt (Optional)'}
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                />
                {fileName && (
                  <p className="text-[10px] text-emerald-600 font-mono mt-1">
                    ✓ {fileName}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 select-none">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition duration-150 cursor-pointer active:scale-95"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إرسال طلب الصرف' : 'Submit Outflow Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing details & Printable Payment Voucher Modal */}
      {viewingPaymentVoucher && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal header (visible on screen only) */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print select-none">
              <div className="text-start">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-emerald-650 text-emerald-600" />
                  <span>{lang === 'ar' ? 'معاينة مستند عهدة الصندوق' : 'Safe Drawer Voucher Audit'}</span>
                </h3>
              </div>
              <button
                onClick={() => setViewingPaymentVoucher(null)}
                className="text-slate-400 hover:text-slate-650 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Payment Voucher Area */}
            <div className="p-6 md:p-8 bg-white printable-area select-text">
              {/* Paper Layout */}
              <div className="border-4 border-double border-slate-300 p-6 space-y-6">
                
                {/* Header: Company Name & Document Title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-300 pb-4 gap-4">
                  <div className="text-start">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">
                      {lang === 'ar' ? systemSettings.companyNameAr : systemSettings.companyName}
                    </h2>
                    <span className="text-[9px] text-slate-450 text-slate-500 font-mono">
                      CR NO: {systemSettings.registrationNo || '10293848'} | BRANCH: {getBranchName(viewingPaymentVoucher.branchId)}
                    </span>
                  </div>
                  <div className="text-start sm:text-end">
                    <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-lg text-xs tracking-wider">
                      {lang === 'ar' ? 'سند صرف صندوق نقدية' : 'PETTY CASH PAYMENT VOUCHER'}
                    </span>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-4 text-left font-mono text-[9px] bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase">{lang === 'ar' ? 'رقم السند:' : 'VOUCHER NUMBER:'} <span className="text-slate-800 font-extrabold">{viewingPaymentVoucher.voucherNumber}</span></p>
                    <p className="text-slate-500 font-bold uppercase">{lang === 'ar' ? 'التصنيف المحاسبي:' : 'LEDGER BUDGET CATEGORY:'} <span className="text-rose-700 font-extrabold">{getCategoryTranslation(viewingPaymentVoucher.category)}</span></p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-slate-500 font-bold uppercase text-right">{lang === 'ar' ? 'تاريخ السند:' : 'VOUCHER DATE:'} <span className="text-slate-800 font-extrabold">{viewingPaymentVoucher.date}</span></p>
                    <p className="text-slate-500 font-bold uppercase text-right">{lang === 'ar' ? 'نوع الحركة:' : 'VOUCHER TYPE:'} <span className="text-emerald-700 font-extrabold uppercase">{lang === 'ar' ? (viewingPaymentVoucher.type === 'Replenishment' ? 'تغذية صندوق' : 'صرف صندوق') : viewingPaymentVoucher.type}</span></p>
                  </div>
                </div>

                {/* Details Content Block */}
                <div className="space-y-4 text-start text-[10px]">
                  
                  {/* Paid to / Requested by */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-2">
                    <span className="col-span-4 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'اصرفوا بموجبه للسيد/ة:' : 'PAYEE / BENEFICIARY:'}
                    </span>
                    <p className="col-span-8 font-extrabold text-slate-900">
                      {getEmployeeName(viewingPaymentVoucher.requestedBy)}
                    </p>
                  </div>

                  {/* Voucher Status */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-2">
                    <span className="col-span-4 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'حالة القيد والاعتماد:' : 'STATUS & AUDIT:'}
                    </span>
                    <p className="col-span-8 font-bold">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${getStatusBadgeClass(viewingPaymentVoucher.status)}`}>
                        {getStatusLabel(viewingPaymentVoucher.status)}
                      </span>
                    </p>
                  </div>

                  {/* Sum Of */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-2">
                    <span className="col-span-4 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'مبلغ وقدره:' : 'THE SUM OF AMOUNT:'}
                    </span>
                    <p className="col-span-8 font-black text-emerald-650 text-emerald-600 font-mono">
                      {formatWithCurrency(Number(viewingPaymentVoucher.amount))}
                    </p>
                  </div>

                  {/* Description / For payment of */}
                  <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-2">
                    <span className="col-span-4 text-slate-400 font-bold uppercase">
                      {lang === 'ar' ? 'وذلك مقابل تفاصيل مبررات الصرف:' : 'FOR PAYMENT NOTES & REASONS:'}
                    </span>
                    <div className="col-span-8 space-y-1">
                      <p className="text-slate-800 leading-normal font-sans">
                        {viewingPaymentVoucher.description || 'Petty cash voucher transaction logged'}
                      </p>
                      {viewingPaymentVoucher.descriptionAr && (
                        <p className="text-slate-800 leading-normal font-sans border-t border-slate-100 pt-1 text-right" dir="rtl">
                          {viewingPaymentVoucher.descriptionAr}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Supporting Receipt Image Attachment Preview (No Print) */}
                  {viewingPaymentVoucher.receiptUrl && (
                    <div className="no-print pt-2 flex flex-col items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        {lang === 'ar' ? 'مرفق الإثبات / الفاتورة المصورة:' : 'Attached Receipt File/Image:'}
                      </span>
                      <img 
                        src={viewingPaymentVoucher.receiptUrl} 
                        alt="Receipt supporting attachment" 
                        className="max-h-32 rounded-lg border border-slate-200 object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Big Net Total Box */}
                <div className="flex justify-between items-center bg-slate-900 text-white rounded-lg p-3 shadow-xs font-mono select-none">
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    {lang === 'ar' ? 'إجمالي الحركة النقدية المصروفة' : 'NET TRANSACTION VALUE'}
                  </span>
                  <span className="text-xs font-black text-emerald-400">
                    {formatWithCurrency(Number(viewingPaymentVoucher.amount))}
                  </span>
                </div>

                {/* Sign-off & Seal Multi-Signature Blocks */}
                <div className="border-t border-slate-300 pt-5 grid grid-cols-4 gap-2 text-center text-[8px] font-bold text-slate-550 select-none">
                  {/* Column 1: Prepared By */}
                  <div className="space-y-6 flex flex-col justify-between h-16">
                    <span className="block text-slate-400 uppercase tracking-wider">
                      {lang === 'ar' ? 'أنشأ بواسطة / محاسب:' : 'PREPARED BY (ACCOUNTANT):'}
                    </span>
                    <p className="border-b border-slate-300 border-dashed pb-0.5 font-mono text-[9px] text-slate-700">
                      {getEmployeeName(viewingPaymentVoucher.requestedBy)}
                    </p>
                  </div>

                  {/* Column 2: Checked By */}
                  <div className="space-y-6 flex flex-col justify-between h-16">
                    <span className="block text-slate-400 uppercase tracking-wider">
                      {lang === 'ar' ? 'دقق بواسطة / المراجع:' : 'CHECKED BY (AUDITOR):'}
                    </span>
                    <p className="border-b border-slate-300 border-dashed pb-0.5 italic font-sans text-slate-400">
                      ........................
                    </p>
                  </div>

                  {/* Column 3: Approved By */}
                  <div className="space-y-6 flex flex-col justify-between h-16">
                    <span className="block text-slate-400 uppercase tracking-wider">
                      {lang === 'ar' ? 'اعتمد بواسطة / المدير:' : 'APPROVED BY (MANAGER):'}
                    </span>
                    {viewingPaymentVoucher.approvedBy ? (
                      <p className="border-b border-slate-300 border-dashed pb-0.5 font-mono text-[9px] text-emerald-700 font-extrabold">
                        {viewingPaymentVoucher.approvedBy}
                      </p>
                    ) : (
                      <p className="border-b border-slate-300 border-dashed pb-0.5 italic font-sans text-slate-400">
                        ........................
                      </p>
                    )}
                  </div>

                  {/* Column 4: Received By */}
                  <div className="space-y-6 flex flex-col justify-between h-16">
                    <span className="block text-slate-400 uppercase tracking-wider">
                      {lang === 'ar' ? 'استلم بواسطة / المستلم:' : 'RECEIVED BY (RECIPIENT):'}
                    </span>
                    <p className="border-b border-slate-300 border-dashed pb-0.5 italic font-sans text-slate-400">
                      ........................
                    </p>
                  </div>
                </div>

                {/* Company Seal Image display if active in settings */}
                {systemSettings.showSealOnInvoices && (
                  <div className="flex justify-start pt-1">
                    {systemSettings.companySealUrl ? (
                      <img 
                        src={systemSettings.companySealUrl} 
                        alt="Company Official Seal" 
                        className="h-10 w-10 object-contain mix-blend-multiply opacity-80"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-double border-slate-400/60 flex flex-col items-center justify-center text-slate-400/80 font-bold text-[4px] scale-90 rotate-[-1deg]">
                        <span>Nexus Capital</span>
                        <span className="font-extrabold uppercase">PETTY CASH</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Email dispatch drawer */}
            {showEmailInput && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-start no-print">
                <span className="font-bold text-slate-800 text-xxs uppercase tracking-wider block">
                  {lang === 'ar' ? 'إرسال السند بالبريد الإلكتروني' : 'Email Voucher Dispatch'}
                </span>
                
                <div className="flex gap-2 items-center">
                  <input
                    type="email"
                    value={emailTarget}
                    onChange={(e) => setEmailTarget(e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none font-mono"
                    disabled={isSendingEmail}
                  />
                  
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 shrink-0 border-0"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{lang === 'ar' ? 'إرسال' : 'Send'}</span>
                  </button>
                </div>

                {emailError && (
                  <p className="text-xxs text-rose-600 font-bold">{emailError}</p>
                )}
                {emailSuccess && (
                  <p className="text-xxs text-emerald-600 font-bold">{emailSuccess}</p>
                )}
              </div>
            )}

            {/* Bottom Actions (No Print) */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 text-[10px] font-bold no-print select-none">
              <span className="text-slate-400 font-mono">
                {lang === 'ar' ? 'سند صرف صندوق النقدية النثرية - قياس A5 مناسب' : 'Bilingual Payment Receipt - optimized A5 paper'}
              </span>
              <div className="flex items-center gap-1.5">
                {viewingPaymentVoucher.status === 'Approved' && (
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
                    className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer rounded-xl transition border-0 flex items-center gap-1 shadow-xs font-sans active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'طباعة السند / PDF' : 'Print Receipt'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowEmailInput(prev => !prev)}
                  className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold cursor-pointer rounded-xl transition flex items-center gap-1 shadow-sm font-sans active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إرسال بريد' : 'Email'}</span>
                </button>
                <button
                  onClick={() => setViewingPaymentVoucher(null)}
                  className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer rounded-xl transition border-0 font-sans active:scale-95"
                >
                  {lang === 'ar' ? 'إغلاق المعاينة' : 'Close Preview'}
                </button>
              </div>
            </div>

    	  </div>
        </div>
      )}

      {/* Add Custom Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="text-start">
                <h3 className="text-xs font-bold text-slate-800">
                  {lang === 'ar' ? 'إضافة تصنيف مصروف نثرية جديد' : 'Add New Petty Cash Category'}
                </h3>
                <span className="text-[9px] text-slate-400">
                  {lang === 'ar' ? 'إنشاء بند تصنيف لحسابات عهدة المصاريف' : 'Create category log item for drawer accounts'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="p-4 space-y-4 text-start text-xs">
              {/* Category EN */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'اسم التصنيف بالإنجليزية:' : 'Category Name (English):'}
                </label>
                <input
                  type="text"
                  required
                  value={categoryNameEn}
                  onChange={(e) => setCategoryNameEn(e.target.value)}
                  placeholder="e.g. Courier & Delivery"
                  className="w-full text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl py-2.5 px-3 outline-hidden focus:ring-1 focus:ring-rose-500 font-sans"
                />
              </div>

              {/* Category AR */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'اسم التصنيف بالعربية:' : 'Category Name (Arabic):'}
                </label>
                <input
                  type="text"
                  required
                  value={categoryNameAr}
                  onChange={(e) => setCategoryNameAr(e.target.value)}
                  placeholder="مثال: البريد السريع والتوصيل"
                  className="w-full text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl py-2.5 px-3 outline-hidden focus:ring-1 focus:ring-rose-500 font-sans"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 select-none">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition duration-150 cursor-pointer active:scale-95"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'حفظ التصنيف' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
