# מסמך אפיון מערכת ניהול סטודיו - חלק 1
## גרסה 2.0 | ינואר 2026

---

# א. סקירה כללית

## מהות המערכת

מערכת SaaS לניהול משרדי אדריכלות ועיצוב פנים. מאפשרת ניהול מחזור חיים מלא של פרויקט - מהצעת מחיר ראשונה עד מסירה - הכל במקום אחד בלי מעבר בין טאבים.

## קהל יעד

- מעצב/ת עצמאי/ת (1 איש) - צריך פשטות, מעקב לקוחות, FF&E
- משרד קטן (2-5) - ניהול פרויקטים, רכש, תשלומים
- משרד אדריכלות (2-5) - רישוי, תיאום, מסמכים
- סטודיו משולב (5-20) - כל הנ"ל + ניהול צוות
- משרד גדול (20-50+) - Multi-project, דוחות, אינטגרציות

## עקרונות מנחים

**עקרונות UX:**
- Zero Navigation: 90% מהעבודה בתוך פרויקט אחד, הכל נגיש משם
- Progressive Disclosure: מציגים רק מה שרלוונטי, פאנלים נפתחים לפי הקשר
- Contextual Actions: פעולות במקום הנכון, לא בתפריטים מרוחקים
- Single Source of Truth: כל מידע במקום אחד, אין כפילויות
- Inline Everything: לחיצה על שדה = עריכה במקום

**עקרונות טכניים:**
- Multi-Tenant: כל משרד = tenant מבודד
- גנריות מקסימלית: כל מה שניתן להגדרה - configurable
- Mobile-First: רספונסיבי מלא
- Offline-Ready: עבודה בשטח בלי אינטרנט
- Real-time Sync: שינויים מיידיים לכל המשתמשים

---

# ב. פילוסופיית UX - Zero Navigation

## העיקרון המרכזי

אדריכל או מעצב עובד 90% מהזמן בפרויקט אחד. כל מה שקשור לפרויקט צריך להיות בתוך הפרויקט - בלי לעבור דפים.

**במקום:** Sidebar > Projects > Project X > Tab: Tasks > Create Task (5 קליקים, 3 טעינות)

**צריך:** Project X > לחיצה על "+" > הוספת משימה (קליק אחד, ללא טעינה)

## מבנה דף הפרויקט - Project Hub

כל פרויקט הוא Hub מרכזי. בראש הדף: Quick Info Bar עם פרטי לקוח, מיקום, שטח, תקציב, תאריכים, שלב נוכחי.

מתחת: כרטיסי סיכום (Cards) - משימות, חדרים, תשלומים, מסמכים, הצעות, שינויים, זמן, ליקויים.

**Expandable Panels:**
- מצב ברירת מחדל: כרטיסים קטנים עם סיכום
- לחיצה על כרטיס: פאנל מתרחב מתחתיו עם תוכן מלא
- לחיצה על כרטיס אחר: הנוכחי נסגר, החדש נפתח
- Shift+Click: פתיחת כמה פאנלים במקביל

## Navigation - 5 פריטים בלבד בסיידבר

1. **לוח בקרה** - Dashboard אישי
2. **פרויקטים** - רשימה + סינון (90% מהעבודה מתחילה כאן)
3. **יומן** - לוח שנה + פגישות (תצוגה צולבת)
4. **אנשי קשר** - לקוחות + ספקים + בעלי מקצוע
5. **ספרייה** - מוצרים + לוחות השראה (cross-project)
6. **הגדרות** - רק Admin צריך

---

# ג. ארכיטקטורת Multi-Tenant

## מבנה היררכי

Platform (המערכת) מכיל Tenants (משרדים). כל Tenant מכיל: Users, Settings, Projects (עם כל הנתונים), Clients, Suppliers, Products, MoodBoards.

## ישות Tenant

```typescript
interface Tenant {
  id: string;
  name: string;
  slug: string;
  
  // ברנדינג
  logo?: string;
  primaryColor?: string;
  
  // פרטי קשר
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  
  // הגדרות עסקיות
  businessType: 'interior_design' | 'architecture' | 'both';
  currency: string;
  vatRate: number;
  fiscalYearStart: number;
  
  // הגדרות תמחור
  feeSettings: TenantFeeSettings;
  
  // הגדרות מערכת
  language: string;
  timezone: string;
  dateFormat: string;
  
  // פיצ'רים
  features: TenantFeatures;
  
  // מנוי
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  planExpiresAt?: Date;
  limits: TenantLimits;
  
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface TenantFeeSettings {
  defaultBillingType: 'fixed' | 'hourly' | 'percentage' | 'cost_plus' | 'hybrid';
  defaultHourlyRate?: number;
  defaultMarkupPercent: number;
  markupType: 'cost_plus' | 'discount_off_retail';
  disbursementPercent: number;
  defaultRetainerPercent: number;
}

interface TenantFeatures {
  timeTracking: boolean;
  permitTracking: boolean;
  clientPortal: boolean;
  advancedReporting: boolean;
  multipleLocations: boolean;
  customFields: boolean;
  apiAccess: boolean;
}

interface TenantLimits {
  maxUsers: number;
  maxProjects: number;
  maxStorageGB: number;
  maxClientsPortal: number;
}
```

## סוגי הרשאות (Roles)

**Owner (בעלים):**
- משתמשים: הוספה, עריכה, הסרה, שינוי הרשאות
- הגדרות משרד: גישה מלאה כולל תמחור
- פיננסי: הכל - כולל הוצאות משרד ודוחות מלאים
- פרויקטים: כל הפרויקטים
- מחיקה: מורשה

**Manager (מנהל):**
- משתמשים: צפייה + הקצאה לפרויקטים
- הגדרות משרד: צפייה בלבד
- פיננסי: פרויקטים בלבד
- פרויקטים: כל הפרויקטים
- מחיקה: לא

**Member (חבר צוות):**
- משתמשים: צפייה בעצמי
- הגדרות: לא
- פיננסי: לא (אלא אם הוגדר)
- פרויקטים: רק מוקצים
- מחיקה: לא

## ישות User

```typescript
interface User {
  id: string;
  tenantId: string;
  
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  title?: string;
  
  role: 'owner' | 'manager' | 'member';
  permissions: UserPermissions;
  
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface UserPermissions {
  canViewFinancials: boolean;
  canEditFinancials: boolean;
  canManageUsers: boolean;
  canDeleteRecords: boolean;
  canAccessAllProjects: boolean;
  canManageSettings: boolean;
}
```

---

# ד. זרימת עבודה מאוחדת

## מחזור חיים של פרויקט

**שלב 1 - Lead:** לקוח פוטנציאלי נכנס למערכת, אופציונלי פגישת ייעוץ.

**שלב 2 - Proposal:** הצעת מחיר, יכולות להיות כמה גרסאות.

**שלב 3 - Contract:** אישור הצעה יוצר חוזה, חתימה הופכת לפרויקט פעיל.

**שלב 4 - Project Active:** ייעוץ > קונספט > תכנון > רכש > ביצוע > מסירה. במקביל: משימות, מסמכים, תשלומים, FF&E, תקשורת.

**שלב 5 - Changes:** בקשות שינוי מתועדות ומאושרות.

**שלב 6 - Snag List:** ליקויים לתיקון לפני מסירה.

**שלב 7 - Handover:** מסירה סופית.

**שלב 8 - Archive:** פרויקט סגור נשמר להיסטוריה.

## זרימת נתונים Lead > Project

Lead נוצר כ-Client עם status='lead'. הצעת מחיר יכולה להיווצר גם בלי פרויקט קיים (projectId אופציונלי). אישור הצעה > יצירת חוזה > יצירת פרויקט. ההצעה והחוזה מקושרים לפרויקט, הלקוח הופך ל-active.
# מסמך אפיון מערכת ניהול סטודיו - חלק 2
## ישויות עסקיות

---

# ה. ישויות עסקיות

## 1. Project (פרויקט) - הישות המרכזית

```typescript
interface Project {
  id: string;
  tenantId: string;
  
  // פרטים בסיסיים
  name: string;
  description?: string;
  code?: string;                 // קוד פנימי PRJ-001
  
  // קשרים
  clientId: string;
  assignedUserIds: string[];
  generalContractorId?: string;
  
  // סיווג (גנרי - מוגדר ב-ConfigurableEntity)
  typeId?: string;
  statusId: string;
  phaseId?: string;
  priority: 'low' | 'medium' | 'high';
  isVIP: boolean;
  tags?: string[];
  
  // מיקום
  address?: string;
  city?: string;
  area?: number;                 // שטח במ"ר
  floors?: number;
  
  // תקציב ותמחור
  budget?: number;
  currency: string;
  billingType: 'fixed' | 'hourly' | 'percentage' | 'cost_plus' | 'hybrid';
  fixedFee?: number;
  hourlyRate?: number;
  estimatedHours?: number;
  percentageOfBudget?: number;
  markupPercent?: number;
  
  // היקף עבודה
  scope?: string;
  deliverables?: string[];
  revisionsIncluded: number;
  
  // רישוי (לאדריכלות)
  requiresPermit: boolean;
  permitStatus?: 'not_required' | 'preparing' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'appealed';
  permitNumber?: string;
  permitSubmittedAt?: Date;
  permitApprovedAt?: Date;
  permitNotes?: string;
  
  // תאריכים
  startDate?: Date;
  expectedEndDate?: Date;
  actualEndDate?: Date;
  constructionStartDate?: Date;
  constructionEndDate?: Date;
  installationDate?: Date;
  
  // מקור
  referralSource?: string;
  referredByClientId?: string;
  
  // קישורים למסמכים ראשיים
  proposalId?: string;
  contractId?: string;
  
  // מטא
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  archivedAt?: Date;
}
```

## 2. Client (לקוח)

```typescript
interface Client {
  id: string;
  tenantId: string;
  
  // פרטים
  name: string;
  type: 'individual' | 'company';
  
  // קשר
  email?: string;
  phone?: string;
  mobile?: string;
  preferredCommunication: 'email' | 'phone' | 'whatsapp';
  bestTimeToContact?: string;
  
  // כתובת
  address?: string;
  city?: string;
  
  // חברה
  companyNumber?: string;
  contactPerson?: string;
  
  // סטטוס
  status: 'lead' | 'active' | 'past' | 'inactive';
  leadSource?: string;
  leadScore?: number;
  
  // העדפות עיצוב
  stylePreferences?: string[];
  budgetRange?: string;
  
  // קשרים
  referredBy?: string;
  referredByClientId?: string;
  
  // תאריכים חשובים
  anniversaryDate?: Date;
  importantDates?: ImportantDate[];
  
  // הערכה
  satisfactionRating?: number;
  wouldRecommend?: boolean;
  testimonial?: string;
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface ImportantDate {
  date: Date;
  description: string;
  reminder: boolean;
}
```

## 3. Supplier (ספק)

```typescript
interface Supplier {
  id: string;
  tenantId: string;
  
  name: string;
  categoryId?: string;
  
  email?: string;
  phone?: string;
  website?: string;
  contactPerson?: string;
  
  address?: string;
  city?: string;
  companyNumber?: string;
  
  // תנאים מסחריים
  paymentTerms?: string;
  discountPercent?: number;
  creditDays?: number;
  minimumOrder?: number;
  
  // Trade Account
  hasTradeAccount: boolean;
  tradeAccountNumber?: string;
  tradeDiscountPercent?: number;
  
  rating?: number;
  reliabilityScore?: number;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

## 4. Professional (בעל מקצוע)

נפרד מספקים - קבלנים, חשמלאים, אינסטלטורים:

```typescript
interface Professional {
  id: string;
  tenantId: string;
  
  name: string;
  companyName?: string;
  tradeId: string;               // מקצוע (גנרי)
  
  phone: string;
  email?: string;
  
  licenseNumber?: string;
  insuranceExpiry?: Date;
  
  rating?: number;
  totalProjects: number;
  projectIds: string[];
  
  notes?: string;
  specialties?: string[];
  
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

## 5. Room (חדר/אזור)

```typescript
interface Room {
  id: string;
  tenantId: string;
  projectId: string;
  
  name: string;
  typeId?: string;
  area?: number;
  budget?: number;
  
  designStatus: 'not_started' | 'concept' | 'detailed' | 'approved' | 'in_progress' | 'completed';
  notes?: string;
  
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 6. Product (מוצר בספרייה)

```typescript
interface Product {
  id: string;
  tenantId: string;
  
  name: string;
  sku?: string;
  description?: string;
  categoryId?: string;
  
  supplierId?: string;
  supplierSku?: string;
  
  costPrice?: number;
  retailPrice?: number;
  currency: string;
  
  width?: number;
  height?: number;
  depth?: number;
  unit: 'cm' | 'in' | 'mm';
  
  leadTimeDays?: number;
  
  imageUrl?: string;
  images?: string[];
  productUrl?: string;
  specSheetUrl?: string;
  
  tags?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

## 7. RoomProduct (מוצר בחדר)

```typescript
interface RoomProduct {
  id: string;
  tenantId: string;
  projectId: string;
  roomId: string;
  productId: string;
  
  // כמות ומחירים
  quantity: number;
  costPrice: number;
  retailPrice?: number;
  clientPrice: number;
  markupPercent?: number;
  
  // אישור לקוח
  clientApprovalStatus: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  clientApprovedAt?: Date;
  clientFeedback?: string;
  
  // סטטוס רכש
  procurementStatus: 'not_ordered' | 'quoted' | 'ordered' | 'in_production' | 'shipped' | 'delivered' | 'installed' | 'issue';
  
  // פרטי הזמנה
  purchaseOrderId?: string;
  orderDate?: Date;
  vendorOrderNumber?: string;
  
  // מעקב משלוח
  estimatedLeadTime?: number;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  carrier?: string;
  
  // התקנה
  installationRequired: boolean;
  installedAt?: Date;
  installedBy?: string;
  
  // בעיות
  hasIssue: boolean;
  issueType?: 'damage' | 'wrong_item' | 'missing' | 'defect' | 'delay' | 'other';
  issueDescription?: string;
  issueResolvedAt?: Date;
  
  notes?: string;
  internalNotes?: string;
  
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 8. Task (משימה)

```typescript
interface Task {
  id: string;
  tenantId: string;
  projectId?: string;            // אופציונלי - משימה כללית
  
  title: string;
  description?: string;
  
  statusId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  categoryId?: string;
  
  assignedTo?: string;
  
  dueDate?: Date;
  dueTime?: string;
  startDate?: Date;
  completedAt?: Date;
  
  reminders?: TaskReminder[];
  
  linkedEntityType?: 'room' | 'product' | 'payment' | 'document' | 'change_order';
  linkedEntityId?: string;
  
  checklist?: ChecklistItem[];
  
  order: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface TaskReminder {
  type: 'email' | 'notification' | 'sms';
  beforeMinutes: number;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
}
```

## 9. Document (מסמך)

```typescript
interface Document {
  id: string;
  tenantId: string;
  projectId?: string;
  
  name: string;
  type: string;
  categoryId?: string;
  
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  
  version: number;
  parentId?: string;
  
  isSharedWithClient: boolean;
  clientCanDownload: boolean;
  
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 10. Meeting (פגישה)

```typescript
interface Meeting {
  id: string;
  tenantId: string;
  projectId?: string;
  clientId?: string;
  
  title: string;
  description?: string;
  location?: string;
  meetingType: 'site_visit' | 'client_meeting' | 'supplier' | 'internal' | 'presentation' | 'installation' | 'other';
  
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  
  attendeeUserIds: string[];
  externalAttendees?: string[];
  
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  
  notes?: string;
  followUpTasks?: string[];
  
  recurrence?: MeetingRecurrence;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface MeetingRecurrence {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  endDate?: Date;
  occurrences?: number;
}
```

## 11. MoodBoard (לוח השראה)

```typescript
interface MoodBoard {
  id: string;
  tenantId: string;
  projectId?: string;
  roomId?: string;
  
  name: string;
  description?: string;
  
  categoryId?: string;
  styleId?: string;
  tags?: string[];
  
  isGlobal: boolean;
  linkedProjectIds?: string[];
  
  coverImageUrl?: string;
  
  isSharedWithClient: boolean;
  clientApprovalStatus?: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  clientFeedback?: string;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

## 12. MoodBoardItem (פריט בלוח)

```typescript
interface MoodBoardItem {
  id: string;
  tenantId: string;
  moodBoardId: string;
  
  type: 'image' | 'product' | 'color' | 'material' | 'text' | 'link';
  
  imageUrl?: string;
  productId?: string;
  colorHex?: string;
  colorName?: string;
  materialName?: string;
  materialImageUrl?: string;
  text?: string;
  linkUrl?: string;
  linkTitle?: string;
  
  size: 'small' | 'medium' | 'large';
  caption?: string;
  
  order: number;
  createdAt: Date;
}
```

## 13. TimeEntry (רישום זמן) - אופציונלי

```typescript
interface TimeEntry {
  id: string;
  tenantId: string;
  projectId: string;
  userId: string;
  
  date: Date;
  hours: number;
  startTime?: string;
  endTime?: string;
  
  description?: string;
  categoryId?: string;
  
  isBillable: boolean;
  hourlyRate?: number;
  
  taskId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

## 14. CommunicationLog (יומן תקשורת)

```typescript
interface CommunicationLog {
  id: string;
  tenantId: string;
  
  entityType: 'client' | 'supplier' | 'professional';
  entityId: string;
  projectId?: string;
  
  type: 'email' | 'phone' | 'whatsapp' | 'meeting' | 'note' | 'sms';
  direction: 'incoming' | 'outgoing';
  subject?: string;
  content: string;
  
  attachments?: string[];
  
  date: Date;
  userId: string;
  createdAt: Date;
}
```

## 15. ActivityLog (יומן פעילות)

```typescript
interface ActivityLog {
  id: string;
  tenantId: string;
  
  userId: string;
  
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected' | 'sent' | 'viewed' | 'commented' | 'status_changed' | 'assigned';
  entityType: string;
  entityId: string;
  entityName?: string;
  
  changes?: Record<string, { old: any; new: any }>;
  description?: string;
  
  projectId?: string;
  clientId?: string;
  
  timestamp: Date;
  ipAddress?: string;
}
```
# מסמך אפיון מערכת ניהול סטודיו - חלק 3
## תמחור, תשלומים, FF&E ורכש

---

# ו. מערכת תמחור ותשלומים

## מודלי תמחור נתמכים

**Fixed Fee:** מחיר קבוע לכל הפרויקט - לפרויקטים קטנים-בינוניים.

**Hourly:** לפי שעות עבודה ($120-300/שעה) - לייעוץ ופרויקטים משתנים.

**Percentage:** אחוז מתקציב הפרויקט (10-30%) - לפרויקטים גדולים.

**Cost Plus:** עלות מוצרים + markup (20-45%) - לרכש + שירותי עיצוב.

**Hybrid:** שילוב של כמה מודלים - הנפוץ ביותר. לדוגמה: Fixed לעיצוב + Cost Plus לרכש + Hourly לשעות נוספות.

## Proposal (הצעת מחיר)

```typescript
interface Proposal {
  id: string;
  tenantId: string;
  
  // קשרים - projectId אופציונלי כי הצעה יכולה להיות לפני פרויקט
  projectId?: string;
  clientId: string;
  
  // מזהה
  proposalNumber: string;        // HM-2026-001
  title: string;
  
  // גרסאות
  version: number;
  parentId?: string;
  
  // תוכן
  introduction?: string;
  scope?: string;
  sections: ProposalSection[];
  items: ProposalItem[];
  exclusions?: string[];
  assumptions?: string[];
  terms?: string;
  
  // סכומים
  subtotal: number;
  discountAmount?: number;
  discountType?: 'percent' | 'fixed';
  discountReason?: string;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: string;
  
  // סטטוס
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired' | 'revised';
  
  // תוקף
  validUntil: Date;
  
  // מעקב
  sentAt?: Date;
  viewedAt?: Date;
  viewCount: number;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // חתימה דיגיטלית
  requiresSignature: boolean;
  signatureUrl?: string;
  signedAt?: Date;
  signedByName?: string;
  signedByEmail?: string;
  
  // גישה ציבורית (בלי התחברות)
  publicToken: string;
  publicUrl: string;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ProposalSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface ProposalItem {
  id: string;
  proposalId: string;
  
  type: 'service' | 'product' | 'expense';
  
  name: string;
  description?: string;
  
  quantity: number;
  unit?: string;
  unitPrice: number;
  total: number;
  
  productId?: string;
  imageUrl?: string;
  
  isOptional: boolean;
  isSelected: boolean;
  
  groupName?: string;
  order: number;
}
```

## Contract (חוזה)

```typescript
interface Contract {
  id: string;
  tenantId: string;
  projectId: string;
  clientId: string;
  
  contractNumber: string;
  title: string;
  
  templateId?: string;
  content: string;               // HTML מלא
  
  proposalId?: string;
  
  totalValue: number;
  currency: string;
  
  startDate: Date;
  endDate?: Date;
  
  status: 'draft' | 'sent' | 'pending_signature' | 'partially_signed' | 'signed' | 'cancelled' | 'terminated';
  
  signatures: ContractSignature[];
  
  documentUrl?: string;
  signedDocumentUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ContractSignature {
  id: string;
  party: 'designer' | 'client';
  name: string;
  email: string;
  title?: string;
  signedAt?: Date;
  signatureUrl?: string;
  ipAddress?: string;
}
```

## Retainer (מקדמה)

```typescript
interface Retainer {
  id: string;
  tenantId: string;
  clientId: string;
  projectId?: string;
  
  type: 'project_retainer' | 'general_retainer' | 'deposit' | 'trust_account';
  
  amount: number;
  currency: string;
  
  status: 'pending' | 'received' | 'partially_applied' | 'fully_applied' | 'refunded';
  
  receivedAt?: Date;
  paymentMethod?: string;
  referenceNumber?: string;
  
  amountApplied: number;
  amountRemaining: number;
  
  applications: RetainerApplication[];
  
  createdAt: Date;
  updatedAt: Date;
}

interface RetainerApplication {
  id: string;
  retainerId: string;
  invoiceId: string;
  paymentId?: string;
  
  amount: number;
  appliedAt: Date;
  appliedBy: string;
  notes?: string;
}
```

## Payment (תשלום פרויקט)

```typescript
interface Payment {
  id: string;
  tenantId: string;
  projectId: string;
  
  name: string;
  description?: string;
  
  amount: number;
  currency: string;
  
  // סוג - קריטי להבנת אופי התשלום
  paymentType: 'retainer' | 'milestone' | 'scheduled' | 'final' | 'change_order' | 'hourly' | 'expense';
  
  // פרטים לפי סוג
  milestonePhaseId?: string;
  milestoneDescription?: string;
  percentageOfBudget?: number;
  hoursWorked?: number;
  hourlyRate?: number;
  changeOrderId?: string;
  
  // תזמון
  dueDate?: Date;
  triggerType?: 'date' | 'phase' | 'event';
  triggerDescription?: string;
  
  // סטטוס
  status: 'scheduled' | 'pending' | 'invoiced' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  
  // תשלום בפועל
  paidAmount: number;
  paidDate?: Date;
  paymentMethod?: string;
  referenceNumber?: string;
  
  // חשבונית
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoiceUrl?: string;
  
  // תזכורות
  remindersSent: number;
  lastReminderAt?: Date;
  nextReminderAt?: Date;
  
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Expense (הוצאה)

```typescript
interface Expense {
  id: string;
  tenantId: string;
  projectId?: string;            // יכול להיות הוצאה משרדית
  
  description: string;
  amount: number;
  currency: string;
  date: Date;
  
  categoryId?: string;
  supplierId?: string;
  
  isBillable: boolean;
  markupPercent?: number;
  billedAmount?: number;
  
  receiptUrl?: string;
  invoiceNumber?: string;
  
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  approvedBy?: string;
  approvedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

---

# ז. FF&E ורכש

## תהליך FF&E

**שלב 1 - Specification:** בחירת מוצר והוספה לחדר.

**שלב 2 - Client Approval:** הלקוח מאשר/דוחה ב-Client Portal.

**שלב 3 - Procurement:** יצירת הזמנת רכש (PO).

**שלב 4 - Tracking:** מעקב Lead Times ומשלוחים.

**שלב 5 - Delivery:** קבלת סחורה ובדיקה.

**שלב 6 - Installation:** התקנה ובקרת איכות.

## PurchaseOrder (הזמנת רכש)

```typescript
interface PurchaseOrder {
  id: string;
  tenantId: string;
  projectId: string;
  supplierId: string;
  
  orderNumber: string;           // PO-2026-001
  vendorOrderNumber?: string;
  
  status: 'draft' | 'pending_approval' | 'sent' | 'confirmed' | 'in_production' | 'partial' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  
  orderDate: Date;
  expectedDelivery?: Date;
  actualDelivery?: Date;
  
  subtotal: number;
  discount?: number;
  shippingCost?: number;
  vatAmount: number;
  total: number;
  currency: string;
  
  paymentTerms?: string;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  
  notes?: string;
  internalNotes?: string;
  
  items: PurchaseOrderItem[];
  
  approvedBy?: string;
  approvedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  
  productId?: string;
  roomProductId?: string;
  roomId?: string;
  
  description: string;
  sku?: string;
  
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  deliveredQuantity: number;
  pendingQuantity: number;
  
  notes?: string;
  order: number;
}
```

## DeliveryTracking (מעקב משלוחים)

```typescript
interface DeliveryTracking {
  id: string;
  tenantId: string;
  
  purchaseOrderId?: string;
  purchaseOrderItemId?: string;
  roomProductId?: string;
  
  supplierId: string;
  vendorOrderNumber?: string;
  
  // תאריכים
  orderDate: Date;
  estimatedShipDate?: Date;
  actualShipDate?: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  
  // מעקב
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  
  // סטטוס מפורט
  status: 'ordered' | 'confirmed' | 'in_production' | 'ready_to_ship' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'issue';
  
  // Lead Time
  originalLeadTimeDays?: number;
  currentLeadTimeDays?: number;
  delayDays?: number;
  delayReason?: string;
  
  // בעיות
  hasIssue: boolean;
  issueType?: 'delay' | 'damage' | 'wrong_item' | 'partial' | 'lost' | 'other';
  issueDescription?: string;
  issueResolvedAt?: Date;
  
  // היסטוריה
  statusHistory: DeliveryStatusHistory[];
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DeliveryStatusHistory {
  status: string;
  date: Date;
  location?: string;
  note?: string;
}
```

## תצוגת FF&E Schedule

תצוגה מאוחדת של כל המוצרים בפרויקט. כוללת:
- סינון לפי חדר, סטטוס, ספק
- סיכומים כספיים
- סטטוס כל פריט (לאישור, הוזמן, במשלוח, נמסר, הותקן, בעיה)
- תאריכי אספקה צפויים
- יכולת ייצוא ל-Excel/PDF
# מסמך אפיון מערכת ניהול סטודיו - חלק 4
## Client Portal, ניהול שינויים, בקרת איכות

---

# ח. Client Portal

## מודל גישה

הלקוחות לא נרשמים למערכת. במקום: קישור ייחודי לכל פרויקט עם Token לאימות, ללא התחברות.

## ClientPortalSettings

```typescript
interface ClientPortalSettings {
  id: string;
  tenantId: string;
  projectId: string;
  
  // גישה
  isEnabled: boolean;
  token: string;
  publicUrl: string;
  expiresAt?: Date;
  
  // הרשאות צפייה
  canViewProgress: boolean;
  canViewMoodBoards: boolean;
  canViewProducts: boolean;
  canViewSchedule: boolean;
  canViewDocuments: boolean;
  canViewPayments: boolean;
  canViewBudget: boolean;
  
  // הרשאות פעולה
  canApproveProducts: boolean;
  canApproveMoodBoards: boolean;
  canApproveDesignOptions: boolean;
  canLeaveComments: boolean;
  canUploadFiles: boolean;
  canMakePayments: boolean;
  canRequestChanges: boolean;
  
  // תצוגת מחירים
  priceDisplay: 'hide' | 'show_retail' | 'show_client_price' | 'show_all';
  
  // הודעות
  notifyOnUpdate: boolean;
  notifyOnMessage: boolean;
  notifyOnApprovalNeeded: boolean;
  
  // ברנדינג
  customWelcomeMessage?: string;
  showDesignerLogo: boolean;
  
  // סטטיסטיקות
  lastAccessedAt?: Date;
  accessCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

## ClientApproval

```typescript
interface ClientApproval {
  id: string;
  tenantId: string;
  projectId: string;
  portalSettingsId: string;
  
  entityType: 'moodboard' | 'product' | 'design_option' | 'document' | 'proposal' | 'change_order';
  entityId: string;
  entityName: string;
  
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  comment?: string;
  
  clientName?: string;
  clientEmail?: string;
  
  requestedAt: Date;
  respondedAt?: Date;
  
  remindersSent: number;
  lastReminderAt?: Date;
  
  createdAt: Date;
}
```

## מה הלקוח רואה

**Dashboard:** ברכה אישית, שלב נוכחי + Progress Bar, פריטים הדורשים תשומת לב (אישורים, תשלומים), לוח זמנים כללי, סיכום תשלומים.

**Products Approval:** רשימת מוצרים לאישור עם תמונות, מחירים (לפי הגדרה), הערות המעצב, אפשרות להערות ולאשר/דחות כל פריט.

**MoodBoards:** צפייה בלוחות השראה, אישור/דחייה עם הערות.

**Documents:** צפייה והורדה של מסמכים משותפים.

**Payments:** צפייה בלוח תשלומים, תשלום אונליין (אם מופעל).

---

# ט. ניהול שינויים ובקרת איכות

## ChangeOrder (בקשת שינוי)

מנגנון קריטי למניעת Scope Creep - בעיה שמזוהה על ידי 50%+ מהמעצבים כגורם #1 לפגיעה ברווחיות.

```typescript
interface ChangeOrder {
  id: string;
  tenantId: string;
  projectId: string;
  
  changeOrderNumber: string;     // CO-001
  title: string;
  description: string;
  
  // מקור הבקשה
  requestedBy: 'client' | 'designer' | 'contractor' | 'other';
  requestDate: Date;
  
  // סיבה
  reason: 'client_request' | 'design_improvement' | 'site_condition' | 'material_unavailable' | 'regulation' | 'error_correction' | 'other';
  
  // השפעה על תקציב (חיובי או שלילי)
  originalBudgetImpact: number;
  approvedBudgetImpact?: number;
  currency: string;
  
  // השפעה על לו"ז (ימים)
  originalScheduleImpact: number;
  approvedScheduleImpact?: number;
  
  items: ChangeOrderItem[];
  
  // סטטוס
  status: 'draft' | 'pending_review' | 'pending_client_approval' | 'approved' | 'rejected' | 'implemented' | 'cancelled';
  
  // אישורים
  requiresClientApproval: boolean;
  clientApprovalStatus?: 'pending' | 'approved' | 'rejected';
  clientApprovedAt?: Date;
  clientApprovalToken?: string;
  clientComments?: string;
  
  internalApprovalStatus?: 'pending' | 'approved' | 'rejected';
  internalApprovedBy?: string;
  internalApprovedAt?: Date;
  
  attachments: string[];
  
  paymentId?: string;            // אם יצר תשלום נוסף
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ChangeOrderItem {
  id: string;
  changeOrderId: string;
  
  type: 'add' | 'remove' | 'modify';
  category: 'design' | 'product' | 'service' | 'construction';
  description: string;
  
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
  
  roomId?: string;
  productId?: string;
  
  order: number;
}
```

## DesignOption (גרסת עיצוב)

מעצבים מציגים בדרך כלל 2-3 אופציות ללקוח לבחירה:

```typescript
interface DesignOption {
  id: string;
  tenantId: string;
  projectId: string;
  roomId?: string;
  
  name: string;                  // "אופציה א'", "קונספט מודרני"
  description?: string;
  
  type: 'concept' | 'layout' | 'material' | 'color' | 'furniture' | 'full_design';
  
  images: DesignOptionImage[];
  
  estimatedCost?: number;
  currency?: string;
  
  status: 'draft' | 'internal_review' | 'presented' | 'approved' | 'rejected' | 'revision_requested';
  
