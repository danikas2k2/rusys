import { render, renderHook, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import React, { use } from 'react';

import { UpdateTypeContext, UpdateTypeWrapper, useUpdateType } from '~/client/common/UpdateTypeContext';

describe('<UpdateTypeContext>', () => {
    it('uses context with default value', () => {
        const { result } = renderHook(() => use(UpdateTypeContext));

        expect(result.current).toStrictEqual(['consumed', expect.any(Function)]);
    });
});

describe('useUpdateType', () => {
    it('returns consumed update variant', () => {
        const { result } = renderHook(() => useUpdateType());

        expect(result.current).toStrictEqual(['consumed', expect.any(Function)]);
    });

    it('returns recycled update variant', () => {
        const setRecycled = vi.fn();
        const { result } = renderHook(() => useUpdateType(), {
            wrapper: ({ children }) => (
                <UpdateTypeContext value={['recycled', setRecycled]}>{children}</UpdateTypeContext>
            ),
        });

        expect(result.current).toStrictEqual(['recycled', setRecycled]);
    });

    it('returns update-only variant', () => {
        const setRecycled = vi.fn();
        const { result } = renderHook(() => useUpdateType(), {
            wrapper: ({ children }) => (
                <UpdateTypeContext value={['updated', setRecycled]}>{children}</UpdateTypeContext>
            ),
        });

        expect(result.current).toStrictEqual(['updated', setRecycled]);
    });
});

describe('<UpdateTypeContextWrapper>', () => {
    function Test() {
        const [updateVariant, setUpdateVariant] = useUpdateType();
        return <button onClick={() => setUpdateVariant('recycled')}>{updateVariant}</button>;
    }

    it('uses context with default value', () => {
        render(
            <UpdateTypeWrapper>
                <Test />
            </UpdateTypeWrapper>
        );

        expect(screen.getByRole('button')).toHaveTextContent('consumed');
    });

    it('changes context', async () => {
        render(
            <UpdateTypeWrapper>
                <Test />
            </UpdateTypeWrapper>
        );
        await user.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveTextContent('recycled');
    });
});
