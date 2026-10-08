import { Accordion, ActionIcon, Button, Group, Select, Stack, TextInput, type ComboboxItem } from '@mantine/core';
import { useForm } from '@mantine/form';
import React, {
    startTransition,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    ViewTransition,
} from 'react';

import { AddIcon, CancelIcon, DeleteIcon, MoveIcon, UpdateIcon } from '@icons';

import { formatExpiryTolerance, parseExpiryTolerance } from '~/common/utils/expiry';
import { ConfirmableModal } from '~/components/common/ConfirmableModal';
import { IconButtonTooltip } from '~/components/common/IconButtonTooltip';
import { Label } from '~/components/common/Label';
import { ImageDropzone } from '~/components/images/ImageDropzone';
import { ProductDialogIcon } from '~/components/products/ProductDialogIcon';
import { CategoryAvatar } from '~/features/filters/CategoryAvatar';
import { CategoryOption } from '~/features/filters/CategoryOption';
import { useGroupFilter } from '~/features/filters/GroupFilterContext';
import { GroupBox } from '~/features/groups/GroupBox';
import { useAddProduct } from '~/features/products/hooks/useAddProduct';
import { useMoveProduct } from '~/features/products/hooks/useMoveProduct';
import { useRenameProduct } from '~/features/products/hooks/useRenameProduct';
import { useSetProductExpiryTolerance } from '~/features/products/hooks/useSetProductExpiryTolerance';
import { useSetProductImage } from '~/features/products/hooks/useSetProductImage';
import { useSetProductParent } from '~/features/products/hooks/useSetProductParent';
import { ProductAvatar } from '~/features/products/ProductAvatar';
import { ProductOption } from '~/features/products/ProductOption';
import { useLabels } from '~/lib/hooks/useLabels';
import { compareNames } from '~/lib/utils/compareNames';
import { getErrorMessage } from '~/lib/utils/errors';
import { useGroups } from '~/store/groups';
import { useProducts } from '~/store/products';

import './ProductBox.css';

interface ProductBoxProps {
    opened?: boolean;
    group?: string;
    name?: string;
    parent?: string;
    image?: string;
    expiryToleranceDays?: number;
    onClose: (group?: string, name?: string) => void;
    onAfterClose?: () => void;
    onDelete?: () => void;
    closeOnEscape?: boolean;
    closeOnClickOutside?: boolean;
}

