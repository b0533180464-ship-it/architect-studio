# Automations - מנוע אוטומציות
## מערכת Architect Studio

> **הפניה:** ראה `00-shared-definitions.md` לכל ה-Enums, Types ו-Base Interfaces

---

# א. סקירה כללית

## עקרון מנחה

מנוע אוטומציות גנרי לחלוטין - המשרד מגדיר את הכללים שלו.

**מבנה:** `TRIGGER` → `CONDITIONS` → `ACTIONS`

כל אוטומציה מורכבת מ:
1. **מתי להפעיל** (Trigger)
2. **באילו תנאים** (Conditions - אופציונלי)
3. **מה לעשות** (Actions - אחד או יותר)

## ישויות בקובץ זה

| ישות | תיאור | קשרים |
|------|-------|--------|
| AutomationRule | כלל אוטומציה | Tenant, User (createdBy) |
| AutomationTrigger | מתי להפעיל (embedded) | AutomationRule |
| AutomationCondition | תנאים (embedded) | AutomationRule |
| AutomationAction | פעולות (embedded) | AutomationRule |
| AutomationLog | היסטוריית הרצות | AutomationRule, Tenant |
| ActionResult | תוצאת פעולה בודדת (embedded) | AutomationLog |

---

# ב. AutomationRule - כלל אוטומציה

## Interface

```typescript
interface AutomationRule {
  id: string;
  tenantId: string;

  // מזהה
  name: string;
  description?: string;

  // סטטוס
  isEnabled: boolean;

  // מתי (embedded)
  trigger: AutomationTrigger;

  // תנאים - כל התנאים חייבים להתקיים (AND logic)
  conditions: AutomationCondition[];

  // פעולות - מבוצעות לפי סדר
  actions: AutomationAction[];

  // הגבלות
  maxExecutionsPerDay?: number;    // ברירת מחדל: 100
  cooldownMinutes?: number;        // זמן מינימלי בין הפעלות (ברירת מחדל: 1)

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

## Database Schema

```sql
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- מזהה
  name VARCHAR(200) NOT NULL,
  description TEXT,

  -- סטטוס
  is_enabled BOOLEAN DEFAULT true,

  -- Trigger (JSONB)
  trigger JSONB NOT NULL,

  -- Conditions (JSONB array)
  conditions JSONB DEFAULT '[]'::jsonb,

  -- Actions (JSONB array)
  actions JSONB NOT NULL,

  -- הגבלות
  max_executions_per_day INTEGER DEFAULT 100,
  cooldown_minutes INTEGER DEFAULT 1,

  -- סטטיסטיקות
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,

  -- מטא
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),

  -- Indexes
  CONSTRAINT automation_rules_tenant_idx UNIQUE (tenant_id, name)
);

-- Indexes
CREATE INDEX idx_automation_rules_tenant ON automation_rules(tenant_id);
CREATE INDEX idx_automation_rules_enabled ON automation_rules(tenant_id, is_enabled) WHERE is_enabled = true;
CREATE INDEX idx_automation_rules_trigger_type ON automation_rules((trigger->>'type'));

-- RLS
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON automation_rules
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Updated at trigger
CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

# ג. AutomationTrigger - מתי להפעיל

## Interface

