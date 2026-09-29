import { usePathname } from 'next/navigation';
import React, { use } from 'react';

import { AmountViewWrapper } from '~/components/amounts/AmountViewContext';
import { InitialGroupContext } from '~/components/app/InitialGroupContext';
import { GroupFilterWrapper } from '~/features/filters/GroupFilterContext';
import { QuickFilterWrapper } from '~/features/filters/QuickFilterContext';
import { GroupsPage } from '~/features/groups/GroupsPage';
import { ProductsPage } from '~/features/products/ProductsPage';
import { SummaryPage } from '~/features/summary/SummaryPage';
import { VariantsPage } from '~/features/variants/VariantsPage';
import { Links } from '~/lib/links';
import { useGroups } from '~/store/groups/useGroups';

function QuickFilterLayout({ children }: React.PropsWithChildren) {
    return (
        <QuickFilterWrapper>
            <AmountViewWrapper>{children}</AmountViewWrapper>
        </QuickFilterWrapper>
    );
}

function GroupFilterLayout({ children, initialGroup }: React.PropsWithChildren<{ initialGroup: string }>) {
    return <GroupFilterWrapper initialState={initialGroup}>{children}</GroupFilterWrapper>;
}

export function AppRouter() {
    const pathname = usePathname();
    const groups = useGroups();
    const initialGroup = use(InitialGroupContext) ?? groups[0]?.group ?? '';
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
        <GroupFilterLayout initialGroup={initialGroup}>
            <QuickFilterLayout>{page}</QuickFilterLayout>
        </GroupFilterLayout>
    );
}
