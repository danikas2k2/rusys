import { buildHistoryPipeline } from '~/server/data/history';

describe('buildHistoryPipeline', () => {
    const yearFilter = { $expr: { $gte: ['$updates.years.year', 21] } };

    it('returns an array', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        expect(Array.isArray(pipeline)).toBe(true);
    });

    it('first stage is $match containing group and name', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        expect(pipeline[0]).toMatchObject({ $match: { group: 'GroupA', name: 'NameA' } });
    });

    it('first stage $match uses field as key with $exists and $ne constraints', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        expect(pipeline[0]).toMatchObject({
            $match: { updates: { $exists: true, $ne: [] } },
        });
    });

    it('uses $updates references when field is "updates"', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const unwind = pipeline[1] as { $unwind: string };
        expect(unwind.$unwind).toBe('$updates');
    });

    it('uses $undates references when field is "undates"', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'undates', yearFilter);
        const unwind = pipeline[1] as { $unwind: string };
        expect(unwind.$unwind).toBe('$undates');
    });

    it('first stage $match uses "undates" as key when field is "undates"', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'undates', yearFilter);
        expect(pipeline[0]).toMatchObject({
            $match: { undates: { $exists: true, $ne: [] } },
        });
    });

    it('yearFilter is wrapped in $match as the third stage', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        expect(pipeline[2]).toStrictEqual({ $match: yearFilter });
    });

    it('uses default amountFilter that filters out zero amounts', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const pipelineStr = JSON.stringify(pipeline);
        expect(pipelineStr).toContain('"$ifNull"');
        expect(pipelineStr).toContain('"$$a.amount"');
        // default filter: { $ne: [{ $ifNull: ['$$a.amount', 0] }, 0] }
        expect(pipelineStr).toContain(JSON.stringify({ $ne: [{ $ifNull: ['$$a.amount', 0] }, 0] }));
    });

    it('uses a custom amountFilter when provided', () => {
        const customFilter = { $gte: [{ $ifNull: ['$$a.amount', 0] }, 5] };
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter, customFilter);
        const pipelineStr = JSON.stringify(pipeline);
        expect(pipelineStr).toContain(JSON.stringify(customFilter));
        // default filter should NOT be present
        expect(pipelineStr).not.toContain(JSON.stringify({ $ne: [{ $ifNull: ['$$a.amount', 0] }, 0] }));
    });

    it('last $sort stage sorts by timeMs: -1', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const sortStage = pipeline.find((stage) => '$sort' in stage) as { $sort: Record<string, number> } | undefined;
        expect(sortStage).toBeDefined();
        expect(sortStage!.$sort).toMatchObject({ timeMs: -1 });
    });

    it('last $sort stage is the second-to-last stage', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const secondToLast = pipeline[pipeline.length - 2] as { $sort?: Record<string, number> };
        expect(secondToLast.$sort).toBeDefined();
        expect(secondToLast.$sort!.timeMs).toBe(-1);
    });

    it('final $project stage excludes timeMs, userKey, prevTimeMs, newSession, sessionIndex, sessionStartTimeMs', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const lastStage = pipeline[pipeline.length - 1] as { $project?: Record<string, number> };
        expect(lastStage.$project).toBeDefined();
        expect(lastStage.$project).toMatchObject({
            timeMs: 0,
            userKey: 0,
            prevTimeMs: 0,
            newSession: 0,
            sessionIndex: 0,
            sessionStartTimeMs: 0,
        });
    });

    it('$sort also sorts by group: 1, name: 1, year: -1', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const sortStage = pipeline[pipeline.length - 2] as { $sort: Record<string, number> };
        expect(sortStage.$sort).toMatchObject({ group: 1, name: 1, year: -1 });
    });
});