```typescript
interface AutomationTrigger {
  type: AutomationTriggerType;
  config: TriggerConfig;
}

type AutomationTriggerType =
  // Entity Events - מופעלים כשישות משתנה
  | 'entity_created'           // ישות נוצרה
  | 'entity_updated'           // ישות עודכנה
  | 'entity_deleted'           // ישות נמחקה
  | 'field_changed'            // שדה ספציפי השתנה
  | 'status_changed'           // סטטוס השתנה

  // Time-based - מופעלים בזמן מסוים
  | 'scheduled'                // לפי לוח זמנים (cron-like)
  | 'relative_date'            // יחסית לתאריך בישות

  // Manual - מופעלים ידנית
  | 'manual_trigger'           // המשתמש לוחץ על כפתור
  | 'webhook_received';        // webhook נכנס

// Config לפי סוג trigger
interface TriggerConfig {
  // לכל ה-entity triggers
  entityType?: AutomationEntityType;

  // field_changed
  fieldName?: string;
  fromValue?: any;
  toValue?: any;

  // status_changed
  fromStatusId?: string;
  toStatusId?: string;

  // scheduled (cron-like)
  schedule?: ScheduleConfig;

  // relative_date (X ימים לפני/אחרי תאריך בישות)
  relativeTo?: RelativeDateConfig;

  // webhook_received
  webhookPath?: string;
}

interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;                  // "09:00"
  dayOfWeek?: number;            // 0-6 (לשבועי) - 0=ראשון
  dayOfMonth?: number;           // 1-31 (לחודשי)
  timezone: string;              // "Asia/Jerusalem"
}

interface RelativeDateConfig {
  entityType: AutomationEntityType;
  dateField: string;             // "dueDate", "expectedDeliveryDate", "startTime"
  daysBefore?: number;           // X ימים לפני
  daysAfter?: number;            // X ימים אחרי
  time: string;                  // "09:00" - באיזו שעה להפעיל
}

type AutomationEntityType =
  | 'project'
  | 'task'
  | 'client'
  | 'supplier'
  | 'payment'
  | 'proposal'
  | 'contract'
  | 'room_product'
  | 'purchase_order'
  | 'delivery_tracking'
  | 'change_order'
  | 'snag_item'
  | 'meeting'
  | 'document';
```

## Trigger Examples

```typescript
// דוגמה: כשנוצרת משימה
const trigger_entity_created: AutomationTrigger = {
  type: 'entity_created',
  config: {
    entityType: 'task'
  }
};

// דוגמה: כשסטטוס תשלום משתנה ל"שולם"
const trigger_status_changed: AutomationTrigger = {
  type: 'status_changed',
  config: {
    entityType: 'payment',
    toStatusId: 'paid'
  }
};

// דוגמה: 7 ימים לפני תאריך יעד תשלום
const trigger_relative_date: AutomationTrigger = {
  type: 'relative_date',
  config: {
    relativeTo: {
      entityType: 'payment',
      dateField: 'dueDate',
      daysBefore: 7,
      time: '09:00'
    }
  }
};

// דוגמה: כל יום ב-08:00
const trigger_scheduled: AutomationTrigger = {
  type: 'scheduled',
  config: {
    schedule: {
      frequency: 'daily',
      time: '08:00',
      timezone: 'Asia/Jerusalem'
    }
  }
};
```

---

# ד. AutomationCondition - תנאים

## Interface

```typescript
interface AutomationCondition {
  id: string;

  // על מה בודקים
  field: string;                 // "status", "amount", "dueDate", "assignedTo"

  // איך בודקים
  operator: ConditionOperator;

  // מה הערך
  value: any;

  // ערך דינמי (אם רלוונטי)
  valueType: 'static' | 'field' | 'variable';
  valueField?: string;           // אם valueType = 'field' - לקחת מ-field אחר
}

type ConditionOperator =
  // השוואה
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'

  // מספרים
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'

  // ריק/מלא
  | 'is_empty'
  | 'is_not_empty'

  // רשימה
  | 'in_list'
  | 'not_in_list'

  // תאריכים
  | 'date_before'
  | 'date_after'
  | 'date_between'
  | 'days_from_now'
  | 'days_ago';
```

## Condition Examples

```typescript
// דוגמה: סטטוס שווה ל"pending"
const condition_status: AutomationCondition = {
  id: 'cond_1',
  field: 'status',
  operator: 'equals',
  value: 'pending',
  valueType: 'static'
};

// דוגמה: סכום גדול מ-10000
const condition_amount: AutomationCondition = {
  id: 'cond_2',
  field: 'amount',
  operator: 'greater_than',
  value: 10000,
  valueType: 'static'
};

// דוגמה: סטטוס באחד מהרשימה
const condition_in_list: AutomationCondition = {
  id: 'cond_3',
  field: 'status',
  operator: 'in_list',
  value: ['scheduled', 'pending'],
  valueType: 'static'
};

// דוגמה: חומרת ליקוי קריטית או גבוהה
const condition_severity: AutomationCondition = {
  id: 'cond_4',
  field: 'severity',
  operator: 'in_list',
  value: ['major', 'critical'],
  valueType: 'static'
};
```

