import md5 from 'blueimp-md5';

export function gravatarUrl(email: string, size = 64): string {
    const normalized = email.trim().toLowerCase();
    const hash = md5(normalized);
    // identicon ensures we always get a real image even if no gravatar is set
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}
