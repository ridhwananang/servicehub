import React from 'react';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    const childElement = React.isValidElement(children) ? children : null;
    const childLayout = (childElement?.type as { layout?: { title?: string; description?: string } } | undefined)?.layout;
    const resolvedTitle = title || childLayout?.title || '';
    const resolvedDescription = description || childLayout?.description || '';

    return (
        <AuthLayoutTemplate title={resolvedTitle} description={resolvedDescription}>
            {children}
        </AuthLayoutTemplate>
    );
}