---

# ה. AutomationAction - פעולות

## Interface

```typescript
interface AutomationAction {
  id: string;
  order: number;

  type: AutomationActionType;
  config: ActionConfig;

  // המשך גם אם נכשל?
  continueOnFailure: boolean;

  // עיכוב לפני ביצוע (דקות)
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
  entityType?: AutomationEntityType;
  entityData?: Record<string, any>;

  // assign_user
  assignToUserId?: string;
  assignToField?: string;          // לקחת מ-field אחר
  assignRoundRobin?: boolean;      // חלוקה שווה בין הצוות

  // create_task
  taskTemplate?: TaskTemplate;

  // send_email
  emailConfig?: EmailActionConfig;

  // send_sms / send_whatsapp
  messageConfig?: MessageActionConfig;

  // webhook_call
  webhookConfig?: WebhookActionConfig;

  // delay
  delayMinutes?: number;

  // condition_branch
  branchCondition?: AutomationCondition;
  trueActions?: AutomationAction[];
  falseActions?: AutomationAction[];
}

interface TaskTemplate {
  title: string;                   // עם placeholders: "Follow up with {{client.name}}"
  description?: string;
  dueInDays?: number;              // כמה ימים מהיום
  assignToTriggeredUser?: boolean; // להקצות למי שהפעיל
  assignToUserId?: string;         // או למשתמש ספציפי
  priority?: TaskPriority;
  categoryId?: string;
}

interface EmailActionConfig {
  to: 'entity_owner' | 'assigned_user' | 'client' | 'specific' | 'field';
  toEmail?: string;                // אם to = 'specific'
  toField?: string;                // אם to = 'field'

  templateId?: string;             // תבנית מוכנה

  // או custom
  subject?: string;
  body?: string;                   // עם placeholders

  attachDocuments?: boolean;
}

interface MessageActionConfig {
  to: 'client' | 'assigned_user' | 'specific' | 'field';
  toPhone?: string;
  toField?: string;
  message: string;                 // עם placeholders
}

interface WebhookActionConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  bodyTemplate?: string;           // JSON עם placeholders
}
```

## Action Examples

```typescript
// דוגמה: שליחת מייל ללקוח
const action_send_email: AutomationAction = {
  id: 'action_1',
  order: 1,
  type: 'send_email',
  config: {
    emailConfig: {
      to: 'client',
      templateId: 'payment_reminder'
    }
  },
  continueOnFailure: false
};

// דוגמה: עדכון סטטוס
const action_update_status: AutomationAction = {
  id: 'action_2',
  order: 2,
  type: 'update_status',
  config: {
    newStatusId: 'overdue'
  },
  continueOnFailure: true
};

// דוגמה: יצירת משימה
const action_create_task: AutomationAction = {
  id: 'action_3',
  order: 3,
  type: 'create_task',
  config: {
    taskTemplate: {
      title: 'בדיקת {{product.name}} שנמסר',
      dueInDays: 1,
      assignToTriggeredUser: true,
      priority: 'medium'
    }
  },
  continueOnFailure: false
};

// דוגמה: עיכוב של יום אחד לפני שליחת סקר
const action_delay: AutomationAction = {
  id: 'action_4',
  order: 1,
  type: 'delay',
  config: {
    delayMinutes: 1440  // 24 שעות
  },
  continueOnFailure: false
};
```

---

# ו. AutomationLog - היסטוריית הרצות

## Interface

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
  status: AutomationLogStatus;

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

type AutomationLogStatus =
  | 'pending'     // ממתין בתור
  | 'running'     // רץ עכשיו
  | 'completed'   // הסתיים בהצלחה
  | 'failed'      // נכשל
  | 'partial';    // חלק מהפעולות הצליחו

interface ActionResult {
  actionId: string;
  actionType: string;

  status: 'pending' | 'success' | 'failed' | 'skipped';

