import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  Branch, 
  User, 
  Income, 
  Expense, 
  Invoice, 
  Receipt, 
  Customer, 
  Employee, 
  SystemSettings,
  UserRole,
  PaymentMethod,
  ExpenseCategory,
  InvoiceStatus,
  EmployeeStatus,
  ProductItem,
  InventoryMovement,
  FinancialAdjustment,
  Vendor,
  Payable,
  PayablePayment,
  PettyCashVoucher
} from './types';

// Storage keys
const KEY_BRANCHES = 'fms_branches';
const KEY_USERS = 'fms_users';
const KEY_INCOME = 'fms_income';
const KEY_EXPENSES = 'fms_expenses';
const KEY_INVOICES = 'fms_invoices';
const KEY_RECEIPTS = 'fms_receipts';
const KEY_CUSTOMERS = 'fms_customers';
const KEY_EMPLOYEES = 'fms_employees';
const KEY_SETTINGS = 'fms_settings';
const KEY_CURRENT_USER = 'fms_current_user';
const KEY_LANG = 'fms_language';
const KEY_PRODUCTS = 'fms_products';
const KEY_MOVEMENTS = 'fms_movements';
const KEY_ADJUSTMENTS = 'fms_adjustments';
const KEY_VENDORS = 'fms_vendors';
const KEY_PAYABLES = 'fms_payables';
const KEY_PAYABLE_PAYMENTS = 'fms_payable_payments';
const KEY_PETTY_CASH = 'fms_petty_cash';

const INITIAL_PETTY_CASH: PettyCashVoucher[] = [];

const INITIAL_VENDORS: Vendor[] = [
  { id: 'ven_001', name: 'Global Tech Distributors', nameAr: 'موزعو التكنولوجيا العالمية', code: 'GTD', contactEmail: 'orders@globaltech.com', phone: '+1-555-8930', address: '400 Enterprise Way, NY', addressAr: '٤٠٠ طريق الأعمال، نيويورك' },
  { id: 'ven_002', name: 'Middle East Logistics', nameAr: 'الشرق الأوسط للخدمات اللوجستية', code: 'MEL', contactEmail: 'shipping@melogistics.ae', phone: '+971-4-9988', address: 'Dubai Port Area, Dubai', addressAr: 'منطقة ميناء دبي، دبي' }
];

const INITIAL_PAYABLES: Payable[] = [
  { id: 'pay_001', payableNumber: 'PAY-2026-001', vendorId: 'ven_001', branchId: 'riyadh_hq', issueDate: '2026-06-01', dueDate: '2026-07-01', totalAmount: 15000, paidAmount: 5000, status: 'Partial', description: 'Bulk hardware procurement', descriptionAr: 'شراء أجهزة ومعدات بالجملة' },
  { id: 'pay_002', payableNumber: 'PAY-2026-002', vendorId: 'ven_002', branchId: 'dubai_marina', issueDate: '2026-06-05', dueDate: '2026-06-25', totalAmount: 8500, paidAmount: 8500, status: 'Paid', description: 'Office supply transport shipping', descriptionAr: 'شحن وتوصيل مستلزمات مكتبية' }
];

const INITIAL_PAYABLE_PAYMENTS: PayablePayment[] = [
  { id: 'pay_rec_001', paymentNumber: 'PAY-REC-001', payableId: 'pay_001', amount: 5000, date: '2026-06-02', paymentMethod: 'Bank Transfer', branchId: 'riyadh_hq', notes: 'First advance partial payment' },
  { id: 'pay_rec_002', paymentNumber: 'PAY-REC-002', payableId: 'pay_002', amount: 8500, date: '2026-06-06', paymentMethod: 'Corporate Credit', branchId: 'dubai_marina', notes: 'Final payoff for shipping invoice' }
];

// Initial preseeded data matching screenshots
const INITIAL_BRANCHES: Branch[] = [
  { id: 'riyadh_hq', name: 'Riyadh HQ Branch', nameAr: 'المركز الرئيسي', location: 'Olaya, Riyadh', locationAr: 'العليا، الرياض', managerId: 'emp_006', status: 'Active' },
  { id: 'london_financial', name: 'London Financial Hub', nameAr: 'مركز لندن المالي', location: 'Canary Wharf, London', locationAr: 'كناري وارف، لندن', managerId: 'emp_001', status: 'Active' },
  { id: 'new_york_plaza', name: 'New York Plaza', nameAr: 'نيويورك بلازا', location: 'Manhattan, NYC', locationAr: 'مانهاتن، نيويورك', managerId: 'emp_002', status: 'Active' },
  { id: 'tokyo_neo', name: 'Tokyo Neo-Core', nameAr: 'طوكيو نيو-كور', location: 'Shinjuku, Tokyo', locationAr: 'شينجوكو، طوكيو', managerId: 'emp_003', status: 'Maintenance' },
  { id: 'berlin_tech', name: 'Berlin Tech Branch', nameAr: 'فرع برلين التقني', location: 'Mitte, Berlin', locationAr: 'ميتيه، برلين', managerId: 'emp_004', status: 'Active' },
  { id: 'dubai_marina', name: 'Dubai Marina', nameAr: 'دبي مارينا', location: 'Marina, Dubai', locationAr: 'المارينا، دبي', managerId: 'emp_005', status: 'Active' }
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cus_001', name: 'Nexus Corp Solutions', nameAr: 'شركة نيكسوس للحلول', code: 'NC', contactEmail: 'billing@nexuscorp.com', phone: '+1-555-0199', address: '12 Business Rd, NYC', addressAr: '١٢ طريق التجارة، نيويورك' },
  { id: 'cus_002', name: 'Apex Global Ltd', nameAr: 'أبيكس العالمية المحدودة', code: 'AG', contactEmail: 'finance@apexglobal.com', phone: '+44-20-7946', address: '45 Canary Wharf, London', addressAr: '٤٥ كناري وارف، لندن' },
  { id: 'cus_003', name: 'Vanguard Systems', nameAr: 'فانغارد للأنظمة', code: 'VS', contactEmail: 'accounts@vanguardsys.com', phone: '+1-555-0142', address: '78 Tech Plaza, San Jose', addressAr: '٧٨ تيك بلازا، سان خوسيه' },
  { id: 'cus_004', name: 'Klarity Labs', nameAr: 'كلاريتي لابز', code: 'KL', contactEmail: 'treasury@klarity.io', phone: '+49-30-2213', address: '12 Schiffbauerdamm, Berlin', addressAr: '١٢ شيفباوردام، برلين' },
  { id: 'cus_005', name: 'Zenith Zero LLC', nameAr: 'زينيث زيرو ذ.م.م', code: 'ZZ', contactEmail: 'info@zenithzero.ae', phone: '+971-4-1234', address: '99 Marina Walk, Dubai', addressAr: '٩٩ ممشى المارينا، دبي' },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp_001', empId: 'FT-0112', name: 'James Sterling', nameAr: 'جيمس ستيرلينغ', role: 'Manager', roleTitle: 'Regional Director', roleTitleAr: 'المدير الإقليمي', branchId: 'london_financial', email: 'j.sterling@fintechos.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnkQICdBK4-bWGNVOSOMG3dNOMdtvgAU9V1tRyxWzTaQaFGwfty2ntosy2YrHaFefeo_xep_eY9jb7pwzabphlVE34g8zpLLm11oA4c7MKquqwpyp9dUbKDO11hbk8qaF90RHtvugD17ohD9ZgsVWfZoGVmBgdnvDnurk4498R55OqVdG4iGgB3t9EbBR_fg9k58jZeKfswCRyfYm6ycoItBaovcpUTlM_He-jMGlNP4OXyJNiEsgyjYy1jpgqU_RWyVVjAp4A83s', status: 'Active', salary: 12000 },
  { id: 'emp_002', empId: 'FT-1102', name: 'Elena Rodriguez', nameAr: 'إيلينا رودريغيز', role: 'Manager', roleTitle: 'General Manager', roleTitleAr: 'المدير العام', branchId: 'new_york_plaza', email: 'e.rod@fintechos.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRev5F1S37V17i7qVuY_OVHKaSEmK7L5AN4Rb6brb_b5q0UAvCbc_dcbxCdLsei1MpR7PtBQoNwP9HrD8vlF2MrHvrTrv8Kt3U8b_xvwU8vAtF2fZ5P-4UnyRV9BF5vx3s18UJNDDW-zsLpuafnQwcQkmmoSoCUPTW8iRJEG-8RXYX8_hSWNOtObFR-xxGeF9ScGR4cdssbGYYdyeQbaGw0gsoawI8SfT7Wh55EK5kxkuj50wI6SbtIESQ0FQAFL-j_WE5ykbaMH4', status: 'Active', salary: 10000 },
  { id: 'emp_003', empId: 'FT-0220', name: 'Kenji Tanaka', nameAr: 'كينجي تاناكا', role: 'Employee', roleTitle: 'Operations Lead', roleTitleAr: 'مسؤول العمليات', branchId: 'tokyo_neo', email: 'k.tanaka@fintechos.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAO9c8bVu0FGtCnWPb4-HBB4UnNmtTjob3yes2mtCf1DqplAgNYWgksaP-DYlnO5oueGn_PId1Lv4OUYNAS5D703JR2vDGrETz-9U6GO2CMY0jBC8ziR3LK3OFUxq-GZEGAUxak7bwksDcYvFav9_RFIR49hqqxwYXQvVdJBj5f8gFCkLDCLK0lbvXE_GFkIbWYeURBlWVyUjHAeZ-YkAwZ5VLKWXD0elnQ_cXGZrUVh4Rz2Ab84mzjSZYctkwLjXhqdfy2M2gRLpI', status: 'Active', salary: 9500 },
  { id: 'emp_004', empId: 'FT-0430', name: 'Sophie Müller', nameAr: 'صوفي مولر', role: 'Employee', roleTitle: 'Site Manager', roleTitleAr: 'مدير الموقع', branchId: 'berlin_tech', email: 's.muller@fintechos.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSevXCfe9qF9KJT19UyiYEGhpe0aVsYgovztFlMANgBiIRWg8e0tTWTLRZ2CZWqn5MMotV26gjaWVe6CWOKsxX565ZPABpvwmngmae3n3NXBnD7L2P-evLq5AguHOYoMhjNtQwrcTDla9cWMqMrjfSSyqX0IymICjOh_B_J8olAUuCWpSzJ-pZU-NpFBTN_ZBbH1TTRzccqyBwf3PK2UJ0upILxNBvHI6dbpHhFjY7jQ6IRgH2gZzQVsY9-z_NGVpDcq-6E56oHY8', status: 'Active', salary: 8500 },
  { id: 'emp_005', empId: 'FT-0911', name: 'Omar Al-Sayed', nameAr: 'عمر السيد', role: 'Manager', roleTitle: 'Regional Head', roleTitleAr: 'رئيس إقليمي', branchId: 'dubai_marina', email: 'o.sayed@fintechos.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtDjJQcYo038Ua-EgblS6UQ7YCugzVPbAAlNNhL89B7cmovgt2IOTmkhTHdPbAniMpKXgxs8iDlJOQtO5-DcyG3n5l6Q9ne5WNIBuD497EMZUGN5HppW0pC7yUkS2UyS7Zw5AHbDAkPD5DmXj0M2bAW7NIoZCLIgJ7pdHG180i_u2vVWzHdyP7_yyn5IO8I6xmbPChN-Sn123QIEp2Dmgsa2eseF7iMpWSfjTqyO05gKr60bu6ISqqf1Ya5bf7_hFQB9DnEDmkF7Q', status: 'Active', salary: 13000 },
  { id: 'emp_006', empId: 'FT-0922', name: 'Sarah Sterling', nameAr: 'سارة المنصور', role: 'Manager', roleTitle: 'Global Compliance Lead', roleTitleAr: 'رئيسة الامتثال العالمي', branchId: 'riyadh_hq', email: 's.sterling@fintechos.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFNof-R5_H2dWClX5nkhzy4nBfpb2y9nbvwiaa5Bi0TkUykShjQ8XsfV5GHSDpGwB3Vok4JYlhCs25SUmPxfuZf8WE6sdv9w49qGCDCCqcof6skGG_B0BaBeG7Snf3g0szhPxccFDilLlo79wdlYiBvAdTt8lMFGe--XO8rnOAkzkauXcLnn4HbZVGfuz1KbvZ6KOPjP1QLmVygXotO8QyxmDhrkEgSZZwK0aGmI9AXiZJB5W5UnPk_TdGakM_n0CNEUuGUb6OiH4', status: 'Active', salary: 14500 },
  { id: 'emp_007', empId: 'FT-0841', name: 'Marcus Chen', nameAr: 'فهد العتيبي', role: 'Admin', roleTitle: 'Senior DevOps Architect', roleTitleAr: 'كبير مهندسي DevOps', branchId: 'dubai_marina', email: 'f.otaibi@fintechos.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2xPxUeyxvel4OJsWDqmihBcffRXdUikKOLss7aAhewNYleC6mTkfu4fd5U_ZgJWmNhUDuMbB82zo2wxDWK4RIOt5N61k2b6gjcfDiI3fJtVgzht7xxzJPTKMygavaHGbRx5yfAhFM9sVJ6NrO4CSq4-dw6uKgjTn3YU_WKYjMfGy59y-EXe_LZq_v-6moCeDyGRwJyJAVu5LAtriMoY6cQsj5mRxkzfLu5c2LKlnrqMnnLSsK1nZlRAmxvxPQaOfCdjiU_pboO90', status: 'Active', salary: 9800 },
  { id: 'emp_008', empId: 'FT-1102', name: 'Elena Rodriguez', nameAr: 'ليلى القحطاني', role: 'Employee', roleTitle: 'Asset Operations Analyst', roleTitleAr: 'محللة عمليات الأصول', branchId: 'new_york_plaza', email: 'l.qahtani@fintechos.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgWq8jXkZ5HV2yEQsRrIgzYLd7ZK0N_2MWEBputBnjJKkiRQBleTuRd4p30t2A6_GetxOi77jPNOzyMVtYKUSpKIdDCNJQ9qB6GlhB16uQ3vqVP-kxZBepNssaqs3h7XQ0c6jat3xNFUfskib9zpHEA_X9qxqBd4PFMXZLp92xOWx7qlvWMKeDqoxJ-8KSGKWoHJmAI5DVQdWLXn1z7mKRceUtorLhOvo4PpfheIu_XGNja9riqrz0uJDy7yRltJqp86dupFKig2g', status: 'Active', salary: 6500 },
  { id: 'emp_009', empId: 'FT-0552', name: 'Jameson Wu', nameAr: 'ياسين محمود', role: 'Employee', roleTitle: 'Treasury Operations', roleTitleAr: 'إدارة العمليات النقدية', branchId: 'berlin_tech', email: 'y.mahmoud@fintechos.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg00yjFq_26r-GtwvNCZZU1Ndf3-70QspUH-x6U2Tsj8giTAA1sNShORaeNN0Xy-3Of0PyyOUxAMc1IXfU5WNob0OUeL-fbHXQTOUJ6LFaQQUDBvDGijuRDmPGlDHgwz0pFcACb5zTucfvbIwqECONZfgfEwSivVlz-h04nWHqi22xneyi_Zm21Uanfp-xElmlzIzjYXVcORpN8rLzJu3eB5UeqLkP7gGTJvaz962Y-2opooOhP_muOw2giSAx4oZv6h69iWakSmo', status: 'Active', salary: 7800 }
];

