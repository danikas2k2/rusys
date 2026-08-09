import { Button, Group, Select, Stack, TextInput, type ComboboxItem } from '@mantine/core';
import { useForm } from '@mantine/form';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { AddIcon, CancelIcon, MoveIcon, UpdateIcon } from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { ImageDropzone } from '~/client/common/ImageDropzone';
import { Label } from '~/client/common/Label';
import { ProductDialogIcon } from '~/client/common/ProductDialogIcon';
import { CategoryAvatar } from '~/client/filters/CategoryAvatar';
import { CategoryOption } from '~/client/filters/CategoryOption';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useLabels } from '~/client/hooks/useLabels';
import { GroupBox } from '~/client/pages/groups/GroupBox';
import { useGroups } from '~/client/state/groups/useGroups';
import { useAddProduct } from '~/client/state/products/useAddProduct';
import { useMoveProduct } from '~/client/state/products/useMoveProduct';
import { useProducts } from '~/client/state/products/useProducts';
import { useRenameProduct } from '~/client/state/products/useRenameProduct';
import { useSetProductImage } from '~/client/state/products/useSetProductImage';
import { useSetProductParent } from '~/client/state/products/useSetProductParent';
import { compareNames } from '~/client/utils/compareNames';
import { getErrorMessage } from '~/client/utils/errors';

interface ProductBoxProps {
    opened?: boolean;
    group?: string;
    name?: string;
    parent?: string;
    image?: string;
    onClose: (group?: string, name?: string) => void;
    onAfterClose?: () => void;
}

const NEW_CATEGORY_VALUE = '__new_category__';

type ParentCandidate = { group: string; name: string; parent?: string };

// A product's own descendants (at any depth) can't be picked as its parent - that would create a cycle.
function getDescendantNames(products: readonly ParentCandidate[], group: string, name: string): Set<string> {
    const childrenByParent = new Map<string, string[]>();
    for (const p of products) {
        if (p.group === group && p.parent) {
            childrenByParent.set(p.parent, [...(childrenByParent.get(p.parent) ?? []), p.name]);
        }
    }
    const descendants = new Set<string>();
    const stack = [name];
    while (stack.length) {
        for (const child of childrenByParent.get(stack.pop()!) ?? []) {
            if (!descendants.has(child)) {
                descendants.add(child);
                stack.push(child);
            }
        }
    }
    return descendants;
}

// Lists the group's products in the same parent -> children order as the products tree (rather
// than a flat alphabetical list), with a depth for indenting the option to match that structure.
function buildParentOptionNodes(
    products: readonly ParentCandidate[],
    group: string,
    excluded: ReadonlySet<string>
): { name: string; depth: number }[] {
    const allowed = products.filter((p) => p.group === group && !excluded.has(p.name));
    const allowedNames = new Set(allowed.map((p) => p.name));

    const childrenByParent = new Map<string, ParentCandidate[]>();
    const roots: ParentCandidate[] = [];
    for (const p of allowed) {
        if (p.parent && allowedNames.has(p.parent)) {
            childrenByParent.set(p.parent, [...(childrenByParent.get(p.parent) ?? []), p]);
        } else {
            roots.push(p);
        }
    }

    const nodes: { name: string; depth: number }[] = [];
    const walk = (list: readonly ParentCandidate[], depth: number) => {
        for (const p of list) {
            nodes.push({ name: p.name, depth });
            walk(childrenByParent.get(p.name) ?? [], depth + 1);
        }
    };
    walk(roots, 0);
    return nodes;
}

