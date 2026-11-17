import type { Nullable } from "@lib:types/nullable";

export function getClientSessionToken(headers: any): Nullable<string> {
    return headers?.["x-rostify-session-token"] ?? null;
}