# AI Coding Agent Instructions - FitPro Front-end

## Project Overview

**FitPro** is a production management system for clothing manufacturing. It tracks production batches (lotes), suppliers, contractors (facções), fabrics, employees (colaboradores), and inventory movements across the entire manufacturing workflow.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, React Hook Form, Zod, TanStack React Table, Radix UI components, Sonner for notifications.

---

## Architecture Patterns

### 1. State Management: Context + Local State (No Redux/Zustand)

**Pattern:** Production data is managed via React Context + useState in `ProductionProvider`.

**Key Files:**
- [providers/PrivateContexts/ProductionProvider/index.tsx](providers/PrivateContexts/ProductionProvider/index.tsx) - Central state container with CRUD actions
- [contexts/ProductionContext/index.tsx](contexts/ProductionContext/index.tsx) - Context definition

**Important:** The app currently uses **sample data** (`app/Samples/production-sample.ts`) instead of API calls. All CRUD operations persist only in memory with a 500ms simulated delay (`await new Promise(resolve => setTimeout(resolve, 500))`). This is **not a live API integration**.

**Usage Pattern:**
```tsx
const { lotes, updateLote, addLote, isLoading } = useProduction();
```

### 2. Form Handling: React Hook Form + Zod

**Pattern:** All forms use React Hook Form with Zod validation schemas, following a consistent pattern across create/edit operations.

**Key Files:**
- [schemas/](schemas/) - All Zod validation schemas (e.g., `colaborador-schema.ts`, `tecido-schema.ts`)
- [components/Forms/](components/Forms/) - Individual form field components (colaboradores-form.tsx, fabric-form.tsx, etc.)
- [hooks/use-form-modal.ts](hooks/use-form-modal.ts) - Custom hook managing modal open/close/edit state

**Important Convention:** Form components use `useFormContext<T>()` to access the form instance (never pass form as prop). This enables nested form structure.

```tsx
// In a form component:
const { control } = useFormContext<ColaboradorFormValues>();
// Access via control, not direct prop
```

### 3. Modal + Form Pattern: `FormModal` wrapper

**Pattern:** Create/Edit dialogs are built with `FormModal` which wraps `BaseModal` + form submission logic.

**Key Files:**
- [components/Modal/base-modal.tsx](components/Modal/base-modal.tsx) - Dialog wrapper (Radix UI)
- [components/Modal/base-modal-form.tsx](components/Modal/base-modal-form.tsx) - Form modal handler

