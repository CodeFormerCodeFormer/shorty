import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Folder } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'My Short URLs',
        href: '/short-urls',
        icon: Folder,
    },
];

export function AppSidebar() {
    return (
        <>
            <div>
                <div>
                    <div>
                        <div>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <NavMain items={mainNavItems} />
            </div>

            <div>
                <NavUser />
            </div>
        </>
    );
}
