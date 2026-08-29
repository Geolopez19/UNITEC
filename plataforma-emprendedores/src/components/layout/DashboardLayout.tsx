import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-background text-on-background flex antialiased">
      <Sidebar />
      <main className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <TopBar title={title} />
        <div className="flex-1 pt-24 px-8 pb-12 w-full max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
