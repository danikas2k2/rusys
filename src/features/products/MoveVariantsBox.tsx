import { Alert, Button, Group, Select, Stack, Text, type ComboboxItem } from '@mantine/core';
import React, { useCallback, useMemo, useState } from 'react';

import { AddIcon, CancelIcon, MoveIcon } from '@icons';

import type { Product, VariantAmount } from '~/common/data';
import { CategoryAvatar } from '~/features/filters/CategoryAvatar';
import { ProductBox } from '~/features/products/ProductBox';
import { ProductOption } from '~/features/products/ProductOption';
import { useLabels } from '~/lib/hooks/useLabels';
import { useGroups } from '~/store/groups/useGroups';
import { useProducts } from '~/store/products/useProducts';
import { useTransferAmounts } from '~/store/products/useTransferAmounts';
import { useProfile } from '~/store/profile/useProfile';

import './MoveVariantsBox.css';

const GROUP_PREFIX = ':group:';
const PRODUCT_PREFIX = ':product:';
const NEW_PRODUCT = ':new-product';

function buildProductOptionNodes(
    products: readonly Product[],
    group: string,
    excludedName: string | undefined
): { product: Product; depth: number }[] {
    const allowed = products.filter((product) => product.group === group && product.name !== excludedName);
    const names = new Set(allowed.map((product) => product.name));
    const childrenByParent = new Map<string, Product[]>();
    const roots: Product[] = [];
    for (const product of allowed) {
        if (product.parent && names.has(product.parent)) {
            childrenByParent.set(product.parent, [...(childrenByParent.get(product.parent) ?? []), product]);
        } else {
            roots.push(product);
        }
    }

    const nodes: { product: Product; depth: number }[] = [];
    const addNodes = (items: readonly Product[], depth: number) => {
        for (const product of items) {
            nodes.push({ product, depth });
            addNodes(childrenByParent.get(product.name) ?? [], depth + 1);
        }
    };
    addNodes(roots, 0);
    return nodes;
}

interface MoveVariantsBoxProps {
    group: string;
    name: string;
    year: number;
    amounts: readonly VariantAmount[];
    onCancel: () => void;
    onMoved: () => void;
}

export function MoveVariantsBox({
    group,
    name,
    year,
    amounts,
    onCancel,
    onMoved,
}: MoveVariantsBoxProps): React.ReactElement {
    const _ = useLabels();
    const groups = useGroups();
    const products = useProducts();
    const profile = useProfile();
    const transferAmounts = useTransferAmounts();
    const [target, setTarget] = useState<string | null>(null);
    const [dropdownOpened, setDropdownOpened] = useState(false);
    const [addingProduct, setAddingProduct] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const groupImageByName = useMemo(() => new Map(groups.map((entry) => [entry.group, entry.image])), [groups]);
    const groupNames = useMemo(
        () => [group, ...groups.map((entry) => entry.group).filter((groupName) => groupName !== group)],
        [group, groups]
    );
    const { options, productNodesByValue } = useMemo(() => {
        const result: ComboboxItem[] = [{ value: NEW_PRODUCT, label: _('New product') }];
        const nodesByValue = new Map<string, { product: Product; depth: number }>();
        for (const groupName of groupNames) {
            const groupProductNodes = buildProductOptionNodes(
                products,
                groupName,
                groupName === group ? name : undefined
            );
            if (!groupProductNodes.length && groupName !== group) {
                continue;
            }
            result.push({ value: `${GROUP_PREFIX}${groupName}`, label: groupName, disabled: true });
            for (const node of groupProductNodes) {
                const value = `${PRODUCT_PREFIX}${node.product.group}:${node.product.name}`;
                result.push({ value, label: node.product.name });
                nodesByValue.set(value, node);
            }
        }
        return { options: result, productNodesByValue: nodesByValue };
    }, [_, group, groupNames, name, products]);

    const targetProduct = useMemo(() => {
        if (!target?.startsWith(PRODUCT_PREFIX)) {
            return undefined;
        }
        const [targetGroup, targetName] = target.slice(PRODUCT_PREFIX.length).split(':', 2);
        return products.find((product) => product.group === targetGroup && product.name === targetName);
    }, [products, target]);

    const handleTargetChange = useCallback((value: string | null) => {
        if (value === NEW_PRODUCT) {
            setAddingProduct(true);
            return;
        }
        setTarget(value);
    }, []);
    const handleNewProductClose = useCallback((newGroup?: string, newName?: string) => {
        setAddingProduct(false);
        if (newGroup && newName) {
            setTarget(`${PRODUCT_PREFIX}${newGroup}:${newName}`);
            setDropdownOpened(false);
        }
    }, []);
    const handleCancel = useCallback(() => {
        setTarget(null);
        onCancel();
    }, [onCancel]);
    const handleMove = useCallback(async () => {
        if (!targetProduct) {
            return;
        }
        setSubmitting(true);
        try {
            await transferAmounts(group, name, year, targetProduct.group, targetProduct.name, amounts, profile.email);
            setTarget(null);
            onMoved();
        } finally {
            setSubmitting(false);
        }
    }, [amounts, group, name, onMoved, profile.email, targetProduct, transferAmounts, year]);

    const targetIsOtherGroup = !!targetProduct && targetProduct.group !== group;

    return (
        <>
            <Stack gap="xs">
                <Select
                    label={_('Move to')}
                    placeholder={_('Select product')}
                    data={options}
                    value={target}
                    onChange={handleTargetChange}
                    dropdownOpened={dropdownOpened}
                    onDropdownOpen={() => setDropdownOpened(true)}
                    onDropdownClose={() => setDropdownOpened(false)}
                    searchable
                    clearable
                    maxDropdownHeight={280}
                    comboboxProps={{ position: 'top', middlewares: { flip: false } }}
                    renderOption={({ option }) => {
                        if (option.value.startsWith(GROUP_PREFIX)) {
                            return (
                                <Group gap="xs" wrap="nowrap" fw={600} data-product-group-option>
                                    <CategoryAvatar image={groupImageByName.get(option.label)} label={option.label} />
                                    {option.label}
                                </Group>
                            );
                        }
                        if (option.value === NEW_PRODUCT) {
                            return (
                                <Group gap="xs" data-new-product-option>
                                    <AddIcon size={14} />
                                    {option.label}
                                </Group>
                            );
                        }
                        const node = productNodesByValue.get(option.value);
                        return (
                            <ProductOption option={option} image={node?.product.image} depth={(node?.depth ?? 0) + 1} />
                        );
                    }}
                />
                {targetIsOtherGroup && (
                    <Alert color="blue" variant="light">
                        <Text size="sm">
                            {_('Variants will be copied to')} {targetProduct!.group}.
                        </Text>
                    </Alert>
                )}
                <Group className="amount-box-actions" justify="center" gap="xs">
                    <Button
                        variant="default"
                        size="sm"
                        leftSection={<CancelIcon size={16} />}
                        onClick={handleCancel}
                        disabled={submitting}
                    >
                        {_('Cancel')}
                    </Button>
                    <Button
                        size="sm"
                        leftSection={<MoveIcon size={16} />}
                        onClick={handleMove}
                        disabled={!targetProduct || submitting}
                        loading={submitting}
                    >
                        {_('Move')}
                    </Button>
                </Group>
            </Stack>
            <ProductBox
                opened={addingProduct}
                group={group}
                onClose={handleNewProductClose}
                closeOnEscape={false}
                closeOnClickOutside={false}
            />
        </>
    );
}
