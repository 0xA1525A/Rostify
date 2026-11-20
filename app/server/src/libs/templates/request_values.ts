export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function toRecord(value: unknown): Record<string, unknown> {
    if (isRecord(value)) {
        return value;
    }

    return {};
}

export function readString(source: Record<string, unknown>, key: string): string | undefined {
    const value: unknown = source[key];

    if (typeof value === "string") {
        return value;
    }

    return undefined;
}

export function readBoolean(source: Record<string, unknown>, key: string): boolean | undefined {
    const value: unknown = source[key];

    if (typeof value === "boolean") {
        return value;
    }

    return undefined;
}

export function readInteger(source: Record<string, unknown>, key: string): number | undefined {
    const value: unknown = source[key];

    if (typeof value === "number" && Number.isInteger(value)) {
        return value;
    }

    return undefined;
}

export function readNullableString(source: Record<string, unknown>, key: string): string | null | undefined {
    const value: unknown = source[key];

    if (value === null || typeof value === "string") {
        return value;
    }

    return undefined;
}

export function readNullableInteger(source: Record<string, unknown>, key: string): number | null | undefined {
    const value: unknown = source[key];

    if (value === null || (typeof value === "number" && Number.isInteger(value))) {
        return value;
    }

    return undefined;
}
