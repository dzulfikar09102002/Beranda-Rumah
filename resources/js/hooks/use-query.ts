import { useMemo } from 'react';

export function useQuery() {
    const search = typeof window !== 'undefined' ? window.location.search : '';

    return useMemo(() => {
        if (!search) return {};
        return Object.fromEntries(new URLSearchParams(search));
    }, [search]);
}
