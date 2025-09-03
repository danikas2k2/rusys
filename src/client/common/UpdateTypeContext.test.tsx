import React, { use } from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    UpdateTypeContext,
    UpdateTypeContextWrapper,
    UpdateTypes,
    useUpdateType,
} from '~/client/common/UpdateTypeContext';

describe('<UpdateTypeContext>', () => {
    it('uses context with default value', () => {
        const { result } = renderHook(() => use(UpdateTypeContext));

        expect(result.current).toStrictEqual([UpdateTypes.Consumed, expect.any(Function)]);
    });
});

describe('useUpdateType', () => {
    it('returns consumed update variant', () => {
        const { result } = renderHook(() => useUpdateType());

        expect(result.current).toStrictEqual([UpdateTypes.Consumed, expect.any(Function)]);
    });

    it('returns recycled update variant', () => {
        const setRecycled = jest.fn();
        const { result } = renderHook(() => useUpdateType(), {
            wrapper: ({ children }) => (
                <UpdateTypeContext value={[UpdateTypes.Recycled, setRecycled]}>{children}</UpdateTypeContext>
            ),
        });

        expect(result.current).toStrictEqual([UpdateTypes.Recycled, setRecycled]);
    });

    it('returns update-only variant', () => {
        const setRecycled = jest.fn();
        const { result } = renderHook(() => useUpdateType(), {
            wrapper: ({ children }) => (
                <UpdateTypeContext value={[UpdateTypes.Updated, setRecycled]}>{children}</UpdateTypeContext>
            ),
        });

        expect(result.current).toStrictEqual([UpdateTypes.Updated, setRecycled]);
    });
});

describe('<UpdateTypeContextWrapper>', () => {
    function Test() {
        const [updateVariant, setUpdateVariant] = useUpdateType();
        return <button onClick={() => setUpdateVariant(UpdateTypes.Recycled)}>{updateVariant}</button>;
    }

    it('uses context with default value', () => {
        render(
            <UpdateTypeContextWrapper>
                <Test />
            </UpdateTypeContextWrapper>
        );

        expect(screen.getByRole('button')).toHaveTextContent('consumed');
    });

    it('changes context', async () => {
        render(
            <UpdateTypeContextWrapper>
                <Test />
            </UpdateTypeContextWrapper>
        );
        await userEvent.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveTextContent('recycled');
    });
});
