import SmartToyIcon from '@assets/smart-toy.svg';
import React from 'react';
import { DEV_MODE_SUB, useProfile } from '~/state/profile/useProfile';
import cx from './ProfileAvatar.less';

export function ProfileAvatar() {
    const profile = useProfile();
    const name = profile?.name ?? [profile?.given_name ?? '', profile?.family_name ?? ''].filter(Boolean).join(' ');
    return name ? (
        <div className={cx('Avatar')}>
            {profile.picture ? (
                <img className={cx('picture')} src={profile.picture} alt={name} />
            ) : profile.dev || profile.sub === DEV_MODE_SUB ? (
                <div className={cx('robot')}>
                    <SmartToyIcon />
                </div>
            ) : (
                <div className={cx('letters')} aria-label={name}>
                    {name
                        .split(' ', 2)
                        .map(([letter]) => letter)
                        .join('')}
                </div>
            )}
        </div>
    ) : null;
}
