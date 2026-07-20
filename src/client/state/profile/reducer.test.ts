import { mockLocalStorage } from '@tests/mockLocalStorage';

import { ProfileActionType, type ProfileAction } from '~/client/state/profile/actions';
import { profile as reducer } from '~/client/state/profile/reducer';
import type { Profile } from '~/client/state/profile/types';

describe('profile', () => {
    afterEach(() => vi.clearAllMocks());

    const { setItem, removeItem } = mockLocalStorage();

    const profile: Profile = {
        name: 'Big Buddy',
        email: 'big.buddy@email.com',
    };

    describe('default', () => {
        const unknownAction = { type: 'unknown' as ProfileActionType } as ProfileAction;

        it('leaves set unchanged', () => {
            expect(reducer(profile, unknownAction)).toStrictEqual(profile);
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).not.toHaveBeenCalled();
        });

        it('leaves empty set unchanged', () => {
            expect(reducer({}, unknownAction)).toStrictEqual({});
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).not.toHaveBeenCalled();
        });

        it('returns default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toStrictEqual({});
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).not.toHaveBeenCalled();
        });
    });

    describe('set', () => {
        it('updates empty state', () => {
            expect(
                reducer(
                    {},
                    {
                        type: ProfileActionType.SET,
                        profile,
                    }
                )
            ).toStrictEqual(profile);
            expect(localStorage.setItem).toHaveBeenCalledWith('profile', JSON.stringify(profile));
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify(profile));
            expect(removeItem).not.toHaveBeenCalled();
        });

        it('updates empty state with empty set', () => {
            expect(
                reducer(
                    {},
                    {
                        type: ProfileActionType.SET,
                        profile: {},
                    }
                )
            ).toStrictEqual({});
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify({}));
            expect(removeItem).not.toHaveBeenCalled();
        });

        const update: Profile = {
            name: 'Another One',
            email: 'another.one@email.com',
        };

        it('updates filled state', () => {
            expect(
                reducer(profile, {
                    type: ProfileActionType.SET,
                    profile: update,
                })
            ).toStrictEqual(update);
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify(update));
            expect(removeItem).not.toHaveBeenCalled();
        });

        it('updates undefined state', () => {
            expect(
                reducer(undefined, {
                    type: ProfileActionType.SET,
                    profile: update,
                })
            ).toStrictEqual(update);
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify(update));
            expect(removeItem).not.toHaveBeenCalled();
        });
    });

    describe('reset', () => {
        it('updates empty state', () => {
            expect(
                reducer(
                    {},
                    {
                        type: ProfileActionType.RESET,
                    }
                )
            ).toStrictEqual({});
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).toHaveBeenCalledWith('profile');
        });

        it('updates filled state', () => {
            expect(
                reducer(profile, {
                    type: ProfileActionType.RESET,
                })
            ).toStrictEqual({});
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).toHaveBeenCalledWith('profile');
        });

        it('updates undefined state', () => {
            expect(
                reducer(undefined, {
                    type: ProfileActionType.RESET,
                })
            ).toStrictEqual({});
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).toHaveBeenCalledWith('profile');
        });
    });

    describe('setAllowed', () => {
        it('updates empty state', () => {
            expect(
                reducer(
                    {},
                    {
                        type: ProfileActionType.SET_ALLOWED,
                        allowed: false,
                    }
                )
            ).toStrictEqual({ allowed: false });
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify({ allowed: false }));
            expect(removeItem).not.toHaveBeenCalled();
        });

        it('updates filled state', () => {
            expect(
                reducer(profile, {
                    type: ProfileActionType.SET_ALLOWED,
                    allowed: true,
                })
            ).toStrictEqual({ ...profile, allowed: true });
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify({ ...profile, allowed: true }));
            expect(removeItem).not.toHaveBeenCalled();
        });
    });
});
