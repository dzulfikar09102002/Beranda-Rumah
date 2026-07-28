import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return (
        <img src="/assets/images/logo-dharmawanita.png" alt="Logo" {...props} />
    );
}
