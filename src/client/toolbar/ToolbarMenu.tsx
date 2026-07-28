import { Box, Burger, Divider, Drawer, Flex, NavLink, Portal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconAdjustmentsUp,
    IconChartBubble,
    IconChartColumn,
    IconList,
    IconTriangleSquareCircle,
} from '@tabler/icons-react';
import React, { useCallback, useState } from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';

import { ColorSchemeToggle } from '~/client/common/ColorSchemeToggle';
import { Label } from '~/client/common/Label';
import { useLabel } from '~/client/hooks/useLabel';
import { Links } from '~/client/Links';
import { ExportMenuItem } from '~/client/toolbar/items/ExportMenuItem';
import { ImportMenuItem } from '~/client/toolbar/items/ImportMenuItem';
import { ReviewMenuItem } from '~/client/toolbar/items/ReviewMenuItem';
import { ToolbarMenuIcon } from '~/client/toolbar/ToolbarMenuIcon';

import './ToolbarMenu.pcss';

export function ToolbarMenu() {
    const [opened, { toggle, close }] = useDisclosure();

    const [burgerAbove, setBurgerAbove] = useState(false);
    const handleToggle = useCallback(() => {
        if (!opened) {
            setBurgerAbove(true);
        }
        toggle();
    }, [opened, toggle]);

    const { search } = useLocation();
    const to = useCallback((path: string) => ({ pathname: path, search }), [search]);

    return (
        <>
            <Portal>
                <Box className="burger" style={{ zIndex: burgerAbove ? 300 : 100 }}>
                    <Burger size="sm" opened={opened} onClick={handleToggle} aria-label={useLabel('Menu')} />
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
                                    <IconList />
                                </ToolbarMenuIcon>
                            }
                            component={Link}
                            to={to(Links.PRODUCTS)}
                            active={!!useMatch(Links.PRODUCTS)}
                            onClick={close}
                        />
                        <NavLink
                            label={<Label>Summary</Label>}
                            leftSection={
                                <ToolbarMenuIcon>
                                    <IconChartColumn />
                                </ToolbarMenuIcon>
                            }
                            component={Link}
                            to={to(Links.SUMMARY)}
                            active={!!useMatch(Links.SUMMARY)}
                            onClick={close}
                        />
                        <ReviewMenuItem onClick={close} />
                        <Divider m="xs" />

                        <NavLink
                            label={<Label>Variants</Label>}
                            leftSection={
                                <ToolbarMenuIcon>
                                    <IconChartBubble />
                                </ToolbarMenuIcon>
                            }
                            component={Link}
                            to={to(Links.VARIANTS)}
                            active={!!useMatch(Links.VARIANTS)}
                            onClick={close}
                        />
                        <NavLink
                            label={<Label>Categories</Label>}
                            leftSection={
                                <ToolbarMenuIcon>
                                    <IconTriangleSquareCircle />
                                </ToolbarMenuIcon>
                            }
                            component={Link}
                            to={to(Links.CATEGORIES)}
                            active={!!useMatch(Links.CATEGORIES)}
                            onClick={close}
                        />

                        <Divider m="xs" />

                        <NavLink
                            label={<Label>Utilities</Label>}
                            leftSection={
                                <ToolbarMenuIcon>
                                    <IconAdjustmentsUp />
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
                        <ColorSchemeToggle />
                    </Box>
                </Flex>
            </Drawer>
        </>
    );
}
