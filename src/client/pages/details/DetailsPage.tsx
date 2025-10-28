import React from 'react';

import { SwipeControls } from '~/client/common/SwipeControls';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
import { Page } from '~/client/pages/common/Page';
import { ActiveDetailsBox } from '~/client/pages/details/ActiveDetailsBox';
import { ActiveValueBox } from '~/client/pages/details/ActiveValueBox';
import { DetailsTable } from '~/client/pages/details/DetailsTable';
import { MissingOnlyWrapper } from '~/client/pages/details/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/pages/details/MissingOnlyEffects';
import { UpdatingDetailsWrapper } from '~/client/pages/details/UpdatingDetailsContext';
import { useDeleteDetails } from '~/client/state/details/useDeleteDetails';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import type { Details } from '~/types/data';

export function DetailsPage() {
    const deleteDetails = useDeleteDetails();
    const handleDelete = ({ group, name }: Details) => deleteDetails(group, name);

    return (
        <GroupFilterWrapper>
            <QuickFilterWrapper>
                <UpdatingDetailsWrapper>
                    <Page withAdd toolbar={<ToolbarGroupFilter />} onDelete={handleDelete}>
                        <SwipeControlsWrapper>
                            <MissingOnlyWrapper>
                                <MissingOnlyEffects />
                                <DetailsTable />
                            </MissingOnlyWrapper>
                            <SwipeControls />
                        </SwipeControlsWrapper>
                        <ActiveDetailsBox />
                        <ActiveValueBox />
                    </Page>
                </UpdatingDetailsWrapper>
            </QuickFilterWrapper>
        </GroupFilterWrapper>
    );
}
