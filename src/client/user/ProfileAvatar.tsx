import { isEqual } from 'lodash';
import React, { memo } from 'react';
import useProfile from '~/store/profile/useProfile';
import cx from './ProfileAvatar.less';

export default memo(function ProfileAvatar() {
    const profile = useProfile();
    return (
        <div className={cx('Avatar')}>
            {profile?.picture ? (
                <img className={cx('picture')} src={profile?.picture} alt={profile?.name} />
            ) : (
                <div className={cx('letters')}>
                    {profile?.name
                        ?.split(' ', 2)
                        .map((name) => name[0])
                        .join('')}
                </div>
            )}
        </div>
    );
}, isEqual);