  result?: any;                    // מה חזר / נוצר (entityId, etc.)
  errorMessage?: string;

  startedAt: Date;
  completedAt?: Date;
}
```

## Database Schema

```sql
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  automation_rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,

  -- מה הפעיל
  triggered_by VARCHAR(20) NOT NULL, -- 'event', 'schedule', 'manual', 'webhook'
  trigger_entity_type VARCHAR(50),
  trigger_entity_id UUID,

  -- תוצאה
  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  -- פירוט actions (JSONB)
  action_results JSONB DEFAULT '[]'::jsonb,

  -- שגיאות
  error_message TEXT,
  error_stack TEXT,

  -- זמנים
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_automation_logs_tenant ON automation_logs(tenant_id);
CREATE INDEX idx_automation_logs_rule ON automation_logs(automation_rule_id);
CREATE INDEX idx_automation_logs_status ON automation_logs(tenant_id, status);
CREATE INDEX idx_automation_logs_date ON automation_logs(tenant_id, started_at DESC);

-- RLS
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON automation_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Auto-cleanup: מחיקת לוגים ישנים (30 יום)
CREATE OR REPLACE FUNCTION cleanup_old_automation_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM automation_logs
  WHERE started_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

---

# ז. Placeholders (Template Variables)

## משתנים זמינים בתבניות

