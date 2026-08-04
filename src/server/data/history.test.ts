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

    it('final $project stage includes time, user, comment, sessionId, year, amounts', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const lastStage = pipeline[pipeline.length - 1] as { $project?: Record<string, unknown> };

        expect(lastStage.$project).toBeDefined();
        expect(lastStage.$project).toMatchObject({
            _id: 0,
            group: 1,
            name: 1,
            user: 1,
            comment: 1,
            year: '$_id.year',
            sessionId: '$_id.sessionId',
        });
    });

    it('$sort stage sorts by timeMs: -1', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const sortStage = pipeline.find((stage) => '$sort' in stage) as { $sort: Record<string, number> } | undefined;

        expect(sortStage).toBeDefined();
        expect(sortStage!.$sort).toMatchObject({ timeMs: -1 });
    });

    it('pipeline merges entries by sessionId+year (contains two $group stages)', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const groupStages = pipeline.filter((stage) => '$group' in stage);

        expect(groupStages).toHaveLength(2);
    });

    it('first $group stage _id includes suspiciousKey using $ifNull on $amounts.suspicious', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const groupStages = pipeline.filter((stage) => '$group' in stage) as { $group: Record<string, unknown> }[];
        const firstGroup = groupStages[0]!.$group as Record<string, unknown>;
        const id = firstGroup._id as Record<string, unknown>;

        expect(id).toMatchObject({
            suspiciousKey: { $ifNull: ['$amounts.suspicious', null] },
        });
    });

    it('first $group stage _id includes homeKey using $ifNull on $amounts.home', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const groupStages = pipeline.filter((stage) => '$group' in stage) as { $group: Record<string, unknown> }[];
        const firstGroup = groupStages[0]!.$group as Record<string, unknown>;
        const id = firstGroup._id as Record<string, unknown>;

        expect(id).toMatchObject({
            homeKey: { $ifNull: ['$amounts.home', null] },
        });
    });

    it('second $group amounts $push includes suspicious reconstruction via $cond', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const pipelineStr = JSON.stringify(pipeline);

        expect(pipelineStr).toContain(JSON.stringify({ suspicious: '$_id.suspiciousKey' }));
    });

    it('second $group amounts $push includes home reconstruction via $cond', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const pipelineStr = JSON.stringify(pipeline);

        expect(pipelineStr).toContain(JSON.stringify({ home: '$_id.homeKey' }));
    });

    it('suspicious $cond uses { $ne: ["$_id.suspiciousKey", null] } as its condition', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const pipelineStr = JSON.stringify(pipeline);

        expect(pipelineStr).toContain(JSON.stringify({ $ne: ['$_id.suspiciousKey', null] }));
    });

    it('home $cond uses { $ne: ["$_id.homeKey", null] } as its condition', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const pipelineStr = JSON.stringify(pipeline);

        expect(pipelineStr).toContain(JSON.stringify({ $ne: ['$_id.homeKey', null] }));
    });

    it('first $group stage _id includes expiresAtKey using $ifNull on $amounts.expiresAt', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const groupStages = pipeline.filter((stage) => '$group' in stage) as { $group: Record<string, unknown> }[];
        const firstGroup = groupStages[0]!.$group as Record<string, unknown>;
        const id = firstGroup._id as Record<string, unknown>;

        expect(id).toMatchObject({
            expiresAtKey: { $ifNull: ['$amounts.expiresAt', null] },
        });
    });

    it('second $group amounts $push includes expiresAt reconstruction via $cond', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const pipelineStr = JSON.stringify(pipeline);

        expect(pipelineStr).toContain(JSON.stringify({ expiresAt: '$_id.expiresAtKey' }));
    });

    it('expiresAt $cond uses { $ne: ["$_id.expiresAtKey", null] } as its condition', () => {
        const pipeline = buildHistoryPipeline('GroupA', 'NameA', 'updates', yearFilter);
        const pipelineStr = JSON.stringify(pipeline);

        expect(pipelineStr).toContain(JSON.stringify({ $ne: ['$_id.expiresAtKey', null] }));
    });
});
