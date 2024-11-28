import { cloneDeep } from 'lodash';
import { getOverlapIndex } from '~/client/utils/getOverlapIndex';

describe('getOverlapIndex', () => {
    const offsetParent = {
        children: [
            { getBoundingClientRect: () => ({ top: 5, height: 10 }) },
            undefined,
            { getBoundingClientRect: () => ({ top: 15, height: 10 }) },
        ] as unknown as HTMLCollectionOf<HTMLElement>,
    };

    const element = {
        getBoundingClientRect: () => ({ top: 11, height: 10 }),
        offsetParent,
    } as unknown as HTMLElement;

    offsetParent.children[1] = element;

    it('returns index of first overlapped sibling', () => {
        expect(getOverlapIndex(element)).toBe(2);
    });

    it('returns index of first overlapped sibling for larger threshold', () => {
        expect(getOverlapIndex(element, 0.6)).toBe(0);
    });

    it('returns -1 for smaller threshold', () => {
        expect(getOverlapIndex(element, 0.3)).toBe(-1);
    });

    it('returns -1 if element is the only child', () => {
        const onlyElement = cloneDeep(element);
        // @ts-expect-error -- updating readonly properties for testing
        // noinspection JSConstantReassignment
        onlyElement.offsetParent.children = [onlyElement];
        expect(getOverlapIndex(onlyElement)).toBe(-1);
    });

    it('returns -1 if element does not overlap', () => {
        element.getBoundingClientRect = () => ({ top: 25, height: 10 }) as DOMRect;
        expect(getOverlapIndex(element)).toBe(-1);
    });
});