const INITIAL_INCOME: Income[] = [
  { id: 'inc_001', source: 'Acme Corp Deposit', sourceAr: 'إيداع شركة Acme', amount: 85000, date: '2026-06-12', branchId: 'new_york_plaza', paymentMethod: 'Bank Transfer', description: 'Q2 Sales Payment', descriptionAr: 'دفعة مبيعات الربع الثاني' },
  { id: 'inc_002', source: 'TechFlow Solutions', sourceAr: 'تك فلو للحلول', amount: 14250, date: '2026-06-11', branchId: 'riyadh_hq', paymentMethod: 'Bank Transfer', description: 'Consulting services', descriptionAr: 'الخدمات الاستشارية' },
  { id: 'inc_003', source: 'Nexus Real Estate', sourceAr: 'نكسوس للعقارات', amount: 8900, date: '2026-06-10', branchId: 'new_york_plaza', paymentMethod: 'Corporate Credit', description: 'Commercial rent lease', descriptionAr: 'إيجار تجاري' },
  { id: 'inc_004', source: 'Culina Group', sourceAr: 'مجموعة كولينا', amount: 1240.5, date: '2026-06-09', branchId: 'london_financial', paymentMethod: 'Cash', description: 'Event catering deposit', descriptionAr: 'تأمين تموين الفعاليات' },
  { id: 'inc_005', source: 'Health Bridge Intl.', sourceAr: 'هيلث بريدج الدولية', amount: 22400, date: '2026-06-08', branchId: 'riyadh_hq', paymentMethod: 'Bank Transfer', description: 'Implementation phase 1', descriptionAr: 'مرحلة التنفيذ الأولى' },
  { id: 'inc_006', source: 'Swift Logistics', sourceAr: 'سويفت للخدمات اللوجستية', amount: 5670, date: '2026-06-07', branchId: 'london_financial', paymentMethod: 'Bank Transfer', description: 'Distribution retainers', descriptionAr: 'أتعاب التوزيع' },
  { id: 'inc_007', source: 'Apex Global Ltd Support', sourceAr: 'أبيكس العالمية المحدودة - دعم', amount: 3200, date: '2026-06-05', branchId: 'london_financial', paymentMethod: 'Bank Transfer', description: 'Monthly server admin support', descriptionAr: 'الدعم الشهري لإدارة الخادم' }
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp_001', entity: 'AWS Cloud Services', entityAr: 'خدمات AWS السحابية', amount: 12450, date: '2026-06-12', branchId: 'new_york_plaza', category: 'Infrastructure', status: 'Approved', description: 'Monthly Hosting Infrastructure', descriptionAr: 'البنية التحتية للاستضافة الشهرية' },
  { id: 'exp_002', entity: 'Contractor: J. Doe', entityAr: 'مقاول: ج. دو', amount: 4200, date: '2026-06-11', branchId: 'london_financial', category: 'Payroll', status: 'Pending', description: 'Compliance audit contractor key milestones', descriptionAr: 'مقاول تدقيق الامتثال الإنجازات الرئيسية' },
  { id: 'exp_003', entity: 'Stripe Fee Dispute', entityAr: 'نزاع رسوم Stripe', amount: 850, date: '2026-06-10', branchId: 'riyadh_hq', category: 'Fees', status: 'Flagged', description: 'Merchant fees chargeback resolution', descriptionAr: 'رسوم التاجر لحل استرداد المدفوعات' },
  { id: 'exp_004', entity: 'Central Plaza Leasing', entityAr: 'تأجير سنترال بلازا', amount: 12500, date: '2026-06-09', branchId: 'riyadh_hq', category: 'Rent', status: 'Approved', description: 'Corporate Riyadh HQ Rental - Nov', descriptionAr: 'إيجار المقر الرئيسي للشركة - الرياض' },
  { id: 'exp_005', entity: 'Global Payroll Services', entityAr: 'خدمات الرواتب العالمية', amount: 84000, date: '2026-06-08', branchId: 'new_york_plaza', category: 'Payroll', status: 'Pending', description: 'Engineering Operations (24 Staff)', descriptionAr: 'رواتب موظفي الهندسة والعمليات' },
  { id: 'exp_006', entity: 'GridPower Utilities', entityAr: 'جريد بور للمرافق', amount: 4210.5, date: '2026-06-07', branchId: 'london_financial', category: 'Utilities', status: 'Approved', description: 'Riyadh Facility electric bill', descriptionAr: 'استهلاك شبكة الكهرباء والمياه' }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2023-001',
    customerId: 'cus_001', // Nexus Corp
    branchId: 'new_york_plaza',
    issueDate: '2026-05-15',
    dueDate: '2026-06-25',
    items: [
      { description: 'Cloud Migration Consultancy', descriptionAr: 'استشارات هجرة السحابة', price: 8000, quantity: 1 },
      { description: 'Service Level Agreement Pro (Phase 1)', descriptionAr: 'اتفاقية مستوى الخدمة الاحترافية', price: 4450, quantity: 1 }
    ],
    totalAmount: 12450,
    status: 'Paid',
    paidAmount: 12450
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2023-004',
    customerId: 'cus_002', // Apex Global
    branchId: 'london_financial',
    issueDate: '2026-05-20',
    dueDate: '2026-06-20',
    items: [
      { description: 'IT Infrastructure Setups', descriptionAr: 'تركيبات البنية التحتية للاتصالات', price: 1600, quantity: 2 }
    ],
    totalAmount: 3200,
    status: 'Partial',
    paidAmount: 1200
  },
  {
    id: 'inv_003',
    invoiceNumber: 'INV-2023-012',
    customerId: 'cus_003', // Vanguard Systems
    branchId: 'new_york_plaza',
    issueDate: '2026-05-01',
    dueDate: '2026-06-10', // Overdue
    items: [
      { description: 'Software Architecture Audit', descriptionAr: 'تدقيق بنية البرمجيات', price: 12450, quantity: 2 }
    ],
    totalAmount: 24900,
    status: 'Unpaid',
    paidAmount: 0
  },
  {
    id: 'inv_004',
    invoiceNumber: 'INV-2023-018',
    customerId: 'cus_004', // Klarity Labs
    branchId: 'berlin_tech',
    issueDate: '2026-05-28',
    dueDate: '2026-06-28',
    items: [
      { description: 'Compliance Consulting Support', descriptionAr: 'دعم استشارات الامتثال', price: 5640.2, quantity: 1 }
    ],
    totalAmount: 5640.2,
    status: 'Paid',
    paidAmount: 5640.2
  },
  {
    id: 'inv_005',
    invoiceNumber: 'INV-2023-021',
    customerId: 'cus_005', // Zenith Zero
    branchId: 'dubai_marina',
    issueDate: '2026-06-01',
    dueDate: '2026-07-01',
    items: [
      { description: 'Global Security Training Packages', descriptionAr: 'الحزم التدريبية للأمن السيبراني', price: 1890, quantity: 1 }
    ],
    totalAmount: 1890,
    status: 'Unpaid',
    paidAmount: 0
  }
];

