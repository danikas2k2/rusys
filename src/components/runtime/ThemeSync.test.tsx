import { render } from '@testing-library/react';

import { useMantineColorScheme } from '@mantine/core';
import { useTheme } from 'next-themes';
import React from 'react';

import { ThemeSync } from '~/components/runtime/ThemeSync';

vi.mock(import('@mantine/core'), async () => ({
    ...(await vi.importActual('@mantine/core')),
    useMantineColorScheme: vi.fn(),
}));
vi.mock(import('next-themes'), () => ({ useTheme: vi.fn() }));

describe('<ThemeSync>', () => {
    const setColorScheme = vi.fn();

    beforeEach(() => {
        vi.mocked(useMantineColorScheme).mockReturnValue({ setColorScheme } as ReturnType<
            typeof useMantineColorScheme
        >);
    });

    afterEach(() => vi.clearAllMocks());

    it.each([
        ['dark', 'dark'],
        ['light', 'light'],
        ['auto', 'auto'],
        ['system', 'auto'],
    ])('maps saved %s theme to Mantine %s', (theme, expected) => {
        vi.mocked(useTheme).mockReturnValue({ theme } as ReturnType<typeof useTheme>);

        render(<ThemeSync />);

        expect(setColorScheme).toHaveBeenCalledWith(expected);
    });
});
