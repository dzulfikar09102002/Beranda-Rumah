import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return (
        <img src="/assets/images/logo-brand2.png" alt="Logo" {...props} />
    );
}
