
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/savvy-cart/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6 flex items-center justify-center">
          <p>Loading profile...</p>
        </main>
      </div>
    );
  }

  if (!user) {
     // This case should ideally be handled by middleware, but as a fallback:
    router.push('/login');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 flex justify-center">
        <Card className="w-full max-w-lg mt-8 shadow-xl">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
              <AvatarFallback className="text-4xl">
                {user.email ? user.email[0].toUpperCase() : <UserIcon className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{user.displayName || 'Savvy Shopper'}</CardTitle>
            <CardDescription>Your personal account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            
            {user.emailVerified && (
              <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-md border border-green-500/50">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <p className="font-medium text-green-600 dark:text-green-400">Email Verified</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
              <UserIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium text-xs break-all">{user.uid}</p>
              </div>
            </div>
             <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
            {/* Add more profile fields or edit functionality here in the future */}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
