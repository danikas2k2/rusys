import { isEqual } from 'lodash';
import React, { memo } from 'react';
import useProfile from '~/store/profile/useProfile';
import './ProfileAvatar.less';

export default memo(function ProfileAvatar() {
    const profile = useProfile();
    return (
        <div className="Avatar">
            {profile?.picture ? (
                <img className="picture" src={profile?.picture} alt={profile?.name} />
            ) : (
                <div className="letters">
                    {profile?.name
                        ?.split(' ', 2)
                        .map((name) => name[0])
                        .join('')}
                </div>
            )}
        </div>
    );
}, isEqual);
