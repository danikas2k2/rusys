import { type GoogleAction, GoogleActionType } from '~/state/google/actions';
import reducer from '~/state/google/reducer';
import { type Google } from '~/state/google/types';

describe('google', () => {
    afterEach(() => jest.clearAllMocks());

    const google: Google = {
        loading: false,
        clientId: '123',
    };

    describe('default', () => {
        const unknownAction = { type: 'unknown' as GoogleActionType } as GoogleAction;

        it('leave set unchanged', () => {
            expect(reducer(google, unknownAction)).toEqual(google);
        });

        it('leave empty set unchanged', () => {
            expect(reducer({}, unknownAction)).toEqual({});
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toEqual({});
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
            ).toEqual({ loading: true });
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
            ).toEqual({ loading: false });
        });

        it('update filled state with true', () => {
            expect(
                reducer(google, {
                    type: GoogleActionType.SET_LOADING,
                    loading: true,
                })
            ).toEqual({ ...google, loading: true });
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GoogleActionType.SET_LOADING,
                    loading: false,
                })
            ).toEqual({ loading: false });
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
            ).toEqual({ clientId: '123' });
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
            ).toEqual({ clientId: '' });
        });

        it('update filled state', () => {
            expect(
                reducer(google, {
                    type: GoogleActionType.SET_CLIENT_ID,
                    clientId: '456',
                })
            ).toEqual({ ...google, clientId: '456' });
        });

        it('update filled state with empty', () => {
            expect(
                reducer(google, {
                    type: GoogleActionType.SET_CLIENT_ID,
                    clientId: '',
                })
            ).toEqual({ ...google, clientId: '' });
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GoogleActionType.SET_CLIENT_ID,
                    clientId: '123',
                })
            ).toEqual({ clientId: '123' });
        });
    });
});
