import { Table, Text, Title } from '@mantine/core';
import React from 'react';

import { Label } from '~/client/common/Label';
import { VariantAmount } from '~/client/common/VariantAmount';
import { VariantTitle } from '~/client/common/VariantTitle';
import { SortableRow } from '~/client/table/SortableRow';
import { getId } from '~/client/utils/id';
import type { Variant } from '~/types/data';

interface VariantsRowProps {
    variant: Readonly<Variant>;
    reordering: boolean;
    hidden?: boolean;
}

export function VariantsRow({ variant, reordering, hidden = false }: VariantsRowProps): React.ReactElement {
    return (
        <SortableRow
            id={getId(variant.group, variant.variant)}
            data={variant}
            data-group={variant.group}
            disabled={reordering || hidden}
            data-hidden={hidden}
        >
            <Table.Td>
                <Title order={5} data-unused={!variant.used}>
                    {variant.name ? (
                        <>
                            {variant.name}
                            {variant.count ? (
                                <Text size="sm" c="dimmed">
                                    <VariantAmount group={variant.group} variant={variant.variant} />
                                </Text>
                            ) : null}
                        </>
                    ) : (
                        <VariantTitle group={variant.group} variant={variant.variant} />
                    )}
                </Title>
            </Table.Td>
            <Table.Td ta="center">
                <Label>{variant.suffix ?? ''}</Label>
            </Table.Td>
        </SortableRow>
    );
}