export function ProductBox({
    group: initialGroup = '',
    name: initialName = '',
    parent: initialParent = '',
    image: initialImage = '',
    opened = false,
    onClose,
    onAfterClose,
}: Readonly<ProductBoxProps>) {
    const [filterGroup] = useGroupFilter();
    const isEditing = !!initialGroup && !!initialName;
    const isMoving = isEditing && filterGroup && filterGroup !== initialGroup;

    const _ = useLabels();
    const allGroups = useGroups();
    const groups = allGroups.map((g) => g.group);
    const imageByGroup = new Map(allGroups.map((g) => [g.group, g.image]));
    // Mirrors AmountVariantsTab's "New variant" option, opening GroupBox inline instead of
    // requiring a trip to the Groups page first. Uses a distinct sentinel rather than an empty
    // string - unlike AmountVariantsTab's Select (always controlled to value={null}), this one is
    // bound to the current category, and Mantine normalizes selecting an empty-string option to
    // onChange(null) rather than onChange(''), which would be indistinguishable from clearing.
    const categoryOptions = useMemo(
        () => [...groups.map((g) => ({ value: g, label: g })), { value: NEW_CATEGORY_VALUE, label: _('New category') }],
        [groups, _]
    );
    const products = useProducts();

    const form = useForm({
        initialValues: {
            group: initialGroup || filterGroup || '',
            name: initialName,
            parent: initialParent,
            image: initialImage,
        },
        validate: {
            group: (value) => {
                if (!value?.trim()) {
                    return _('Category is required');
                }
                if (
                    isEditing &&
                    value !== initialGroup &&
                    products.some((p) => p.group === initialGroup && p.parent === initialName)
                ) {
                    return _('Cannot move a product with sub-products to another category');
                }
                return null;
            },
            name: (value, values) => {
                if (!value?.trim()) {
                    return _('Name is required');
                }
                if (value.includes(':')) {
                    return _('Cannot contain ":" character');
                }
                // Check if name exists in the selected group
                const nameExists = products?.some(
                    (d) => !compareNames(d.group, values.group) && !compareNames(d.name, value)
                );
                const nameAdded = !initialName;
                const nameCopied = isEditing && values.group !== initialGroup;
                const nameRenamed = isEditing && value !== initialName && values.group === initialGroup;

                if (nameExists && (nameAdded || nameCopied || nameRenamed)) {
                    return _('Name already exists in this category');
                }
                return null;
            },
        },
    });

    const formRef = useRef(form);
    useLayoutEffect(() => {
        formRef.current = form;
    });

    const [loading, setLoading] = useState(false);
    const groupRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    // Reset form and focus input when modal opens
    useEffect(() => {
        if (opened) {
            formRef.current.setValues({
                group: initialGroup || filterGroup || '',
                name: initialName,
                parent: initialParent,
                image: initialImage,
            });
            formRef.current.resetTouched();
            formRef.current.resetDirty();
            // eslint-disable-next-line react-hooks/set-state-in-effect -- loading reset when modal opens
            setLoading(false);

            const timer = setTimeout(() => {
                nameRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [opened, initialGroup, initialName, initialParent, initialImage, filterGroup]);

    const handleImageDrop = useCallback((dataUrl: string) => {
        formRef.current.setFieldValue('image', dataUrl);
    }, []);

    const handleImageRemove = useCallback(() => {
        formRef.current.setFieldValue('image', '');
    }, []);

    // Revalidate when group or name changes to show duplicate errors in real-time
    const groupValue = form.values.group;
    const nameValue = form.values.name;
    useEffect(() => {
        if (formRef.current.isTouched('name') || formRef.current.isTouched('group')) {
            formRef.current.validateField('name');
        }
    }, [groupValue, nameValue]);

    // Products in the selected category that can be picked as a parent - excludes the product
    // itself and any of its own descendants (picking one would create a cycle), ordered and
    // depth-annotated to mirror the products tree structure shown in the table.
    const parentOptionNodes = useMemo(() => {
        const excluded = getDescendantNames(products, groupValue, initialName);
        excluded.add(initialName);
        return buildParentOptionNodes(products, groupValue, excluded);
    }, [products, groupValue, initialName]);

    const parentDepthByName = useMemo(
        () => new Map(parentOptionNodes.map((n) => [n.name, n.depth])),
        [parentOptionNodes]
    );

    const parentOptions = useMemo(() => parentOptionNodes.map((n) => n.name), [parentOptionNodes]);

    // Clear a parent selection that's no longer valid for the currently selected category
    // (e.g. after switching category, or if it somehow became a descendant).
    useEffect(() => {
        if (formRef.current.values.parent && !parentOptions.includes(formRef.current.values.parent)) {
            formRef.current.setFieldValue('parent', '');
        }
    }, [parentOptions]);

    const addProduct = useAddProduct();
    const moveProduct = useMoveProduct();
    const renameProduct = useRenameProduct();
    const setProductImage = useSetProductImage();
    const setProductParent = useSetProductParent();

    const [addingCategory, setAddingCategory] = useState(false);
    const handleAddCategoryOpen = useCallback(() => setAddingCategory(true), []);
    // Mantine's Select keeps showing the clicked option's label as its search text regardless of
    // what `value` does afterwards, so the field visually shows "New category" (or blanks out)
    // for a moment here even though `form.values.group` is genuinely updated underneath - it
    // fully corrects itself the next time the dropdown is opened. Cosmetic only; TODO polish.
    const handleAddCategoryClose = useCallback((newGroup?: string) => {
        setAddingCategory(false);
        if (newGroup) {
            formRef.current.setFieldValue('group', newGroup);
        }
    }, []);
    const handleAddCategoryAfterClose = useCallback(() => setAddingCategory(false), []);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const validation = form.validate();
        if (validation.hasErrors) {
            // Focus first invalid field
            // Only 'group' and 'name' are validated, so hasErrors implies one of them is set.
            if (validation.errors.group) {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                groupRef.current?.focus();
            } else {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                nameRef.current?.focus();
            }
            return;
        }

        // Delay loading state to avoid showing it for fast operations
        const loadingTimeout = setTimeout(() => {
            setLoading(true);
        }, 300);

        try {
            const values = form.values;
            const groupChanged = isEditing && values.group !== initialGroup;
            const nameRenamed = isEditing && values.name !== initialName && !groupChanged;
            const imageChanged = values.image !== initialImage;
            const parentChanged = values.parent !== initialParent;

            if (groupChanged) {
                // Move to different group - this also clears any parent link server-side,
                // since a product's parent must be in the same category.
                await moveProduct(initialGroup, initialName, values.group, values.name);
            } else if (nameRenamed) {
                // Rename in same group
                await renameProduct(initialGroup, initialName, values.name);
            } else if (!isEditing) {
                // Add new
                await addProduct(values.group, values.name, values.parent || undefined);
            }
            if (imageChanged) {
                await setProductImage(values.group, values.name, values.image);
            }
            if (isEditing && !groupChanged && parentChanged) {
                await setProductParent(values.group, values.name, values.parent || undefined);
            }
            onClose(values.group, values.name);
        } catch (error) {
            form.setFieldError('name', getErrorMessage(error));
            // istanbul ignore next - ref.current is always assigned in React Testing Library
            nameRef.current?.focus();
        } finally {
            clearTimeout(loadingTimeout);
            setLoading(false);
        }
    };

    // Determine button content
    const getButtonContent = () => {
        if (isMoving || (isEditing && form.values.group !== initialGroup)) {
            return {
                icon: <MoveIcon size={18} />,
                label: 'Move',
            };
        }
        if (isEditing) {
            return {
                icon: <UpdateIcon size={18} />,
                label: 'Update',
            };
        }
        return {
            icon: <AddIcon size={18} />,
            label: 'Add',
        };
    };

    const buttonContent = getButtonContent();

    return (
        <>
            <ConfirmableModal
                centered
                opened={opened}
                title={<ProductDialogIcon aria-label={_(isEditing ? 'Edit entry' : 'Add new entry')} />}
                withCloseButton
                isDirty={() => formRef.current.isDirty()}
                onClose={() => onClose()}
                closeOnEscape={!loading}
                closeOnClickOutside={!loading}
                closeButtonProps={{ 'aria-label': _('Close') }}
                onExitTransitionEnd={onAfterClose}
            >
                {(handleClose) => (
                    <form onSubmit={handleSubmit}>
                        <Stack>
                            <Select
                                ref={groupRef}
                                label={_('Category')}
                                placeholder={_('Select category')}
                                data={categoryOptions}
                                renderOption={({ option }: { option: ComboboxItem }) =>
                                    option.value === NEW_CATEGORY_VALUE ? (
                                        <Group gap="xs">
                                            <AddIcon size={14} />
                                            {option.label}
                                        </Group>
                                    ) : (
                                        <CategoryOption option={option} image={imageByGroup.get(option.value)} />
                                    )
                                }
                                leftSection={
                                    form.values.group ? (
                                        <CategoryAvatar
                                            image={imageByGroup.get(form.values.group)}
                                            label={form.values.group}
                                        />
                                    ) : undefined
                                }
                                withAsterisk
                                withAlignedLabels
                                checkIconPosition="left"
                                disabled={loading}
                                searchable
                                {...form.getInputProps('group')}
                                onChange={(value) =>
                                    value === NEW_CATEGORY_VALUE
                                        ? handleAddCategoryOpen()
                                        : form.getInputProps('group').onChange(value)
                                }
                            />
                            <TextInput
                                ref={nameRef}
                                label={_('Title')}
                                placeholder={_('Enter name')}
                                withAsterisk
                                disabled={loading}
                                {...form.getInputProps('name')}
                            />
                            <Select
                                label={_('Parent product')}
                                placeholder={_('No parent')}
                                data={parentOptions}
                                // option.value is always one of parentOptions, which is built from the
                                // same parentOptionNodes as parentDepthByName - the entry always exists.
                                renderOption={({ option }: { option: ComboboxItem }) => (
                                    <div style={{ paddingInlineStart: parentDepthByName.get(option.value)! * 16 }}>
                                        {option.label}
                                    </div>
                                )}
                                withAlignedLabels
                                clearable
                                searchable
                                disabled={loading}
                                {...form.getInputProps('parent')}
                            />
                            <ImageDropzone
                                image={form.values.image}
                                label={_('Product image')}
                                onDrop={handleImageDrop}
                                onRemove={handleImageRemove}
                                disabled={loading}
                            />
                            <Group justify="flex-end" mt="md">
                                <Button
                                    variant="outline"
                                    color="gray"
                                    disabled={loading}
                                    leftSection={<CancelIcon size={18} />}
                                    onClick={handleClose}
                                >
                                    <Label>Cancel</Label>
                                </Button>
                                <Button
                                    type="submit"
                                    loading={loading}
                                    leftSection={buttonContent.icon}
                                    color={!isEditing ? 'positive' : undefined}
                                >
                                    <Label>{buttonContent.label}</Label>
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                )}
            </ConfirmableModal>
            <GroupBox
                opened={addingCategory}
                onClose={handleAddCategoryClose}
                onAfterClose={handleAddCategoryAfterClose}
            />
        </>
    );
}
