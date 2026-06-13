import React, { useState } from 'react';
import { Branch, Employee, Income, Expense, BranchStatus, UserRole } from '../types';
import { 
  Building2, 
  MapPin, 
  PlusCircle, 
  Edit, 
  X, 
  User, 
  CheckCircle, 
  Settings 
} from 'lucide-react';

interface BranchesModuleProps {
  branches: Branch[];
  employees: Employee[];
  income: Income[];
  expenses: Expense[];
  addBranch: (item: any) => Branch;
  editBranch: (item: Branch) => void;
  deleteBranch: (id: string) => void;
  lang: 'en' | 'ar';
  userRole?: UserRole;
}

export const BranchesModule: React.FC<BranchesModuleProps> = ({
  branches,
  employees,
  income,
  expenses,
  addBranch,
  editBranch,
  deleteBranch,
  lang,
  userRole
}) => {
  // Form modal triggers
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [location, setLocation] = useState('');
  const [locationAr, setLocationAr] = useState('');
  const [managerId, setManagerId] = useState('');
  const [status, setStatus] = useState<BranchStatus>('Active');

  // Compute actual dynamic statistics per branch
  const getBranchLedgerStats = (brId: string) => {
    const branchInflow = income.filter(i => i.branchId === brId).reduce((sum, item) => sum + item.amount, 0);
    const branchOutflow = expenses.filter(e => e.branchId === brId).reduce((sum, item) => sum + item.amount, 0);
    const branchNet = branchInflow - branchOutflow;
    return { inflow: branchInflow, outflow: branchOutflow, net: branchNet };
  };

  const getManagerInfo = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return { name: 'Unassigned', nameAr: 'غير معين', avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' };
    return { name: emp.name, nameAr: emp.nameAr, avatar: emp.avatar };
  };

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setName('');
    setNameAr('');
    setLocation('');
    setLocationAr('');
    setManagerId(employees[0]?.id || '');
    setStatus('Active');
    setShowFormModal(true);
  };

  const handleOpenEdit = (b: Branch) => {
    setEditingBranch(b);
    setName(b.name);
    setNameAr(b.nameAr);
    setLocation(b.location);
    setLocationAr(b.locationAr);
    setManagerId(b.managerId);
    setStatus(b.status);
    setShowFormModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    const payload = {
      name,
      nameAr: nameAr || name,
      location,
      locationAr: locationAr || location,
      managerId,
      status
    };

    if (editingBranch) {
      editBranch({ ...editingBranch, ...payload });
    } else {
      addBranch(payload);
    }

    setShowFormModal(false);
  };

  return (
    <div className="space-y-6 text-start" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Head actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in font-sans">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mb-1">
            {lang === 'ar' ? 'البنى الإدارية والفروع الإقليمية' : 'Regional Hubs & Divisions'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' ? 'متابعة الفروع النشطة، تدوين المدراء المعينين وحساب مؤشرات التدفق المستقلة لكل موقع' : 'Isolated security branch workspaces, assigned personnel controls and reactive regional tracking.'}
          </p>
        </div>

        {(userRole === 'Super Admin' || userRole === 'Admin') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 space-x-reverse px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl shadow-sm transition duration-150 active:scale-95 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'تأسيس فرع جديد' : 'Establish Branch'}</span>
          </button>
        )}
      </div>

      {/* Grid List layout of regional branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        {branches.map(b => {
          const stats = getBranchLedgerStats(b.id);
          const mgr = getManagerInfo(b.managerId);

          return (
            <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition flex flex-col justify-between group h-[300px] shadow-sm">
              <div>
                {/* Hub title */}
                <div className="flex justify-between items-start gap-4 mb-4 text-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 block leading-tight truncate">
                      {lang === 'ar' ? b.nameAr : b.name}
                    </h3>
                    <span className="text-xxs text-slate-400 block mt-1 tracking-wide leading-none">{lang === 'ar' ? b.locationAr : b.location}</span>
                  </div>

                  <div className="flex gap-2 shrink-0 items-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                      b.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>{b.status === 'Active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'صيانة' : 'Maintenance')}</span>
                    </span>

                    {(userRole === 'Super Admin' || userRole === 'Admin') && (
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 hover:text-emerald-750 text-slate-500 flex items-center justify-center duration-150 cursor-pointer border border-slate-200"
                        title={lang === 'ar' ? 'تعديل الفرع' : 'Edit coordinates'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Manager avatar profiling details */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-4 h-14 text-start">
                  <img
                    src={mgr.avatar}
                    alt={mgr.name}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-xxs text-slate-400 block mb-0.5">{lang === 'ar' ? 'المدير المعين:' : 'Assigned Manager:'}</span>
                    <span className="text-xs font-bold text-slate-700 leading-none block">{lang === 'ar' ? mgr.nameAr : mgr.name}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic reactive metrics calculated automatically */}
              <div className="border-t border-slate-100 pt-5 grid grid-cols-2 gap-4 text-xxs mt-4 font-mono select-none text-start">
                <div>
                  <span className="text-slate-400 uppercase leading-none block">{lang === 'ar' ? 'إيرادات مخصصة:' : 'Inflow Revenue:'}</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono block mt-1.5">+${stats.inflow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase leading-none block">{lang === 'ar' ? 'صافي التدفق المتبقي:' : 'Operating Margin:'}</span>
                  <span className={`text-xs font-bold block mt-1.5 font-mono ${stats.net >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                    ${stats.net.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Popups Forms Creator */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-slide-in font-sans text-slate-800">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 flex items-center justify-center duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3 text-start">
              <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{editingBranch ? (lang === 'ar' ? 'تعديل بيانات الفرع المعني' : 'Update Division Hub Coordinates') : (lang === 'ar' ? 'تأسيس وقيد فرع جديد' : 'Establish Division Hub')}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-start">
              {/* Name Eng */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'اسم الفرع بالإنجليزية' : 'Division Name (English)'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Frankfurt Core"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                />
              </div>

              {/* Name Ar */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'اسم الفرع بالعربية' : 'Division Name (Arabic)'}</label>
                <input
                  type="text"
                  value={nameAr}
                  placeholder="مثال: فرع الرياض"
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                />
              </div>

              {/* Location English */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'مقر أو عنوان الفرع (ENG)' : 'Registered Address (English)'}</label>
                <textarea
                  rows={3}
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Frankfurt Westend"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                />
              </div>

              {/* Location Arabic */}
              <div>
                <label className="text-slate-505 block mb-1 font-bold">{lang === 'ar' ? 'مقر أو عنوان الفرع (AR)' : 'Registered Address (Arabic)'}</label>
                <textarea
                  rows={3}
                  value={locationAr}
                  onChange={(e) => setLocationAr(e.target.value)}
                  placeholder="مثال: الرياض أوليا بلازا"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                />
              </div>

              {/* Assign Manager reference */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'تعيين المدير المسؤول' : 'Appoint manager Administrator'}</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 rounded-xl p-2.5 outline-none shadow-sm"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {lang === 'ar' ? emp.nameAr : emp.name} ({emp.roleTitle})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'حالة نشاط الموقع' : 'Operational Status'}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BranchStatus)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 rounded-xl p-2.5 outline-none shadow-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl transition duration-100 cursor-pointer text-center"
                >
                  {lang === 'ar' ? 'إلغاء المخطط' : 'Discard Hub'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer text-center shadow-md shadow-emerald-550/10"
                >
                  {lang === 'ar' ? 'حفظ وحقن الفرع' : 'Commit Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
