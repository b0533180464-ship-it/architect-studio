'use client';

import { TRPCProvider } from '@/components/providers/trpc-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <TRPCProvider>{children}</TRPCProvider>
    </ThemeProvider>
  );
}
