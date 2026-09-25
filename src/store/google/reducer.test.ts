import { GoogleActionType, type GoogleAction } from '~/store/google/actions';
import { google as reducer } from '~/store/google/reducer';
import type { Google } from '~/store/google/types';

describe('google', () => {
    afterEach(() => vi.clearAllMocks());

    const google: Google = {
        loading: false,
        clientId: '123',
    };

    describe('default', () => {
        const unknownAction = { type: 'unknown' as GoogleActionType } as GoogleAction;

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
            expect(
                reducer(
                    {},
                    {
                        type: GoogleActionType.SET_LOADING,
                        loading: true,
                    }
                )
            ).toStrictEqual({ loading: true });
        });

        it('update empty state with false', () => {
            expect(
                reducer(
                    {},
                    {
                        type: GoogleActionType.SET_LOADING,
                        loading: false,
                    }
                )
            ).toStrictEqual({ loading: false });
        });

        it('update filled state with true', () => {
            expect(
                reducer(google, {
                    type: GoogleActionType.SET_LOADING,
                    loading: true,
                })
            ).toStrictEqual({ ...google, loading: true });
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GoogleActionType.SET_LOADING,
                    loading: false,
                })
            ).toStrictEqual({ loading: false });
        });
    });

    describe('client id', () => {
        it('update empty state', () => {
            expect(
                reducer(
                    {},
                    {
                        type: GoogleActionType.SET_CLIENT_ID,
                        clientId: '123',
                    }
                )
            ).toStrictEqual({ clientId: '123' });
        });

        it('update empty state with empty value', () => {
            expect(
                reducer(
                    {},
                    {
                        type: GoogleActionType.SET_CLIENT_ID,
                        clientId: '',
                    }
                )
            ).toStrictEqual({ clientId: '' });
        });

        it('update filled state', () => {
            expect(
                reducer(google, {
                    type: GoogleActionType.SET_CLIENT_ID,
                    clientId: '456',
                })
            ).toStrictEqual({ ...google, clientId: '456' });
        });

        it('update filled state with empty', () => {
            expect(
                reducer(google, {
                    type: GoogleActionType.SET_CLIENT_ID,
                    clientId: '',
                })
            ).toStrictEqual({ ...google, clientId: '' });
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GoogleActionType.SET_CLIENT_ID,
                    clientId: '123',
                })
            ).toStrictEqual({ clientId: '123' });
        });
    });
});
