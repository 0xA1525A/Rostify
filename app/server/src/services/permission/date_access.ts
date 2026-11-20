import type { StaffPrivilege } from "@model:staff";

export type RosterDateAction = "generate" | "move" | "delete";

export type DateAccessDecision = {
    allowed: boolean,
    message: string
};

export function today(): string {
    const now: Date = new Date();
    const local: Date = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);

    return local.toISOString().slice(0, 10);
}

export function addDaysUTC(date: string, days: number): string {
    const value: Date = new Date(`${ date }T00:00:00Z`);

    value.setUTCDate(value.getUTCDate() + days);

    return value.toISOString().slice(0, 10);
}

export function checkDateAccess(
    privilege: StaffPrivilege,
    date     : string,
    action   : RosterDateAction
): DateAccessDecision {
    const isPast: boolean = date < today();
    const isAdmin: boolean = privilege === "admin";

    if (isPast) {
        if (action === "delete" && isAdmin) {
            return { allowed: true, message: "" };
        }

        return {
            allowed: false,
            message: action === "delete"
                ? "Only administrators can delete past rosters or schedules."
                : "Past rosters and schedules are read-only."
        };
    }

    return { allowed: true, message: "" };
}

export function requiresPriorDay(date: string): boolean {
    return date > today();
}
