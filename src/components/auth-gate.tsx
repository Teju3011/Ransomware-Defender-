
'use client';

import React, { useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Loader2, Shield } from 'lucide-react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Ransomware Defender</h1>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Initializing Security Systems...</p>
      </div>
    );
  }

  return <>{children}</>;
}
