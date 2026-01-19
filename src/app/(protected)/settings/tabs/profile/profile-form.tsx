'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  title: string;
  avatar: string;
  language: string;
  theme: string;
}

interface Props {
  formData: FormData;
  setFormData: (data: FormData) => void;
  email: string;
}

export function ProfileForm({ formData, setFormData, email }: Props) {
  const update = (key: keyof FormData, value: string) => setFormData({ ...formData, [key]: value });

  return (
    <div className="space-y-6">
      <BasicInfoSection formData={formData} update={update} email={email} />
      <PreferencesSection formData={formData} update={update} />
    </div>
  );
}

interface BasicInfoProps {
  formData: FormData;
  update: (key: keyof FormData, value: string) => void;
  email: string;
}

function BasicInfoSection({ formData, update, email }: BasicInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">פרטים אישיים</h3>
      <AvatarField formData={formData} update={update} />
      <NameFields formData={formData} update={update} />
      <EmailField email={email} />
      <ContactFields formData={formData} update={update} />
    </div>
  );
}

function AvatarField({ formData, update }: { formData: FormData; update: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>תמונת פרופיל</Label>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl">
          {formData.firstName?.[0]}{formData.lastName?.[0]}
        </div>
        <Input type="url" value={formData.avatar} placeholder="כתובת URL לתמונה"
          onChange={(e) => update('avatar', e.target.value)} dir="ltr" className="flex-1" />
      </div>
    </div>
  );
}

function NameFields({ formData, update }: { formData: FormData; update: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">שם פרטי</Label>
        <Input id="firstName" value={formData.firstName} onChange={(e) => update('firstName', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">שם משפחה</Label>
        <Input id="lastName" value={formData.lastName} onChange={(e) => update('lastName', e.target.value)} />
      </div>
    </div>
  );
}

function EmailField({ email }: { email: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">אימייל</Label>
      <Input id="email" type="email" value={email} disabled dir="ltr" />
    </div>
  );
}

function ContactFields({ formData, update }: { formData: FormData; update: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="phone">טלפון</Label>
        <Input id="phone" type="tel" value={formData.phone} onChange={(e) => update('phone', e.target.value)} dir="ltr" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">תפקיד</Label>
        <Input id="title" value={formData.title} onChange={(e) => update('title', e.target.value)} placeholder="מעצב/ת" />
      </div>
    </div>
  );
}

interface PreferencesProps {
  formData: FormData;
  update: (key: keyof FormData, value: string) => void;
}

function PreferencesSection({ formData, update }: PreferencesProps) {
  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="font-medium">העדפות תצוגה</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="language">שפה</Label>
          <select id="language" value={formData.language} onChange={(e) => update('language', e.target.value)}
            className="w-full h-10 rounded-md border bg-background px-3">
            <option value="he">עברית</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="theme">ערכת נושא</Label>
          <select id="theme" value={formData.theme} onChange={(e) => update('theme', e.target.value)}
            className="w-full h-10 rounded-md border bg-background px-3">
            <option value="system">אוטומטי (לפי המערכת)</option>
            <option value="light">בהיר</option>
            <option value="dark">כהה</option>
          </select>
        </div>
      </div>
    </div>
  );
}