```typescript
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

  // Meeting
  'meeting.title': 'כותרת פגישה',
  'meeting.date': 'תאריך',
  'meeting.time': 'שעה',
  'meeting.location': 'מיקום',

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

## Placeholder Processing

```typescript
// פונקציה לעיבוד placeholders
function processPlaceholders(template: string, context: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(context, path.trim());
    return value !== undefined ? String(value) : match;
  });
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// דוגמה לשימוש
const template = 'שלום {{client.name}}, תזכורת לתשלום בסך {{payment.amount}} ₪';
const context = {
  client: { name: 'משה כהן' },
  payment: { amount: 5000 }
};
const result = processPlaceholders(template, context);
// => "שלום משה כהן, תזכורת לתשלום בסך 5000 ₪"
```

---

# ח. אוטומציות מובנות (Default)

כל Tenant חדש מקבל אוטומציות מומלצות שאפשר להפעיל:

```typescript
const DEFAULT_AUTOMATIONS: Partial<AutomationRule>[] = [
  // === תזכורות תשלום ===
  {
    name: 'תזכורת תשלום - 7 ימים לפני',
    description: 'שליחת תזכורת ללקוח שבוע לפני מועד התשלום',
    trigger: {
      type: 'relative_date',
      config: {
        relativeTo: {
          entityType: 'payment',
          dateField: 'dueDate',
          daysBefore: 7,
          time: '09:00'
        }
      }
    },
    conditions: [{
      id: 'cond_1',
      field: 'status',
      operator: 'in_list',
      value: ['scheduled', 'pending'],
      valueType: 'static'
    }],
    actions: [{
      id: 'action_1',
      order: 1,
      type: 'send_email',
      config: {
        emailConfig: {
          to: 'client',
          templateId: 'payment_reminder'
        }
      },
      continueOnFailure: false
    }]
  },

  {
    name: 'תזכורת תשלום - באיחור',
    description: 'עדכון סטטוס והתראה כשתשלום באיחור',
    trigger: {
      type: 'relative_date',
      config: {
        relativeTo: {
          entityType: 'payment',
          dateField: 'dueDate',
          daysAfter: 1,
          time: '09:00'
        }
      }
    },
    conditions: [{
      id: 'cond_1',
      field: 'status',
      operator: 'in_list',
      value: ['scheduled', 'pending'],
      valueType: 'static'
    }],
    actions: [
      {
        id: 'action_1',
        order: 1,
        type: 'update_status',
        config: { newStatusId: 'overdue' },
        continueOnFailure: true
      },
      {
        id: 'action_2',
        order: 2,
        type: 'send_email',
        config: {
          emailConfig: {
            to: 'client',
            templateId: 'payment_overdue'
          }
        },
        continueOnFailure: true
      },
      {
        id: 'action_3',
        order: 3,
        type: 'create_notification',
        config: {
          messageConfig: {
            to: 'assigned_user',
            message: 'תשלום באיחור: {{payment.name}}'
          }
        },
        continueOnFailure: false
      }
    ]
  },

  // === מעבר שלבים ===
  {
    name: 'הצעה אושרה - צור חוזה',
    description: 'יצירת חוזה אוטומטית כשהצעת מחיר מאושרת',
    trigger: {
      type: 'status_changed',
      config: {
        entityType: 'proposal',
        toStatusId: 'approved'
      }
    },
    conditions: [],
    actions: [
      {
        id: 'action_1',
        order: 1,
        type: 'create_entity',
        config: {
          entityType: 'contract',
          entityData: {
            // נתונים מועתקים מההצעה
          }
        },
        continueOnFailure: false
      },
      {
        id: 'action_2',
        order: 2,
        type: 'create_task',
        config: {
          taskTemplate: {
            title: 'שליחת חוזה לחתימה - {{client.name}}',
            dueInDays: 1,
            priority: 'high'
          }
        },
        continueOnFailure: false
      }
    ]
  },

  {
    name: 'חוזה נחתם - הפעל פרויקט',
    description: 'הפעלת פרויקט אוטומטית כשחוזה נחתם',
    trigger: {
      type: 'status_changed',
      config: {
        entityType: 'contract',
        toStatusId: 'signed'
      }
    },
    conditions: [],
    actions: [
      {
        id: 'action_1',
        order: 1,
        type: 'update_field',
        config: {
          entityType: 'project',
          fieldName: 'status',
          fieldValue: 'active',
          fieldValueType: 'static'
        },
        continueOnFailure: true
      },
      {
        id: 'action_2',
        order: 2,
        type: 'update_field',
        config: {
          entityType: 'client',
          fieldName: 'status',
          fieldValue: 'active',
          fieldValueType: 'static'
        },
        continueOnFailure: true
      },
      {
        id: 'action_3',
        order: 3,
        type: 'send_email',
        config: {
          emailConfig: {
            to: 'client',
            templateId: 'project_kickoff'
          }
        },
        continueOnFailure: false
      }
    ]
  },

  // === מעקב משלוחים ===
  {
    name: 'משלוח נמסר - עדכן מוצר',
    description: 'עדכון סטטוס מוצר כשמשלוח נמסר',
    trigger: {
      type: 'status_changed',
      config: {
        entityType: 'delivery_tracking',
        toStatusId: 'delivered'
      }
    },
    conditions: [],
    actions: [
      {
        id: 'action_1',
        order: 1,
        type: 'update_field',
        config: {
          entityType: 'room_product',
          fieldName: 'procurementStatus',
          fieldValue: 'delivered',
          fieldValueType: 'static'
        },
        continueOnFailure: true
      },
      {
        id: 'action_2',
        order: 2,
        type: 'create_task',
        config: {
          taskTemplate: {
            title: 'בדיקת {{product.name}} שנמסר',
            dueInDays: 1,
            priority: 'medium'
          }
        },
        continueOnFailure: false
      }
    ]
  },

  {
    name: 'משלוח באיחור - התראה',
    description: 'התראה כשמשלוח לא הגיע בזמן',
    trigger: {
      type: 'relative_date',
      config: {
        relativeTo: {
          entityType: 'delivery_tracking',
          dateField: 'estimatedDeliveryDate',
          daysAfter: 1,
          time: '09:00'
        }
      }
    },
    conditions: [{
      id: 'cond_1',
      field: 'status',
      operator: 'not_in_list',
      value: ['delivered', 'completed'],
      valueType: 'static'
    }],
    actions: [
      {
        id: 'action_1',
        order: 1,
        type: 'update_field',
        config: {
          fieldName: 'hasIssue',
          fieldValue: true,
          fieldValueType: 'static'
        },
        continueOnFailure: true
      },
      {
        id: 'action_2',
        order: 2,
        type: 'send_in_app_notification',
        config: {
          messageConfig: {
            to: 'assigned_user',
            message: 'משלוח באיחור: {{product.name}}'
          }
        },
        continueOnFailure: false
      }
    ]
  },

  // === ליקויים ===
  {
    name: 'ליקוי חדש - התראה למנהל',
    description: 'התראה כשנוצר ליקוי בחומרה גבוהה',
    trigger: {
      type: 'entity_created',
      config: {
        entityType: 'snag_item'
      }
    },
    conditions: [{
      id: 'cond_1',
      field: 'severity',
      operator: 'in_list',
      value: ['major', 'critical'],
      valueType: 'static'
    }],
    actions: [{
      id: 'action_1',
      order: 1,
      type: 'send_in_app_notification',
      config: {
        messageConfig: {
          to: 'assigned_user',
          message: 'ליקוי {{severity}} חדש: {{title}}'
        }
      },
      continueOnFailure: false
    }]
  },

  // === משימות ===
  {
    name: 'משימה באיחור - התראה',
    description: 'התראה יומית על משימות באיחור',
    trigger: {
      type: 'scheduled',
      config: {
        schedule: {
          frequency: 'daily',
          time: '08:00',
          timezone: 'Asia/Jerusalem'
        }
      }
    },
    conditions: [],
    actions: [
      {
        id: 'action_1',
        order: 1,
        type: 'send_in_app_notification',
        config: {
          messageConfig: {
            to: 'assigned_user',
            message: 'משימה באיחור: {{task.title}}'
          }
        },
        continueOnFailure: true
      },
      {
        id: 'action_2',
        order: 2,
        type: 'update_field',
        config: {
          fieldName: 'priority',
          fieldValue: 'urgent',
          fieldValueType: 'static'
        },
        continueOnFailure: false
      }
    ]
  },

  // === פגישות ===
  {
    name: 'פגישה מחר - תזכורת',
    description: 'תזכורת לפגישה יום לפני',
    trigger: {
      type: 'relative_date',
      config: {
        relativeTo: {
          entityType: 'meeting',
          dateField: 'startTime',
          daysBefore: 1,
          time: '18:00'
        }
      }
    },
    conditions: [],
    actions: [
      {
        id: 'action_1',
        order: 1,
        type: 'send_email',
        config: {
          emailConfig: {
            to: 'client',
            templateId: 'meeting_reminder'
          }
        },
        continueOnFailure: true
      },
      {
        id: 'action_2',
        order: 2,
        type: 'send_in_app_notification',
        config: {
          messageConfig: {
            to: 'assigned_user',
            message: 'פגישה מחר: {{meeting.title}}'
          }
        },
        continueOnFailure: false
      }
    ]
  },

  // === סיום פרויקט ===
  {
    name: 'פרויקט הסתיים - שלח סקר',
    description: 'שליחת סקר שביעות רצון יום אחרי סיום',
    trigger: {
      type: 'status_changed',
      config: {
        entityType: 'project',
        toStatusId: 'completed'
      }
    },
    conditions: [],
    actions: [
      {
        id: 'action_1',
        order: 1,
        type: 'delay',
        config: {
          delayMinutes: 1440  // יום אחד
        },
        continueOnFailure: false
      },
      {
        id: 'action_2',
        order: 2,
        type: 'send_email',
        config: {
          emailConfig: {
            to: 'client',
            templateId: 'satisfaction_survey'
          }
        },
        continueOnFailure: false
      }
    ]
  }
];
```

---

# ט. API Endpoints

```typescript
// === Automation Rules ===
// GET /api/automations - רשימת אוטומציות
// GET /api/automations/:id - אוטומציה בודדת
// POST /api/automations - יצירת אוטומציה
// PATCH /api/automations/:id - עדכון אוטומציה
// DELETE /api/automations/:id - מחיקת אוטומציה

