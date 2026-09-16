import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({ className, alt = 'Aquos Platinum Logo', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/icons/logo.png"
            alt={alt}
            className={cn('object-contain', className)}
            {...props}
        />
    );
}
