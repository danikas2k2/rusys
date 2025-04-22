import React, { useCallback, useRef, type FC } from 'react';
import { useLocation } from 'react-router';
import { type DropdownRef } from '@ui/Dropdown';
import { MenuDivider } from '@ui/MenuDivider';
import { ImportBox } from '~/client/common/dialogs/ImportBox';
import { type WithOnClose } from '~/client/common/WithOnClose';
import { DetailsBox } from '~/client/details/dialogs/DetailsBox';
import { GroupBox } from '~/client/groups/dialogs/GroupBox';
import { useToggle } from '~/client/hooks/useToggle';
import { Links } from '~/client/Links';
import { AddMenuItem } from '~/client/toolbar/items/AddMenuItem';
import { DetailsItem } from '~/client/toolbar/items/DetailsItem';
import { ExportItem } from '~/client/toolbar/items/ExportItem';
import { GroupsItem } from '~/client/toolbar/items/GroupsItem';
import { ImportItem } from '~/client/toolbar/items/ImportItem';
import { SummaryItem } from '~/client/toolbar/items/SummaryItem';
import { VariantsItem } from '~/client/toolbar/items/VariantsItem';
import { ToolbarMenuWrapper } from '~/client/toolbar/ToolbarMenuWrapper';
import { VariantBox } from '~/client/variants/dialogs/VariantBox';

const AddBoxMap: Partial<Record<Links, FC<WithOnClose>>> = {
    [Links.DETAILS]: DetailsBox,
    [Links.GROUPS]: GroupBox,
    [Links.VARIANTS]: VariantBox,
};

export function ToolbarMenu() {
    const ref = useRef<DropdownRef>(null);
    const hideMenu = useCallback(() => ref.current?.close(), []);

    const [addBoxOpened, , openAddBox, closeAddBox] = useToggle();
    const location = useLocation();
    const link = location.pathname as Links;
    const AddBox = AddBoxMap[link];
    const onAddClick = useCallback(() => {
        hideMenu();
        openAddBox();
    }, [hideMenu, openAddBox]);

    const [importOpened, , openImport, closeImport] = useToggle(true);
    const onImportClick = useCallback(() => {
        hideMenu();
        openImport();
    }, [hideMenu, openImport]);

    return (
        <>
            <ToolbarMenuWrapper ref={ref}>
                {AddBox && (
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
            </ToolbarMenuWrapper>
            {AddBox && addBoxOpened && <AddBox onClose={closeAddBox} />}
            {importOpened && <ImportBox onClose={closeImport} />}
        </>
    );
}