const INITIAL_RECEIPTS: Receipt[] = [
  { id: 'rec_001', receiptNumber: 'REC-2026-001', invoiceId: 'inv_001', amount: 12450, date: '2026-06-12', paymentMethod: 'Bank Transfer', branchId: 'new_york_plaza', notes: 'Final complete invoice payoff' },
  { id: 'rec_002', receiptNumber: 'REC-2026-002', invoiceId: 'inv_002', amount: 1200, date: '2026-06-11', paymentMethod: 'Bank Transfer', branchId: 'london_financial', notes: 'First partial retainer invoice credit' },
  { id: 'rec_003', receiptNumber: 'REC-2026-003', invoiceId: 'inv_004', amount: 5640.2, date: '2026-06-08', paymentMethod: 'Bank Transfer', branchId: 'berlin_tech', notes: 'Payoff for invoice INV-18' }
];

const INITIAL_SETTINGS: SystemSettings = {
  // --- General Settings ---
  companyName: 'Nexus Global Finance',
  companyNameAr: 'نكسس العالمية للمالية',
  registrationNo: 'REG-9921-2024-XF',
  logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxPFJPUbTXVTeuuxzBY50Ec-BA8BByUOCCPfpJo5eu6KmfMFPK4oarc2uXpFTqb9JEUFIt3GVQ5drmaQqFK5W9usyR0P8DFy8ek3LWPpHJNf2uzQvjZZNyrhfjYPFI6nfwZbPhjN2f6Eniw0PgRw2ldQCHigeYpEmyIntXgjqaRAimwkgoed8Rb-xVWWRIE27m7UFIMXUI2vJWClsik_pAcnTeGQeTakpS-jlmMFhSm8tsGFuHtjlyBK1nagLhVQuuOE9ReHQu8TU',
  primaryCurrency: 'OMR',
  dateFormat: 'YYYY-MM-DD',
  themePrimaryColor: 'emerald',
  allowThemeToggle: true,

  // --- Company Settings ---
  companyAddress: 'Financial Plaza, level 42, Riyadh',
  companyAddressAr: 'برج المالية، الطابق ٤٢، العليا، الرياض',
  companyPhone: '+966-11-202-4000',
  companyEmail: 'finance@nexusco.com',
  vatCompliance: true,
  vatRatePct: 15,

  // --- Invoice & Receipt Settings ---
  invoicePrefix: 'INV',
  receiptPrefix: 'REC',
  defaultDueDays: 30,
  invoiceFooterTerms: 'These deliverables are subject to audit clearance. Payment is required in full within the due date window.',
  invoiceFooterTermsAr: 'تخضع هذه التسليمات لتدقيق بنود التخليص المالي. يلتزم الطرف الثاني بسداد المستحقات بالكامل.',
  receiptFooterTerms: 'Thank you for your business. This receipt constitutes a final clearance for the indicated amount.',
  receiptFooterTermsAr: 'نشكركم على ثقتكم الغالية بمنتجاتنا. يعتبر هذا السند براء ذمة وتأكيد تسوية للرقم المحدد أعلاه.',

  // --- Seal & Signature ---
  companySealUrl: '',
  companySealName: 'NEXUS CO. AUDIT OFFICE',
  companySealNameAr: 'مكتب التدقيق لشركة نكسس',
  authorizedSignatureUrl: '',
  authorizedSignatureName: 'Authorized Signatory - Operations Division',
  authorizedSignatureNameAr: 'التوقيع المعتمد - قطاع العمليات',
  showSealOnInvoices: true,
  showSignatureOnInvoices: true,

  // --- Staff & Roles Settings ---
  defaultStaffSalary: 3000,
  allowStaffSelfEdit: false,
  restrictInvoiceDeletion: true,
  enforceSalaryApproval: true,

  // --- Branches Settings ---
  defaultBranchId: 'riyadh_hq',
  enableBranchIsolation: true,
  maxBranchesAllowed: 10,
  realTimeNotifications: true,
  twoFactorAuth: false,

  // --- Email Integration Settings ---
  emailHost: '',
  emailPort: 587,
  emailUser: '',
  emailPassword: '',
  emailFrom: '',
  emailSecure: false,
  emailSendInvoices: false,
  emailSendReceipts: false,
  emailSendReports: false,
  emailReportsPeriod: 'Monthly',
  emailReportsRecipient: '',
  emailAlertOnLargeExpense: false,
  emailAlertLargeExpenseAmount: 10000,
  emailAlertOnRoleChange: false
};

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_001',
    sku: 'PROD-MBP16',
    name: 'MacBook Pro 16" M3 Max',
    nameAr: 'ماك بوك برو ١٦ بوصة M3 ماكس',
    type: 'Product',
    price: 1599,
    cost: 1150,
    stock: 14,
    minStockAlert: 5,
    description: '16-inch liquid retina XDR screen, 36GB unified RAM, 1TB SSD.',
    descriptionAr: 'شاشة ليكويد ريتينا ١٦ بوصة، ذاكرة ٣٦ جيجابايت، مساحة تخزين ١ تيرابايت.',
    category: 'Hardware',
    categoryAr: 'أجهزة ومعدات'
  },
  {
    id: 'prod_002',
    sku: 'PROD-DEL32',
    name: 'Dell UltraSharp 32" 4K Monitor',
    nameAr: 'شاشة ديل الترا شارب ٣٢ بوصة 4K',
    type: 'Product',
    price: 649,
    cost: 410,
    stock: 8,
    minStockAlert: 3,
    description: 'PremierColor IPS display with superb color accuracy and USB-C hub.',
    descriptionAr: 'شاشة IPS بألوان حقيقية فائقة الدقة ومركز توزيع وسائط USB-C.',
    category: 'Hardware',
    categoryAr: 'أجهزة ومعدات'
  },
  {
    id: 'prod_003',
    sku: 'SERV-CONS-ENT',
    name: 'Enterprise Tech Architecture Consultation',
    nameAr: 'استشارات هندسة الأنظمة والحلول المؤسسية',
    type: 'Service',
    price: 1250,
    cost: 0,
    stock: 0,
    minStockAlert: 0,
    description: 'Daily rate for full scale legacy-to-cloud mapping & advisory.',
    descriptionAr: 'سعر الاستشارة اليومي لرسم خرائط الأنظمة والتحول السحابي.',
    category: 'Professional Services',
    categoryAr: 'خدمات احترافية'
  },
  {
    id: 'prod_004',
    sku: 'SERV-AUD-SEC',
    name: 'Cybersecurity Code & Governance Audit',
    nameAr: 'تدقيق أمن البرمجيات والحوكمة الرقمية',
    type: 'Service',
    price: 2400,
    cost: 0,
    stock: 0,
    minStockAlert: 0,
    description: 'Complete codebase static/dynamic security verification per module.',
    descriptionAr: 'فحص وتدقيق كامل لشفرة النظام والامتثال الأمني لكل وحدة برمجية.',
    category: 'Professional Services',
    categoryAr: 'خدمات احترافية'
  }
];

const INITIAL_MOVEMENTS: InventoryMovement[] = [
  { id: 'mov_001', productId: 'prod_001', type: 'In', quantity: 20, date: '2026-05-15', reference: 'PO-2026-001', notes: 'Supplier batch procurement', notesAr: 'شراء دفعة من المورد الرئيسي', branchId: 'riyadh_hq' },
  { id: 'mov_002', productId: 'prod_001', type: 'Out', quantity: 6, date: '2026-06-01', reference: 'INV-2026-101', notes: 'Sold to Nexus Corp Solutions', notesAr: 'تم البيع لشركة نيكسوس للحلول', branchId: 'riyadh_hq' },
  { id: 'mov_003', productId: 'prod_002', type: 'In', quantity: 10, date: '2026-05-18', reference: 'PO-2026-002', notes: 'Initial logistics warehousing', notesAr: 'تخزين أولي في المستودعات', branchId: 'london_financial' },
  { id: 'mov_004', productId: 'prod_002', type: 'Out', quantity: 2, date: '2026-06-05', reference: 'INV-2026-102', notes: 'Deployed at London tech hub office', notesAr: 'تشغيل وتفعيل بفرع لندن', branchId: 'london_financial' }
];

const INITIAL_ADJUSTMENTS: FinancialAdjustment[] = [
  {
    id: 'adj_001',
    noteNumber: 'CN-2026-001',
    type: 'Credit Note',
    invoiceId: 'inv_001',
    customerId: 'cus_001',
    branchId: 'riyadh_hq',
    amount: 150,
    date: '2026-06-02',
    reason: 'Billing adjustments discount on system integration rates',
    reasonAr: 'تسوية وتعديل فوترة تخفيضاً للتكامل البرمجي مع العميل',
    status: 'Approved',
    createdBy: 'Sarah Sterling'
  },
  {
    id: 'adj_002',
    noteNumber: 'DN-2026-001',
    type: 'Debit Note',
    invoiceId: 'inv_003',
    customerId: 'cus_003',
    branchId: 'london_financial',
    amount: 320,
    date: '2026-06-08',
    reason: 'Additional on-premise cabling & compliance deployment fees',
    reasonAr: 'رسوم إضافية لتركيب كابلات الشبكة والمطابقة الميدانية',
    status: 'Pending',
    createdBy: 'James Sterling'
  }
];

const INITIAL_USER: User = {
  uid: 'usr_admin',
  name: 'Admin User',
  nameAr: 'مسؤول النظام',
  email: 'digititech.com@gmail.com', // Match the provided user email exactly!
  role: 'Super Admin',
  branchId: 'riyadh_hq',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_Um1BQxQ3_e2vnP_u0Xlw7mHhhkfLJZRCpPhytJ_0ycQyg55hfd8TgzK1ADVO3fg31i8ys_3WBw1d3rvARWnsawf7ftGgqZrH4jwhCL9xlnPRcvNzykhrCuLlK5A_xSnjNMZZugqcXd8ho0F_WQ4-RZAX4thXvUZaL9dNudjK-C18Dxe1PD60-cV6P_fcBd4ctqRCIuU6CSBsT4UYQIrkixwbHjbl-AVoQAK3NAVERIvVlPqURqNc9Zhf1v4ZjE6F_64iAfuDaLU'
};

