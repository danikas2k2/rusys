export function usePathname(): string {
    return window.location.pathname;
}

export function useRouter() {
    return { refresh() {} };
}

export function useSearchParams(): URLSearchParams {
    return new URLSearchParams(window.location.search);
}
