import { renderHook } from '@testing-library/react';

import { useUpdateType } from '~/client/common/UpdateTypeContext';
import { useRecycledSummary } from '~/client/pages/summary/hooks/useRecycledSummary';
import { useSummary } from '~/client/state/summary/useSummary';

vi.mock('~/client/state/summary/useSummary');
vi.mock('~/client/common/UpdateTypeContext');

describe('useRecycledSummary', () => {
    beforeEach(() =>
        vi.mocked(useSummary).mockReturnValue([
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

    afterEach(() => vi.clearAllMocks());

    it('filters amounts by recycled flag when updateType is recycled', () => {
        vi.mocked(useUpdateType).mockReturnValue(['recycled', vi.fn()]);

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
        vi.mocked(useUpdateType).mockReturnValue(['consumed', vi.fn()]);

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
        vi.mocked(useSummary).mockReturnValue([
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
        vi.mocked(useUpdateType).mockReturnValue(['recycled', vi.fn()]);

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
        vi.mocked(useSummary).mockReturnValue([
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
        vi.mocked(useUpdateType).mockReturnValue(['recycled', vi.fn()]);

        const { result } = renderHook(() => useRecycledSummary());

        expect(result.current).toStrictEqual([]);
    });

    it('handles undefined years', () => {
        vi.mocked(useSummary).mockReturnValue([
            {
                group: 'Group1',
                name: 'Item1',
                years: undefined,
            },
        ]);
        vi.mocked(useUpdateType).mockReturnValue(['recycled', vi.fn()]);

        const { result } = renderHook(() => useRecycledSummary());

        expect(result.current).toStrictEqual([]);
    });

    it('handles item with undefined years in mixed array', () => {
        vi.mocked(useSummary).mockReturnValue([
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
        vi.mocked(useUpdateType).mockReturnValue(['recycled', vi.fn()]);

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
