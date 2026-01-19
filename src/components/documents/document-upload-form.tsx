/* eslint-disable max-lines-per-function */
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfigSelect } from '@/components/ui/config-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';

interface DocumentUploadFormProps {
  projectId?: string;
  onSuccess?: () => void;
}

export function DocumentUploadForm({ projectId, onSuccess }: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const utils = trpc.useUtils();
  const { data: projects } = trpc.projects.list.useQuery({ pageSize: 100 });

  const createMutation = trpc.documents.create.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      utils.documents.getStats.invalidate();
      onSuccess?.();
    },
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!name) setName(droppedFile.name);
    }
  }, [name]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) setName(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      // In production, you'd upload to Supabase Storage first
      // For now, we'll create a mock URL
      const mockUrl = `/uploads/${Date.now()}-${file.name}`;

      createMutation.mutate({
        name: name || file.name,
        fileUrl: mockUrl,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        projectId: selectedProjectId || undefined,
        categoryId: categoryId || undefined,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = isUploading || createMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="space-y-2">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setFile(null)}>
              הסר קובץ
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground">גרור קובץ לכאן או</p>
            <Input type="file" className="max-w-xs mx-auto" onChange={handleFileChange} />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">שם המסמך</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="שם הקובץ" />
        </div>
        <div className="space-y-2">
          <Label>קטגוריה</Label>
          <ConfigSelect entityType="document_category" value={categoryId} onChange={setCategoryId} placeholder="בחר קטגוריה..." />
        </div>
      </div>

      {!projectId && (
        <div className="space-y-2">
          <Label>פרויקט</Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger><SelectValue placeholder="בחר פרויקט (אופציונלי)" /></SelectTrigger>
            <SelectContent>
              {projects?.items.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={!file || isPending}>
          {isPending ? 'מעלה...' : 'העלה מסמך'}
        </Button>
      </div>
    </form>
  );
}