const NEW_CATEGORY_VALUE = ':new-category';

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
    expiryToleranceDays: initialExpiryToleranceDays = 0,
    opened = false,
    onClose,
    onAfterClose,
    onDelete,
    closeOnEscape = true,
    closeOnClickOutside = true,
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
            expiryTolerance: formatExpiryTolerance(initialExpiryToleranceDays),
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
            expiryTolerance: (value) =>
                parseExpiryTolerance(value) === undefined ? _('Enter a valid expiry tolerance') : null,
        },
    });

    const formRef = useRef(form);
    useLayoutEffect(() => {
        formRef.current = form;
    });

    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [advancedFieldsOpen, setAdvancedFieldsOpen] = useState(false);
    // A new product is created before its image can be saved. Remember it when the image request
    // fails so the next submit retries the image instead of attempting to create a duplicate.
    const [createdProduct, setCreatedProduct] = useState<{ group: string; name: string }>();
    const [imageProgress, setImageProgress] = useState<number>();
    const groupRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const expiryToleranceRef = useRef<HTMLInputElement>(null);

    // Reset form and focus input when modal opens
    useEffect(() => {
        if (opened) {
            formRef.current.setValues({
                group: initialGroup || filterGroup || '',
                name: initialName,
                parent: initialParent,
                image: initialImage,
                expiryTolerance: formatExpiryTolerance(initialExpiryToleranceDays),
            });
            formRef.current.resetTouched();
            formRef.current.resetDirty();
            // eslint-disable-next-line react-hooks/set-state-in-effect -- submission state reset when modal opens
            setSubmitting(false);
            setLoading(false);
            setCreatedProduct(undefined);
            setAdvancedFieldsOpen(false);
            setImageProgress(undefined);

            const timer = setTimeout(() => {
                nameRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [opened, initialGroup, initialName, initialParent, initialImage, initialExpiryToleranceDays, filterGroup]);

    const handleImageDrop = useCallback((dataUrl: string) => {
        formRef.current.setFieldValue('image', dataUrl);
        formRef.current.clearFieldError('image');
    }, []);

    const handleImageRemove = useCallback(() => {
        formRef.current.setFieldValue('image', '');
        formRef.current.clearFieldError('image');
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
    const parentImageByName = useMemo(
        () => new Map(products.filter((p) => p.group === groupValue).map((p) => [p.name, p.image])),
        [products, groupValue]
    );

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
    const setProductExpiryTolerance = useSetProductExpiryTolerance();

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

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const validation = form.validate();
        if (validation.hasErrors) {
            // Focus first invalid field
            if (validation.errors.group) {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                groupRef.current?.focus();
            } else if (validation.errors.name) {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                nameRef.current?.focus();
            } else {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                expiryToleranceRef.current?.focus();
            }
            return;
        }

        setSubmitting(true);
        // Delay the loader to avoid flashing it for fast operations. The submit button is
        // disabled immediately via `submitting`, so the request cannot be started twice.
        const loadingTimeout = setTimeout(() => {
            setLoading(true);
        }, 300);

        let failedField: 'name' | 'image' = 'name';
        try {
            const values = form.values;
            const groupChanged = isEditing && values.group !== initialGroup;
            const nameRenamed = isEditing && values.name !== initialName && !groupChanged;
            const imageChanged = values.image !== initialImage;
            const parentChanged = values.parent !== initialParent;
            const expiryToleranceDays = parseExpiryTolerance(values.expiryTolerance);
            // Validation above ensures the parser succeeds before this point.
            if (expiryToleranceDays === undefined) {
                return;
            }
            const expiryToleranceChanged = expiryToleranceDays !== initialExpiryToleranceDays;

            let savedProduct = createdProduct;
            if (groupChanged) {
                // Move to different group - this also clears any parent link server-side,
                // since a product's parent must be in the same category.
                await moveProduct(initialGroup, initialName, values.group, values.name);
            } else if (nameRenamed) {
                // Rename in same group
                await renameProduct(initialGroup, initialName, values.name);
            } else if (!isEditing && !savedProduct) {
                // Add new
                await addProduct(values.group, values.name, values.parent || undefined);
                savedProduct = { group: values.group, name: values.name };
                setCreatedProduct(savedProduct);
            }
            const product = savedProduct ?? { group: values.group, name: values.name };
            if (imageChanged) {
                failedField = 'image';
                const uploadingImage = values.image.startsWith('data:');
                if (uploadingImage) {
                    setImageProgress(0);
                }
                if (uploadingImage) {
                    await setProductImage(product.group, product.name, values.image, setImageProgress);
                } else {
                    await setProductImage(product.group, product.name, values.image);
                }
            }
            if (isEditing && !groupChanged && parentChanged) {
                await setProductParent(values.group, values.name, values.parent || undefined);
            }
            if ((isEditing && expiryToleranceChanged) || (!isEditing && expiryToleranceDays > 0)) {
                await setProductExpiryTolerance(values.group, values.name, expiryToleranceDays);
            }
            onClose(product.group, product.name);
        } catch (error) {
            form.setFieldError(failedField, getErrorMessage(error));
            if (failedField === 'name') {
                // istanbul ignore next - ref.current is always assigned in React Testing Library
                nameRef.current?.focus();
            }
        } finally {
            setImageProgress(undefined);
            clearTimeout(loadingTimeout);
            setSubmitting(false);
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
                closeOnEscape={closeOnEscape && !loading}
                closeOnClickOutside={closeOnClickOutside && !loading}
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
                                        <Group gap="xs" data-separator={!!groups.length}>
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
                                disabled={loading || !!createdProduct}
                                searchable
                                {...form.getInputProps('group')}
                                onChange={(value) =>
                                    value === NEW_CATEGORY_VALUE
                                        ? handleAddCategoryOpen()
                                        : form.setFieldValue('group', value ?? '')
                                }
                            />
                            <TextInput
                                ref={nameRef}
                                label={_('Title')}
                                placeholder={_('Enter name')}
                                withAsterisk
                                disabled={loading || !!createdProduct}
                                {...form.getInputProps('name')}
                            />
                            <ImageDropzone
                                image={form.values.image}
                                label={_('Product image')}
                                onDrop={handleImageDrop}
                                progress={imageProgress}
                                onRemove={handleImageRemove}
                                disabled={loading}
                                error={form.errors.image}
                            />
                            <Accordion
                                value={advancedFieldsOpen ? 'additional-details' : null}
                                onChange={(value) =>
                                    startTransition(() => setAdvancedFieldsOpen(value === 'additional-details'))
                                }
                                className="ProductBox-advancedFields"
                                variant="contained"
                                radius="md"
                            >
                                <ViewTransition update="product-advanced-update" default="none">
                                    <Accordion.Item value="additional-details" data-product-advanced-fields>
                                        <Accordion.Control>
                                            <Label>Additional details</Label>
                                        </Accordion.Control>
                                        <Accordion.Panel>
                                            <Stack gap="sm">
                                                <Select
                                                    label={_('Parent product')}
                                                    placeholder={_('No parent')}
                                                    data={parentOptions}
                                                    // option.value is always one of parentOptions, which is built from the
                                                    // same parentOptionNodes as parentDepthByName - the entry always exists.
                                                    renderOption={({ option }: { option: ComboboxItem }) => (
                                                        <ProductOption
                                                            option={option}
                                                            image={parentImageByName.get(option.value)}
                                                            depth={parentDepthByName.get(option.value)!}
                                                        />
                                                    )}
                                                    leftSection={
                                                        form.values.parent ? (
                                                            <ProductAvatar
                                                                image={parentImageByName.get(form.values.parent)}
                                                                label={form.values.parent}
                                                            />
                                                        ) : undefined
                                                    }
                                                    withAlignedLabels
                                                    clearable={!!form.values.parent}
                                                    searchable
                                                    disabled={loading}
                                                    {...form.getInputProps('parent')}
                                                    onChange={(value) => form.setFieldValue('parent', value ?? '')}
                                                />
                                                <TextInput
                                                    ref={expiryToleranceRef}
                                                    label={_('Expiry tolerance')}
                                                    description={_('Examples: 7, 2 sav, 3 men, 1 m.')}
                                                    disabled={loading}
                                                    {...form.getInputProps('expiryTolerance')}
                                                />
                                            </Stack>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                </ViewTransition>
                            </Accordion>
                            <Group justify={isEditing && onDelete ? 'space-between' : 'flex-end'} mt="md" wrap="nowrap">
                                {isEditing && onDelete && (
                                    <IconButtonTooltip>
                                        <ActionIcon
                                            variant="outline"
                                            color="negative"
                                            size="lg"
                                            disabled={loading}
                                            onClick={onDelete}
                                            aria-label={_('Remove')}
                                        >
                                            <DeleteIcon size={18} />
                                        </ActionIcon>
                                    </IconButtonTooltip>
                                )}
                                <Group gap="sm" wrap="nowrap">
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
                                        disabled={submitting}
                                        loading={loading}
                                        leftSection={buttonContent.icon}
                                        color={!isEditing ? 'positive' : undefined}
                                    >
                                        <Label>{buttonContent.label}</Label>
                                    </Button>
                                </Group>
                            </Group>
                        </Stack>
                    </form>
                )}
            </ConfirmableModal>
            {addingCategory && <GroupBox opened onClose={handleAddCategoryClose} />}
        </>
    );
}
