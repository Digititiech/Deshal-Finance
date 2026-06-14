import React, { useState, useEffect } from 'react';
import { SystemSettings, UserRole } from '../types';
import { 
  ShieldCheck, 
  Check, 
  Settings, 
  AlertTriangle, 
  Sliders, 
  Building2, 
  FileText, 
  Users, 
  MapPin, 
  Save,
  HelpCircle,
  UploadCloud,
  Mail
} from 'lucide-react';

interface SettingsModuleProps {
  systemSettings: SystemSettings;
  setSystemSettings: (s: SystemSettings) => void;
  lang: 'en' | 'ar';
  userRole?: UserRole;
}

type TabType = 'GENERAL' | 'COMPANY' | 'INVOICE_RECEIPT' | 'BRANCHES' | 'EMAIL';

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  systemSettings,
  setSystemSettings,
  lang,
  userRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<TabType>('GENERAL');

  // --- General State ---
  const [companyName, setCompanyName] = useState(systemSettings.companyName || '');
  const [companyNameAr, setCompanyNameAr] = useState(systemSettings.companyNameAr || '');
  const [registrationNo, setRegistrationNo] = useState(systemSettings.registrationNo || '');
  const [logoUrl, setLogoUrl] = useState(systemSettings.logoUrl || '');
  const [primaryCurrency, setPrimaryCurrency] = useState<'SAR' | 'OMR' | 'USD' | 'EUR'>(systemSettings.primaryCurrency || 'OMR');
  const [dateFormat, setDateFormat] = useState<'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'>(systemSettings.dateFormat || 'YYYY-MM-DD');
  const [themePrimaryColor, setThemePrimaryColor] = useState<'emerald' | 'blue' | 'indigo' | 'violet' | 'slate'>(systemSettings.themePrimaryColor || 'emerald');
  const [allowThemeToggle, setAllowThemeToggle] = useState<boolean>(systemSettings.allowThemeToggle !== false);

  // --- Company State ---
  const [companyAddress, setCompanyAddress] = useState(systemSettings.companyAddress || '');
  const [companyAddressAr, setCompanyAddressAr] = useState(systemSettings.companyAddressAr || '');
  const [companyPhone, setCompanyPhone] = useState(systemSettings.companyPhone || '');
  const [companyEmail, setCompanyEmail] = useState(systemSettings.companyEmail || '');
  const [vatCompliance, setVatCompliance] = useState<boolean>(systemSettings.vatCompliance !== false);
  const [vatRatePct, setVatRatePct] = useState<number>(systemSettings.vatRatePct ?? 15);

  // --- Invoice & Receipt State ---
  const [invoicePrefix, setInvoicePrefix] = useState(systemSettings.invoicePrefix || 'INV');
  const [receiptPrefix, setReceiptPrefix] = useState(systemSettings.receiptPrefix || 'REC');
  const [defaultDueDays, setDefaultDueDays] = useState<number>(systemSettings.defaultDueDays ?? 30);
  const [invoiceFooterTerms, setInvoiceFooterTerms] = useState(systemSettings.invoiceFooterTerms || '');
  const [invoiceFooterTermsAr, setInvoiceFooterTermsAr] = useState(systemSettings.invoiceFooterTermsAr || '');
  const [receiptFooterTerms, setReceiptFooterTerms] = useState(systemSettings.receiptFooterTerms || '');
  const [receiptFooterTermsAr, setReceiptFooterTermsAr] = useState(systemSettings.receiptFooterTermsAr || '');

  // --- Seal & Signature State ---
  const [companySealUrl, setCompanySealUrl] = useState(systemSettings.companySealUrl || '');
  const [companySealName, setCompanySealName] = useState(systemSettings.companySealName || '');
  const [companySealNameAr, setCompanySealNameAr] = useState(systemSettings.companySealNameAr || '');
  const [authorizedSignatureUrl, setAuthorizedSignatureUrl] = useState(systemSettings.authorizedSignatureUrl || '');
  const [authorizedSignatureName, setAuthorizedSignatureName] = useState(systemSettings.authorizedSignatureName || '');
  const [authorizedSignatureNameAr, setAuthorizedSignatureNameAr] = useState(systemSettings.authorizedSignatureNameAr || '');
  const [showSealOnInvoices, setShowSealOnInvoices] = useState<boolean>(systemSettings.showSealOnInvoices !== false);
  const [showSignatureOnInvoices, setShowSignatureOnInvoices] = useState<boolean>(systemSettings.showSignatureOnInvoices !== false);

  // --- Staff State ---
  const [defaultStaffSalary, setDefaultStaffSalary] = useState<number>(systemSettings.defaultStaffSalary ?? 3000);
  const [allowStaffSelfEdit, setAllowStaffSelfEdit] = useState<boolean>(!!systemSettings.allowStaffSelfEdit);
  const [restrictInvoiceDeletion, setRestrictInvoiceDeletion] = useState<boolean>(systemSettings.restrictInvoiceDeletion !== false);
  const [enforceSalaryApproval, setEnforceSalaryApproval] = useState<boolean>(systemSettings.enforceSalaryApproval !== false);

  // --- Branches State ---
  const [defaultBranchId, setDefaultBranchId] = useState(systemSettings.defaultBranchId || 'riyadh_hq');
  const [enableBranchIsolation, setEnableBranchIsolation] = useState<boolean>(systemSettings.enableBranchIsolation !== false);
  const [maxBranchesAllowed, setMaxBranchesAllowed] = useState<number>(systemSettings.maxBranchesAllowed ?? 10);
  const [realTimeNotifications, setRealTimeNotifications] = useState<boolean>(!!systemSettings.realTimeNotifications);
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(!!systemSettings.twoFactorAuth);

  // --- Email Integration State ---
  const [emailHost, setEmailHost] = useState(systemSettings.emailHost || '');
  const [emailPort, setEmailPort] = useState<number>(systemSettings.emailPort ?? 587);
  const [emailUser, setEmailUser] = useState(systemSettings.emailUser || '');
  const [emailPassword, setEmailPassword] = useState(systemSettings.emailPassword || '');
  const [emailFrom, setEmailFrom] = useState(systemSettings.emailFrom || '');
  const [emailSecure, setEmailSecure] = useState<boolean>(!!systemSettings.emailSecure);
  const [emailSendInvoices, setEmailSendInvoices] = useState<boolean>(!!systemSettings.emailSendInvoices);
  const [emailSendReceipts, setEmailSendReceipts] = useState<boolean>(!!systemSettings.emailSendReceipts);
  const [emailSendReports, setEmailSendReports] = useState<boolean>(!!systemSettings.emailSendReports);
  const [emailReportsPeriod, setEmailReportsPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>(systemSettings.emailReportsPeriod || 'Monthly');
  const [emailReportsRecipient, setEmailReportsRecipient] = useState(systemSettings.emailReportsRecipient || '');
  const [emailAlertOnLargeExpense, setEmailAlertOnLargeExpense] = useState<boolean>(!!systemSettings.emailAlertOnLargeExpense);
  const [emailAlertLargeExpenseAmount, setEmailAlertLargeExpenseAmount] = useState<number>(systemSettings.emailAlertLargeExpenseAmount ?? 10000);
  const [emailAlertOnRoleChange, setEmailAlertOnRoleChange] = useState<boolean>(!!systemSettings.emailAlertOnRoleChange);

  const [notif, setNotif] = useState('');

  useEffect(() => {
    setCompanyName(systemSettings.companyName || '');
    setCompanyNameAr(systemSettings.companyNameAr || '');
    setRegistrationNo(systemSettings.registrationNo || '');
    setLogoUrl(systemSettings.logoUrl || '');
    setPrimaryCurrency(systemSettings.primaryCurrency || 'OMR');
    setDateFormat(systemSettings.dateFormat || 'YYYY-MM-DD');
    setThemePrimaryColor(systemSettings.themePrimaryColor || 'emerald');
    setAllowThemeToggle(systemSettings.allowThemeToggle !== false);
    setCompanyAddress(systemSettings.companyAddress || '');
    setCompanyAddressAr(systemSettings.companyAddressAr || '');
    setCompanyPhone(systemSettings.companyPhone || '');
    setCompanyEmail(systemSettings.companyEmail || '');
    setVatCompliance(systemSettings.vatCompliance !== false);
    setVatRatePct(systemSettings.vatRatePct ?? 15);
    setInvoicePrefix(systemSettings.invoicePrefix || 'INV');
    setReceiptPrefix(systemSettings.receiptPrefix || 'REC');
    setDefaultDueDays(systemSettings.defaultDueDays ?? 30);
    setInvoiceFooterTerms(systemSettings.invoiceFooterTerms || '');
    setInvoiceFooterTermsAr(systemSettings.invoiceFooterTermsAr || '');
    setReceiptFooterTerms(systemSettings.receiptFooterTerms || '');
    setReceiptFooterTermsAr(systemSettings.receiptFooterTermsAr || '');
    setCompanySealUrl(systemSettings.companySealUrl || '');
    setCompanySealName(systemSettings.companySealName || '');
    setCompanySealNameAr(systemSettings.companySealNameAr || '');
    setAuthorizedSignatureUrl(systemSettings.authorizedSignatureUrl || '');
    setAuthorizedSignatureName(systemSettings.authorizedSignatureName || '');
    setAuthorizedSignatureNameAr(systemSettings.authorizedSignatureNameAr || '');
    setShowSealOnInvoices(systemSettings.showSealOnInvoices !== false);
    setShowSignatureOnInvoices(systemSettings.showSignatureOnInvoices !== false);
    setDefaultStaffSalary(systemSettings.defaultStaffSalary ?? 3000);
    setAllowStaffSelfEdit(!!systemSettings.allowStaffSelfEdit);
    setRestrictInvoiceDeletion(systemSettings.restrictInvoiceDeletion !== false);
    setEnforceSalaryApproval(systemSettings.enforceSalaryApproval !== false);
    setDefaultBranchId(systemSettings.defaultBranchId || 'riyadh_hq');
    setEnableBranchIsolation(systemSettings.enableBranchIsolation !== false);
    setMaxBranchesAllowed(systemSettings.maxBranchesAllowed ?? 10);
    setRealTimeNotifications(!!systemSettings.realTimeNotifications);
    setTwoFactorAuth(!!systemSettings.twoFactorAuth);
    setEmailHost(systemSettings.emailHost || '');
    setEmailPort(systemSettings.emailPort ?? 587);
    setEmailUser(systemSettings.emailUser || '');
    setEmailPassword(systemSettings.emailPassword || '');
    setEmailFrom(systemSettings.emailFrom || '');
    setEmailSecure(!!systemSettings.emailSecure);
    setEmailSendInvoices(!!systemSettings.emailSendInvoices);
    setEmailSendReceipts(!!systemSettings.emailSendReceipts);
    setEmailSendReports(!!systemSettings.emailSendReports);
    setEmailReportsPeriod(systemSettings.emailReportsPeriod || 'Monthly');
    setEmailReportsRecipient(systemSettings.emailReportsRecipient || '');
    setEmailAlertOnLargeExpense(!!systemSettings.emailAlertOnLargeExpense);
    setEmailAlertLargeExpenseAmount(systemSettings.emailAlertLargeExpenseAmount ?? 10000);
    setEmailAlertOnRoleChange(!!systemSettings.emailAlertOnRoleChange);
  }, [systemSettings]);

  const isEditable = userRole === 'Super Admin' || userRole === 'Admin';

  const handleApplySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) return;

    try {
      await setSystemSettings({
        companyName,
        companyNameAr,
        registrationNo,
        logoUrl,
        primaryCurrency,
        dateFormat,
        themePrimaryColor,
        allowThemeToggle,
        companyAddress,
        companyAddressAr,
        companyPhone,
        companyEmail,
        vatCompliance,
        vatRatePct,
        invoicePrefix,
        receiptPrefix,
        defaultDueDays,
        invoiceFooterTerms,
        invoiceFooterTermsAr,
        receiptFooterTerms,
        receiptFooterTermsAr,
        companySealUrl,
        companySealName,
        companySealNameAr,
        authorizedSignatureUrl,
        authorizedSignatureName,
        authorizedSignatureNameAr,
        showSealOnInvoices,
        showSignatureOnInvoices,
        defaultStaffSalary,
        allowStaffSelfEdit,
        restrictInvoiceDeletion,
        enforceSalaryApproval,
        defaultBranchId,
        enableBranchIsolation,
        maxBranchesAllowed,
        realTimeNotifications,
        twoFactorAuth,
        emailHost,
        emailPort,
        emailUser,
        emailPassword,
        emailFrom,
        emailSecure,
        emailSendInvoices,
        emailSendReceipts,
        emailSendReports,
        emailReportsPeriod,
        emailReportsRecipient,
        emailAlertOnLargeExpense,
        emailAlertLargeExpenseAmount,
        emailAlertOnRoleChange
      });

      setNotif(lang === 'ar' ? 'تم حفظ كافة الإعدادات المتقدمة بنجاح!' : 'All advanced configurations applied successfully!');
    } catch (err: any) {
      console.error(err);
      setNotif(lang === 'ar' ? 'فشل حفظ الإعدادات في قاعدة البيانات: ' + (err.message || 'خطأ غير معروف') : 'Failed to save settings to database: ' + (err.message || 'Unknown error'));
    }
    setTimeout(() => setNotif(''), 5000);
  };

  const menuTabs: { id: TabType; label: string; labelAr: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'GENERAL', label: 'General / Global', labelAr: 'الإعدادات العامة', icon: Sliders },
    { id: 'COMPANY', label: 'Company Profile', labelAr: 'ملف الشركة', icon: Building2 },
    { id: 'INVOICE_RECEIPT', label: 'Invoice & Receipt', labelAr: 'الفواتير والسندات', icon: FileText },
    { id: 'BRANCHES', label: 'Branches Matrix', labelAr: 'الفروع والربط', icon: MapPin },
    { id: 'EMAIL', label: 'Email Integration', labelAr: 'الربط والبريد الإلكتروني', icon: Mail }
  ];

  return (
    <div className="space-y-6 font-sans text-start animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mb-1">
            {lang === 'ar' ? 'بورتال الإعدادات المتقدمة والمطابقة' : 'Advanced Configuration & Compliance Portal'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' ? 'بوابة التحكم الموحدة بمؤشرات المحاسبة، إقرارات القيمة المضافة، سياقات الفواتير وضوابط الأمان الإقليمية' : 'Consolidated interface to regulate currency parameters, VAT thresholds, invoicing, regional RLS defaults and personnel privileges.'}
          </p>
        </div>
      </div>

      {/* Access Warning Banner for read-only roles */}
      {!isEditable && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">
              {lang === 'ar' ? 'صلاحيات محدودة (عرض فقط)' : 'Restricted Privileges (Read-Only Mode)'}
            </span>
            <p>
              {lang === 'ar' 
                ? `أنت مسجّل كمستخدم بدوّن (${userRole}). يتطلّل تعديل الضوابط وصياغات الفروع تفعيل حساب مالك رئيسي (Owner) أو مشرف النظام.` 
                : `You are authenticated as an authorized auditor (${userRole}). Altering sequence parameters, custom tax matrices, and default ledger models requires Super Admin role flags.`}
            </p>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-px scrollbar-none">
        {menuTabs.map((mt) => {
          const Icon = mt.icon;
          const isSelected = activeSubTab === mt.id;
          return (
            <button
              key={mt.id}
              onClick={() => setActiveSubTab(mt.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold leading-none border-b-2 transition duration-150 whitespace-nowrap cursor-pointer ${
                isSelected 
                  ? 'border-emerald-600 text-emerald-700 font-semibold' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{lang === 'ar' ? mt.labelAr : mt.label}</span>
            </button>
          );
        })}
      </div>

      {notif && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-2.5 shadow-sm">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* Settings Grid Structure */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Side: Dynamic Tab forms */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 xl:col-span-2">
          <form onSubmit={handleApplySettings} className="space-y-6 text-xs">
            
            {/* 1. GENERAL TAB */}
            {activeSubTab === 'GENERAL' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-semibold text-slate-850 text-slate-800">{lang === 'ar' ? 'إعدادات المنظومة الأساسية' : 'Core Applet Preferences'}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'ar' ? 'إدارة هوية الكيان المالي الافتراضية والرموز الإنشائية' : 'Configure localized formatting, colors, and primary asset symbols.'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Language default */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'قيمة العملة الموحدة للتقارير' : 'Base Assets Currency'}</label>
                    <select
                      value={primaryCurrency}
                      disabled={!isEditable}
                      onChange={(e) => setPrimaryCurrency(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 text-slate-705 text-slate-700 rounded-xl p-2.5 outline-none font-bold"
                    >
                      <option value="OMR">OMR (ر.ع - الريال العماني)</option>
                      <option value="SAR">SAR (ر.س - الريال السعودي)</option>
                      <option value="USD">USD ($ - الدولار الأمريكي)</option>
                      <option value="EUR">EUR (€ - اليورو الأوروبي)</option>
                    </select>
                  </div>

                  {/* Date format preferences */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'نسق كتابة التاريخ' : 'Default Date Format'}</label>
                    <select
                      value={dateFormat}
                      disabled={!isEditable}
                      onChange={(e) => setDateFormat(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 text-slate-705 text-slate-700 rounded-xl p-2.5 outline-none font-mono font-semibold"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2026-06-12)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (12/06/2026)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (06/12/2026)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Theme Accent selector */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'اللون المميز لواجهة المستخدم' : 'Aesthetic Primary Color Way'}</label>
                    <select
                      value={themePrimaryColor}
                      disabled={!isEditable}
                      onChange={(e) => setThemePrimaryColor(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl p-2.5 outline-none font-semibold capitalize"
                    >
                      <option value="emerald">Emerald Green (نبيل)</option>
                      <option value="blue">Sapphire Blue (سماء)</option>
                      <option value="indigo">Tech Indigo (تقني)</option>
                      <option value="violet">Royal Violet (ملكي)</option>
                      <option value="slate">Cool Slate (بروتاليست)</option>
                    </select>
                  </div>

                  {/* Allow Custom Theme switches */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'بروتوكولات تغيير المظهر' : 'Interactive Theme Options'}</label>
                    <div className="mt-2.5">
                      <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isEditable}
                          checked={allowThemeToggle}
                          onChange={(e) => setAllowThemeToggle(e.target.checked)}
                          className="w-4 h-4 accent-emerald-600 rounded"
                        />
                        <span className="text-slate-700 font-medium pl-1.5">{lang === 'ar' ? 'السماح بالتبديل السريع بين الصباحي/المهني' : 'Permit immediate client switches'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. COMPANY TAB */}
            {activeSubTab === 'COMPANY' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-semibold text-slate-800">{lang === 'ar' ? 'بيانات الكيان والهوية الضريبية' : 'Official Legal Profile & Address'}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'ar' ? 'بيانات التراخيص الحكومية المطبوعة تلقائياً في الفواتير وفي التقارير المعتمدة' : 'Official licensing and compliance variables printed directly onto invoices.'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name EN */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الاسم التجاري (اللغة الإنجليزية)' : 'Trading Name (English)'}</label>
                    <input
                      type="text"
                      required
                      disabled={!isEditable}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none"
                    />
                  </div>

                  {/* Name AR */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الاسم التجاري المعتمد (بالعربية)' : 'Trading Name (Arabic)'}</label>
                    <input
                      type="text"
                      required
                      disabled={!isEditable}
                      value={companyNameAr}
                      onChange={(e) => setCompanyNameAr(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Reg No */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'سجل السلسلة / رقم القيد الضريبي' : 'Corporate Registry / Tax Reference ID'}</label>
                    <input
                      type="text"
                      required
                      disabled={!isEditable}
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none font-mono"
                    />
                  </div>

                  {/* Support Phone */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'رقم الهاتف المعتمد للدائرة المالية' : 'Registered Treasury Telephone'}</label>
                    <input
                      type="text"
                      disabled={!isEditable}
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="+966-11-202-0000"
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'البريد الإلكتروني الموجه له المطالبات' : 'Finance Operations Dispatch Email'}</label>
                  <input
                    type="email"
                    disabled={!isEditable}
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="billing@nexus.com"
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Address EN */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'العنوان الإداري (English)' : 'Corporate Address (English)'}</label>
                    <input
                      type="text"
                      disabled={!isEditable}
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Floor 42, Olaya Tower, Riyadh"
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none text-xxs"
                    />
                  </div>

                  {/* Address AR */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'العنوان التجاري المسجل (بالعربية)' : 'Corporate Address (Arabic)'}</label>
                    <input
                      type="text"
                      disabled={!isEditable}
                      value={companyAddressAr}
                      onChange={(e) => setCompanyAddressAr(e.target.value)}
                      placeholder="برج العليا، الطابق ٤٢، العليا، الرياض"
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none text-xxs sans-serif"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 border-slate-200 space-y-3 pt-3">
                  <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">{lang === 'ar' ? 'تنظيمات القيمة المضافة (VAT)' : 'Active VAT Compliance Audits'}</span>
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!isEditable}
                        checked={vatCompliance}
                        onChange={(e) => setVatCompliance(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded"
                      />
                      <span className="text-slate-700 font-semibold pl-1">{lang === 'ar' ? 'إخضاع الفواتير المكتوبة للضريبة' : 'Enforce dynamic VAT Calculations'}</span>
                    </label>

                    {vatCompliance && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold">{lang === 'ar' ? 'النسبة المحسوبة (%)' : 'Tax Percentage Rate (%)'}:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={!isEditable}
                          value={vatRatePct}
                          onChange={(e) => setVatRatePct(parseFloat(e.target.value) || 0)}
                          className="w-16 bg-white border border-slate-200 text-slate-800 rounded-lg p-1.5 text-center font-mono font-bold"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Uploader for Company Logo */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 pt-3">
                  <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">
                    {lang === 'ar' ? 'شعار الشركة المعتمد في الفواتير والايصالات' : 'Corporate Official Branding Logo'}
                  </span>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Live Logo Preview container */}
                    <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 relative shadow-sm shrink-0 overflow-hidden group">
                      {logoUrl ? (
                        <>
                          <img src={logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setLogoUrl('')}
                            disabled={!isEditable}
                            title={lang === 'ar' ? 'إزالة الشعار' : 'Remove logo'}
                            className="absolute inset-x-0 bottom-0 bg-slate-900/75 text-white py-0.5 text-[9px] text-center font-bold duration-150 border-0 cursor-pointer"
                          >
                            {lang === 'ar' ? 'حذف' : 'Remove'}
                          </button>
                        </>
                      ) : (
                        <div className="text-[9px] text-slate-400 text-center uppercase tracking-normal">
                          {lang === 'ar' ? 'لا شعار' : 'No Logo'}
                        </div>
                      )}
                    </div>

                    {/* Drag and Drop / Select Zone */}
                    <div className="flex-1 w-full">
                      {isEditable ? (
                        <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer duration-150 hover:bg-slate-100/50 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setLogoUrl(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                          <span className="text-xxs font-bold text-slate-700 block">
                            {lang === 'ar' ? 'قم بسحب الشعار هنا أو اضغط للاختيار' : 'Drag image here or click to browse'}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5 block">
                            {lang === 'ar' ? 'يدعم صيغ PNG, JPG, SVG وحجم خفيف' : 'Supports PNG, JPEG, SVG; auto-embedded onto print layouts'}
                          </span>
                        </label>
                      ) : (
                        <p className="text-[10px] text-slate-400">
                          {lang === 'ar' ? 'تعديل شعار الشركة متاح للمشرفين المعتمدين فقط.' : 'Company logo modifications are restricted to Senior Partners/Admins only.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Manual input for Logo URL fallback */}
                  <div className="pt-2 border-t border-slate-100/60">
                    <label className="text-slate-500 block mb-1 text-xxs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'رابط خيار الشعار المباشر (URL Fallback)' : 'Alternative Image Web URL (Fallback)'}
                    </label>
                    <input
                      type="url"
                      disabled={!isEditable}
                      value={logoUrl.startsWith('data:') ? '' : logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2 py-1.5 outline-none font-mono text-xxs"
                    />
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      {lang === 'ar' ? 'يمكن توفير رابط مباشر للصورة من خادم ويب بدلاً من التحميل المباشر' : 'Optional: provide a secure, hosted static image directly if preferred.'}
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* 3. INVOICE & RECEIPT TAB */}
            {activeSubTab === 'INVOICE_RECEIPT' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-semibold text-slate-800">{lang === 'ar' ? 'قواعد صياغة الفواتير وسندات القبض' : 'Invoices Sequences & Legal Slips terms'}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'ar' ? 'تخصيص الوتائر المعرفية للمستندات والآجال التلقائية الممنوحة للعملاء' : 'Customize invoice prefixes, default credit terms, and compliance declarations.'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Invoice Prefix */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'سابقة الفاتورة (Invoice Prefix)' : 'Invoice Ref Prefix'}</label>
                    <input
                      type="text"
                      required
                      disabled={!isEditable}
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value)}
                      placeholder="INV"
                      className="w-full bg-white border border-slate-200 text-slate-850 text-slate-800 rounded-xl p-2.5 outline-none font-mono font-bold"
                    />
                  </div>

                  {/* Receipt Prefix */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'سابقة السند (Receipt Prefix)' : 'Receipt Ref Prefix'}</label>
                    <input
                      type="text"
                      required
                      disabled={!isEditable}
                      value={receiptPrefix}
                      onChange={(e) => setReceiptPrefix(e.target.value)}
                      placeholder="REC"
                      className="w-full bg-white border border-slate-200 text-slate-850 text-slate-800 rounded-xl p-2.5 outline-none font-mono font-bold"
                    />
                  </div>

                  {/* Default credit due days */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'أجل الدفع الافتراضي (أيام)' : 'Default Credit Cycle (Days)'}</label>
                    <input
                      type="number"
                      required
                      min="1"
                      disabled={!isEditable}
                      value={defaultDueDays}
                      onChange={(e) => setDefaultDueDays(parseInt(e.target.value) || 30)}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Invoice Footer EN */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'شروط وإخلاء مسؤولية الفاتورة (English)' : 'Invoice Footer / Terms Note (English)'}</label>
                  <textarea
                    rows={2}
                    disabled={!isEditable}
                    value={invoiceFooterTerms}
                    onChange={(e) => setInvoiceFooterTerms(e.target.value)}
                    placeholder="e.g. Please wire payouts within due days. All claims subject to Riyadh jurisdiction."
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none"
                  />
                </div>

                {/* Invoice Footer AR */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'شروط وإخلاء مسؤولية الفاتورة (عربي)' : 'Invoice Footer / Terms Note (Arabic)'}</label>
                  <textarea
                    rows={2}
                    disabled={!isEditable}
                    value={invoiceFooterTermsAr}
                    onChange={(e) => setInvoiceFooterTermsAr(e.target.value)}
                    placeholder="مثال: يلتزم الشريك بسداد المبالغ في غضون الآجال المعتمدة. النزاعات تخضع للاختصاص التجاري."
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none font-sans"
                  />
                </div>

                {/* Receipt Footer EN */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'حاشية إشعارات المقبوضات (English)' : 'Receipt Footer / Clearance (English)'}</label>
                  <textarea
                    rows={2}
                    disabled={!isEditable}
                    value={receiptFooterTerms}
                    onChange={(e) => setReceiptFooterTerms(e.target.value)}
                    placeholder="e.g. This is a secure digital slip confirming the payoff of the corresponding billing balance."
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none"
                  />
                </div>

                {/* Receipt Footer AR */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'حاشية إشعارات المقبوضات (عربي)' : 'Receipt Footer / Clearance (Arabic)'}</label>
                  <textarea
                    rows={2}
                    disabled={!isEditable}
                    value={receiptFooterTermsAr}
                    onChange={(e) => setReceiptFooterTermsAr(e.target.value)}
                    placeholder="مثال: يعتبر هذا المستند حافظة براءة للذمة ومقاصة فورية للمبالغ المقبوضه والمسجلة بنظام الشركة."
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none font-sans"
                  />
                </div>

                {/* --- COMPANY SEAL & AUTHORIZED SIGNATURE SECTION --- */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 pt-4 mt-6">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                        {lang === 'ar' ? 'ختم الشركة الرقمي والتوقيع المعتمد للفواتير' : 'Company Digital Seal & Authorized Signature'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {lang === 'ar' ? 'قم بتعديل ترويسة ومحتوى الختم الرسمي وتوقيع المدير المالي للظهور عند الطباعة' : 'Regulate the corporate stamp text/image and authorized official signature appearing on printed invoices.'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Show Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xxs bg-white p-3 rounded-lg border border-slate-200">
                    <label className="flex items-center space-x-2 space-x-reverse cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        disabled={!isEditable}
                        checked={showSealOnInvoices}
                        onChange={(e) => setShowSealOnInvoices(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded"
                      />
                      <span className="pl-1">{lang === 'ar' ? 'إظهار الختم الرقمي على الفاتورة' : 'Display Digital Seal on Invoices'}</span>
                    </label>

                    <label className="flex items-center space-x-2 space-x-reverse cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        disabled={!isEditable}
                        checked={showSignatureOnInvoices}
                        onChange={(e) => setShowSignatureOnInvoices(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded"
                      />
                      <span className="pl-1">{lang === 'ar' ? 'إظهار التوقيع المعتمد على الفاتورة' : 'Display Authorized Signature on Invoices'}</span>
                    </label>
                  </div>

                  {/* 1. DIGITAL SEAL MANAGER */}
                  {showSealOnInvoices && (
                    <div className="space-y-3 border-t border-slate-200/50 pt-2 text-xxs">
                      <span className="font-bold text-slate-700 block text-[11px]">
                        {lang === 'ar' ? '١. إعدادات الختم الرقمي' : '1. Digital Seal / Stamp Settings'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الاسم بالختم (English)' : 'Name inside Stamp (English)'}</label>
                          <input
                            type="text"
                            disabled={!isEditable}
                            value={companySealName}
                            onChange={(e) => setCompanySealName(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2 outline-none font-sans"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الاسم بالختم (بالعربية)' : 'Name inside Stamp (Arabic)'}</label>
                          <input
                            type="text"
                            disabled={!isEditable}
                            value={companySealNameAr}
                            onChange={(e) => setCompanySealNameAr(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2 outline-none font-sans"
                          />
                        </div>
                      </div>

                      {/* Seal Image Upload */}
                      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-3 rounded-xl border border-slate-200 text-xxs">
                        <div className="w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center p-2 relative shadow-sm shrink-0 overflow-hidden group">
                          {companySealUrl ? (
                            <>
                              <img src={companySealUrl} alt="Seal preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                              <button
                                type="button"
                                onClick={() => setCompanySealUrl('')}
                                disabled={!isEditable}
                                className="absolute inset-x-0 bottom-0 bg-slate-900/75 text-white py-0.5 text-[8px] text-center font-bold duration-150 border-0 cursor-pointer"
                              >
                                {lang === 'ar' ? 'حذف' : 'Remove'}
                              </button>
                            </>
                          ) : (
                            <div className="text-[8px] text-center text-emerald-600 font-bold border-2 border-dashed border-emerald-300 rounded-full w-full h-full flex items-center justify-center p-1 uppercase leading-none">
                              {lang === 'ar' ? 'ختم تلقائي' : 'Auto Stamp'}
                            </div>
                          )}
                        </div>

                        {/* Drag and drop seal */}
                        <div className="flex-1 w-full">
                          {isEditable ? (
                            <label className="border border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer duration-150 hover:bg-slate-100/50 text-center">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      if (typeof reader.result === 'string') {
                                        setCompanySealUrl(reader.result);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <UploadCloud className="w-4 h-4 text-slate-400 mb-0.5" />
                              <span className="text-[10px] font-bold text-slate-700 block">
                                {lang === 'ar' ? 'رفع صورة ختم مخصصة هنا' : 'Drop custom stamp PNG here'}
                              </span>
                            </label>
                          ) : (
                            <p className="text-[9px] text-slate-400">{lang === 'ar' ? 'التعديل محمي' : 'Permission protected'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. HANDWRITTEN / AUTHORIZED SIGNATURE */}
                  {showSignatureOnInvoices && (
                    <div className="space-y-3 border-t border-slate-200/50 pt-3 text-xxs">
                      <span className="font-bold text-slate-700 block text-[11px]">
                        {lang === 'ar' ? '٢. إعدادات التوقيع الإداري المعتمد' : '2. Authorized Signatory Settings'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'اسم صاحب التوقيع (English)' : 'Signatory Name (English)'}</label>
                          <input
                            type="text"
                            disabled={!isEditable}
                            value={authorizedSignatureName}
                            onChange={(e) => setAuthorizedSignatureName(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2 outline-none font-sans"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'اسم صاحب التوقيع (بالعربية)' : 'Signatory Name (Arabic)'}</label>
                          <input
                            type="text"
                            disabled={!isEditable}
                            value={authorizedSignatureNameAr}
                            onChange={(e) => setAuthorizedSignatureNameAr(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2 outline-none font-sans"
                          />
                        </div>
                      </div>

                      {/* Signature Image Upload */}
                      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-3 rounded-xl border border-slate-200 text-xxs">
                        <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1 relative shadow-sm shrink-0 overflow-hidden group">
                          {authorizedSignatureUrl ? (
                            <>
                              <img src={authorizedSignatureUrl} alt="Signature preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                              <button
                                type="button"
                                onClick={() => setAuthorizedSignatureUrl('')}
                                disabled={!isEditable}
                                className="absolute inset-x-0 bottom-0 bg-slate-900/75 text-white py-0.5 text-[8px] text-center font-bold duration-150 border-0 cursor-pointer"
                              >
                                {lang === 'ar' ? 'حذف' : 'Remove'}
                              </button>
                            </>
                          ) : (
                            <div className="text-[8px] text-center text-slate-600 font-serif italic border border-slate-200 rounded w-full h-full flex items-center justify-center leading-none select-none">
                              {lang === 'ar' ? 'خط مائل' : 'Cursive'}
                            </div>
                          )}
                        </div>

                        {/* Drag and drop signature */}
                        <div className="flex-1 w-full">
                          {isEditable ? (
                            <label className="border border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer duration-150 hover:bg-slate-100/50 text-center">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      if (typeof reader.result === 'string') {
                                        setAuthorizedSignatureUrl(reader.result);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <UploadCloud className="w-4 h-4 text-slate-400 mb-0.5" />
                              <span className="text-[10px] font-bold text-slate-700 block">
                                {lang === 'ar' ? 'رفع صورة التوقيع المعتمد هنا' : 'Drop signature PNG here'}
                              </span>
                            </label>
                          ) : (
                            <p className="text-[9px] text-slate-400">{lang === 'ar' ? 'التعديل محمي' : 'Permission protected'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. BRANCHES TAB */}
            {activeSubTab === 'BRANCHES' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-semibold text-slate-800">{lang === 'ar' ? 'قواعد العزل الجغرافي للفروع والإنذار' : 'Branches limits & Geographical Isolation'}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'ar' ? 'تفعيل حماية المستندات الإقليمية RLS وحدود التشغيل للفروع النشطة' : 'Enforcing metadata isolation (RLS), alerts and hub boundaries.'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Default branch indicator */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الفرع الافتراضي للمدخلات الجديدة' : 'Default Target Branch Gateway'}</label>
                    <select
                      value={defaultBranchId}
                      disabled={!isEditable}
                      onChange={(e) => setDefaultBranchId(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl p-2.5 outline-none font-semibold"
                    >
                      <option value="riyadh_hq">{lang === 'ar' ? 'المركز الرئيسي - الرياض' : 'Riyadh HQ Branch'}</option>
                      <option value="london_financial">{lang === 'ar' ? 'مركز لندن المالي' : 'London Financial Hub'}</option>
                      <option value="new_york_plaza">{lang === 'ar' ? 'نيويورك بلازا' : 'New York Plaza'}</option>
                      <option value="berlin_tech">{lang === 'ar' ? 'فرع برلين التقني' : 'Berlin Tech Branch'}</option>
                      <option value="dubai_marina">{lang === 'ar' ? 'دبي مارينا' : 'Dubai Marina'}</option>
                    </select>
                  </div>

                  {/* Max Branches warnings */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'العتبة القصوى لعدد الفروع المسموحة' : 'Operational Branch Warning Limit'}</label>
                    <input
                      type="number"
                      required
                      min="1"
                      disabled={!isEditable}
                      value={maxBranchesAllowed}
                      onChange={(e) => setMaxBranchesAllowed(parseInt(e.target.value) || 10)}
                      className="w-full bg-white border border-slate-200 text-slate-805 text-slate-800 rounded-xl p-2.5 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 text-start">
                  
                  {/* Enable Branch RLS Isolation */}
                  <label className="flex items-start space-x-3 space-x-reverse cursor-pointer p-0.5">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={enableBranchIsolation}
                      onChange={(e) => setEnableBranchIsolation(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded shrink-0 mt-0.5"
                    />
                    <div className="pl-1 text-left">
                      <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">{lang === 'ar' ? 'تفعيل نظام عزل الحسابات الإقليمي (RLS)' : 'Enforce RLS Data Isolation Laws'}</span>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">{lang === 'ar' ? 'يمنع مدراء الفروع والموظفين العاديين من تصفح الإيرادات وعملاء الفروع الأخرى' : 'Binds branch managers and operations staff to view, create and alter records for their assigned branch ONLY.'}</p>
                    </div>
                  </label>

                  {/* 2FA */}
                  <label className="flex items-start space-x-3 space-x-reverse cursor-pointer p-0.5">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={twoFactorAuth}
                      onChange={(e) => setTwoFactorAuth(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded shrink-0 mt-0.5"
                    />
                    <div className="pl-1 text-left">
                      <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">{lang === 'ar' ? 'تشديد المصادقة الثنائية قبل السداد (2FA)' : 'Two-Factor Secure Ledger Clearings (2FA)'}</span>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">{lang === 'ar' ? 'طلب توثيق الأجهزة الموثوقة لتأكيد سحب المصروفات والتحصيل' : 'Require external YubiKey/FIDO2 hardware challenge validation when approving ledger bills exceeding threshold.'}</p>
                    </div>
                  </label>

                  {/* Alerts */}
                  <label className="flex items-start space-x-3 space-x-reverse cursor-pointer p-0.5">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={realTimeNotifications}
                      onChange={(e) => setRealTimeNotifications(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded shrink-0 mt-0.5"
                    />
                    <div className="pl-1 text-left">
                      <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">{lang === 'ar' ? 'بث الإخطارات المباشرة للمدراء الماليين' : 'Dispatch Real-time Auditor Warnings'}</span>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">{lang === 'ar' ? 'إرسال تنبيه فوري بالبريد الإلكتروني للشركاء عند وجود كشوف صرف استثنائية' : 'Transmit immediate secure audit push alerts upon any cash outflows exceeding $10,000.'}</p>
                    </div>
                  </label>

                </div>
              </div>
            )}

            {/* 6. EMAIL TAB */}
            {activeSubTab === 'EMAIL' && (
              <div className="space-y-6 text-start">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {lang === 'ar' ? 'إإعدادات ربط البريد الصادر والتنبيهات' : 'Email SMTP & Notifications Routing'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {lang === 'ar' ? 'ربط البوابة بخادم البريد الصادر SMTP لتفعيل إرسال الفواتير، السندات، التقارير الدورية وإشعارات الأمان والتدقيق' : 'Integrate your SMTP relay to enable automated dispatch of customer invoices, digital receipts, management reports, and security audits.'}
                  </p>
                </div>

                {/* Section 1: SMTP Gateway Credentials */}
                <div className="space-y-4">
                  <span className="font-bold text-slate-700 block text-xxs uppercase tracking-wider">
                    {lang === 'ar' ? '١. إعدادات خادم البريد الصادر (SMTP Relay)' : '1. SMTP Mail Server Configuration'}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'عنوان خادم SMTP' : 'SMTP Server Host'}</label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        value={emailHost}
                        onChange={(e) => setEmailHost(e.target.value)}
                        placeholder="e.g. smtp.gmail.com"
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'منفذ SMTP' : 'SMTP Port'}</label>
                        <input
                          type="number"
                          disabled={!isEditable}
                          value={emailPort}
                          onChange={(e) => setEmailPort(parseInt(e.target.value) || 587)}
                          placeholder="587"
                          className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'اتصال آمن' : 'SSL/TLS Secure'}</label>
                        <div className="mt-2.5">
                          <label className="flex items-center space-x-1.5 space-x-reverse cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={!isEditable}
                              checked={emailSecure}
                              onChange={(e) => setEmailSecure(e.target.checked)}
                              className="w-4 h-4 accent-emerald-600 rounded"
                            />
                            <span className="text-slate-700 font-medium">{lang === 'ar' ? 'تفعيل SSL' : 'Use SSL'}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'اسم المستخدم للبريد' : 'SMTP Username'}</label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        value={emailUser}
                        onChange={(e) => setEmailUser(e.target.value)}
                        placeholder="e.g. sender@example.com"
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'كلمة مرور التطبيق (App Password)' : 'SMTP App Password'}</label>
                      <input
                        type="password"
                        disabled={!isEditable}
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {lang === 'ar' ? 'يجب استخدام كلمة مرور التطبيقات (App Password) المخصصة من جهة البريد الإلكتروني وليس كلمة المرور الأساسية.' : 'You must use a dedicated App Password generated from your email provider instead of the primary account password.'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'البريد المرسل المعتمد (اسم أو عنوان)' : 'From Display Sender Name & Email'}</label>
                    <input
                      type="text"
                      disabled={!isEditable}
                      value={emailFrom}
                      onChange={(e) => setEmailFrom(e.target.value)}
                      placeholder="e.g. Nexus Finance Treasury <finance@nexusco.com>"
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 outline-none font-semibold"
                    />
                  </div>
                </div>

                {/* Section 2: Automated Outbox Dispatch Settings */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 pt-4">
                  <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">
                    {lang === 'ar' ? '٢. خيارات الإرسال التلقائي للعملاء والشركاء' : '2. Automated Dispatch & Report Options'}
                  </span>

                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!isEditable}
                        checked={emailSendInvoices}
                        onChange={(e) => setEmailSendInvoices(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded shrink-0 mt-0.5"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">{lang === 'ar' ? 'إرسال الفواتير للعملاء تلقائياً' : 'Auto Dispatch Invoices to Customers'}</span>
                        <p className="text-slate-400 mt-0.5">{lang === 'ar' ? 'إرسال نسخة PDF من الفاتورة إلى البريد الإلكتروني المسجل للعميل فور اعتمادها بنجاح' : 'Automatically dispatch a bilingual PDF invoice copy to the customer contact email upon submission.'}</p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!isEditable}
                        checked={emailSendReceipts}
                        onChange={(e) => setEmailSendReceipts(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded shrink-0 mt-0.5"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">{lang === 'ar' ? 'إرسال سندات القبض للعملاء تلقائياً' : 'Auto Dispatch Payments Receipts'}</span>
                        <p className="text-slate-400 mt-0.5">{lang === 'ar' ? 'إرسال سندات القبض أو إيصالات براءة الذمة فورياً للعميل عند ربط تحصيل مالي بالفاتورة' : 'Automatically dispatch secure payment receipt confirmations to client emails upon ledger payoffs.'}</p>
                      </div>
                    </label>

                    <div className="border-t border-slate-200/60 pt-3 space-y-3">
                      <label className="flex items-start space-x-3 space-x-reverse cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isEditable}
                          checked={emailSendReports}
                          onChange={(e) => setEmailSendReports(e.target.checked)}
                          className="w-4 h-4 accent-emerald-600 rounded shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">{lang === 'ar' ? 'إرسال تقارير مالية دورية للمسؤولين' : 'Send Recurring Management Audit Reports'}</span>
                          <p className="text-slate-400 mt-0.5">{lang === 'ar' ? 'إرسال ملخصات الحسابات، الأرباح والخسائر، وموازنة الفروع للبريد المسجل' : 'Compile and transmit automatic P&L balances, branch metrics, and tax summary tables to partners.'}</p>
                        </div>
                      </label>

                      {emailSendReports && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7 pr-7 pt-2">
                          <div>
                            <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'دورية إرسال التقرير' : 'Report Frequency'}</label>
                            <select
                              value={emailReportsPeriod}
                              disabled={!isEditable}
                              onChange={(e) => setEmailReportsPeriod(e.target.value as any)}
                              className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl p-2 outline-none font-semibold"
                            >
                              <option value="Daily">{lang === 'ar' ? 'يومياً' : 'Daily'}</option>
                              <option value="Weekly">{lang === 'ar' ? 'أسبوعياً' : 'Weekly'}</option>
                              <option value="Monthly">{lang === 'ar' ? 'شهرياً' : 'Monthly'}</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'بريد استلام التقارير (متعدد مفصول بفواصل)' : 'Recipient Emails (Comma-separated)'}</label>
                            <input
                              type="text"
                              disabled={!isEditable}
                              value={emailReportsRecipient}
                              onChange={(e) => setEmailReportsRecipient(e.target.value)}
                              placeholder="e.g. partner1@co.com, admin@co.com"
                              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2 outline-none font-mono text-xxs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Audit & Security Alerts */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 pt-4">
                  <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">
                    {lang === 'ar' ? '٣. إشعارات وتنبيهات التدقيق والأمان' : '3. Auditing Alert Rules'}
                  </span>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3 space-x-reverse cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isEditable}
                          checked={emailAlertOnLargeExpense}
                          onChange={(e) => setEmailAlertOnLargeExpense(e.target.checked)}
                          className="w-4 h-4 accent-emerald-600 rounded shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">{lang === 'ar' ? 'تنبيه فوري عند تسجيل مصروفات كبيرة' : 'Alert on Large Expense Outflows'}</span>
                          <p className="text-slate-400 mt-0.5">{lang === 'ar' ? 'إرسال تنبيه بالبريد الإلكتروني للشركاء فور تسجيل أو طلب صرف مبلغ يتعدى العتبة المحددة' : 'Send an immediate secure notification to administration if any safe disbursement voucher exceeds threshold.'}</p>
                        </div>
                      </label>

                      {emailAlertOnLargeExpense && (
                        <div className="pl-7 pr-7 pt-2 flex items-center gap-3">
                          <span className="text-slate-500 font-bold">{lang === 'ar' ? 'عتبة التنبيه المالي:' : 'Expense Alert Threshold Amount:'}</span>
                          <input
                            type="number"
                            min="1"
                            disabled={!isEditable}
                            value={emailAlertLargeExpenseAmount}
                            onChange={(e) => setEmailAlertLargeExpenseAmount(parseFloat(e.target.value) || 10000)}
                            className="w-32 bg-white border border-slate-200 text-slate-800 rounded-xl p-2 text-center font-mono font-bold"
                          />
                          <span className="text-slate-500 font-bold">{systemSettings.primaryCurrency || 'OMR'}</span>
                        </div>
                      )}
                    </div>

                    <label className="flex items-start space-x-3 space-x-reverse cursor-pointer border-t border-slate-200/60 pt-3">
                      <input
                        type="checkbox"
                        disabled={!isEditable}
                        checked={emailAlertOnRoleChange}
                        onChange={(e) => setEmailAlertOnRoleChange(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded shrink-0 mt-0.5"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block text-xxs uppercase tracking-wider">{lang === 'ar' ? 'تنبيه فوري عند تغيير أدوار الموظفين' : 'Alert on Personnel Role Changes'}</span>
                        <p className="text-slate-400 mt-0.5">{lang === 'ar' ? 'إرسال تنبيه بريدي فوري للشركاء عند تعديل صلاحيات أو أدوار الموظفين لتجنب الاحتيال' : 'Transmit an audit email if any personnel role or database privileges are altered by an admin.'}</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* save button */}
            {isEditable && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 hover:shadow-md text-white font-bold rounded-xl transition duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-center"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'حفظ وتفعيل التعديلات' : 'Save Advanced Configurations'}</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Side: Status/Metadata display */}
        <div className="space-y-6">
          
          {/* Settings Integrity Score card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 
                {lang === 'ar' ? 'امتثال وحالة قواعد البيانات' : 'Vault Security Status'}
              </h3>
              <span className="text-xxs text-slate-400 mt-1 block">{lang === 'ar' ? 'مؤشرات اتساق الإعدادات وسلامة الأصول' : 'Ledger state parameters & secure keys'}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 font-mono text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'تكامل الإعدادات:' : 'Config Integrity:'}</span>
                <span className="text-emerald-600 font-bold">100% ALIGNED</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'عزل الفروع معقود:' : 'RLS Isolation Lock:'}</span>
                <span className={`${enableBranchIsolation ? 'text-emerald-600 font-bold' : 'text-slate-400 font-bold'}`}>
                  {enableBranchIsolation ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'السجل الضريبى:' : 'VAT Compliance:'}</span>
                <span className={`${vatCompliance ? 'text-emerald-600 font-bold' : 'text-slate-400 font-semibold'}`}>
                  {vatCompliance ? `ACTIVE (${vatRatePct}%)` : 'COMPLIANCE OFF'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'تاريخ البناء:' : 'Applet Build:'}</span>
                <span className="text-slate-700 font-bold">v3.1.0-FMS</span>
              </div>
              <div className="flex justify-between text-start items-center">
                <span>{lang === 'ar' ? 'الرمز التعريفي:' : 'Intranet ID:'}</span>
                <span className="text-slate-500 font-bold select-all underline text-[10px] truncate max-w-[130px]">9299a6e8-5b89</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xxs text-slate-600 text-start leading-relaxed">
              <span className="font-bold text-emerald-800 block mb-1 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                {lang === 'ar' ? 'تحديث تلقائي:' : 'Dynamic Propagation:'}
              </span>
              <p className="text-slate-500">
                {lang === 'ar' 
                  ? 'بمجرد تنصيب الإعدادات، تنعكس الفواتير الصادرة وسلاسل التعيين آلياً في شاشات الإدخال، دون فقدان سجلات القيّد التاريخية.' 
                  : 'Modifying these settings instantly adjusts dynamic calculations such as base currency formatting, sequential receipts nomenclature and VAT variables worldwide.'}
              </p>
            </div>
          </div>

          {/* Configuration Preview Slate card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-start space-y-3">
            <h4 className="text-xs font-bold text-slate-850 text-slate-800 uppercase flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-emerald-600" />
              {lang === 'ar' ? 'معاينة القوالب' : 'Format Nomenclature Previews'}
            </h4>
            <p className="text-xxs text-slate-400">{lang === 'ar' ? 'مظهر الرموز والأرقام المحسوبة المطبقة حالياً' : 'Live look outputs based on current tabs values'}</p>
            
            <div className="space-y-2 border-t border-slate-100 pt-3 text-[11px] font-mono text-slate-600">
              <div className="flex justify-between items-center py-1">
                <span>{lang === 'ar' ? 'الفاتورة الأولى للمشروع:' : 'First Invoice No:'}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">{invoicePrefix}-2026-001</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>{lang === 'ar' ? 'السند المالي الأول:' : 'First Receipt No:'}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">{receiptPrefix}-2026-001</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>{lang === 'ar' ? 'العائد الخاضع للضريبة:' : 'Calculated Gross ($1,000):'}</span>
                <span className="font-bold text-emerald-600">
                  {primaryCurrency === 'SAR' ? 'ر.س ' : primaryCurrency === 'EUR' ? '€ ' : '$'}
                  {(vatCompliance ? 1000 * (1 + vatRatePct / 100) : 1000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
