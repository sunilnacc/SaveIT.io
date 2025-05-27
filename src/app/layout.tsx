
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Script from 'next/script'; // Import Script for JS

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SaveIT.io',
  description: 'Compare Smart. Save Big.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>

        {/* 
          TypeScript might not recognize df-messenger and df-messenger-chat-bubble as standard JSX elements.
          Using @ts-ignore to suppress these errors for custom web components.
          Alternatively, you could declare these elements in a global.d.ts file.
          e.g.,
          declare namespace JSX {
            interface IntrinsicElements {
              'df-messenger': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'project-id': string; 'agent-id': string; 'language-code': string; 'max-query-length': string; }, HTMLElement>;
              'df-messenger-chat-bubble': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'chat-title': string; }, HTMLElement>;
            }
          }
        */}
        {/* @ts-ignore ts(2322) TODO: Add custom element type declarations if needed */}
        <df-messenger
          project-id={process.env.NEXT_PUBLIC_DIALOGFLOW_PROJECT_ID}
          agent-id={process.env.NEXT_PUBLIC_DIALOGFLOW_AGENT_ID}
          language-code="en"
          max-query-length="-1">
          {/* @ts-ignore ts(2322) TODO: Add custom element type declarations if needed */}
          <df-messenger-chat-bubble
            chat-title="SaveIT AI Assistant">
          </df-messenger-chat-bubble>
        </df-messenger>
        
        <Script
          src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js"
          strategy="afterInteractive"
        />
        
        <style dangerouslySetInnerHTML={{ __html: `
          df-messenger {
            z-index: 999;
            position: fixed;
            --df-messenger-font-color: #000;
            --df-messenger-font-family: Google Sans;
            --df-messenger-chat-background: #f3f6fc;
            --df-messenger-message-user-background: #d3e3fd;
            --df-messenger-message-bot-background: #fff;
            bottom: 16px;
            right: 16px;
          }
        `}} />
      </body>
    </html>
  );
}
