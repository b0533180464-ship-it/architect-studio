# Architect Studio - Setup Guide

## 📁 מבנה הקבצים

```
architect-studio/
├── CLAUDE.md                      ← הנחיות ל-Claude (45 שורות)
├── .claude/
│   ├── settings.json              ← הגדרות + Hooks
│   └── hooks/
│       ├── check-file.sh          ← בודק קובץ אחרי כל עריכה
│       └── check-all.sh           ← בודק הכל בסוף עבודה
├── eslint.config.js               ← כללי ESLint לאכיפת גודל
├── docs/
│   └── architect-studio-spec.md   ← האפיון המלא שלך (להעתיק!)
└── README.md
```

---

## ✅ מה כל קובץ עושה

### CLAUDE.md
- מסביר ל-Claude מה הפרויקט
- Tech stack
- כללים קריטיים (tenantId, Hebrew, Optimistic UI)
- **לא** מכיל כללי style - ESLint עושה את זה

### .claude/settings.json
- מגדיר Hooks שרצים אוטומטית
- `PostToolUse` → אחרי כל עריכת קובץ
- `Stop` → כשClaude מסיים לעבוד

### .claude/hooks/check-file.sh
- רץ אחרי כל Edit/Write
- בודק שקובץ לא עובר 150 שורות
- אם נכשל → Claude חייב לתקן

### .claude/hooks/check-all.sh
- רץ בסוף כל סשן עבודה
- מריץ TypeScript check
- מריץ ESLint
- מחפש קבצים גדולים
- בודק שימוש ב-tenantId

### eslint.config.js
- `max-lines: 150` - מקסימום שורות לקובץ
- `max-lines-per-function: 30` - מקסימום שורות לפונקציה
- `no-explicit-any` - אוסר any ב-TypeScript
- כללי React hooks

---

## 🚀 התקנה

### 1. צור פרויקט Next.js
```bash
npx create-next-app@latest architect-studio --typescript --tailwind --eslint --app
cd architect-studio
```

### 2. העתק את הקבצים
העתק את כל הקבצים מהחבילה הזו לתיקיית הפרויקט.

### 3. התקן dependencies נוספים
```bash
npm install @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks
npm install -D prisma
npm install @prisma/client @trpc/server @trpc/client @trpc/react-query @tanstack/react-query next-auth@beta zod zustand
```

### 4. הוסף scripts ל-package.json
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src"
  }
}
```

### 5. העתק את האפיון שלך
העתק את `architect-studio-spec.md` לתיקיית `docs/`

### 6. הפעל Claude Code
```bash
claude
```

---

## ⚙️ מה לשנות / להתאים

### גודל קבצים
ב-`check-file.sh` וב-`eslint.config.js`:
- ברירת מחדל: 150 שורות לקובץ
- אם רוצה יותר מחמיר: שנה ל-100
- אם רוצה יותר גמיש: שנה ל-200

### גודל פונקציות
ב-`eslint.config.js`:
- ברירת מחדל: 30 שורות לפונקציה
- שנה `max-lines-per-function` לפי הצורך

### בדיקת tenantId
ב-`check-all.sh`:
- הבדיקה בסיסית (grep)
- אפשר לשפר עם בדיקה יותר מתוחכמת

---

## 🔧 אם משהו לא עובד

### Hooks לא רצים
1. ודא ש-scripts הם executable: `chmod +x .claude/hooks/*.sh`
2. בדוק נתיבים ב-settings.json

### ESLint שגיאות
1. התקן את כל ה-plugins
2. ודא ש-eslint.config.js בתיקייה הראשית

### Claude מתעלם מכללים
- זה יקרה לפעמים
- ה-Hooks יתפסו את זה ויכריחו תיקון
- אפשר להוסיף # לזכר: `# always split files larger than 150 lines`

---

## 📝 טיפים

1. **התחל עם `/init`** - Claude יקרא את CLAUDE.md
2. **השתמש ב-`#`** להוספת זכרונות: `# use shadcn Button component`
3. **נקה context** עם `/clear` בין משימות
4. **בדוק hooks** עם `/hooks` לראות מה מוגדר