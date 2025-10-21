import { act, renderHook } from '@testing-library/react';

import React, { useState, type PropsWithChildren } from 'react';

import { ActiveRowContext, useActiveRow, type ActiveRow } from '~/client/common/ActiveRowContext';

interface ActiveValue extends ActiveRow {
    group: string;
    variant: string;
}

function Test({ activeValue, children }: PropsWithChildren<{ activeValue?: ActiveValue }>) {
    const [active, setActive] = useState<ActiveRow | undefined>(activeValue);
    return <ActiveRowContext value={[active, setActive]}>{children}</ActiveRowContext>;
}

describe('<ActiveRowContext>', () => {
    it('returns undefined active variant if contexts is not initialized', () => {
        const { result } = renderHook(() => useActiveRow());

        expect(result.current).toStrictEqual([undefined, expect.any(Function)]);
    });

    it('returns defined active variant if contexts is initialized', () => {
        const activeValue = { group: 'Uogienės', variant: 'p' };
        const { result } = renderHook(() => useActiveRow(), {
            wrapper: ({ children }) => {
                return <Test activeValue={activeValue}>{children}</Test>;
            },
        });

        expect(result.current).toStrictEqual([activeValue, expect.any(Function)]);
    });

    it('returns updated active variant if contexts is initialized', () => {
        const { result } = renderHook(() => useActiveRow<ActiveValue>(), {
            wrapper: ({ children }) => <Test>{children}</Test>,
        });
        const activeValue = { group: 'Daržovės', variant: 'd' };
        act(() => {
            result.current[1](activeValue);
        });

        expect(result.current).toStrictEqual([activeValue, expect.any(Function)]);
    });

    it('returns defined active variant with ref and pinned flag', () => {
        const activeValue = { group: 'Uogienės', variant: 'x', ref: { current: null }, pinned: true };
        const { result } = renderHook(() => useActiveRow(), {
            wrapper: ({ children }) => {
                return <Test activeValue={activeValue}>{children}</Test>;
            },
        });

        expect(result.current).toStrictEqual([activeValue, expect.any(Function)]);
    });
});