// PUT /api/automations/:id/enable - הפעלה
// PUT /api/automations/:id/disable - השבתה
// POST /api/automations/:id/test - בדיקה (dry-run)
// POST /api/automations/:id/trigger - הפעלה ידנית

// === Automation Logs ===
// GET /api/automations/:id/logs - היסטוריית הרצות
// GET /api/automation-logs/:logId - פרטי הרצה

// === Templates ===
// GET /api/automation-templates - תבניות מובנות
// POST /api/automations/from-template/:templateId - יצירה מתבנית
```

---

# י. WebSocket Events

```typescript
const AUTOMATION_WEBSOCKET_EVENTS = {
  // הפעלת אוטומציה
  'automation.triggered': {
    automationId: string;
    automationName: string;
    triggerType: string;
    entityType?: string;
    entityId?: string;
  },

  // אוטומציה הסתיימה
  'automation.completed': {
    automationId: string;
    logId: string;
    status: AutomationLogStatus;
    durationMs: number;
  },

  // אוטומציה נכשלה
  'automation.failed': {
    automationId: string;
    logId: string;
    errorMessage: string;
  },

  // שינוי סטטוס אוטומציה
  'automation.status_changed': {
    automationId: string;
    isEnabled: boolean;
  },
};
```

---

# יא. UI Guidelines

## Automation Builder - Visual Editor

```typescript
interface AutomationBuilderUI {
  // שלב 1: בחירת Trigger
  triggerSelector: {
    categories: ['אירוע', 'תזמון', 'ידני'];
    steps: [
      'בחירת קטגוריה',
      'בחירת entityType (אם רלוונטי)',
      'בחירת סוג trigger',
      'הגדרת פרמטרים'
    ];
  };

