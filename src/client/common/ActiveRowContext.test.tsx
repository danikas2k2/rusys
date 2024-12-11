import { act, renderHook } from '@testing-library/react';
import React, { type PropsWithChildren, useState } from 'react';
import { type ActiveRow, ActiveRowContext, useActiveRow } from '~/client/common/ActiveRowContext';
import { type ActiveVariant } from '~/client/variants/SortableVariant';

function Test({ activeVariant, children }: PropsWithChildren<{ activeVariant?: ActiveVariant }>) {
    const [active, setActive] = useState<ActiveRow | undefined>(activeVariant);
    return <ActiveRowContext value={[active, setActive]}>{children}</ActiveRowContext>;
}

describe('ActiveRowContext', () => {
    it('returns undefined active variant if contexts is not initialized', () => {
        const { result } = renderHook(() => useActiveRow());
        expect(result.current).toEqual([undefined, expect.any(Function)]);
    });

    it('returns defined active variant if contexts is initialized', () => {
        const activeVariant = { group: 'Uogienės', variant: 'p' };
        const { result } = renderHook(() => useActiveRow(), {
            wrapper: ({ children }) => {
                return <Test activeVariant={activeVariant}>{children}</Test>;
            },
        });
        expect(result.current).toEqual([activeVariant, expect.any(Function)]);
    });

    it('returns updated active variant if contexts is initialized', () => {
        const { result } = renderHook(() => useActiveRow<ActiveVariant>(), {
            wrapper: ({ children }) => <Test>{children}</Test>,
        });
        const activeVariant = { group: 'Daržovės', variant: 'd' };
        act(() => {
            result.current[1](activeVariant);
        });
        expect(result.current).toEqual([activeVariant, expect.any(Function)]);
    });

    it('returns defined active variant with ref and pinned flag', () => {
        const activeVariant = { group: 'Uogienės', variant: 'x', ref: { current: null }, pinned: true };
        const { result } = renderHook(() => useActiveRow(), {
            wrapper: ({ children }) => {
                return <Test activeVariant={activeVariant}>{children}</Test>;
            },
        });
        expect(result.current).toEqual([activeVariant, expect.any(Function)]);
    });
});
