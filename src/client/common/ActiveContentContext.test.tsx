import { renderHook } from '@testing-library/react';

import React, { act, useState } from 'react';

import { ActiveContentContext, useActiveContent, type ActiveContent } from '~/client/common/ActiveContentContext';

function Test({ activeValue, children }: React.PropsWithChildren<{ activeValue?: ActiveContent }>) {
    const [active, setActive] = useState<ActiveContent | undefined>(activeValue);
    return <ActiveContentContext value={[active, setActive]}>{children}</ActiveContentContext>;
}

describe('<ActiveContentContext>', () => {
    it('returns undefined active variant if contexts is not initialized', () => {
        const { result } = renderHook(() => useActiveContent());

        expect(result.current).toStrictEqual([undefined, expect.any(Function)]);
    });

    it('returns defined active variant if contexts is initialized', () => {
        const activeValue = { data: { group: 'Uogienės', variant: 'p' } };
        const { result } = renderHook(() => useActiveContent(), {
            wrapper: ({ children }) => <Test activeValue={activeValue}>{children}</Test>,
        });

        expect(result.current).toStrictEqual([activeValue, expect.any(Function)]);
    });

    it('returns updated active variant if contexts is initialized', () => {
        const { result } = renderHook(() => useActiveContent(), {
            wrapper: ({ children }) => <Test>{children}</Test>,
        });
        const activeValue = { data: { group: 'Daržovės', variant: 'd' } };
        act(() => {
            result.current[1](activeValue);
        });

        expect(result.current).toStrictEqual([activeValue, expect.any(Function)]);
    });

    it('returns defined active variant with ref and pinned flag', () => {
        const activeValue = { group: 'Uogienės', variant: 'x', ref: { current: null }, pinned: true };
        const { result } = renderHook(() => useActiveContent(), {
            wrapper: ({ children }) => <Test activeValue={activeValue}>{children}</Test>,
        });

        expect(result.current).toStrictEqual([activeValue, expect.any(Function)]);
    });
});
