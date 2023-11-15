import { isEqual } from 'lodash';
import React, { memo } from 'react';
import { useProfile } from '~/state/profile/useProfile';
import './ProfileAvatar.less';

export default memo(function ProfileAvatar() {
    const profile = useProfile();
    const name = profile?.name ?? [profile?.given_name ?? '', profile?.family_name ?? ''].filter(Boolean).join(' ');
    return name ? (
        <div className="Avatar">
            {profile.picture ? (
                <img className="picture" src={profile.picture} alt={name} />
            ) : (
                <div className="letters" aria-label={name}>
                    {name
                        .split(' ', 2)
                        .map(([letter]) => letter)
                        .join('')}
                </div>
            )}
        </div>
    ) : null;
}, isEqual);
