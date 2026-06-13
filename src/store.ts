import { useState, useEffect } from 'react';
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
  FinancialAdjustment
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
  twoFactorAuth: false
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
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const stored = getStored(KEY_SETTINGS, INITIAL_SETTINGS);
    return { ...INITIAL_SETTINGS, ...stored };
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStored(KEY_CURRENT_USER, INITIAL_USER));
  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    if (typeof window === 'undefined') return 'ar';
    return (localStorage.getItem(KEY_LANG) as 'en' | 'ar') || 'ar'; // Default to Arabic as requested first in screenshot direction
  });
  
  const [currentBranchId, setCurrentBranchId] = useState<string>('all');

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
  useEffect(() => { saveStored(KEY_SETTINGS, systemSettings); }, [systemSettings]);
  useEffect(() => { saveStored(KEY_CURRENT_USER, currentUser); }, [currentUser]);
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

  const logoutSim = () => {
    setCurrentUser(null);
  };

  // CRUD utilities
  const addIncome = (item: Omit<Income, 'id'>) => {
    const newInc: Income = { ...item, id: `inc_${Date.now()}` };
    setIncome(prev => [newInc, ...prev]);
    return newInc;
  };

  const deleteIncome = (id: string) => {
    setIncome(prev => prev.filter(i => i.id !== id));
  };

  const addExpense = (item: Omit<Expense, 'id'>) => {
    const newExp: Expense = { ...item, id: `exp_${Date.now()}` };
    setExpenses(prev => [newExp, ...prev]);
    return newExp;
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const createInvoice = (item: Omit<Invoice, 'id' | 'invoiceNumber' | 'totalAmount' | 'paidAmount'>) => {
    const nextNum = invoices.length + 1;
    const prefix = systemSettings.invoicePrefix || 'INV';
    const invNum = `${prefix}-2026-${nextNum.toString().padStart(3, '0')}`;
    const subtotal = item.items.reduce((sum, current) => sum + (current.price * current.quantity), 0);
    const hasVat = systemSettings.vatCompliance;
    const vatRate = systemSettings.vatRatePct ?? 15;
    const total = hasVat ? subtotal * (1 + vatRate / 100) : subtotal;
    const newInv: Invoice = {
      ...item,
      id: `inv_${Date.now()}`,
      invoiceNumber: invNum,
      totalAmount: total,
      paidAmount: 0
    };
    setInvoices(prev => [newInv, ...prev]);
    return newInv;
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const recordReceipt = (item: Omit<Receipt, 'id' | 'receiptNumber'>) => {
    const nextNum = receipts.length + 1;
    const prefix = systemSettings.receiptPrefix || 'REC';
    const recNum = `${prefix}-2026-${nextNum.toString().padStart(3, '0')}`;
    const newRec: Receipt = {
      ...item,
      id: `rec_${Date.now()}`,
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
        return {
          ...inv,
          paidAmount: newPaid,
          status: newStatus
        };
      }
      return inv;
    }));

    setReceipts(prev => [newRec, ...prev]);
    return newRec;
  };

  const deleteReceipt = (id: string) => {
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
  };

  const addBranch = (item: Omit<Branch, 'id'>) => {
    const newB: Branch = { ...item, id: `br_${Date.now()}` };
    setBranches(prev => [...prev, newB]);
    return newB;
  };

  const editBranch = (item: Branch) => {
    setBranches(prev => prev.map(b => b.id === item.id ? item : b));
  };

  const deleteBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  const addEmployee = (item: Omit<Employee, 'id'>) => {
    const newEmp: Employee = { ...item, id: `emp_${Date.now()}` };
    setEmployees(prev => [...prev, newEmp]);
    return newEmp;
  };

  const editEmployee = (item: Employee) => {
    setEmployees(prev => prev.map(e => e.id === item.id ? item : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const addCustomer = (item: Omit<Customer, 'id'>) => {
    const newC: Customer = { ...item, id: `cus_${Date.now()}` };
    setCustomers(prev => [...prev, newC]);
    return newC;
  };

  const editCustomer = (item: Customer) => {
    setCustomers(prev => prev.map(c => c.id === item.id ? item : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addProduct = (item: Omit<ProductItem, 'id'>) => {
    const newP: ProductItem = { ...item, id: `prod_${Date.now()}` };
    setProducts(prev => [newP, ...prev]);
    return newP;
  };

  const editProduct = (item: ProductItem) => {
    setProducts(prev => prev.map(p => p.id === item.id ? item : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addMovement = (item: Omit<InventoryMovement, 'id'>) => {
    const newM: InventoryMovement = { ...item, id: `mov_${Date.now()}` };
    setProducts(prev => prev.map(p => {
      if (p.id === item.productId) {
        const diff = item.type === 'In' ? item.quantity : -item.quantity;
        return { ...p, stock: Math.max(0, p.stock + diff) };
      }
      return p;
    }));
    setMovements(prev => [newM, ...prev]);
    return newM;
  };

  const addAdjustment = (item: Omit<FinancialAdjustment, 'id' | 'noteNumber'>) => {
    const nextNum = adjustments.length + 1;
    const prefix = item.type === 'Credit Note' ? 'CN' : 'DN';
    const noteNum = `${prefix}-2026-${nextNum.toString().padStart(3, '0')}`;
    const newAdj: FinancialAdjustment = {
      ...item,
      id: `adj_${Date.now()}`,
      noteNumber: noteNum
    };
    setAdjustments(prev => [newAdj, ...prev]);
    return newAdj;
  };

  const editAdjustmentStatus = (id: string, status: 'Approved' | 'Pending' | 'Rejected') => {
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
  };

  // State filtering logic (Branch Isolation / RLS)
  const filterIncomeByBranch = (items: Income[]): Income[] => {
    if (currentBranchId === 'all') return items;
    return items.filter(item => item.branchId === currentBranchId);
  };

  const filterExpenseByBranch = (items: Expense[]): Expense[] => {
    if (currentBranchId === 'all') return items;
    return items.filter(item => item.branchId === currentBranchId);
  };

  const filterInvoiceByBranch = (items: Invoice[]): Invoice[] => {
    if (currentBranchId === 'all') return items;
    return items.filter(item => item.branchId === currentBranchId);
  };

  const filterReceiptByBranch = (items: Receipt[]): Receipt[] => {
    if (currentBranchId === 'all') return items;
    return items.filter(item => item.branchId === currentBranchId);
  };

  const filterAdjustmentByBranch = (items: FinancialAdjustment[]): FinancialAdjustment[] => {
    if (currentBranchId === 'all') return items;
    return items.filter(item => item.branchId === currentBranchId);
  };

  const filterMovementByBranch = (items: InventoryMovement[]): InventoryMovement[] => {
    if (currentBranchId === 'all') return items;
    return items.filter(item => item.branchId === currentBranchId);
  };

  const filteredIncome = filterIncomeByBranch(income);
  const filteredExpenses = filterExpenseByBranch(expenses);
  const filteredInvoices = filterInvoiceByBranch(invoices);
  const filteredReceipts = filterReceiptByBranch(receipts);
  const filteredAdjustments = filterAdjustmentByBranch(adjustments);
  const filteredMovements = filterMovementByBranch(movements);
  const filteredEmployees = currentBranchId === 'all' ? employees : employees.filter(e => e.branchId === currentBranchId);
  const filteredBranches = currentBranchId === 'all' ? branches : branches.filter(b => b.id === currentBranchId);

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
    setSystemSettings,
    currentUser,
    setCurrentUser,
    language,
    toggleLanguage,
    currentBranchId,
    setCurrentBranchId,
    loginSim,
    logoutSim,
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
    totalIncome: totalIncomeVal,
    totalExpenses: totalExpensesVal,
    netProfit: netProfitVal,
    pendingInvoicesCount,
    pendingInvoicesAmount,
    transactions: unifiedTransactions
  };
};
