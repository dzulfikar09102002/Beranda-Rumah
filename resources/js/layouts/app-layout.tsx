import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';
import { Toaster } from 'sonner';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <main className="flex-1 p-4 pb-12">{children}</main>

        <footer className="border-t py-4 text-center text-sm">
            Copyright &copy; {new Date().getFullYear()} DWP Kota Surabaya. All
            rights reserved
        </footer>

        <Toaster />
    </AppLayoutTemplate>
);
