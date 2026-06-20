import React, { useState } from 'react';
import { 
  Key, 
  ShieldAlert, 
  Mail, 
  Lock, 
  Globe, 
  Activity,
  ArrowLeft,
  CheckCircle,
  Send
} from 'lucide-react';

interface AuthSimProps {
  db: any;
  lang: 'en' | 'ar';
}

export const AuthSim: React.FC<AuthSimProps> = ({ db, lang }) => {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await db.signIn(email, password);
    } catch (err: any) {
      setErrorMsg(lang === 'ar' ? 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.' : err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await db.resetPassword(email);
      setSuccessMsg(
        lang === 'ar'
          ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
          : 'Password reset link has been sent to your email.'
      );
    } catch (err: any) {
      setErrorMsg(
        lang === 'ar'
          ? 'حدث خطأ. يرجى التحقق من البريد الإلكتروني والمحاولة مرة أخرى.'
          : err.message || 'Failed to send reset email. Please check your email and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const switchView = (target: 'login' | 'forgot') => {
    setView(target);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center relative overflow-hidden font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Ambient background glow elements */}
      <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] bg-emerald-950/40 rounded-full blur-[140px] -z-10"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] bg-teal-950/30 rounded-full blur-[140px] -z-10"></div>
      <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-emerald-900/20 rounded-full blur-[100px] -z-10"></div>

      <div className="w-full max-w-md mx-4 flex flex-col items-center">

        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-mono text-2xl font-bold shadow-xl shadow-emerald-500/25 mb-5 font-black">
            D
          </div>
          <span className="text-sm uppercase tracking-[0.3em] text-slate-300 font-black">
            DESHAL
          </span>
          <span className="text-[10px] text-emerald-500 font-mono mt-1">FINANCIAL PORTAL v1.2</span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider rounded-full mt-4">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>{lang === 'ar' ? 'الدليل الشامل لاستشارات المشاريع' : 'Al Daleel Al Shamel Projects Consultations'}</span>
          </div>
        </div>

        {/* Glassmorphic Card */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-3xl p-8 lg:p-10 shadow-2xl backdrop-blur-lg">

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-2xl flex items-start gap-3 text-start">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-2xl flex items-start gap-3 text-start">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ===== LOGIN VIEW ===== */}
          {view === 'login' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </h1>
                <p className="text-xs text-slate-400 mt-1.5">
                  {lang === 'ar' ? 'أدخل بيانات الاعتماد للوصول إلى لوحة التحكم' : 'Enter your credentials to access the portal'}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5 text-start">
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3.5 outline-none font-mono transition"
                      style={{ direction: 'ltr' }}
                    />
                    <Mail className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5`} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">
                      {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => switchView('forgot')}
                      className="text-[10px] text-emerald-500 hover:text-emerald-400 font-semibold cursor-pointer transition"
                    >
                      {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3.5 outline-none transition"
                      style={{ direction: 'ltr' }}
                    />
                    <Lock className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5`} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition duration-150 flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-emerald-600/15 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span className="mx-2">{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ===== FORGOT PASSWORD VIEW ===== */}
          {view === 'forgot' && (
            <>
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 cursor-pointer transition mb-5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}</span>
                </button>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                </h1>
                <p className="text-xs text-slate-400 mt-1.5">
                  {lang === 'ar' 
                    ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.'
                    : 'Enter your email and we\'ll send you a link to reset your password.'}
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5 text-start">
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3.5 outline-none font-mono transition"
                      style={{ direction: 'ltr' }}
                    />
                    <Mail className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5`} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition duration-150 flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-emerald-600/15 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span className="mx-2">{lang === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Language Toggle */}
        <button
          onClick={db.toggleLanguage}
          className="mt-6 flex items-center gap-1.5 px-4 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer transition select-none"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Footer */}
        <div className="mt-8 text-slate-600 text-[10px] font-mono text-center">
          <span>© {new Date().getFullYear()} Deshal Finance · Powered by Al Daleel Al Shamel</span>
        </div>
      </div>
    </div>
  );
};
