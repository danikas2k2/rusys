import { use } from 'react';
import { renderHook } from '@testing-library/react';
import { withLocaleContext } from '@tests/withLocaleContext';
import { LocaleContext } from '~/client/common/LocaleContext';

describe('<LocaleContext>', () => {
    afterEach(() => {});

    it('uses context with default locale', () => {
        const { result } = renderHook(() => use(LocaleContext));

        expect(result.current).toBe('en-US');
    });

    it('uses context with custom locale', () => {
        const { result } = renderHook(() => use(LocaleContext), withLocaleContext('de-DE'));

        expect(result.current).toBe('de-DE');
    });
});
