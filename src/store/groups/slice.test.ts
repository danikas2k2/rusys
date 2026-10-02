import { getGroupsFixture } from '@tests/fixtures';

import type { Group } from '~/common/data';
import { groups as reducer, setGroupsAction } from './slice';

describe('setGroupsAction', () => {
    it('returns valid action', () => {
        const groups = getGroupsFixture();

        expect(setGroupsAction(groups)).toStrictEqual({ type: setGroupsAction.type, payload: groups });
    });

    it('returns valid action for empty set', () => {
        const groups: Group[] = [];

        expect(setGroupsAction(groups)).toStrictEqual({ type: setGroupsAction.type, payload: groups });
    });
});

describe('groups', () => {
    const groups = getGroupsFixture();

    describe('default', () => {
        const unknownAction = { type: 'unknown' };

        it('leave set unchanged', () => {
            expect(reducer(groups, unknownAction)).toStrictEqual(groups);
        });

        it('leave empty set unchanged', () => {
            expect(reducer([], unknownAction)).toStrictEqual([]);
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toStrictEqual([]);
        });
    });

    describe('set', () => {
        it('update empty state', () => {
            expect(reducer([], setGroupsAction(groups))).toStrictEqual(groups);
        });

        it('update empty state with empty set', () => {
            expect(reducer([], setGroupsAction([]))).toStrictEqual([]);
        });

        it('update filled state', () => {
            expect(reducer(groups.slice(0, 1), setGroupsAction(groups))).toStrictEqual(groups);
        });

        it('update undefined state', () => {
            expect(reducer(undefined, setGroupsAction(groups))).toStrictEqual(groups);
        });
    });
});
