import { type ProfileAction, ProfileActionType } from '~/state/profile/actions';
import { profile as reducer } from '~/state/profile/reducer';
import { type Profile } from '~/state/profile/types';
import { mockLocalStorage } from '~/tests/mockLocalStorage';

describe('profile', () => {
    afterEach(() => jest.clearAllMocks());

    const { setItem, removeItem } = mockLocalStorage();

    const profile: Profile = {
        name: 'Big Buddy',
        email: 'big.buddy@email.com',
    };

    describe('default', () => {
        const unknownAction = { type: 'unknown' as ProfileActionType } as ProfileAction;

        it('leave set unchanged', () => {
            expect(reducer(profile, unknownAction)).toEqual(profile);
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).not.toHaveBeenCalled();
        });

        it('leave empty set unchanged', () => {
            expect(reducer({}, unknownAction)).toEqual({});
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).not.toHaveBeenCalled();
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toEqual({});
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).not.toHaveBeenCalled();
        });
    });

    describe('set', () => {
        it('update empty state', () => {
            expect(
                reducer(
                    {},
                    {
                        type: ProfileActionType.SET,
                        profile,
                    }
                )
            ).toEqual(profile);
            expect(localStorage.setItem).toHaveBeenCalledWith('profile', JSON.stringify(profile));
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify(profile));
            expect(removeItem).not.toHaveBeenCalled();
        });

        it('update empty state with empty set', () => {
            expect(
                reducer(
                    {},
                    {
                        type: ProfileActionType.SET,
                        profile: {},
                    }
                )
            ).toEqual({});
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify({}));
            expect(removeItem).not.toHaveBeenCalled();
        });

        const update: Profile = {
            name: 'Another One',
            email: 'another.one@email.com',
        };

        it('update filled state', () => {
            expect(
                reducer(profile, {
                    type: ProfileActionType.SET,
                    profile: update,
                })
            ).toEqual(update);
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify(update));
            expect(removeItem).not.toHaveBeenCalled();
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: ProfileActionType.SET,
                    profile: update,
                })
            ).toEqual(update);
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify(update));
            expect(removeItem).not.toHaveBeenCalled();
        });
    });

    describe('reset', () => {
        it('update empty state', () => {
            expect(
                reducer(
                    {},
                    {
                        type: ProfileActionType.RESET,
                    }
                )
            ).toEqual({});
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).toHaveBeenCalledWith('profile');
        });

        it('update filled state', () => {
            expect(
                reducer(profile, {
                    type: ProfileActionType.RESET,
                })
            ).toEqual({});
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).toHaveBeenCalledWith('profile');
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: ProfileActionType.RESET,
                })
            ).toEqual({});
            expect(setItem).not.toHaveBeenCalled();
            expect(removeItem).toHaveBeenCalledWith('profile');
        });
    });

    describe('setAllowed', () => {
        it('update empty state', () => {
            expect(
                reducer(
                    {},
                    {
                        type: ProfileActionType.SET_ALLOWED,
                        allowed: false,
                    }
                )
            ).toEqual({ allowed: false });
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify({ allowed: false }));
            expect(removeItem).not.toHaveBeenCalled();
        });

        it('update filled state', () => {
            expect(
                reducer(profile, {
                    type: ProfileActionType.SET_ALLOWED,
                    allowed: true,
                })
            ).toEqual({ ...profile, allowed: true });
            expect(setItem).toHaveBeenCalledWith('profile', JSON.stringify({ ...profile, allowed: true }));
            expect(removeItem).not.toHaveBeenCalled();
        });
    });
});
