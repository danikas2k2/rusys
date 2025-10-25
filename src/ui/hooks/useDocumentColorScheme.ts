import { useEffect } from 'react';

import { useMantineColorScheme, type MantineColorScheme } from '@mantine/core';

import { usePreferredColorScheme } from '@ui/hooks/usePreferredColorScheme';

export function useDocumentColorScheme(auto = true): MantineColorScheme {
    const { colorScheme } = useMantineColorScheme();
    const preferredColorScheme = usePreferredColorScheme();
    const documentColorScheme = auto || colorScheme !== 'auto' ? colorScheme : preferredColorScheme;

    useEffect(() => {
        const dataset = document.documentElement.dataset;
        if (documentColorScheme !== (dataset.colorScheme ?? 'auto')) {
            if (auto && documentColorScheme === 'auto') {
                delete dataset.colorScheme;
            } else {
                dataset.colorScheme = documentColorScheme;
            }
        }
    }, [auto, documentColorScheme]);

    return documentColorScheme as MantineColorScheme;
}
