import { ProfileActionType } from '~/store/profile/actions';
import { profile as reducer } from '~/store/profile/reducer';

describe('profile reducer', () => {
    it('keeps profile only in Redux', () => {
        const saved = { sub: '123', email: 'user@example.com' };
        const setItem = vi.spyOn(Storage.prototype, 'setItem');
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem');

        expect(reducer({}, { type: ProfileActionType.SET, profile: saved })).toStrictEqual(saved);
        expect(reducer(saved, { type: ProfileActionType.SET_ALLOWED, allowed: true })).toStrictEqual({
            ...saved,
            allowed: true,
        });
        expect(reducer(saved, { type: ProfileActionType.RESET })).toStrictEqual({});
        expect(setItem).not.toHaveBeenCalled();
        expect(removeItem).not.toHaveBeenCalled();

        vi.restoreAllMocks();
    });
});
