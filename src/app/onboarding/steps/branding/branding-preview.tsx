'use client';

interface Props {
  primaryColor: string;
}

export function BrandingPreview({ primaryColor }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <p className="mb-2 text-sm text-muted-foreground">תצוגה מקדימה:</p>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: primaryColor }} />
        <div>
          <p className="font-medium">שם המשרד</p>
          <p className="text-sm" style={{ color: primaryColor }}>קישור לדוגמה</p>
        </div>
      </div>
    </div>
  );
}
