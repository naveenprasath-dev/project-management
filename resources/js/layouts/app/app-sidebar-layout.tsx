import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden flex flex-col">
                <AppHeader breadcrumbs={breadcrumbs} />
                <div className="flex-1 overflow-y-auto page-enter">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
