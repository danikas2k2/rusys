import { NumberInput, Select, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { useLabels } from '~/client/hooks/useLabels';
import { AmountBox } from '~/client/pages/common/AmountBox';
import { AmountTitle } from '~/client/pages/history/AmountTitle';
import { useUpdatingHistory } from '~/client/pages/history/UpdatingHistoryContext';
import { useGroups } from '~/client/state/groups/useGroups';
import { useMoveHistory } from '~/client/state/history/useMoveHistory';
import { useUpdateHistory } from '~/client/state/history/useUpdateHistory';
import { useProducts } from '~/client/state/products/useProducts';
import type { History, VariantAmount } from '~/types/data';

export function ActiveValueBox(): React.ReactElement | null {
    const _ = useLabels();
    const [active, setActive] = useActiveContent<History>();
    const [, setUpdating] = useUpdatingHistory();
    const data = active?.data;
    const time = data?.time ?? 0;
    const user = data?.user;

    const initialGroup = data?.group ?? '';
    const initialName = data?.name ?? '';
    const initialYear = data?.year ?? new Date().getFullYear() % 100;

    const groups = useGroups();
    const groupOptions = useMemo(() => groups.map((g) => g.group), [groups]);

    const form = useForm({
        initialValues: {
            group: initialGroup,
            name: initialName,
            year: initialYear,
        },
        validate: {
            group: (value) => (!value?.trim() ? _('Group is required') : null),
            name: (value) => (!value?.trim() ? _('Name is required') : null),
            year: (value) => {
                if (value === undefined || value === null || Number.isNaN(Number(value))) {
                    return _('Year is required');
                }
                if (typeof value === 'number' && value < 20) {
                    return _('Invalid year');
                }
                return null;
            },
        },
    });
    const formRef = useRef(form);
    formRef.current = form;

    const group = form.values.group;
    const products = useProducts();
    const nameOptions = useMemo(() => {
        const list = products.filter((p) => p.group === group).map((p) => p.name);
        return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
    }, [group, products]);

    const handleUpdate = useUpdateHistory();
    const handleMove = useMoveHistory();

    const handleClose = useCallback(() => setActive({ data: active?.data }), [active?.data, setActive]);

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const handleSubmit = useCallback(
        async (changed: readonly VariantAmount[]): Promise<void> => {
            console.info(`[DEV]`, { amounts: data.amounts, changed });
            return;

            if (data) {
                const { group: nextGroup, name: nextName, year: nextYear } = formRef.current.values;

                console.info(`[DEV] ???`, changed);

                if (changed !== undefined) {
                    const validation = formRef.current.validate();
                    if (validation.hasErrors) {
                        return;
                    }

                    const historyKey = { time, group: initialGroup, name: initialName, year: initialYear, user };
                    setUpdating(historyKey, true);

                    try {
                        if (initialGroup !== nextGroup || initialName !== nextName || initialYear !== nextYear) {
                            await handleMove(
                                time,
                                initialGroup,
                                initialName,
                                initialYear,
                                nextGroup,
                                nextName,
                                nextYear
                            );
                        }

                        await handleUpdate(time, nextGroup, nextName, nextYear, changed, user);
                    } finally {
                        setUpdating(historyKey, false);
                    }
                }
            }
            handleClose();
        },
        [data, handleClose, handleMove, handleUpdate, initialGroup, initialName, initialYear, setUpdating, time, user]
    );

    const opened = active?.action === 'values' && !!data;

    useEffect(() => {
        if (opened && data) {
            formRef.current.setValues({
                group: data.group ?? '',
                name: data.name ?? '',
                year: data.year ?? new Date().getFullYear(),
            });
            formRef.current.resetTouched();
            formRef.current.resetDirty();
        }
    }, [opened, data]);

    const groupValue = form.values.group;
    const nameValue = form.values.name;
    useEffect(() => {
        if (formRef.current.isTouched('name') || formRef.current.isTouched('group')) {
            formRef.current.validateField('name');
        }
    }, [groupValue, nameValue]);

    return data ? (
        <UpdateTypeWrapper>
            <AmountBox
                {...data}
                opened={opened}
                onSubmit={handleSubmit}
                onClose={handleClose}
                onAfterClose={handleAfterClose}
                title={<AmountTitle email={data?.user} time={data?.time} />}
            >
                <Stack mt="md" mb="lg">
                    <Select
                        label={<Label>Group</Label>}
                        data={groupOptions}
                        {...form.getInputProps('group')}
                        withAsterisk
                        searchable
                    />
                    <Select
                        label={<Label>Name</Label>}
                        data={nameOptions}
                        {...form.getInputProps('name')}
                        withAsterisk
                        searchable
                    />
                    <NumberInput
                        label={<Label>Year</Label>}
                        {...form.getInputProps('year')}
                        onChange={(v) => form.setFieldValue('year', typeof v === 'number' ? v : 0)}
                        withAsterisk
                        allowDecimal={false}
                        allowNegative={false}
                        min={1}
                    />
                </Stack>
            </AmountBox>
        </UpdateTypeWrapper>
    ) : null;
}
