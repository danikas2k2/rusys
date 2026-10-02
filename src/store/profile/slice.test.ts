import { profile as reducer, resetProfileAction, setAllowedAction, setProfileAction } from './slice';
import type { Profile } from './types';

describe('setProfileAction', () => {
    it('returns valid action', () => {
        const profile: Profile = {
            name: 'Big Buddy',
            email: 'big.buddy@email.com',
        };

        expect(setProfileAction(profile)).toStrictEqual({ type: setProfileAction.type, payload: profile });
    });
});

describe('resetProfileAction', () => {
    it('returns valid action', () => {
        expect(resetProfileAction()).toStrictEqual({ type: resetProfileAction.type, payload: undefined });
    });
});

describe('setAllowedAction', () => {
    it('returns valid action', () => {
        expect(setAllowedAction(true)).toStrictEqual({ type: setAllowedAction.type, payload: true });
    });
});

describe('profile reducer', () => {
    it('keeps profile only in Redux', () => {
        const saved = { sub: '123', email: 'user@example.com' };
        const setItem = vi.spyOn(Storage.prototype, 'setItem');
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem');

        expect(reducer({}, setProfileAction(saved))).toStrictEqual(saved);
        expect(reducer(saved, setAllowedAction(true))).toStrictEqual({
            ...saved,
            allowed: true,
        });
        expect(reducer(saved, resetProfileAction())).toStrictEqual({});
        expect(setItem).not.toHaveBeenCalled();
        expect(removeItem).not.toHaveBeenCalled();

        vi.restoreAllMocks();
    });
});
