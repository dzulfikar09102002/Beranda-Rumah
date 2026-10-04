const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export function formatRupiah(value: number): string {
    return rupiah.format(value);
}

const categoryEmoji: [RegExp, string][] = [
    [/latte|expresso|espresso|shot|kopi|coffee/i, '☕'],
    [/tea|teh/i, '🍵'],
    [/milk|susu/i, '🥛'],
    [/minuman/i, '🧃'],
    [/makanan|snack/i, '🍪'],
    [/sembako|pokok/i, '🍚'],
    [/bumbu/i, '🌶️'],
    [/kebersihan/i, '🧼'],
    [/perawatan/i, '🧴'],
    [/pewangi/i, '🌸'],
    [/fashion|sandang/i, '👕'],
    [/aksesoris/i, '💍'],
    [/kerajinan/i, '🧺'],
    [/kosmetik|kecantikan/i, '💄'],
    [/batik|kain/i, '🧵'],
];

export function emojiFor(category: string | null): string {
    return (
        categoryEmoji.find(([pattern]) => pattern.test(category ?? ''))?.[1] ??
        '🛍️'
    );
}

const gradients = [
    'from-[#F6D7B8] via-[#F2B98F] to-[#E58E62]',
    'from-[#DDE7C7] via-[#B9CC98] to-[#8FA872]',
    'from-[#F9E3A3] via-[#F4C55F] to-[#E9A23B]',
    'from-[#F5D0D3] via-[#EBA7AE] to-[#D97B86]',
    'from-[#D6E4EC] via-[#A9C6D6] to-[#7AA3BB]',
    'from-[#E7DAF0] via-[#C9B2DE] to-[#A486C4]',
];

export function gradientFor(id: number): string {
    return gradients[id % gradients.length];
}

export function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join('');
}
