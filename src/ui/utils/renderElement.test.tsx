import { renderHook } from '@testing-library/react';

import React from 'react';

import { renderElement } from '@ui/utils/renderElement';

describe('renderElement', () => {
    it('returns rendered string element', () => {
        const { result } = renderHook(() => renderElement('test'));

        expect(result.current).toBe('test');
    });

    const element = <div>test</div>;

    it('returns rendered function element', () => {
        const { result } = renderHook(() => renderElement(() => element));

        expect(result.current).toBe(element);
    });

    it('returns cloned element', () => {
        const { result } = renderHook(() => renderElement(element));

        expect(result.current).toStrictEqual(<div>test</div>);
        expect(result.current).not.toBe(element);
    });

    it('returns null if passed null', () => {
        const { result } = renderHook(() => renderElement(null));

        expect(result.current).toBeNull();
    });
});
