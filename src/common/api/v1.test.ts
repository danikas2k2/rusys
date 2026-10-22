import { API } from './v1';

describe('api routes', () => {
    it.each([
        ['group', API.group('A/B'), '/api/v1/groups/A%2FB'],
        ['productImage', API.productImage('A/B', 'x y'), '/api/v1/groups/A%2FB/products/x%20y/image'],
        [
            'productVariantImage',
            API.productVariantImage('A/B', 'x y', 'm/n'),
            '/api/v1/groups/A%2FB/products/x%20y/variants/m%2Fn/image',
        ],
        ['import', API.import(), '/api/v1/imports'],
    ])('%s builds the expected URL', (_name, actual, expected) => {
        expect(actual).toBe(expected);
    });
});
