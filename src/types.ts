export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'Accountant' | 'Employee';

export type PaymentMethod = 'Bank Transfer' | 'Cash' | 'Corporate Credit';

export type ExpenseCategory = 'Rent' | 'Payroll' | 'Utilities' | 'Infrastructure' | 'Fees';

export type ExpenseStatus = 'Approved' | 'Pending' | 'Flagged';

export type InvoiceStatus = 'Paid' | 'Partial' | 'Unpaid';

export type BranchStatus = 'Active' | 'Maintenance';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Branch {
  id: string;
  name: string;
  nameAr: string;
  location: string;
  locationAr: string;
  managerId: string; // References Employee.id
  status: BranchStatus;
}

export interface User {
  uid: string;
  name: string;
  nameAr: string;
  email: string;
  role: UserRole;
  branchId: string; // 'all' or specific Branch ID
  branchIds?: string[];
  avatar: string;
}

export interface Income {
  id: string;
  source: string;
  sourceAr: string;
  amount: number;
  date: string;
  branchId: string;
  paymentMethod: PaymentMethod;
  invoiceId?: string; // Optional link to invoice
  description?: string;
  descriptionAr?: string;
}

export interface Expense {
  id: string;
  entity: string;
  entityAr: string;
  amount: number;
  date: string;
  branchId: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  attachmentUrl?: string; // Base64 data or mock URL
  fileName?: string;
  description?: string;
  descriptionAr?: string;
}

export interface InvoiceItem {
  description: string;
  descriptionAr: string;
  price: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  branchId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  paidAmount: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  branchId: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  contactEmail: string;
  phone: string;
  address: string;
  addressAr: string;
}

export interface Employee {
  id: string;
  empId: string;
  name: string;
  nameAr: string;
  role: UserRole;
  roleTitle: string;
  roleTitleAr: string;
  branchId: string;
  branchIds?: string[];
  email: string;
  avatar: string;
  status: EmployeeStatus;
  salary: number;
}

export interface SystemSettings {
  // --- General Settings ---
  companyName: string;
  companyNameAr: string;
  registrationNo: string;
  logoUrl: string;
  primaryCurrency: 'SAR' | 'OMR' | 'USD' | 'EUR';
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  themePrimaryColor: 'emerald' | 'blue' | 'indigo' | 'violet' | 'slate';
  allowThemeToggle: boolean;

  // --- Company Settings ---
  companyAddress: string;
  companyAddressAr: string;
  companyPhone: string;
  companyEmail: string;
  vatCompliance: boolean;
  vatRatePct: number; // default: 15

  // --- Invoice & Receipt Settings ---
  invoicePrefix: string;  // e.g. "INV"
  receiptPrefix: string;  // e.g. "REC"
  defaultDueDays: number; // default: 30
  invoiceFooterTerms: string;
  invoiceFooterTermsAr: string;
  receiptFooterTerms: string;
  receiptFooterTermsAr: string;

  // --- Seal & Signature ---
  companySealUrl?: string;
  companySealName?: string;
  companySealNameAr?: string;
  authorizedSignatureUrl?: string;
  authorizedSignatureName?: string;
  authorizedSignatureNameAr?: string;
  showSealOnInvoices?: boolean;
  showSignatureOnInvoices?: boolean;

  // --- Staff & Roles Settings ---
  defaultStaffSalary: number;
  allowStaffSelfEdit: boolean;
  restrictInvoiceDeletion: boolean;
  enforceSalaryApproval: boolean;

  // --- Branches Settings ---
  defaultBranchId: string;
  enableBranchIsolation: boolean;
  maxBranchesAllowed: number;
  realTimeNotifications: boolean;
  twoFactorAuth: boolean;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  nameAr: string;
  type: 'Product' | 'Service';
  price: number;
  cost: number;
  stock: number;
  minStockAlert: number;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'In' | 'Out';
  quantity: number;
  date: string;
  reference: string;
  notes: string;
  notesAr: string;
  branchId: string;
}

export interface FinancialAdjustment {
  id: string;
  noteNumber: string;
  type: 'Credit Note' | 'Debit Note';
  invoiceId?: string;
  customerId: string;
  branchId: string;
  amount: number;
  date: string;
  reason: string;
  reasonAr: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  createdBy: string;
}

