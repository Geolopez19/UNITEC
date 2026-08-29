import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-background text-on-background flex antialiased">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-1 ml-0 md:ml-[260px] flex flex-col min-h-screen w-full">
        <TopBar
          title={title}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <div className="flex-1 pt-20 md:pt-24 px-4 sm:px-6 md:px-8 pb-24 md:pb-12 w-full max-w-[1440px] mx-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};
