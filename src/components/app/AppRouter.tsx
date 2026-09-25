import { usePathname } from 'next/navigation';
import React from 'react';

import { AmountViewWrapper } from '~/components/amounts/AmountViewContext';
import { GroupFilterWrapper } from '~/features/filters/GroupFilterContext';
import { QuickFilterWrapper } from '~/features/filters/QuickFilterContext';
import { GroupsPage } from '~/features/groups/GroupsPage';
import { ProductsPage } from '~/features/products/ProductsPage';
import { SummaryPage } from '~/features/summary/SummaryPage';
import { VariantsPage } from '~/features/variants/VariantsPage';
import { Links } from '~/lib/links';

function QuickFilterLayout({ children }: React.PropsWithChildren) {
    return (
        <QuickFilterWrapper>
            <AmountViewWrapper>{children}</AmountViewWrapper>
        </QuickFilterWrapper>
    );
}

function GroupFilterLayout({ children }: React.PropsWithChildren) {
    return <GroupFilterWrapper>{children}</GroupFilterWrapper>;
}

export function AppRouter() {
    const pathname = usePathname();
    if (pathname === Links.CATEGORIES) {
        return <GroupsPage />;
    }

    const page =
        pathname === Links.VARIANTS ? (
            <VariantsPage />
        ) : pathname === Links.SUMMARY ? (
            <SummaryPage />
        ) : (
            <ProductsPage />
        );

    return (
        <GroupFilterLayout>
            <QuickFilterLayout>{page}</QuickFilterLayout>
        </GroupFilterLayout>
    );
}