  presentedAt?: Date;
  presentedBy?: string;
  
  clientFeedback?: string;
  clientApprovedAt?: Date;
  
  rejectionReason?: string;
  
  isSelected: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface DesignOptionImage {
  url: string;
  type: 'render' | 'plan' | 'elevation' | 'section' | 'detail' | 'moodboard' | 'sketch' | 'photo';
  caption?: string;
  order: number;
}
```

## SnagItem (ליקוי)

רשימת ליקויים לתיקון - קריטי לשלב המסירה:

```typescript
interface SnagItem {
  id: string;
  tenantId: string;
  projectId: string;
  roomId?: string;
  
  snagNumber: string;            // SN-001
  
  title: string;
  description: string;
  location: string;              // תיאור מיקום מדויק
  
  images: string[];
  
  category: 'defect' | 'incomplete' | 'damage' | 'wrong_item' | 'quality' | 'missing' | 'other';
  severity: 'cosmetic' | 'minor' | 'major' | 'critical';
  
  // אחריות
  responsibleParty: 'contractor' | 'supplier' | 'designer' | 'installer' | 'unknown';
  responsibleEntityId?: string;
  responsibleEntityName?: string;
  
  // סטטוס
  status: 'open' | 'assigned' | 'in_progress' | 'fixed' | 'verified' | 'wont_fix' | 'disputed';
  
  // תאריכים
  reportedAt: Date;
  reportedBy: string;
  dueDate?: Date;
  fixedAt?: Date;
  fixedBy?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  
  // תיקון
  fixDescription?: string;
  fixImages?: string[];
  
  notes?: string;
  internalNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

## תהליך Snag List

1. **פתיחה:** דיווח על ליקוי עם תמונות ומיקום
2. **הקצאה:** שיוך לאחראי (ספק/קבלן/מתקין)
3. **טיפול:** האחראי מתקן ומדווח
4. **אימות:** המעצב/מנהל מאמת שהתיקון תקין
5. **סגירה:** הליקוי מסומן כתוקן ואומת
# מסמך אפיון מערכת ניהול סטודיו - חלק 5
## הגדרות גנריות, עיצוב ממשק, נספחים טכניים

---

# י. ישויות הגדרה גנריות

## עיקרון הגנריות

כל מה שיכול להשתנות בין משרד למשרד צריך להיות configurable.

**מה גנרי:**
- ProjectType - סוגי פרויקטים (דירה, וילה, משרד, חנות)
- ProjectStatus - סטטוסים (פעיל, מושהה, סגור)
- ProjectPhase - שלבים (ייעוץ, קונספט, תכנון מפורט, רכש, ביצוע, מסירה)
- TaskStatus - סטטוסי משימה (לעשות, בעבודה, בבדיקה, הושלם)
- ProductCategory - קטגוריות מוצרים (ריהוט, תאורה, טקסטיל)
- RoomType - סוגי חדרים (סלון, מטבח, חדר שינה)
- SupplierCategory - סוגי ספקים (ריהוט, פרזול, בדים)
- Trade - מקצועות (חשמלאי, אינסטלטור, נגר)
- DocumentCategory - סוגי מסמכים (תוכניות, חוזים, הצעות)
- ExpenseCategory - סוגי הוצאות (נסיעות, חומרים, שירותים)

## ConfigurableEntity - מבנה בסיסי

```typescript
interface ConfigurableEntity {
  id: string;
  tenantId: string;
  
  entityType: string;            // project_type, task_status, etc.
  name: string;
  nameEn?: string;
  
  color?: string;
  icon?: string;
  
  isDefault: boolean;
  isSystem: boolean;             // מובנה - לא ניתן למחיקה
  
  // לסטטוסים
  isFinal?: boolean;
  allowedTransitions?: string[];
  
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## דוגמה - Default Project Phases

```typescript
const defaultPhases = [
  { name: 'ייעוץ ראשוני', nameEn: 'Initial Consultation', color: '#E8E8E8', order: 1 },
  { name: 'קונספט', nameEn: 'Concept Design', color: '#B8D4E8', order: 2 },
  { name: 'תכנון מפורט', nameEn: 'Detailed Design', color: '#7FB8D8', order: 3 },
  { name: 'רכש', nameEn: 'Procurement', color: '#4A9CC8', order: 4 },
  { name: 'התקנה וביצוע', nameEn: 'Installation', color: '#2080B8', order: 5 },
  { name: 'מסירה', nameEn: 'Handover', color: '#28A745', order: 6, isFinal: true }
];
```

## CustomField - שדות מותאמים

```typescript
interface CustomFieldDefinition {
  id: string;
  tenantId: string;
  
  entityType: 'project' | 'client' | 'supplier' | 'product' | 'room' | 'task' | 'professional';
  
  name: string;
  fieldKey: string;              // snake_case
  fieldType: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'multiselect' | 'boolean' | 'url' | 'email' | 'phone' | 'currency' | 'textarea' | 'file';
  
  options?: CustomFieldOption[]; // לשדות בחירה
  
  isRequired: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  
  showInList: boolean;
  showInCard: boolean;
  showInPortal: boolean;
  showInFilter: boolean;
  
  groupName?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomFieldOption {
  value: string;
  label: string;
  color?: string;
  isDefault?: boolean;
}

interface CustomFieldValue {
  id: string;
  tenantId: string;
  fieldId: string;
  entityType: string;
  entityId: string;
  value: string;                 // תמיד string - parse לפי type
  createdAt: Date;
  updatedAt: Date;
}
```

## Label - תגיות

```typescript
interface Label {
  id: string;
  tenantId: string;
  
  name: string;
  color: string;
  
  applicableTo: ('project' | 'client' | 'supplier' | 'product' | 'task')[];
  
  order: number;
  isActive: boolean;
  createdAt: Date;
}
```

## NotificationTemplate - תבניות הודעות

```typescript
interface NotificationTemplate {
  id: string;
  tenantId: string;
  
  trigger: 'payment_due' | 'payment_overdue' | 'approval_needed' | 'delivery_update' | 'project_update' | 'meeting_reminder' | 'task_due' | 'custom';
  
  name: string;
  channels: ('email' | 'sms' | 'whatsapp' | 'in_app')[];
  
  subject?: string;
  body: string;                  // עם placeholders: {{client_name}}, {{project_name}}, {{amount}}
  
