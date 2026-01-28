import { renderHook } from '@testing-library/react';

import React, { act } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useSearchParamState } from '~/client/filters/hooks/useSearchParamState';
import { MockRoute } from '~/tests/MockRoute';

describe('useSearchParamState', () => {
    it('returns default value when param missing', () => {
        const { result } = renderHook(
            () => {
                const [value] = useSearchParamState('q', 'default');
                const [searchParams] = useSearchParams();
                return { value, searchParams };
            },
            {
                wrapper: ({ children }) => <MockRoute>{children}</MockRoute>,
            }
        );

        expect(result.current.value).toBe('default');
        expect(result.current.searchParams.get('q')).toBeNull();
    });

    it('returns param value when present', () => {
        const { result } = renderHook(
            () => {
                const [value] = useSearchParamState('q', 'default');
                return { value };
            },
            {
                wrapper: ({ children }) => <MockRoute initialEntries={['/?q=hello']}>{children}</MockRoute>,
            }
        );

        expect(result.current.value).toBe('hello');
    });

    it('updates search params when value changes', () => {
        const { result } = renderHook(
            () => {
                const [value, setValue] = useSearchParamState('q', '');
                const [searchParams] = useSearchParams();
                return { value, setValue, searchParams };
            },
            {
                wrapper: ({ children }) => <MockRoute>{children}</MockRoute>,
            }
        );

        act(() => result.current.setValue('next'));

        expect(result.current.value).toBe('next');
        expect(result.current.searchParams.get('q')).toBe('next');
    });

    it('clears search param when value is empty', () => {
        const { result } = renderHook(
            () => {
                const [value, setValue] = useSearchParamState('q', 'default');
                const [searchParams] = useSearchParams();
                return { value, setValue, searchParams };
            },
            {
                wrapper: ({ children }) => <MockRoute initialEntries={['/?q=hello']}>{children}</MockRoute>,
            }
        );

        act(() => result.current.setValue(''));

        expect(result.current.value).toBe('default');
        expect(result.current.searchParams.get('q')).toBeNull();
    });
});
