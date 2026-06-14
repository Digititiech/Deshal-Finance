import React, { useState } from 'react';
import { useDb } from './store';
import { Sidebar, TabId } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { IncomeModule } from './components/IncomeModule';
import { ExpensesModule } from './components/ExpensesModule';
import { InvoicesModule } from './components/InvoicesModule';
import { ReceiptsModule } from './components/ReceiptsModule';
import { CustomersModule } from './components/CustomersModule';
import { BranchesModule } from './components/BranchesModule';
import { EmployeesModule } from './components/EmployeesModule';
import { ReportsModule } from './components/ReportsModule';
import { SettingsModule } from './components/SettingsModule';
import { AuthSim } from './components/AuthSim';
import { AdjustmentsModule } from './components/AdjustmentsModule';
import { InventoryModule } from './components/InventoryModule';
import { PayablesModule } from './components/PayablesModule';
import { PettyCashModule } from './components/PettyCashModule';

export default function App() {
  const db = useDb();
  const [activeTab, setActiveTab] = useState<TabId>('DASHBOARD');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [quickActionTrigger, setQuickActionTrigger] = useState<string | null>(null);
  const clearQuickAction = () => setQuickActionTrigger(null);

  // If user is not authorized, trigger login portal
  if (!db.currentUser) {
    return <AuthSim db={db} lang={db.language} />;
  }

  // Define tab navigation rendering
  const renderActiveView = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return (
          <Dashboard
            branches={db.branches}
            customers={db.customers}
            transactions={db.transactions}
            totalIncome={db.totalIncome}
            totalExpenses={db.totalExpenses}
            netProfit={db.netProfit}
            pendingInvoicesCount={db.pendingInvoicesCount}
            pendingInvoicesAmount={db.pendingInvoicesAmount}
            lang={db.language}
            systemSettings={db.systemSettings}
            setActiveTab={setActiveTab}
            currentBranchId={db.currentBranchId}
          />
        );
      case 'INCOME':
        return (
          <IncomeModule
            income={db.income}
            filteredIncome={db.filteredIncome}
            invoices={db.invoices}
            filteredInvoices={db.filteredInvoices}
            branches={db.branches}
            customers={db.customers}
            addIncome={db.addIncome}
            addCustomer={db.addCustomer}
            deleteIncome={db.deleteIncome}
            lang={db.language}
            userRole={db.currentUser?.role}
            systemSettings={db.systemSettings}
            quickActionTrigger={quickActionTrigger}
            clearQuickAction={clearQuickAction}
          />
        );
      case 'EXPENSES':
        return (
          <ExpensesModule
            expenses={db.expenses}
            filteredExpenses={db.filteredExpenses}
            payables={db.payables}
            filteredPayables={db.filteredPayables}
            vendors={db.vendors}
            branches={db.branches}
            customers={db.customers}
            addExpense={db.addExpense}
            addCustomer={db.addCustomer}
            deleteExpense={db.deleteExpense}
            lang={db.language}
            userRole={db.currentUser?.role}
            systemSettings={db.systemSettings}
            quickActionTrigger={quickActionTrigger}
            clearQuickAction={clearQuickAction}
          />
        );
      case 'INVOICES':
        return (
          <InvoicesModule
            invoices={db.invoices}
            filteredInvoices={db.filteredInvoices}
            customers={db.customers}
            branches={db.branches}
            createInvoice={db.createInvoice}
            deleteInvoice={db.deleteInvoice}
            recordReceipt={db.recordReceipt}
            lang={db.language}
            userRole={db.currentUser?.role}
            systemSettings={db.systemSettings}
            quickActionTrigger={quickActionTrigger}
            clearQuickAction={clearQuickAction}
          />
        );
      case 'RECEIPTS':
        return (
          <ReceiptsModule
            receipts={db.receipts}
            filteredReceipts={db.filteredReceipts}
            invoices={db.invoices}
            branches={db.branches}
            deleteReceipt={db.deleteReceipt}
            lang={db.language}
            userRole={db.currentUser?.role}
            systemSettings={db.systemSettings}
          />
        );
      case 'PAYABLES':
        return (
          <PayablesModule
            vendors={db.vendors}
            payables={db.payables}
            filteredPayables={db.filteredPayables}
            payablePayments={db.payablePayments}
            filteredPayablePayments={db.filteredPayablePayments}
            branches={db.branches}
            addVendor={db.addVendor}
            editVendor={db.editVendor}
            deleteVendor={db.deleteVendor}
            addPayable={db.addPayable}
            deletePayable={db.deletePayable}
            recordPayablePayment={db.recordPayablePayment}
            deletePayablePayment={db.deletePayablePayment}
            lang={db.language}
            userRole={db.currentUser?.role}
            systemSettings={db.systemSettings}
            quickActionTrigger={quickActionTrigger}
            clearQuickAction={clearQuickAction}
          />
        );
      case 'PETTY_CASH':
        return (
          <PettyCashModule
            vouchers={db.pettyCashVouchers}
            filteredVouchers={db.filteredPettyCashVouchers}
            branches={db.branches}
            employees={db.employees}
            addVoucher={db.addPettyCashVoucher}
            approveVoucher={db.approvePettyCashVoucher}
            rejectVoucher={db.rejectPettyCashVoucher}
            deleteVoucher={db.deletePettyCashVoucher}
            lang={db.language}
            userRole={db.currentUser?.role}
            currentUser={db.currentUser}
            systemSettings={db.systemSettings}
          />
        );
      case 'ADJUSTMENTS':
        return (
          <AdjustmentsModule
            adjustments={db.adjustments}
            filteredAdjustments={db.filteredAdjustments}
            customers={db.customers}
            invoices={db.invoices}
            branches={db.branches}
            addAdjustment={db.addAdjustment}
            editAdjustmentStatus={db.editAdjustmentStatus}
            lang={db.language}
            userRole={db.currentUser?.role}
            systemSettings={db.systemSettings}
          />
        );
      case 'INVENTORY':
        return (
          <InventoryModule
            products={db.products}
            movements={db.movements}
            filteredMovements={db.filteredMovements}
            branches={db.branches}
            addProduct={db.addProduct}
            editProduct={db.editProduct}
            deleteProduct={db.deleteProduct}
            addMovement={db.addMovement}
            lang={db.language}
            userRole={db.currentUser?.role}
            currentBranchId={db.currentBranchId}
            systemSettings={db.systemSettings}
          />
        );
      case 'CUSTOMERS':
        return (
          <CustomersModule
            customers={db.customers}
            invoices={db.invoices}
            addCustomer={db.addCustomer}
            editCustomer={db.editCustomer}
            deleteCustomer={db.deleteCustomer}
            lang={db.language}
            userRole={db.currentUser?.role}
            quickActionTrigger={quickActionTrigger}
            clearQuickAction={clearQuickAction}
          />
        );
      case 'BRANCHES':
        return (
          <BranchesModule
            branches={db.branches}
            employees={db.employees}
            income={db.income}
            expenses={db.expenses}
            addBranch={db.addBranch}
            editBranch={db.editBranch}
            deleteBranch={db.deleteBranch}
            lang={db.language}
            userRole={db.currentUser?.role}
          />
        );
      case 'EMPLOYEES':
        return (
          <EmployeesModule
            employees={db.employees}
            filteredEmployees={db.filteredEmployees}
            branches={db.branches}
            addEmployee={db.addEmployee}
            editEmployee={db.editEmployee}
            deleteEmployee={db.deleteEmployee}
            lang={db.language}
            userRole={db.currentUser?.role}
          />
        );
      case 'REPORTS':
        return (
          <ReportsModule
            branches={db.branches}
            income={db.income}
            expenses={db.expenses}
            invoices={db.invoices}
            receipts={db.receipts}
            customers={db.customers}
            products={db.products}
            movements={db.movements}
            lang={db.language}
            systemSettings={db.systemSettings}
          />
        );
      case 'SETTINGS':
        return (
          <SettingsModule
            systemSettings={db.systemSettings}
            setSystemSettings={db.setSystemSettings}
            lang={db.language}
            userRole={db.currentUser?.role}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex overflow-hidden font-sans select-none relative w-full" dir={db.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar drawer: Desktop */}
      <div className="hidden md:block h-screen shrink-0 relative z-20">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={db.language}
          userRole={db.currentUser?.role}
          logout={db.logoutSim}
        />
      </div>

      {/* Sidebar drawer: Mobile Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop blur clickoff */}
          <div 
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
          ></div>
          <div className="relative w-64 max-w-xs h-full bg-slate-900 border-r border-slate-800 flex flex-col z-50 animate-slide-in">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileNavOpen(false);
              }}
              lang={db.language}
              userRole={db.currentUser?.role}
              logout={db.logoutSim}
            />
          </div>
        </div>
      )}

      {/* Primary content area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-slate-100">
        {/* Universal Top Header */}
        <Header
          currentUser={db.currentUser}
          language={db.language}
          toggleLanguage={db.toggleLanguage}
          currentBranchId={db.currentBranchId}
          setCurrentBranchId={db.setCurrentBranchId}
          branches={db.branches}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          totalIncome={db.totalIncome}
          totalExpenses={db.totalExpenses}
          products={db.products}
          expenses={db.expenses}
          invoices={db.invoices}
          adjustments={db.adjustments}
          systemSettings={db.systemSettings}
          onQuickAction={(action) => {
            setQuickActionTrigger(action);
            switch (action) {
              case 'CREATE_INVOICE':
                setActiveTab('INVOICES');
                break;
              case 'RECORD_EXPENSE':
                setActiveTab('EXPENSES');
                break;
              case 'RECORD_INCOME':
                setActiveTab('INCOME');
                break;
              case 'RECORD_BILL':
              case 'ADD_VENDOR':
                setActiveTab('PAYABLES');
                break;
              case 'ADD_CUSTOMER':
                setActiveTab('CUSTOMERS');
                break;
            }
          }}
        />

        {/* Dynamic Inner Sub-Modules view container */}
        <main className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}
