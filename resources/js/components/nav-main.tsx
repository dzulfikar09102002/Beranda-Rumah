import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type NavItem = {
    title: string;
    href?: string;
    icon: any;
    children?: NavItem[];
};

export function NavMain({ items }: { items: NavItem[] }) {
    return (
        <div className="space-y-2">
            {items.map((item, index) =>
                item.children ? (
                    <CollapsibleItem key={index} item={item} />
                ) : (
                    <SingleItem key={index} item={item} />
                ),
            )}
        </div>
    );
}

function SingleItem({ item }: { item: NavItem }) {
    const { url } = usePage();
    const Icon = item.icon;

    const isActive = url.startsWith(item.href || '');

    return (
        <Link
            href={item.href!}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${isActive ? 'bg-muted font-semibold' : 'hover:bg-muted'} `}
        >
            <Icon className="h-4 w-4" />
            {item.title}
        </Link>
    );
}

function CollapsibleItem({ item }: { item: NavItem }) {
    const { url } = usePage();
    const [open, setOpen] = useState(true);
    const Icon = item.icon;

    const isActive = item.children?.some((child) =>
        url.startsWith(child.href || ''),
    );

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition ${isActive ? 'bg-muted font-semibold' : 'hover:bg-muted'} `}
            >
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.title}
                </div>

                <ChevronDown
                    className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="mt-1 ml-6 space-y-1">
                    {item.children?.map((child, i) => {
                        const ChildIcon = child.icon;
                        const active = url.startsWith(child.href || '');

                        return (
                            <Link
                                key={i}
                                href={child.href!}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                                    active
                                        ? 'bg-muted font-semibold'
                                        : 'hover:bg-muted'
                                } `}
                            >
                                <ChildIcon className="h-4 w-4" />
                                {child.title}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
