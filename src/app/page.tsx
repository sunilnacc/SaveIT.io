'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/savvy-cart/Logo';
import { Loader2 } from 'lucide-react';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer); // Cleanup the timer
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Logo size="large" />
      <p className="mt-4 text-xl md:text-2xl text-center text-muted-foreground">
        Compare Smart. Save Big.
      </p>
      <Loader2 className="mt-8 h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
