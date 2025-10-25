import React, { cloneElement, isValidElement, useCallback, type ReactElement } from 'react';
import { Link, useMatch } from 'react-router-dom';

import { Box, Burger, Divider, Drawer, Flex, NavLink, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconChartBubble,
    IconChartColumn,
    IconCirclePlus,
    IconDownload,
    IconList,
    IconTriangleSquareCircle,
    IconUpload,
} from '@tabler/icons-react';

import { ColorSchemeToggle } from '@ui/ColorSchemeToggle';

import { ImportBox } from '~/client/common/dialogs/ImportBox';
import { useExportHandler } from '~/client/common/hooks/useExportHandler';
import { Label } from '~/client/common/Label';
import { useLabel } from '~/client/hooks/useLabel';
import { Links } from '~/client/Links';

export interface ToolbarMenuProps {
    /** @deprecated */
    addBox?: ReactElement<{ onClose?: () => void }>;
}

export function ToolbarMenu({ addBox }: ToolbarMenuProps) {
    const [opened, { toggle, close }] = useDisclosure();
    const burger = <Burger size="sm" opened={opened} onClick={toggle} aria-label={useLabel('Menu')} />;

    const [addBoxOpened, { open: openAddBox, close: closeAddBox }] = useDisclosure();
    const onAddClick = useCallback(() => {
        close();
        openAddBox();
    }, [close, openAddBox]);

    const [importOpened, { open: openImport, close: closeImport }] = useDisclosure();
    const handleImportClick = useCallback(() => {
        close();
        openImport();
    }, [close, openImport]);

    const handleExport = useExportHandler();
    const handleExportClick = useCallback(async () => {
        close();
        await handleExport();
    }, [close, handleExport]);

    const hasAddBox = isValidElement(addBox);
    return (
        <>
            {burger}
            <Drawer
                role="menu"
                opened={opened}
                onClose={close}
                position="left"
                withCloseButton={false}
                overlayProps={{ opacity: 0.2, blur: 2 }}
                styles={{ body: { padding: 0 }, content: { padding: 0, flexBasis: 'min(300px,60vw)' } }}
            >
                <Flex direction="column" h="100vh" style={{ padding: 0 }}>
                    <Box style={{ padding: '10px 6px' }}>{burger}</Box>
                    <Box>
                        {hasAddBox && (
                            <>
                                <NavLink
                                    label={<Label>Add</Label>}
                                    leftSection={
                                        <ThemeIcon color="green" variant="white">
                                            <IconCirclePlus />
                                        </ThemeIcon>
                                    }
                                    onClick={onAddClick}
                                />
                                <Divider m="xs" />
                            </>
                        )}
                        <NavLink
                            label={<Label>List</Label>}
                            leftSection={
                                <ThemeIcon color="blue" variant="white">
                                    <IconList />
                                </ThemeIcon>
                            }
                            component={Link}
                            to={Links.DETAILS}
                            active={!!useMatch(Links.DETAILS)}
                        />
                        <NavLink
                            label={<Label>Statistics</Label>}
                            leftSection={
                                <ThemeIcon color="blue" variant="white">
                                    <IconChartColumn />
                                </ThemeIcon>
                            }
                            component={Link}
                            to={Links.SUMMARY}
                            active={!!useMatch(Links.SUMMARY)}
                        />
                        <Divider m="xs" />
                        <NavLink
                            label={<Label>Groups</Label>}
                            leftSection={
                                <ThemeIcon color="black" variant="white">
                                    <IconTriangleSquareCircle />
                                </ThemeIcon>
                            }
                            component={Link}
                            to={Links.GROUPS}
                            active={!!useMatch(Links.GROUPS)}
                        />
                        <NavLink
                            label={<Label>Variants</Label>}
                            leftSection={
                                <ThemeIcon color="black" variant="white">
                                    <IconChartBubble />
                                </ThemeIcon>
                            }
                            component={Link}
                            to={Links.VARIANTS}
                            active={!!useMatch(Links.VARIANTS)}
                        />
                        <Divider m="xs" />
                        <NavLink
                            label={<Label>Export</Label>}
                            leftSection={
                                <ThemeIcon color="black" variant="white">
                                    <IconUpload />
                                </ThemeIcon>
                            }
                            onClick={handleExportClick}
                        />
                        <NavLink
                            label={<Label>Import</Label>}
                            leftSection={
                                <ThemeIcon color="black" variant="white">
                                    <IconDownload />
                                </ThemeIcon>
                            }
                            onClick={handleImportClick}
                        />
                    </Box>
                    <Box mt="auto" mb="xs">
                        <ColorSchemeToggle />
                    </Box>
                </Flex>
            </Drawer>

            {/* TODO move boxes out of menu */}

            {hasAddBox &&
                addBoxOpened &&
                cloneElement(addBox, {
                    onClose: closeAddBox,
                })}

            {importOpened && <ImportBox onClose={closeImport} />}
        </>
    );
}
