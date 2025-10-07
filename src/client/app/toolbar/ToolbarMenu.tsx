import React, { useCallback, useRef, type FC } from 'react';
import { useLocation } from 'react-router-dom';

import { type DropdownRef } from '@ui/Dropdown';
import { MenuDivider } from '@ui/MenuDivider';

import { ImportBox } from '~/client/app/common/dialogs/ImportBox';
import { type WithOnClose } from '~/client/app/common/WithOnClose';
import { DetailsBox } from '~/client/app/details/dialogs/DetailsBox';
import { GroupBox } from '~/client/app/groups/dialogs/GroupBox';
import { useToggle } from '~/client/app/hooks/useToggle';
import { Links } from '~/client/app/Links';
import { AboutItem } from '~/client/app/toolbar/items/AboutItem';
import { AddMenuItem } from '~/client/app/toolbar/items/AddMenuItem';
import { DetailsItem } from '~/client/app/toolbar/items/DetailsItem';
import { ExportItem } from '~/client/app/toolbar/items/ExportItem';
import { GroupsItem } from '~/client/app/toolbar/items/GroupsItem';
import { ImportItem } from '~/client/app/toolbar/items/ImportItem';
import { SummaryItem } from '~/client/app/toolbar/items/SummaryItem';
import { VariantsItem } from '~/client/app/toolbar/items/VariantsItem';
import { ToolbarMenuWrapper } from '~/client/app/toolbar/ToolbarMenuWrapper';
import { VariantBox } from '~/client/app/variants/dialogs/VariantBox';

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

    const [importOpened, , openImport, closeImport] = useToggle(false);
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
                <AboutItem />
            </ToolbarMenuWrapper>
            {AddBox && addBoxOpened && <AddBox onClose={closeAddBox} />}
            {importOpened && <ImportBox onClose={closeImport} />}
        </>
    );
}
