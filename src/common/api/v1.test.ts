import { API } from './v1';

describe('aPI.userProfiles', () => {
    it('uses the collection endpoint when no addresses are filtered', () => {
        expect(API.userProfiles()).toBe('/api/v1/user-profiles');
    });

    it('encodes each requested address as a repeated query parameter', () => {
        expect(API.userProfiles(['a+b@example.com', 'c@example.com'])).toBe(
            '/api/v1/user-profiles?email=a%2Bb%40example.com&email=c%40example.com'
        );
    });
});
