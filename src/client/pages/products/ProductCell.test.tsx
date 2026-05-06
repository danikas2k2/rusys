import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import { Table } from '@mantine/core';
import React from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { useSwipeVisible } from '~/client/common/hooks/useSwipeVisible';
import { isPreferred, ProductCell, type ProductCellProps } from '~/client/pages/products/ProductCell';
import { useProductUpdating } from '~/client/pages/products/UpdatingProductsContext';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';

jest.mock('~/client/state/products/useSetProductRemoving', () => ({
    useSetProductRemoving: jest.fn(),
}));
jest.mock('~/client/common/ActiveContentContext', () => ({
    ...jest.requireActual('~/client/common/ActiveContentContext'),
    useActiveContent: jest.fn(),
}));
jest.mock('~/client/pages/products/UpdatingProductsContext', () => ({
    useProductUpdating: jest.fn(),
}));
jest.mock('~/client/common/hooks/useSwipeVisible', () => ({
    useSwipeVisible: jest.fn(),
}));

describe('<ProductCell>', () => {
    const group = 'Daržovės';
    const name = 'Kopūstai';
    const variants = [
        { group, variant: 'p', order: 0 },
        { group, variant: 'd', order: 1, suffix: 'd' },
        { group, variant: 'm', order: 2, suffix: 'm' },
    ];

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const setRemoving = jest.fn();
    const setActive = jest.fn();

    beforeEach(() => {
        jest.mocked(useSetProductRemoving).mockReturnValue(setRemoving);
        jest.mocked(useActiveContent).mockReturnValue([undefined, setActive]);
        jest.mocked(useSwipeVisible).mockReturnValue(false);
        jest.mocked(useProductUpdating).mockReturnValue(false);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterAll(() => jest.useRealTimers());

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

        it('handles long press', async () => {
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

            await user.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => jest.advanceTimersByTime(500));

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
            act(() => jest.advanceTimersByTime(500));
            fireEvent.pointerUp(cell);
            act(() => jest.advanceTimersByTime(100));

            expect(setActive).not.toHaveBeenCalled();
            expect(setRemoving).toHaveBeenCalledWith(
                propsWithRemoving.product.group,
                propsWithRemoving.product.name,
                propsWithRemoving.year,
                false
            );
        });

        it('handles short press', async () => {
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

            await user.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));

            expect(setActive).toHaveBeenCalledWith({
                action: 'values',
                data: {
                    group: props.product.group,
                    name: props.product.name,
                    year: props.year,
                    amounts: props.product.years?.[0]?.amounts,
                },
            });
            expect(setRemoving).not.toHaveBeenCalled();
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

        it('does not handle long press for empty cell', async () => {
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

            await user.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => jest.advanceTimersByTime(500));

            expect(setActive).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('handles short press with empty amounts', async () => {
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

            await user.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));

            expect(setActive).toHaveBeenCalledWith({
                action: 'values',
                data: {
                    group: props.product.group,
                    name: props.product.name,
                    year: props.year,
                    amounts: props.product.years?.[0]?.amounts,
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
            jest.mocked(useProductUpdating).mockReturnValue(true);

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
            jest.mocked(useProductUpdating).mockReturnValue(true);

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

            jest.mocked(useProductUpdating).mockReturnValue(false);

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
            jest.mocked(useProductUpdating).mockReturnValue(true);

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

    describe('span prop', () => {
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
            span: 3,
        };

        it('uses span to set year to 0 when span is provided', () => {
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

            expect(screen.getByRole('cell')).toBeInTheDocument();
        });

        it('calls setActive with correct data when span is provided and cell is clicked', async () => {
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

            await user.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));

            expect(setActive).toHaveBeenCalledWith({
                action: 'values',
                data: {
                    group: props.product.group,
                    name: props.product.name,
                    year: props.year,
                    amounts: props.product.years?.[0]?.amounts,
                },
            });
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

        it('disables interactions when swipeActive is true', async () => {
            jest.mocked(useSwipeVisible).mockReturnValue(true);

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

            await user.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));

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

        it('disables interactions when updating is true', async () => {
            jest.mocked(useProductUpdating).mockReturnValue(true);

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

            await user.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));

            expect(setActive).not.toHaveBeenCalled();
        });

        it('disables long press when updating is true', async () => {
            jest.mocked(useProductUpdating).mockReturnValue(true);

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

            await user.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => jest.advanceTimersByTime(500));

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
