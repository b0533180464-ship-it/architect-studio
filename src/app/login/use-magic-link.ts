'use client';

import { useState } from 'react';

export function useMagicLink() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('קישור התחברות נשלח למייל שלך!');
      } else {
        setMessage(data.error || 'שגיאה בשליחת המייל. נסה שוב.');
      }
    } catch {
      setMessage('שגיאה בשליחת המייל. נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, isLoading, message, handleSubmit };
}
