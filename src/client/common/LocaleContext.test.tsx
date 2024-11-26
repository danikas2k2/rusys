import { renderHook } from '@testing-library/react';
import { useContext } from 'react';
import { LocaleContext } from '~/client/common/LocaleContext';
import { withLocaleContext } from '~/tests/withLocaleContext';

describe('LocaleContext', () => {
    afterEach(() => {});

    it('uses context with default locale', () => {
        const { result } = renderHook(() => useContext(LocaleContext));
        expect(result.current).toEqual('en-US');
    });

    it('uses context with custom locale', () => {
        const { result } = renderHook(() => useContext(LocaleContext), withLocaleContext('de-DE'));
        expect(result.current).toEqual('de-DE');
    });
});
