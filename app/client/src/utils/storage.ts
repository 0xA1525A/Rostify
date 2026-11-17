import type { Option } from "../libs/types/option";

export function getItem(key: string): Option<string> {
    if (typeof window === "undefined") {
        return undefined;
    }

    const value: string | null = window.localStorage.getItem(key);

    return value !== null ? value : undefined;
}

export function setItem(key: string, value: string): boolean {
    if (typeof window === "undefined") {
        return undefined;
    }

    try {
        window.localStorage.setItem(key, value);

        return true;
    }
    catch {
        return false;
    }
}

export function updateItem(key: string, value: string): boolean {
    if (getItem(key) === undefined) {
        return false;
    }

    return setItem(key, value);
}

export function deleteItem(key: string): boolean {
    if (getItem(key) === undefined) {
        return false
    };

    try {
        window.localStorage.removeItem(key);

        return true;
    }
    catch {
        return false;
    }
}
