# System Architecture & Development Protocol (AGENTS.md)

This document establishes the official developer protocol, architectural blueprints, styling paradigms, and bilingual criteria for the **Real-Time Financial Auditing & Stock Reconciliation Portal**. All AI coding agents and human developers MUST strictly adhere to these instructions.

---

## 1. Project Visual Identity & Typography Pairing
To reflect a professional enterprise auditor aesthetic, the UI uses standard pairings:
- **Display Headings:** Inter / System Sans-serif, utilizing `tracking-tight font-black text-slate-800` for high legibility.
- **Data Tables & Monetary Metrics:** `font-mono tracking-normal font-bold` (JetBrains Mono/Fira Code alignment) to display precise real-time ledger outputs.
- **Consolidated Theme Palette (High-Contrast Slate):**
  - **Primary Scaffold Background:** Light off-white (`bg-slate-50` / `bg-white` borderlines).
  - **Incomes & Safe states:** Emerald Green (`text-emerald-600` / `bg-emerald-50`).
  - **Warnings & Outstanding accounts:** Amber/Yellow (`text-amber-600` / `bg-amber-50`).
  - **Critical Stock / Defaults / Overdues:** Rose/Red (`text-rose-600` / `bg-rose-50`).

---

## 2. Directory & Core Codebase Topology

```text
/
├── metadata.json                 # Core capability and frame configuration
├── TSConfig.json                 # Strict TypeScript compiler options
├── package.json                  # Dependencies (Tailwind, Lucide, Motion, etc.)
├── skills/                       # Custom Agent modular skills
│   ├── financial_audit_compliance/   # VAT standards, formulas & bilingual math
│   └── code_review_git/              # Type safety, git formatting guidelines
└── src/
    ├── types.ts                  # Central Enterprise data model schemas
    ├── store.ts                  # Central state store (Zustand/Context equivalent)
    ├── App.tsx                   # Grid layout portal, distributing system context
    └── components/
        ├── Header.tsx            # Alert notifications feed, simulation engine
        ├── ReportsModule.tsx     # KPI, P&L, VAT Audits, Accounts Receivable (Aging), Inventory ledgers
        └── SettingsModule.tsx    # Live compliance thresholds configuration
```

---

## 3. Mandatory Development Rules

### A. Non-Disruptive State Management
- Never update states or configuration values directly inside a component's render flow.
- Ensure dependency arrays in hooks (`useMemo`, `useEffect`) operate on primitive types to prevent infinite re-render cascades.

### B. Enterprise Bilingual Localization (Dual-Language Interface)
- Every user-facing label, prompt, modal, toast, or chart legend MUST toggle seamlessly between **English (En)** and **Arabic (Ar)**.
- Data structures must reference both localized attributes:
  - `name` vs `nameAr`
  - `description` vs `descriptionAr`
  - `notes` vs `notesAr`

### C. Bulletproof Formats & Casting
Before executing mathematical logic or displaying values through formatter widgets, values must be explicitly parsed:
- **Correct Pattern:** `formatCurrency(sum as number)` or `Number(value)`
- Avoid passing untyped metrics to currency counters to comply with TypeScript's strict rules.

---

## 4. Operational Checklists for Future Turns

- [ ] **Linter Integrity:** Always run `npm run lint` (`tsc --noEmit`) before completing any turn.
- [ ] **Data Security:** Ensure any test/demo data aligns mathematically with actual active VAT rates (defaulting to 15%).
- [ ] **Print Compliance:** Use Tailwind's `no-print` and `printable-area` classes to keep physical PDF outputs tidy.
- [ ] **Notification Muting:** Live warnings count must always respect the `systemSettings.realTimeNotifications` toggle to respect user privacy.
