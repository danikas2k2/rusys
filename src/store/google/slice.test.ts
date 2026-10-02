import { google as reducer, setClientIdAction, setLoadingAction } from '~/store/google/slice';
import type { Google } from '~/store/google/types';

describe('setLoadingAction', () => {
    it('returns valid action', () => {
        expect(setLoadingAction(true)).toStrictEqual({ type: setLoadingAction.type, payload: true });
    });
});

describe('setClientIdAction', () => {
    it('returns valid action', () => {
        expect(setClientIdAction('123')).toStrictEqual({ type: setClientIdAction.type, payload: '123' });
    });
});

describe('google', () => {
    afterEach(() => vi.clearAllMocks());

    const google: Google = {
        loading: false,
        clientId: '123',
    };

    describe('default', () => {
        const unknownAction = { type: 'unknown' };

        it('does not change state', () => {
            expect(reducer(google, unknownAction)).toStrictEqual(google);
        });

        it('does not change empty set', () => {
            expect(reducer({}, unknownAction)).toStrictEqual({});
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toStrictEqual({});
        });
    });

    describe('loading', () => {
        it('update empty state with true', () => {
            expect(reducer({}, setLoadingAction(true))).toStrictEqual({ loading: true });
        });

        it('update empty state with false', () => {
            expect(reducer({}, setLoadingAction(false))).toStrictEqual({ loading: false });
        });

        it('update filled state with true', () => {
            expect(reducer(google, setLoadingAction(true))).toStrictEqual({ ...google, loading: true });
        });

        it('update undefined state', () => {
            expect(reducer(undefined, setLoadingAction(false))).toStrictEqual({ loading: false });
        });
    });

    describe('client id', () => {
        it('update empty state', () => {
            expect(reducer({}, setClientIdAction('123'))).toStrictEqual({ clientId: '123' });
        });

        it('update empty state with empty value', () => {
            expect(reducer({}, setClientIdAction(''))).toStrictEqual({ clientId: '' });
        });

        it('update filled state', () => {
            expect(reducer(google, setClientIdAction('456'))).toStrictEqual({ ...google, clientId: '456' });
        });

        it('update filled state with empty', () => {
            expect(reducer(google, setClientIdAction(''))).toStrictEqual({ ...google, clientId: '' });
        });

        it('update undefined state', () => {
            expect(reducer(undefined, setClientIdAction('123'))).toStrictEqual({ clientId: '123' });
        });
    });
});