  // שלב 2: הוספת Conditions (אופציונלי)
  conditionBuilder: {
    layout: 'card_per_condition';
    steps: [
      'בחירת שדה',
      'בחירת אופרטור',
      'הזנת ערך'
    ];
    actions: ['הוסף תנאי', 'מחק תנאי'];
    logic: 'AND';  // כל התנאים חייבים להתקיים
  };

  // שלב 3: הגדרת Actions
  actionBuilder: {
    layout: 'sortable_list';
    features: [
      'Drag & Drop לשינוי סדר',
      'הוסף פעולה',
      'מחק פעולה',
      'הגדר עיכוב'
    ];
    placeholderHelper: true;  // עזרה בהקלדת placeholders
  };

  // שלב 4: Test & Preview
  testPanel: {
    features: [
      'בחירת entity לבדיקה',
      'הרצת dry-run',
      'הצגת תוצאה צפויה',
      'preview של מיילים/הודעות'
    ];
  };

  // שלב 5: שמירה
  saveOptions: {
    fields: ['name', 'description', 'isEnabled'];
    validation: true;
  };
}
```

## Automation List

```typescript
interface AutomationListUI {
  columns: [
    'שם',
    'סטטוס (מופעל/מושבת)',
    'Trigger',
    'הרצות (24 שעות)',
    'הרצה אחרונה',
    'פעולות'
  ];

  actions: [
    'צפה/ערוך',
    'הפעל/השבת',
    'בדוק',
    'הפעל ידנית',
    'שכפל',
    'מחק'
  ];

  filters: [
    'סטטוס',
    'סוג trigger',
    'entityType'
  ];

  sorting: ['שם', 'הרצות', 'תאריך יצירה'];
}
```

## Automation Log Viewer

```typescript
interface AutomationLogUI {
  // רשימה
  list: {
    columns: ['תאריך', 'אוטומציה', 'trigger', 'סטטוס', 'משך'];
    filters: ['סטטוס', 'אוטומציה', 'טווח תאריכים'];
    pagination: true;
  };

  // פרטי הרצה
  detail: {
    sections: [
      'פרטי trigger',
      'תנאים שנבדקו',
      'פעולות שבוצעו (timeline)',
      'שגיאות (אם יש)'
    ];
    timeline: {
      showEachAction: true;
      showDuration: true;
      showResult: true;
      expandable: true;
    };
  };
}
```

---

# יב. Implementation Guidelines

## Queue-based Execution

```typescript
// אוטומציות רצות ב-background job queue (BullMQ)
interface AutomationJobData {
  tenantId: string;
  automationRuleId: string;
  triggeredBy: 'event' | 'schedule' | 'manual' | 'webhook';
  triggerEntityType?: string;
  triggerEntityId?: string;
  context: Record<string, any>;  // נתונים לplaceholders
}

