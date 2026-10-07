import { Box, Burger, Divider, Drawer, Flex, Group, NavLink, Portal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useCallback, useState } from 'react';

import { CategoriesNavIcon, ProductsNavIcon, SummaryNavIcon, UtilitiesNavIcon, VariantsNavIcon } from '@icons';

import { Label } from '~/components/common/Label';
import { ColorSchemeToggle } from '~/components/runtime/ColorSchemeToggle';
import { LanguageToggle } from '~/components/runtime/LanguageToggle';
import { ExportMenuItem } from '~/components/toolbar/items/ExportMenuItem';
import { ImportMenuItem } from '~/components/toolbar/items/ImportMenuItem';
import { ToolbarMenuIcon } from '~/components/toolbar/ToolbarMenuIcon';
import { useLabel } from '~/lib/hooks/useLabel';
import { Links } from '~/lib/links';

import './ToolbarMenu.css';

const BURGER_Z_INDEX = 101;
const OPEN_DRAWER_BURGER_Z_INDEX = 300;

export function ToolbarMenu() {
    const [opened, { toggle, close }] = useDisclosure();

    const [burgerAbove, setBurgerAbove] = useState(false);
    const handleToggle = useCallback(() => {
        if (!opened) {
            setBurgerAbove(true);
        }
        toggle();
    }, [opened, toggle]);

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const to = useCallback(
        (path: string) => {
            const search = searchParams.toString();
            return search ? `${path}?${search}` : path;
        },
        [searchParams]
    );

    return (
        <>
            <Portal>
                <Box className="burger" style={{ zIndex: burgerAbove ? OPEN_DRAWER_BURGER_Z_INDEX : BURGER_Z_INDEX }}>
                    <Burger
                        size="sm"
                        opened={opened}
                        onClick={handleToggle}
                        aria-label={useLabel('Menu')}
                        classNames={{ burger: 'toolbar-menu-burger-icon' }}
                    />
                </Box>
            </Portal>
            <Drawer
                role="menu"
                opened={opened}
                onClose={close}
                position="left"
                withCloseButton={false}
                className="drawer"
                onExitTransitionEnd={() => setBurgerAbove(false)}
            >
                <Flex direction="column" className="menu">
                    <Box>
                        <NavLink
                            label={<Label>Products</Label>}
                            leftSection={
                                <ToolbarMenuIcon>
                                    <ProductsNavIcon />
                                </ToolbarMenuIcon>
                            }
                            component={Link}
                            prefetch={false}
                            href={to(Links.PRODUCTS)}
                            active={pathname === Links.PRODUCTS}
                            onClick={close}
                        />
                        <NavLink
                            label={<Label>Summary</Label>}
                            leftSection={
                                <ToolbarMenuIcon>
                                    <SummaryNavIcon />
                                </ToolbarMenuIcon>
                            }
                            component={Link}
                            prefetch={false}
                            href={to(Links.SUMMARY)}
                            active={pathname === Links.SUMMARY}
                            onClick={close}
                        />
                        <Divider m="xs" />

                        <NavLink
                            label={<Label>Variants</Label>}
                            leftSection={
                                <ToolbarMenuIcon>
                                    <VariantsNavIcon />
                                </ToolbarMenuIcon>
                            }
                            component={Link}
                            prefetch={false}
                            href={to(Links.VARIANTS)}
                            active={pathname === Links.VARIANTS}
                            onClick={close}
                        />
                        <NavLink
                            label={<Label>Categories</Label>}
                            leftSection={
                                <ToolbarMenuIcon>
                                    <CategoriesNavIcon />
                                </ToolbarMenuIcon>
                            }
                            component={Link}
                            prefetch={false}
                            href={to(Links.CATEGORIES)}
                            active={pathname === Links.CATEGORIES}
                            onClick={close}
                        />

                        <Divider m="xs" />

                        <NavLink
                            label={<Label>Utilities</Label>}
                            leftSection={
                                <ToolbarMenuIcon>
                                    <UtilitiesNavIcon />
                                </ToolbarMenuIcon>
                            }
                            childrenOffset={32}
                            href="#utils"
                        >
                            <ExportMenuItem onClick={close} />
                            <ImportMenuItem onClick={close} />
                        </NavLink>
                    </Box>

                    <Box mt="auto" mb="xs">
                        <Group justify="center" gap="sm">
                            <ColorSchemeToggle />
                            <LanguageToggle />
                        </Group>
                    </Box>
                </Flex>
            </Drawer>
        </>
    );
}
