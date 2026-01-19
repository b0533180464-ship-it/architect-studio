/* eslint-disable max-lines-per-function */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExpandablePanelProps {
  id: string;
  title: string;
  icon?: string;
  count?: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  projectId: string;
}

const STORAGE_KEY = 'project-hub-panels';

function getPanelState(projectId: string, panelId: string): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const state = JSON.parse(stored);
    return state[projectId]?.[panelId] ?? null;
  } catch {
    return null;
  }
}

function setPanelState(projectId: string, panelId: string, expanded: boolean) {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const state = stored ? JSON.parse(stored) : {};
    if (!state[projectId]) state[projectId] = {};
    state[projectId][panelId] = expanded;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function ExpandablePanel({
  id,
  title,
  icon,
  count,
  defaultExpanded = true,
  children,
  projectId,
}: ExpandablePanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getPanelState(projectId, id);
    if (saved !== null) setExpanded(saved);
  }, [projectId, id]);

  const handleToggle = () => {
    const newState = !expanded;
    setExpanded(newState);
    setPanelState(projectId, id, newState);
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer py-3" onClick={handleToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span>{icon}</span>}
            <CardTitle className="text-base">{title}</CardTitle>
            {typeof count === 'number' && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{count}</span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className={cn('transition-transform', expanded && mounted ? 'rotate-180' : '')}> ▼</span>
          </Button>
        </div>
      </CardHeader>
      {expanded && mounted && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
