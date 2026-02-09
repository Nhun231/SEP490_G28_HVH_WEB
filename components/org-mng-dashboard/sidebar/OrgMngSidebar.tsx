'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
    MdHome,
    MdPeople,
    MdCalendarToday,
    MdCheckCircle,
    MdLogout,
    MdPerson
} from 'react-icons/md';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    href: string;
    badge?: number;
    isExpanded: boolean;
    isActive: boolean;
}

const MenuItem = ({ icon, label, href, badge, isExpanded, isActive }: MenuItemProps) => {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group',
                isActive
                    ? 'bg-white text-[#42A5F5] shadow-md'
                    : 'text-white hover:bg-white/10',
                !isExpanded && 'justify-center'
            )}
        >
            <span className="text-xl flex-shrink-0">{icon}</span>
            {isExpanded && (
                <>
                    <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                    {badge && badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {badge}
                        </span>
                    )}
                </>
            )}
            {!isExpanded && badge && badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {badge}
                </span>
            )}
        </Link>
    );
};

interface OrgMngSidebarProps {
    user: any;
    profile: any;
}

export default function OrgMngSidebar({ user, profile }: OrgMngSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/dashboard/signin');
    };

    const menuItems = [
        { icon: <MdHome />, label: 'Dashboard', href: '/org-mng-dashboard' },
        { icon: <MdPeople />, label: 'Quản lý Host', href: '/org-mng-dashboard/hosts' },
        { icon: <MdCalendarToday />, label: 'Quản lý sự kiện', href: '/org-mng-dashboard/events' },
        { icon: <MdCheckCircle />, label: 'Phê duyệt sự kiện', href: '/org-mng-dashboard/pending-approval', badge: 7 },
        { icon: <MdPerson />, label: 'Thông tin cá nhân', href: '/org-mng-dashboard/personal-info' },
    ];

    return (
        <div
            className={cn(
                'fixed left-0 top-0 h-screen bg-gradient-to-b from-[#42A5F5] via-[#64B5F6] to-[#90CAF9] text-white transition-all duration-300 ease-in-out z-50 flex flex-col shadow-xl',
                isExpanded ? 'w-64' : 'w-20'
            )}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Logo Section */}
            <div className="p-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                    <Image
                        src="/img/logo.png"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="rounded-sm"
                    />
                    {isExpanded && (
                        <div>
                            <h1 className="font-bold text-lg">Tổ chức ABC</h1>
                            <p className="text-xs text-blue-50">Từ thiện xã hội</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <MenuItem
                        key={item.href}
                        icon={item.icon}
                        label={item.label}
                        href={item.href}
                        badge={item.badge}
                        isExpanded={isExpanded}
                        isActive={pathname === item.href}
                    />
                ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-white/20">
                <div className={cn('flex items-center gap-3', !isExpanded && 'justify-center')}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#42A5F5] font-bold flex-shrink-0">
                        Q
                    </div>
                    {isExpanded && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{profile?.full_name || 'Quản trị viên'}</p>
                            <p className="text-xs text-blue-50 truncate">{user?.email}</p>
                        </div>
                    )}
                </div>
                {isExpanded && (
                    <button
                        onClick={handleSignOut}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium backdrop-blur-sm"
                    >
                        <MdLogout />
                        <span>Đăng xuất</span>
                    </button>
                )}
                {!isExpanded && (
                    <button
                        onClick={handleSignOut}
                        className="mt-3 w-full flex items-center justify-center p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                    >
                        <MdLogout className="text-xl" />
                    </button>
                )}
            </div>
        </div>
    );
}
