import { act, fireEvent, render, screen } from '@testing-library/react';
import { MockApp } from '@tests/MockApp';

import { Table } from '@mantine/core';
import React from 'react';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { useSwipeVisible } from '~/client/common/hooks/useSwipeVisible';
import { isPreferred, ProductCell, type ProductCellProps } from '~/client/pages/products/ProductCell';
import { useProductUpdating } from '~/client/pages/products/UpdatingProductsContext';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';

vi.mock(import('~/client/state/products/useSetProductRemoving'), () => ({
    useSetProductRemoving: vi.fn(),
}));
vi.mock(import('~/client/common/ActiveContentContext'), async () => ({
    ...(await vi.importActual('~/client/common/ActiveContentContext')),
    useSetActiveContent: vi.fn(),
}));
vi.mock(import('~/client/pages/products/UpdatingProductsContext'), () => ({
    useProductUpdating: vi.fn(),
}));
vi.mock(import('~/client/common/hooks/useSwipeVisible'), () => ({
    useSwipeVisible: vi.fn(),
}));

describe('<ProductCell>', () => {
    const group = 'Daržovės';
    const name = 'Kopūstai';
    const variants = [
        { group, variant: 'p', order: 0 },
        { group, variant: 'd', order: 1, suffix: 'd' },
        { group, variant: 'm', order: 2, suffix: 'm' },
    ];

    const setRemoving = vi.fn();
    const setActive = vi.fn();

    beforeEach(() => {
        vi.mocked(useSetProductRemoving).mockReturnValue(setRemoving);
        vi.mocked(useSetActiveContent).mockReturnValue(setActive);
        vi.mocked(useSwipeVisible).mockReturnValue(false);
        vi.mocked(useProductUpdating).mockReturnValue(false);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.clearAllTimers();
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    const defaultProduct = {
        group,
        name,
        years: [
            {
                year: 22,
                amounts: [
                    { variant: 'p', amount: 2 },
                    { variant: 'd', amount: 3 },
                ],
            },
        ],
    };

    const defaultProps: ProductCellProps = { product: defaultProduct, year: 22 };

    describe('renders filled cell', () => {
        const props: ProductCellProps = {
            ...defaultProps,
        };

        it('renders cell into the document', () => {
            render(
                <MockApp state={{ variants }}>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('cell', { name: '23d' })).toBeInTheDocument();
        });

        it('handles long press', () => {
            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => fireEvent.pointerDown(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' }));
            act(() => vi.advanceTimersByTime(500));

            expect(setActive).not.toHaveBeenCalled();
            expect(setRemoving).toHaveBeenCalledWith(props.product.group, props.product.name, props.year, true);
        });

        it('handles long press when removing is true', async () => {
            const productWithRemoving = {
                ...defaultProduct,
                years: [
                    {
                        year: 22,
                        amounts: [
                            { variant: 'p', amount: 2 },
                            { variant: 'd', amount: 3 },
                        ],
                        removing: true,
                    },
                ],
            };
            const propsWithRemoving: ProductCellProps = {
                product: productWithRemoving,
                year: 22,
            };

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...propsWithRemoving} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            const cell = screen.getByRole('cell');
            fireEvent.pointerDown(cell);
            act(() => vi.advanceTimersByTime(500));
            fireEvent.pointerUp(cell);
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).not.toHaveBeenCalled();
            expect(setRemoving).toHaveBeenCalledWith(
                propsWithRemoving.product.group,
                propsWithRemoving.product.name,
                propsWithRemoving.year,
                false
            );
        });

        it('handles short press', () => {
            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => {
                fireEvent.pointerDown(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
                fireEvent.pointerUp(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
            });
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).toHaveBeenCalledWith({
                action: 'values',
                data: {
                    group: props.product.group,
                    name: props.product.name,
                    year: props.year,
                    amounts: props.product.years?.[0]?.amounts,
                    image: props.product.image,
                },
            });
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('includes the product image when calling setActive', () => {
            const productWithImage = { ...defaultProduct, image: '/images/ab/cd/product.png' };
            const propsWithImage: ProductCellProps = { product: productWithImage, year: 22 };

            render(
                <MockApp state={{ variants }}>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...propsWithImage} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => {
                fireEvent.pointerDown(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
                fireEvent.pointerUp(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
            });
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).toHaveBeenCalledWith({
                action: 'values',
                data: {
                    group: propsWithImage.product.group,
                    name: propsWithImage.product.name,
                    year: propsWithImage.year,
                    amounts: propsWithImage.product.years?.[0]?.amounts,
                    image: '/images/ab/cd/product.png',
                },
            });
        });
    });

    describe('renders empty cell', () => {
        it('renders cell into the document with empty amounts', () => {
            const emptyProduct = {
                ...defaultProduct,
                years: [
                    {
                        year: 22,
                        amounts: [],
                    },
                ],
            };
            const props: ProductCellProps = { product: emptyProduct, year: 22 };

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('cell', { name: '.' })).toBeInTheDocument();
        });

        it('does not handle long press for empty cell', () => {
            const emptyProduct = {
                ...defaultProduct,
                years: [
                    {
                        year: 22,
                        amounts: [],
                    },
                ],
            };
            const props: ProductCellProps = { product: emptyProduct, year: 22 };

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => fireEvent.pointerDown(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' }));
            act(() => vi.advanceTimersByTime(500));

            expect(setActive).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('handles short press with empty amounts', () => {
            const emptyProduct = {
                ...defaultProduct,
                years: [
                    {
                        year: 22,
                        amounts: [],
                    },
                ],
            };
            const props: ProductCellProps = { product: emptyProduct, year: 22 };

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => fireEvent.click(screen.getByRole('cell')));
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).toHaveBeenCalledWith({
                action: 'values',
                data: {
                    group: props.product.group,
                    name: props.product.name,
                    year: props.year,
                    amounts: props.product.years?.[0]?.amounts,
                    image: props.product.image,
                },
            });
            expect(setRemoving).not.toHaveBeenCalled();
        });
    });

    describe('loader visibility', () => {
        const productWithAmounts = {
            ...defaultProduct,
            years: [
                {
                    year: 22,
                    amounts: [{ variant: 'p', amount: 1 }],
                },
            ],
        };
        const props: ProductCellProps = {
            product: productWithAmounts,
            year: 22,
        };

        it('shows loader when updating is true', () => {
            vi.mocked(useProductUpdating).mockReturnValue(true);

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('progressbar')).toHaveAttribute('data-visible', 'true');
        });

        it('hides loader when updating becomes false and transition ends', () => {
            vi.mocked(useProductUpdating).mockReturnValue(true);

            const { rerender } = render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();

            vi.mocked(useProductUpdating).mockReturnValue(false);

            rerender(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => fireEvent.transitionEnd(screen.getByRole('progressbar')));

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('does not hide loader when updating is true and transition ends', () => {
            vi.mocked(useProductUpdating).mockReturnValue(true);

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => fireEvent.transitionEnd(screen.getByRole('progressbar')));

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    describe('swipeActive', () => {
        const productWithAmounts = {
            ...defaultProduct,
            years: [
                {
                    year: 22,
                    amounts: [{ variant: 'p', amount: 1 }],
                },
            ],
        };
        const props: ProductCellProps = {
            product: productWithAmounts,
            year: 22,
        };

        it('disables interactions when swipeActive is true', () => {
            vi.mocked(useSwipeVisible).mockReturnValue(true);

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => {
                fireEvent.pointerDown(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
                fireEvent.pointerUp(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
            });
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).not.toHaveBeenCalled();
        });
    });

    describe('updating', () => {
        const productWithAmounts = {
            ...defaultProduct,
            years: [
                {
                    year: 22,
                    amounts: [{ variant: 'p', amount: 1 }],
                },
            ],
        };
        const props: ProductCellProps = {
            product: productWithAmounts,
            year: 22,
        };

        it('disables interactions when updating is true', () => {
            vi.mocked(useProductUpdating).mockReturnValue(true);

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => {
                fireEvent.pointerDown(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
                fireEvent.pointerUp(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
            });
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).not.toHaveBeenCalled();
        });

        it('disables long press when updating is true', () => {
            vi.mocked(useProductUpdating).mockReturnValue(true);

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => fireEvent.pointerDown(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' }));
            act(() => vi.advanceTimersByTime(500));

            expect(setRemoving).not.toHaveBeenCalled();
            expect(setActive).not.toHaveBeenCalled();
        });
    });

    describe('preferred logic', () => {
        const thisYear = 26;
        const prevYear = 25;

        it('preferred is true for previous year if it exists and not removing', () => {
            const product = {
                ...defaultProduct,
                years: [
                    { year: thisYear, amounts: [{ variant: 'p', amount: 1 }], removing: false },
                    { year: prevYear, amounts: [{ variant: 'p', amount: 1 }], removing: false },
                ],
            };

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell product={product} year={prevYear} />
                                <ProductCell product={product} year={thisYear} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            const [first, second] = screen.getAllByRole('cell');

            expect(first).toHaveAttribute('data-preferred', 'true'); // 25
            expect(second).toHaveAttribute('data-preferred', 'false'); // 26
        });

        it('preferred is true for current year if previous year is missing or all removing', () => {
            const product = {
                ...defaultProduct,
                years: [
                    { year: thisYear, amounts: [{ variant: 'p', amount: 1 }], removing: false },
                    { year: prevYear, amounts: [{ variant: 'p', amount: 1 }], removing: true },
                ],
            };

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell product={product} year={prevYear} />
                                <ProductCell product={product} year={thisYear} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            const [first, second] = screen.getAllByRole('cell');

            expect(first).toHaveAttribute('data-preferred', 'false'); // 25
            expect(second).toHaveAttribute('data-preferred', 'true'); // 26
        });

        it('preferred is false if neither previous nor current year is valid', () => {
            const product = {
                ...defaultProduct,
                years: [
                    { year: thisYear, amounts: [], removing: false },
                    { year: prevYear, amounts: [], removing: false },
                ],
            };

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell product={product} year={prevYear} />
                                <ProductCell product={product} year={thisYear} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            const [first, second] = screen.getAllByRole('cell');

            expect(first).toHaveAttribute('data-preferred', 'false');
            expect(second).toHaveAttribute('data-preferred', 'false');
        });
    });

    describe('displayAmounts prop', () => {
        it('renders displayAmounts instead of the product own amounts when given', () => {
            const props: ProductCellProps = {
                ...defaultProps,
                displayAmounts: [{ variant: 'p', amount: 99 }],
            };

            render(
                <MockApp state={{ variants }}>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('cell')).toHaveTextContent('99');
            expect(screen.queryByRole('cell', { name: /^2/ })).not.toBeInTheDocument();
        });

        it('shows the empty dot when displayAmounts is empty, even if the product has its own amounts', () => {
            const props: ProductCellProps = {
                ...defaultProps,
                displayAmounts: [],
            };

            render(
                <MockApp state={{ variants }}>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('cell', { name: '.' })).toBeInTheDocument();
            expect(screen.getByRole('cell')).toHaveAttribute('data-empty', 'true');
        });

        it('falls back to the product own amounts when displayAmounts is not given', () => {
            render(
                <MockApp state={{ variants }}>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...defaultProps} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('cell')).not.toHaveTextContent('99');
        });

        it('clicking still opens the edit dialog with the product own amounts, not displayAmounts', async () => {
            const props: ProductCellProps = {
                ...defaultProps,
                displayAmounts: [{ variant: 'p', amount: 99 }],
            };

            render(
                <MockApp state={{ variants }}>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => {
                fireEvent.pointerDown(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
                fireEvent.pointerUp(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
            });
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).toHaveBeenCalledWith({
                action: 'values',
                data: {
                    group,
                    name,
                    year: 22,
                    amounts: defaultProduct.years[0].amounts,
                    image: undefined,
                },
            });
        });

        it('long-press-to-remove is disabled when the product has no own amounts, even if displayAmounts is non-empty', () => {
            const emptyOwnProduct = { group, name, years: [{ year: 22, amounts: [] }] };
            const props: ProductCellProps = {
                product: emptyOwnProduct,
                year: 22,
                displayAmounts: [{ variant: 'p', amount: 99 }],
            };

            render(
                <MockApp state={{ variants }}>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ProductCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => {
                fireEvent.pointerDown(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
                act(() => vi.advanceTimersByTime(1000));
                fireEvent.pointerUp(screen.getByRole('cell'), { pointerId: 1, pointerType: 'touch' });
            });

            expect(setRemoving).not.toHaveBeenCalled();
        });
    });

    describe('isPreferred', () => {
        const thisYear = new Date().getFullYear() % 100;
        const prevYear = thisYear - 1;
        const nextYear = thisYear + 1;
        const defaultAmounts = [{ variant: 'p', amount: 1 }];

        it('returns true for previous year if it exists and not removing', () => {
            const years = [
                { year: thisYear, amounts: defaultAmounts, removing: false },
                { year: prevYear, amounts: defaultAmounts, removing: false },
            ];

            expect(isPreferred(prevYear, years)).toBe(true);
        });

        it('returns true for current year if previous year is missing or all removing', () => {
            const years = [
                { year: thisYear, amounts: defaultAmounts, removing: false },
                { year: prevYear, amounts: defaultAmounts, removing: true },
            ];

            expect(isPreferred(thisYear, years)).toBe(true);
        });

        it('returns false if neither previous nor current year is valid', () => {
            const years = [
                { year: thisYear, amounts: [], removing: false },
                { year: prevYear, amounts: [], removing: false },
            ];

            expect(isPreferred(prevYear, years)).toBe(false);
        });

        it('returns true for the largest available year less than thisYear', () => {
            const years = [
                { year: thisYear - 2, amounts: defaultAmounts, removing: false },
                { year: thisYear - 3, amounts: defaultAmounts, removing: false },
                { year: thisYear - 4, amounts: defaultAmounts, removing: false },
                { year: thisYear, amounts: defaultAmounts, removing: false },
            ];

            expect(isPreferred(thisYear - 2, years)).toBe(true);
        });

        it('returns true for current year if it is the only available', () => {
            const years = [{ year: thisYear, amounts: defaultAmounts, removing: false }];

            expect(isPreferred(thisYear, years)).toBe(true);
        });

        it('returns false for a year greater than thisYear', () => {
            const years = [
                { year: nextYear, amounts: defaultAmounts, removing: false },
                { year: thisYear, amounts: defaultAmounts, removing: false },
            ];

            expect(isPreferred(nextYear, years)).toBe(false);
        });
    });
});