**Usage (see [app/(private)/lotes/page.tsx](app/(private)/lotes/page.tsx#L40-L60)):**
```tsx
const { isOpen, handleOpen, handleClose, onSubmit, editingItem } = useFormModal({ form, initialValues, onSave });

<FormModal open={isOpen} onClose={handleClose} onSubmit={onSubmit} title={editingItem ? 'Editar' : 'Novo'}>
  <Form {...form}>
    <ColaboradoresForm />
  </Form>
</FormModal>
```

### 4. Data Tables: TanStack React Table

**Pattern:** All data display uses `DataTable` component with TanStack React Table's headless UI.

**Key File:** [components/DataTable/index.tsx](components/DataTable/index.tsx)

**Props:**
- `columns: ColumnDef[]` - Column definitions (sorting, rendering, actions)
- `data: T[]` - Array of items
- `isLoading` - Shows skeleton while fetching
- `rowSelection / setRowSelection` - Row checkbox state
- `ordenacao / setOrdenacao` - Sorting state

**Mobile Fallback:** Card-based layouts in [components/MobileViewCards/](components/MobileViewCards/) (ColaboradorCard, FabricCard, etc.)

### 5. Type-Driven Development

**Core Types in [types/production.ts](types/production.ts):**
- `Colaborador` (employees) - funcao (cortador, costureira, expedicao, responsavel, auxiliar)
- `Fornecedor` (suppliers) - tipo (tecido, aviamento, servico)
- `Faccao` (contractors) - prazoMedio (days)
- `Tecido` (fabrics) - rendimento, fornecedorId
- `RoloTecido` (fabric rolls) - status (disponivel, reservado, utilizado)
- `LoteProducao` (production batches) - direcionamentos (routing), status
- `ProductionContextType` - Defines all context actions

**Convention:** Always use interface types from `types/production.ts`, don't create redundant types in component files.

---

## Key Workflows & Commands

### Development
```bash
npm run dev      # Start Next.js dev server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm lint         # Run ESLint
```

### Page Structure Pattern
- **Public Routes:** `app/(public)/login/` - Unauthenticated
- **Private Routes:** `app/(private)/` (dashboard, colaboradores, fornecedores, faccoes, tecidos, estoque, lotes, conferencia, producao)
- **Route Groups:** `(private)` and `(public)` wrap shared layouts

---

## Critical Patterns & Conventions

### 1. Component Organization
- **UI Components:** `components/ui/` - Reusable Radix UI primitives (button, input, form, dialog, select, etc.)
- **Feature Components:** Named folders with `index.tsx` (AppSidebar, DataTable, Forms, Modal)
- **Mobile Cards:** Separate card-based components for mobile view, not responsive tables

### 2. Form Validation
```tsx
const schema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  funcao: z.enum(['cortador', 'costureira interna', ...]),
  status: z.enum(["ativo", "inativo", '']),
});
```
**Convention:** Always include empty string `''` in enum definitions for optional/unset states.

### 3. Date Handling in Forms
Lotes page shows **type coercion pattern:**
```tsx
// Form stores dataCreacao as string (ISO format)
// Before saving, convert back to Date for the interface:
dataCreacao: new Date(values.dataCreacao),
direcionamentos: values.direcionamentos?.map(d => ({
  ...d,
  dataSaida: new Date(d.dataSaida),
})) || []
```

### 4. Sidebar Navigation
- [components/AppSidebar/index.tsx](components/AppSidebar/index.tsx) - Hardcoded nav items (Dashboard, Colaboradores, Fornecedores, Facções, Tecidos, Estoque, Lotes, Produção, Conferência)
- Uses Lucide React icons
- Mobile-responsive via `use-mobile.ts` hook

### 5. Theme Switching
- [providers/ThemeProvider/](providers/ThemeProvider/) - next-themes integration
- Dark/Light/System modes supported
- Applied globally via CSS classes

### 6. Error Handling Components
- [components/ErrorManagementComponent/](components/ErrorManagementComponent/) - WarnningRemoveItem, AnyData handlers
- Use Sonner toasts for user feedback (no `console.log` for user messages)

---

## Common Tasks

### Adding a New Entity (e.g., new resource like "Pedidos")

1. **Add Type:** Add interface to [types/production.ts](types/production.ts)
2. **Add Schema:** Create `schemas/pedido-schema.ts` with Zod validation
3. **Add Form:** Create `components/Forms/pedido-form.tsx` using `useFormContext`
4. **Add Context Actions:** Update `ProductionProvider` with state + CRUD actions
5. **Add Page:** Create `app/(private)/pedidos/page.tsx` (copy pattern from lotes)
6. **Add Table:** Create `components/DataTable/Tables/Pedido/table.tsx` with ColumnDef
7. **Add Mobile Card:** Create `components/MobileViewCards/PedidoCard/index.tsx`
8. **Update Sidebar:** Add route to [components/AppSidebar/index.tsx](components/AppSidebar/index.tsx)

### Modifying a Form
1. Update the Zod schema in `schemas/`
2. Update the form component in `components/Forms/`
3. Ensure `useFormContext<T>()` type matches schema
4. Update the page that uses the form (handle new fields in `onSave`)

### Adding a Table Column
1. Define `ColumnDef` in the table file
2. Add `header`, `accessorKey`, `cell` renderer
3. For actions (edit/delete), use `Header` with custom buttons
4. Pass column to `DataTable` props

---

## File Path Aliases
- `@/` → `fitpro/` (configured in tsconfig.json)
- Always use `@/` imports (never relative `../`)

---

## Important Notes

- **No Real API:** Uses mock data with 500ms delays. When API integration happens, replace `setTimeout` calls in `ProductionProvider` with actual fetch/axios calls.
- **Portuguese UI:** Labels, placeholders, and validation messages are in Portuguese (pt-BR).
- **No Tests:** No test files currently present; if adding tests, follow Next.js conventions.
- **Language:** 'pt-BR' configured in [app/layout.tsx](app/layout.tsx)
- **Production Flag:** Check `app/(private)/layout.tsx` for auth wrappers (likely UserProvider).

---

## Quick Reference: File Structure
```
components/
├── Forms/              # Form fields (use useFormContext)
├── DataTable/          # TanStack table wrapper + Tables subdirs
├── MobileViewCards/    # Mobile card components per entity
├── Modal/              # Dialog wrappers (BaseModal, FormModal)
├── AppSidebar/         # Navigation
├── ui/                 # Radix UI primitives
└── ...
schemas/               # Zod validation schemas
types/                 # TypeScript interfaces
hooks/                 # Custom hooks (use-form-modal, use-mobile)
providers/             # Context providers (Production, Sidebar, User)
contexts/              # Context definitions
```