// Job processor
async function processAutomation(job: Job<AutomationJobData>) {
  const { tenantId, automationRuleId, context } = job.data;

  // 1. טען את האוטומציה
  const rule = await getAutomationRule(automationRuleId);

  // 2. בדוק תנאים
  const conditionsMet = evaluateConditions(rule.conditions, context);
  if (!conditionsMet) return { status: 'skipped', reason: 'conditions_not_met' };

  // 3. בצע פעולות לפי סדר
  const results = [];
  for (const action of rule.actions.sort((a, b) => a.order - b.order)) {
    try {
      const result = await executeAction(action, context);
      results.push({ actionId: action.id, status: 'success', result });
    } catch (error) {
      results.push({ actionId: action.id, status: 'failed', error: error.message });
      if (!action.continueOnFailure) break;
    }
  }

  // 4. עדכן לוג
  await createAutomationLog({ ... });

  return { status: 'completed', results };
}
```

## Idempotency

```typescript
// כל action צריך להיות idempotent
// לא לשלוח מייל פעמיים אם retry

interface IdempotencyKey {
  automationRuleId: string;
  actionId: string;
  triggerEntityId: string;
  triggeredAt: Date;  // rounded to minute
}

// בדיקה לפני ביצוע action
async function checkIdempotency(key: IdempotencyKey): Promise<boolean> {
  const existing = await redis.get(`idempotency:${hash(key)}`);
  if (existing) return false;  // כבר בוצע
  await redis.set(`idempotency:${hash(key)}`, '1', 'EX', 3600);  // 1 hour TTL
  return true;
}
```

## Rate Limiting

```typescript
const AUTOMATION_LIMITS = {
  maxExecutionsPerDay: 100,       // לכל rule
  cooldownMinutes: 1,             // מינימלי בין הרצות
  maxActionsPerRule: 20,          // מקסימום פעולות
  maxConditionsPerRule: 10,       // מקסימום תנאים
  maxDelayMinutes: 10080,         // שבוע
};

// בדיקת rate limit
async function checkRateLimit(rule: AutomationRule): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const key = `automation_executions:${rule.id}:${today}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 86400);  // 24 hours
  }

  return count <= (rule.maxExecutionsPerDay || AUTOMATION_LIMITS.maxExecutionsPerDay);
}
```

## Permissions

```typescript
const AUTOMATION_PERMISSIONS = {
  // מי יכול לנהל אוטומציות
  create: ['owner', 'manager'],
  update: ['owner', 'manager'],
  delete: ['owner', 'manager'],
  enable_disable: ['owner', 'manager'],
  view: ['owner', 'manager', 'member'],
  view_logs: ['owner', 'manager'],

  // אוטומציות רצות עם הרשאות system
  execution: 'system'
};
```

---

# יג. קשרים לקבצים אחרים

| קובץ | ישויות קשורות |
|------|---------------|
| `00-shared-definitions.md` | AutomationTriggerType, ConditionOperator, AutomationActionType, AutomationLogStatus |
| `02-auth-tenant-user.md` | Tenant, User (createdBy, assignedTo) |
| `03-project-client.md` | Project, Client (entity triggers) |
| `04-tasks-docs-meetings.md` | Task, Meeting (entity triggers, create_task action) |
| `05-products-ffe.md` | RoomProduct, DeliveryTracking (entity triggers) |
| `06-financial.md` | Payment, Proposal, Contract (entity triggers) |
| `07-collaboration.md` | Notification (create_notification action) |
| `08-client-portal.md` | ChangeOrder, SnagItem (entity triggers) |
| `12-communication.md` | EmailTemplate (send_email action) |

---

**הפניות:**
- ישויות Auth/User: `02-auth-tenant-user.md`
- ישויות Project/Client: `03-project-client.md`
- כל ה-Enums והטיפוסים: `00-shared-definitions.md`
- אינטגרציות (webhooks): `10-integrations.md`
- תבניות מייל: `12-communication.md`
