'use client';

import { ReactNode } from 'react';
import OrgMngSidebar from '../sidebar/OrgMngSidebar';

interface OrgMngLayoutProps {
  children: ReactNode;
  user: any;
  profile: any;
}

export default function OrgMngLayout({ children, user, profile }: OrgMngLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#F5FAFF] to-white dark:from-gray-900 dark:to-gray-800">
      <OrgMngSidebar user={user} profile={profile} />
      
      {/* Main Content - with left margin for sidebar */}
      <main className="flex-1 ml-20 transition-all duration-300">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
