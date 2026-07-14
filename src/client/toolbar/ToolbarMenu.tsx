import { Box, Burger, Divider, Drawer, Flex, NavLink, Portal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconAdjustmentsUp,
    IconChartBubble,
    IconChartColumn,
    IconList,
    IconTriangleSquareCircle,
} from '@tabler/icons-react';
import React, { useCallback } from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';

import { ColorSchemeToggle } from '~/client/common/ColorSchemeToggle';
import { Label } from '~/client/common/Label';
import { useLabel } from '~/client/hooks/useLabel';
import { Links } from '~/client/Links';
import { ExportMenuItem } from '~/client/toolbar/items/ExportMenuItem';
import { ImportMenuItem } from '~/client/toolbar/items/ImportMenuItem';
import { ToolbarMenuIcon } from '~/client/toolbar/ToolbarMenuIcon';

import './ToolbarMenu.pcss';

export function ToolbarMenu() {
    const [opened, { toggle, close }] = useDisclosure();
    const { search } = useLocation();

    const to = useCallback((path: string) => ({ pathname: path, search }), [search]);

    return (
        <>
            <Portal>
                <Box className="burger">
                    <Burger size="sm" opened={opened} onClick={toggle} aria-label={useLabel('Menu')} />
                </Box>
            </Portal>
            <Drawer
                role="menu"
                opened={opened}
                onClose={close}
                position="left"
                withCloseButton={false}
                className="drawer"
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
                        <Divider m="xs" />

                        <NavLink
                            label={<Label>Groups</Label>}
                            leftSection={
                                <ToolbarMenuIcon>
                                    <IconTriangleSquareCircle />
                                </ToolbarMenuIcon>
                            }
                            component={Link}
                            to={to(Links.GROUPS)}
                            active={!!useMatch(Links.GROUPS)}
                            onClick={close}
                        />
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