// Helper state recovery
const getStored = <T>(key: string, initial: T): T => {
  if (typeof window === 'undefined') return initial;
  const val = localStorage.getItem(key);
  try {
    return val ? JSON.parse(val) : initial;
  } catch (e) {
    return initial;
  }
};

const saveStored = <T>(key: string, val: T) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(val));
  }
};

export const useDb = () => {
  const [branches, setBranches] = useState<Branch[]>(() => getStored(KEY_BRANCHES, INITIAL_BRANCHES));
  const [customers, setCustomers] = useState<Customer[]>(() => getStored(KEY_CUSTOMERS, INITIAL_CUSTOMERS));
  const [employees, setEmployees] = useState<Employee[]>(() => getStored(KEY_EMPLOYEES, INITIAL_EMPLOYEES));
  const [income, setIncome] = useState<Income[]>(() => getStored(KEY_INCOME, INITIAL_INCOME));
  const [expenses, setExpenses] = useState<Expense[]>(() => getStored(KEY_EXPENSES, INITIAL_EXPENSES));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStored(KEY_INVOICES, INITIAL_INVOICES));
  const [receipts, setReceipts] = useState<Receipt[]>(() => getStored(KEY_RECEIPTS, INITIAL_RECEIPTS));
  const [products, setProducts] = useState<ProductItem[]>(() => getStored(KEY_PRODUCTS, INITIAL_PRODUCTS));
  const [movements, setMovements] = useState<InventoryMovement[]>(() => getStored(KEY_MOVEMENTS, INITIAL_MOVEMENTS));
  const [adjustments, setAdjustments] = useState<FinancialAdjustment[]>(() => getStored(KEY_ADJUSTMENTS, INITIAL_ADJUSTMENTS));
  const [vendors, setVendors] = useState<Vendor[]>(() => getStored(KEY_VENDORS, INITIAL_VENDORS));
  const [payables, setPayables] = useState<Payable[]>(() => getStored(KEY_PAYABLES, INITIAL_PAYABLES));
  const [payablePayments, setPayablePayments] = useState<PayablePayment[]>(() => getStored(KEY_PAYABLE_PAYMENTS, INITIAL_PAYABLE_PAYMENTS));
  const [pettyCashVouchers, setPettyCashVouchers] = useState<PettyCashVoucher[]>(() => getStored(KEY_PETTY_CASH, INITIAL_PETTY_CASH));
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const stored = getStored(KEY_SETTINGS, INITIAL_SETTINGS);
    return { ...INITIAL_SETTINGS, ...stored };
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    if (typeof window === 'undefined') return 'ar';
    return (localStorage.getItem(KEY_LANG) as 'en' | 'ar') || 'ar';
  });
  
  const [currentBranchId, setCurrentBranchId] = useState<string>('all');

  // Helper to reset data to pristine presets on logout
  const resetDataToInitial = () => {
    setBranches(INITIAL_BRANCHES);
    setCustomers(INITIAL_CUSTOMERS);
    setEmployees(INITIAL_EMPLOYEES);
    setIncome(INITIAL_INCOME);
    setExpenses(INITIAL_EXPENSES);
    setInvoices(INITIAL_INVOICES);
    setReceipts(INITIAL_RECEIPTS);
    setProducts(INITIAL_PRODUCTS);
    setMovements(INITIAL_MOVEMENTS);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setVendors(INITIAL_VENDORS);
    setPayables(INITIAL_PAYABLES);
    setPayablePayments(INITIAL_PAYABLE_PAYMENTS);
    setPettyCashVouchers(INITIAL_PETTY_CASH);
    setSystemSettings(INITIAL_SETTINGS);
  };

  // 1. Supabase Auth listener integration
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        handleAuthUser(session.user);
      } else {
        setCurrentUser(null);
        resetDataToInitial();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthUser = async (authUser: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profile) {
        let branchVal = profile.branch_id;
        if ((profile.role === 'Super Admin' || profile.role === 'Admin') && !branchVal) {
          branchVal = 'all';
        } else if (!branchVal) {
          branchVal = 'riyadh_hq';
        }
        
        const localUser: User = {
          uid: authUser.id,
          name: profile.name || authUser.user_metadata.name || 'New User',
          nameAr: profile.name_ar || authUser.user_metadata.nameAr || 'مستخدم جديد',
          email: authUser.email || '',
          role: (profile.role || 'Employee') as UserRole,
          branchId: branchVal,
          branchIds: profile.branch_ids || (profile.branch_id ? [profile.branch_id] : []),
          avatar: profile.avatar || authUser.user_metadata.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_Um1BQxQ3_e2vnP_u0Xlw7mHhhkfLJZRCpPhytJ_0ycQyg55hfd8TgzK1ADVO3fg31i8ys_3WBw1d3rvARWnsawf7ftGgqZrH4jwhCL9xlnPRcvNzykhrCuLlK5A_xSnjNMZZugqcXd8ho0F_WQ4-RZAX4thXvUZaL9dNudjK-C18Dxe1PD60-cV6P_fcBd4ctqRCIuU6CSBsT4UYQIrkixwbHjbl-AVoQAK3NAVERIvVlPqURqNc9Zhf1v4ZjE6F_64iAfuDaLU'
        };
        setCurrentUser(localUser);
      } else {
        const localUser: User = {
          uid: authUser.id,
          name: authUser.user_metadata.name || 'New User',
          nameAr: authUser.user_metadata.nameAr || 'مستخدم جديد',
          email: authUser.email || '',
          role: (authUser.user_metadata.role || 'Employee') as UserRole,
          branchId: authUser.user_metadata.branchId || 'riyadh_hq',
          branchIds: authUser.user_metadata.branchIds || (authUser.user_metadata.branchId ? [authUser.user_metadata.branchId] : []),
          avatar: authUser.user_metadata.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_Um1BQxQ3_e2vnP_u0Xlw7mHhhkfLJZRCpPhytJ_0ycQyg55hfd8TgzK1ADVO3fg31i8ys_3WBw1d3rvARWnsawf7ftGgqZrH4jwhCL9xlnPRcvNzykhrCuLlK5A_xSnjNMZZugqcXd8ho0F_WQ4-RZAX4thXvUZaL9dNudjK-C18Dxe1PD60-cV6P_fcBd4ctqRCIuU6CSBsT4UYQIrkixwbHjbl-AVoQAK3NAVERIvVlPqURqNc9Zhf1v4ZjE6F_64iAfuDaLU'
        };
        setCurrentUser(localUser);
      }
    } catch (e) {
      console.error("Error setting authenticated user profile:", e);
    }
  };

  // 2. Load data from Supabase when logged in
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      try {
        // Load branches
        const { data: brs } = await supabase.from('branches').select('*');
        if (brs) {
          setBranches(brs.map(b => ({
            id: b.id,
            name: b.name,
            nameAr: b.name_ar,
            location: b.location || '',
            locationAr: b.location_ar || '',
            managerId: b.manager_id || '',
            status: b.status as any
          })));
        }

        // Load customers
        const { data: custs } = await supabase.from('customers').select('*');
        if (custs) {
          setCustomers(custs.map(c => ({
            id: c.id,
            name: c.name,
            nameAr: c.name_ar,
            code: c.code || '',
            contactEmail: c.contact_email || '',
            phone: c.phone || '',
            address: c.address || '',
            addressAr: c.address_ar || ''
          })));
        }

        // Load employees
        const { data: emps } = await supabase.from('employees').select('*');
        if (emps) {
          setEmployees(emps.map(e => ({
            id: e.id,
            empId: e.emp_id,
            name: e.name,
            nameAr: e.name_ar,
            role: e.role as any,
            roleTitle: e.role_title || '',
            roleTitleAr: e.role_title_ar || '',
            branchId: e.branch_id || '',
            branchIds: e.branch_ids || (e.branch_id ? [e.branch_id] : []),
            email: e.email || '',
            phone: e.phone || '',
            avatar: e.avatar || '',
            status: e.status as any,
            salary: Number(e.salary) || 0
          })));
        }

        // Load income
        const { data: incs } = await supabase.from('income').select('*');
        if (incs) {
          setIncome(incs.map(i => ({
            id: i.id,
            source: i.source,
            sourceAr: i.source_ar,
            amount: Number(i.amount),
            date: i.date,
            branchId: i.branch_id || '',
            paymentMethod: i.payment_method as any,
            invoiceId: i.invoice_id || undefined,
            description: i.description || undefined,
            descriptionAr: i.description_ar || undefined
          })));
        }

        // Load expenses
        const { data: exps } = await supabase.from('expenses').select('*');
        if (exps) {
          setExpenses(exps.map(e => ({
            id: e.id,
            entity: e.entity,
            entityAr: e.entity_ar,
            amount: Number(e.amount),
            date: e.date,
            branchId: e.branch_id || '',
            category: e.category as any,
            status: e.status as any,
            attachmentUrl: e.attachment_url || undefined,
            fileName: e.file_name || undefined,
            description: e.description || undefined,
            descriptionAr: e.description_ar || undefined,
            payableId: e.payable_id || undefined
          })));
        }

        // Load invoices
        const { data: invs } = await supabase.from('invoices').select('*, invoice_items(*)');
        if (invs) {
          setInvoices(invs.map(i => ({
            id: i.id,
            invoiceNumber: i.invoice_number,
            customerId: i.customer_id || '',
            branchId: i.branch_id || '',
            issueDate: i.issue_date,
            dueDate: i.due_date,
            totalAmount: Number(i.total_amount),
            status: i.status as any,
            paidAmount: Number(i.paid_amount),
            items: i.invoice_items ? i.invoice_items.map((it: any) => ({
              description: it.description || '',
              descriptionAr: it.description_ar || '',
              price: Number(it.price) || 0,
              quantity: Number(it.quantity) || 0
            })) : []
          })));
        }

        // Load receipts
        const { data: recs } = await supabase.from('receipts').select('*');
        if (recs) {
          setReceipts(recs.map(r => ({
            id: r.id,
            receiptNumber: r.receipt_number,
            invoiceId: r.invoice_id || '',
            amount: Number(r.amount),
            date: r.date,
            paymentMethod: r.payment_method || '',
            branchId: r.branch_id || '',
            notes: r.notes || undefined
          })));
        }

        // Load products
        const { data: prods } = await supabase.from('products').select('*');
        if (prods) {
          setProducts(prods.map(p => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            nameAr: p.name_ar,
            type: p.type as any,
            price: Number(p.price) || 0,
            cost: Number(p.cost) || 0,
            stock: Number(p.stock) || 0,
            minStockAlert: Number(p.min_stock_alert) || 0,
            description: p.description || '',
            descriptionAr: p.description_ar || '',
            category: p.category || '',
            categoryAr: p.category_ar || ''
          })));
        }

        // Load movements
        const { data: mvts } = await supabase.from('movements').select('*');
        if (mvts) {
          setMovements(mvts.map(m => ({
            id: m.id,
            productId: m.product_id || '',
            type: m.type as any,
            quantity: Number(m.quantity) || 0,
            date: m.date,
            reference: m.reference || '',
            notes: m.notes || '',
            notesAr: m.notes_ar || '',
            branchId: m.branch_id || ''
          })));
        }

        // Load adjustments
        const { data: adjs } = await supabase.from('adjustments').select('*');
        if (adjs) {
          setAdjustments(adjs.map(a => ({
            id: a.id,
            noteNumber: a.note_number,
            type: a.type as any,
            invoiceId: a.invoice_id || undefined,
            customerId: a.customer_id || '',
            branchId: a.branch_id || '',
            amount: Number(a.amount) || 0,
            date: a.date,
            reason: a.reason || '',
            reasonAr: a.reason_ar || '',
            status: a.status as any,
            createdBy: a.created_by || ''
          })));
        }

        // Load system settings
        const { data: sett } = await supabase.from('system_settings').select('*').eq('id', 1).single();
        if (sett) {
          setSystemSettings({
            companyName: sett.company_name,
            companyNameAr: sett.company_name_ar,
            registrationNo: sett.registration_no || '',
            logoUrl: sett.logo_url || '',
            primaryCurrency: sett.primary_currency as any,
            dateFormat: sett.date_format as any,
            themePrimaryColor: sett.theme_primary_color as any,
            allowThemeToggle: sett.allow_theme_toggle,
            companyAddress: sett.company_address || '',
            companyAddressAr: sett.company_address_ar || '',
            companyPhone: sett.company_phone || '',
            companyEmail: sett.company_email || '',
            vatCompliance: sett.vat_compliance,
            vatRatePct: sett.vat_rate_pct !== null && sett.vat_rate_pct !== undefined ? Number(sett.vat_rate_pct) : 15,
            invoicePrefix: sett.invoice_prefix || 'INV',
            receiptPrefix: sett.receipt_prefix || 'REC',
            defaultDueDays: sett.default_due_days !== null && sett.default_due_days !== undefined ? Number(sett.default_due_days) : 30,
            invoiceFooterTerms: sett.invoice_footer_terms || '',
            invoiceFooterTermsAr: sett.invoice_footer_terms_ar || '',
            receiptFooterTerms: sett.receipt_footer_terms || '',
            receiptFooterTermsAr: sett.receipt_footer_terms_ar || '',
            companySealUrl: sett.company_seal_url || undefined,
            companySealName: sett.company_seal_name || undefined,
            companySealNameAr: sett.company_seal_name_ar || undefined,
            authorizedSignatureUrl: sett.authorized_signature_url || undefined,
            authorizedSignatureName: sett.authorized_signature_name || undefined,
            authorizedSignatureNameAr: sett.authorized_signature_name_ar || undefined,
            showSealOnInvoices: sett.show_seal_on_invoices,
            showSignatureOnInvoices: sett.show_signature_on_invoices,
            defaultStaffSalary: sett.default_staff_salary !== null && sett.default_staff_salary !== undefined ? Number(sett.default_staff_salary) : 3000,
            allowStaffSelfEdit: sett.allow_staff_self_edit,
            restrictInvoiceDeletion: sett.restrict_invoice_deletion,
            enforceSalaryApproval: sett.enforce_salary_approval,
            defaultBranchId: sett.default_branch_id || 'riyadh_hq',
            enableBranchIsolation: sett.enable_branch_isolation,
            maxBranchesAllowed: sett.max_branches_allowed !== null && sett.max_branches_allowed !== undefined ? Number(sett.max_branches_allowed) : 10,
            realTimeNotifications: sett.real_time_notifications,
            twoFactorAuth: sett.two_factor_auth,
            emailHost: sett.email_host || '',
            emailPort: sett.email_port !== null && sett.email_port !== undefined ? Number(sett.email_port) : 587,
            emailUser: sett.email_user || '',
            emailPassword: sett.email_password || '',
            emailFrom: sett.email_from || '',
            emailSecure: !!sett.email_secure,
            emailSendInvoices: !!sett.email_send_invoices,
            emailSendReceipts: !!sett.email_send_receipts,
            emailSendReports: !!sett.email_send_reports,
            emailReportsPeriod: sett.email_reports_period as any || 'Monthly',
            emailReportsRecipient: sett.email_reports_recipient || '',
            emailAlertOnLargeExpense: !!sett.email_alert_on_large_expense,
            emailAlertLargeExpenseAmount: sett.email_alert_large_expense_amount !== null && sett.email_alert_large_expense_amount !== undefined ? Number(sett.email_alert_large_expense_amount) : 10000,
            emailAlertOnRoleChange: !!sett.email_alert_on_role_change
          });
        }

        // Load vendors
        const { data: vends } = await supabase.from('vendors').select('*');
        if (vends) {
          setVendors(vends.map(v => ({
            id: v.id,
            name: v.name,
            nameAr: v.name_ar,
            code: v.code || '',
            contactEmail: v.contact_email || '',
            phone: v.phone || '',
            address: v.address || '',
            addressAr: v.address_ar || ''
          })));
        }

        // Load payables
        const { data: pays } = await supabase.from('payables').select('*');
        if (pays) {
          setPayables(pays.map(p => ({
            id: p.id,
            payableNumber: p.payable_number,
            vendorId: p.vendor_id || '',
            branchId: p.branch_id || '',
            issueDate: p.issue_date,
            dueDate: p.due_date,
            totalAmount: Number(p.total_amount),
            paidAmount: Number(p.paid_amount),
            status: p.status as any,
            description: p.description || undefined,
            descriptionAr: p.description_ar || undefined
          })));
        }

        // Load payable payments
        const { data: payReceipts } = await supabase.from('payable_payments').select('*');
        if (payReceipts) {
          setPayablePayments(payReceipts.map(pr => ({
            id: pr.id,
            paymentNumber: pr.payment_number,
            payableId: pr.payable_id || '',
            amount: Number(pr.amount),
            date: pr.date,
            paymentMethod: pr.payment_method || '',
            branchId: pr.branch_id || '',
            notes: pr.notes || undefined
          })));
        }

        // Load petty cash vouchers
        const { data: pcvs } = await supabase.from('petty_cash_vouchers').select('*');
        if (pcvs) {
          setPettyCashVouchers(pcvs.map(p => ({
            id: p.id,
            voucherNumber: p.voucher_number,
            branchId: p.branch_id || '',
            amount: Number(p.amount),
            type: p.type as any,
            category: p.category,
            date: p.date,
            status: p.status as any,
            description: p.description || undefined,
            descriptionAr: p.description_ar || undefined,
            requestedBy: p.requested_by || '',
            approvedBy: p.approved_by || undefined,
            receiptUrl: p.receipt_url || undefined
          })));
        }
      } catch (err) {
        console.error("Error loading data from Supabase:", err);
      }
    };

    loadData();
  }, [currentUser]);

  // Enforce RLS/Branch Isolation based on Role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Employee' || currentUser.role === 'Manager') {
        setCurrentBranchId(currentUser.branchId);
      }
    }
  }, [currentUser]);

  // Sync state to local storage when changed
  useEffect(() => { saveStored(KEY_BRANCHES, branches); }, [branches]);
  useEffect(() => { saveStored(KEY_CUSTOMERS, customers); }, [customers]);
  useEffect(() => { saveStored(KEY_EMPLOYEES, employees); }, [employees]);
  useEffect(() => { saveStored(KEY_INCOME, income); }, [income]);
  useEffect(() => { saveStored(KEY_EXPENSES, expenses); }, [expenses]);
  useEffect(() => { saveStored(KEY_INVOICES, invoices); }, [invoices]);
  useEffect(() => { saveStored(KEY_RECEIPTS, receipts); }, [receipts]);
  useEffect(() => { saveStored(KEY_PRODUCTS, products); }, [products]);
  useEffect(() => { saveStored(KEY_MOVEMENTS, movements); }, [movements]);
  useEffect(() => { saveStored(KEY_ADJUSTMENTS, adjustments); }, [adjustments]);
  useEffect(() => { saveStored(KEY_VENDORS, vendors); }, [vendors]);
  useEffect(() => { saveStored(KEY_PAYABLES, payables); }, [payables]);
  useEffect(() => { saveStored(KEY_PAYABLE_PAYMENTS, payablePayments); }, [payablePayments]);
  useEffect(() => { saveStored(KEY_PETTY_CASH, pettyCashVouchers); }, [pettyCashVouchers]);
  useEffect(() => { saveStored(KEY_SETTINGS, systemSettings); }, [systemSettings]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY_LANG, language);
    }
  }, [language]);

  // Language management
  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'ar' : 'en';
      document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = next;
      return next;
    });
  };

  // Helper to ensure correct direction set on reload
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Real Supabase Auth Operations
  const signUp = async (email: string, password: string, name: string, nameAr: string, role: UserRole, branchId: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          nameAr,
          role,
          branchId
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  // Auth operations
  const loginSim = (role: UserRole, branchId: string) => {
    const roles: Record<UserRole, {name: string, nameAr: string}> = {
      'Super Admin': { name: 'Super Admin User', nameAr: 'المشرف العام' },
      'Admin': { name: 'System Administrator', nameAr: 'مسؤول النظام' },
      'Manager': { name: 'Branch Manager', nameAr: 'مدير الفرع' },
      'Accountant': { name: 'Head Accountant', nameAr: 'المحاسب الرئيسي' },
      'Employee': { name: 'Staff Member', nameAr: 'موظف العمليات' }
    };
    const newUser: User = {
      uid: `usr_${role.toLowerCase().replace(' ', '_')}`,
      name: roles[role].name,
      nameAr: roles[role].nameAr,
      email: `${role.toLowerCase().replace(' ', '')}@fintech.com`,
      role,
      branchId: role === 'Super Admin' || role === 'Admin' ? 'all' : branchId,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_Um1BQxQ3_e2vnP_u0Xlw7mHhhkfLJZRCpPhytJ_0ycQyg55hfd8TgzK1ADVO3fg31i8ys_3WBw1d3rvARWnsawf7ftGgqZrH4jwhCL9xlnPRcvNzykhrCuLlK5A_xSnjNMZZugqcXd8ho0F_WQ4-RZAX4thXvUZaL9dNudjK-C18Dxe1PD60-cV6P_fcBd4ctqRCIuU6CSBsT4UYQIrkixwbHjbl-AVoQAK3NAVERIvVlPqURqNc9Zhf1v4ZjE6F_64iAfuDaLU'
    };
    setCurrentUser(newUser);
    if (newUser.branchId !== 'all') {
      setCurrentBranchId(newUser.branchId);
    } else {
      setCurrentBranchId('all');
    }
  };

  const logoutSim = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  // CRUD utilities
  const addIncome = async (item: Omit<Income, 'id'>) => {
    const id = `inc_${Date.now()}`;
    const newInc: Income = { ...item, id };

    // Auto-update linked invoice balance if invoiceId exists
    if (item.invoiceId) {
      setInvoices(prev => prev.map(inv => {
        if (inv.id === item.invoiceId) {
          const potentialPaid = inv.paidAmount + item.amount;
          const newPaid = Math.min(potentialPaid, inv.totalAmount);
          let newStatus: InvoiceStatus = 'Partial';
          if (newPaid >= inv.totalAmount) {
            newStatus = 'Paid';
          } else if (newPaid === 0) {
            newStatus = 'Unpaid';
          }

          supabase.from('invoices').update({
            paid_amount: newPaid,
            status: newStatus
          }).eq('id', inv.id).then();

          return {
            ...inv,
            paidAmount: newPaid,
            status: newStatus
          };
        }
        return inv;
      }));
    }

    setIncome(prev => [newInc, ...prev]);

    await supabase.from('income').insert({
      id,
      source: item.source,
      source_ar: item.sourceAr,
      amount: item.amount,
      date: item.date,
      branch_id: item.branchId,
      payment_method: item.paymentMethod,
      invoice_id: item.invoiceId || null,
      description: item.description || null,
      description_ar: item.descriptionAr || null
    });

    return newInc;
  };

  const deleteIncome = async (id: string) => {
    const inc = income.find(i => i.id === id);
    if (inc && inc.invoiceId) {
      // Refund linked invoice balance
      setInvoices(prev => prev.map(inv => {
        if (inv.id === inc.invoiceId) {
          const newPaid = Math.max(0, inv.paidAmount - inc.amount);
          let newStatus: InvoiceStatus = 'Partial';
          if (newPaid === 0) {
            newStatus = 'Unpaid';
          } else if (newPaid >= inv.totalAmount) {
            newStatus = 'Paid';
          }

          supabase.from('invoices').update({
            paid_amount: newPaid,
            status: newStatus
          }).eq('id', inv.id).then();

          return {
            ...inv,
            paidAmount: newPaid,
            status: newStatus
          };
        }
        return inv;
      }));
    }

    setIncome(prev => prev.filter(i => i.id !== id));
    await supabase.from('income').delete().eq('id', id);
  };

  const addExpense = async (item: Omit<Expense, 'id'>) => {
    const id = `exp_${Date.now()}`;
    const newExp: Expense = { ...item, id };

    // Auto-update linked payable balance if payableId exists
    if (item.payableId) {
      setPayables(prev => prev.map(p => {
        if (p.id === item.payableId) {
          const potentialPaid = p.paidAmount + item.amount;
          const newPaid = Math.min(potentialPaid, p.totalAmount);
          let newStatus: InvoiceStatus = 'Partial';
          if (newPaid >= p.totalAmount) {
            newStatus = 'Paid';
          } else if (newPaid === 0) {
            newStatus = 'Unpaid';
          }

          supabase.from('payables').update({
            paid_amount: newPaid,
            status: newStatus
          }).eq('id', p.id).then();

          return {
            ...p,
            paidAmount: newPaid,
            status: newStatus
          };
        }
        return p;
      }));
    }

    setExpenses(prev => [newExp, ...prev]);

    await supabase.from('expenses').insert({
      id,
      entity: item.entity,
      entity_ar: item.entityAr,
      amount: item.amount,
      date: item.date,
      branch_id: item.branchId,
      category: item.category,
      status: item.status,
      attachment_url: item.attachmentUrl || null,
      file_name: item.fileName || null,
      description: item.description || null,
      description_ar: item.descriptionAr || null,
      payable_id: item.payableId || null
    });

    return newExp;
  };

  const deleteExpense = async (id: string) => {
    const exp = expenses.find(e => e.id === id);
    if (exp && exp.payableId) {
      // Refund linked payable balance
      setPayables(prev => prev.map(p => {
        if (p.id === exp.payableId) {
          const newPaid = Math.max(0, p.paidAmount - exp.amount);
          let newStatus: InvoiceStatus = 'Partial';
          if (newPaid === 0) {
            newStatus = 'Unpaid';
          } else if (newPaid >= p.totalAmount) {
            newStatus = 'Paid';
          }

          supabase.from('payables').update({
            paid_amount: newPaid,
            status: newStatus
          }).eq('id', p.id).then();

          return {
            ...p,
            paidAmount: newPaid,
            status: newStatus
          };
        }
        return p;
      }));
    }

    setExpenses(prev => prev.filter(e => e.id !== id));
    await supabase.from('expenses').delete().eq('id', id);
  };

  const createInvoice = async (item: Omit<Invoice, 'id' | 'invoiceNumber' | 'totalAmount' | 'paidAmount'>) => {
    const nextNum = invoices.length + 1;
    const prefix = systemSettings.invoicePrefix || 'INV';
    const invNum = `${prefix}-2026-${nextNum.toString().padStart(3, '0')}`;
    const subtotal = item.items.reduce((sum, current) => sum + (current.price * current.quantity), 0);
    const hasVat = systemSettings.vatCompliance;
    const vatRate = systemSettings.vatRatePct ?? 15;
    const total = hasVat ? subtotal * (1 + vatRate / 100) : subtotal;
    const id = `inv_${Date.now()}`;
    const newInv: Invoice = {
      ...item,
      id,
      invoiceNumber: invNum,
      totalAmount: total,
      paidAmount: 0
    };
    setInvoices(prev => [newInv, ...prev]);

    await supabase.from('invoices').insert({
      id,
      invoice_number: invNum,
      customer_id: item.customerId,
      branch_id: item.branchId,
      issue_date: item.issueDate,
      due_date: item.dueDate,
      total_amount: total,
      status: 'Unpaid',
      paid_amount: 0
    });

    const dbItems = item.items.map(it => ({
      invoice_id: id,
      description: it.description,
      description_ar: it.descriptionAr,
      price: it.price,
      quantity: it.quantity
    }));
    await supabase.from('invoice_items').insert(dbItems);

    return newInv;
  };

  const deleteInvoice = async (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    await supabase.from('invoices').delete().eq('id', id);
  };

  const recordReceipt = async (item: Omit<Receipt, 'id' | 'receiptNumber'>) => {
    const nextNum = receipts.length + 1;
    const prefix = systemSettings.receiptPrefix || 'REC';
    const recNum = `${prefix}-2026-${nextNum.toString().padStart(3, '0')}`;
    const id = `rec_${Date.now()}`;
    const newRec: Receipt = {
      ...item,
      id,
      receiptNumber: recNum
    };
    
    // Auto-update linked invoice balance
    setInvoices(prev => prev.map(inv => {
      if (inv.id === item.invoiceId) {
        const potentialPaid = inv.paidAmount + item.amount;
        const newPaid = Math.min(potentialPaid, inv.totalAmount);
        let newStatus: InvoiceStatus = 'Partial';
        if (newPaid >= inv.totalAmount) {
          newStatus = 'Paid';
        } else if (newPaid === 0) {
          newStatus = 'Unpaid';
        }

        supabase.from('invoices').update({
          paid_amount: newPaid,
          status: newStatus
        }).eq('id', inv.id).then();

        return {
          ...inv,
          paidAmount: newPaid,
          status: newStatus
        };
      }
      return inv;
    }));

    setReceipts(prev => [newRec, ...prev]);

    await supabase.from('receipts').insert({
      id,
      receipt_number: recNum,
      invoice_id: item.invoiceId,
      amount: item.amount,
      date: item.date,
      payment_method: item.paymentMethod,
      branch_id: item.branchId,
      notes: item.notes || null
    });

    return newRec;
  };

  const deleteReceipt = async (id: string) => {
    const rec = receipts.find(r => r.id === id);
    if (rec) {
      // Refund linked invoice balance
      setInvoices(prev => prev.map(inv => {
        if (inv.id === rec.invoiceId) {
          const newPaid = Math.max(0, inv.paidAmount - rec.amount);
          let newStatus: InvoiceStatus = 'Partial';
          if (newPaid === 0) {
            newStatus = 'Unpaid';
          } else if (newPaid >= inv.totalAmount) {
            newStatus = 'Paid';
          }

          supabase.from('invoices').update({
            paid_amount: newPaid,
            status: newStatus
          }).eq('id', inv.id).then();

          return {
            ...inv,
            paidAmount: newPaid,
            status: newStatus
          };
        }
        return inv;
      }));
    }
    setReceipts(prev => prev.filter(r => r.id !== id));
    await supabase.from('receipts').delete().eq('id', id);
  };

  const addBranch = async (item: Omit<Branch, 'id'>) => {
    const id = `br_${Date.now()}`;
    const newB: Branch = { ...item, id };
    setBranches(prev => [...prev, newB]);

    await supabase.from('branches').insert({
      id,
      name: item.name,
      name_ar: item.nameAr,
      location: item.location,
      location_ar: item.locationAr,
      manager_id: item.managerId || null,
      status: item.status
    });

    return newB;
  };

  const editBranch = async (item: Branch) => {
    setBranches(prev => prev.map(b => b.id === item.id ? item : b));

    await supabase.from('branches').update({
      name: item.name,
      name_ar: item.nameAr,
      location: item.location,
      location_ar: item.locationAr,
      manager_id: item.managerId || null,
      status: item.status
    }).eq('id', item.id);
  };

  const deleteBranch = async (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
    await supabase.from('branches').delete().eq('id', id);
  };

  const addEmployee = async (item: Omit<Employee, 'id'> & { password?: string }) => {
    const tempPassword = item.password || (item.email.split('@')[0] + "123!");
    const branchIdsVal = item.branchIds || (item.branchId && item.branchId !== 'all' ? [item.branchId] : []);

    const { data: userId, error } = await supabase.rpc('create_user_admin', {
      p_email: item.email,
      p_password: tempPassword,
      p_role: item.role,
      p_name: item.name,
      p_name_ar: item.nameAr,
      p_branch_ids: branchIdsVal,
      p_phone: item.phone || ''
    });

    if (error) {
      throw new Error(error.message);
    }

    const newEmp: Employee = {
      ...item,
      id: userId,
      branchIds: branchIdsVal
    };
    
    setEmployees(prev => [...prev, newEmp]);
    return newEmp;
  };

  const editEmployee = async (item: Employee) => {
    setEmployees(prev => prev.map(e => e.id === item.id ? item : e));

    const branchVal = item.branchId === 'all' ? null : item.branchId;
    const branchIdsVal = item.branchIds || (item.branchId && item.branchId !== 'all' ? [item.branchId] : []);

    await supabase.from('employees').update({
      name: item.name,
      name_ar: item.nameAr,
      role: item.role,
      role_title: item.roleTitle,
      role_title_ar: item.roleTitleAr,
      branch_id: branchVal,
      branch_ids: branchIdsVal,
      email: item.email,
      phone: item.phone || '',
      avatar: item.avatar,
      status: item.status,
      salary: item.salary
    }).eq('id', item.id);

    await supabase.from('profiles').update({
      name: item.name,
      name_ar: item.nameAr,
      role: item.role,
      branch_id: branchVal,
      branch_ids: branchIdsVal,
      email: item.email,
      avatar: item.avatar
    }).eq('id', item.id);
  };

  const deleteEmployee = async (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    await supabase.from('employees').delete().eq('id', id);
    await supabase.from('profiles').delete().eq('id', id);
  };

  const addCustomer = async (item: Omit<Customer, 'id'>) => {
    const id = `cus_${Date.now()}`;
    const newC: Customer = { ...item, id };
    setCustomers(prev => [...prev, newC]);

    await supabase.from('customers').insert({
      id,
      name: item.name,
      name_ar: item.nameAr,
      code: item.code,
      contact_email: item.contactEmail,
      phone: item.phone,
      address: item.address,
      address_ar: item.addressAr
    });

    return newC;
  };

  const editCustomer = async (item: Customer) => {
    setCustomers(prev => prev.map(c => c.id === item.id ? item : c));

    await supabase.from('customers').update({
      name: item.name,
      name_ar: item.nameAr,
      code: item.code,
      contact_email: item.contactEmail,
      phone: item.phone,
      address: item.address,
      address_ar: item.addressAr
    }).eq('id', item.id);
  };

  const deleteCustomer = async (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    await supabase.from('customers').delete().eq('id', id);
  };

  const addVendor = async (item: Omit<Vendor, 'id'>) => {
    const id = `ven_${Date.now()}`;
    const newV: Vendor = { ...item, id };
    setVendors(prev => [...prev, newV]);

    await supabase.from('vendors').insert({
      id,
      name: item.name,
      name_ar: item.nameAr,
      code: item.code,
      contact_email: item.contactEmail,
      phone: item.phone,
      address: item.address,
      address_ar: item.addressAr
    });

    return newV;
  };

  const editVendor = async (item: Vendor) => {
    setVendors(prev => prev.map(v => v.id === item.id ? item : v));

    await supabase.from('vendors').update({
      name: item.name,
      name_ar: item.nameAr,
      code: item.code,
      contact_email: item.contactEmail,
      phone: item.phone,
      address: item.address,
      address_ar: item.addressAr
    }).eq('id', item.id);
  };

  const deleteVendor = async (id: string) => {
    setVendors(prev => prev.filter(v => v.id !== id));
    await supabase.from('vendors').delete().eq('id', id);
  };

  const addPayable = async (item: Omit<Payable, 'id' | 'paidAmount' | 'status'>) => {
    const id = `pay_${Date.now()}`;
    const newP: Payable = {
      ...item,
      id,
      paidAmount: 0,
      status: 'Unpaid'
    };
    setPayables(prev => [...prev, newP]);

    await supabase.from('payables').insert({
      id,
      payable_number: item.payableNumber,
      vendor_id: item.vendorId,
      branch_id: item.branchId,
      issue_date: item.issueDate,
      due_date: item.dueDate,
      total_amount: item.totalAmount,
      paid_amount: 0,
      status: 'Unpaid',
      description: item.description,
      description_ar: item.descriptionAr
    });

    return newP;
  };

  const deletePayable = async (id: string) => {
    setPayables(prev => prev.filter(p => p.id !== id));
    await supabase.from('payables').delete().eq('id', id);
  };

  const recordPayablePayment = async (item: Omit<PayablePayment, 'id'>) => {
    const id = `pay_rec_${Date.now()}`;
    const newPM: PayablePayment = { ...item, id };
    
    // Calculate new paid amount and status
    const payableObj = payables.find(p => p.id === item.payableId);
    if (payableObj) {
      const newPaid = Number(payableObj.paidAmount) + Number(item.amount);
      const newStatus: InvoiceStatus = newPaid >= Number(payableObj.totalAmount) 
        ? 'Paid' 
        : (newPaid > 0 ? 'Partial' : 'Unpaid');

      setPayables(prev => prev.map(p => p.id === item.payableId 
        ? { ...p, paidAmount: newPaid, status: newStatus } 
        : p
      ));

      await supabase.from('payables').update({
        paid_amount: newPaid,
        status: newStatus
      }).eq('id', item.payableId);
    }

    setPayablePayments(prev => [...prev, newPM]);

    await supabase.from('payable_payments').insert({
      id,
      payment_number: item.paymentNumber,
      payable_id: item.payableId,
      amount: item.amount,
      date: item.date,
      payment_method: item.paymentMethod,
      branch_id: item.branchId,
      notes: item.notes
    });

    return newPM;
  };

  const deletePayablePayment = async (id: string) => {
    const payment = payablePayments.find(p => p.id === id);
    if (payment) {
      const payableObj = payables.find(p => p.id === payment.payableId);
      if (payableObj) {
        const newPaid = Math.max(0, Number(payableObj.paidAmount) - Number(payment.amount));
        const newStatus: InvoiceStatus = newPaid >= Number(payableObj.totalAmount) 
          ? 'Paid' 
          : (newPaid > 0 ? 'Partial' : 'Unpaid');

        setPayables(prev => prev.map(p => p.id === payment.payableId 
          ? { ...p, paidAmount: newPaid, status: newStatus } 
          : p
        ));

        await supabase.from('payables').update({
          paid_amount: newPaid,
          status: newStatus
        }).eq('id', payment.payableId);
      }
    }

    setPayablePayments(prev => prev.filter(p => p.id !== id));
    await supabase.from('payable_payments').delete().eq('id', id);
  };

  const addPettyCashVoucher = async (item: Omit<PettyCashVoucher, 'id' | 'status' | 'approvedBy'>) => {
    const id = `pcv_${Date.now()}`;
    const status = item.type === 'Replenishment' ? 'Approved' : 'Pending';
    const approvedBy = item.type === 'Replenishment' ? (currentUser?.email || undefined) : undefined;
    const newVoucher: PettyCashVoucher = {
      ...item,
      id,
      status,
      approvedBy
    };
    
    setPettyCashVouchers(prev => [...prev, newVoucher]);

    await supabase.from('petty_cash_vouchers').insert({
      id,
      voucher_number: item.voucherNumber,
      branch_id: item.branchId,
      amount: item.amount,
      type: item.type,
      category: item.category,
      date: item.date,
      status,
      description: item.description,
      description_ar: item.descriptionAr,
      requested_by: item.requestedBy,
      approved_by: approvedBy,
      receipt_url: item.receiptUrl
    });

    return newVoucher;
  };

  const approvePettyCashVoucher = async (id: string, approvedByEmail: string) => {
    setPettyCashVouchers(prev => prev.map(v => v.id === id 
      ? { ...v, status: 'Approved', approvedBy: approvedByEmail } 
      : v
    ));

    await supabase.from('petty_cash_vouchers').update({
      status: 'Approved',
      approved_by: approvedByEmail
    }).eq('id', id);
  };

  const rejectPettyCashVoucher = async (id: string, approvedByEmail: string) => {
    setPettyCashVouchers(prev => prev.map(v => v.id === id 
      ? { ...v, status: 'Rejected', approvedBy: approvedByEmail } 
      : v
    ));

    await supabase.from('petty_cash_vouchers').update({
      status: 'Rejected',
      approved_by: approvedByEmail
    }).eq('id', id);
  };

  const deletePettyCashVoucher = async (id: string) => {
    setPettyCashVouchers(prev => prev.filter(v => v.id !== id));
    await supabase.from('petty_cash_vouchers').delete().eq('id', id);
  };

  const addProduct = async (item: Omit<ProductItem, 'id'>) => {
    const id = `prod_${Date.now()}`;
    const newP: ProductItem = { ...item, id };
    setProducts(prev => [newP, ...prev]);

    await supabase.from('products').insert({
      id,
      sku: item.sku,
      name: item.name,
      name_ar: item.nameAr,
      type: item.type,
      price: item.price,
      cost: item.cost,
      stock: item.stock,
      min_stock_alert: item.minStockAlert,
      description: item.description,
      description_ar: item.descriptionAr,
      category: item.category,
      category_ar: item.categoryAr
    });

    return newP;
  };

  const editProduct = async (item: ProductItem) => {
    setProducts(prev => prev.map(p => p.id === item.id ? item : p));

    await supabase.from('products').update({
      sku: item.sku,
      name: item.name,
      name_ar: item.nameAr,
      type: item.type,
      price: item.price,
      cost: item.cost,
      stock: item.stock,
      min_stock_alert: item.minStockAlert,
      description: item.description,
      description_ar: item.descriptionAr,
      category: item.category,
      category_ar: item.categoryAr
    }).eq('id', item.id);
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await supabase.from('products').delete().eq('id', id);
  };

  const addMovement = async (item: Omit<InventoryMovement, 'id'>) => {
    const id = `mov_${Date.now()}`;
    const newM: InventoryMovement = { ...item, id };
    setProducts(prev => prev.map(p => {
      if (p.id === item.productId) {
        const diff = item.type === 'In' ? item.quantity : -item.quantity;
        return { ...p, stock: Math.max(0, p.stock + diff) };
      }
      return p;
    }));
    
    // Update product stock in database too
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      const diff = item.type === 'In' ? item.quantity : -item.quantity;
      const newStock = Math.max(0, prod.stock + diff);
      supabase.from('products').update({ stock: newStock }).eq('id', item.productId).then();
    }

    setMovements(prev => [newM, ...prev]);

    await supabase.from('movements').insert({
      id,
      product_id: item.productId,
      type: item.type,
      quantity: item.quantity,
      date: item.date,
      reference: item.reference,
      notes: item.notes,
      notes_ar: item.notesAr,
      branch_id: item.branchId
    });

    return newM;
  };

  const addAdjustment = async (item: Omit<FinancialAdjustment, 'id' | 'noteNumber'>) => {
    const nextNum = adjustments.length + 1;
    const prefix = item.type === 'Credit Note' ? 'CN' : 'DN';
    const noteNum = `${prefix}-2026-${nextNum.toString().padStart(3, '0')}`;
    const id = `adj_${Date.now()}`;
    const newAdj: FinancialAdjustment = {
      ...item,
      id,
      noteNumber: noteNum
    };
    setAdjustments(prev => [newAdj, ...prev]);

    await supabase.from('adjustments').insert({
      id,
      note_number: noteNum,
      type: item.type,
      invoice_id: item.invoiceId || null,
      customer_id: item.customerId,
      branch_id: item.branchId,
      amount: item.amount,
      date: item.date,
      reason: item.reason,
      reason_ar: item.reasonAr,
      status: item.status,
      created_by: item.createdBy
    });

    return newAdj;
  };

  const editAdjustmentStatus = async (id: string, status: 'Approved' | 'Pending' | 'Rejected') => {
    setAdjustments(prev => prev.map(a => {
      if (a.id === id) {
        if (status === 'Approved' && a.status !== 'Approved' && a.invoiceId) {
          setInvoices(prevInvs => prevInvs.map(inv => {
            if (inv.id === a.invoiceId) {
              const prevTotal = inv.totalAmount;
              let newTotal = prevTotal;
              if (a.type === 'Credit Note') {
                newTotal = Math.max(inv.paidAmount, prevTotal - a.amount);
              } else {
                newTotal = prevTotal + a.amount;
              }
              const isPaid = inv.paidAmount >= newTotal;
              const newStatus: InvoiceStatus = isPaid ? 'Paid' : (inv.paidAmount > 0 ? 'Partial' : 'Unpaid');

              supabase.from('invoices').update({
                total_amount: newTotal,
                status: newStatus
              }).eq('id', inv.id).then();

              return { 
                ...inv, 
                totalAmount: newTotal,
                status: newStatus 
              };
            }
            return inv;
          }));
        }
        return { ...a, status };
      }
      return a;
    }));

    await supabase.from('adjustments').update({ status }).eq('id', id);
  };

  const updateSystemSettings = async (settings: SystemSettings) => {
    setSystemSettings(settings);
    
    const { error } = await supabase.from('system_settings').update({
      company_name: settings.companyName,
      company_name_ar: settings.companyNameAr,
      registration_no: settings.registrationNo,
      logo_url: settings.logoUrl,
      primary_currency: settings.primaryCurrency,
      date_format: settings.dateFormat,
      theme_primary_color: settings.themePrimaryColor,
      allow_theme_toggle: settings.allowThemeToggle,
      company_address: settings.companyAddress,
      company_address_ar: settings.companyAddressAr,
      company_phone: settings.companyPhone,
      company_email: settings.companyEmail,
      vat_compliance: settings.vatCompliance,
      vat_rate_pct: settings.vatRatePct,
      invoice_prefix: settings.invoicePrefix,
      receipt_prefix: settings.receiptPrefix,
      default_due_days: settings.defaultDueDays,
      invoice_footer_terms: settings.invoiceFooterTerms,
      invoice_footer_terms_ar: settings.invoiceFooterTermsAr,
      receipt_footer_terms: settings.receiptFooterTerms,
      receipt_footer_terms_ar: settings.receiptFooterTermsAr,
      company_seal_url: settings.companySealUrl || null,
      company_seal_name: settings.companySealName || null,
      company_seal_name_ar: settings.companySealNameAr || null,
      authorized_signature_url: settings.authorizedSignatureUrl || null,
      authorized_signature_name: settings.authorizedSignatureName || null,
      authorized_signature_name_ar: settings.authorizedSignatureNameAr || null,
      show_seal_on_invoices: settings.showSealOnInvoices,
      show_signature_on_invoices: settings.showSignatureOnInvoices,
      default_staff_salary: settings.defaultStaffSalary,
      allow_staff_self_edit: settings.allowStaffSelfEdit,
      restrict_invoice_deletion: settings.restrictInvoiceDeletion,
      enforce_salary_approval: settings.enforceSalaryApproval,
      default_branch_id: settings.defaultBranchId,
      enable_branch_isolation: settings.enableBranchIsolation,
      max_branches_allowed: settings.maxBranchesAllowed,
      real_time_notifications: settings.realTimeNotifications,
      two_factor_auth: settings.twoFactorAuth,
      email_host: settings.emailHost || null,
      email_port: settings.emailPort || null,
      email_user: settings.emailUser || null,
      email_password: settings.emailPassword || null,
      email_from: settings.emailFrom || null,
      email_secure: settings.emailSecure || false,
      email_send_invoices: settings.emailSendInvoices || false,
      email_send_receipts: settings.emailSendReceipts || false,
      email_send_reports: settings.emailSendReports || false,
      email_reports_period: settings.emailReportsPeriod || 'Monthly',
      email_reports_recipient: settings.emailReportsRecipient || null,
      email_alert_on_large_expense: settings.emailAlertOnLargeExpense || false,
      email_alert_large_expense_amount: settings.emailAlertLargeExpenseAmount || 10000,
      email_alert_on_role_change: settings.emailAlertOnRoleChange || false
    }).eq('id', 1);

    if (error) {
      console.error("Error updating system settings in Supabase:", error);
      throw error;
    }
  };

  // State filtering logic (Branch Isolation / RLS)
  const filterByBranch = <T extends { branchId: string }>(items: T[]): T[] => {
    if (currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Accountant') {
      if (currentBranchId === 'all') return items;
      return items.filter(item => item.branchId === currentBranchId);
    }
    // Managers/Employees:
    const allowedIds = currentUser?.branchIds && currentUser.branchIds.length > 0
      ? currentUser.branchIds
      : [currentUser?.branchId].filter(Boolean) as string[];
    
    if (currentBranchId === 'all') {
      return items.filter(item => allowedIds.includes(item.branchId));
    }
    if (allowedIds.includes(currentBranchId)) {
      return items.filter(item => item.branchId === currentBranchId);
    }
    return [];
  };

  const filterIncomeByBranch = (items: Income[]): Income[] => filterByBranch(items);
  const filterExpenseByBranch = (items: Expense[]): Expense[] => filterByBranch(items);
  const filterInvoiceByBranch = (items: Invoice[]): Invoice[] => filterByBranch(items);
  const filterReceiptByBranch = (items: Receipt[]): Receipt[] => filterByBranch(items);
  const filterAdjustmentByBranch = (items: FinancialAdjustment[]): FinancialAdjustment[] => filterByBranch(items);
  const filterMovementByBranch = (items: InventoryMovement[]): InventoryMovement[] => filterByBranch(items);
  const filterPayableByBranch = (items: Payable[]): Payable[] => filterByBranch(items);
  const filterPayablePaymentByBranch = (items: PayablePayment[]): PayablePayment[] => filterByBranch(items);
  const filterPettyCashByBranch = (items: PettyCashVoucher[]): PettyCashVoucher[] => filterByBranch(items);

  const filteredIncome = filterIncomeByBranch(income);
  const filteredExpenses = filterExpenseByBranch(expenses);
  const filteredInvoices = filterInvoiceByBranch(invoices);
  const filteredReceipts = filterReceiptByBranch(receipts);
  const filteredAdjustments = filterAdjustmentByBranch(adjustments);
  const filteredMovements = filterMovementByBranch(movements);
  const filteredPayables = filterPayableByBranch(payables);
  const filteredPayablePayments = filterPayablePaymentByBranch(payablePayments);
  const filteredPettyCashVouchers = filterPettyCashByBranch(pettyCashVouchers);

  const filteredEmployees = (() => {
    if (currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Accountant') {
      if (currentBranchId === 'all') return employees;
      return employees.filter(e => e.branchId === currentBranchId);
    }
    // Managers/Employees:
    const allowedIds = currentUser?.branchIds && currentUser.branchIds.length > 0
      ? currentUser.branchIds
      : [currentUser?.branchId].filter(Boolean) as string[];
    
    if (currentBranchId === 'all') {
      return employees.filter(e => {
        if (e.branchIds && e.branchIds.length > 0) {
          return e.branchIds.some(id => allowedIds.includes(id));
        }
        return allowedIds.includes(e.branchId);
      });
    }
    return employees.filter(e => {
      if (e.branchIds && e.branchIds.length > 0) {
        return e.branchIds.includes(currentBranchId);
      }
      return e.branchId === currentBranchId;
    });
  })();

  const filteredBranches = (() => {
    if (currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Accountant') {
      if (currentBranchId === 'all') return branches;
      return branches.filter(b => b.id === currentBranchId);
    }
    // Managers/Employees:
    const allowedIds = currentUser?.branchIds && currentUser.branchIds.length > 0
      ? currentUser.branchIds
      : [currentUser?.branchId].filter(Boolean) as string[];
    
    if (currentBranchId === 'all') {
      return branches.filter(b => allowedIds.includes(b.id));
    }
    return branches.filter(b => b.id === currentBranchId && allowedIds.includes(b.id));
  })();

  // Financial Calculations reactively based on filter state
  const totalIncomeVal = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalExpensesVal = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfitVal = totalIncomeVal - totalExpensesVal;

  const pendingInvoices = filteredInvoices.filter(i => i.status !== 'Paid');
  const pendingInvoicesCount = pendingInvoices.length;
  const pendingInvoicesAmount = pendingInvoices.reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);

  // Combine income and expenses to create a unified transaction feed
  const unifiedTransactions = [
    ...filteredIncome.map(inc => ({
      id: inc.id,
      type: 'INCOME' as const,
      entity: language === 'ar' ? inc.sourceAr : inc.source,
      category: 'Sales',
      categoryAr: 'مبيعات',
      amount: inc.amount,
      date: inc.date,
      branchId: inc.branchId,
      status: 'Verified',
      statusAr: 'مؤكد',
      method: inc.paymentMethod
    })),
    ...filteredExpenses.map(exp => ({
      id: exp.id,
      type: 'EXPENSE' as const,
      entity: language === 'ar' ? exp.entityAr : exp.entity,
      category: exp.category,
      categoryAr: exp.category === 'Rent' ? 'إيجار' : exp.category === 'Payroll' ? 'رواتب' : exp.category === 'Utilities' ? 'مرافق' : exp.category === 'Fees' ? 'رسوم' : 'أخرى',
      amount: -exp.amount,
      date: exp.date,
      branchId: exp.branchId,
      status: exp.status,
      statusAr: exp.status === 'Approved' ? 'معتمد' : exp.status === 'Pending' ? 'قيد الانتظار' : 'ملحوظ',
      method: 'Corporate Account'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    branches,
    filteredBranches,
    customers,
    employees,
    filteredEmployees,
    income,
    filteredIncome,
    expenses,
    filteredExpenses,
    invoices,
    filteredInvoices,
    receipts,
    filteredReceipts,
    products,
    movements,
    filteredMovements,
    adjustments,
    filteredAdjustments,
    systemSettings,
    setSystemSettings: updateSystemSettings,
    currentUser,
    setCurrentUser,
    language,
    toggleLanguage,
    currentBranchId,
    setCurrentBranchId,
    loginSim,
    logoutSim,
    signUp,
    signIn,
    resetPassword,
    addIncome,
    deleteIncome,
    addExpense,
    deleteExpense,
    createInvoice,
    deleteInvoice,
    recordReceipt,
    deleteReceipt,
    addBranch,
    editBranch,
    deleteBranch,
    addEmployee,
    editEmployee,
    deleteEmployee,
    addCustomer,
    editCustomer,
    deleteCustomer,
    addProduct,
    editProduct,
    deleteProduct,
    addMovement,
    addAdjustment,
    editAdjustmentStatus,
    vendors,
    payables,
    filteredPayables,
    payablePayments,
    filteredPayablePayments,
    addVendor,
    editVendor,
    deleteVendor,
    addPayable,
    deletePayable,
    recordPayablePayment,
    deletePayablePayment,
    pettyCashVouchers,
    filteredPettyCashVouchers,
    addPettyCashVoucher,
    approvePettyCashVoucher,
    rejectPettyCashVoucher,
    deletePettyCashVoucher,
    totalIncome: totalIncomeVal,
    totalExpenses: totalExpensesVal,
    netProfit: netProfitVal,
    pendingInvoicesCount,
    pendingInvoicesAmount,
    transactions: unifiedTransactions
  };
};