  sendAutomatically: boolean;
  daysBeforeEvent?: number;
  daysAfterEvent?: number;
  sendTime?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

# יא. עיצוב ממשק 2026

## עקרונות עיצוב

**Trends 2026 שיושמו:**
- Zero Interface - Dashboard שמציג מה רלוונטי אוטומטית
- AI Personalization - סידור פאנלים לפי שימוש
- Data Transparency - כל מספר ניתן ללחיצה לראות מקור
- Embedded Collaboration - תגובות ושיתוף בתוך הממשק
- Progressive Disclosure - מידע מתגלה לפי צורך
- Mobile-First Adaptive - חוויה שונה למובייל
- Dark Mode - מובנה עם מעבר חלק
- Ethical UX - פרטיות, שקיפות, נגישות

## Design System

**צבעים:**
- Primary: כחול מקצועי (#3399FF)
- Neutral: אפור חם
- Success: ירוק (#22C55E)
- Warning: כתום (#F59E0B)
- Error: אדום (#EF4444)
- Info: כחול (#3B82F6)

**טיפוגרפיה:**
- Font: Assistant לעברית, Segoe UI fallback
- גדלים: 12px-36px
- משקלים: 400, 500, 600, 700

**ריווח:** בסיס 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)

**רדיוסים:** 4, 8, 12, 16, 24px

**צללים:** 3 רמות (sm, md, lg)

## רכיבים עיקריים

**Cards:** רקע לבן, border אפור בהיר, radius 12px, shadow קל, padding 16px.

**Buttons:** 
- Primary: רקע כחול, טקסט לבן
- Secondary: רקע אפור בהיר, טקסט כהה
- Outline: border כחול, רקע שקוף
- Ghost: טקסט כחול, רקע שקוף
- גדלים: sm (32px), md (40px), lg (48px)

**Form Inputs:** גובה 40px, border אפור, radius 8px, focus ring כחול.

**Tables:** 
- Inline Editable - לחיצה על תא = עריכה
- Sortable - לחיצה על header
- Draggable - גרירה לשינוי סדר
- Selectable - בחירה מרובה לפעולות

**Status Badges:** צבע רקע בהיר + טקסט כהה לפי סטטוס.

## Responsive Breakpoints

- sm: 640px (טאבלטים קטנים)
- md: 768px (טאבלטים)
- lg: 1024px (לפטופים)
- xl: 1280px (דסקטופ)
- 2xl: 1536px (מסכים גדולים)

**שינויים לפי Breakpoint:**
- Mobile: Sidebar מוסתר (hamburger), Cards בעמודה אחת, Tables כ-Cards, Panels כ-Full screen modal, Actions ב-Bottom bar
- Tablet: Sidebar מכווץ (icons), 2 עמודות, Scroll לטבלאות, Panels כ-Side sheet
- Desktop: Sidebar מלא, 3-4 עמודות, טבלאות מלאות, Panels inline expand

## נגישות

- Color Contrast: 4.5:1 מינימום
- Focus Indicators: ring נראה על כל אלמנט אינטראקטיבי
- Keyboard Navigation: תמיכה מלאה
- Screen Readers: ARIA labels
- Text Scaling: עד 200% zoom
- Motion: prefers-reduced-motion
- RTL: תמיכה מלאה

---

# יב. נספחים טכניים

## Database Schema Overview

**Core Entities:** tenants > users, clients, suppliers, professionals, products

**Project Related:** projects > rooms > room_products, tasks, documents, meetings, payments, expenses, time_entries, proposals, contracts, change_orders, design_options, snag_items, mood_boards > mood_board_items, purchase_orders > po_items, delivery_tracking, client_portal_settings

**Config Entities:** configurable_entities, custom_field_definitions, custom_field_values, labels, entity_labels, notification_templates

**System Entities:** activity_logs, retainers > retainer_applications, client_approvals

## API Structure (RESTful)

```
BASE: /api/v1

GET/POST /tenant
GET/POST/PATCH/DELETE /users/:id
GET/POST/PATCH/DELETE /projects/:id
GET/POST /projects/:id/rooms
GET/POST /projects/:id/tasks
GET/POST /projects/:id/payments
GET/POST /projects/:id/documents
GET /projects/:id/ff-e-schedule
GET/POST/PATCH /clients/:id
GET/POST/PATCH /suppliers/:id
GET/POST/PATCH /products/:id
GET/POST/PATCH /proposals/:id
POST /proposals/:id/send
GET /proposals/:id/public/:token
GET/POST/PATCH /purchase-orders/:id
GET/POST/PATCH/DELETE /config/:entityType/:id
GET/POST/PATCH /custom-fields/:id
GET /reports/project-summary/:projectId
GET /reports/financial-overview
```

## Real-time Events (WebSocket)

Events: project.updated, task.created, task.completed, payment.received, delivery.updated, approval.received, comment.added, user.online, user.offline

## Integrations (Planned)

**Priority High:** Google Calendar, Outlook Calendar, Google Drive, WhatsApp Business, Stripe, PayPlus (Israeli)

**Priority Medium:** Dropbox, QuickBooks, Cardcom (Israeli)

**Priority Low:** Revit, AutoCAD, Canva

## Security

- Authentication: JWT with refresh tokens (24h access, 7d refresh)
- MFA: Optional TOTP
- Authorization: RBAC + Row-level security
- Encryption: AES-256 at rest, TLS 1.3 in transit
- Backup: Daily, 30-day retention
- Audit: All changes tracked

## Performance Targets

- Page Load (LCP): <2.5s
- Time to Interactive: <3.5s
- API Response (p95): <500ms
- Search Response: <200ms
- Real-time Latency: <100ms
- Uptime: 99.9%

---

# סיכום - רשימת ישויות מלאה

## Core (6)
1. Tenant
2. User
3. Project
4. Client
5. Supplier
6. Professional

## Project Related (12)
7. Room
8. Task
9. Document
10. Meeting
11. MoodBoard
12. MoodBoardItem

## Product & Procurement (5)
13. Product
14. RoomProduct
15. PurchaseOrder
16. PurchaseOrderItem
17. DeliveryTracking

## Financial (6)
18. Proposal
19. ProposalItem
20. Contract
21. Retainer
22. Payment
23. Expense
24. TimeEntry

## Change Management (3)
25. ChangeOrder
26. DesignOption
27. SnagItem

## Client Portal (2)
28. ClientPortalSettings
29. ClientApproval

## Communication & Tracking (2)
30. CommunicationLog
31. ActivityLog

## Configuration (5)
32. ConfigurableEntity
33. CustomFieldDefinition
34. CustomFieldValue
35. Label
36. NotificationTemplate

---

**גרסה:** 2.0
**תאריך:** ינואר 2026
**סטטוס:** מוכן לפיתוח

מסמך זה מהווה אפיון מלא למערכת ניהול סטודיו לאדריכלות ועיצוב פנים, מבוסס על מחקר מעמיק של 60+ מקורות מהתעשייה ו-UX trends 2025-2026.
# מסמך אפיון מערכת ניהול סטודיו - חלק 6
## שיתוף פעולה בצוות, Real-time, הנחיות טכניות

---

# יג. ישויות שיתוף פעולה בצוות

## 1. Comment (תגובה)

תגובות על כל ישות במערכת - משימות, מוצרים, מסמכים, חדרים, הזמנות רכש.

```typescript
interface Comment {
  id: string;
  tenantId: string;
  
  // על מה התגובה
  entityType: 'task' | 'room_product' | 'document' | 'room' | 'purchase_order' | 'change_order' | 'snag_item' | 'design_option' | 'moodboard' | 'project';
  entityId: string;
  
  // תוכן
  content: string;
  
  // mentions - מערך של user IDs שתויגו עם @
  mentions: string[];
  
  // קבצים מצורפים
  attachments?: CommentAttachment[];
  
  // thread - תגובה על תגובה
  parentId?: string;
  
  // פנימי או גלוי ללקוח
  isInternal: boolean;
  
  // מטא
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  isDeleted: boolean;
}

interface CommentAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}
```

**הנחיות למימוש:**
- בטעינת ישות, לטעון את ה-comments שלה (עם pagination אם יש הרבה)
- תגובה חדשה נשלחת ב-WebSocket לכל המשתמשים שצופים באותה ישות
- mentions יוצרים notification למשתמש המתויג
- תמיכה ב-Markdown בסיסי (bold, italic, lists, links)

---

## 2. DailyLog (דוח יומי / ביקור אתר)

תיעוד ביקורי אתר ועבודה יומית - קריטי בשלב הביצוע.

```typescript
interface DailyLog {
  id: string;
  tenantId: string;
  projectId: string;
  
  // תאריך הדוח
  date: Date;
  
  // מי כתב
  userId: string;
  
  // סוג
  logType: 'site_visit' | 'installation' | 'inspection' | 'delivery' | 'general';
  
  // תוכן
  summary: string;
  workCompleted?: string;
  issuesFound?: string;
  nextSteps?: string;
  
  // מזג אוויר (רלוונטי לאתר)
  weather?: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'hot' | 'cold';
    temperature?: number;
    notes?: string;
  };
  
  // מי היה באתר
  presentOnSite?: string[];
  
  // תמונות - קריטי!
  photos: DailyLogPhoto[];
  
  // קישור למשימות שהושלמו
  completedTaskIds?: string[];
  
  // קישור לליקויים שנמצאו
  snagItemIds?: string[];
  
  // שעות
  arrivalTime?: string;
  departureTime?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

interface DailyLogPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  roomId?: string;
  takenAt: Date;
  order: number;
}
```

**הנחיות למימוש:**
- ממשק מותאם למובייל - צילום ישיר מהאפליקציה
- תמיכה ב-offline - שמירה מקומית וסנכרון כשיש רשת
- יצירת thumbnail אוטומטית לתמונות
- אפשרות לשתף עם לקוח (או להשאיר פנימי)

---

## 3. InternalNote (הערה פנימית)

הערות פנימיות שרק הצוות רואה - על לקוחות, ספקים, פרויקטים.

```typescript
interface InternalNote {
  id: string;
  tenantId: string;
  
  // על מה ההערה
  entityType: 'client' | 'supplier' | 'professional' | 'project';
  entityId: string;
  
  // תוכן
  content: string;
  
  // חשיבות
  priority: 'normal' | 'important' | 'warning';
  
  // האם להציג בולט (pinned)
  isPinned: boolean;
  
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**הנחיות למימוש:**
- מוצג ב-sidebar או בראש הדף של הישות
- הערות עם priority=warning מוצגות בצבע בולט
- הערות pinned תמיד למעלה
- לעולם לא נחשף ללקוח (גם לא ב-Client Portal)

---

## 4. Notification (התראה)

מערכת התראות מרכזית.

```typescript
interface Notification {
  id: string;
  tenantId: string;
  userId: string;              // למי ההתראה
  
  // סוג
  type: 'mention' | 'assignment' | 'comment' | 'approval_needed' | 'approval_received' | 'task_due' | 'task_overdue' | 'payment_received' | 'delivery_update' | 'status_change' | 'daily_log' | 'system';
  
  // תוכן
  title: string;
  body: string;
  
  // קישור
  entityType?: string;
  entityId?: string;
  projectId?: string;
  url?: string;
  
  // מי יצר (אם רלוונטי)
  triggeredByUserId?: string;
  
  // סטטוס
  isRead: boolean;
  readAt?: Date;
  
  // ערוצים שנשלחו
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  
  createdAt: Date;
}
```

**הנחיות למימוש:**
- התראות in-app מגיעות ב-WebSocket מיידית
- bell icon עם counter של unread
- קליק על התראה = סימון כנקראה + ניווט ליעד
- Mark all as read
- הגדרות אישיות לכל משתמש - מה לשלוח באימייל, מה רק in-app

---

## 5. UserPresence (נוכחות משתמש)

מעקב מי מחובר ועובד על מה - לא נשמר ב-DB, רק ב-memory/Redis.

```typescript
interface UserPresence {
  odId: string;
  tenantId: string;
  
  status: 'online' | 'away' | 'offline';
  
  // איפה המשתמש נמצא עכשיו
  currentView?: {
    entityType: 'project' | 'client' | 'task' | 'document' | 'room';
    entityId: string;
    entityName: string;
  };
  
  lastActiveAt: Date;
}
```

**הנחיות למימוש:**
- שמירה ב-Redis עם TTL של 5 דקות
- heartbeat כל 30 שניות מהלקוח
- הצגת avatars קטנים של מי שצופה באותו פרויקט/משימה
- away אוטומטי אחרי 5 דקות ללא פעילות

---

## 6. WorkloadView (תצוגת עומס עבודה)

לא ישות - אלא endpoint/view שמחשב בזמן אמת.

```typescript
interface UserWorkload {
  userId: string;
  userName: string;
  avatar?: string;
  
  // שעות
  totalCapacityHours: number;     // כמה שעות זמין בשבוע (ברירת מחדל 40)
  allocatedHours: number;         // כמה מוקצה מפרויקטים
  availableHours: number;         // כמה פנוי
  
  // utilization
  utilizationPercent: number;     // allocatedHours / totalCapacityHours * 100
  
  // פירוט לפי פרויקט
  projectAllocations: {
    projectId: string;
    projectName: string;
    allocatedHours: number;
    taskCount: number;
  }[];
  
  // משימות קרובות
  upcomingTasks: {
    taskId: string;
    taskTitle: string;
    projectName: string;
    dueDate: Date;
  }[];
  
  // סטטוס
  status: 'underloaded' | 'balanced' | 'overloaded';  // <50%, 50-90%, >90%
}

interface TeamWorkloadView {
  tenantId: string;
  calculatedAt: Date;
  period: 'week' | 'month';
  startDate: Date;
  endDate: Date;
  
  members: UserWorkload[];
  
  // סיכומים
  totalTeamCapacity: number;
  totalAllocated: number;
  averageUtilization: number;
}
```

**הנחיות למימוש:**
- חישוב מ-Tasks עם assignedTo ו-estimatedHours
- תצוגה כ-bar chart צבעוני (ירוק/צהוב/אדום)
- אפשרות לגרור משימה מאדם לאדם
- סינון לפי תקופה (שבוע/חודש/רבעון)

---

# יד. ארכיטקטורת Real-time

## עקרון מנחה

**כל שינוי במערכת מתעדכן מיידית לכל המשתמשים הרלוונטיים ללא רענון דף.**

## WebSocket Architecture

```typescript
// חיבור WebSocket בטעינת האפליקציה
interface WebSocketConnection {
  tenantId: string;
  userId: string;
  
  // channels שהמשתמש מאזין להם
  subscriptions: string[];  // ['project:123', 'tenant:456']
}

// מבנה הודעה
interface WebSocketMessage {
  type: 'entity_created' | 'entity_updated' | 'entity_deleted' | 'notification' | 'presence' | 'typing';
  
  channel: string;          // 'project:123' או 'tenant:456'
  
  entityType?: string;      // 'task', 'comment', 'payment'
  entityId?: string;
  
  payload: any;             // הנתונים עצמם
  
  userId: string;           // מי עשה את השינוי
  timestamp: Date;
}
```

## Event Types

```typescript
// רשימת events שנשלחים ב-WebSocket
const REALTIME_EVENTS = {
  // ישויות בסיסיות
  'project.updated': 'עדכון פרטי פרויקט',
  'project.phase_changed': 'שינוי שלב פרויקט',
  
  // משימות
  'task.created': 'משימה חדשה',
  'task.updated': 'עדכון משימה',
  'task.completed': 'משימה הושלמה',
  'task.assigned': 'משימה הוקצתה',
  'task.deleted': 'משימה נמחקה',
  
  // תגובות
  'comment.created': 'תגובה חדשה',
  'comment.updated': 'תגובה נערכה',
  'comment.deleted': 'תגובה נמחקה',
  
  // מוצרים
  'room_product.created': 'מוצר נוסף לחדר',
  'room_product.updated': 'עדכון מוצר',
  'room_product.status_changed': 'שינוי סטטוס מוצר',
  
  // תשלומים
  'payment.received': 'תשלום התקבל',
  'payment.status_changed': 'שינוי סטטוס תשלום',
  
  // רכש
  'purchase_order.created': 'הזמנת רכש חדשה',
  'purchase_order.status_changed': 'שינוי סטטוס הזמנה',
  'delivery.updated': 'עדכון משלוח',
  
  // אישורים
  'approval.requested': 'נדרש אישור',
  'approval.received': 'אישור התקבל',
  
  // שינויים
  'change_order.created': 'בקשת שינוי חדשה',
  'change_order.approved': 'שינוי אושר',
  
  // ליקויים
  'snag_item.created': 'ליקוי חדש',
  'snag_item.fixed': 'ליקוי תוקן',
  
  // מסמכים
  'document.uploaded': 'מסמך הועלה',
  'document.version_added': 'גרסה חדשה למסמך',
  
  // יומן
  'daily_log.created': 'דוח יומי חדש',
  
  // נוכחות
  'presence.user_online': 'משתמש התחבר',
  'presence.user_offline': 'משתמש התנתק',
  'presence.user_viewing': 'משתמש צופה בישות',
  
  // התראות
  'notification.new': 'התראה חדשה',
  
  // typing indicator
  'typing.started': 'משתמש מקליד',
  'typing.stopped': 'משתמש הפסיק להקליד',
};
```

## Subscription Model

```typescript
// כשמשתמש נכנס לפרויקט
subscribeToProject(projectId: string) {
  // מאזין לכל האירועים של הפרויקט
  ws.subscribe(`project:${projectId}`);
}

// כשמשתמש יוצא מפרויקט
unsubscribeFromProject(projectId: string) {
  ws.unsubscribe(`project:${projectId}`);
}

// תמיד מאזין ל-tenant events (התראות, presence)
subscribeToTenant(tenantId: string) {
  ws.subscribe(`tenant:${tenantId}`);
}
```

---

# טו. Optimistic UI - הנחיות מימוש

## העיקרון

**UI מתעדכן מיידית לפני שהשרת מאשר. אם השרת נכשל - rollback.**

## דוגמה: יצירת משימה

```typescript
// ❌ לא ככה - מחכה לשרת
async function createTaskSlow(task: Task) {
  setLoading(true);
  const result = await api.createTask(task);
  setTasks([...tasks, result]);
  setLoading(false);
}

// ✅ ככה - optimistic
async function createTaskFast(task: Task) {
  // 1. יוצר ID זמני
  const tempId = `temp_${Date.now()}`;
  const optimisticTask = { ...task, id: tempId, _isPending: true };
  
  // 2. מוסיף מיידית ל-UI
  setTasks([...tasks, optimisticTask]);
  
  try {
    // 3. שולח לשרת
    const result = await api.createTask(task);
    
    // 4. מחליף את הזמני באמיתי
    setTasks(tasks => tasks.map(t => 
      t.id === tempId ? result : t
    ));
  } catch (error) {
    // 5. אם נכשל - מסיר ומציג שגיאה
    setTasks(tasks => tasks.filter(t => t.id !== tempId));
    showError('יצירת המשימה נכשלה');
  }
}
```

## דוגמה: עדכון inline

```typescript
// עריכת שדה בטבלה
async function updateField(entityId: string, field: string, newValue: any) {
  const oldValue = entity[field];
  
  // 1. עדכון מיידי
  updateEntityLocal(entityId, { [field]: newValue });
  
  try {
    // 2. שליחה לשרת
    await api.updateEntity(entityId, { [field]: newValue });
  } catch (error) {
    // 3. rollback
    updateEntityLocal(entityId, { [field]: oldValue });
    showError('העדכון נכשל');
  }
}
```

## מצבים ויזואליים

```typescript
interface EntityUIState {
  _isPending?: boolean;    // ממתין לאישור שרת
  _isSynced?: boolean;     // מסונכרן
  _hasError?: boolean;     // נכשל
  _lastError?: string;     // הודעת שגיאה
}

// הצגה ב-UI:
// _isPending: opacity מופחת, spinner קטן
// _hasError: border אדום, אייקון שגיאה
// _isSynced: ירוק קטן (אופציונלי)
```

---

# טז. הנחיות טכניות ל-Claude Code

## Stack מומלץ

```yaml
Frontend:
  framework: Next.js 14+ (App Router)
  state: Zustand או TanStack Query
  realtime: Socket.io-client
  ui: Tailwind CSS + shadcn/ui
  forms: React Hook Form + Zod
  tables: TanStack Table
  dnd: dnd-kit

Backend:
  runtime: Node.js 20+
  framework: Fastify או Express
  database: PostgreSQL 15+
  orm: Prisma או Drizzle
  realtime: Socket.io
  cache: Redis
  queue: BullMQ (לעבודות רקע)
  storage: S3-compatible (Cloudflare R2 / AWS S3)

Infrastructure:
  hosting: Vercel / Railway / Fly.io
  database: Supabase / Neon / PlanetScale
  realtime: built-in או Ably/Pusher
```

## מבנה תיקיות מומלץ

```
/src
  /app                    # Next.js App Router
    /(auth)               # דפי התחברות
    /(dashboard)          # דפים מוגנים
      /projects
        /[projectId]
          /page.tsx       # Project Hub
          /tasks/page.tsx
          /products/page.tsx
      /calendar
      /contacts
      /library
      /settings
    /api                  # API Routes
      /v1
        /projects
        /tasks
        /...
  
  /components
    /ui                   # רכיבי בסיס (button, input, card)
    /features             # רכיבים לפי פיצ'ר
      /projects
      /tasks
      /products
    /layouts              # layouts משותפים
  
  /lib
    /api                  # API client functions
    /hooks                # Custom hooks
    /utils                # פונקציות עזר
    /validators           # Zod schemas
    /constants            # קבועים
  
  /stores                 # Zustand stores
    /projectStore.ts
    /uiStore.ts
    /notificationStore.ts
  
  /types                  # TypeScript types
    /entities.ts          # כל ה-interfaces מהמסמך
    /api.ts               # API types
  
  /services
    /websocket.ts         # WebSocket client
    /storage.ts           # File upload
```

## כללי קוד

```typescript
// 1. כל ישות חייבת tenantId
interface BaseEntity {
  id: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. כל query חייב לסנן לפי tenant
const getTasks = (tenantId: string, projectId: string) => {
  return db.task.findMany({
    where: { 
      tenantId,      // תמיד!
      projectId 
    }
  });
};

// 3. WebSocket - broadcast לכל ה-tenant
const emitToProject = (tenantId: string, projectId: string, event: string, data: any) => {
  io.to(`tenant:${tenantId}`).to(`project:${projectId}`).emit(event, data);
};

// 4. Optimistic updates - תמיד
// לעולם לא להציג loading spinner לפעולות פשוטות

// 5. Error handling - graceful
// תמיד rollback, תמיד הודעה למשתמש

// 6. RTL - מובנה
// כל הטקסטים עם dir="rtl"
// Tailwind: space-x-reverse, text-right
```

## Database Schema Notes

```sql
-- כל טבלה חייבת:
-- 1. id (UUID או CUID)
-- 2. tenant_id עם foreign key
-- 3. created_at, updated_at
-- 4. index על tenant_id

-- Row Level Security (אם Supabase):
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tasks
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Indexes חשובים:
CREATE INDEX idx_tasks_tenant_project ON tasks(tenant_id, project_id);
CREATE INDEX idx_tasks_assigned ON tasks(tenant_id, assigned_to);
CREATE INDEX idx_comments_entity ON comments(tenant_id, entity_type, entity_id);
```

## API Design

```typescript
// RESTful + real-time hybrid

// קריאה - REST
GET /api/v1/projects/:projectId/tasks

// יצירה - REST + WebSocket broadcast
POST /api/v1/projects/:projectId/tasks
// Response: 201 + task object
// Side effect: WebSocket emit 'task.created'

// עדכון - REST + WebSocket broadcast  
PATCH /api/v1/tasks/:taskId
// Response: 200 + updated task
// Side effect: WebSocket emit 'task.updated'

// Bulk operations
POST /api/v1/tasks/bulk
// Body: { action: 'complete', ids: ['1', '2', '3'] }
// Side effect: WebSocket emit for each

// Real-time subscriptions
// Client connects to WebSocket on app load
// Server manages room subscriptions based on current view
```

## Performance Requirements

```yaml
Targets:
  - Page Load (LCP): < 2.5s
  - Time to Interactive: < 3.5s
  - API Response (p95): < 500ms
  - WebSocket Latency: < 100ms
  - Optimistic UI update: < 50ms (instant feel)

Caching:
  - Static assets: CDN with immutable headers
  - API responses: SWR/React Query with stale-while-revalidate
  - Database: Redis for hot data (active projects, user sessions)

Pagination:
  - Default limit: 50 items
  - Infinite scroll for lists
  - Cursor-based pagination (not offset)
```

---

# יז. סיכום - רשימת ישויות מעודכנת

## Core (6)
1. Tenant
2. User  
3. Project
4. Client
5. Supplier
6. Professional

## Project Related (12)
7. Room
8. Task
9. Document
10. Meeting
11. MoodBoard
12. MoodBoardItem

## Product & Procurement (5)
13. Product
14. RoomProduct
15. PurchaseOrder
16. PurchaseOrderItem
17. DeliveryTracking

## Financial (7)
18. Proposal
19. ProposalItem
20. Contract
21. Retainer
22. Payment
23. Expense
24. TimeEntry

## Change Management (3)
25. ChangeOrder
26. DesignOption
27. SnagItem

## Client Portal (2)
28. ClientPortalSettings
29. ClientApproval

## Communication & Tracking (2)
30. CommunicationLog
31. ActivityLog

## Configuration (5)
32. ConfigurableEntity
33. CustomFieldDefinition
34. CustomFieldValue
35. Label
36. NotificationTemplate

## Collaboration (NEW) (4)
37. Comment
38. DailyLog
39. InternalNote
40. Notification

## Real-time (in-memory only)
- UserPresence
- WorkloadView (computed)

---

**סה"כ: 40 ישויות + 2 real-time views**

**גרסה:** 2.1
**תאריך:** ינואר 2026
**יעד:** Claude Code למימוש
**סטטוס:** מוכן לפיתוח
# מסמך אפיון - חלק יח
## Authentication & Onboarding

---

# יח. מערכת הרשמה והתחברות

## שיטות Authentication

המערכת תומכת ב-3 שיטות התחברות:

1. **Magic Link** (מומלץ) - קישור חד-פעמי למייל
2. **Google OAuth** - התחברות עם חשבון Google
3. **Email + Password** - שיטה מסורתית

## ישויות Authentication

```typescript
interface AuthSession {
  id: string;
  userId: string;
  tenantId: string;
  
  // פרטי Session
  token: string;
  refreshToken: string;
  
  // מכשיר
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceName?: string;
  browser?: string;
  os?: string;
  ip: string;
  
  // זמנים
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  
  // סטטוס
  isActive: boolean;
  revokedAt?: Date;
  revokedReason?: string;
}

interface MagicLinkToken {
  id: string;
  email: string;
  token: string;
  
  type: 'login' | 'signup' | 'invite' | 'password_reset';
  
  // למי (אם invite)
  invitedByUserId?: string;
  invitedToTenantId?: string;
  invitedRole?: string;
  
  createdAt: Date;
  expiresAt: Date;        // 15 דקות
  usedAt?: Date;
  
  isUsed: boolean;
}

interface OAuthConnection {
  id: string;
  userId: string;
  
  provider: 'google' | 'microsoft' | 'apple';
  providerUserId: string;
  providerEmail: string;
  
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  
  // סקופים שאושרו
  scopes: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

interface PasswordReset {
  id: string;
  userId: string;
  token: string;
  
  createdAt: Date;
  expiresAt: Date;        // שעה אחת
  usedAt?: Date;
  
  requestedFromIp: string;
  isUsed: boolean;
}
```

## תהליכי Authentication

### 1. הרשמה חדשה (Signup)

```typescript
// שלב 1: משתמש מזין מייל
interface SignupRequest {
  email: string;
  source?: string;          // מאיפה הגיע
  referralCode?: string;    // קוד הפניה
}

// שלב 2: שליחת Magic Link
// מייל עם קישור: /auth/verify?token=xxx&type=signup

// שלב 3: אימות וקליטת פרטים
interface SignupCompletion {
  token: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password?: string;        // אופציונלי - יכול להישאר עם Magic Link
  
  // פרטי המשרד
  companyName: string;
  businessType: 'interior_design' | 'architecture' | 'both';
}

// שלב 4: יצירת Tenant + User + Session
// הפניה ל-Onboarding Wizard
```

### 2. התחברות (Login)

```typescript
// אופציה א: Magic Link
interface MagicLinkLoginRequest {
  email: string;
}
// → שליחת מייל עם קישור
// → קליק על קישור → יצירת Session → כניסה

// אופציה ב: Google OAuth
// → Redirect ל-Google
// → Callback עם code
// → החלפה ל-tokens
// → מציאת/יצירת משתמש
// → יצירת Session

// אופציה ג: Email + Password
interface PasswordLoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}
// → אימות סיסמה
// → יצירת Session
```

### 3. הזמנת משתמש לצוות

```typescript
interface TeamInvitation {
  id: string;
  tenantId: string;
  
  email: string;
  role: 'owner' | 'manager' | 'member';
  
  // הרשאות מותאמות
  customPermissions?: Partial<UserPermissions>;
  
  // הקצאה לפרויקטים
  projectIds?: string[];
  
  invitedByUserId: string;
  
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  
  token: string;
  
  createdAt: Date;
  expiresAt: Date;          // 7 ימים
  acceptedAt?: Date;
  
  // אם המשתמש כבר קיים במערכת (tenant אחר)
  existingUserId?: string;
}
```

**תהליך הזמנה:**
1. Admin שולח הזמנה עם מייל + role
2. מייל נשלח עם קישור: /invite/accept?token=xxx
3. אם משתמש חדש → Signup מקוצר (רק שם + סיסמה אופציונלית)
4. אם משתמש קיים → מצטרף ל-Tenant הנוסף
5. משתמש יכול להיות בכמה Tenants (בוחר בכניסה)

### 4. שכחתי סיסמה

```typescript
// שלב 1: בקשה
interface ForgotPasswordRequest {
  email: string;
}

// שלב 2: מייל עם קישור (אם המשתמש קיים)
// /auth/reset-password?token=xxx

// שלב 3: הגדרת סיסמה חדשה
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// שלב 4: ביטול כל ה-Sessions הקיימים + יצירת חדש
```

### 5. Two-Factor Authentication (2FA)

```typescript
interface TwoFactorSetup {
  id: string;
  userId: string;
  
  method: 'totp' | 'sms';
  
  // TOTP
  secret?: string;
  qrCodeUrl?: string;
  
  // SMS
  phoneNumber?: string;
  
  isEnabled: boolean;
  enabledAt?: Date;
  
  // Backup codes
  backupCodes: string[];
  usedBackupCodes: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

interface TwoFactorChallenge {
  id: string;
  userId: string;
  sessionId: string;
  
  method: 'totp' | 'sms' | 'backup_code';
  
  code?: string;            // הקוד שנשלח (SMS)
  
  createdAt: Date;
  expiresAt: Date;          // 5 דקות
  verifiedAt?: Date;
  
  attempts: number;
  maxAttempts: number;      // 5
}
```

---

# יט. Onboarding Wizard

## מבנה ה-Wizard

```typescript
interface OnboardingState {
  id: string;
  tenantId: string;
  userId: string;
  
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  
  // נתונים שנאספו
  data: OnboardingData;
  
  startedAt: Date;
  completedAt?: Date;
  
  // האם להציג שוב
  showOnLogin: boolean;
}

interface OnboardingData {
  // שלב 1: פרטי משרד
  companyProfile?: {
    name: string;
    logo?: string;
    businessType: 'interior_design' | 'architecture' | 'both';
    teamSize: '1' | '2-5' | '6-10' | '11-20' | '20+';
    website?: string;
    phone?: string;
    address?: string;
  };
  
  // שלב 2: ברנדינג
  branding?: {
    primaryColor: string;
    secondaryColor?: string;
    logo?: string;
    emailSignature?: string;
  };
  
  // שלב 3: תמחור
  pricing?: {
    defaultBillingType: 'fixed' | 'hourly' | 'percentage' | 'cost_plus' | 'hybrid';
    hourlyRate?: number;
    markupPercent?: number;
    currency: string;
    vatRate: number;
  };
  
  // שלב 4: שלבי פרויקט
  projectPhases?: {
    useDefault: boolean;
    customPhases?: { name: string; color: string }[];
  };
  
  // שלב 5: הזמנת צוות
  teamInvites?: {
    email: string;
    role: string;
  }[];
  
  // שלב 6: יבוא נתונים
  dataImport?: {
    importClients: boolean;
    importProducts: boolean;
    source?: 'csv' | 'excel' | 'other_system';
  };
  
  // שלב 7: אינטגרציות
  integrations?: {
    googleCalendar: boolean;
    googleDrive: boolean;
    quickbooks: boolean;
    whatsapp: boolean;
  };
}
```

## שלבי ה-Wizard

### שלב 1: פרופיל המשרד
**מה:** שם, סוג עסק, גודל צוות, לוגו
**למה:** מידע בסיסי שמופיע בכל מקום
**חובה:** כן

### שלב 2: ברנדינג
**מה:** צבעים, לוגו, חתימת מייל
**למה:** הצעות וחוזים יראו מקצועי
**חובה:** לא (ניתן לדלג)

### שלב 3: הגדרות תמחור
**מה:** שיטת תמחור, תעריף שעתי, אחוז markup, מע"מ
**למה:** ברירות מחדל להצעות מחיר
**חובה:** כן

### שלב 4: שלבי פרויקט
**מה:** הגדרת השלבים (או שימוש בברירת מחדל)
**למה:** מעקב התקדמות
**חובה:** לא (יש ברירת מחדל)

### שלב 5: הזמנת צוות
**מה:** הזמנת עובדים במייל
**למה:** עבודה משותפת
**חובה:** לא (ניתן לדלג)

### שלב 6: יבוא נתונים
**מה:** יבוא לקוחות/ספקים/מוצרים מ-Excel
**למה:** לא להתחיל מאפס
**חובה:** לא

### שלב 7: חיבור אינטגרציות
**מה:** Google Calendar, Drive, WhatsApp
**למה:** סנכרון נתונים
**חובה:** לא

### שלב 8: פרויקט ראשון או דמו
**מה:** יצירת פרויקט ראשון או טעינת פרויקט דמו
**למה:** להתחיל לעבוד / ללמוד את המערכת
**חובה:** לא

## לוגיקת Wizard

```typescript
const ONBOARDING_STEPS = [
  { id: 1, name: 'company_profile', required: true, estimatedTime: '2 min' },
  { id: 2, name: 'branding', required: false, estimatedTime: '2 min' },
  { id: 3, name: 'pricing', required: true, estimatedTime: '2 min' },
  { id: 4, name: 'project_phases', required: false, estimatedTime: '1 min' },
  { id: 5, name: 'team_invites', required: false, estimatedTime: '2 min' },
  { id: 6, name: 'data_import', required: false, estimatedTime: '5 min' },
  { id: 7, name: 'integrations', required: false, estimatedTime: '3 min' },
  { id: 8, name: 'first_project', required: false, estimatedTime: '2 min' },
];

// Progress bar מציג: X מתוך Y שלבים
// אפשר לדלג על שלבים לא חובה
// אפשר לחזור לשלבים קודמים
// בסיום: redirect ל-Dashboard
```

## הנחיות UI

```typescript
// מבנה מסך Wizard
interface WizardScreen {
  // Header
  logo: true;
  progressBar: true;
  stepIndicator: true;           // "שלב 3 מתוך 8"
  estimatedTimeRemaining: true;  // "עוד כ-10 דקות"
  
  // Content
  title: string;                 // "הגדרות תמחור"
  subtitle: string;              // "הגדר את שיטת התמחור שלך"
  form: FormFields[];
  
  // Footer
  backButton: true;              // חוץ משלב 1
  skipButton: boolean;           // רק בשלבים לא חובה
  nextButton: true;
  
  // Validation
  validateOnNext: true;
  showErrorsInline: true;
}
```

## אחרי Onboarding

```typescript
// מה קורה כשמסיימים
interface OnboardingCompletion {
  // עדכון Tenant עם כל הנתונים
  updateTenant: true;
  
  // יצירת ConfigurableEntities (phases, statuses)
  createDefaultEntities: true;
  
  // שליחת הזמנות לצוות
  sendTeamInvitations: true;
  
  // התחלת יבוא נתונים (background job)
  startDataImport: true;
  
  // חיבור אינטגרציות
  connectIntegrations: true;
  
  // יצירת פרויקט דמו (אם נבחר)
  createDemoProject: boolean;
  
  // סימון Onboarding כהושלם
  markComplete: true;
  
  // Redirect
  redirectTo: '/dashboard' | '/projects/new' | '/projects/demo';
}
```

---

# כ. User Settings (הגדרות משתמש)

```typescript
interface UserSettings {
  id: string;
  userId: string;
  
  // תצוגה
  display: {
    language: 'he' | 'en';
    theme: 'light' | 'dark' | 'system';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '24h' | '12h';
    timezone: string;
    startOfWeek: 'sunday' | 'monday';
    currency: string;
  };
  
  // התראות
  notifications: {
    // In-App
    inApp: {
      enabled: boolean;
      sound: boolean;
    };
    
    // Email
    email: {
      enabled: boolean;
      
      // מה לשלוח במייל
      taskAssigned: boolean;
      taskDue: boolean;
      taskOverdue: boolean;
      mentions: boolean;
      comments: boolean;
      approvalNeeded: boolean;
      approvalReceived: boolean;
      paymentReceived: boolean;
      deliveryUpdates: boolean;
      weeklyDigest: boolean;
      
      // תדירות digest
      digestFrequency: 'daily' | 'weekly' | 'never';
      digestDay?: 'sunday' | 'monday';    // לשבועי
      digestTime: string;                  // "09:00"
    };
    
    // Push (Mobile)
    push: {
      enabled: boolean;
      
      taskAssigned: boolean;
      mentions: boolean;
      urgentOnly: boolean;
    };
  };
  
  // קיצורי מקלדת
  shortcuts: {
    enabled: boolean;
    customShortcuts?: Record<string, string>;
  };
  
  // Dashboard
  dashboard: {
    defaultView: 'overview' | 'tasks' | 'calendar' | 'projects';
    widgetOrder: string[];
    hiddenWidgets: string[];
  };
  
  // Privacy
  privacy: {
    showOnlineStatus: boolean;
    showCurrentActivity: boolean;
  };
  
  updatedAt: Date;
}
```

---

**הנחיות למימוש:**

1. **Session Management:**
   - Access Token: 24 שעות
   - Refresh Token: 30 ימים
   - רענון אוטומטי שקוף למשתמש
   - ביטול כל Sessions ב-logout מכל המכשירים

2. **Security:**
   - Rate limiting על login attempts (5 ניסיונות, lockout 15 דקות)
   - Magic Link תקף 15 דקות, שימוש חד-פעמי
   - Password requirements: 8+ תווים, אות ומספר
   - 2FA אופציונלי אבל מומלץ

3. **Multi-Tenant:**
   - משתמש יכול להיות בכמה Tenants
   - בכניסה בוחר Tenant (אם יש יותר מאחד)
   - Switch Tenant בלי logout

4. **Onboarding:**
   - Progress נשמר - אפשר לצאת ולחזור
   - אחרי השלמה, לא מוצג שוב (אלא אם מבקשים)
   - Admin יכול לחזור ל-Wizard מההגדרות
# מסמך אפיון - חלק יט
## Automation Engine - מנוע אוטומציות

---

# כא. מנוע אוטומציות גנרי

## עקרון מנחה

מנוע אוטומציות גנרי לחלוטין - המשרד מגדיר את הכללים שלו.

**מבנה:** `TRIGGER` → `CONDITIONS` → `ACTIONS`

כל אוטומציה מורכבת מ:
1. **מתי להפעיל** (Trigger)
2. **באילו תנאים** (Conditions - אופציונלי)
3. **מה לעשות** (Actions - אחד או יותר)

---

## ישויות Automation

### AutomationRule - הכלל עצמו

```typescript
interface AutomationRule {
  id: string;
  tenantId: string;
  
  // מזהה
  name: string;
  description?: string;
  
  // סטטוס
  isEnabled: boolean;
  
  // מתי
  trigger: AutomationTrigger;
  
  // תנאים (כל התנאים חייבים להתקיים - AND)
  conditions: AutomationCondition[];
  
  // פעולות (מבוצעות לפי סדר)
  actions: AutomationAction[];
  
  // הגבלות
  maxExecutionsPerDay?: number;
  cooldownMinutes?: number;        // זמן מינימלי בין הפעלות
  
  // סטטיסטיקות
  executionCount: number;
  lastExecutedAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  
  // מטא
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### AutomationTrigger - מתי להפעיל

```typescript
interface AutomationTrigger {
  type: AutomationTriggerType;
  
  // לפי סוג
  config: TriggerConfig;
}

type AutomationTriggerType =
  // Entity Events
  | 'entity_created'
  | 'entity_updated'
  | 'entity_deleted'
  | 'field_changed'
  | 'status_changed'
  
  // Time-based
  | 'scheduled'
  | 'relative_date'
  
  // Manual
  | 'manual_trigger'
  | 'webhook_received';

// Config לפי סוג trigger
interface TriggerConfig {
  // entity_created / entity_updated / entity_deleted
  entityType?: EntityType;
  
  // field_changed
  fieldName?: string;
  fromValue?: any;
  toValue?: any;
  
  // status_changed
  fromStatusId?: string;
  toStatusId?: string;
  
  // scheduled (cron-like)
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;                    // "09:00"
    dayOfWeek?: number;              // 0-6 (לשבועי)
    dayOfMonth?: number;             // 1-31 (לחודשי)
    timezone: string;
  };
  
  // relative_date (X ימים לפני/אחרי תאריך בישות)
  relativeTo?: {
    entityType: EntityType;
    dateField: string;               // "dueDate", "expectedDeliveryDate"
    daysBefore?: number;
    daysAfter?: number;
    time: string;
  };
  
  // webhook_received
  webhookPath?: string;
}

type EntityType = 
  | 'project' | 'task' | 'client' | 'supplier' 
  | 'payment' | 'proposal' | 'contract' 
  | 'room_product' | 'purchase_order' | 'delivery_tracking'
  | 'change_order' | 'snag_item' | 'meeting' | 'document';
```

### AutomationCondition - תנאים

```typescript
interface AutomationCondition {
  id: string;
  
  // על מה בודקים
  field: string;                     // "status", "amount", "dueDate", "assignedTo"
  
  // איך בודקים
  operator: ConditionOperator;
  
  // מה הערך
  value: any;
  
  // ערך דינמי (אם רלוונטי)
  valueType: 'static' | 'field' | 'variable';
  valueField?: string;               // אם valueType = 'field'
}

type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'in_list'
  | 'not_in_list'
  | 'date_before'
  | 'date_after'
  | 'date_between'
  | 'days_from_now'
  | 'days_ago';
```

### AutomationAction - מה לעשות

```typescript
interface AutomationAction {
  id: string;
  order: number;
  
  type: AutomationActionType;
  config: ActionConfig;
  
  // המשך גם אם נכשל?
  continueOnFailure: boolean;
  
  // עיכוב לפני ביצוע
  delayMinutes?: number;
}

type AutomationActionType =
  // עדכון נתונים
  | 'update_field'
  | 'update_status'
  | 'create_entity'
  | 'delete_entity'
  | 'assign_user'
  
  // יצירת ישויות קשורות
  | 'create_task'
  | 'create_comment'
  | 'create_notification'
  
  // תקשורת
  | 'send_email'
  | 'send_sms'
  | 'send_whatsapp'
  | 'send_in_app_notification'
  
  // אינטגרציות
  | 'webhook_call'
  | 'create_calendar_event'
  
  // לוגיקה
  | 'delay'
  | 'condition_branch';

interface ActionConfig {
  // update_field
  fieldName?: string;
  fieldValue?: any;
  fieldValueType?: 'static' | 'field' | 'template';
  
  // update_status
  newStatusId?: string;
  
  // create_entity
  entityType?: EntityType;
  entityData?: Record<string, any>;
  
  // assign_user
  assignToUserId?: string;
  assignToField?: string;            // לקחת מ-field אחר
  assignRoundRobin?: boolean;        // חלוקה שווה בין הצוות
  
  // create_task
  taskTemplate?: {
    title: string;                   // עם placeholders: "Follow up with {{client.name}}"
    description?: string;
    dueInDays?: number;
    assignToTriggeredUser?: boolean;
    assignToUserId?: string;
    priority?: string;
  };
  
  // send_email
  emailConfig?: {
    to: 'entity_owner' | 'assigned_user' | 'client' | 'specific' | 'field';
    toEmail?: string;                // אם specific
    toField?: string;                // אם field
    
    templateId?: string;             // תבנית מוכנה
    
    // או custom
    subject?: string;
    body?: string;                   // עם placeholders
    
    attachDocuments?: boolean;
  };
  
  // send_sms / send_whatsapp
  messageConfig?: {
    to: 'client' | 'assigned_user' | 'specific' | 'field';
    toPhone?: string;
    toField?: string;
    message: string;                 // עם placeholders
  };
  
  // webhook_call
  webhookConfig?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    bodyTemplate?: string;           // JSON עם placeholders
  };
  
  // delay
  delayMinutes?: number;
  
  // condition_branch
  branchCondition?: AutomationCondition;
  trueActions?: AutomationAction[];
  falseActions?: AutomationAction[];
}
```

### AutomationLog - היסטוריית הרצות

```typescript
interface AutomationLog {
  id: string;
  tenantId: string;
  automationRuleId: string;
  
  // מה הפעיל
  triggeredBy: 'event' | 'schedule' | 'manual' | 'webhook';
  triggerEntityType?: string;
  triggerEntityId?: string;
  
  // תוצאה
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial';
  
  // פירוט actions
  actionResults: ActionResult[];
  
  // שגיאות
  errorMessage?: string;
  errorStack?: string;
  
  // זמנים
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
}

interface ActionResult {
  actionId: string;
  actionType: string;
  
  status: 'pending' | 'success' | 'failed' | 'skipped';
  
  result?: any;                      // מה חזר / נוצר
  errorMessage?: string;
  
  startedAt: Date;
  completedAt?: Date;
}
```

---

## אוטומציות מובנות (Default)

כל Tenant מקבל אוטומציות מומלצות שאפשר להפעיל:

```typescript
const DEFAULT_AUTOMATIONS = [
  // תזכורות תשלום
  {
    name: 'תזכורת תשלום - 7 ימים לפני',
    trigger: { type: 'relative_date', config: { entityType: 'payment', dateField: 'dueDate', daysBefore: 7, time: '09:00' }},
    conditions: [{ field: 'status', operator: 'in_list', value: ['scheduled', 'pending'] }],
    actions: [{ type: 'send_email', config: { to: 'client', templateId: 'payment_reminder' }}]
  },
  {
    name: 'תזכורת תשלום - באיחור',
    trigger: { type: 'relative_date', config: { entityType: 'payment', dateField: 'dueDate', daysAfter: 1, time: '09:00' }},
    conditions: [{ field: 'status', operator: 'in_list', value: ['scheduled', 'pending'] }],
    actions: [
      { type: 'update_status', config: { newStatusId: 'overdue' }},
      { type: 'send_email', config: { to: 'client', templateId: 'payment_overdue' }},
      { type: 'create_notification', config: { to: 'entity_owner', message: 'תשלום באיחור: {{payment.name}}' }}
    ]
  },
  
  // מעבר שלבים אוטומטי
  {
    name: 'כל המשימות הושלמו - העבר לשלב הבא',
    trigger: { type: 'entity_updated', config: { entityType: 'task' }},
    conditions: [
      { field: 'status', operator: 'equals', value: 'completed' },
      // + custom logic: בדוק שכל המשימות בשלב הושלמו
    ],
    actions: [{ type: 'update_field', config: { entityType: 'project', fieldName: 'phaseId', fieldValue: '{{nextPhaseId}}' }}]
  },
  
  // אישור הצעה - יצירת חוזה
  {
    name: 'הצעה אושרה - צור חוזה',
    trigger: { type: 'status_changed', config: { entityType: 'proposal', toStatusId: 'approved' }},
    actions: [
      { type: 'create_entity', config: { entityType: 'contract', entityData: { /* מהצעה */ }}},
      { type: 'create_task', config: { taskTemplate: { title: 'שליחת חוזה לחתימה - {{client.name}}', dueInDays: 1 }}}
    ]
  },
  
  // חתימת חוזה - יצירת פרויקט
  {
    name: 'חוזה נחתם - הפעל פרויקט',
    trigger: { type: 'status_changed', config: { entityType: 'contract', toStatusId: 'signed' }},
    actions: [
      { type: 'update_field', config: { entityType: 'project', fieldName: 'status', fieldValue: 'active' }},
      { type: 'update_field', config: { entityType: 'client', fieldName: 'status', fieldValue: 'active' }},
      { type: 'send_email', config: { to: 'client', templateId: 'project_kickoff' }}
    ]
  },
  
  // עדכון משלוח
  {
    name: 'משלוח נמסר - עדכן מוצר',
    trigger: { type: 'status_changed', config: { entityType: 'delivery_tracking', toStatusId: 'delivered' }},
    actions: [
      { type: 'update_field', config: { entityType: 'room_product', fieldName: 'procurementStatus', fieldValue: 'delivered' }},
      { type: 'create_task', config: { taskTemplate: { title: 'בדיקת {{product.name}} שנמסר', dueInDays: 1 }}}
    ]
  },
  
  // איחור משלוח
  {
    name: 'משלוח באיחור - התראה',
    trigger: { type: 'relative_date', config: { entityType: 'delivery_tracking', dateField: 'estimatedDeliveryDate', daysAfter: 1, time: '09:00' }},
    conditions: [{ field: 'status', operator: 'not_in_list', value: ['delivered', 'completed'] }],
    actions: [
      { type: 'update_field', config: { fieldName: 'hasIssue', fieldValue: true }},
      { type: 'create_notification', config: { to: 'assigned_user', message: 'משלוח באיחור: {{product.name}}' }}
    ]
  },
  
  // ליקוי חדש - התראה
  {
    name: 'ליקוי חדש - התראה למנהל',
    trigger: { type: 'entity_created', config: { entityType: 'snag_item' }},
    conditions: [{ field: 'severity', operator: 'in_list', value: ['major', 'critical'] }],
    actions: [{ type: 'send_in_app_notification', config: { to: 'manager', message: 'ליקוי {{severity}} חדש: {{title}}' }}]
  },
  
  // משימה באיחור
  {
    name: 'משימה באיחור - התראה',
    trigger: { type: 'scheduled', config: { schedule: { frequency: 'daily', time: '08:00' }}},
    // Logic: מצא כל המשימות שה-dueDate עבר והסטטוס לא completed
    actions: [
      { type: 'send_in_app_notification', config: { to: 'assigned_user', message: 'משימה באיחור: {{task.title}}' }},
      { type: 'update_field', config: { fieldName: 'priority', fieldValue: 'urgent' }}
    ]
  },
  
  // פגישה מחר - תזכורת
  {
    name: 'פגישה מחר - תזכורת',
    trigger: { type: 'relative_date', config: { entityType: 'meeting', dateField: 'startTime', daysBefore: 1, time: '18:00' }},
    actions: [
      { type: 'send_email', config: { to: 'client', templateId: 'meeting_reminder' }},
      { type: 'send_in_app_notification', config: { to: 'assigned_user', message: 'פגישה מחר: {{meeting.title}}' }}
    ]
  },
  
  // סיום פרויקט - סקר שביעות רצון
  {
    name: 'פרויקט הסתיים - שלח סקר',
    trigger: { type: 'status_changed', config: { entityType: 'project', toStatusId: 'completed' }},
    actions: [
      { type: 'delay', config: { delayMinutes: 1440 }},  // יום אחד
      { type: 'send_email', config: { to: 'client', templateId: 'satisfaction_survey' }}
    ]
  }
];
```

---

## Placeholders (Template Variables)

```typescript
// משתנים זמינים בתבניות
const PLACEHOLDER_VARIABLES = {
  // Project
  'project.name': 'שם הפרויקט',
  'project.code': 'קוד פרויקט',
  'project.address': 'כתובת',
  'project.budget': 'תקציב',
  'project.phase': 'שלב נוכחי',
  
  // Client
  'client.name': 'שם הלקוח',
  'client.email': 'מייל',
  'client.phone': 'טלפון',
  
  // Task
  'task.title': 'כותרת משימה',
  'task.dueDate': 'תאריך יעד',
  'task.assignee': 'מבצע',
  
  // Payment
  'payment.name': 'שם התשלום',
  'payment.amount': 'סכום',
  'payment.dueDate': 'תאריך יעד',
  'payment.status': 'סטטוס',
  
  // Product
  'product.name': 'שם המוצר',
  'product.supplier': 'ספק',
  'product.price': 'מחיר',
  
  // User
  'user.name': 'שם המשתמש',
  'user.email': 'מייל',
  
  // Tenant
  'tenant.name': 'שם המשרד',
  'tenant.phone': 'טלפון משרד',
  
  // System
  'today': 'תאריך היום',
  'now': 'תאריך ושעה',
  'link': 'קישור לישות',
};
```

---

## UI לבניית אוטומציה

```typescript
// ממשק Visual Builder
interface AutomationBuilder {
  // שלב 1: בחירת Trigger
  triggerSelector: {
    categories: ['אירוע', 'תזמון', 'ידני'];
    // בחירת entityType
    // בחירת event type
    // הגדרת פרמטרים
  };
  
  // שלב 2: הוספת Conditions (אופציונלי)
  conditionBuilder: {
    // בחירת field
    // בחירת operator
    // הזנת value
    // + Add Condition
  };
  
  // שלב 3: הגדרת Actions
  actionBuilder: {
    // בחירת action type
    // הגדרת פרמטרים
    // Drag & Drop לשינוי סדר
    // + Add Action
  };
  
  // שלב 4: Test & Preview
  testPanel: {
    // בחירת entity לבדיקה
    // הרצת dry-run
    // הצגת תוצאה צפויה
  };
  
  // שלב 5: שמירה
  saveOptions: {
    name: string;
    description: string;
    isEnabled: boolean;
  };
}
```

---

## הנחיות למימוש

1. **Queue-based execution:**
   - אוטומציות רצות ב-background job queue (BullMQ)
   - לא לחסום את ה-request
   - retry אוטומטי על כישלון

2. **Idempotency:**
   - כל action צריך להיות idempotent
   - לא לשלוח מייל פעמיים אם retry

3. **Rate Limiting:**
   - מקסימום 100 הרצות ליום לכל rule
   - cooldown מינימלי 1 דקה בין הרצות

4. **Logging:**
   - לוג מלא של כל הרצה
   - שמירת input/output לכל action
   - שמירת שגיאות

5. **Testing:**
   - יכולת dry-run בלי לבצע בפועל
   - preview של התוצאה הצפויה

6. **Permissions:**
   - רק Owner/Manager יכולים ליצור אוטומציות
   - אוטומציות רצות עם הרשאות system
# מסמך אפיון - חלק כ
## Integration Hub - מרכז אינטגרציות

---

# כב. מרכז אינטגרציות

## עקרון מנחה

מערכת אינטגרציות גנרית שמאפשרת:
1. **OAuth Connections** - חיבור לשירותים חיצוניים
2. **Data Sync** - סנכרון נתונים דו-כיווני
3. **Webhooks** - קבלה ושליחה של אירועים
4. **Field Mapping** - מיפוי שדות בין מערכות

---

## ישויות Integration

### Integration - חיבור לשירות

```typescript
interface Integration {
  id: string;
  tenantId: string;
  
  // מזהה השירות
  provider: IntegrationProvider;
  
  // שם מותאם
  name: string;
  description?: string;
  
  // סטטוס
  status: 'disconnected' | 'connected' | 'error' | 'expired';
  
  // OAuth
  oauth?: {
    accessToken: string;           // מוצפן
    refreshToken?: string;         // מוצפן
    tokenExpiresAt?: Date;
    scopes: string[];
  };
  
  // API Key (לשירותים שלא תומכים OAuth)
  apiKey?: string;                 // מוצפן
  
  // Webhook URL (אם רלוונטי)
  webhookUrl?: string;
  webhookSecret?: string;
  
  // הגדרות סנכרון
  syncSettings: IntegrationSyncSettings;
  
  // סטטיסטיקות
  lastSyncAt?: Date;
  lastSyncStatus?: 'success' | 'partial' | 'failed';
  lastError?: string;
  totalSyncs: number;
  
  // מטא
  createdAt: Date;
  updatedAt: Date;
  connectedBy: string;
}

type IntegrationProvider =
  // Calendar
  | 'google_calendar'
  | 'outlook_calendar'
  | 'apple_calendar'
  
  // Storage
  | 'google_drive'
  | 'dropbox'
  | 'onedrive'
  
  // Accounting
  | 'quickbooks'
  | 'xero'
  | 'hashavshevet'              // חשבשבת
  | 'priority'                   // פריוריטי
  
  // Communication
  | 'whatsapp_business'
  | 'twilio'
  | 'sendgrid'
  | 'mailchimp'
  
  // Payments
  | 'stripe'
  | 'payplus'
  | 'cardcom'
  
  // Design Tools
  | 'canva'
  | 'figma'
  
  // CRM
  | 'hubspot'
  | 'monday'
  
  // Custom
  | 'custom_webhook'
  | 'custom_api';

interface IntegrationSyncSettings {
  // האם סנכרון מופעל
  enabled: boolean;
  
  // כיוון
  direction: 'import' | 'export' | 'bidirectional';
  
  // תדירות
  frequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  
  // מה לסנכרן
  entities: IntegrationEntitySync[];
  
  // מיפוי שדות
  fieldMappings: IntegrationFieldMapping[];
  
  // פילטרים
  filters?: IntegrationFilter[];
}

interface IntegrationEntitySync {
  localEntity: string;            // 'meeting', 'payment', 'document'
  remoteEntity: string;           // 'event', 'invoice', 'file'
  enabled: boolean;
  direction: 'import' | 'export' | 'bidirectional';
}

interface IntegrationFieldMapping {
  localEntity: string;
  localField: string;
  remoteField: string;
  
  // טרנספורמציה
  transform?: 'none' | 'date_format' | 'currency_convert' | 'custom';
  transformConfig?: any;
  
  // ברירת מחדל אם ריק
  defaultValue?: any;
}

interface IntegrationFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in_list';
  value: any;
}
```

### IntegrationLog - היסטוריית סנכרון

```typescript
interface IntegrationLog {
  id: string;
  tenantId: string;
  integrationId: string;
  
  // סוג פעולה
  action: 'sync' | 'import' | 'export' | 'webhook_received' | 'webhook_sent';
  
  // כיוון
  direction: 'incoming' | 'outgoing';
  
  // תוצאה
  status: 'success' | 'partial' | 'failed';
  
  // פירוט
  summary: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  
  // פריטים שנכשלו
  failedItems?: {
    entityId: string;
    entityName: string;
    error: string;
  }[];
  
  // שגיאה כללית
  errorMessage?: string;
  errorCode?: string;
  
  // זמנים
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  
  // Request/Response (לדיבוג)
  requestSnapshot?: any;
  responseSnapshot?: any;
}
```

---

## אינטגרציות ספציפיות

### Google Calendar

```typescript
interface GoogleCalendarIntegration {
  provider: 'google_calendar';
  
  syncSettings: {
    // איזה calendars לסנכרן
    calendars: {
      calendarId: string;
      calendarName: string;
      color: string;
      syncEnabled: boolean;
    }[];
    
    // מה לסנכרן
    syncMeetings: boolean;            // Meeting → Calendar Event
    syncTasks: boolean;               // Task with dueDate → Calendar Event
    syncDeliveries: boolean;          // Expected deliveries → Calendar Event
    
    // כיוון
    direction: 'bidirectional';
    
    // יצירה אוטומטית
    autoCreateEvents: boolean;        // כשנוצרת פגישה במערכת
    autoCreateMeetings: boolean;      // כשנוצר אירוע בקלנדר
  };
}

// מיפוי שדות Meeting ↔ Calendar Event
const GOOGLE_CALENDAR_MAPPING = {
  'meeting.title': 'event.summary',
  'meeting.description': 'event.description',
  'meeting.startTime': 'event.start.dateTime',
  'meeting.endTime': 'event.end.dateTime',
  'meeting.location': 'event.location',
  'meeting.attendees': 'event.attendees',
};
```

### Google Drive

```typescript
interface GoogleDriveIntegration {
  provider: 'google_drive';
  
  syncSettings: {
    // תיקיית בסיס
    rootFolderId: string;
    rootFolderName: string;
    
    // מבנה תיקיות
    folderStructure: 'flat' | 'by_project' | 'by_client';
    
    // מה לסנכרן
    syncDocuments: boolean;
    syncProposals: boolean;
    syncContracts: boolean;
    syncPhotos: boolean;
    
    // כיוון
    direction: 'bidirectional';
    
    // אוטומטי
    autoUploadDocuments: boolean;
    autoImportFromFolder: boolean;
  };
}
```

### QuickBooks / Accounting

```typescript
interface AccountingIntegration {
  provider: 'quickbooks' | 'xero' | 'hashavshevet';
  
  syncSettings: {
    // מה לסנכרן
    syncClients: boolean;             // Client → Customer
    syncSuppliers: boolean;           // Supplier → Vendor
    syncPayments: boolean;            // Payment → Invoice
    syncExpenses: boolean;            // Expense → Bill/Expense
    
    // הגדרות חשבוניות
    invoiceSettings: {
      autoCreateInvoice: boolean;     // כשתשלום מסומן invoiced
      invoicePrefix: string;
      defaultPaymentTerms: number;
      defaultTaxRate: number;
      defaultAccount: string;
    };
    
    // מיפוי חשבונות
    accountMappings: {
      revenue: string;                // חשבון הכנסות
      expenses: string;               // חשבון הוצאות
      retainer: string;               // חשבון מקדמות
    };
  };
}
```

### WhatsApp Business

```typescript
interface WhatsAppIntegration {
  provider: 'whatsapp_business';
  
  config: {
    phoneNumberId: string;
    businessAccountId: string;
    accessToken: string;              // מוצפן
    
    // תבניות מאושרות
    approvedTemplates: {
      templateName: string;
      templateId: string;
      language: string;
      category: string;
    }[];
  };
  
  syncSettings: {
    // התראות אוטומטיות
    sendPaymentReminders: boolean;
    sendMeetingReminders: boolean;
    sendDeliveryUpdates: boolean;
    
    // לוג שיחות
    logIncomingMessages: boolean;
    logOutgoingMessages: boolean;
  };
}
```

### Stripe / PayPlus (תשלומים)

```typescript
interface PaymentProviderIntegration {
  provider: 'stripe' | 'payplus' | 'cardcom';
  
  config: {
    apiKey: string;                   // מוצפן
    webhookSecret: string;            // מוצפן
    
    // הגדרות
    currency: string;
    allowPartialPayments: boolean;
    
    // עמלות
    feePercent: number;
    feeFixed: number;
  };
  
  syncSettings: {
    // אוטומטי
    autoUpdatePaymentStatus: boolean;
    autoRecordTransaction: boolean;
    
    // התראות
    notifyOnPayment: boolean;
    notifyOnFailure: boolean;
  };
}
```

---

## Webhooks - נכנסים ויוצאים

### Incoming Webhooks

```typescript
interface IncomingWebhook {
  id: string;
  tenantId: string;
  
  // מזהה ייחודי
  name: string;
  description?: string;
  
  // URL לקבלת webhooks
  url: string;                        // /api/webhooks/tenant/:tenantId/:webhookId
  secret: string;                     // לאימות HMAC
  
  // מה לעשות כשמקבלים
  actions: WebhookAction[];
  
  // פילטרים (אופציונלי)
  filters?: {
    headers?: Record<string, string>;
    bodyPath?: string;
    bodyValue?: any;
  };
  
  // סטטיסטיקות
  lastReceivedAt?: Date;
  totalReceived: number;
  
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WebhookAction {
  type: 'create_entity' | 'update_entity' | 'trigger_automation' | 'forward';
  config: any;
}
```

### Outgoing Webhooks

```typescript
interface OutgoingWebhook {
  id: string;
  tenantId: string;
  
  // מזהה
  name: string;
  description?: string;
  
  // לאן לשלוח
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  
  // מתי לשלוח
  triggers: {
    entityType: string;
    events: ('created' | 'updated' | 'deleted' | 'status_changed')[];
  }[];
  
  // מה לשלוח
  payloadTemplate?: string;           // JSON עם placeholders, או null = שליחת הישות כמות שהיא
  
  // אבטחה
  signRequests: boolean;
  signatureHeader: string;
  signatureSecret: string;
  
  // Retry
  retryAttempts: number;
  retryDelaySeconds: number;
  
  // סטטיסטיקות
  lastSentAt?: Date;
  lastStatus?: 'success' | 'failed';
  totalSent: number;
  totalFailed: number;
  
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### WebhookLog

```typescript
interface WebhookLog {
  id: string;
  tenantId: string;
  webhookId: string;
  
  direction: 'incoming' | 'outgoing';
  
  // Request
  method: string;
  url: string;
  headers: Record<string, string>;
  body: any;
  
  // Response (לoutgoing)
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  
  // תוצאה
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  
  // Retry info
  attempt: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  
  // זמנים
  timestamp: Date;
  durationMs?: number;
}
```

---

## API לאינטגרציות

### OAuth Flow

```typescript
// 1. התחלת חיבור
GET /api/integrations/connect/:provider
// → Redirect to provider OAuth screen

// 2. Callback
GET /api/integrations/callback/:provider?code=xxx&state=xxx
// → Exchange code for tokens
// → Create Integration record
// → Redirect to settings page

// 3. Refresh Token (אוטומטי)
POST /api/integrations/:id/refresh
// → Get new access token

// 4. Disconnect
DELETE /api/integrations/:id
// → Revoke tokens
// → Delete Integration record
```

### Sync API

```typescript
// Manual sync
POST /api/integrations/:id/sync
// → Trigger immediate sync

// Sync status
GET /api/integrations/:id/status
// → Return last sync info, next scheduled sync

// Sync history
GET /api/integrations/:id/logs
// → Return paginated sync logs
```

### Webhook API

```typescript
// Incoming webhook endpoint
POST /api/webhooks/tenant/:tenantId/:webhookId
// → Validate signature
// → Process payload
// → Execute actions

// Test webhook
POST /api/webhooks/:id/test
// → Send test payload
// → Return response
```

---

## UI לאינטגרציות

```typescript
// דף אינטגרציות ראשי
interface IntegrationsPage {
  // קטגוריות
  categories: [
    { id: 'calendar', name: 'יומן', icon: 'calendar' },
    { id: 'storage', name: 'אחסון קבצים', icon: 'folder' },
    { id: 'accounting', name: 'הנהלת חשבונות', icon: 'calculator' },
    { id: 'communication', name: 'תקשורת', icon: 'message' },
    { id: 'payments', name: 'תשלומים', icon: 'credit-card' },
    { id: 'webhooks', name: 'Webhooks', icon: 'webhook' },
  ];
  
  // לכל אינטגרציה
  integrationCard: {
    logo: string;
    name: string;
    description: string;
    status: 'connected' | 'disconnected' | 'error';
    lastSync?: Date;
    actions: ['connect' | 'disconnect' | 'settings' | 'sync'];
  };
}

// דף הגדרות אינטגרציה
interface IntegrationSettingsPage {
  // סטטוס חיבור
  connectionStatus: { ... };
  
  // הגדרות סנכרון
  syncSettings: { ... };
  
  // מיפוי שדות
  fieldMappings: { ... };
  
  // היסטוריית סנכרון
  syncHistory: { ... };
  
  // לוג שגיאות
  errorLog: { ... };
  
  // פעולות
  actions: ['sync_now', 'disconnect', 'test_connection'];
}
```

---

## הנחיות למימוש

1. **Token Security:**
   - כל tokens מוצפנים ב-DB (AES-256)
   - Refresh tokens אוטומטי לפני expiry
   - Revoke tokens בעת disconnect

2. **Rate Limiting:**
   - כיבוד rate limits של כל provider
   - Queue לבקשות אם יש throttling
   - Exponential backoff על errors

3. **Error Handling:**
   - Retry אוטומטי עם backoff
   - התראה למשתמש על כישלון מתמשך
   - לוג מפורט לכל שגיאה

4. **Data Mapping:**
   - Validation על data לפני sync
   - Conflict resolution (last write wins / prompt user)
   - Audit trail של שינויים

5. **Sync Strategy:**
   - Incremental sync (רק שינויים)
   - Full sync אופציונלי
   - Delta tracking עם timestamps

6. **Multi-tenant:**
   - כל integration משויכת ל-tenant
   - Isolation מלא בין tenants
   - API keys/tokens per tenant
# מסמך אפיון - חלק כא
## Search & Navigation - חיפוש וניווט

---

# כג. חיפוש גלובלי

## Command Palette (Cmd+K / Ctrl+K)

חיפוש מרכזי שמאפשר גישה מהירה לכל דבר במערכת.

### GlobalSearch Entity

```typescript
interface SearchResult {
  id: string;
  
  // סוג
  entityType: SearchableEntity;
  entityId: string;
  
  // תצוגה
  title: string;
  subtitle?: string;
  description?: string;
  
  // מטא
  icon: string;
  color?: string;
  avatar?: string;
  
  // קישור
  url: string;
  
  // רלוונטיות
  score: number;
  matchedFields: string[];
  
  // הקשר
  projectId?: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
}

type SearchableEntity = 
  | 'project'
  | 'client'
  | 'supplier'
  | 'professional'
  | 'task'
  | 'product'
  | 'document'
  | 'proposal'
  | 'contract'
  | 'meeting'
  | 'payment'
  | 'room'
  | 'moodboard'
  | 'purchase_order'
  | 'change_order'
  | 'snag_item';
```

### SearchIndex - אינדקס חיפוש

```typescript
interface SearchIndex {
  id: string;
  tenantId: string;
  
  entityType: string;
  entityId: string;
  
  // שדות לחיפוש (מאונדקסים)
  searchableText: string;           // כל הטקסט משורשר
  
  // שדות מובנים
  title: string;
  subtitle?: string;
  
  // מטא לסינון
  projectId?: string;
  clientId?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Boost factors
  importance: number;               // 1-10, לפי סוג ישות
}

// מה נכנס ל-searchableText לכל ישות
const SEARCH_FIELDS = {
  project: ['name', 'code', 'address', 'client.name', 'description'],
  client: ['name', 'email', 'phone', 'companyName', 'contactPerson'],
  supplier: ['name', 'email', 'phone', 'contactPerson', 'companyNumber'],
  task: ['title', 'description', 'project.name', 'assignee.name'],
  product: ['name', 'sku', 'description', 'supplier.name', 'category'],
  document: ['name', 'project.name', 'category'],
  proposal: ['title', 'proposalNumber', 'client.name'],
  // ...
};
```

### Search API

```typescript
// חיפוש גלובלי
interface GlobalSearchRequest {
  query: string;
  
  // פילטרים אופציונליים
  filters?: {
    entityTypes?: SearchableEntity[];
    projectId?: string;
    clientId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
  
  // Pagination
  limit?: number;                   // default 20
  offset?: number;
}

interface GlobalSearchResponse {
  results: SearchResult[];
  total: number;
  
  // קיבוץ לפי סוג
  grouped: {
    entityType: string;
    count: number;
    topResults: SearchResult[];
  }[];
  
  // הצעות
  suggestions?: string[];
  
  // זמן חיפוש
  took: number;
}

// API Endpoints
GET /api/search?q=:query&types=:types&limit=:limit
GET /api/search/suggestions?q=:query
```

### Quick Actions

בנוסף לתוצאות חיפוש, Command Palette מציע פעולות מהירות:

```typescript
interface QuickAction {
  id: string;
  
  // תצוגה
  title: string;
  subtitle?: string;
  icon: string;
  
  // קיצור מקלדת
  shortcut?: string;
  
  // סוג פעולה
  type: 'navigation' | 'create' | 'action';
  
  // יעד
  url?: string;                     // navigation
  createEntity?: string;            // create
  actionFn?: string;                // action
  
  // הרשאות
  requiredPermission?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  // ניווט
  { id: 'go-dashboard', title: 'לוח בקרה', icon: 'home', type: 'navigation', url: '/dashboard', shortcut: 'G D' },
  { id: 'go-projects', title: 'פרויקטים', icon: 'folder', type: 'navigation', url: '/projects', shortcut: 'G P' },
  { id: 'go-calendar', title: 'יומן', icon: 'calendar', type: 'navigation', url: '/calendar', shortcut: 'G C' },
  { id: 'go-contacts', title: 'אנשי קשר', icon: 'users', type: 'navigation', url: '/contacts', shortcut: 'G O' },
  { id: 'go-settings', title: 'הגדרות', icon: 'settings', type: 'navigation', url: '/settings', shortcut: 'G S' },
  
  // יצירה
  { id: 'create-project', title: 'פרויקט חדש', icon: 'plus', type: 'create', createEntity: 'project', shortcut: 'C P' },
  { id: 'create-task', title: 'משימה חדשה', icon: 'plus', type: 'create', createEntity: 'task', shortcut: 'C T' },
  { id: 'create-client', title: 'לקוח חדש', icon: 'plus', type: 'create', createEntity: 'client', shortcut: 'C C' },
  { id: 'create-meeting', title: 'פגישה חדשה', icon: 'plus', type: 'create', createEntity: 'meeting', shortcut: 'C M' },
  
  // פעולות
  { id: 'action-log-time', title: 'רישום שעות', icon: 'clock', type: 'action', actionFn: 'openTimeEntry' },
  { id: 'action-upload', title: 'העלאת קובץ', icon: 'upload', type: 'action', actionFn: 'openUpload' },
];
```

---

# כד. Recent Items & Favorites

### RecentItem - פריטים אחרונים

```typescript
interface RecentItem {
  id: string;
  tenantId: string;
  userId: string;
  
  entityType: string;
  entityId: string;
  
  // תצוגה (cached)
  title: string;
  subtitle?: string;
  icon: string;
  url: string;
  
  // מטא
  lastAccessedAt: Date;
  accessCount: number;
  
  // סוג גישה
  accessType: 'view' | 'edit';
}

// שמירת עד 50 פריטים אחרונים לכל משתמש
// FIFO - הישן יוצא כשנכנס חדש
```

### Favorite - מועדפים

```typescript
interface Favorite {
  id: string visning;
  tenantId: string;
  userId: string;
  
  entityType: string;
  entityId: string;
  
  // תצוגה (cached)
  title: string;
  subtitle?: string;
  icon: string;
  url: string;
  
  // סדר
  order: number;
  
  // קיבוץ (אופציונלי)
  groupName?: string;
  
  createdAt: Date;
}
```

### API

```typescript
// Recent
GET /api/recent
// → List of recent items (last 20)

POST /api/recent
// Body: { entityType, entityId }
// → Track access

// Favorites
GET /api/favorites
POST /api/favorites
DELETE /api/favorites/:id
PATCH /api/favorites/reorder
// Body: { ids: [...] }
```

---

# כה. Filters & Sorting

## מודל סינון גנרי

```typescript
interface FilterConfig {
  // שדה לסנן
  field: string;
  
  // אופרטור
  operator: FilterOperator;
  
  // ערך
  value: any;
}

type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'is_null'
  | 'is_not_null'
  | 'date_equals'
  | 'date_before'
  | 'date_after'
  | 'date_between'
  | 'this_week'
  | 'this_month'
  | 'last_7_days'
  | 'last_30_days';

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// URL Query String format:
// ?filter[status]=active&filter[clientId]=123&sort=-createdAt
// filter[field]=value
// sort=field (asc) or sort=-field (desc)
```

## Saved Filters (Views)

```typescript
interface SavedFilter {
  id: string;
  tenantId: string;
  userId?: string;                  // null = shared view
  
  // מזהה
  name: string;
  icon?: string;
  color?: string;
  
  // על מה
  entityType: string;
  
  // הגדרות
  filters: FilterConfig[];
  sort?: SortConfig;
  columns?: string[];               // אילו עמודות להציג
  
  // האם ברירת מחדל
  isDefault: boolean;
  
  // שיתוף
  isShared: boolean;
  
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// דוגמאות Saved Views למשימות:
const DEFAULT_TASK_VIEWS = [
  { name: 'המשימות שלי', filters: [{ field: 'assignedTo', operator: 'equals', value: '{{currentUserId}}' }] },
  { name: 'לביצוע היום', filters: [{ field: 'dueDate', operator: 'date_equals', value: '{{today}}' }] },
  { name: 'באיחור', filters: [{ field: 'dueDate', operator: 'date_before', value: '{{today}}' }, { field: 'status', operator: 'not_equals', value: 'completed' }] },
  { name: 'ללא תאריך', filters: [{ field: 'dueDate', operator: 'is_null', value: null }] },
];
```

---

# כו. Breadcrumbs & Context

### Breadcrumb Navigation

```typescript
interface Breadcrumb {
  label: string;
  url?: string;                     // null = current page
  icon?: string;
}

// דוגמאות:
// Dashboard
// [לוח בקרה]

// Project
// [פרויקטים] > [וילה כהן]

// Task in Project
// [פרויקטים] > [וילה כהן] > [משימות] > [הזמנת ריהוט]

// Room Product
// [פרויקטים] > [וילה כהן] > [סלון] > [ספה תלת]

// Client
// [אנשי קשר] > [לקוחות] > [משפחת כהן]
```

### Context Switching

```typescript
interface NavigationContext {
  // פרויקט נוכחי (אם רלוונטי)
  currentProject?: {
    id: string;
    name: string;
    code: string;
  };
  
  // לקוח נוכחי (אם רלוונטי)
  currentClient?: {
    id: string;
    name: string;
  };
  
  // מאיפה הגענו
  referrer?: {
    url: string;
    label: string;
  };
}

// שמירה ב-URL או State
// /projects/123/tasks?context=room:456
```

---

# כז. Keyboard Navigation

### Global Shortcuts

```typescript
const KEYBOARD_SHORTCUTS = {
  // Command Palette
  'Cmd+K': 'openCommandPalette',
  'Ctrl+K': 'openCommandPalette',
  '/': 'focusSearch',
  
  // Navigation
  'G D': 'goToDashboard',
  'G P': 'goToProjects',
  'G C': 'goToCalendar',
  'G O': 'goToContacts',
  'G S': 'goToSettings',
  
  // Create
  'C P': 'createProject',
  'C T': 'createTask',
  'C C': 'createClient',
  'C M': 'createMeeting',
  
  // Actions
  'Cmd+S': 'save',
  'Ctrl+S': 'save',
  'Cmd+Enter': 'submitForm',
  'Escape': 'closeModal',
  'Cmd+Z': 'undo',
  'Cmd+Shift+Z': 'redo',
  
  // Table/List
  'J': 'nextItem',
  'K': 'previousItem',
  'Enter': 'openItem',
  'E': 'editItem',
  'D': 'deleteItem',
  'Space': 'toggleSelect',
  'Cmd+A': 'selectAll',
  
  // Panels
  'Tab': 'nextPanel',
  'Shift+Tab': 'previousPanel',
  '[': 'collapseSidebar',
  ']': 'expandSidebar',
};
```

### Shortcut Help Modal

```typescript
// Cmd+? או ? מציג modal עם כל הקיצורים
interface ShortcutHelpModal {
  categories: {
    name: string;
    shortcuts: {
      keys: string;
      description: string;
    }[];
  }[];
}
```

---

## הנחיות UI

### Command Palette Design

```typescript
interface CommandPaletteUI {
  // Trigger
  trigger: {
    shortcut: 'Cmd+K';
    button: true;                   // כפתור בheader
  };
  
  // Modal
  modal: {
    width: '600px';
    maxHeight: '400px';
    position: 'top-center';
    backdrop: 'blur';
  };
  
  // Search Input
  input: {
    placeholder: 'חפש או הקלד פקודה...';
    autoFocus: true;
    clearOnEscape: true;
  };
  
  // Results
  results: {
    groupByType: true;
    maxPerGroup: 5;
    showMoreLink: true;
    highlightMatch: true;
    keyboardNavigation: true;
  };
  
  // Footer
  footer: {
    showShortcuts: ['↑↓ לניווט', 'Enter לבחירה', 'Esc לסגירה'];
  };
}
```

### Search Performance

```typescript
// הנחיות ביצועים
const SEARCH_PERFORMANCE = {
  // Debounce
  debounceMs: 150,
  
  // מינימום תווים
  minChars: 2,
  
  // Cache
  cacheResults: true,
  cacheTTL: 60000,                  // דקה
  
  // Indexing
  indexStrategy: 'trigram',         // לחיפוש fuzzy
  updateIndexOn: 'write',           // עדכון אינדקס בכל כתיבה
  
  // Limits
  maxResults: 100,
  defaultLimit: 20,
};
```

---

## הנחיות למימוש

1. **Search Index:**
   - PostgreSQL full-text search או Elasticsearch
   - עדכון אינדקס אסינכרוני (לא לחסום writes)
   - Trigram index לחיפוש fuzzy בעברית

2. **Performance:**
   - Debounce על input (150ms)
   - Cache results (1 דקה)
   - Prefetch popular searches

3. **UX:**
   - תוצאות מיידיות (optimistic)
   - Highlight של ה-match
   - Keyboard navigation מלא
   - Recent searches

4. **Accessibility:**
   - ARIA labels
   - Focus management
   - Screen reader support
# מסמך אפיון - חלק כב (המשך)
## Reports & Analytics - דוחות ואנליטיקס

---

### דוחות פרויקט (המשך)

```typescript
const PROJECT_REPORTS = [
  {
    id: 'project_status',
    name: 'סטטוס פרויקט',
    description: 'סקירה מקיפה של פרויקט בודד',
    parameters: ['project'],
    sections: [
      { type: 'header', config: { content: 'דוח סטטוס: {{project.name}}' }},
      { type: 'summary', metrics: ['phase', 'progress', 'budget_used', 'days_remaining'] },
      { type: 'table', title: 'משימות פתוחות', entityType: 'task' },
      { type: 'table', title: 'תשלומים', entityType: 'payment' },
      { type: 'table', title: 'FF&E Status', entityType: 'room_product' },
    ]
  },
  {
    id: 'project_timeline',
    name: 'ציר זמן פרויקט',
    description: 'התקדמות פרויקט לאורך זמן',
    parameters: ['project'],
    sections: [
      { type: 'chart', chartType: 'gantt', title: 'ציר זמן' },
      { type: 'table', title: 'אבני דרך', entityType: 'milestone' },
    ]
  },
  {
    id: 'all_projects_overview',
    name: 'סקירת כל הפרויקטים',
    description: 'מבט על כל הפרויקטים הפעילים',
    parameters: ['date_range', 'status'],
    sections: [
      { type: 'summary', metrics: ['total_projects', 'active', 'on_track', 'at_risk', 'delayed'] },
      { type: 'table', columns: ['name', 'client', 'phase', 'progress', 'budget', 'endDate', 'status'] },
    ]
  },
];
```

### דוחות זמן

```typescript
const TIME_REPORTS = [
  {
    id: 'timesheet',
    name: 'דוח שעות',
    description: 'שעות עבודה לפי משתמש ופרויקט',
    parameters: ['date_range', 'user', 'project'],
    sections: [
      { type: 'summary', metrics: ['total_hours', 'billable_hours', 'non_billable_hours', 'billable_amount'] },
      { type: 'chart', chartType: 'bar', title: 'שעות לפי יום' },
      { type: 'table', groupBy: 'project', columns: ['date', 'project', 'task', 'description', 'hours', 'billable'] },
    ]
  },
  {
    id: 'utilization',
    name: 'דוח ניצולת',
    description: 'ניצולת צוות',
    parameters: ['date_range'],
    sections: [
      { type: 'table', columns: ['user', 'capacity', 'logged', 'billable', 'utilization_percent'] },
      { type: 'chart', chartType: 'bar', title: 'ניצולת לפי עובד' },
    ]
  },
];
```

### דוחות רכש (FF&E)

```typescript
const PROCUREMENT_REPORTS = [
  {
    id: 'ff_e_schedule',
    name: 'לוח FF&E',
    description: 'כל המוצרים בפרויקט עם סטטוס',
    parameters: ['project', 'room', 'status'],
    sections: [
      { type: 'summary', metrics: ['total_products', 'approved', 'ordered', 'delivered', 'installed'] },
      { type: 'table', groupBy: 'room', columns: ['product', 'supplier', 'quantity', 'clientPrice', 'approvalStatus', 'procurementStatus', 'expectedDelivery'] },
    ]
  },
  {
    id: 'purchase_orders',
    name: 'דוח הזמנות רכש',
    description: 'כל הזמנות הרכש',
    parameters: ['date_range', 'supplier', 'status'],
    sections: [
      { type: 'summary', metrics: ['total_orders', 'total_value', 'pending', 'delivered'] },
      { type: 'table', columns: ['orderNumber', 'supplier', 'project', 'orderDate', 'total', 'status', 'expectedDelivery'] },
    ]
  },
  {
    id: 'delivery_tracking',
    name: 'מעקב משלוחים',
    description: 'משלוחים צפויים ובאיחור',
    parameters: ['date_range'],
    sections: [
      { type: 'summary', metrics: ['expected_this_week', 'expected_this_month', 'delayed', 'delivered'] },
      { type: 'table', columns: ['product', 'supplier', 'project', 'expectedDate', 'status', 'daysDelayed'] },
    ]
  },
];
```

### דוחות לקוחות

```typescript
const CLIENT_REPORTS = [
  {
    id: 'client_summary',
    name: 'סיכום לקוח',
    description: 'כל המידע על לקוח',
    parameters: ['client'],
    sections: [
      { type: 'header', config: { content: 'לקוח: {{client.name}}' }},
      { type: 'summary', metrics: ['total_projects', 'active_projects', 'total_revenue', 'outstanding'] },
      { type: 'table', title: 'פרויקטים', entityType: 'project' },
      { type: 'table', title: 'תשלומים', entityType: 'payment' },
      { type: 'text', config: { content: 'הערות: {{client.notes}}' }},
    ]
  },
  {
    id: 'client_aging',
    name: 'גיול חובות לקוחות',
    description: 'חובות לקוחות לפי גיל החוב',
    parameters: ['date_range'],
    sections: [
      { type: 'summary', metrics: ['total_outstanding', 'current', '30_days', '60_days', '90_plus'] },
      { type: 'table', columns: ['client', 'current', '1_30', '31_60', '61_90', '90_plus', 'total'] },
    ]
  },
];
```

---

## Report Builder - בניית דוחות מותאמים

```typescript
interface ReportBuilder {
  // שלב 1: בחירת סוג
  step1_type: {
    options: ['table', 'summary', 'chart', 'combined'];
  };
  
  // שלב 2: בחירת מקור נתונים
  step2_source: {
    entityType: EntityType;
    relationshipsToInclude: string[];
  };
  
  // שלב 3: בחירת שדות/עמודות
  step3_fields: {
    availableFields: FieldDefinition[];
    selectedFields: string[];
    fieldOrder: string[];
  };
  
  // שלב 4: פילטרים
  step4_filters: {
    filters: FilterConfig[];
    parameters: ReportParameter[];     // פילטרים שהמשתמש יבחר בהרצה
  };
  
  // שלב 5: מיון וקיבוץ
  step5_grouping: {
    groupBy?: string;
    subGroupBy?: string;
    sortBy: SortConfig[];
    showSubtotals: boolean;
    showGrandTotal: boolean;
  };
  
  // שלב 6: עיצוב
  step6_styling: {
    title: string;
    description?: string;
    logo: boolean;
    pageOrientation: 'portrait' | 'landscape';
    headerFooter: boolean;
  };
  
  // שלב 7: שמירה ותזמון
  step7_save: {
    name: string;
    category: string;
    schedule?: ScheduleConfig;
    outputFormats: string[];
  };
}
```

---

## Export - ייצוא דוחות

### PDF Export

```typescript
interface PDFExportConfig {
  // מידות
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };
  
  // Header
  header: {
    showLogo: boolean;
    logoUrl?: string;
    title: string;
    subtitle?: string;
    showDate: boolean;
    showPageNumbers: boolean;
  };
  
  // Footer
  footer: {
    text?: string;
    showPageNumbers: boolean;
  };
  
  // עיצוב
  styling: {
    primaryColor: string;
    fontFamily: string;
    fontSize: number;
  };
  
  // אבטחה
  security?: {
    password?: string;
    allowPrinting: boolean;
    allowCopying: boolean;
  };
}
```

### Excel Export

```typescript
interface ExcelExportConfig {
  // שם קובץ
  fileName: string;
  
  // גליונות
  sheets: {
    name: string;
    data: any[];
    columns: ExcelColumn[];
  }[];
  
  // עיצוב
  styling: {
    headerStyle: ExcelStyle;
    dataStyle: ExcelStyle;
    alternateRowColor?: string;
  };
  
  // פיצ'רים
  features: {
    autoFilter: boolean;
    freezeHeader: boolean;
    autoWidth: boolean;
    formulas: boolean;
  };
}

interface ExcelColumn {
  field: string;
  header: string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'date' | 'percentage';
  formula?: string;
}

interface ExcelStyle {
  backgroundColor?: string;
  fontColor?: string;
  fontBold?: boolean;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right';
  border?: boolean;
}
```

---

## Analytics Dashboard

### Widget Library

```typescript
const WIDGET_LIBRARY = {
  // Stat Cards
  'active_projects_count': {
    type: 'stat_card',
    name: 'פרויקטים פעילים',
    metric: 'active_projects',
    icon: 'folder',
    color: 'blue',
  },
  'pending_payments_amount': {
    type: 'stat_card',
    name: 'ממתין לתשלום',
    metric: 'pending_payments',
    format: 'currency',
    icon: 'dollar',
    color: 'orange',
  },
  'overdue_tasks_count': {
    type: 'stat_card',
    name: 'משימות באיחור',
    metric: 'overdue_tasks',
    icon: 'alert',
    color: 'red',
  },
  
  // Lists
  'my_tasks': {
    type: 'task_list',
    name: 'המשימות שלי',
    filters: [{ field: 'assignedTo', value: '{{currentUser}}' }],
    limit: 10,
  },
  'upcoming_meetings': {
    type: 'upcoming_meetings',
    name: 'פגישות קרובות',
    daysAhead: 7,
    limit: 5,
  },
  'pending_approvals': {
    type: 'pending_approvals',
    name: 'ממתין לאישור',
    limit: 10,
  },
  'recent_activity': {
    type: 'recent_activity',
    name: 'פעילות אחרונה',
    limit: 15,
  },
  
  // Charts
  'revenue_trend': {
    type: 'line_chart',
    name: 'מגמת הכנסות',
    dataSource: 'payments',
    xAxis: 'month',
    yAxis: 'sum:paidAmount',
    period: 'last_12_months',
  },
  'projects_by_phase': {
    type: 'pie_chart',
    name: 'פרויקטים לפי שלב',
    dataSource: 'projects',
    groupBy: 'phase',
  },
  'team_utilization': {
    type: 'bar_chart',
    name: 'ניצולת צוות',
    dataSource: 'time_entries',
    xAxis: 'user',
    yAxis: 'sum:hours',
  },
};
```

### Dashboard Layouts

```typescript
interface DashboardLayout {
  id: string;
  tenantId: string;
  userId?: string;                  // null = default layout
  
  name: string;
  isDefault: boolean;
  
  // Grid configuration
  grid: {
    columns: number;                // 12
    rowHeight: number;              // 100px
    gap: number;                    // 16px
  };
  
  // Widgets placement
  widgets: {
    widgetId: string;
    x: number;                      // 0-11
    y: number;
    width: number;                  // 1-12
    height: number;                 // 1-6
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Default layouts
const DEFAULT_LAYOUTS = {
  'owner': {
    widgets: [
      { widgetId: 'revenue_trend', x: 0, y: 0, width: 8, height: 3 },
      { widgetId: 'pending_payments_amount', x: 8, y: 0, width: 4, height: 1 },
      { widgetId: 'active_projects_count', x: 8, y: 1, width: 4, height: 1 },
      { widgetId: 'team_utilization', x: 8, y: 2, width: 4, height: 1 },
      { widgetId: 'my_tasks', x: 0, y: 3, width: 6, height: 3 },
      { widgetId: 'recent_activity', x: 6, y: 3, width: 6, height: 3 },
    ]
  },
  'designer': {
    widgets: [
      { widgetId: 'my_tasks', x: 0, y: 0, width: 6, height: 4 },
      { widgetId: 'upcoming_meetings', x: 6, y: 0, width: 6, height: 2 },
      { widgetId: 'pending_approvals', x: 6, y: 2, width: 6, height: 2 },
      { widgetId: 'recent_activity', x: 0, y: 4, width: 12, height: 2 },
    ]
  },
};
```

---

## API Endpoints

```typescript
// Dashboard
GET /api/dashboard/widgets
GET /api/dashboard/widget/:id/data
PATCH /api/dashboard/layout

// Reports
GET /api/reports/templates
GET /api/reports/templates/:id
POST /api/reports/templates                    // Create custom report
POST /api/reports/generate/:templateId         // Generate report
GET /api/reports/generated/:id                 // Get generated report
GET /api/reports/generated/:id/download/:format

// Metrics
GET /api/metrics/:metricId?dateRange=...
GET /api/metrics/batch                         // Multiple metrics at once
POST /api/metrics/custom                       // Custom metric query

// Export
POST /api/export/pdf
POST /api/export/excel
POST /api/export/csv
```

---

## הנחיות למימוש

1. **Performance:**
   - Cache metric calculations (TTL based on data volatility)
   - Pre-calculate common metrics daily
   - Use materialized views for complex aggregations
   - Background job for heavy report generation

2. **Real-time Updates:**
   - Dashboard widgets refresh via WebSocket
   - Configurable refresh interval per widget
   - Manual refresh button

3. **Export:**
   - Generate in background for large reports
   - Send download link via email when ready
   - Clean up old generated files (7 days)

4. **Customization:**
   - Drag & drop widget placement
   - Resize widgets
   - Show/hide widgets
   - Save multiple layouts
# מסמך אפיון - חלק כג
## Templates System - מערכת תבניות

---

# כט. מערכת תבניות

## עקרון מנחה

כל דבר שחוזר על עצמו צריך להיות תבנית - פרויקטים, משימות, הצעות מחיר, חוזים, מיילים.

---

## סוגי תבניות

### 1. Project Templates - תבניות פרויקט

```typescript
interface ProjectTemplate {
  id: string;
  tenantId: string;
  
  // מזהה
  name: string;
  description?: string;
  
  // סיווג
  category?: string;                // "דירה", "וילה", "משרד"
  projectType?: string;
  
  // תמונה
  coverImage?: string;
  
  // הגדרות פרויקט
  defaults: {
    billingType?: string;
    markupPercent?: number;
    revisionsIncluded?: number;
  };
  
  // שלבים מותאמים (אם שונה מברירת מחדל)
  customPhases?: {
    name: string;
    color: string;
    order: number;
  }[];
  
  // חדרים
  rooms: {
    name: string;
    typeId?: string;
    order: number;
  }[];
  
  // משימות
  tasks: ProjectTemplateTask[];
  
  // מסמכים נדרשים
  requiredDocuments?: {
    name: string;
    category: string;
  }[];
  
  // תשלומים (מבנה)
  paymentStructure?: {
    name: string;
    type: string;
    percentageOfTotal?: number;
    triggerDescription?: string;
  }[];
  
  // סטטיסטיקות
  usageCount: number;
  lastUsedAt?: Date;
  
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ProjectTemplateTask {
  id: string;
  
  title: string;
  description?: string;
  
  // תזמון יחסי
  phase?: string;
  offsetDays?: number;              // X ימים מתחילת הפרויקט/שלב
  durationDays?: number;
  
  // הקצאה
  assignToRole?: string;            // "owner", "manager", "member"
  
  // תלויות
  dependsOn?: string[];             // IDs של משימות אחרות בתבנית
  
  // צ'קליסט
  checklist?: { text: string }[];
  
  priority: string;
  categoryId?: string;
  
  order: number;
}
```

### שימוש בתבנית פרויקט

```typescript
interface CreateProjectFromTemplate {
  templateId: string;
  
  // פרטי הפרויקט החדש
  name: string;
  clientId: string;
  startDate: Date;
  
  // מה לכלול
  includeRooms: boolean;
  includeTasks: boolean;
  includePaymentStructure: boolean;
  
  // התאמות
  overrides?: {
    rooms?: { templateRoomId: string; newName?: string; exclude?: boolean }[];
    tasks?: { templateTaskId: string; exclude?: boolean; assignTo?: string }[];
  };
}

// התוצאה: פרויקט חדש עם כל הישויות המשויכות
```

### תבניות מובנות

```typescript
const BUILT_IN_PROJECT_TEMPLATES = [
  {
    name: 'עיצוב דירה - סטנדרטי',
    category: 'דירה',
    rooms: [
      { name: 'סלון', order: 1 },
      { name: 'מטבח', order: 2 },
      { name: 'חדר שינה הורים', order: 3 },
      { name: 'חדר רחצה הורים', order: 4 },
      { name: 'חדר ילדים 1', order: 5 },
      { name: 'חדר רחצה ילדים', order: 6 },
    ],
    tasks: [
      { title: 'פגישת היכרות', phase: 'consultation', offsetDays: 0 },
      { title: 'סקר צרכים', phase: 'consultation', offsetDays: 3 },
      { title: 'מדידות באתר', phase: 'concept', offsetDays: 7 },
      { title: 'הכנת לוח השראה', phase: 'concept', offsetDays: 10 },
      { title: 'הצגת קונספט', phase: 'concept', offsetDays: 14 },
      { title: 'תכנון מפורט - סלון', phase: 'detailed', offsetDays: 21 },
      { title: 'תכנון מפורט - מטבח', phase: 'detailed', offsetDays: 28 },
      { title: 'בחירת ריהוט', phase: 'procurement', offsetDays: 35 },
      { title: 'הזמנות רכש', phase: 'procurement', offsetDays: 42 },
      { title: 'פיקוח התקנה', phase: 'installation', offsetDays: 60 },
      { title: 'ביקורת סיום', phase: 'handover', offsetDays: 75 },
    ],
    paymentStructure: [
      { name: 'מקדמה', type: 'retainer', percentageOfTotal: 30 },
      { name: 'אישור קונספט', type: 'milestone', percentageOfTotal: 30 },
      { name: 'לפני הזמנות', type: 'milestone', percentageOfTotal: 20 },
      { name: 'מסירה', type: 'final', percentageOfTotal: 20 },
    ],
  },
  {
    name: 'עיצוב וילה',
    category: 'וילה',
    // ... more rooms and tasks
  },
  {
    name: 'עיצוב משרד',
    category: 'מסחרי',
    // ...
  },
];
```

---

### 2. Task Templates - תבניות משימות (צ'קליסטים)

```typescript
interface TaskTemplate {
  id: string;
  tenantId: string;
  
  name: string;
  description?: string;
  category?: string;
  
  // המשימות
  tasks: {
    title: string;
    description?: string;
    checklist?: { text: string }[];
    priority: string;
    estimatedHours?: number;
    offsetDays?: number;
    order: number;
  }[];
  
  usageCount: number;
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: Date;
}

const BUILT_IN_TASK_TEMPLATES = [
  {
    name: 'צ\'קליסט ביקור אתר',
    tasks: [
      { title: 'צילום מצב קיים', order: 1 },
      { title: 'מדידות', order: 2 },
      { title: 'בדיקת תשתיות חשמל', order: 3 },
      { title: 'בדיקת תשתיות אינסטלציה', order: 4 },
      { title: 'תיעוד בעיות', order: 5 },
      { title: 'שיחה עם קבלן/דייר', order: 6 },
    ],
  },
  {
    name: 'צ\'קליסט מסירת פרויקט',
    tasks: [
      { title: 'סיור סיום עם לקוח', order: 1 },
      { title: 'רשימת ליקויים', order: 2 },
      { title: 'איסוף חשבוניות אחריות', order: 3 },
      { title: 'העברת מדריכי שימוש', order: 4 },
      { title: 'צילום סופי', order: 5 },
      { title: 'עדכון פורטפוליו', order: 6 },
      { title: 'בקשת המלצה', order: 7 },
    ],
  },
  {
    name: 'צ\'קליסט הזמנת רכש',
    tasks: [
      { title: 'אישור מחיר מספק', order: 1 },
      { title: 'אישור לקוח', order: 2 },
      { title: 'שליחת הזמנה', order: 3 },
      { title: 'קבלת אישור הזמנה', order: 4 },
      { title: 'מעקב זמן אספקה', order: 5 },
    ],
  },
];
```

---

### 3. Proposal Templates - תבניות הצעת מחיר

```typescript
interface ProposalTemplate {
  id: string;
  tenantId: string;
  
  name: string;
  description?: string;
  category?: string;
  
  // תוכן
  content: {
    introduction?: string;
    scope?: string;
    deliverables?: string[];
    timeline?: string;
    exclusions?: string[];
    assumptions?: string[];
    terms?: string;
  };
  
  // סעיפים
  sections: {
    title: string;
    content: string;
    order: number;
  }[];
  
  // פריטים לדוגמה (אופציונלי)
  sampleItems?: {
    type: string;
    name: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
  }[];
  
  // עיצוב
  styling: {
    headerImage?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  
  usageCount: number;
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: Date;
}

const BUILT_IN_PROPOSAL_TEMPLATES = [
  {
    name: 'הצעה סטנדרטית - עיצוב פנים',
    content: {
      introduction: 'שמחים להציג בפניכם את הצעתנו לעיצוב {{project.address}}.',
      scope: 'שירותי עיצוב פנים מלאים הכוללים ייעוץ, תכנון, ליווי רכש והתקנה.',
      deliverables: [
        'לוחות השראה',
        'תוכניות ריהוט',
        'הדמיות תלת מימד',
        'מפרט חומרים וריהוט',
        'ליווי רכש',
        'פיקוח התקנה',
      ],
      exclusions: [
        'עבודות שיפוץ ובנייה',
        'עבודות חשמל ואינסטלציה',
        'עלות מוצרים וריהוט',
      ],
      terms: 'ההצעה בתוקף ל-30 יום. התשלום בהתאם ללוח התשלומים המצורף.',
    },
  },
];
```

---

### 4. Contract Templates - תבניות חוזה

```typescript
interface ContractTemplate {
  id: string;
  tenantId: string;
  
  name: string;
  description?: string;
  category?: string;
  
  // תוכן HTML עם placeholders
  content: string;
  
  // Placeholders זמינים
  availablePlaceholders: {
    key: string;
    description: string;
    example: string;
  }[];
  
  // שדות חתימה
  signatureFields: {
    party: 'designer' | 'client';
    label: string;
    required: boolean;
  }[];
  
  usageCount: number;
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: Date;
}

// Placeholders בחוזה
const CONTRACT_PLACEHOLDERS = [
  { key: '{{tenant.name}}', description: 'שם המשרד' },
  { key: '{{tenant.address}}', description: 'כתובת המשרד' },
  { key: '{{tenant.phone}}', description: 'טלפון המשרד' },
  { key: '{{client.name}}', description: 'שם הלקוח' },
  { key: '{{client.address}}', description: 'כתובת הלקוח' },
  { key: '{{client.phone}}', description: 'טלפון הלקוח' },
  { key: '{{client.idNumber}}', description: 'ת.ז. הלקוח' },
  { key: '{{project.name}}', description: 'שם הפרויקט' },
  { key: '{{project.address}}', description: 'כתובת הפרויקט' },
  { key: '{{contract.totalValue}}', description: 'סכום החוזה' },
  { key: '{{contract.startDate}}', description: 'תאריך התחלה' },
  { key: '{{contract.endDate}}', description: 'תאריך סיום משוער' },
  { key: '{{today}}', description: 'תאריך היום' },
];
```

---

### 5. Email Templates - תבניות מייל

```typescript
interface EmailTemplate {
  id: string;
  tenantId: string;
  
  // מזהה
  name: string;
  description?: string;
  
  // סוג
  category: 'system' | 'marketing' | 'project' | 'payment' | 'custom';
  trigger?: string;                 // לאוטומציות
  
  // תוכן
  subject: string;
  body: string;                     // HTML עם placeholders
  
  // הגדרות
  settings: {
    includeSignature: boolean;
    includeLogo: boolean;
    trackOpens: boolean;
    trackClicks: boolean;
  };
  
  usageCount: number;
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: Date;
}

const BUILT_IN_EMAIL_TEMPLATES = [
  // System
  {
    name: 'הזמנה לצוות',
    category: 'system',
    trigger: 'team_invitation',
    subject: 'הוזמנת להצטרף ל-{{tenant.name}}',
    body: `
      <p>שלום,</p>
      <p>{{invitedBy.name}} מזמין אותך להצטרף לצוות של {{tenant.name}}.</p>
      <p><a href="{{inviteLink}}">לחץ כאן להצטרפות</a></p>
      <p>ההזמנה בתוקף ל-7 ימים.</p>
    `,
  },
  
  // Payment
  {
    name: 'תזכורת תשלום',
    category: 'payment',
    trigger: 'payment_reminder',
    subject: 'תזכורת: תשלום עבור {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>ברצוננו להזכיר כי תשלום בסך {{payment.amount}} ₪ עבור {{payment.name}} צפוי בתאריך {{payment.dueDate}}.</p>
      <p>פרטי הפרויקט: {{project.name}}</p>
      <p>לתשלום מאובטח: <a href="{{paymentLink}}">לחץ כאן</a></p>
      <p>בברכה,<br>{{tenant.name}}</p>
    `,
  },
  {
    name: 'תשלום באיחור',
    category: 'payment',
    trigger: 'payment_overdue',
    subject: 'תשלום באיחור - {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>לתשומת לבך, תשלום בסך {{payment.amount}} ₪ עבור {{project.name}} היה אמור להתקבל בתאריך {{payment.dueDate}}.</p>
      <p>נשמח לסיוע בהסדרת התשלום.</p>
      <p>לתשלום: <a href="{{paymentLink}}">לחץ כאן</a></p>
    `,
  },
  {
    name: 'אישור קבלת תשלום',
    category: 'payment',
    trigger: 'payment_received',
    subject: 'התקבל תשלום - {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>תודה! קיבלנו את התשלום בסך {{payment.amount}} ₪.</p>
      <p>פרטי התשלום:</p>
      <ul>
        <li>פרויקט: {{project.name}}</li>
        <li>תשלום: {{payment.name}}</li>
        <li>סכום: {{payment.amount}} ₪</li>
        <li>תאריך: {{payment.paidDate}}</li>
      </ul>
    `,
  },
  
  // Project
  {
    name: 'ברוכים הבאים לפרויקט',
    category: 'project',
    trigger: 'project_started',
    subject: 'ברוכים הבאים! {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>שמחים להתחיל איתך את הפרויקט {{project.name}}!</p>
      <p>מצורף קישור לפורטל הלקוח שלך בו תוכל לעקוב אחר התקדמות הפרויקט:</p>
      <p><a href="{{portalLink}}">כניסה לפורטל</a></p>
    `,
  },
  {
    name: 'תזכורת פגישה',
    category: 'project',
    trigger: 'meeting_reminder',
    subject: 'תזכורת: פגישה מחר - {{meeting.title}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>תזכורת לפגישה שנקבעה:</p>
      <ul>
        <li>נושא: {{meeting.title}}</li>
        <li>תאריך: {{meeting.date}}</li>
        <li>שעה: {{meeting.time}}</li>
        <li>מיקום: {{meeting.location}}</li>
      </ul>
    `,
  },
  {
    name: 'נדרש אישור',
    category: 'project',
    trigger: 'approval_needed',
    subject: 'נדרש אישורך - {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>ממתינים לאישורך עבור: {{approval.itemName}}</p>
      <p><a href="{{approvalLink}}">לחץ כאן לצפייה ואישור</a></p>
    `,
  },
  
  // Satisfaction
  {
    name: 'סקר שביעות רצון',
    category: 'project',
    trigger: 'project_completed',
    subject: 'נשמח לשמוע ממך - {{project.name}}',
    body: `
      <p>שלום {{client.name}},</p>
      <p>תודה שבחרת ב-{{tenant.name}}!</p>
      <p>נשמח מאוד אם תקדיש דקה לשתף אותנו במשוב:</p>
      <p><a href="{{surveyLink}}">למילוי הסקר</a></p>
    `,
  },
];
```

---

## Template API

```typescript
// Project Templates
GET /api/templates/projects
POST /api/templates/projects
GET /api/templates/projects/:id
PATCH /api/templates/projects/:id
DELETE /api/templates/projects/:id
POST /api/templates/projects/:id/use          // Create project from template

// Task Templates
GET /api/templates/tasks
POST /api/templates/tasks
POST /api/templates/tasks/:id/apply/:projectId  // Apply to project

// Proposal Templates
GET /api/templates/proposals
POST /api/templates/proposals
POST /api/templates/proposals/:id/use

// Contract Templates
GET /api/templates/contracts
POST /api/templates/contracts

// Email Templates
GET /api/templates/emails
POST /api/templates/emails
POST /api/templates/emails/:id/preview        // Preview with sample data
POST /api/templates/emails/:id/test           // Send test email
```

---

## Template Editor UI

```typescript
interface TemplateEditorUI {
  // Sidebar: placeholders זמינים
  placeholderPanel: {
    categories: string[];
    placeholders: { key: string; description: string }[];
    dragAndDrop: true;
  };
  
  // Main: עורך WYSIWYG
  editor: {
    type: 'rich_text';              // לemails, contracts
    toolbar: ['bold', 'italic', 'link', 'list', 'image', 'table'];
    placeholderHighlight: true;
  };
  
  // Preview
  preview: {
    sampleData: true;               // הצגה עם נתונים לדוגמה
    switchData: true;               // החלפת נתוני דוגמה
    responsive: true;               // תצוגה בגדלים שונים
  };
}
```

---

## הנחיות למימוש

1. **Placeholder Processing:**
   - Parse placeholders: regex `{{([^}]+)}}`
   - Replace with actual data
   - Handle missing data gracefully (empty or default)

2. **Template Versioning:**
   - Keep history of changes
   - Ability to revert to previous version
   - Clone template

3. **Usage Tracking:**
   - Track which templates are used most
   - Suggest popular templates

4. **Multi-language:**
   - Support Hebrew and English templates
   - Auto-detect direction (RTL/LTR)
# מסמך אפיון - חלק כד
## Communication - תקשורת (Email, SMS, WhatsApp)

---

# ל. מערכת תקשורת

## עקרון מנחה

תקשורת אחידה עם לקוחות, ספקים ובעלי מקצוע - מייל, SMS, WhatsApp - הכל ממקום אחד עם לוג מרכזי.

---

## ישויות תקשורת

### EmailMessage - הודעת מייל

```typescript
interface EmailMessage {
  id: string;
  tenantId: string;
  
  // כיוון
  direction: 'outgoing' | 'incoming';
  
  // נמען/שולח
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress;
  
  // תוכן
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  
  // קבצים
  attachments?: EmailAttachment[];
  
  // קישור לישויות
  entityType?: string;
  entityId?: string;
  projectId?: string;
  clientId?: string;
  
  // תבנית
  templateId?: string;
  
  // סטטוס
  status: 'draft' | 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed';
  
  // מעקב
  tracking: {
    opens: EmailTrackingEvent[];
    clicks: EmailTrackingEvent[];
  };
  
  // שגיאות
  errorMessage?: string;
  errorCode?: string;
  
  // זמנים
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  
  createdAt: Date;
  createdBy: string;
}

interface EmailAddress {
  email: string;
  name?: string;
}

interface EmailAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

interface EmailTrackingEvent {
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  location?: string;
  linkUrl?: string;                 // לclicks
}
```

### SMSMessage - הודעת SMS

```typescript
interface SMSMessage {
  id: string;
  tenantId: string;
  
  // כיוון
  direction: 'outgoing' | 'incoming';
  
  // טלפונים
  from: string;                     // מספר השולח
  to: string;                       // מספר הנמען
  
  // תוכן
  body: string;
  
  // קישור
  entityType?: string;
  entityId?: string;
  projectId?: string;
  clientId?: string;
  
  // סטטוס
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'received';
  
  // מעקב
  providerMessageId?: string;
  segments: number;                 // כמה SMS (מעל 160 תווים)
  cost?: number;
  
  errorMessage?: string;
  
  sentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  createdBy?: string;
}
```

### WhatsAppMessage - הודעת WhatsApp

```typescript
interface WhatsAppMessage {
  id: string;
  tenantId: string;
  
  // כיוון
  direction: 'outgoing' | 'incoming';
  
  // טלפונים
  from: string;
  to: string;
  
  // סוג הודעה
  messageType: 'text' | 'template' | 'image' | 'document' | 'location';
  
  // תוכן
  content: {
    // text
    text?: string;
    
    // template (הודעה מאושרת)
    templateName?: string;
    templateLanguage?: string;
    templateParameters?: string[];
    
    // media
    mediaUrl?: string;
    mediaCaption?: string;
    fileName?: string;
    
    // location
    latitude?: number;
    longitude?: number;
    locationName?: string;
  };
  
  // קישור
  entityType?: string;
  entityId?: string;
  projectId?: string;
  clientId?: string;
  
  // סטטוס
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'received';
  
  // מזהה WhatsApp
  whatsappMessageId?: string;
  
  // שגיאות
  errorMessage?: string;
  errorCode?: string;
  
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  createdBy?: string;
}
```

---

## Email Configuration

### Tenant Email Settings

```typescript
interface TenantEmailSettings {
  tenantId: string;
  
  // שולח
  defaultFromEmail: string;
  defaultFromName: string;
  replyToEmail?: string;
  
  // חתימה
  signature: {
    enabled: boolean;
    html: string;
    includeInReplies: boolean;
  };
  
  // ברנדינג
  branding: {
    logoUrl?: string;
    primaryColor: string;
    headerHtml?: string;
    footerHtml?: string;
  };
  
  // Provider
  provider: 'sendgrid' | 'ses' | 'smtp' | 'resend';
  providerConfig: {
    apiKey?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
  };
  
  // מעקב
  tracking: {
    trackOpens: boolean;
    trackClicks: boolean;
  };
  
  // Domain verification
  customDomain?: {
    domain: string;
    verified: boolean;
    dkimRecord: string;
    spfRecord: string;
  };
}
```

### Email API

```typescript
// שליחת מייל
interface SendEmailRequest {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  
  // תבנית או custom
  templateId?: string;
  templateData?: Record<string, any>;
  
  // או תוכן ישיר
  subject?: string;
  body?: string;
  
  // קבצים
  attachments?: {
    fileName: string;
    content: string;              // base64
    contentType: string;
  }[];
  
  // קישור לישות
  entityType?: string;
  entityId?: string;
  projectId?: string;
  
  // תזמון
  scheduledFor?: Date;
}

// API
POST /api/communication/email/send
GET /api/communication/email/:id
GET /api/communication/email?entityType=...&entityId=...
DELETE /api/communication/email/:id           // Cancel scheduled
```

---

## SMS Configuration

### Tenant SMS Settings

```typescript
interface TenantSMSSettings {
  tenantId: string;
  
  // Provider
  provider: 'twilio' | 'nexmo' | 'local_provider';
  providerConfig: {
    accountSid?: string;
    authToken?: string;
    fromNumber: string;
  };
  
  // הגדרות
  settings: {
    enabled: boolean;
    maxPerDay: number;
    maxLength: number;
  };
}
```

### SMS API

```typescript
// שליחת SMS
interface SendSMSRequest {
  to: string;                       // מספר טלפון
  body: string;
  
  // קישור
  entityType?: string;
  entityId?: string;
  projectId?: string;
  
  // תזמון
  scheduledFor?: Date;
}

// API
POST /api/communication/sms/send
GET /api/communication/sms/:id
GET /api/communication/sms?clientId=...
```

---

## WhatsApp Configuration

### WhatsApp Business Setup

```typescript
interface TenantWhatsAppSettings {
  tenantId: string;
  
  // Meta Business
  businessAccountId: string;
  phoneNumberId: string;
  accessToken: string;              // מוצפן
  
  // Webhook
  webhookVerifyToken: string;
  webhookUrl: string;
  
  // תבניות מאושרות
  templates: WhatsAppTemplate[];
  
  // הגדרות
  settings: {
    enabled: boolean;
    autoReply: boolean;
    autoReplyMessage?: string;
    businessHoursOnly: boolean;
    businessHours?: {
      start: string;
      end: string;
      timezone: string;
    };
  };
}

interface WhatsAppTemplate {
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  components: {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    text?: string;
    format?: string;
    parameters?: string[];
  }[];
}
```

### WhatsApp API

```typescript
// שליחת הודעה
interface SendWhatsAppRequest {
  to: string;                       // מספר טלפון עם קידומת מדינה
  
  // סוג
  type: 'text' | 'template' | 'image' | 'document';
  
  // תוכן לפי סוג
  text?: string;
  
  templateName?: string;
  templateLanguage?: string;
  templateParameters?: string[];
  
  mediaUrl?: string;
  mediaCaption?: string;
  
  // קישור
  entityType?: string;
  entityId?: string;
  projectId?: string;
}

// API
POST /api/communication/whatsapp/send
GET /api/communication/whatsapp/:id
GET /api/communication/whatsapp/conversation/:phoneNumber
POST /api/communication/whatsapp/webhook        // Incoming messages
```

---

## Unified Communication Log

כל התקשורת מרוכזת ביומן אחד (CommunicationLog שכבר הוגדר):

```typescript
// Query כל התקשורת עם לקוח
GET /api/communication/log?clientId=123
// Returns: emails, SMS, WhatsApp, phone calls, meetings - הכל

// Query לפי פרויקט
GET /api/communication/log?projectId=456

// Query לפי ישות ספציפית
GET /api/communication/log?entityType=payment&entityId=789
```

---

## Compose UI - ממשק שליחה אחיד

```typescript
interface ComposeMessageUI {
  // בחירת ערוץ
  channelSelector: {
    options: ['email', 'sms', 'whatsapp'];
    default: 'email';
    showAvailability: true;         // האם הלקוח יש לו את הערוץ
  };
  
  // נמען
  recipientSelector: {
    type: 'autocomplete';
    sources: ['clients', 'suppliers', 'professionals', 'custom'];
    showContactInfo: true;
  };
  
  // תבניות
  templateSelector: {
    show: true;
    filterByChannel: true;
    preview: true;
  };
  
  // עורך
  editor: {
    email: 'rich_text';
    sms: 'plain_text';
    whatsapp: 'plain_text_with_emoji';
    characterCount: true;
    placeholderAutocomplete: true;
  };
  
  // קבצים
  attachments: {
    email: true;
    whatsapp: true;                 // images, documents
    sms: false;
  };
  
  // תזמון
  scheduling: {
    enabled: true;
    presets: ['now', 'tomorrow_9am', 'custom'];
  };
  
  // שליחה
  sendOptions: {
    sendNow: true;
    schedule: true;
    saveDraft: true;                // email only
  };
}
```

---

## Inbox - תיבת דואר נכנס

```typescript
interface InboxUI {
  // תצוגה
  views: ['all', 'unread', 'email', 'sms', 'whatsapp'];
  
  // לכל הודעה
  messageRow: {
    avatar: true;
    senderName: true;
    preview: true;
    timestamp: true;
    channel: true;                  // icon
    status: true;                   // delivered, read
    linkedEntity: true;             // קישור לפרויקט/לקוח
  };
  
  // פעולות
  actions: ['reply', 'forward', 'archive', 'mark_read', 'link_to_entity'];
  
  // Conversation view
  conversationView: {
    groupByContact: true;
    showAllChannels: true;          // מייל + WhatsApp + SMS ביחד
    replyInline: true;
  };
}
```

---

## Notifications & Alerts

### Real-time Notifications

```typescript
// WebSocket events לתקשורת
const COMMUNICATION_EVENTS = {
  'email.received': 'מייל נכנס חדש',
  'email.bounced': 'מייל חזר',
  'sms.received': 'SMS נכנס',
  'whatsapp.received': 'הודעת WhatsApp חדשה',
  'whatsapp.read': 'הודעה נקראה',
};
```

### Auto-logging

```typescript
// כל תקשורת נשמרת אוטומטית ב-CommunicationLog
// עם קישור לישויות רלוונטיות

interface AutoLoggingRules {
  // מייל
  email: {
    logOutgoing: true;
    logIncoming: true;              // אם יש inbox integration
    autoLinkToClient: true;
    autoLinkToProject: true;
  };
  
  // SMS
  sms: {
    logOutgoing: true;
    logIncoming: true;
    autoLinkByPhone: true;
  };
  
  // WhatsApp
  whatsapp: {
    logOutgoing: true;
    logIncoming: true;
    autoLinkByPhone: true;
    saveMediaFiles: true;
  };
}
```

---

## הנחיות למימוש

1. **Email Provider:**
   - Use SendGrid or Resend for reliability
   - Implement proper SPF/DKIM for deliverability
   - Handle bounces and complaints

2. **SMS Provider:**
   - Use Twilio or local Israeli provider
   - Handle international formatting
   - Track delivery status

3. **WhatsApp:**
   - Use official WhatsApp Business API
   - Pre-approve message templates
   - Handle 24-hour window rule
   - Implement webhook for incoming

4. **Security:**
   - Encrypt API keys at rest
   - Rate limiting per tenant
   - Audit log for all messages

5. **Queue:**
   - Send messages via background queue
   - Retry failed messages
   - Respect rate limits

6. **Tracking:**
   - Track opens via pixel (email)
   - Track clicks via redirect
   - Store delivery status from providers
# מסמך אפיון - חלק כה
## File Management - ניהול קבצים

---

# לא. מערכת ניהול קבצים

## עקרון מנחה

ניהול קבצים מרכזי עם תיקיות, גרסאות, ותצוגה מקדימה - הכל מאורגן לפי פרויקט ונגיש מכל מקום.

---

## ישויות קבצים

### File - קובץ

```typescript
interface File {
  id: string;
  tenantId: string;
  
  // מיקום
  folderId?: string;                // null = root
  projectId?: string;
  
  // פרטי קובץ
  name: string;
  originalName: string;
  
  // סוג
  mimeType: string;
  extension: string;
  category: FileCategory;
  
  // גודל
  size: number;                     // bytes
  
  // אחסון
  storageProvider: 'local' | 's3' | 'gcs' | 'r2';
  storagePath: string;
  storageUrl: string;
  
  // תמונות
  thumbnailUrl?: string;
  previewUrl?: string;
  
  // גרסאות
  version: number;
  parentVersionId?: string;
  isLatestVersion: boolean;
  
  // מטא
  metadata: {
    width?: number;                 // לתמונות
    height?: number;
    duration?: number;              // לוידאו
    pageCount?: number;             // ל-PDF
    
    // EXIF לתמונות
    camera?: string;
    takenAt?: Date;
    location?: { lat: number; lng: number };
  };
  
  // תיוג
  tags?: string[];
  description?: string;
  
  // שיתוף
  isSharedWithClient: boolean;
  clientCanDownload: boolean;
  
  // סטטיסטיקות
  downloadCount: number;
  viewCount: number;
  lastAccessedAt?: Date;
  
  // מטא
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;                 // soft delete
}

type FileCategory = 
  | 'document'                      // PDF, DOC, XLS
  | 'image'                         // JPG, PNG, etc.
  | 'drawing'                       // CAD, DWG
  | 'render'                        // 3D renders
  | 'plan'                          // תוכניות
  | 'presentation'                  // PPT
  | 'spreadsheet'                   // XLS, CSV
  | 'video'                         // MP4, etc.
  | 'audio'                         // MP3, etc.
  | 'archive'                       // ZIP, RAR
  | 'other';
```

### Folder - תיקייה

```typescript
interface Folder {
  id: string;
  tenantId: string;
  
  // היררכיה
  parentId?: string;                // null = root
  projectId?: string;
  
  // פרטים
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  
  // סוג
  type: 'regular' | 'system' | 'smart';
  
  // Smart folders - תיקיות דינמיות
  smartCriteria?: {
    mimeTypes?: string[];
    tags?: string[];
    dateRange?: { from: Date; to: Date };
    uploadedBy?: string;
  };
  
  // הרשאות
  permissions: {
    isSharedWithClient: boolean;
    clientCanUpload: boolean;
    clientCanDownload: boolean;
  };
  
  // סטטיסטיקות (computed)
  fileCount: number;
  totalSize: number;
  
  // מטא
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### FileVersion - גרסת קובץ

```typescript
interface FileVersion {
  id: string;
  fileId: string;
  
  version: number;
  
  // פרטי גרסה
  storageUrl: string;
  size: number;
  
  // מה השתנה
  changeNote?: string;
  
  // מטא
  uploadedBy: string;
  createdAt: Date;
}
```

### FileShare - שיתוף קובץ

```typescript
interface FileShare {
  id: string;
  tenantId: string;
  
  // מה משותף
  fileId?: string;
  folderId?: string;
  
  // סוג שיתוף
  type: 'link' | 'email';
  
  // הגדרות
  settings: {
    expiresAt?: Date;
    password?: string;
    maxDownloads?: number;
    allowDownload: boolean;
    allowPreview: boolean;
  };
  
  // קישור
  token: string;
  publicUrl: string;
  
  // אם email
  sharedWithEmail?: string;
  
  // סטטיסטיקות
  viewCount: number;
  downloadCount: number;
  lastAccessedAt?: Date;
  
  createdBy: string;
  createdAt: Date;
}
```

---

## מבנה תיקיות ברירת מחדל

```typescript
// לכל פרויקט נוצר מבנה אוטומטי
const DEFAULT_PROJECT_FOLDERS = [
  { name: 'תוכניות', icon: 'blueprint', type: 'system' },
  { name: 'הדמיות', icon: 'image', type: 'system' },
  { name: 'מסמכים', icon: 'file-text', type: 'system' },
  { name: 'חוזים והצעות', icon: 'file-signature', type: 'system' },
  { name: 'תמונות מהשטח', icon: 'camera', type: 'system' },
  { name: 'ספקים', icon: 'truck', type: 'system' },
  { name: 'לקוח', icon: 'user', type: 'system', isSharedWithClient: true },
];

// תיקיות חכמות גלובליות
const SMART_FOLDERS = [
  { name: 'כל התמונות', smartCriteria: { mimeTypes: ['image/*'] }},
  { name: 'PDF', smartCriteria: { mimeTypes: ['application/pdf'] }},
  { name: 'הועלה השבוע', smartCriteria: { dateRange: 'this_week' }},
];
```

---

## Upload System

### Upload Flow

```typescript
// שלב 1: בקשת URL להעלאה
interface UploadUrlRequest {
  fileName: string;
  mimeType: string;
  size: number;
  
  // יעד
  folderId?: string;
  projectId?: string;
}

interface UploadUrlResponse {
  uploadId: string;
  uploadUrl: string;                // Pre-signed URL
  expiresAt: Date;
}

// שלב 2: העלאה ישירה ל-Storage
// Client uploads directly to S3/R2

// שלב 3: אישור העלאה
interface ConfirmUploadRequest {
  uploadId: string;
  
  // metadata אופציונלי
  description?: string;
  tags?: string[];
  isSharedWithClient?: boolean;
}

// שלב 4: עיבוד (Background)
// - יצירת thumbnail
// - חילוץ metadata
// - סריקת וירוסים
// - OCR לתמונות (אופציונלי)
```

### Chunked Upload (לקבצים גדולים)

```typescript
interface ChunkedUploadInit {
  fileName: string;
  mimeType: string;
  totalSize: number;
  chunkSize: number;                // default 5MB
}

interface ChunkedUploadResponse {
  uploadId: string;
  totalChunks: number;
  chunkUrls: {
    partNumber: number;
    uploadUrl: string;
  }[];
}

// Client uploads each chunk
// Then calls complete:
interface CompleteChunkedUpload {
  uploadId: string;
  parts: {
    partNumber: number;
    etag: string;
  }[];
}
```

### Upload Restrictions

```typescript
interface UploadRestrictions {
  // לפי plan
  maxFileSize: number;              // bytes - 100MB default
  maxTotalStorage: number;          // bytes - per tenant
  
  // סוגי קבצים
  allowedMimeTypes: string[];
  blockedExtensions: string[];
  
  // וירוסים
  scanForViruses: boolean;
}

const DEFAULT_ALLOWED_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'application/vnd.ms-excel',
  
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/tiff',
  
  // Design
  'application/x-autocad',
  'image/vnd.dwg',
  'application/x-dwg',
  
  // Video
  'video/mp4',
  'video/quicktime',
  
  // Archives
  'application/zip',
  'application/x-rar-compressed',
];

const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1',
  '.js', '.vbs', '.jar',
];
```

---

## Image Processing

```typescript
interface ImageProcessingConfig {
  // Thumbnails
  thumbnails: {
    small: { width: 150, height: 150, fit: 'cover' };
    medium: { width: 400, height: 400, fit: 'inside' };
    large: { width: 1200, height: 1200, fit: 'inside' };
  };
  
  // Optimization
  optimization: {
    maxWidth: 4000;
    maxHeight: 4000;
    quality: 85;
    format: 'webp' | 'original';
    stripMetadata: false;
  };
  
  // Watermark (אופציונלי)
  watermark?: {
    enabled: boolean;
    imageUrl: string;
    position: 'bottom-right' | 'center';
    opacity: number;
  };
}
```

---

## File Preview

### Preview Support

```typescript
const PREVIEW_SUPPORT = {
  // Native browser preview
  'image/*': { type: 'image', viewer: 'native' },
  'video/*': { type: 'video', viewer: 'native' },
  'audio/*': { type: 'audio', viewer: 'native' },
  
  // PDF
  'application/pdf': { type: 'pdf', viewer: 'pdfjs' },
  
  // Office (via conversion)
  'application/msword': { type: 'document', viewer: 'google_docs_viewer' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { type: 'document', viewer: 'google_docs_viewer' },
  'application/vnd.ms-excel': { type: 'spreadsheet', viewer: 'google_docs_viewer' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { type: 'spreadsheet', viewer: 'google_docs_viewer' },
  'application/vnd.ms-powerpoint': { type: 'presentation', viewer: 'google_docs_viewer' },
  
  // Text
  'text/*': { type: 'text', viewer: 'code' },
  
  // CAD - no preview, download only
  'application/x-autocad': { type: 'cad', viewer: 'none' },
};
```

### Preview Modal

```typescript
interface FilePreviewUI {
  // Header
  header: {
    fileName: true;
    fileSize: true;
    uploadedBy: true;
    uploadedAt: true;
  };
  
  // Viewer
  viewer: {
    fullscreen: true;
    zoom: true;                     // לתמונות, PDF
    rotate: true;                   // לתמונות
    pageNavigation: true;           // ל-PDF
  };
  
  // Sidebar (אופציונלי)
  sidebar: {
    metadata: true;
    versions: true;
    comments: true;
    activity: true;
  };
  
  // Actions
  actions: ['download', 'share', 'delete', 'rename', 'move', 'new_version'];
  
  // Navigation
  navigation: {
    previousFile: true;
    nextFile: true;
    keyboard: true;                 // ← →
  };
}
```

---

## File API

```typescript
// Upload
POST /api/files/upload-url
POST /api/files/confirm-upload
POST /api/files/chunked/init
POST /api/files/chunked/complete

// CRUD
GET /api/files
GET /api/files/:id
PATCH /api/files/:id
DELETE /api/files/:id

// Versions
GET /api/files/:id/versions
POST /api/files/:id/versions
GET /api/files/:id/versions/:versionId/download

// Download
GET /api/files/:id/download
GET /api/files/:id/thumbnail/:size
GET /api/files/:id/preview

// Share
POST /api/files/:id/share
GET /api/files/shared/:token
DELETE /api/files/:id/share/:shareId

// Folders
GET /api/folders
POST /api/folders
PATCH /api/folders/:id
DELETE /api/folders/:id
GET /api/folders/:id/files

// Bulk
POST /api/files/bulk/move
POST /api/files/bulk/delete
POST /api/files/bulk/download        // ZIP
```

---

## Storage Management

### Storage Usage

```typescript
interface StorageUsage {
  tenantId: string;
  
  // נוכחי
  usedBytes: number;
  usedFormatted: string;            // "2.5 GB"
  
  // מגבלה
  limitBytes: number;
  limitFormatted: string;
  
  // אחוז
  usagePercent: number;
  
  // פירוט
  breakdown: {
    category: string;
    bytes: number;
    fileCount: number;
    percent: number;
  }[];
  
  // לפי פרויקט
  byProject: {
    projectId: string;
    projectName: string;
    bytes: number;
    fileCount: number;
  }[];
}
```

### Cleanup & Maintenance

```typescript
interface StorageMaintenanceConfig {
  // מחיקה אוטומטית
  autoDelete: {
    // קבצים שנמחקו (soft delete)
    deletedFilesAfterDays: 30;
    
    // גרסאות ישנות
    oldVersionsAfterDays: 90;
    keepMinVersions: 3;
    
    // קבצים זמניים
    tempFilesAfterHours: 24;
  };
  
  // התראות
  alerts: {
    storageWarningPercent: 80;
    storageFullPercent: 95;
  };
  
  // Deduplication (אופציונלי)
  deduplication: {
    enabled: boolean;
    byHash: boolean;
  };
}
```

---

## הנחיות למימוש

1. **Storage Provider:**
   - Use S3-compatible storage (AWS S3, Cloudflare R2, MinIO)
   - Pre-signed URLs for uploads/downloads
   - CDN for thumbnails and previews

2. **Upload:**
   - Direct upload to storage (not through server)
   - Chunked upload for files > 10MB
   - Progress indication
   - Resume interrupted uploads

3. **Processing:**
   - Background job for thumbnails/optimization
   - Use Sharp for image processing
   - Virus scanning with ClamAV or external service

4. **Security:**
   - Validate file types (not just extension)
   - Scan for malware
   - Secure signed URLs (expiring)
   - Access control per file

5. **Performance:**
   - Lazy loading for file lists
   - Thumbnail sprites for galleries
   - CDN caching
   - Compression for downloads
# מסמך אפיון - חלק כו
## Billing & Subscription - חיוב ומנויים

---

# לב. מערכת מנויים (של המערכת עצמה)

## Plans - תוכניות מנוי

```typescript
interface Plan {
  id: string;
  
  // מזהה
  name: string;
  displayName: string;
  description: string;
  
  // מחיר
  pricing: {
    monthly: number;
    yearly: number;
    yearlyDiscount: number;         // אחוז
    currency: string;
  };
  
  // מגבלות
  limits: PlanLimits;
  
  // פיצ'רים
  features: PlanFeature[];
  
  // סטטוס
  isActive: boolean;
  isPopular: boolean;               // להצגה
  
  // סדר
  order: number;
}

interface PlanLimits {
  // משתמשים
  maxUsers: number;                 // -1 = unlimited
  
  // פרויקטים
  maxActiveProjects: number;
  maxTotalProjects: number;
  
  // אחסון
  maxStorageGB: number;
  
  // Client Portal
  maxClientPortals: number;
  
  // אינטגרציות
  maxIntegrations: number;
  
  // אוטומציות
  maxAutomations: number;
  automationRunsPerMonth: number;
  
  // API
  apiRequestsPerMonth: number;
}

interface PlanFeature {
  key: string;
  name: string;
  included: boolean;
  limit?: number | string;
}
```

### תוכניות מובנות

```typescript
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    displayName: 'חינם',
    description: 'להתחלה',
    pricing: { monthly: 0, yearly: 0, currency: 'ILS' },
    limits: {
      maxUsers: 1,
      maxActiveProjects: 2,
      maxTotalProjects: 5,
      maxStorageGB: 1,
      maxClientPortals: 0,
      maxIntegrations: 1,
      maxAutomations: 0,
      automationRunsPerMonth: 0,
      apiRequestsPerMonth: 0,
    },
    features: [
      { key: 'projects', name: 'ניהול פרויקטים', included: true },
      { key: 'tasks', name: 'משימות', included: true },
      { key: 'documents', name: 'מסמכים', included: true },
      { key: 'proposals', name: 'הצעות מחיר', included: true, limit: 5 },
      { key: 'client_portal', name: 'פורטל לקוח', included: false },
      { key: 'automations', name: 'אוטומציות', included: false },
      { key: 'integrations', name: 'אינטגרציות', included: false },
      { key: 'reports', name: 'דוחות מתקדמים', included: false },
      { key: 'api', name: 'גישת API', included: false },
      { key: 'support', name: 'תמיכה', included: true, limit: 'email' },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    displayName: 'מתחילים',
    description: 'למעצב עצמאי',
    pricing: { monthly: 99, yearly: 990, yearlyDiscount: 17, currency: 'ILS' },
    limits: {
      maxUsers: 1,
      maxActiveProjects: 10,
      maxTotalProjects: 50,
      maxStorageGB: 10,
      maxClientPortals: 5,
      maxIntegrations: 3,
      maxAutomations: 5,
      automationRunsPerMonth: 100,
      apiRequestsPerMonth: 0,
    },
    features: [
      { key: 'projects', name: 'ניהול פרויקטים', included: true },
      { key: 'tasks', name: 'משימות', included: true },
      { key: 'documents', name: 'מסמכים', included: true },
      { key: 'proposals', name: 'הצעות מחיר', included: true },
      { key: 'client_portal', name: 'פורטל לקוח', included: true },
      { key: 'automations', name: 'אוטומציות', included: true },
      { key: 'integrations', name: 'אינטגרציות', included: true },
      { key: 'reports', name: 'דוחות מתקדמים', included: false },
      { key: 'api', name: 'גישת API', included: false },
      { key: 'support', name: 'תמיכה', included: true, limit: 'email + chat' },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    displayName: 'מקצועי',
    description: 'למשרד קטן',
    pricing: { monthly: 249, yearly: 2490, yearlyDiscount: 17, currency: 'ILS' },
    limits: {
      maxUsers: 5,
      maxActiveProjects: 50,
      maxTotalProjects: -1,
      maxStorageGB: 50,
      maxClientPortals: -1,
      maxIntegrations: -1,
      maxAutomations: 20,
      automationRunsPerMonth: 1000,
      apiRequestsPerMonth: 10000,
    },
    features: [
      { key: 'projects', name: 'ניהול פרויקטים', included: true },
      { key: 'tasks', name: 'משימות', included: true },
      { key: 'documents', name: 'מסמכים', included: true },
      { key: 'proposals', name: 'הצעות מחיר', included: true },
      { key: 'client_portal', name: 'פורטל לקוח', included: true },
      { key: 'automations', name: 'אוטומציות', included: true },
      { key: 'integrations', name: 'אינטגרציות', included: true },
      { key: 'reports', name: 'דוחות מתקדמים', included: true },
      { key: 'api', name: 'גישת API', included: true },
      { key: 'custom_fields', name: 'שדות מותאמים', included: true },
      { key: 'time_tracking', name: 'מעקב שעות', included: true },
      { key: 'support', name: 'תמיכה', included: true, limit: 'priority' },
    ],
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'ארגוני',
    description: 'למשרד גדול',
    pricing: { monthly: 0, yearly: 0, currency: 'ILS' },  // Custom pricing
    limits: {
      maxUsers: -1,
      maxActiveProjects: -1,
      maxTotalProjects: -1,
      maxStorageGB: -1,
      maxClientPortals: -1,
      maxIntegrations: -1,
      maxAutomations: -1,
      automationRunsPerMonth: -1,
      apiRequestsPerMonth: -1,
    },
    features: [
      { key: 'all_professional', name: 'כל התכונות המקצועיות', included: true },
      { key: 'sso', name: 'SSO', included: true },
      { key: 'audit_log', name: 'יומן ביקורת מלא', included: true },
      { key: 'custom_contract', name: 'חוזה מותאם', included: true },
      { key: 'sla', name: 'SLA', included: true },
      { key: 'dedicated_support', name: 'תמיכה ייעודית', included: true },
      { key: 'onboarding', name: 'הדרכה והטמעה', included: true },
    ],
  },
];
```

---

## Subscription - מנוי

```typescript
interface Subscription {
  id: string;
  tenantId: string;
  
  // תוכנית
  planId: string;
  
  // סטטוס
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused';
  
  // תקופה
  billingPeriod: 'monthly' | 'yearly';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  
  // Trial
  trialEndsAt?: Date;
  
  // ביטול
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  cancelReason?: string;
  
  // Payment provider
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  
  // תוספות
  addons: SubscriptionAddon[];
  
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionAddon {
  type: 'users' | 'storage' | 'automations';
  quantity: number;
  pricePerUnit: number;
}
```

---

## Invoice - חשבונית

```typescript
interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  
  // מספר
  invoiceNumber: string;
  
  // תקופה
  periodStart: Date;
  periodEnd: Date;
  
  // פריטים
  lineItems: InvoiceLineItem[];
  
  // סכומים
  subtotal: number;
  discount?: number;
  discountReason?: string;
  tax: number;
  taxRate: number;
  total: number;
  currency: string;
  
  // סטטוס
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  
  // תשלום
  paidAt?: Date;
  paymentMethod?: string;
  
  // קבצים
  pdfUrl?: string;
  
  // Stripe
  stripeInvoiceId?: string;
  
  createdAt: Date;
  dueDate: Date;
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'subscription' | 'addon' | 'one_time';
}
```

---

## Usage Tracking

```typescript
interface UsageTracker {
  tenantId: string;
  period: string;                   // "2026-01"
  
  // ספירות
  counts: {
    activeProjects: number;
    totalProjects: number;
    users: number;
    clientPortals: number;
    automationRuns: number;
    apiRequests: number;
  };
  
  // אחסון
  storage: {
    usedBytes: number;
    limitBytes: number;
  };
  
  // התראות שנשלחו
  alertsSent: {
    type: string;
    sentAt: Date;
    percent: number;
  }[];
  
  updatedAt: Date;
}
```

---

## Billing UI

### Pricing Page

```typescript
interface PricingPageUI {
  // תצוגה
  display: {
    showToggle: true;               // monthly / yearly toggle
    highlightPopular: true;
    showSavingsOnYearly: true;
  };
  
  // לכל plan
  planCard: {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    cta: string;
    highlighted: boolean;
  };
  
  // FAQ
  showFAQ: true;
  
  // Comparison table
  showComparisonTable: true;
}
```

### Billing Settings Page

```typescript
interface BillingSettingsUI {
  sections: [
    {
      id: 'current_plan',
      title: 'התוכנית הנוכחית',
      content: {
        planName: string;
        price: string;
        renewalDate: Date;
        actions: ['upgrade', 'downgrade', 'cancel'];
      };
    },
    {
      id: 'usage',
      title: 'שימוש',
      content: {
        // Progress bars לכל מגבלה
        usageMetrics: {
          name: string;
          used: number;
          limit: number;
          percent: number;
        }[];
      };
    },
    {
      id: 'payment_method',
      title: 'אמצעי תשלום',
      content: {
        currentMethod: {
          type: 'card';
          last4: string;
          expiry: string;
          brand: string;
        };
        actions: ['change', 'add'];
      };
    },
    {
      id: 'invoices',
      title: 'חשבוניות',
      content: {
        invoiceList: Invoice[];
        actions: ['download', 'view'];
      };
    },
  ];
}
```

---

## Billing API

```typescript
// Subscription
GET /api/billing/subscription
POST /api/billing/subscription/upgrade
// Body: { planId: string, billingPeriod: 'monthly' | 'yearly' }

POST /api/billing/subscription/downgrade
// Body: { planId: string }

POST /api/billing/subscription/cancel
// Body: { reason?: string, feedback?: string }

POST /api/billing/subscription/resume

// Plans
GET /api/billing/plans

// Usage
GET /api/billing/usage
GET /api/billing/usage/history?months=12

// Invoices
GET /api/billing/invoices
GET /api/billing/invoices/:id
GET /api/billing/invoices/:id/pdf

// Payment Methods
GET /api/billing/payment-methods
POST /api/billing/payment-methods
// Body: { stripePaymentMethodId: string }

DELETE /api/billing/payment-methods/:id
POST /api/billing/payment-methods/:id/default

// Checkout (Stripe)
POST /api/billing/checkout/session
// Returns: { sessionUrl: string }

POST /api/billing/portal/session
// Returns: { portalUrl: string }

// Webhooks (from Stripe)
POST /api/billing/webhooks/stripe
```

---

## Enforcement Logic

```typescript
interface LimitEnforcement {
  // בדיקה לפני פעולה
  checkLimit(tenantId: string, resource: string): {
    allowed: boolean;
    current: number;
    limit: number;
    message?: string;
  };
  
  // מה קורה כשמגיעים למגבלה
  onLimitReached: {
    projects: {
      action: 'block',
      message: 'הגעת למקסימום פרויקטים. שדרג את התוכנית להוספת פרויקטים.',
      showUpgrade: true,
    },
    storage: {
      action: 'block',
      message: 'נגמר מקום האחסון. שדרג או מחק קבצים.',
      showUpgrade: true,
    },
    users: {
      action: 'block',
      message: 'הגעת למקסימום משתמשים בתוכנית.',
      showUpgrade: true,
    },
    automations: {
      action: 'pause',
      message: 'האוטומציות הושהו. שדרג להמשך פעולה.',
      showUpgrade: true,
    },
    apiRequests: {
      action: 'rate_limit',
      message: 'חרגת ממכסת ה-API החודשית.',
      retryAfter: 'next_month',
    },
  };
  
  // התראות לפני הגעה למגבלה
  warnings: [
    { at: 80, message: 'הגעת ל-80% מהמכסה' },
    { at: 90, message: 'הגעת ל-90% מהמכסה' },
    { at: 100, message: 'הגעת למגבלה' },
  ];
}
```

---

## Trial Management

```typescript
interface TrialConfig {
  // משך trial
  trialDays: 14;
  
  // מה כלול ב-trial
  trialPlan: 'professional';        // גישה לכל הפיצ'רים
  
  // דרישות
  requireCreditCard: false;
  
  // תזכורות
  reminders: [
    { daysBeforeEnd: 7, channel: 'email' },
    { daysBeforeEnd: 3, channel: 'email' },
    { daysBeforeEnd: 1, channel: 'email' },
    { daysBeforeEnd: 0, channel: 'in_app' },
  ];
  
  // מה קורה בסיום
  onTrialEnd: {
    withCard: 'start_subscription',
    withoutCard: 'downgrade_to_free',
  };
}
```

---

## הנחיות למימוש

1. **Payment Provider:**
   - Use Stripe for international
   - Consider local Israeli providers (PayPlus, Cardcom) for local cards
   - Implement webhook handling properly

2. **Proration:**
   - Handle mid-cycle upgrades/downgrades
   - Credit unused time on downgrade
   - Charge difference on upgrade

3. **Grace Period:**
   - 3 days grace period for failed payments
   - Retry payment automatically
   - Notify user of payment issues

4. **Security:**
   - Never store full card numbers
   - Use Stripe Elements for card input
   - PCI compliance through Stripe

5. **Invoicing:**
   - Auto-generate invoices
   - Support Israeli invoice requirements
   - Send invoice by email

6. **Analytics:**
   - Track MRR, ARR
   - Track churn rate
   - Track upgrade/downgrade patterns
# מסמך אפיון - חלק כז
## UX States & Patterns - מצבי UX ודפוסים

---

# לג. מצבי UX

## Empty States - מצבים ריקים

```typescript
interface EmptyState {
  // תמונה/איקון
  illustration?: string;
  icon?: string;
  
  // טקסט
  title: string;
  description: string;
  
  // פעולה ראשית
  primaryAction?: {
    label: string;
    action: string;
    icon?: string;
  };
  
  // פעולה משנית
  secondaryAction?: {
    label: string;
    action: string;
  };
}

const EMPTY_STATES: Record<string, EmptyState> = {
  // === פרויקטים ===
  'projects_empty': {
    icon: 'folder-plus',
    title: 'אין פרויקטים עדיין',
    description: 'צור את הפרויקט הראשון שלך והתחל לנהל את העבודה',
    primaryAction: { label: 'פרויקט חדש', action: 'create_project', icon: 'plus' },
    secondaryAction: { label: 'יבוא מקובץ', action: 'import' },
  },
  
  'projects_filtered_empty': {
    icon: 'filter-x',
    title: 'אין פרויקטים התואמים לסינון',
    description: 'נסה לשנות את הפילטרים או לנקות את החיפוש',
    primaryAction: { label: 'נקה פילטרים', action: 'clear_filters' },
  },
  
  // === משימות ===
  'tasks_empty': {
    icon: 'check-circle',
    title: 'אין משימות',
    description: 'הוסף משימות כדי לעקוב אחר ההתקדמות',
    primaryAction: { label: 'משימה חדשה', action: 'create_task', icon: 'plus' },
    secondaryAction: { label: 'טען מתבנית', action: 'load_template' },
  },
  
  'my_tasks_empty': {
    icon: 'check-circle',
    title: 'אין לך משימות פתוחות',
    description: 'כל הכבוד! סיימת את כל המשימות שלך',
  },
  
  'tasks_completed': {
    icon: 'party-popper',
    title: 'כל המשימות הושלמו!',
    description: 'עבודה מצוינת. הפרויקט מתקדם יפה.',
  },
  
  // === לקוחות ===
  'clients_empty': {
    icon: 'users',
    title: 'אין לקוחות עדיין',
    description: 'הוסף את הלקוח הראשון שלך',
    primaryAction: { label: 'לקוח חדש', action: 'create_client', icon: 'plus' },
    secondaryAction: { label: 'יבוא לקוחות', action: 'import_clients' },
  },
  
  // === ספקים ===
  'suppliers_empty': {
    icon: 'truck',
    title: 'אין ספקים עדיין',
    description: 'הוסף ספקים כדי לנהל הזמנות רכש',
    primaryAction: { label: 'ספק חדש', action: 'create_supplier', icon: 'plus' },
  },
  
  // === מוצרים ===
  'products_empty': {
    icon: 'package',
    title: 'הספרייה ריקה',
    description: 'הוסף מוצרים לספריית המוצרים שלך',
    primaryAction: { label: 'מוצר חדש', action: 'create_product', icon: 'plus' },
    secondaryAction: { label: 'יבוא מוצרים', action: 'import_products' },
  },
  
  'room_products_empty': {
    icon: 'package',
    title: 'אין מוצרים בחדר',
    description: 'הוסף מוצרים מהספרייה או צור חדשים',
    primaryAction: { label: 'הוסף מוצר', action: 'add_product', icon: 'plus' },
  },
  
  // === מסמכים ===
  'documents_empty': {
    icon: 'file-text',
    title: 'אין מסמכים',
    description: 'העלה מסמכים לפרויקט',
    primaryAction: { label: 'העלאת קובץ', action: 'upload_file', icon: 'upload' },
  },
  
  // === תשלומים ===
  'payments_empty': {
    icon: 'credit-card',
    title: 'לא הוגדרו תשלומים',
    description: 'הגדר את לוח התשלומים לפרויקט',
    primaryAction: { label: 'הוסף תשלום', action: 'add_payment', icon: 'plus' },
  },
  
  'payments_all_paid': {
    icon: 'check-circle',
    title: 'כל התשלומים התקבלו',
    description: 'אין תשלומים פתוחים בפרויקט זה',
  },
  
  // === הצעות מחיר ===
  'proposals_empty': {
    icon: 'file-text',
    title: 'אין הצעות מחיר',
    description: 'צור הצעת מחיר חדשה',
    primaryAction: { label: 'הצעה חדשה', action: 'create_proposal', icon: 'plus' },
  },
  
  // === פגישות ===
  'meetings_empty': {
    icon: 'calendar',
    title: 'אין פגישות מתוכננות',
    description: 'תזמן פגישה חדשה',
    primaryAction: { label: 'פגישה חדשה', action: 'create_meeting', icon: 'plus' },
  },
  
  'meetings_today_empty': {
    icon: 'calendar-check',
    title: 'אין פגישות היום',
    description: 'היומן פנוי היום',
  },
  
  // === הזמנות רכש ===
  'purchase_orders_empty': {
    icon: 'shopping-cart',
    title: 'אין הזמנות רכש',
    description: 'צור הזמנת רכש חדשה',
    primaryAction: { label: 'הזמנה חדשה', action: 'create_po', icon: 'plus' },
  },
  
  // === ליקויים ===
  'snag_items_empty': {
    icon: 'check-circle',
    title: 'אין ליקויים',
    description: 'לא נמצאו ליקויים בפרויקט זה',
  },
  
  // === תגובות ===
  'comments_empty': {
    icon: 'message-circle',
    title: 'אין תגובות עדיין',
    description: 'היה הראשון להגיב',
  },
  
  // === התראות ===
  'notifications_empty': {
    icon: 'bell',
    title: 'אין התראות חדשות',
    description: 'כשיהיה משהו חדש, תראה את זה כאן',
  },
  
  // === פעילות ===
  'activity_empty': {
    icon: 'clock',
    title: 'אין פעילות עדיין',
    description: 'פעולות בפרויקט יופיעו כאן',
  },
  
  // === חיפוש ===
  'search_no_results': {
    icon: 'search',
    title: 'לא נמצאו תוצאות',
    description: 'נסה מילות חיפוש אחרות או הסר חלק מהפילטרים',
    primaryAction: { label: 'נקה חיפוש', action: 'clear_search' },
  },
  
  // === Moodboard ===
  'moodboard_empty': {
    icon: 'image',
    title: 'לוח ההשראה ריק',
    description: 'הוסף תמונות, מוצרים וטקסטים',
    primaryAction: { label: 'הוסף פריט', action: 'add_item', icon: 'plus' },
  },
  
  // === דוחות יומיים ===
  'daily_logs_empty': {
    icon: 'clipboard',
    title: 'אין דוחות יומיים',
    description: 'תעד את הביקור הראשון שלך באתר',
    primaryAction: { label: 'דוח חדש', action: 'create_daily_log', icon: 'plus' },
  },
  
  // === אינטגרציות ===
  'integrations_empty': {
    icon: 'plug',
    title: 'אין אינטגרציות מחוברות',
    description: 'חבר את הכלים שאתה משתמש בהם',
    primaryAction: { label: 'הוסף אינטגרציה', action: 'browse_integrations', icon: 'plus' },
  },
  
  // === אוטומציות ===
  'automations_empty': {
    icon: 'zap',
    title: 'אין אוטומציות',
    description: 'צור אוטומציות לחסוך זמן',
    primaryAction: { label: 'אוטומציה חדשה', action: 'create_automation', icon: 'plus' },
  },
  
  // === תבניות ===
  'templates_empty': {
    icon: 'copy',
    title: 'אין תבניות',
    description: 'צור תבניות לשימוש חוזר',
    primaryAction: { label: 'תבנית חדשה', action: 'create_template', icon: 'plus' },
  },
  
  // === שעות עבודה ===
  'time_entries_empty': {
    icon: 'clock',
    title: 'לא נרשמו שעות',
    description: 'התחל לתעד את שעות העבודה שלך',
    primaryAction: { label: 'רישום שעות', action: 'log_time', icon: 'plus' },
  },
  
  // === הוצאות ===
  'expenses_empty': {
    icon: 'receipt',
    title: 'אין הוצאות',
    description: 'הוסף הוצאות פרויקט',
    primaryAction: { label: 'הוספת הוצאה', action: 'add_expense', icon: 'plus' },
  },
};
```

### הנחיות UI ל-Empty States

```typescript
interface EmptyStateUI {
  // מיקום
  position: 'center';
  
  // גודל
  maxWidth: '400px';
  
  // רכיבים
  components: {
    illustration: {
      size: '120px';
      opacity: 0.8;
      marginBottom: '24px';
    };
    title: {
      fontSize: '18px';
      fontWeight: 600;
      marginBottom: '8px';
    };
    description: {
      fontSize: '14px';
      color: 'gray-500';
      marginBottom: '24px';
    };
    primaryButton: {
      size: 'lg';
      variant: 'primary';
    };
    secondaryButton: {
      size: 'sm';
      variant: 'ghost';
    };
  };
}
```

---

## Loading States - מצבי טעינה

```typescript
interface LoadingStates {
  // Skeleton screens
  skeleton: {
    // לרשימות
    listSkeleton: {
      rows: 5;
      showAvatar: boolean;
      showActions: boolean;
    };
    
    // לכרטיסים
    cardSkeleton: {
      showImage: boolean;
      showTitle: boolean;
      showDescription: boolean;
    };
    
    // לטבלאות
    tableSkeleton: {
      rows: 10;
      columns: number;
    };
    
    // לפרופיל/דף ישות
    detailSkeleton: {
      showHeader: boolean;
      showTabs: boolean;
      contentSections: number;
    };
  };
  
  // Spinners
  spinner: {
    // כפתור
    buttonSpinner: { size: 'sm'; color: 'inherit' };
    
    // דף מלא
    fullPageSpinner: { size: 'lg'; text?: string };
    
    // inline
    inlineSpinner: { size: 'xs' };
  };
  
  // Progress
  progress: {
    // העלאת קובץ
    uploadProgress: { showPercent: true; showSpeed: true };
    
    // תהליך ארוך
    stepProgress: { showSteps: true; currentStep: number };
  };
}

// מתי להשתמש בכל סוג
const LOADING_USAGE = {
  // טעינה ראשונית של דף
  'page_load': 'skeleton',
  
  // טעינת נתונים נוספים (infinite scroll)
  'load_more': 'inline_spinner',
  
  // שליחת טופס
  'form_submit': 'button_spinner',
  
  // העלאת קובץ
  'file_upload': 'progress_bar',
  
  // מעבר בין דפים
  'navigation': 'top_progress_bar',       // NProgress style
  
  // פעולה מהירה (toggle, delete)
  'quick_action': 'optimistic_ui',        // ללא loading
  
  // חיפוש
  'search': 'debounce + inline_spinner',
};
```

---

## Error States - מצבי שגיאה

```typescript
interface ErrorState {
  type: 'inline' | 'toast' | 'modal' | 'page';
  severity: 'error' | 'warning' | 'info';
  
  title: string;
  message: string;
  
  // פעולות
  retryAction?: boolean;
  dismissable?: boolean;
  
  // טכני (לדיבוג)
  errorCode?: string;
  errorId?: string;
}

const ERROR_STATES: Record<string, ErrorState> = {
  // רשת
  'network_error': {
    type: 'toast',
    severity: 'error',
    title: 'בעיית חיבור',
    message: 'לא ניתן להתחבר לשרת. בדוק את החיבור לאינטרנט.',
    retryAction: true,
    dismissable: true,
  },
  
  // הרשאות
  'permission_denied': {
    type: 'page',
    severity: 'error',
    title: 'אין הרשאה',
    message: 'אין לך הרשאה לצפות בדף זה. פנה למנהל המערכת.',
  },
  
  // לא נמצא
  'not_found': {
    type: 'page',
    severity: 'warning',
    title: 'הדף לא נמצא',
    message: 'הדף שחיפשת לא קיים או שהוסר.',
  },
  
  // שגיאת שרת
  'server_error': {
    type: 'modal',
    severity: 'error',
    title: 'שגיאת שרת',
    message: 'אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר.',
    retryAction: true,
    errorId: true,
  },
  
  // ולידציה
  'validation_error': {
    type: 'inline',
    severity: 'error',
    title: '',
    message: '{{fieldErrors}}',
  },
  
  // פעולה נכשלה
  'action_failed': {
    type: 'toast',
    severity: 'error',
    title: 'הפעולה נכשלה',
    message: '{{actionName}} נכשל. {{reason}}',
    retryAction: true,
    dismissable: true,
  },
  
  // Session expired
  'session_expired': {
    type: 'modal',
    severity: 'warning',
    title: 'פג תוקף ההתחברות',
    message: 'יש להתחבר מחדש כדי להמשיך.',
    dismissable: false,
  },
  
  // Quota exceeded
  'quota_exceeded': {
    type: 'modal',
    severity: 'warning',
    title: 'הגעת למגבלה',
    message: '{{resourceName}} הגיע למקסימום. שדרג את התוכנית להמשך.',
  },
  
  // Conflict
  'conflict_error': {
    type: 'modal',
    severity: 'warning',
    title: 'קונפליקט בנתונים',
    message: 'מישהו אחר ערך את הנתונים בזמן שעבדת. בחר איזו גרסה לשמור.',
  },
  
  // Offline
  'offline_error': {
    type: 'toast',
    severity: 'warning',
    title: 'אין חיבור לאינטרנט',
    message: 'השינויים יישמרו כשהחיבור יחזור.',
    dismissable: true,
  },
};
```

---

## Success States - מצבי הצלחה

```typescript
interface SuccessState {
  type: 'toast' | 'inline' | 'modal';
  
  title?: string;
  message: string;
  
  // אנימציה
  animation?: 'check' | 'confetti' | 'none';
  
  // משך הצגה
  duration: number;                 // ms, 0 = manual dismiss
  
  // פעולה נוספת
  nextAction?: {
    label: string;
    action: string;
  };
}

const SUCCESS_MESSAGES: Record<string, SuccessState> = {
  // יצירה
  'created': {
    type: 'toast',
    message: '{{entityName}} נוצר בהצלחה',
    animation: 'check',
    duration: 3000,
    nextAction: { label: 'צפה', action: 'view' },
  },
  
  // עדכון
  'updated': {
    type: 'toast',
    message: 'השינויים נשמרו',
    animation: 'check',
    duration: 2000,
  },
  
  // מחיקה
  'deleted': {
    type: 'toast',
    message: '{{entityName}} נמחק',
    duration: 5000,
    nextAction: { label: 'בטל', action: 'undo' },
  },
  
  // שליחה
  'sent': {
    type: 'toast',
    message: 'נשלח בהצלחה',
    animation: 'check',
    duration: 3000,
  },
  
  // העלאה
  'uploaded': {
    type: 'toast',
    message: '{{count}} קבצים הועלו',
    animation: 'check',
    duration: 3000,
  },
  
  // הזמנה
  'ordered': {
    type: 'toast',
    message: 'ההזמנה נשלחה בהצלחה',
    animation: 'check',
    duration: 3000,
  },
  
  // אישור
  'approved': {
    type: 'toast',
    message: '{{itemName}} אושר',
    animation: 'check',
    duration: 3000,
  },
  
  // סיום פרויקט
  'project_completed': {
    type: 'modal',
    title: 'מזל טוב! 🎉',
    message: 'הפרויקט הושלם בהצלחה',
    animation: 'confetti',
    duration: 0,
  },
  
  // תשלום התקבל
  'payment_received': {
    type: 'toast',
    message: 'התשלום התקבל - {{amount}}',
    animation: 'check',
    duration: 4000,
  },
};
```

---

## Confirmation Dialogs - דיאלוגים לאישור

```typescript
interface ConfirmationDialog {
  title: string;
  message: string;
  
  // סוג
  variant: 'danger' | 'warning' | 'info';
  
  // כפתורים
  confirmLabel: string;
  cancelLabel: string;
  
  // אישור נוסף
  requireTypedConfirmation?: string;    // צריך להקליד טקסט לאישור
}

const CONFIRMATION_DIALOGS: Record<string, ConfirmationDialog> = {
  // מחיקת פרויקט
  'delete_project': {
    title: 'מחיקת פרויקט',
    message: 'האם למחוק את "{{projectName}}"? פעולה זו תמחק את כל המשימות, המסמכים והנתונים הקשורים.',
    variant: 'danger',
    confirmLabel: 'מחק פרויקט',
    cancelLabel: 'ביטול',
    requireTypedConfirmation: 'מחק',
  },
  
  // מחיקת לקוח
  'delete_client': {
    title: 'מחיקת לקוח',
    message: 'האם למחוק את "{{clientName}}"? הפרויקטים הקשורים לא יימחקו.',
    variant: 'danger',
    confirmLabel: 'מחק',
    cancelLabel: 'ביטול',
  },
  
  // מחיקת מסמך
  'delete_document': {
    title: 'מחיקת מסמך',
    message: 'האם למחוק את "{{documentName}}"?',
    variant: 'danger',
    confirmLabel: 'מחק',
    cancelLabel: 'ביטול',
  },
  
  // ביטול שינויים
  'discard_changes': {
    title: 'שינויים לא נשמרו',
    message: 'יש שינויים שלא נשמרו. האם לצאת בכל זאת?',
    variant: 'warning',
    confirmLabel: 'צא ללא שמירה',
    cancelLabel: 'המשך לערוך',
  },
  
  // שליחת הצעה
  'send_proposal': {
    title: 'שליחת הצעת מחיר',
    message: 'ההצעה תישלח ל-{{clientEmail}}. לא ניתן לערוך אחרי השליחה.',
    variant: 'info',
    confirmLabel: 'שלח',
    cancelLabel: 'חזור',
  },
  
  // ביטול מנוי
  'cancel_subscription': {
    title: 'ביטול מנוי',
    message: 'המנוי יבוטל בסוף תקופת החיוב הנוכחית. תוכל להמשיך להשתמש עד {{endDate}}.',
    variant: 'warning',
    confirmLabel: 'בטל מנוי',
    cancelLabel: 'השאר מנוי',
  },
  
  // הסרת משתמש מצוות
  'remove_team_member': {
    title: 'הסרת משתמש',
    message: 'האם להסיר את {{userName}} מהצוות? המשתמש יאבד גישה לכל הפרויקטים.',
    variant: 'danger',
    confirmLabel: 'הסר',
    cancelLabel: 'ביטול',
  },
  
  // ארכוב פרויקט
  'archive_project': {
    title: 'ארכוב פרויקט',
    message: 'הפרויקט יועבר לארכיון. תוכל לשחזר אותו בכל עת.',
    variant: 'warning',
    confirmLabel: 'העבר לארכיון',
    cancelLabel: 'ביטול',
  },
};
```

---

## Form States - מצבי טפסים

```typescript
interface FormStates {
  // שדה
  field: {
    default: { border: 'gray-300', background: 'white' };
    focus: { border: 'blue-500', ring: true };
    error: { border: 'red-500', icon: 'x-circle' };
    success: { border: 'green-500', icon: 'check-circle' };
    disabled: { background: 'gray-100', cursor: 'not-allowed' };
    readonly: { background: 'gray-50' };
  };
  
  // הודעות
  messages: {
    error: { color: 'red-600', icon: 'x-circle' };
    warning: { color: 'yellow-600', icon: 'alert-triangle' };
    hint: { color: 'gray-500', icon: 'info' };
    success: { color: 'green-600', icon: 'check-circle' };
  };
  
  // כפתור שליחה
  submitButton: {
    idle: { enabled: true, text: 'שמור' };
    submitting: { disabled: true, spinner: true, text: 'שומר...' };
    success: { disabled: true, icon: 'check', text: 'נשמר!' };
    error: { enabled: true, shake: true, text: 'שמור' };
  };
}
```

---

## Bulk Actions - פעולות מרובות

```typescript
interface BulkActionsUI {
  // הפעלה
  trigger: {
    showOnSelect: true;
    minSelected: 1;
  };
  
  // Bar
  actionBar: {
    position: 'bottom';
    sticky: true;
    
    // מידע
    showSelectedCount: true;
    showSelectAll: true;
    showDeselectAll: true;
    
    // פעולות
    actions: BulkAction[];
  };
}

interface BulkAction {
  id: string;
  label: string;
  icon: string;
  
  // זמינות
  minSelected?: number;
  maxSelected?: number;
  
  // אישור
  requireConfirmation: boolean;
  confirmationMessage?: string;
  
  // סוג
  variant: 'default' | 'danger';
}

const BULK_ACTIONS: Record<string, BulkAction[]> = {
  'tasks': [
    { id: 'complete', label: 'סמן כהושלם', icon: 'check', requireConfirmation: false, variant: 'default' },
    { id: 'assign', label: 'הקצה ל...', icon: 'user', requireConfirmation: false, variant: 'default' },
    { id: 'move', label: 'העבר לפרויקט', icon: 'folder', requireConfirmation: false, variant: 'default' },
    { id: 'set_due', label: 'קבע תאריך', icon: 'calendar', requireConfirmation: false, variant: 'default' },
    { id: 'set_priority', label: 'קבע עדיפות', icon: 'flag', requireConfirmation: false, variant: 'default' },
    { id: 'delete', label: 'מחק', icon: 'trash', variant: 'danger', requireConfirmation: true, confirmationMessage: 'האם למחוק {{count}} משימות?' },
  ],
  
  'files': [
    { id: 'download', label: 'הורד', icon: 'download', requireConfirmation: false, variant: 'default' },
    { id: 'move', label: 'העבר לתיקייה', icon: 'folder', requireConfirmation: false, variant: 'default' },
    { id: 'share', label: 'שתף', icon: 'share', requireConfirmation: false, variant: 'default' },
    { id: 'delete', label: 'מחק', icon: 'trash', variant: 'danger', requireConfirmation: true },
  ],
  
  'products': [
    { id: 'approve', label: 'אשר', icon: 'check', requireConfirmation: false, variant: 'default' },
    { id: 'order', label: 'הזמן', icon: 'shopping-cart', requireConfirmation: false, variant: 'default' },
    { id: 'update_status', label: 'עדכן סטטוס', icon: 'refresh', requireConfirmation: false, variant: 'default' },
    { id: 'remove', label: 'הסר מהחדר', icon: 'x', variant: 'danger', requireConfirmation: true },
  ],
  
  'clients': [
    { id: 'send_email', label: 'שלח מייל', icon: 'mail', requireConfirmation: false, variant: 'default' },
    { id: 'add_label', label: 'הוסף תגית', icon: 'tag', requireConfirmation: false, variant: 'default' },
    { id: 'export', label: 'ייצא', icon: 'download', requireConfirmation: false, variant: 'default' },
  ],
  
  'notifications': [
    { id: 'mark_read', label: 'סמן כנקרא', icon: 'check', requireConfirmation: false, variant: 'default' },
    { id: 'delete', label: 'מחק', icon: 'trash', variant: 'danger', requireConfirmation: false },
  ],
};
```

---

## Drag & Drop

```typescript
interface DragDropConfig {
  // סוגים
  draggableTypes: {
    'task': { acceptIn: ['task_list', 'kanban_column', 'calendar'] };
    'file': { acceptIn: ['folder', 'upload_zone'] };
    'product': { acceptIn: ['room', 'moodboard'] };
    'column': { acceptIn: ['table_header'] };
    'widget': { acceptIn: ['dashboard'] };
    'moodboard_item': { acceptIn: ['moodboard'] };
  };
  
  // ויזואלי
  visuals: {
    dragPreview: 'ghost' | 'custom';
    dropIndicator: 'line' | 'highlight';
    invalidDropStyle: 'red_border';
  };
  
  // אנימציות
  animations: {
    pickUp: 'scale_up';
    drop: 'settle';
    reorder: 'smooth_move';
  };
}
```

---

## הנחיות כלליות

1. **Empty States:**
   - תמיד להציג פעולה ראשית
   - איור/איקון להוספת ויזואליות
   - טקסט קצר ומעודד

2. **Loading:**
   - Skeleton > Spinner לטעינות ארוכות
   - Optimistic UI לפעולות מהירות
   - לעולם לא לחסום UI לגמרי

3. **Errors:**
   - הודעות ברורות בעברית
   - תמיד לתת אפשרות retry אם רלוונטי
   - לוג מזהה שגיאה לתמיכה

4. **Success:**
   - משוב מיידי וקצר
   - אנימציות עדינות
   - אפשרות Undo כשרלוונטי
# מסמך אפיון - חלק כז (המשך)
## UX States & Patterns - המשך

---

## Loading States (המשך)

```typescript
interface LoadingStates {
  // Skeleton screens
  skeleton: {
    // לרשימות
    listSkeleton: {
      rows: 5,
      showAvatar: boolean,
      showActions: boolean,
    },
    
    // לכרטיסים
    cardSkeleton: {
      showImage: boolean,
      showTitle: boolean,
      showDescription: boolean,
    },
    
    // לטבלאות
    tableSkeleton: {
      rows: 10,
      columns: number,
    },
    
    // לפרופיל/דף ישות
    detailSkeleton: {
      showHeader: boolean,
      showTabs: boolean,
      contentSections: number,
    },
  },
  
  // Spinners
  spinner: {
    // כפתור
    buttonSpinner: { size: 'sm', color: 'inherit' },
    
    // דף מלא
    fullPageSpinner: { size: 'lg', text?: string },
    
    // inline
    inlineSpinner: { size: 'xs' },
  },
  
  // Progress
  progress: {
    // העלאת קובץ
    uploadProgress: { showPercent: true, showSpeed: true },
    
    // תהליך ארוך
    stepProgress: { showSteps: true, currentStep: number },
  },
}
```

### שימוש בסוגי Loading

```typescript
const LOADING_USAGE = {
  // טעינה ראשונית של דף
  'page_load': 'skeleton',
  
  // טעינת נתונים נוספים (infinite scroll)
  'load_more': 'inline_spinner',
  
  // שליחת טופס
  'form_submit': 'button_spinner',
  
  // העלאת קובץ
  'file_upload': 'progress_bar',
  
  // מעבר בין דפים
  'navigation': 'top_progress_bar',       // NProgress style
  
  // פעולה מהירה (toggle, delete)
  'quick_action': 'optimistic_ui',        // ללא loading
  
  // חיפוש
  'search': 'debounce + inline_spinner',
};
```

---

## Error States

```typescript
interface ErrorState {
  type: 'inline' | 'toast' | 'modal' | 'page';
  
  severity: 'error' | 'warning' | 'info';
  
  title: string;
  message: string;
  
  // פעולות
  retryAction?: boolean;
  dismissable?: boolean;
  
  // טכני (לדיבוג)
  errorCode?: string;
  errorId?: string;
}

const ERROR_STATES = {
  // רשת
  'network_error': {
    type: 'toast',
    severity: 'error',
    title: 'בעיית חיבור',
    message: 'לא ניתן להתחבר לשרת. בדוק את החיבור לאינטרנט.',
    retryAction: true,
  },
  
  // הרשאות
  'permission_denied': {
    type: 'page',
    severity: 'error',
    title: 'אין הרשאה',
    message: 'אין לך הרשאה לצפות בדף זה.',
  },
  
  // לא נמצא
  'not_found': {
    type: 'page',
    severity: 'warning',
    title: 'הדף לא נמצא',
    message: 'הדף שחיפשת לא קיים או שהוסר.',
  },
  
  // שגיאת שרת
  'server_error': {
    type: 'modal',
    severity: 'error',
    title: 'שגיאת שרת',
    message: 'אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר.',
    errorId: true,
  },
  
  // ולידציה
  'validation_error': {
    type: 'inline',
    severity: 'error',
    title: '',
    message: '{{fieldErrors}}',
  },
  
  // פעולה נכשלה
  'action_failed': {
    type: 'toast',
    severity: 'error',
    title: 'הפעולה נכשלה',
    message: '{{actionName}} נכשל. {{reason}}',
    retryAction: true,
  },
  
  // Session expired
  'session_expired': {
    type: 'modal',
    severity: 'warning',
    title: 'פג תוקף ההתחברות',
    message: 'יש להתחבר מחדש כדי להמשיך.',
    dismissable: false,
  },
};
```

---

## Success States

```typescript
interface SuccessState {
  type: 'toast' | 'inline' | 'modal';
  
  title?: string;
  message: string;
  
  // אנימציה
  animation?: 'check' | 'confetti' | 'none';
  
  // משך הצגה
  duration: number;                 // ms, 0 = manual dismiss
  
  // פעולה נוספת
  nextAction?: {
    label: string;
    action: string;
  };
}

const SUCCESS_MESSAGES = {
  // יצירה
  'created': {
    type: 'toast',
    message: '{{entityName}} נוצר בהצלחה',
    duration: 3000,
    nextAction: { label: 'צפה', action: 'view' },
  },
  
  // עדכון
  'updated': {
    type: 'toast',
    message: 'השינויים נשמרו',
    duration: 2000,
  },
  
  // מחיקה
  'deleted': {
    type: 'toast',
    message: '{{entityName}} נמחק',
    duration: 5000,
    nextAction: { label: 'בטל', action: 'undo' },
  },
  
  // שליחה
  'sent': {
    type: 'toast',
    message: 'נשלח בהצלחה',
    duration: 3000,
  },
  
  // העלאה
  'uploaded': {
    type: 'toast',
    message: '{{count}} קבצים הועלו',
    duration: 3000,
  },
  
  // פעולה גדולה
  'big_action_complete': {
    type: 'modal',
    title: 'הפעולה הושלמה',
    message: '{{description}}',
    animation: 'confetti',
    duration: 0,
  },
};
```

---

## Confirmation Dialogs

```typescript
interface ConfirmationDialog {
  title: string;
  message: string;
  
  // סוג
  variant: 'danger' | 'warning' | 'info';
  
  // כפתורים
  confirmLabel: string;
  cancelLabel: string;
  
  // אישור נוסף
  requireTypedConfirmation?: string;    // "מחק" - צריך להקליד
}

const CONFIRMATION_DIALOGS = {
  // מחיקת פרויקט
  'delete_project': {
    title: 'מחיקת פרויקט',
    message: 'האם למחוק את "{{projectName}}"? פעולה זו תמחק את כל המשימות, המסמכים והנתונים הקשורים.',
    variant: 'danger',
    confirmLabel: 'מחק פרויקט',
    cancelLabel: 'ביטול',
    requireTypedConfirmation: 'מחק',
  },
  
  // מחיקת לקוח
  'delete_client': {
    title: 'מחיקת לקוח',
    message: 'האם למחוק את "{{clientName}}"? הפרויקטים הקשורים לא יימחקו.',
    variant: 'danger',
    confirmLabel: 'מחק',
    cancelLabel: 'ביטול',
  },
  
  // ביטול שינויים
  'discard_changes': {
    title: 'שינויים לא נשמרו',
    message: 'יש שינויים שלא נשמרו. האם לצאת בכל זאת?',
    variant: 'warning',
    confirmLabel: 'צא ללא שמירה',
    cancelLabel: 'המשך לערוך',
  },
  
  // שליחת הצעה
  'send_proposal': {
    title: 'שליחת הצעת מחיר',
    message: 'ההצעה תישלח ל-{{clientEmail}}. לא ניתן לערוך אחרי השליחה.',
    variant: 'info',
    confirmLabel: 'שלח',
    cancelLabel: 'חזור',
  },
  
  // ביטול מנוי
  'cancel_subscription': {
    title: 'ביטול מנוי',
    message: 'המנוי יבוטל בסוף תקופת החיוב הנוכחית. תוכל להמשיך להשתמש עד {{endDate}}.',
    variant: 'warning',
    confirmLabel: 'בטל מנוי',
    cancelLabel: 'השאר מנוי',
  },
};
```

---

## Form States

```typescript
interface FormStates {
  // שדה
  field: {
    default: { border: 'gray-300' },
    focus: { border: 'blue-500', ring: true },
    error: { border: 'red-500', icon: 'error' },
    success: { border: 'green-500', icon: 'check' },
    disabled: { background: 'gray-100', cursor: 'not-allowed' },
    readonly: { background: 'gray-50' },
  },
  
  // הודעות
  messages: {
    error: { color: 'red', icon: 'x-circle' },
    warning: { color: 'yellow', icon: 'alert-triangle' },
    hint: { color: 'gray', icon: 'info' },
    success: { color: 'green', icon: 'check-circle' },
  },
  
  // כפתור שליחה
  submitButton: {
    idle: { enabled: true },
    submitting: { disabled: true, spinner: true, text: 'שומר...' },
    success: { disabled: true, icon: 'check', text: 'נשמר!' },
    error: { enabled: true, shake: true },
  },
}
```

---

## Bulk Actions

```typescript
interface BulkActionsUI {
  // הפעלה
  trigger: {
    showOnSelect: true,
    minSelected: 1,
  },
  
  // Bar
  actionBar: {
    position: 'bottom' | 'top',
    sticky: true,
    
    // מידע
    showSelectedCount: true,
    showSelectAll: true,
    
    // פעולות
    actions: BulkAction[],
  },
}

interface BulkAction {
  id: string;
  label: string;
  icon: string;
  
  // זמינות
  minSelected?: number;
  maxSelected?: number;
  
  // אישור
  requireConfirmation: boolean;
  confirmationMessage?: string;
  
  // סוג
  variant: 'default' | 'danger';
}

const BULK_ACTIONS = {
  'tasks': [
    { id: 'complete', label: 'סמן כהושלם', icon: 'check' },
    { id: 'assign', label: 'הקצה ל...', icon: 'user' },
    { id: 'move', label: 'העבר לפרויקט', icon: 'folder' },
    { id: 'set_due', label: 'קבע תאריך', icon: 'calendar' },
    { id: 'delete', label: 'מחק', icon: 'trash', variant: 'danger', requireConfirmation: true },
  ],
  
  'files': [
    { id: 'download', label: 'הורד', icon: 'download' },
    { id: 'move', label: 'העבר לתיקייה', icon: 'folder' },
    { id: 'share', label: 'שתף', icon: 'share' },
    { id: 'delete', label: 'מחק', icon: 'trash', variant: 'danger', requireConfirmation: true },
  ],
  
  'products': [
    { id: 'approve', label: 'אשר', icon: 'check' },
    { id: 'order', label: 'הזמן', icon: 'shopping-cart' },
    { id: 'update_status', label: 'עדכן סטטוס', icon: 'refresh' },
  ],
};
```

---

## Drag & Drop

```typescript
interface DragDropConfig {
  // סוגים
  draggableTypes: {
    'task': { acceptIn: ['task_list', 'kanban_column', 'calendar'] },
    'file': { acceptIn: ['folder', 'upload_zone'] },
    'product': { acceptIn: ['room', 'moodboard'] },
    'column': { acceptIn: ['table_header'] },
  },
  
  // ויזואלי
  visuals: {
    dragPreview: 'ghost' | 'custom',
    dropIndicator: 'line' | 'highlight',
    invalidDropStyle: 'red_border',
  },
  
  // אנימציות
  animations: {
    pickUp: 'scale_up',
    drop: 'settle',
    reorder: 'smooth_move',
  },
}
```

---

# מסמך אפיון - חלק כח
## Mobile & Offline

---

# לד. תמיכה במובייל

## Responsive Design

```typescript
interface ResponsiveBreakpoints {
  // Breakpoints
  breakpoints: {
    mobile: '< 640px',
    tablet: '640px - 1024px',
    desktop: '> 1024px',
  },
  
  // Layout changes
  layouts: {
    mobile: {
      sidebar: 'hidden',              // hamburger menu
      navigation: 'bottom_tabs',
      tables: 'card_view',
      modals: 'full_screen',
    },
    tablet: {
      sidebar: 'collapsed',
      navigation: 'sidebar',
      tables: 'horizontal_scroll',
      modals: 'centered',
    },
    desktop: {
      sidebar: 'expanded',
      navigation: 'sidebar',
      tables: 'full',
      modals: 'centered',
    },
  },
}
```

## Mobile Navigation

```typescript
interface MobileNavigation {
  // Bottom tabs
  bottomTabs: {
    items: [
      { id: 'home', label: 'בית', icon: 'home', route: '/dashboard' },
      { id: 'projects', label: 'פרויקטים', icon: 'folder', route: '/projects' },
      { id: 'add', label: 'חדש', icon: 'plus', action: 'open_quick_add' },
      { id: 'calendar', label: 'יומן', icon: 'calendar', route: '/calendar' },
      { id: 'more', label: 'עוד', icon: 'menu', action: 'open_menu' },
    ],
    
    // Badge
    showBadge: { notifications: true },
  },
  
  // Quick add menu
  quickAddMenu: {
    items: [
      { label: 'משימה', icon: 'check-square', action: 'create_task' },
      { label: 'פגישה', icon: 'calendar', action: 'create_meeting' },
      { label: 'הערה', icon: 'edit', action: 'create_note' },
      { label: 'צילום', icon: 'camera', action: 'take_photo' },
    ],
  },
  
  // Hamburger menu
  drawerMenu: {
    header: { showUser: true, showTenant: true },
    sections: [
      { title: 'ניווט', items: ['dashboard', 'projects', 'clients', 'calendar'] },
      { title: 'כלים', items: ['reports', 'library', 'settings'] },
    ],
  },
}
```

## Touch Interactions

```typescript
interface TouchInteractions {
  // Gestures
  gestures: {
    swipeRight: 'go_back',
    swipeLeft: 'delete' | 'archive',
    longPress: 'context_menu',
    pullDown: 'refresh',
    pinch: 'zoom',
  },
  
  // Touch targets
  touchTargets: {
    minSize: '44px',                  // Apple guidelines
    spacing: '8px',
  },
  
  // Swipe actions (lists)
  swipeActions: {
    left: [
      { action: 'delete', color: 'red', icon: 'trash' },
    ],
    right: [
      { action: 'complete', color: 'green', icon: 'check' },
      { action: 'edit', color: 'blue', icon: 'edit' },
    ],
  },
}
```

## Mobile-Specific Features

```typescript
interface MobileFeatures {
  // Camera
  camera: {
    takePhoto: true,
    scanDocument: true,
    scanQR: true,
    videoRecord: true,
  },
  
  // Location
  location: {
    getCurrentLocation: true,
    trackVisit: true,
    geofencing: false,
  },
  
  // Notifications
  pushNotifications: {
    enabled: true,
    categories: ['tasks', 'meetings', 'approvals', 'messages'],
  },
  
  // Share
  nativeShare: {
    shareFile: true,
    shareLink: true,
    receiveShare: true,             // קבלת קבצים מאפליקציות אחרות
  },
  
  // Biometrics
  biometricAuth: {
    faceId: true,
    touchId: true,
    fallbackToPin: true,
  },
}
```

---

# לה. Offline Support

## Offline Strategy

```typescript
interface OfflineStrategy {
  // מה זמין offline
  offlineCapabilities: {
    // קריאה
    viewProjects: true,
    viewTasks: true,
    viewContacts: true,
    viewDocuments: 'cached_only',
    
    // כתיבה
    createTask: true,
    updateTask: true,
    addComment: true,
    takePhoto: true,
    createDailyLog: true,
    
    // לא זמין
    sendEmail: false,
    processPayment: false,
    runAutomation: false,
  },
  
  // סנכרון
  syncStrategy: {
    // מתי לסנכרן
    triggers: ['app_open', 'connection_restored', 'manual', 'periodic'],
    
    // תדירות
    periodicInterval: 5 * 60 * 1000,    // 5 דקות
    
    // סדר עדיפות
    syncOrder: ['pending_changes', 'critical_data', 'full_sync'],
  },
}
```

## Offline Data Storage

```typescript
interface OfflineStorage {
  // מה לשמור
  cachedData: {
    // תמיד
    always: ['user_settings', 'tenant_config', 'active_projects'],
    
    // אחרונים
    recent: {
      projects: 10,
      tasks: 100,
      contacts: 50,
      documents: 20,
    },
    
    // לפי בקשה
    onDemand: ['archived_projects', 'old_documents'],
  },
  
  // מגבלות
  limits: {
    maxStorageMB: 500,
    maxFilesizeMB: 50,
    maxCachedFiles: 100,
  },
  
  // Storage API
  storage: 'IndexedDB',
  encryption: true,
}
```

## Pending Changes Queue

```typescript
interface PendingChange {
  id: string;
  
  // פעולה
  action: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  
  // נתונים
  data: any;
  
  // מטא
  createdAt: Date;
  attempts: number;
  lastAttempt?: Date;
  
  // סטטוס
  status: 'pending' | 'syncing' | 'failed' | 'conflict';
  error?: string;
}

interface SyncManager {
  // Queue
  pendingChanges: PendingChange[];
  
  // Methods
  addChange(change: PendingChange): void;
  processQueue(): Promise<void>;
  resolveConflict(changeId: string, resolution: 'local' | 'remote' | 'merge'): void;
  
  // Status
  syncStatus: 'idle' | 'syncing' | 'offline' | 'error';
  lastSyncAt: Date;
  pendingCount: number;
}
```

## Conflict Resolution

```typescript
interface ConflictResolution {
  // סוגי conflicts
  conflictTypes: {
    'concurrent_edit': 'שני משתמשים ערכו בו זמנית',
    'deleted_remotely': 'נמחק על ידי משתמש אחר',
    'parent_deleted': 'הפרויקט נמחק',
  },
  
  // אסטרטגיות
  strategies: {
    default: 'last_write_wins',
    
    // לפי entity
    byEntity: {
      task: 'prompt_user',
      comment: 'keep_both',
      document: 'keep_both',
      payment: 'server_wins',
    },
  },
  
  // UI
  conflictUI: {
    showNotification: true,
    showDiff: true,
    allowMerge: true,
  },
}
```

## Offline UI Indicators

```typescript
interface OfflineUI {
  // Status bar
  statusBar: {
    offline: { color: 'yellow', text: 'אופליין - שינויים יסונכרנו כשתהיה רשת' },
    syncing: { color: 'blue', text: 'מסנכרן...', showProgress: true },
    error: { color: 'red', text: 'שגיאת סנכרון', showRetry: true },
    synced: { color: 'green', text: 'מסונכרן', autohide: 3000 },
  },
  
  // Entity indicators
  entityIndicators: {
    pendingSync: { icon: 'cloud-off', tooltip: 'ממתין לסנכרון' },
    syncError: { icon: 'alert-circle', tooltip: 'שגיאת סנכרון' },
    conflict: { icon: 'git-merge', tooltip: 'יש קונפליקט' },
  },
  
  // Disabled features
  disabledFeatures: {
    style: 'grayed_out',
    showTooltip: 'לא זמין אופליין',
    allowClick: false,
  },
}
```

---

## הנחיות למימוש - Mobile & Offline

1. **PWA:**
   - Service Worker לקליטת cache ו-offline
   - Web App Manifest
   - Install prompt

2. **Storage:**
   - IndexedDB לנתונים מובנים
   - Cache API לקבצים סטטיים
   - Background Sync API

3. **Performance:**
   - Lazy loading לתמונות
   - Virtual scrolling לרשימות ארוכות
   - Code splitting לפי route

4. **Testing:**
   - Test offline scenarios
   - Test slow connections (3G)
   - Test sync conflicts
# מסמך אפיון - חלק כט
## Security & Privacy - אבטחה ופרטיות

---

# לו. אבטחה

## Authentication Security

```typescript
interface AuthenticationSecurity {
  // סיסמאות
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
    preventCommonPasswords: true,
    preventReuse: 5,                  // 5 סיסמאות אחרונות
  },
  
  // ניסיונות כניסה
  loginAttempts: {
    maxAttempts: 5,
    lockoutDuration: 15 * 60,         // 15 דקות
    progressiveDelay: true,           // עיכוב גדל בין ניסיונות
  },
  
  // Sessions
  sessions: {
    accessTokenTTL: 24 * 60 * 60,     // 24 שעות
    refreshTokenTTL: 30 * 24 * 60 * 60, // 30 ימים
    maxConcurrentSessions: 5,
    invalidateOnPasswordChange: true,
  },
  
  // 2FA
  twoFactor: {
    available: true,
    required: false,                  // תלוי plan
    methods: ['totp', 'sms'],
    backupCodes: 10,
  },
}
```

## Data Security

```typescript
interface DataSecurity {
  // הצפנה
  encryption: {
    // At rest
    atRest: {
      database: 'AES-256',
      files: 'AES-256',
      backups: 'AES-256',
    },
    
    // In transit
    inTransit: {
      protocol: 'TLS 1.3',
      certificateType: 'EV SSL',
    },
    
    // שדות רגישים
    sensitiveFields: [
      'password',
      'apiKey',
      'accessToken',
      'refreshToken',
      'creditCard',
      'bankAccount',
    ],
  },
  
  // גיבוי
  backup: {
    frequency: 'daily',
    retention: 30,                    // ימים
    encryption: true,
    geoRedundant: true,
  },
  
  // Secrets management
  secrets: {
    storage: 'environment' | 'vault',
    rotation: 90,                     // ימים
  },
}
```

## Access Control

```typescript
interface AccessControl {
  // RBAC
  roles: {
    'owner': { all: true },
    'manager': { manage: true, delete: false },
    'member': { read: true, write: true, manage: false },
    'viewer': { read: true },
  },
  
  // Permissions
  permissions: Permission[],
  
  // Row Level Security
  rls: {
    enabled: true,
    byTenant: true,
    byProject: true,
    byUser: false,                    // optional
  },
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
}

const PERMISSIONS = [
  { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'manage'] },
  { resource: 'tasks', actions: ['create', 'read', 'update', 'delete'] },
  { resource: 'clients', actions: ['create', 'read', 'update', 'delete'] },
  { resource: 'payments', actions: ['create', 'read', 'update', 'delete'] },
  { resource: 'team', actions: ['read', 'invite', 'remove', 'manage'] },
  { resource: 'settings', actions: ['read', 'update'] },
  { resource: 'billing', actions: ['read', 'manage'] },
  { resource: 'integrations', actions: ['read', 'connect', 'disconnect'] },
  { resource: 'reports', actions: ['read', 'create', 'export'] },
];
```

## API Security

```typescript
interface APISecurity {
  // Rate limiting
  rateLimiting: {
    global: '1000/minute',
    perEndpoint: {
      'auth/*': '10/minute',
      'api/*': '100/minute',
      'upload/*': '20/minute',
    },
    perTenant: true,
    perUser: true,
  },
  
  // CORS
  cors: {
    allowedOrigins: ['https://app.example.com'],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowCredentials: true,
    maxAge: 86400,
  },
  
  // Headers
  securityHeaders: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': "default-src 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
  
  // Validation
  inputValidation: {
    sanitizeInput: true,
    validateTypes: true,
    maxPayloadSize: '10mb',
  },
}
```

## Audit Logging

```typescript
interface AuditLog {
  id: string;
  tenantId: string;
  
  // מי
  userId: string;
  userEmail: string;
  userRole: string;
  
  // מה
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  
  // פרטים
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  
  // מאיפה
  ipAddress: string;
  userAgent: string;
  location?: string;
  
  // מתי
  timestamp: Date;
  
  // סטטוס
  status: 'success' | 'failure';
  errorMessage?: string;
}

// אילו פעולות לתעד
const AUDITED_ACTIONS = [
  // Authentication
  'auth.login',
  'auth.logout',
  'auth.password_change',
  'auth.2fa_enable',
  'auth.2fa_disable',
  
  // Users
  'user.invite',
  'user.remove',
  'user.role_change',
  
  // Data - sensitive
  'client.create',
  'client.delete',
  'payment.create',
  'payment.update',
  'contract.sign',
  
  // Settings
  'settings.update',
  'integration.connect',
  'integration.disconnect',
  
  // Export
  'data.export',
  'report.download',
];
```

---

# לז. פרטיות (GDPR/Privacy)

## Data Collection

```typescript
interface PrivacyPolicy {
  // מה אוספים
  dataCollected: {
    // הכרחי
    essential: [
      'email',
      'name',
      'phone',
      'business_info',
    ],
    
    // אופציונלי
    optional: [
      'profile_photo',
      'location',
      'usage_analytics',
    ],
    
    // אוטומטי
    automatic: [
      'ip_address',
      'device_info',
      'usage_logs',
    ],
  },
  
  // מטרות
  purposes: [
    'service_delivery',
    'customer_support',
    'product_improvement',
    'marketing',               // requires consent
  ],
  
  // שמירה
  retention: {
    activeAccount: 'indefinite',
    deletedAccount: '30 days',
    logs: '90 days',
    backups: '30 days',
  },
}
```

## User Rights

```typescript
interface UserRights {
  // Right to Access
  dataAccess: {
    enabled: true,
    format: ['json', 'csv'],
    deliveryTime: '30 days',
    endpoint: 'GET /api/privacy/my-data',
  },
  
  // Right to Portability
  dataPortability: {
    enabled: true,
    format: 'json',
    includesFiles: true,
    endpoint: 'POST /api/privacy/export',
  },
  
  // Right to Erasure
  dataErasure: {
    enabled: true,
    softDelete: true,
    permanentAfter: '30 days',
    endpoint: 'DELETE /api/privacy/my-account',
    
    // מה נמחק
    deletes: [
      'user_profile',
      'user_settings',
      'personal_files',
    ],
    
    // מה נשמר (anonymized)
    retains: [
      'audit_logs',
      'financial_records',        // חובה חוקית
    ],
  },
  
  // Right to Rectification
  dataRectification: {
    enabled: true,
    selfService: true,
    endpoint: 'PATCH /api/users/me',
  },
  
  // Right to Restrict Processing
  processingRestriction: {
    enabled: true,
    options: ['marketing', 'analytics'],
    endpoint: 'PATCH /api/privacy/preferences',
  },
}
```

## Consent Management

```typescript
interface ConsentManagement {
  // סוגי הסכמות
  consentTypes: {
    essential: {
      required: true,
      description: 'נדרש לתפעול השירות',
    },
    analytics: {
      required: false,
      description: 'עוזר לנו לשפר את השירות',
      default: true,
    },
    marketing: {
      required: false,
      description: 'קבלת עדכונים ומבצעים',
      default: false,
    },
    thirdParty: {
      required: false,
      description: 'שיתוף עם שותפים',
      default: false,
    },
  },
  
  // לוג הסכמות
  consentLog: {
    trackChanges: true,
    retainHistory: true,
  },
  
  // UI
  consentUI: {
    showOnFirstVisit: true,
    allowGranular: true,
    easyWithdrawal: true,
  },
}

interface ConsentRecord {
  id: string;
  userId: string;
  
  consentType: string;
  granted: boolean;
  
  // מתי
  grantedAt?: Date;
  withdrawnAt?: Date;
  
  // איך
  method: 'signup' | 'settings' | 'banner';
  ipAddress: string;
  
  // גרסה
  policyVersion: string;
}
```

## Data Processing

```typescript
interface DataProcessing {
  // עיבוד פנימי
  internal: {
    purpose: 'service_delivery',
    basis: 'contract',
  },
  
  // ספקי משנה (Sub-processors)
  subProcessors: [
    {
      name: 'AWS',
      purpose: 'hosting',
      location: 'EU',
      dpa: true,
    },
    {
      name: 'SendGrid',
      purpose: 'email',
      location: 'US',
      dpa: true,
      sccs: true,               // Standard Contractual Clauses
    },
    {
      name: 'Stripe',
      purpose: 'payments',
      location: 'US',
      dpa: true,
      sccs: true,
    },
  ],
  
  // העברות בינלאומיות
  internationalTransfers: {
    mechanism: 'sccs',
    adequacyDecision: false,
  },
}
```

## Privacy API

```typescript
// Privacy endpoints
GET /api/privacy/policy                    // מדיניות פרטיות
GET /api/privacy/my-data                   // ייצוא נתונים אישיים
POST /api/privacy/export                   // בקשת ייצוא מלא
DELETE /api/privacy/my-account             // מחיקת חשבון

GET /api/privacy/consents                  // הסכמות נוכחיות
PATCH /api/privacy/consents                // עדכון הסכמות

GET /api/privacy/data-processors           // רשימת ספקי משנה
```

---

# לח. סיכום כללי

## רשימת ישויות מלאה

### Core (6)
1. Tenant
2. User
3. Project
4. Client
5. Supplier
6. Professional

### Project Related (12)
7. Room
8. Task
9. Document
10. Meeting
11. MoodBoard
12. MoodBoardItem

### Product & Procurement (5)
13. Product
14. RoomProduct
15. PurchaseOrder
16. PurchaseOrderItem
17. DeliveryTracking

### Financial (7)
18. Proposal
19. ProposalItem
20. Contract
21. Retainer
22. Payment
23. Expense
24. TimeEntry

### Change Management (3)
25. ChangeOrder
26. DesignOption
27. SnagItem

### Client Portal (2)
28. ClientPortalSettings
29. ClientApproval

### Communication & Tracking (2)
30. CommunicationLog
31. ActivityLog

### Configuration (5)
32. ConfigurableEntity
33. CustomFieldDefinition
34. CustomFieldValue
35. Label
36. NotificationTemplate

### Collaboration (4)
37. Comment
38. DailyLog
39. InternalNote
40. Notification

### Authentication (5)
41. AuthSession
42. MagicLinkToken
43. OAuthConnection
44. TeamInvitation
45. TwoFactorSetup

### Automation (3)
46. AutomationRule
47. AutomationLog
48. AutomationTrigger (embedded)

### Integration (4)
49. Integration
50. IntegrationLog
51. IncomingWebhook
52. OutgoingWebhook

### Search & Navigation (3)
53. SearchIndex
54. RecentItem
55. Favorite

### Reports (3)
56. DashboardWidget
57. ReportTemplate
58. SavedFilter

### Templates (5)
59. ProjectTemplate
60. TaskTemplate
61. ProposalTemplate
62. ContractTemplate
63. EmailTemplate

### Communication (3)
64. EmailMessage
65. SMSMessage
66. WhatsAppMessage

### Files (4)
67. File
68. Folder
69. FileVersion
70. FileShare

### Billing (3)
71. Subscription
72. Invoice
73. UsageTracker

### Security (2)
74. AuditLog
75. ConsentRecord

### Settings (2)
76. UserSettings
77. OnboardingState

---

**סה"כ: 77 ישויות**

---

## סטטוס המסמך

| פרמטר | ערך |
|-------|-----|
| **גרסה** | 3.0 |
| **תאריך** | ינואר 2026 |
| **יעד** | Claude Code |
| **שפה** | עברית + קוד באנגלית |
| **שורות** | ~5,000 |
| **חלקים** | 29 |
| **סטטוס** | מוכן לפיתוח |

---

## הערות למימוש

1. **סדר פיתוח מומלץ:**
   - שלב 1: Auth, Tenant, User, Project, Client
   - שלב 2: Task, Document, Room, Product
   - שלב 3: Financial (Proposal, Payment, Contract)
   - שלב 4: Collaboration (Comments, Notifications)
   - שלב 5: Integrations, Automations
   - שלב 6: Reports, Templates
   - שלב 7: Advanced features

2. **MVP ראשוני:**
   - ~30 ישויות מרכזיות
   - Auth + Onboarding
   - Real-time + Optimistic UI
   - Mobile responsive

3. **קריטי:**
   - Multi-tenant מהיום הראשון
   - RTL/Hebrew מובנה
   - Real-time מובנה
   - TypeScript קפדני
# מסמך אפיון - חלק ל
## השלמות טכניות

---

# לט. API Standards

## Response Format

```typescript
// תבנית תגובה אחידה לכל ה-API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

interface ApiError {
  code: string;                     // "VALIDATION_ERROR", "NOT_FOUND", etc.
  message: string;                  // הודעה ידידותית למשתמש
  details?: Record<string, string>; // פרטים נוספים (לולידציה - שגיאות לפי שדה)
  errorId?: string;                 // מזהה ייחודי לדיבוג
}

interface ApiMeta {
  // Pagination
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
  
  // Cursor-based pagination
  cursor?: {
    next?: string;
    previous?: string;
    hasMore: boolean;
  };
  
  // Rate limiting
  rateLimit?: {
    limit: number;
    remaining: number;
    resetAt: Date;
  };
}
```

## Error Codes

```typescript
const API_ERROR_CODES = {
  // Authentication
  'AUTH_REQUIRED': 'נדרשת התחברות',
  'AUTH_INVALID': 'פרטי התחברות שגויים',
  'AUTH_EXPIRED': 'פג תוקף ההתחברות',
  'AUTH_2FA_REQUIRED': 'נדרש אימות דו-שלבי',
  
  // Authorization
  'FORBIDDEN': 'אין הרשאה לפעולה זו',
  'INSUFFICIENT_PERMISSIONS': 'אין מספיק הרשאות',
  
  // Validation
  'VALIDATION_ERROR': 'שגיאת ולידציה',
  'INVALID_INPUT': 'קלט לא תקין',
  'MISSING_REQUIRED_FIELD': 'שדה חובה חסר',
  
  // Resources
  'NOT_FOUND': 'המשאב לא נמצא',
  'ALREADY_EXISTS': 'המשאב כבר קיים',
  'CONFLICT': 'קונפליקט - המשאב שונה',
  
  // Business Logic
  'QUOTA_EXCEEDED': 'חריגה ממכסה',
  'INVALID_STATUS_TRANSITION': 'מעבר סטטוס לא חוקי',
  'DEPENDENCY_ERROR': 'לא ניתן למחוק - יש תלויות',
  
  // External
  'EXTERNAL_SERVICE_ERROR': 'שגיאה בשירות חיצוני',
  'PAYMENT_FAILED': 'התשלום נכשל',
  
  // Server
  'INTERNAL_ERROR': 'שגיאת שרת',
  'SERVICE_UNAVAILABLE': 'השירות לא זמין',
  'RATE_LIMITED': 'יותר מדי בקשות',
} as const;
```

## HTTP Status Codes

```typescript
const HTTP_STATUS_USAGE = {
  // Success
  200: 'OK - הבקשה הצליחה',
  201: 'Created - משאב נוצר',
  204: 'No Content - הצליח, אין תוכן להחזיר',
  
  // Client Errors
  400: 'Bad Request - קלט לא תקין',
  401: 'Unauthorized - נדרשת התחברות',
  403: 'Forbidden - אין הרשאה',
  404: 'Not Found - לא נמצא',
  409: 'Conflict - קונפליקט',
  422: 'Unprocessable Entity - ולידציה נכשלה',
  429: 'Too Many Requests - rate limit',
  
  // Server Errors
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};
```

## Pagination

```typescript
// Offset-based (לדפים קבועים)
interface OffsetPagination {
  page: number;                     // מתחיל מ-1
  pageSize: number;                 // ברירת מחדל 20, מקסימום 100
}

// Cursor-based (לinfinite scroll, real-time)
interface CursorPagination {
  cursor?: string;                  // מזהה הפריט האחרון
  limit: number;                    // כמה להביא
  direction?: 'forward' | 'backward';
}

// שימוש מומלץ
const PAGINATION_STRATEGY = {
  'projects_list': 'offset',        // דפים, מספר קבוע
  'tasks_list': 'cursor',           // infinite scroll
  'activity_feed': 'cursor',        // real-time updates
  'search_results': 'offset',       // דפים עם מספור
  'notifications': 'cursor',        // infinite scroll
};
```

---

# מ. Validation Rules

## שדות נפוצים

```typescript
const VALIDATION_RULES = {
  // טקסט
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[\u0590-\u05FFa-zA-Z0-9\s\-_.]+$/,  // עברית, אנגלית, מספרים
  },
  
  description: {
    maxLength: 5000,
  },
  
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  
  phone: {
    pattern: /^[\d\-+().\s]+$/,
    minLength: 9,
    maxLength: 20,
  },
  
  // מספרים
  price: {
    min: 0,
    max: 999999999,
    precision: 2,
  },
  
  percentage: {
    min: 0,
    max: 100,
    precision: 2,
  },
  
  quantity: {
    min: 0,
    max: 999999,
    integer: true,
  },
  
  // תאריכים
  date: {
    format: 'ISO8601',
    minDate: '1900-01-01',
    maxDate: '2100-12-31',
  },
  
  // קבצים
  fileName: {
    maxLength: 255,
    forbiddenChars: ['/', '\\', ':', '*', '?', '"', '<', '>', '|'],
  },
  
  fileSize: {
    maxBytes: 104857600,            // 100MB
  },
  
  // URLs
  url: {
    pattern: /^https?:\/\/.+/,
    maxLength: 2000,
  },
  
  // סיסמה
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
  },
};
```

## Validation לפי Entity

```typescript
const ENTITY_VALIDATION = {
  Project: {
    name: { required: true, ...VALIDATION_RULES.name },
    code: { maxLength: 20, pattern: /^[A-Z0-9\-]+$/ },
    budget: { ...VALIDATION_RULES.price },
    startDate: { required: false, ...VALIDATION_RULES.date },
    endDate: { 
      ...VALIDATION_RULES.date,
      custom: (value, entity) => !entity.startDate || value >= entity.startDate,
      customMessage: 'תאריך סיום חייב להיות אחרי תאריך התחלה',
    },
  },
  
  Client: {
    name: { required: true, ...VALIDATION_RULES.name },
    email: { required: true, ...VALIDATION_RULES.email },
    phone: { ...VALIDATION_RULES.phone },
  },
  
  Task: {
    title: { required: true, minLength: 1, maxLength: 500 },
    description: { ...VALIDATION_RULES.description },
    dueDate: { ...VALIDATION_RULES.date },
    estimatedHours: { min: 0, max: 1000 },
  },
  
  Payment: {
    amount: { required: true, min: 0.01, ...VALIDATION_RULES.price },
    dueDate: { required: true, ...VALIDATION_RULES.date },
  },
  
  Product: {
    name: { required: true, ...VALIDATION_RULES.name },
    sku: { maxLength: 50 },
    supplierPrice: { ...VALIDATION_RULES.price },
    clientPrice: { ...VALIDATION_RULES.price },
  },
};
```

---

# מא. Localization (i18n)

## תמיכה בשפות

```typescript
interface LocalizationConfig {
  // שפות נתמכות
  supportedLocales: ['he', 'en'];
  defaultLocale: 'he';
  
  // כיוון
  rtlLocales: ['he', 'ar'];
  
  // פורמטים לפי locale
  formats: {
    he: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      dateTimeFormat: 'DD/MM/YYYY HH:mm',
      firstDayOfWeek: 0,            // ראשון
      currency: 'ILS',
      currencySymbol: '₪',
      currencyPosition: 'after',    // 100 ₪
      decimalSeparator: '.',
      thousandsSeparator: ',',
      numberFormat: '#,##0.00',
    },
    en: {
      dateFormat: 'MM/DD/YYYY',
      timeFormat: 'h:mm A',
      dateTimeFormat: 'MM/DD/YYYY h:mm A',
      firstDayOfWeek: 0,
      currency: 'USD',
      currencySymbol: '$',
      currencyPosition: 'before',   // $100
      decimalSeparator: '.',
      thousandsSeparator: ',',
      numberFormat: '#,##0.00',
    },
  };
}
```

## תרגומים

```typescript
// מבנה קובץ תרגום
interface Translations {
  // כללי
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    loading: string;
    // ...
  };
  
  // ישויות
  entities: {
    project: { singular: string; plural: string };
    client: { singular: string; plural: string };
    task: { singular: string; plural: string };
    // ...
  };
  
  // סטטוסים
  statuses: {
    active: string;
    completed: string;
    cancelled: string;
    // ...
  };
  
  // שגיאות
  errors: Record<string, string>;
  
  // הצלחות
  success: Record<string, string>;
  
  // Empty states
  emptyStates: Record<string, { title: string; description: string }>;
}

// דוגמה לעברית
const HE_TRANSLATIONS: Translations = {
  common: {
    save: 'שמור',
    cancel: 'ביטול',
    delete: 'מחק',
    edit: 'ערוך',
    create: 'צור',
    search: 'חיפוש',
    filter: 'סינון',
    export: 'ייצוא',
    import: 'יבוא',
    loading: 'טוען...',
  },
  entities: {
    project: { singular: 'פרויקט', plural: 'פרויקטים' },
    client: { singular: 'לקוח', plural: 'לקוחות' },
    task: { singular: 'משימה', plural: 'משימות' },
    supplier: { singular: 'ספק', plural: 'ספקים' },
    payment: { singular: 'תשלום', plural: 'תשלומים' },
    document: { singular: 'מסמך', plural: 'מסמכים' },
    meeting: { singular: 'פגישה', plural: 'פגישות' },
    product: { singular: 'מוצר', plural: 'מוצרים' },
    room: { singular: 'חדר', plural: 'חדרים' },
    proposal: { singular: 'הצעת מחיר', plural: 'הצעות מחיר' },
    contract: { singular: 'חוזה', plural: 'חוזים' },
  },
  // ...
};
```

---

# מב. Database Guidelines

## Naming Conventions

```typescript
const DB_CONVENTIONS = {
  // Tables
  tables: {
    case: 'snake_case',
    plural: true,
    examples: ['projects', 'clients', 'room_products'],
  },
  
  // Columns
  columns: {
    case: 'snake_case',
    examples: ['created_at', 'tenant_id', 'is_active'],
  },
  
  // Primary Keys
  primaryKey: {
    name: 'id',
    type: 'uuid',                   // או cuid
    generation: 'uuid_generate_v4()',
  },
  
  // Foreign Keys
  foreignKeys: {
    pattern: '{table_singular}_id',
    examples: ['project_id', 'client_id', 'tenant_id'],
  },
  
  // Timestamps
  timestamps: {
    created: 'created_at',
    updated: 'updated_at',
    deleted: 'deleted_at',          // soft delete
  },
  
  // Booleans
  booleans: {
    prefix: 'is_' | 'has_' | 'can_',
    examples: ['is_active', 'has_notifications', 'can_edit'],
  },
  
  // Indexes
  indexes: {
    pattern: 'idx_{table}_{columns}',
    examples: ['idx_tasks_project_id', 'idx_payments_tenant_id_status'],
  },
};
```

## Required Indexes

```typescript
const REQUIRED_INDEXES = [
  // כל טבלה צריכה index על tenant_id
  'CREATE INDEX idx_{table}_tenant_id ON {table}(tenant_id)',
  
  // Foreign keys
  'CREATE INDEX idx_{table}_{fk}_id ON {table}({fk}_id)',
  
  // Common queries
  'CREATE INDEX idx_tasks_project_status ON tasks(project_id, status)',
  'CREATE INDEX idx_payments_tenant_due ON payments(tenant_id, due_date)',
  'CREATE INDEX idx_activities_entity ON activity_logs(entity_type, entity_id)',
  
  // Full-text search
  'CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector(name || description))',
  'CREATE INDEX idx_clients_search ON clients USING gin(to_tsvector(name || email))',
];
```

## Row Level Security (RLS)

```typescript
// Postgres RLS policies
const RLS_POLICIES = `
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ... all tables

-- Policy template
CREATE POLICY tenant_isolation ON {table}
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Insert policy
CREATE POLICY tenant_insert ON {table}
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);
`;
```

---

# מג. Environment Variables

```typescript
// משתני סביבה נדרשים
const REQUIRED_ENV_VARS = {
  // Database
  DATABASE_URL: 'postgresql://...',
  
  // Auth
  JWT_SECRET: 'random-string-min-32-chars',
  JWT_EXPIRES_IN: '24h',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  
  // Storage
  S3_BUCKET: 'bucket-name',
  S3_REGION: 'eu-central-1',
  S3_ACCESS_KEY: 'xxx',
  S3_SECRET_KEY: 'xxx',
  
  // Redis
  REDIS_URL: 'redis://...',
  
  // Email
  SENDGRID_API_KEY: 'xxx',
  EMAIL_FROM: 'noreply@example.com',
  
  // SMS
  TWILIO_ACCOUNT_SID: 'xxx',
  TWILIO_AUTH_TOKEN: 'xxx',
  TWILIO_PHONE_NUMBER: '+972...',
  
  // WhatsApp
  WHATSAPP_PHONE_NUMBER_ID: 'xxx',
  WHATSAPP_ACCESS_TOKEN: 'xxx',
  
  // Payments
  STRIPE_SECRET_KEY: 'xxx',
  STRIPE_WEBHOOK_SECRET: 'xxx',
  
  // OAuth
  GOOGLE_CLIENT_ID: 'xxx',
  GOOGLE_CLIENT_SECRET: 'xxx',
  
  // App
  APP_URL: 'https://app.example.com',
  API_URL: 'https://api.example.com',
  
  // Feature flags
  ENABLE_DEBUG_MODE: 'false',
  ENABLE_DEMO_MODE: 'false',
};
```

---

# מד. Performance Guidelines

## Response Time Targets

```typescript
const PERFORMANCE_TARGETS = {
  // API
  api: {
    p50: 100,                       // ms
    p95: 500,
    p99: 1000,
  },
  
  // Database queries
  database: {
    simple: 10,                     // ms
    complex: 100,
    report: 1000,
  },
  
  // Frontend
  frontend: {
    FCP: 1500,                      // First Contentful Paint
    LCP: 2500,                      // Largest Contentful Paint
    TTI: 3500,                      // Time to Interactive
    CLS: 0.1,                       // Cumulative Layout Shift
  },
  
  // WebSocket
  websocket: {
    latency: 100,                   // ms
    reconnect: 3000,                // max time to reconnect
  },
  
  // File operations
  files: {
    uploadStart: 200,               // time to start upload
    thumbnailGeneration: 5000,      // background
  },
};
```

## Caching Strategy

```typescript
const CACHING_STRATEGY = {
  // Redis cache
  redis: {
    userSession: { ttl: 86400 },    // 24 hours
    tenantConfig: { ttl: 3600 },    // 1 hour
    searchIndex: { ttl: 300 },      // 5 minutes
    dashboardWidgets: { ttl: 60 },  // 1 minute
    recentItems: { ttl: 3600 },
  },
  
  // HTTP cache headers
  http: {
    staticAssets: 'max-age=31536000, immutable',
    api: 'private, no-cache',
    publicData: 'max-age=60',
  },
  
  // React Query
  reactQuery: {
    staleTime: 30000,               // 30 seconds
    cacheTime: 300000,              // 5 minutes
    refetchOnWindowFocus: true,
  },
};
```

---

# מה. Deployment Checklist

```typescript
const DEPLOYMENT_CHECKLIST = {
  // Pre-deployment
  pre: [
    'Run all tests',
    'Check TypeScript compilation',
    'Run linter',
    'Check bundle size',
    'Review environment variables',
    'Database migrations ready',
  ],
  
  // Database
  database: [
    'Backup current database',
    'Run migrations',
    'Verify indexes',
    'Check RLS policies',
  ],
  
  // Infrastructure
  infrastructure: [
    'SSL certificates valid',
    'CDN cache cleared',
    'Redis connected',
    'S3 bucket accessible',
    'Email service working',
  ],
  
  // Post-deployment
  post: [
    'Health check passing',
    'Critical user flows working',
    'WebSocket connections working',
    'Monitoring alerts configured',
    'Error tracking enabled',
  ],
};
```

---

**סוף ההשלמות הטכניות**