import React, { useState } from 'react';
import { UserRole } from '../types';
import { ArrowLeft, ArrowRight, Key, ShieldCheck } from 'lucide-react';

interface AuthSimProps {
  login: (role: UserRole, branchId: string) => void;
  lang: 'en' | 'ar';
}

export const AuthSim: React.FC<AuthSimProps> = ({ login, lang }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Super Admin');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const rolesList: { role: UserRole; label: string; labelAr: string; desc: string; descAr: string }[] = [
    { 
      role: 'Super Admin', 
      label: 'Super Admin', 
      labelAr: 'المشرف العام', 
      desc: 'Full global system controls. All branches, reports, settings, and workspace modifications are accessible.', 
      descAr: 'صلاحيات كاملة للمشرف العام. الوصول إلى كافة الفروع، التقارير، الإعدادات، وتعديلات مساحات العمل.' 
    },
    { 
      role: 'Admin', 
      label: 'Administrator', 
      labelAr: 'مسؤول النظام', 
      desc: 'Administrative access. Modify personnel, custom configurations and run audit reports across all branches.', 
      descAr: 'وصول الإدارة. تعديل تفاصيل الموظفين والفرع، وتشغيل تقارير المراجعة لجميع الفروع.' 
    },
    { 
      role: 'Manager', 
      label: 'Regional Manager', 
      labelAr: 'مدير إقليمي', 
      desc: 'Branch manager role. Access is restricted to their assigned branch data only. Enforces local branch RLS.', 
      descAr: 'دور مدير الفرع. يقتصر الوصول على بيانات فرعه المعين فقط لتأجير العزل الجغرافي للمعلومات.' 
    },
    { 
      role: 'Accountant', 
      label: 'Corporate Accountant', 
      labelAr: 'المحاسب الرئيسي', 
      desc: 'Responsible for ledger activities, creating receipts, recording income, but cannot modify core system configurations.', 
      descAr: 'مسؤول عن الأنشطة الحسابية، تسجيل الإيرادات والمصروفات، وإنشاء الفواتير وسندات القبض.' 
    },
    { 
      role: 'Employee', 
      label: 'Operations Staff', 
      labelAr: 'موظف العمليات', 
      desc: 'Read-only access to branch metrics. Can log ledger records but has zero administrative or configurations access.', 
      descAr: 'وصول للقراءة الفقط لمقاييس الفرع. يمكنه إدخال قيود بسيطة دون امتيازات التعديل الأساسية.' 
    }
  ];

  const presets = [
    { name: 'Sarah Mansour', nameAr: 'سارة المنصور', role: 'Manager' as UserRole, branch: 'riyadh_hq', label: 'Riyadh HQ Manager', labelAr: 'مديرة فرع الرياض الرئيسي' },
    { name: 'James Sterling', nameAr: 'جيمس ستيرلينغ', role: 'Manager' as UserRole, branch: 'london_financial', label: 'London Hub Manager', labelAr: 'مدير فرع لندن المالي' },
    { name: 'Fahad Al-Otaibi', nameAr: 'فهد العتيبي', role: 'Admin' as UserRole, branch: 'all', label: 'Global Systems Admin', labelAr: 'مسؤول أنظمة عالمي' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-100 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl -z-10 animate-pulse delay-75"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col">
        {/* Core branding */}
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-mono text-2xl font-bold shadow-lg shadow-emerald-500/10">
            N
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 mb-1">
              {lang === 'ar' ? 'بوابة الرقابة المالية NEXUS' : 'NEXUS Financial Portal'}
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'ar' ? 'نظام الحسابات والتدقيق المالي الموحد' : 'Unified Corporate Financial Ledger & Audit Suite'}
            </p>
          </div>
        </div>

        {/* Quick presets logins */}
        <div className="mb-6 space-y-2 text-start" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <label className="text-xxs font-semibold uppercase tracking-wider text-slate-400 block pb-1">
            {lang === 'ar' ? 'تسجيل دخول سريع للموظفين' : 'Quick Employee Logins'}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {presets.map((preset, i) => (
              <button
                key={i}
                onClick={() => login(preset.role, preset.branch)}
                className="w-full text-left flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition duration-150 group text-sm shadow-xs cursor-pointer"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center space-x-3 space-x-reverse text-start">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-emerald-700">
                    {preset.name.charAt(0)}
                  </div>
                  <div className="mx-2">
                    <div className="font-semibold text-slate-705 text-slate-800 group-hover:text-emerald-700 duration-100">
                      {lang === 'ar' ? preset.nameAr : preset.name}
                    </div>
                    <div className="text-xxs text-slate-400">
                      {lang === 'ar' ? preset.labelAr : preset.label}
                    </div>
                  </div>
                </div>
                {lang === 'ar' ? (
                  <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-1 duration-150 shrink-0" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 duration-150 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex py-2 items-center my-4 font-sans">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xxs text-slate-400 uppercase tracking-wider">
            {lang === 'ar' ? 'أو محاكاة صلاحيات مخصصة' : 'Or simulate custom role'}
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Custom state inputs */}
        <div className="space-y-4 text-start font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div>
            <label className="text-xxs font-bold text-slate-400 block mb-1">
              {lang === 'ar' ? 'اختر الدور الوظيفي' : 'Select Privilege Role'}
            </label>
            <select
              value={selectedRole}
              onChange={(e) => {
                const role = e.target.value as UserRole;
                setSelectedRole(role);
                if (role === 'Super Admin' || role === 'Admin') {
                  setSelectedBranch('all');
                } else if (selectedBranch === 'all') {
                  setSelectedBranch('riyadh_hq');
                }
              }}
              className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 text-sm rounded-xl p-3 outline-none shadow-xs"
            >
              {rolesList.map(item => (
                <option key={item.role} value={item.role}>
                  {lang === 'ar' ? item.labelAr : item.label}
                </option>
              ))}
            </select>
          </div>

          {selectedRole !== 'Super Admin' && selectedRole !== 'Admin' && (
            <div>
              <label className="text-xxs font-bold text-slate-400 block mb-1">
                {lang === 'ar' ? 'الفرع المعين (عزل البيانات RLS)' : 'Assigned Branch (RLS Domain Isolation)'}
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 text-sm rounded-xl p-3 outline-none shadow-xs"
              >
                <option value="riyadh_hq">{lang === 'ar' ? 'المركز الرئيسي - الرياض' : 'Riyadh HQ Branch'}</option>
                <option value="london_financial">{lang === 'ar' ? 'مركز لندن المالي' : 'London Financial Hub'}</option>
                <option value="new_york_plaza">{lang === 'ar' ? 'نيويورك بلازا' : 'New York Plaza'}</option>
                <option value="berlin_tech">{lang === 'ar' ? 'فرع برلين التقني' : 'Berlin Tech Branch'}</option>
                <option value="dubai_marina">{lang === 'ar' ? 'دبي مارينا' : 'Dubai Marina'}</option>
              </select>
            </div>
          )}

          {/* Role privilege details */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xxs text-slate-600 leading-relaxed text-start">
            <span className="font-bold text-emerald-700 mr-1 block mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'تأثير الصلاحيات الأمنية:' : 'Privilege Security Scope:'}
            </span>
            {lang === 'ar' ? rolesList.find(r => r.role === selectedRole)?.descAr : rolesList.find(r => r.role === selectedRole)?.desc}
          </div>

          <button
            onClick={() => login(selectedRole, selectedBranch)}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl transition duration-150 flex items-center justify-center space-x-2 space-x-reverse shadow-md shadow-emerald-600/10 cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span className="mx-2">{lang === 'ar' ? 'تسجيل دخول آمن' : 'Authorize Secure Session'}</span>
          </button>
        </div>

        {/* Footer info showing developer email explicitly */}
        <div className="mt-8 text-center text-slate-400 text-xxs font-mono">
          <p>{lang === 'ar' ? 'المستخدم النشط للمراجعات:' : 'Active Auditor account:'} digititech.com@gmail.com</p>
          <p className="mt-1">© {new Date().getFullYear()} Nexus Intranet Applet. PWA Ready</p>
        </div>
      </div>
    </div>
  );
};
