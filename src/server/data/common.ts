import { removeDetails, renameDetails } from '~/server/data/details';
import { removeMissing, renameMissing } from '~/server/data/missing';
import { removeRemoving, renameRemoving } from '~/server/data/removing';
import { removeUpdates, renameUpdates } from '~/server/data/updates';
import { DETAILS, MISSING, REMOVING, UPDATES } from '~/server/db';
import { Amount, NamedAmounts, type TimedAmounts } from '~/store/details/types';
import { NamedRemoving } from '~/store/removing/types';
import { type Name } from '~/store/types';

export async function rename(name: Name, newName: Name): Promise<boolean> {
    if (name === newName) {
        return false;
    }
    const updated = await renameDetails(name, newName);
    await renameUpdates(name, newName);
    await renameRemoving(name, newName);
    await renameMissing(name, newName);
    return updated;
}

export async function remove(name: Name): Promise<boolean> {
    const removed = await removeDetails(name);
    await removeUpdates(name);
    await removeRemoving(name);
    await removeMissing(name);
    return removed;
}

export async function getEverything(): Promise<Record<string, any>> {
    const _details = await DETAILS.find<NamedAmounts & { group?: string }>({});
    const _updates = await UPDATES.find<TimedAmounts & { group?: string }>({});
    const _removing = await REMOVING.find<NamedRemoving & { group?: string }>({});
    const _missing =
        (await MISSING.find<{ missing?: (Name | { group?: string; name?: string })[] }>({}))?.[0]?.missing ?? [];

    const groups = [{ group: 'Uogienės', order: 0 }];

    const variants = [
        { group: 'Uogienės', variant: 'Puslitris', order: 0, long: '500 ml.', short: '' }, // '½', '1/2',
        { group: 'Uogienės', variant: 'Didesnis', order: 1, long: '750 ml.', short: 'd' }, // '¾', '3/4',
        { group: 'Uogienės', variant: 'Mažesnis', order: 2, long: '250 ml.', short: 'm' }, // '¼', '1/4',
        { group: 'Uogienės', variant: 'Eglytės', order: 3, short: 'e' },
        { group: 'Uogienės', variant: 'Litras', order: 4, long: '1 l.', short: '1' },
        { group: 'Uogienės', variant: 'Pusantro', order: 5, long: '1.5 l.', short: '1½' },
        { group: 'Uogienės', variant: 'Dvilitris', order: 6, long: '2 l.', short: '2' },
        { group: 'Uogienės', variant: 'Trilitris', order: 7, long: '3 l.', short: '3' },
        { group: 'Uogienės', variant: 'Blogas/Cypė', order: 8, long: 'Blogas', short: '×' },
    ];

    const getVariant = (variant: string) => variants.find((v) => v.short === variant)?.variant || 'Puslitris';

    const getAmounts = (amounts: Amount) =>
        Object.entries(amounts).map(([variant, amount]) => ({
            variant: getVariant(variant),
            amount,
        }));

    const details = _details.map(({ _id, group = '', name, ..._years }) => {
        const years = Object.entries(_years).map(([year, _amounts]) => {
            const amounts = getAmounts(_amounts);
            const removing = _removing.some((v) => (v.group ?? '') === group && v.name === name && v[+year]);
            return {
                year: +year,
                ...(amounts.length && { amounts }),
                ...(removing && { removing }),
            };
        });

        const updates = _updates
            .filter((v) => (v.group ?? '') === group && v.name === name)
            .map(({ _id, group: _group, name: _name, time, ...values }) => {
                const years = Object.entries(values).map(([year, _amounts]) => {
                    const amounts = getAmounts(_amounts);
                    return {
                        year: +year,
                        ...(amounts.length && { amounts }),
                    };
                });

                return {
                    time: new Date(time).toISOString(),
                    ...(years.length && { years }),
                };
            });

        const missing = _missing.some((v) =>
            typeof v === 'string' ? !group && v === name : (v.group ?? '') === group && v.name === name
        );

        return {
            group: group || 'Uogienės',
            name,
            ...(years.length && { years }),
            ...(updates.length && { updates }),
            ...(missing && { missing }),
        };
    });

    return {
        details,
        groups,
        variants,
    };
}
