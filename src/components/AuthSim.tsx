import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  ArrowLeft, 
  ArrowRight, 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Lock, 
  User, 
  Building, 
  CheckCircle, 
  Globe, 
  Activity, 
  Briefcase, 
  Percent, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface AuthSimProps {
  db: any;
  lang: 'en' | 'ar';
}

export const AuthSim: React.FC<AuthSimProps> = ({ db, lang }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'presets'>('login');
  
  // Real Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Employee');
  const [selectedBranch, setSelectedBranch] = useState<string>('riyadh_hq');
  
  // Simulator State
  const [simRole, setSimRole] = useState<UserRole>('Super Admin');
  const [simBranch, setSimBranch] = useState<string>('all');

  // UI Feedback States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await db.signIn(email, password);
      // Auth listener automatically sets currentUser
    } catch (err: any) {
      setErrorMsg(lang === 'ar' ? 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.' : err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await db.signUp(email, password, name, nameAr || name, selectedRole, selectedBranch);
      setSuccessMsg(
        lang === 'ar' 
          ? 'تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول الآن.' 
          : 'Registration successful! You can now log in.'
      );
      // Switch to login tab
      setActiveTab('login');
      // Prefill email
      setPassword('');
    } catch (err: any) {
      setErrorMsg(lang === 'ar' ? 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.' : err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row relative overflow-hidden font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Ambient background glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-950/40 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-950/30 rounded-full blur-[120px] -z-10"></div>

      {/* Left Column: Branding / Info Panel */}
      <div className="lg:w-[45%] p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/40 backdrop-blur-md relative z-10">
        
        {/* Top bar with company logo and language toggle */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-mono text-xl font-bold shadow-lg shadow-emerald-500/20">
              N
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block leading-none">
                NEXUS
              </span>
              <span className="text-[10px] text-emerald-500 font-mono">AUDIT SUITE v1.2</span>
            </div>
          </div>

          <button
            onClick={db.toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-xs rounded-xl cursor-pointer transition select-none font-sans"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* Dynamic Presentation Pitch */}
        <div className="my-12 lg:my-auto max-w-xl text-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xxs font-semibold uppercase tracking-wider rounded-full mb-6">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>{lang === 'ar' ? 'استشارات فنية متقدمة' : 'Advanced Projects Consulting'}</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            {lang === 'ar' ? 'الدليل الشامل لاستشارات المشاريع' : 'Al Daleel Al Shamel Projects Consultations'}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {lang === 'ar' 
              ? 'بوابة الرقابة المالية NEXUS المخصصة لإدارة العمليات النقدية، التدقيق المالي الفوري، مطابقة المخازن وعزل الفروع الإقليمية مع الالتزام التام بضريبة القيمة المضافة.' 
              : 'The NEXUS Auditing Portal integrates live ledger accounts, VAT audits, physical inventory reconciliations, and strict geographic branch-level role-based isolation (RLS).'}
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-start">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-200">{lang === 'ar' ? 'عزل الفروع الجغرافي RLS' : 'Branch Isolation (RLS)'}</h4>
                <p className="text-slate-500 mt-1">{lang === 'ar' ? 'فصل تلقائي لحسابات الفروع الإقليمية والعمليات.' : 'Secure isolation of ledger data based on staff assignment.'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-start">
              <Percent className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-200">{lang === 'ar' ? 'مطابقة ضريبة القيمة المضافة' : 'VAT Auditing & Compliance'}</h4>
                <p className="text-slate-500 mt-1">{lang === 'ar' ? 'صياغة تقارير الضرائب والفوترة بنسبة 15% تلقائيًا.' : 'Instant VAT verification, calculations and compliance metrics.'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-start">
              <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-200">{lang === 'ar' ? 'مطابقة المخزون والعمليات' : 'Inventory Reconciliation'}</h4>
                <p className="text-slate-500 mt-1">{lang === 'ar' ? 'تقارير حركة المنتجات والخدمات والمحاسبة الفورية.' : 'Trace stock movements, SKU costings and adjustments.'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-start">
              <Briefcase className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-200">{lang === 'ar' ? 'إدارة النفاذ الصارمة (RABAC)' : 'On-demand Role Access'}</h4>
                <p className="text-slate-500 mt-1">{lang === 'ar' ? 'أذونات دقيقة للمدراء، المحاسبين، ومسؤولي الفروع.' : 'Fine-grained access control levels for absolute privacy.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer legalities */}
        <div className="mt-8 text-slate-500 text-xxs font-mono flex flex-col md:flex-row justify-between items-start md:items-center gap-2 w-full">
          <span>Powered by Al Daleel Al Shamel</span>
          <span>© {new Date().getFullYear()} Nexus Audits. All Rights Reserved.</span>
        </div>
      </div>

      {/* Right Column: Interactive Login/SignUp Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-16 relative z-10">
        
        {/* Glassmorphic main form wrapper */}
        <div className="w-full max-w-lg bg-slate-950/60 border border-slate-800 rounded-3xl p-8 lg:p-10 shadow-2xl backdrop-blur-lg flex flex-col">
          
          {/* Tab Selection */}
          <div className="flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-8">
            <button
              onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition duration-150 cursor-pointer ${activeTab === 'login' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {lang === 'ar' ? 'تسجيل دخول' : 'Log In'}
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition duration-150 cursor-pointer ${activeTab === 'signup' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
            </button>
            <button
              onClick={() => { setActiveTab('presets'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition duration-150 cursor-pointer ${activeTab === 'presets' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {lang === 'ar' ? 'محاكاة وسريعة' : 'Simulated Preset'}
            </button>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-2xl flex items-start gap-3 text-start">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-2xl flex items-start gap-3 text-start">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 text-start">
              <div className="space-y-1.5">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">
                  {lang === 'ar' ? 'البريد الإلكتروني المعتمد' : 'Corporate Email Address'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@fintech.com"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3 outline-none font-mono transition"
                    style={{ direction: 'ltr' }}
                  />
                  <Mail className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">
                    {lang === 'ar' ? 'كلمة المرور' : 'Secure Password'}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition"
                    style={{ direction: 'ltr' }}
                  />
                  <Lock className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5`} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl transition duration-150 flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-emerald-600/10 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span className="mx-2">{lang === 'ar' ? 'تسجيل دخول آمن' : 'Authorize Secure Session'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5 text-start">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">
                    {lang === 'ar' ? 'الاسم بالإنجليزية' : 'Full Name (English)'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Fahad Al-Otaibi"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition"
                    />
                    <User className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5`} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">
                    {lang === 'ar' ? 'الاسم بالعربية' : 'Full Name (Arabic)'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      placeholder="مثال: فهد العتيبي"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition"
                    />
                    <User className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5`} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">
                  {lang === 'ar' ? 'البريد الإلكتروني المعتمد' : 'Corporate Email Address'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@fintech.com"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3 outline-none font-mono transition"
                    style={{ direction: 'ltr' }}
                  />
                  <Mail className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">
                  {lang === 'ar' ? 'كلمة المرور' : 'Secure Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition"
                    style={{ direction: 'ltr' }}
                  />
                  <Lock className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">
                    {lang === 'ar' ? 'الدور الوظيفي (RABAC)' : 'Privilege Role (RABAC)'}
                  </label>
                  <div className="relative">
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
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-300 text-xs rounded-xl p-3 outline-none transition cursor-pointer"
                    >
                      {rolesList.map(it => (
                        <option key={it.role} value={it.role}>
                          {lang === 'ar' ? it.labelAr : it.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">
                    {lang === 'ar' ? 'الفرع (عزل البيانات RLS)' : 'Assigned Branch (RLS)'}
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      disabled={selectedRole === 'Super Admin' || selectedRole === 'Admin'}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-300 text-xs rounded-xl p-3 outline-none transition cursor-pointer disabled:opacity-50"
                    >
                      <option value="riyadh_hq">{lang === 'ar' ? 'المركز الرئيسي - الرياض' : 'Riyadh HQ Branch'}</option>
                      <option value="london_financial">{lang === 'ar' ? 'مركز لندن المالي' : 'London Financial Hub'}</option>
                      <option value="new_york_plaza">{lang === 'ar' ? 'نيويورك بلازا' : 'New York Plaza'}</option>
                      <option value="berlin_tech">{lang === 'ar' ? 'فرع برلين التقني' : 'Berlin Tech Branch'}</option>
                      <option value="dubai_marina">{lang === 'ar' ? 'دبي مارينا' : 'Dubai Marina'}</option>
                      {(selectedRole === 'Super Admin' || selectedRole === 'Admin') && (
                        <option value="all">{lang === 'ar' ? 'جميع الفروع' : 'All Branches'}</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl transition duration-150 flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-emerald-600/10 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span className="mx-2">{lang === 'ar' ? 'تسجيل الحساب والبدء' : 'Register Account & Initialize'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: SIMULATOR PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              {/* Presets Quick buttons */}
              <div className="space-y-2 text-start">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block pb-1">
                  {lang === 'ar' ? 'حسابات تدقيق مسبقة الإعداد' : 'Auditor Account Presets'}
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {presets.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => db.loginSim(preset.role, preset.branch)}
                      className="w-full text-left flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl transition duration-150 group text-xs shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center space-x-3.5 space-x-reverse text-start">
                        <div className="w-8.5 h-8.5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center font-bold text-emerald-400">
                          {preset.name.charAt(0)}
                        </div>
                        <div className="mx-2">
                          <div className="font-semibold text-slate-100 group-hover:text-emerald-400 duration-100 uppercase">
                            {lang === 'ar' ? preset.nameAr : preset.name}
                          </div>
                          <div className="text-[10px] text-slate-550 mt-0.5">
                            {lang === 'ar' ? preset.labelAr : preset.label}
                          </div>
                        </div>
                      </div>
                      {lang === 'ar' ? (
                        <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:-translate-x-1 duration-150 shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1 duration-150 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider">
                  {lang === 'ar' ? 'أو محاكاة يدوية مخصصة' : 'Or Custom Role Simulation'}
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Custom Simulator Selectors */}
              <div className="space-y-4 text-start">
                <div>
                  <label className="text-xxs font-bold text-slate-400 block mb-1">
                    {lang === 'ar' ? 'درجة الصلاحية للمحاكاة' : 'Select Simulation Privilege'}
                  </label>
                  <select
                    value={simRole}
                    onChange={(e) => {
                      const role = e.target.value as UserRole;
                      setSimRole(role);
                      if (role === 'Super Admin' || role === 'Admin') {
                        setSimBranch('all');
                      } else if (simBranch === 'all') {
                        setSimBranch('riyadh_hq');
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-350 text-slate-300 text-xs rounded-xl p-3 outline-none transition cursor-pointer"
                  >
                    {rolesList.map(item => (
                      <option key={item.role} value={item.role}>
                        {lang === 'ar' ? item.labelAr : item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {simRole !== 'Super Admin' && simRole !== 'Admin' && (
                  <div>
                    <label className="text-xxs font-bold text-slate-400 block mb-1">
                      {lang === 'ar' ? 'الفرع المستهدف (RLS)' : 'Target Isolated Branch (RLS)'}
                    </label>
                    <select
                      value={simBranch}
                      onChange={(e) => setSimBranch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-350 text-slate-300 text-xs rounded-xl p-3 outline-none transition cursor-pointer"
                    >
                      <option value="riyadh_hq">{lang === 'ar' ? 'المركز الرئيسي - الرياض' : 'Riyadh HQ Branch'}</option>
                      <option value="london_financial">{lang === 'ar' ? 'مركز لندن المالي' : 'London Financial Hub'}</option>
                      <option value="new_york_plaza">{lang === 'ar' ? 'نيويورك بلازا' : 'New York Plaza'}</option>
                      <option value="berlin_tech">{lang === 'ar' ? 'فرع برلين التقني' : 'Berlin Tech Branch'}</option>
                      <option value="dubai_marina">{lang === 'ar' ? 'دبي مارينا' : 'Dubai Marina'}</option>
                    </select>
                  </div>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[10px] text-slate-400 leading-relaxed text-start flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-400 block mb-0.5">
                      {lang === 'ar' ? 'نطاق نفاذ المحاكاة:' : 'Scope Security Impact:'}
                    </span>
                    {lang === 'ar' ? rolesList.find(r => r.role === simRole)?.descAr : rolesList.find(r => r.role === simRole)?.desc}
                  </div>
                </div>

                <button
                  onClick={() => db.loginSim(simRole, simBranch)}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl transition duration-150 flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-emerald-600/10 cursor-pointer"
                >
                  <Key className="w-4 h-4 animate-bounce" />
                  <span className="mx-2">{lang === 'ar' ? 'تفعيل جلسة المحاكاة' : 'Start Simulated Session'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Auditor workspace email details */}
          <div className="mt-8 text-center text-slate-500 text-[10px] font-mono border-t border-slate-900 pt-6">
            <p className="flex justify-center items-center gap-1.5 select-all">
              <User className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'مسؤول التدقيق الافتراضي:' : 'Auditor email:'} admin@fintech.com</span>
            </p>
            <p className="mt-1">{lang === 'ar' ? 'كلمة المرور الافتراضية: password123' : 'Default password: password123'}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
