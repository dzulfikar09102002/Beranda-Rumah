import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md border border-muted-foreground bg-sidebar-primary-foreground">
                <AppLogoIcon className="size-8 rounded-md bg-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                {/* <span className="mb-0.5 truncate leading-tight font-semibold">
                    BERANDA RUMAH
                </span> */}
                <img
                    src="/assets/images/logo-brand.png"
                    alt="Logo"
                    className="h-10 w-auto"
                />
            </div>
        </>
    );
}
