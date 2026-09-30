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

describe('aPI routes', () => {
    it.each([
        ['authClientId', API.authClientId(), '/api/v1/auth/client-id'],
        ['access', API.access('a+b@example.com'), '/api/v1/access?email=a%2Bb%40example.com'],
        ['userProfile', API.userProfile('a+b@example.com'), '/api/v1/user-profiles/a%2Bb%40example.com'],
        ['groups', API.groups(), '/api/v1/groups'],
        ['group', API.group('A/B'), '/api/v1/groups/A%2FB'],
        ['groupOrder', API.groupOrder(), '/api/v1/groups/order'],
        ['groupVariant', API.groupVariant('A/B', 'x y'), '/api/v1/groups/A%2FB/variants/x%20y'],
        ['groupVariantCopies', API.groupVariantCopies('A/B', 'x y'), '/api/v1/groups/A%2FB/variants/x%20y/copies'],
        ['groupVariantOrder', API.groupVariantOrder('A/B'), '/api/v1/groups/A%2FB/variants/order'],
        ['groupProduct', API.groupProduct('A/B', 'x y'), '/api/v1/groups/A%2FB/products/x%20y'],
        ['productReviewStatuses', API.productReviewStatuses(), '/api/v1/products/review-statuses'],
        ['productYear', API.productYear('A/B', 'x y', 2026), '/api/v1/groups/A%2FB/products/x%20y/years/2026'],
        [
            'productAmounts',
            API.productAmounts('A/B', 'x y', 2026),
            '/api/v1/groups/A%2FB/products/x%20y/years/2026/amounts',
        ],
        [
            'productAmountTransfers',
            API.productAmountTransfers('A/B', 'x y', 2026),
            '/api/v1/groups/A%2FB/products/x%20y/years/2026/amounts/transfers',
        ],
        [
            'productAmountHistory',
            API.productAmountHistory('A/B', 'x y', 2026),
            '/api/v1/groups/A%2FB/products/x%20y/years/2026/amount-history',
        ],
        ['productImage', API.productImage('A/B', 'x y'), '/api/v1/groups/A%2FB/products/x%20y/image'],
        [
            'productVariantImage',
            API.productVariantImage('A/B', 'x y', 'm/n'),
            '/api/v1/groups/A%2FB/products/x%20y/variants/m%2Fn/image',
        ],
        ['variants', API.variants(), '/api/v1/variants'],
        ['products', API.products(), '/api/v1/products'],
        ['summary', API.summary(), '/api/v1/summary'],
        ['exportLatest', API.exportLatest(), '/api/v1/exports/latest'],
        ['import', API.import(), '/api/v1/imports'],
        [
            'productHistory',
            API.productHistory('A/B', 'x y', 2026),
            '/api/v1/groups/A%2FB/products/x%20y/years/2026/history',
        ],
        [
            'summaryHistory',
            API.summaryHistory('A/B', 'x y', 2026),
            '/api/v1/groups/A%2FB/products/x%20y/years/2026/summary-history',
        ],
    ])('%s builds the expected URL', (_name, actual, expected) => {
        expect(actual).toBe(expected);
    });
});
