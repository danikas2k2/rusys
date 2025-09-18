import { renderHook } from '@testing-library/react';
import { getDetailsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useDetails } from '~/state/details/useDetails';
import { type Details } from '~/types/data';

describe('useDetails', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useDetails(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });

    it('return filled state', () => {
        const details: Details[] = getDetailsFixture();
        const { result } = renderHook(() => useDetails(), {
            wrapper: ({ children }) => <MockRedux state={{ details }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(details);
    });
});
