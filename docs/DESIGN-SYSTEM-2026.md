# 🎨 DESIGN-SYSTEM-2026.md

## Design Guidelines for Architect Studio

**Purpose:** This document guides all UI/UX implementation decisions.  
**Read this before:** Any styling, layout, or component work.  
**Based on:** 2025-2026 UI/UX research + Current system audit.

---

# ⚠️ GLOBAL TASKS - DO THESE FIRST

Before working on any specific page, complete these global improvements:

## Task 1: Unify Colors (Use CSS Variables Only)

Currently colors are mixed (CSS vars + hardcoded). Fix this:

**File:** `src/app/globals.css`

Keep existing CSS variables, they are correct:
- `--primary: 210 100% 60%` (#3B82F6 blue) ✅
- `--background`, `--foreground`, etc. ✅

**Action:** Search all components for hardcoded colors and replace with CSS variables:
```tsx
// ❌ Wrong - hardcoded
className="bg-blue-500 text-slate-800"

// ✅ Correct - use CSS variables
className="bg-primary text-foreground"
```

## Task 2: Fix Dark Mode Toggle

Dark mode is defined but not working with settings page.

**Files to check:**
- `src/app/(protected)/settings/page.tsx` - has toggle
- `src/app/globals.css` - has .dark class defined
- `src/app/layout.tsx` - needs to apply dark class

**Action:** Connect the settings toggle to actually apply/remove the `dark` class on `<html>` element. Use localStorage to persist preference.

## Task 3: Add MetricsBar Component

**Create:** `src/components/ui/metrics-bar.tsx`

```tsx
interface Metric {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'default' | 'success' | 'warning' | 'error';
}

interface MetricsBarProps {
  metrics: Metric[];
}

export function MetricsBar({ metrics }: MetricsBarProps) {
  // Grid of 2-4 metric cards showing key stats
  // Used at top of detail pages (project, client, etc.)
}
```

## Task 4: Add CollapsibleSection Component

**Create:** `src/components/ui/collapsible-section.tsx`

```tsx
interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps) {
  // Expandable section with chevron icon
  // Used for "Details" sections at bottom of pages
}
```

## Task 5: Enhance Card Component with Sizes

**Update:** `src/components/ui/card.tsx`

Add size variants for Bento Grid layout:

```tsx
const cardSizes = {
  sm: 'min-h-[100px]',   // Small metrics
  md: 'min-h-[180px]',   // Default
  lg: 'min-h-[200px]',   // Secondary content
  xl: 'min-h-[400px]',   // Primary content (rooms, tasks)
} as const;

interface CardProps {
  size?: keyof typeof cardSizes;
  // ... existing props
}
```

## Task 6: Add AlertBanner Component

**Create:** `src/components/ui/alert-banner.tsx`

```tsx
interface AlertBannerProps {
  type: 'info' | 'warning' | 'error' | 'success';
  children: ReactNode;
  dismissible?: boolean;
}

export function AlertBanner({ type, children, dismissible }: AlertBannerProps) {
  // Full-width banner for urgent notifications
  // Shows below page header, above content
}
```

---

# ✅ WHAT EXISTS (DO NOT CHANGE)

## Sidebar - KEEP AS IS
- Location: `src/components/layout/sidebar.tsx`
- 6 main items with sub-menus
- Colors: slate for text, blue for active
- Logo: Blue square + "Architect Studio"

## Header - KEEP AS IS  
- Location: `src/components/layout/header.tsx`
- Search (left), Notifications + Profile (right)
- White background, slate-200 border

## Layout Structure - KEEP AS IS
- Sidebar: fixed right, w-64 (256px)
- Header: fixed top, h-16 (64px)  
- Content: mr-64 pt-16, bg-slate-50

## RTL - KEEP AS IS
- Correctly configured in layout.tsx
- Sidebar on right ✅
- All offsets correct ✅

## Font - KEEP AS IS
- Assistant (Hebrew Google Font)
- Already configured in Tailwind

---

---

# 📐 LAYOUT PRINCIPLES

## Grid System: 8px Base

All spacing, padding, and margins must be multiples of 8:

```typescript
const SPACING = {
  xs: 4,    // Exception: very tight spaces
  sm: 8,    // Small gaps
  md: 16,   // Default padding
  lg: 24,   // Section gaps
  xl: 32,   // Large sections
  '2xl': 48, // Page sections
  '3xl': 64, // Major separations
} as const;
```

**Tailwind classes to use:**
- `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)
- `gap-2`, `gap-4`, `gap-6`, `gap-8`
- `space-y-4`, `space-y-6`

---

## Bento Grid Layout

The primary layout pattern for dashboards and detail pages.

### What is Bento Grid?
Cards of different sizes arranged like a Japanese bento box. NOT all cards same size.

### Implementation:

```tsx
// Bento Grid Container
<div className="grid grid-cols-12 gap-4 md:gap-6">
  {/* XL Card: 2x2 - spans 6 columns, tall */}
  <div className="col-span-12 md:col-span-6 row-span-2">
    <Card size="xl" />
  </div>
  
  {/* L Card: 2x1 - spans 6 columns */}
  <div className="col-span-12 md:col-span-6">
    <Card size="lg" />
  </div>
  
  {/* M Card: 1x1 - spans 3 columns */}
  <div className="col-span-6 md:col-span-3">
    <Card size="md" />
  </div>
  
  {/* S Card: small - spans 3 columns */}
  <div className="col-span-6 md:col-span-3">
    <Card size="sm" />
  </div>
</div>
```

### Card Sizes:

| Size | Grid Span | Height | Use For |
|------|-----------|--------|---------|
| `xl` | col-span-6, row-span-2 | ~400px | Primary content (rooms, tasks) |
| `lg` | col-span-6 | ~200px | Secondary content (products, timeline) |
| `md` | col-span-3 | ~180px | Stats, quick info (budget, dates) |
| `sm` | col-span-3 | ~100px | Single metrics |

---

# 📊 PAGE STRUCTURE

## Information Hierarchy (Top to Bottom)

Every detail page follows this order:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PAGE HEADER                                              │
│    - Title + Status badges                                  │
│    - Primary action buttons (right side in RTL)             │
│    - Tabs/Navigation                                        │
├─────────────────────────────────────────────────────────────┤
│ 2. HERO SUMMARY (Metrics Bar)                               │
│    - 4-6 key metrics in horizontal cards                    │
│    - Shows: progress, budget, time left, completion %       │
│    - Always visible, no scroll needed                       │
├─────────────────────────────────────────────────────────────┤
│ 3. ALERTS/ACTIONS (if any)                                  │
│    - Urgent items, warnings, required actions               │
│    - Red/Orange background for attention                    │
├─────────────────────────────────────────────────────────────┤
│ 4. PRIMARY CONTENT (Bento Grid)                             │
│    - Most important/frequently used sections                │
│    - Larger cards (XL, L)                                   │
│    - Example: Rooms, Tasks, Products                        │
├─────────────────────────────────────────────────────────────┤
│ 5. SECONDARY CONTENT                                        │
│    - Less frequently accessed info                          │
│    - Medium cards (M)                                       │
│    - Example: Timeline, Budget breakdown                    │
├─────────────────────────────────────────────────────────────┤
│ 6. DETAILS (Collapsible)                                    │
│    - Rarely viewed information                              │
│    - Collapsed by default                                   │
│    - Example: Project details, Team, History                │
└─────────────────────────────────────────────────────────────┘
```

## Implementation:

```tsx
// Page Structure Component
export function ProjectDetailPage() {
  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader 
        title="פרויקט קאליש"
        badges={[{ label: 'תכנון דירה', color: 'blue' }]}
        actions={<Button>עריכה</Button>}
      />
      
      {/* 2. Hero Summary */}
      <MetricsBar metrics={[
        { label: 'ימים נשארו', value: 14, icon: Clock },
        { label: 'תקציב', value: '67%', icon: DollarSign },
        { label: 'משימות', value: '8/12', icon: CheckSquare },
        { label: 'מוצרים', value: '45%', icon: Package },
      ]} />
      
      {/* 3. Alerts (conditional) */}
      {hasUrgentTasks && (
        <AlertBanner type="warning">
          3 משימות דחופות דורשות טיפול
        </AlertBanner>
      )}
      
      {/* 4. Primary Content - Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6 row-span-2">
          <RoomsCard />
        </div>
        <div className="col-span-12 lg:col-span-6 row-span-2">
          <TasksCard />
        </div>
      </div>
      
      {/* 5. Secondary Content */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6">
          <ProductsCard />
        </div>
        <div className="col-span-6 md:col-span-3">
          <DatesCard />
        </div>
        <div className="col-span-6 md:col-span-3">
          <BudgetCard />
        </div>
      </div>
      
      {/* 6. Collapsible Details */}
      <CollapsibleSection title="פרטי פרויקט" defaultOpen={false}>
        <ProjectDetails />
      </CollapsibleSection>
      <CollapsibleSection title="צוות" defaultOpen={false}>
        <TeamDetails />
      </CollapsibleSection>
    </div>
  );
}
```

---

# 🎨 COLORS

## Current Color System (USE THESE)

The system already has good colors defined. Use CSS variables, not hardcoded values.

### CSS Variables (in globals.css):

```css
/* Already defined - use these! */
--primary: 210 100% 60%        /* #3B82F6 - Blue */
--background: 0 0% 100%        /* #FFFFFF - White */
--foreground: 222.2 84% 4.9%   /* #0F172A - Near black */
--card: 0 0% 100%              /* #FFFFFF - White */
--secondary: 210 40% 96.1%     /* #F1F5F9 - Light gray */
--muted: 210 40% 96.1%         /* #F1F5F9 */
--muted-foreground: 215.4 16.3% 46.9%  /* #64748B - Gray */
--destructive: 0 84.2% 60.2%   /* #EF4444 - Red */
--border: 214.3 31.8% 91.4%    /* #E2E8F0 */
--success: 142 76% 36%         /* #16A34A - Green */
--warning: 38 92% 50%          /* #F59E0B - Amber */
```

### Tailwind Usage:

```tsx
// Primary actions
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground" />

// Cards
<Card className="bg-card border-border" />

// Page background  
<main className="bg-background" />

// Text
<p className="text-foreground">Main text</p>
<span className="text-muted-foreground">Secondary text</span>

// Status badges
<Badge variant="success">הושלם</Badge>  // Uses --success
<Badge variant="warning">בהמתנה</Badge> // Uses --warning
<Badge variant="destructive">באיחור</Badge> // Uses --destructive
```

### Status Colors Reference:

| Status | Variable | Hex | Use For |
|--------|----------|-----|---------|
| Active/Primary | `--primary` | #3B82F6 | Active states, links, primary buttons |
| Success | `--success` | #16A34A | Completed, approved, on track |
| Warning | `--warning` | #F59E0B | Pending, attention needed |
| Error | `--destructive` | #EF4444 | Overdue, rejected, errors |
| Info | `--primary` | #3B82F6 | Information, in progress |

---

# ✏️ TYPOGRAPHY

## Font: Assistant (Hebrew)

Already configured in `tailwind.config.ts`. Do not change.

## Text Scale (Use Tailwind Classes):

```tsx
// Page titles
<h1 className="text-2xl font-bold text-foreground">כותרת דף</h1>

// Section titles  
<h2 className="text-xl font-semibold text-foreground">כותרת סקשן</h2>

// Card titles
<h3 className="text-lg font-semibold text-foreground">כותרת כרטיס</h3>

// Subsection titles
<h4 className="text-base font-medium text-foreground">תת-כותרת</h4>

// Body text (default)
<p className="text-sm text-foreground">טקסט רגיל</p>

// Secondary/muted text
<span className="text-sm text-muted-foreground">טקסט משני</span>

// Small text (labels, captions)
<span className="text-xs text-muted-foreground">תווית קטנה</span>
```

## Typography Rules:

1. **Hebrew text:** Always use `text-foreground` or `text-muted-foreground`
2. **Numbers:** Add `ltr-nums` class to prevent RTL reversal
3. **Prices:** Format as `₪1,234` with `ltr-nums`
4. **Dates:** Format as `15.01.2026` with `ltr-nums`

---

# 🧱 COMPONENTS

## Card Component

```tsx
interface CardProps {
  title?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

export function Card({ title, icon: Icon, action, size = 'md', children }: CardProps) {
  const heights = {
    sm: 'min-h-[100px]',
    md: 'min-h-[180px]',
    lg: 'min-h-[200px]',
    xl: 'min-h-[400px]',
  };
  
  return (
    <div className={cn(
      "bg-white rounded-xl border border-zinc-200 p-4 md:p-6",
      "hover:border-zinc-300 transition-colors",
      heights[size]
    )}>
      {/* Card Header */}
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-zinc-400" />}
            {title && <h3 className="text-lg font-semibold text-zinc-800">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      
      {/* Card Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
```

## Metrics Bar Component

```tsx
interface Metric {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'default' | 'success' | 'warning' | 'error';
}

export function MetricsBar({ metrics }: { metrics: Metric[] }) {
  const colorClasses = {
    default: 'bg-zinc-100 text-zinc-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div 
          key={metric.label}
          className={cn(
            "rounded-xl p-4 text-center",
            colorClasses[metric.color || 'default']
          )}
        >
          <metric.icon className="w-6 h-6 mx-auto mb-2 opacity-70" />
          <div className="text-2xl font-bold">{metric.value}</div>
          <div className="text-sm opacity-80">{metric.label}</div>
        </div>
      ))}
    </div>
  );
}
```

## Collapsible Section Component

```tsx
export function CollapsibleSection({ 
  title, 
  defaultOpen = false,
  children 
}: { 
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors"
      >
        <span className="font-medium text-zinc-700">{title}</span>
        <ChevronDown className={cn(
          "w-5 h-5 text-zinc-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
```

## Badge Component

```tsx
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

export function Badge({ 
  children, 
  variant = 'default',
  dot = false,
}: { 
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      badgeVariants[variant]
    )}>
      {dot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          variant === 'success' && "bg-green-500",
          variant === 'warning' && "bg-amber-500",
          variant === 'error' && "bg-red-500",
          variant === 'info' && "bg-blue-500",
          variant === 'default' && "bg-zinc-500",
        )} />
      )}
      {children}
    </span>
  );
}
```

---

# 📱 RESPONSIVE DESIGN

## Breakpoints

```typescript
const BREAKPOINTS = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
} as const;
```

## Mobile-First Approach

Always start with mobile styles, then add larger screen overrides:

```tsx
// ❌ Wrong - Desktop first
<div className="grid-cols-4 md:grid-cols-2 sm:grid-cols-1">

// ✅ Correct - Mobile first
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```

## Responsive Patterns:

```tsx
// Sidebar behavior
<aside className={cn(
  // Mobile: hidden, shows as overlay
  "fixed inset-y-0 right-0 z-50 w-64 transform transition-transform",
  "lg:relative lg:translate-x-0", // Desktop: always visible
  isOpen ? "translate-x-0" : "translate-x-full"
)}>

// Card grid
<div className={cn(
  "grid gap-4",
  "grid-cols-1",      // Mobile: 1 column
  "md:grid-cols-2",   // Tablet: 2 columns
  "lg:grid-cols-12",  // Desktop: 12-column grid
)}>

// Text sizes
<h1 className="text-xl md:text-2xl lg:text-3xl">
```

---

# 🔄 RTL & HEBREW

## Direction Setup

```tsx
// In layout.tsx or _app.tsx
<html lang="he" dir="rtl">
  <body className="font-sans">
```

## RTL-Aware Classes

Use logical properties instead of physical:

```tsx
// ❌ Wrong - Physical properties
<div className="mr-4 ml-2 text-left pl-4">

// ✅ Correct - Logical properties (RTL-aware)
<div className="me-4 ms-2 text-start ps-4">
```

## Mapping:

| Physical (Don't use) | Logical (Use this) |
|---------------------|-------------------|
| `ml-*` | `ms-*` (margin-start) |
| `mr-*` | `me-*` (margin-end) |
| `pl-*` | `ps-*` (padding-start) |
| `pr-*` | `pe-*` (padding-end) |
| `left-*` | `start-*` |
| `right-*` | `end-*` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |

## Icons in RTL

Some icons need to flip:

```tsx
// Icons that should flip in RTL
const RTL_FLIP_ICONS = ['ChevronLeft', 'ChevronRight', 'ArrowLeft', 'ArrowRight'];

<ChevronRight className="rtl:rotate-180" />
```

---

# ✨ UI STATES

## Every interactive element needs these states:

### 1. Empty State

```tsx
export function EmptyState({ 
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="text-lg font-medium text-zinc-900 mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// Usage
<EmptyState
  icon={FolderOpen}
  title="אין חדרים"
  description="הוסף חדרים לפרויקט כדי להתחיל לנהל מוצרים ועיצוב"
  action={<Button>+ הוסף חדר</Button>}
/>
```

### 2. Loading State

```tsx
export function CardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const heights = { sm: 'h-24', md: 'h-44', lg: 'h-64' };
  
  return (
    <div className={cn(
      "bg-zinc-100 rounded-xl animate-pulse",
      heights[size]
    )}>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-zinc-200 rounded w-1/3" />
        <div className="h-3 bg-zinc-200 rounded w-2/3" />
        <div className="h-3 bg-zinc-200 rounded w-1/2" />
      </div>
    </div>
  );
}
```

### 3. Error State

```tsx
export function ErrorState({ 
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
      <p className="text-sm text-zinc-600 mb-3">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          נסה שוב
        </Button>
      )}
    </div>
  );
}
```

---

# 🎬 ANIMATIONS

## Transition Defaults

```typescript
const TRANSITIONS = {
  fast: 'transition-all duration-150 ease-out',
  default: 'transition-all duration-200 ease-out',
  slow: 'transition-all duration-300 ease-out',
} as const;
```

## Common Animations

```tsx
// Hover lift effect
<div className="hover:-translate-y-1 hover:shadow-md transition-all duration-200">

// Fade in
<div className="animate-in fade-in duration-200">

// Slide in from right (RTL: from left)
<div className="animate-in slide-in-from-end duration-300">

// Scale on click
<button className="active:scale-95 transition-transform">
```

## When to Animate:

| ✅ Do Animate | ❌ Don't Animate |
|--------------|-----------------|
| Hover states | Page loads |
| Modal open/close | Every scroll |
| Dropdown open | List item renders |
| Success feedback | Form typing |
| Tab changes | Sidebar always |

---

# ♿ ACCESSIBILITY

## Required for all components:

```tsx
// 1. Keyboard navigation
<button onKeyDown={(e) => e.key === 'Enter' && handleClick()}>

// 2. Focus visible
<button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">

// 3. ARIA labels
<button aria-label="סגור חלון">
  <X className="w-5 h-5" />
</button>

// 4. Color contrast (minimum 4.5:1)
// Text on white: use zinc-700 or darker
// Text on colored bg: ensure contrast

// 5. Screen reader text
<span className="sr-only">מחק פריט</span>
```

---

# 📋 CHECKLIST

Before submitting any UI work, verify:

```
□ Uses 8px spacing system
□ Cards follow Bento Grid sizes
□ Information hierarchy correct (important on top)
□ Uses correct color palette
□ Typography matches scale
□ RTL-aware (logical properties)
□ Has empty state
□ Has loading state
□ Has error state
□ Mobile responsive
□ Keyboard accessible
□ Hebrew text correct
□ No hardcoded colors (use Tailwind classes)
□ Animations are subtle, not distracting
```

---

# 📁 FILE NAMING

When creating new components:

```
src/components/
├── ui/                    # Base UI components
│   ├── card.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   └── ...
├── layout/                # Layout components
│   ├── page-header.tsx
│   ├── metrics-bar.tsx
│   └── collapsible-section.tsx
├── features/              # Feature-specific components
│   ├── projects/
│   │   ├── project-card.tsx
│   │   └── project-metrics.tsx
│   ├── rooms/
│   └── tasks/
└── shared/                # Shared/common components
    ├── empty-state.tsx
    ├── error-state.tsx
    └── loading-skeleton.tsx
```

---

**END OF DESIGN SYSTEM**

When in doubt, refer back to this document.
Consistency is more important than creativity.