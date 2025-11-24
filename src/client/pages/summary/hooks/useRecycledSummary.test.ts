import { renderHook } from '@testing-library/react';

import { useUpdateType } from '~/client/common/UpdateTypeContext';
import { useRecycledSummary } from '~/client/pages/summary/hooks/useRecycledSummary';
import { useSummary } from '~/client/state/summary/useSummary';

jest.mock('~/client/state/summary/useSummary');
jest.mock('~/client/common/UpdateTypeContext');

describe('useRecycledSummary', () => {
    beforeEach(() =>
        jest.mocked(useSummary).mockReturnValue([
            {
                group: 'Group1',
                name: 'Item1',
                years: [
                    {
                        year: 2023,
                        amounts: [
                            { variant: 'v1', amount: 1, recycled: true },
                            { variant: 'v2', amount: 2, recycled: false },
                        ],
                    },
                    {
                        year: 2022,
                        amounts: [{ variant: 'v1', amount: 3, recycled: true }],
                    },
                ],
            },
            {
                group: 'Group2',
                name: 'Item2',
                years: [
                    {
                        year: 2023,
                        amounts: [{ variant: 'v1', amount: 4, recycled: false }],
                    },
                ],
            },
        ])
    );

    afterEach(() => jest.clearAllMocks());

    it('filters amounts by recycled flag when updateType is recycled', () => {
        jest.mocked(useUpdateType).mockReturnValue(['recycled', jest.fn()]);

        const { result } = renderHook(() => useRecycledSummary());

        expect(result.current).toStrictEqual([
            {
                group: 'Group1',
                name: 'Item1',
                years: [
                    {
                        year: 2023,
                        amounts: [{ variant: 'v1', amount: 1, recycled: true }],
                    },
                    {
                        year: 2022,
                        amounts: [{ variant: 'v1', amount: 3, recycled: true }],
                    },
                ],
            },
        ]);
    });

    it('filters amounts by non-recycled flag when updateType is consumed', () => {
        jest.mocked(useUpdateType).mockReturnValue(['consumed', jest.fn()]);

        const { result } = renderHook(() => useRecycledSummary());

        expect(result.current).toStrictEqual([
            {
                group: 'Group1',
                name: 'Item1',
                years: [
                    {
                        year: 2023,
                        amounts: [{ variant: 'v2', amount: 2, recycled: false }],
                    },
                ],
            },
            {
                group: 'Group2',
                name: 'Item2',
                years: [
                    {
                        year: 2023,
                        amounts: [{ variant: 'v1', amount: 4, recycled: false }],
                    },
                ],
            },
        ]);
    });

    it('filters out years with no matching amounts', () => {
        jest.mocked(useSummary).mockReturnValue([
            {
                group: 'Group1',
                name: 'Item1',
                years: [
                    {
                        year: 2023,
                        amounts: [{ variant: 'v1', amount: 1, recycled: true }],
                    },
                    {
                        year: 2022,
                        amounts: [{ variant: 'v1', amount: 2, recycled: false }],
                    },
                ],
            },
        ]);
        jest.mocked(useUpdateType).mockReturnValue(['recycled', jest.fn()]);

        const { result } = renderHook(() => useRecycledSummary());

        expect(result.current).toStrictEqual([
            {
                group: 'Group1',
                name: 'Item1',
                years: [
                    {
                        year: 2023,
                        amounts: [{ variant: 'v1', amount: 1, recycled: true }],
                    },
                ],
            },
        ]);
    });

    it('filters out variants with no matching years', () => {
        jest.mocked(useSummary).mockReturnValue([
            {
                group: 'Group1',
                name: 'Item1',
                years: [
                    {
                        year: 2023,
                        amounts: [{ variant: 'v1', amount: 1, recycled: false }],
                    },
                ],
            },
        ]);
        jest.mocked(useUpdateType).mockReturnValue(['recycled', jest.fn()]);

        const { result } = renderHook(() => useRecycledSummary());

        expect(result.current).toStrictEqual([]);
    });

    it('handles undefined years', () => {
        jest.mocked(useSummary).mockReturnValue([
            {
                group: 'Group1',
                name: 'Item1',
                years: undefined,
            },
        ]);
        jest.mocked(useUpdateType).mockReturnValue(['recycled', jest.fn()]);

        const { result } = renderHook(() => useRecycledSummary());

        expect(result.current).toStrictEqual([]);
    });

    it('handles item with undefined years in mixed array', () => {
        jest.mocked(useSummary).mockReturnValue([
            {
                group: 'Group1',
                name: 'Item1',
                years: [
                    {
                        year: 2023,
                        amounts: [{ variant: 'v1', amount: 1, recycled: true }],
                    },
                ],
            },
            {
                group: 'Group2',
                name: 'Item2',
                years: undefined,
            },
        ]);
        jest.mocked(useUpdateType).mockReturnValue(['recycled', jest.fn()]);

        const { result } = renderHook(() => useRecycledSummary());

        expect(result.current).toStrictEqual([
            {
                group: 'Group1',
                name: 'Item1',
                years: [
                    {
                        year: 2023,
                        amounts: [{ variant: 'v1', amount: 1, recycled: true }],
                    },
                ],
            },
        ]);
    });
});
