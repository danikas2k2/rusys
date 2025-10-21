import React, { cloneElement, isValidElement, useCallback, useRef, type ReactElement } from 'react';
import { useLocation } from 'react-router-dom';

import { type DropdownRef } from '@ui/Dropdown';
import { MenuDivider } from '@ui/MenuDivider';

import { ImportBox } from '~/client/common/dialogs/ImportBox';
import { useToggle } from '~/client/hooks/useToggle';
import { Links } from '~/client/Links';
import { AboutItem } from '~/client/toolbar/items/AboutItem';
import { AddMenuItem } from '~/client/toolbar/items/AddMenuItem';
import { DetailsItem } from '~/client/toolbar/items/DetailsItem';
import { ExportItem } from '~/client/toolbar/items/ExportItem';
import { GroupsItem } from '~/client/toolbar/items/GroupsItem';
import { ImportItem } from '~/client/toolbar/items/ImportItem';
import { SummaryItem } from '~/client/toolbar/items/SummaryItem';
import { VariantsItem } from '~/client/toolbar/items/VariantsItem';
import { ToolbarMenuWrapper } from '~/client/toolbar/ToolbarMenuWrapper';

export interface ToolbarMenuProps {
    addBox?: ReactElement<{ onClose?: () => void }>;
}

export function ToolbarMenu({ addBox }: ToolbarMenuProps) {
    const ref = useRef<DropdownRef>(null);
    const hideMenu = useCallback(() => ref.current?.close(), []);

    const [addBoxOpened, , openAddBox, closeAddBox] = useToggle();
    const location = useLocation();
    const link = location.pathname as Links;
    // const AddBox = AddBoxMap[link];
    const onAddClick = useCallback(() => {
        hideMenu();
        openAddBox();
    }, [hideMenu, openAddBox]);

    const [importOpened, , openImport, closeImport] = useToggle(false);
    const onImportClick = useCallback(() => {
        hideMenu();
        openImport();
    }, [hideMenu, openImport]);

    const hasAddBox = isValidElement(addBox);
    return (
        <>
            <ToolbarMenuWrapper ref={ref}>
                {hasAddBox && (
                    <>
                        <AddMenuItem onClick={onAddClick} />
                        <MenuDivider />
                    </>
                )}
                <DetailsItem current={link === Links.DETAILS} />
                <SummaryItem current={link === Links.SUMMARY} />
                <MenuDivider />
                <GroupsItem current={link === Links.GROUPS} />
                <VariantsItem current={link === Links.VARIANTS} />
                <MenuDivider />
                <ExportItem onClick={hideMenu} />
                <ImportItem onClick={onImportClick} />
                <AboutItem />
            </ToolbarMenuWrapper>
            {hasAddBox &&
                addBoxOpened &&
                cloneElement(addBox, {
                    onClose: closeAddBox,
                })}
            {importOpened && <ImportBox onClose={closeImport} />}
        </>
    );
}
