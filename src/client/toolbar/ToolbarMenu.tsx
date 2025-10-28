import React from 'react';
import { Link, useMatch } from 'react-router-dom';

import { Box, Burger, Divider, Drawer, Flex, NavLink, Portal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconAdjustmentsUp,
    IconChartBubble,
    IconChartColumn,
    IconList,
    IconTriangleSquareCircle,
} from '@tabler/icons-react';

import { ColorSchemeToggle } from '~/client/common/ColorSchemeToggle';
import { Label } from '~/client/common/Label';
import { useLabel } from '~/client/hooks/useLabel';
import { Links } from '~/client/Links';
import { ExportMenuItem } from '~/client/toolbar/items/ExportMenuItem';
import { ImportMenuItem } from '~/client/toolbar/items/ImportMenuItem';
import { ToolbarMenuIcon } from '~/client/toolbar/ToolbarMenuIcon';

export function ToolbarMenu() {
    const [opened, { toggle, close }] = useDisclosure();

    const burger = <Burger size="sm" opened={opened} onClick={toggle} aria-label={useLabel('Menu')} />;

    return (
        <>
            <Portal>
                <Box
                    style={{
                        position: 'absolute',
                        top: 10,
                        left: 6,
                        zIndex: 300,
                    }}
                >
                    {burger}
                </Box>
            </Portal>
            <Drawer
                role="menu"
                opened={opened}
                onClose={close}
                position="left"
                withCloseButton={false}
                overlayProps={{ opacity: 0.2, blur: 2 }}
                styles={{ body: { padding: 0 }, content: { padding: 0, flexBasis: 'min(300px,60vw)' } }}
            >
                <Flex direction="column" h="100vh" style={{ padding: '4rem 0 0' }}>
                    <Box>
                        <NavLink
                            label={<Label>Details</Label>}
                            leftSection={
                                <ToolbarMenuIcon>
                                    <IconList />
                                </ToolbarMenuIcon>
                            }
                            component={Link}
                            to={Links.DETAILS}
                            active={!!useMatch(Links.DETAILS)}
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
                            to={Links.SUMMARY}
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
                            to={Links.GROUPS}
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
                            to={Links.VARIANTS}
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
