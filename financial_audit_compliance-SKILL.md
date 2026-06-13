---
name: financial-audit-compliance
description: Master rules, mathematical calculations, VAT compliance standards (15%), bilingual translations, and inventory ledger checks for the Real-time Financial Auditing and Stock Reconciliation Dashboard.
---

# Financial Audit & Tax Compliance Skill (SKILL.md)

This skill controls the core math, bilingual attributes, and compliance standards for the financial ledger system. Activate this skill whenever you modify or audit components related to invoices, tax calculations, accounting balances, inventory movements, or financial reporting.

---

## 1. Core Financial Data Schema Reference
All custom modifications to the store or layout must strictly adhere to the types declared in `src/types.ts`:
- **Income & EBITDA Tracking:** All `Income` sources must contain both a standard name (`source`) and its Arabic counterpart (`sourceAr`).
- **Tax Configurations:** Ensure standard computations use `systemSettings.vatRatePct` (defaulting to `15` for Saudi ZATCA compliance).
- **Stock Audit trail:** Each physical shift must register an `InventoryMovement` entry with `productId`, type (`In` / `Out`), unique document `reference`, and detailed explanation strings (`notes`, `notesAr`).

---

## 2. Standard Mathematical Formulations (ZATCA & GAAP Compliant)

When building statistics or summaries, you MUST implement these formulas precisely:

### A. VAT calculations (Saudi Arabia 15% Base)
$$\text{Tax Amount} = \text{Subtotal} \times \left( \frac{\text{VAT Rate Pct}}{100} \right)$$
$$\text{Total Invoice Gross} = \text{Subtotal} + \text{Tax Amount}$$

- In files such as `ReportsModule.tsx`, verify that values are treated safely as numbers by casting if retrieved from untyped inputs: `(item.price * item.quantity) as number`.

### B. Gross Profit & EBITDA Margins
$$\text{Projected Profit} = \sum (\text{Product Price} \times \text{Available Stock}) - \sum (\text{Product Cost} \times \text{Available Stock})$$
$$\text{Net Operating Spread} = \text{Total Unused Revenues} - \text{Total Approved Outflows}$$

### C. Receivable Debt Aging Breakdown
Divided into critical buckets based on `Invoice.dueDate` comparison with current local time ($T_{current}$):
1. **Current (On-time):** $T_{due} > T_{current}$
2. **Standard Delay (1 - 30 Days):** $0 \le T_{current} - T_{due} \le 30$
3. **Severe Default (Over 31+ Days):** $T_{current} - T_{due} > 30$

---

## 3. Mandatory Arabic & English Bilingual Standards

This system is fully bilingual. Any new alert, form placeholder, or database table element must feature localized strings:
- **Rule:** Never display static English text when `lang === 'ar'`.
- **Localization Key Reference:**
  - `name` vs `nameAr` (Products, Branches, Customers, Employees)
  - `category` vs `categoryAr` (Expense categories, products classification)
  - `description` vs `descriptionAr` (Item specs, financial adjustment reasons)
  - `notes` vs `notesAr` (Receipt terms, warehouse logs)

---

## 4. UI Precision & Print Mode Auditing
- When adding metrics tiles, use distinct high-contrast colors:
  - **Incomes & Safe states:** Green (`text-emerald-650` / `bg-emerald-50`)
  - **Unpaid / Overdue / Warning states:** Amber/Yellow (`text-amber-600` / `bg-amber-50`)
  - **Out of Stock / Danger / Delayed liabilities:** Rose/Red (`text-rose-600` / `bg-rose-50`)
_Keep class names fully compliant with standard Tailwind styles._
