import React, { useState } from 'react';
import { Employee, Branch, UserRole, EmployeeStatus } from '../types';
import { 
  UserPlus, 
  Search, 
  PlusCircle, 
  Edit, 
  Trash2, 
  X, 
  Mail, 
  Briefcase, 
  Building 
} from 'lucide-react';

interface EmployeesModuleProps {
  employees: Employee[];
  filteredEmployees: Employee[];
  branches: Branch[];
  addEmployee: (item: any) => Employee;
  editEmployee: (item: Employee) => void;
  deleteEmployee: (id: string) => void;
  lang: 'en' | 'ar';
  userRole?: UserRole;
}

export const EmployeesModule: React.FC<EmployeesModuleProps> = ({
  employees,
  filteredEmployees,
  branches,
  addEmployee,
  editEmployee,
  deleteEmployee,
  lang,
  userRole
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Forms state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [role, setRole] = useState<UserRole>('Employee');
  const [roleTitle, setRoleTitle] = useState('');
  const [roleTitleAr, setRoleTitleAr] = useState('');
  const [branchId, setBranchId] = useState('');
  const [email, setEmail] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<EmployeeStatus>('Active');

  const getBranchName = (brId: string) => {
    const b = branches.find(item => item.id === brId);
    if (!b) return '-';
    return lang === 'ar' ? b.nameAr : b.name;
  };

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setName('');
    setNameAr('');
    setRole('Employee');
    setRoleTitle('');
    setRoleTitleAr('');
    setBranchId(branches[0]?.id || '');
    setEmail('');
    setSalary('');
    setStatus('Active');
    setShowFormModal(true);
  };

  const handleOpenEdit = (e: Employee) => {
    setEditingEmployee(e);
    setName(e.name);
    setNameAr(e.nameAr);
    setRole(e.role);
    setRoleTitle(e.roleTitle);
    setRoleTitleAr(e.roleTitleAr);
    setBranchId(e.branchId);
    setEmail(e.email);
    setSalary(e.salary.toString());
    setStatus(e.status);
    setShowFormModal(true);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!name || !roleTitle || !email) return;

    const payload = {
      empId: editingEmployee ? editingEmployee.empId : `FT-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      nameAr: nameAr || name,
      role,
      roleTitle,
      roleTitleAr: roleTitleAr || roleTitle,
      branchId,
      email,
      avatar: editingEmployee ? editingEmployee.avatar : 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      status,
      salary: parseFloat(salary) || 3000
    };

    if (editingEmployee) {
      editEmployee({ ...editingEmployee, ...payload });
    } else {
      addEmployee(payload);
    }

    setShowFormModal(false);
  };

  // Filter application
  const processedData = filteredEmployees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
      emp.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.empId.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === 'all' || emp.role === roleFilter;
    const matchBranch = branchFilter === 'all' || emp.branchId === branchFilter;

    return matchSearch && matchRole && matchBranch;
  });

  return (
    <div className="space-y-6 text-start font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Title area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in font-sans">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mb-1">
            {lang === 'ar' ? 'سجل الكادر البشري والموظفين' : 'Workforce Team Directory'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'ar' ? 'مسرد الموظفين المعتمدين وتعيينات الفروع وسقوف النفاذ وهياكل الأجور الشهرية' : 'Manage employee branch mapping, direct authorization clearance levels and structured corporate payroll.'}
          </p>
        </div>

        {(userRole === 'Super Admin' || userRole === 'Admin') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 space-x-reverse px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl shadow-sm transition duration-150 active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'إضافة موظف للمنظومة' : 'Onboard Personnel'}</span>
          </button>
        )}
      </div>

      {/* Advanced Filter row */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={lang === 'ar' ? 'البحث بالاسم، البريد الإلكتروني أو الرقم التعريفي للعميل...' : 'Search staff name, email or Staff ID...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 text-xs rounded-xl ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 outline-none font-sans shadow-sm`}
          />
          <Search className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
        </div>

        {/* Roles Filter */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-705 text-slate-700 text-xs rounded-xl p-2.5 outline-none shadow-sm"
          >
            <option value="all">{lang === 'ar' ? 'كل درجات الأذونات' : 'All Access Levels'}</option>
            <option value="Super Admin">{lang === 'ar' ? 'مشرف رئيسي (Super Admin)' : 'Super Admin'}</option>
            <option value="Admin">{lang === 'ar' ? 'إداري عام (Admin)' : 'Admin'}</option>
            <option value="Manager">{lang === 'ar' ? 'مدير فرع (Manager)' : 'Manager'}</option>
            <option value="Accountant">{lang === 'ar' ? 'محاسب (Accountant)' : 'Accountant'}</option>
            <option value="Employee">{lang === 'ar' ? 'موظف قيّد (Employee)' : 'Employee'}</option>
          </select>
        </div>

        {/* Branch Filter */}
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

      {/* Grid view matching pristine user cards template */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        {processedData.map((emp) => (
          <div key={emp.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition flex flex-col justify-between group h-[250px] relative shadow-sm">
            <div>
              {/* Header profile info */}
              <div className="flex justify-between items-start gap-4 text-start">
                <div className="flex items-center space-x-3.5 space-x-reverse font-sans">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-11 h-11 rounded-full border border-slate-200 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="truncate text-left">
                    <h4 className="text-xs font-bold text-slate-805 text-slate-800 truncate group-hover:text-emerald-700 duration-100 uppercase">
                      {lang === 'ar' ? emp.nameAr : emp.name}
                    </h4>
                    <span className="text-xxs text-slate-400 font-mono tracking-wide mt-1 block leading-none">{emp.empId}</span>
                  </div>
                </div>

                <div className="flex gap-1.5 items-center shrink-0">
                  {(userRole === 'Super Admin' || userRole === 'Admin') && (
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="w-7 h-7 rounded-md bg-slate-50 hover:bg-slate-100 hover:text-emerald-750 text-slate-500 flex items-center justify-center cursor-pointer border border-slate-200 transition duration-100 shadow-xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {userRole === 'Super Admin' && (
                    <button
                      onClick={() => deleteEmployee(emp.id)}
                      className="w-7 h-7 rounded-md bg-slate-50 hover:bg-rose-50 text-rose-600 flex items-center justify-center cursor-pointer border border-slate-200 transition duration-100 shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subtitles metadata info */}
              <div className="mt-4 space-y-2 text-xxs font-sans text-slate-500 text-start">
                <div className="flex justify-between border-b border-slate-100 pb-1.5 items-center">
                  <span className="text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {lang === 'ar' ? 'البريد الإلكتروني:' : 'E-Mail address:'}</span>
                  <span className="text-slate-700 select-all font-mono truncate max-w-[150px]">{emp.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5 items-center">
                  <span className="text-slate-400 flex items-center gap-1"><Briefcase className="w-3 h-3" /> {lang === 'ar' ? 'المسمى الوظيفي:' : 'Role Title:'}</span>
                  <span className="text-slate-800 font-bold leading-none">{lang === 'ar' ? emp.roleTitleAr : emp.roleTitle}</span>
                </div>
                <div className="flex justify-between pb-1.5 items-center">
                  <span className="text-slate-400 flex items-center gap-1"><Building className="w-3 h-3" /> {lang === 'ar' ? 'فرع العمل:' : 'Dispatched Branch:'}</span>
                  <span className="text-slate-700 font-semibold leading-none">{getBranchName(emp.branchId)}</span>
                </div>
              </div>
            </div>

            {/* Salary structural value at bottom card margins */}
            <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-xxs mt-4 font-mono select-none text-start">
              <span className="text-slate-400 uppercase leading-none">{lang === 'ar' ? 'مستوى النفاذ والأجور:' : 'Scope salary:'}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-550 text-slate-500 tracking-wider">
                  {emp.role}
                </span>
                <span className="text-xs font-bold font-mono text-emerald-600">
                  ${emp.salary.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {processedData.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 text-center py-20 bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs font-sans">
            {lang === 'ar' ? 'لا يوجد موظفين مطابقين لعملية الفرز.' : 'Zero active workforce directories matches.'}
          </div>
        )}
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

            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3 text-start">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <span>{editingEmployee ? (lang === 'ar' ? 'تعديل بيانات الموظف المعني' : 'Update Staff Profile Coordinates') : (lang === 'ar' ? 'إلحاق وتوظيف كادر جديد' : 'Onboard Workforce Member')}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans text-start">
              <div className="grid grid-cols-2 gap-3">
                {/* Name Eng */}
                <div>
                  <label className="text-slate-505 text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الاسم بالكامل (ENG)' : 'Full Name (English)'}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Richard Hendricks"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>

                {/* Name Ar */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الاسم بالكامل (عربي)' : 'Full Name (Arabic)'}</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: ريتشارد هندريكس"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'البريد الإلكتروني المعتمر' : 'Work Email address'}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. richard@fintechos.com"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Role Title Eng */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الوظيفة (ENG)' : 'Role Title (English)'}</label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Dev"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>

                {/* Role Title Ar */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الوظيفة (عربي)' : 'Role Title (Arabic)'}</label>
                  <input
                    type="text"
                    value={roleTitleAr}
                    onChange={(e) => setRoleTitleAr(e.target.value)}
                    placeholder="مثال: مهندس روتري"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl p-2.5 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* System Privilege Role */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'صلاحية نظام النفاذ' : 'System Access Role'}</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 rounded-xl p-2.5 outline-none shadow-sm"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>

                {/* Dispatch Branch */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'تعيين الفرع التابع' : 'Dispatch Assigned Branch'}</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 rounded-xl p-2.5 outline-none shadow-sm"
                  >
                    {branches.map(br => (
                      <option key={br.id} value={br.id}>
                        {lang === 'ar' ? br.nameAr : br.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Salary */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'الأجر الشهري الأساسي ($)' : 'Monthly Basic Salary ($)'}</label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-801 text-slate-800 rounded-xl p-2.5 outline-none font-mono shadow-sm"
                  />
                </div>

                {/* status */}
                <div>
                  <label className="text-slate-500 block mb-1 font-bold">{lang === 'ar' ? 'حالة الموظف التشغيلية' : 'Workforce Status'}</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-slate-700 rounded-xl p-2.5 outline-none shadow-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl transition duration-100 cursor-pointer text-center"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Discard'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer text-center shadow-md shadow-emerald-600/10"
                >
                  {lang === 'ar' ? 'توظيف الكادر' : 'Confirm Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
