import { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface LayoutProps {
  children: ReactNode;
  isDark: boolean;
  onThemeToggle: () => void;
}

export function Layout({ children, isDark, onThemeToggle }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isDark={isDark} onThemeToggle={onThemeToggle} />
      <main className="flex-1 bg-background">
        {children}
      </main>
      <Footer />
    </div>
  );
}
