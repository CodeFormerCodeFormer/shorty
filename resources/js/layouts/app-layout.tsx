import AppNavbarLayout from '@/layouts/app/app-navbar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppNavbarLayout breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppNavbarLayout>
);
