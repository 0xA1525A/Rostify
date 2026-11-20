import { Result } from "@lib:templates/result";

import type { StaffAvailability } from "@model:staff";
import type { Shift } from "@model:shifts";

import {
    checkAvailabilityCoversShift,
    checkAvailabilityConstraints,
    checkOvertimeAllowed,
    checkShiftTransition,
    checkShiftRelationConstraints
} from "@service:business/rosterer/constraints";
import { computeLoadProfiles } from "@service:business/rosterer/load";
import type {
    PendingPunch,
    RosterConstraint,
    RosterGenerationInput,
    RosterGenerationOutput
} from "@service:business/rosterer/types";
import { Option } from "@lib:types/option";

const DEFAULT_FAIRNESS_TOLERANCE: number = 0.05;
const MIN_REST_HOURS: number = 11;
const MAX_CONSECUTIVE_DAYS: number = 6;
const DAY_NAMES: ReadonlyArray<string> = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function dayOf(date: string): string {
    return DAY_NAMES[new Date(`${ date }T00:00:00Z`).getUTCDay()] ?? "";
}

export function rosterRecordKey(date: string, staffID: string): string {
    return `${ date }|${ staffID }`;
}

function addDays(date: string, days: number): string {
    const value: Date = new Date(`${ date }T00:00:00Z`);

    value.setUTCDate(value.getUTCDate() + days);

    return value.toISOString().slice(0, 10);
}

function timestampAt(date: string, time: string): string {
    const value: Date = new Date(`${ date }T00:00:00Z`);
    const parts: Array<string> = time.split(":");
    const hours: number = Number(parts[0] ?? 0);
    const minutes: number = Number(parts[1] ?? 0);

    value.setUTCHours(hours, minutes, 0, 0);

    return value.toISOString();
}

function shiftDurationHours(shift: Shift): number {
    const parts: Array<string> = shift.fromTime.split(":");
    const toParts: Array<string> = shift.toTime.split(":");
    const fromMinutes: number = Number(parts[0] ?? 0) * 60 + Number(parts[1] ?? 0);
    let toMinutes: number = Number(toParts[0] ?? 0) * 60 + Number(toParts[1] ?? 0);

    if (toMinutes <= fromMinutes) {
        toMinutes += 24 * 60;
    }

    return (toMinutes - fromMinutes) / 60;
}

function shiftStartTimestamp(date: string, shift: Shift): number {
    return new Date(timestampAt(date, shift.fromTime)).getTime();
}

function shiftEndTimestamp(date: string, shift: Shift): number {
    return new Date(timestampAt(addDays(date, shift.isOvernight ? 1 : 0), shift.toTime)).getTime();
}

function consecutiveWorkedDays(
    input: RosterGenerationInput,
    staffID: string,
    previousDate: string
): number {
    const datesWorked: Set<string> = new Set<string>();

    for (const record of input.previousRecords) {
        if (record.staffID === staffID && record.date <= previousDate) {
            datesWorked.add(record.date);
        }
    }

    let consecutive: number = 0;
    let cursor: string = previousDate;

    while (datesWorked.has(cursor)) {
        consecutive += 1;
        cursor = addDays(cursor, -1);
    }

    return consecutive;
}

function pushPunch(
    punches: Array<PendingPunch>,
    recordKey: string,
    dateTime: string,
    clockEvent: "in" | "out"
): void {
    punches.push({ recordKey: recordKey, dateTime: dateTime, clockEvent: clockEvent });
}

export function planPunches(
    recordKey: string,
    date: string,
    shift: Shift,
    availability: StaffAvailability
): Array<PendingPunch> {
    const punches: Array<PendingPunch> = [];
    const start: string = timestampAt(date, shift.fromTime);
    const end: string = timestampAt(addDays(date, shift.isOvernight ? 1 : 0), shift.toTime);
    const startMs: number = new Date(start).getTime();
    const endMs: number = new Date(end).getTime();
    const totalMinutes: number = (endMs - startMs) / 60_000;

    pushPunch(punches, recordKey, start, "in");

    let breakCount: number = availability.okMultipleBreak ? 2 : 1;
    let breakMinutes: number = (availability.preferredBreakHour ?? 1) * 60;

    while (breakCount > 0 && totalMinutes <= breakCount * breakMinutes * 2) {
        if (breakCount > 1) {
            breakCount -= 1;
            continue;
        }

        breakMinutes = Math.floor(totalMinutes / 3);

        if (breakMinutes <= 0) {
            breakCount = 0;
        }

        break;
    }

    const workMinutes: number = (totalMinutes - breakCount * breakMinutes) / (breakCount + 1);
    let cursor: number = startMs;

    for (let index = 0; index < breakCount; index += 1) {
        cursor += workMinutes * 60_000;
        pushPunch(punches, recordKey, new Date(cursor).toISOString(), "out");
        cursor += breakMinutes * 60_000;
        pushPunch(punches, recordKey, new Date(cursor).toISOString(), "in");
    }

    pushPunch(punches, recordKey, end, "out");

    return punches;
}

function eligibleShifts(
    availability: StaffAvailability,
    input: RosterGenerationInput,
    previousShift: Option<Shift>,
    previousDate: string,
    consecutiveDays: number,
    constraints: Array<RosterConstraint>
): Array<Shift> {
    const eligible: Array<Shift> = [];
    const excludedShifts: Set<number> = new Set<number>();

    for (const relation of input.shiftRelations) {
        if (relation.staffID === availability.staffID && relation.proficiency === 0) {
            excludedShifts.add(relation.shiftID);
        }
    }

    if (consecutiveDays >= MAX_CONSECUTIVE_DAYS) {
        constraints.push({
            code   : "too-many-consecutive-days",
            message: `Staff member has already worked ${ consecutiveDays } consecutive days.`,
            staffID: availability.staffID
        });

        return eligible;
    }

    for (const shift of input.shifts) {
        if (excludedShifts.has(shift.id)) {
            continue;
        }

        const blocking: Array<RosterConstraint> = [
            ...checkShiftTransition(previousShift, shift, availability.staffID),
            ...checkAvailabilityCoversShift(availability, shift),
            ...checkOvertimeAllowed(availability, shift)
        ];

        if (previousShift !== undefined) {
            const restHours: number =
                (shiftStartTimestamp(input.date, shift) - shiftEndTimestamp(previousDate, previousShift)) / 3_600_000;

            if (restHours < MIN_REST_HOURS) {
                blocking.push({
                    code   : "insufficient-rest",
                    message: `Only ${ restHours.toFixed(1) } hours rest between consecutive shifts.`,
                    staffID: availability.staffID
                });
            }
        }

        if (blocking.length !== 0) {
            constraints.push(...blocking);
            continue;
        }

        eligible.push(shift);
    }

    return eligible;
}

function scoreShift(
    shift: Shift,
    availability: StaffAvailability,
    input: RosterGenerationInput,
    loadDirection: { physical: number, mental: number, hours: number },
    random: () => number
): number {
    const relation = input.shiftRelations.find(
        (item): boolean => item.staffID === availability.staffID && item.shiftID === shift.id
    );

    const preference: number = relation?.preference ?? 3;
    const proficiency: number = relation?.proficiency ?? 3;
    const hours: number = shiftDurationHours(shift);
    const loadFit: number =
        (loadDirection.physical + loadDirection.mental) * hours +
        loadDirection.hours * hours * 5;
    const preferredShift: number = availability.preferredShift === shift.name ? 15 : 0;

    return preference * 10 + proficiency * 3 + loadFit + preferredShift + random() / 1000;
}

export function generateRoster(input: RosterGenerationInput): Result<RosterGenerationOutput> {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(input.date)) {
        return new Result<RosterGenerationOutput>(false, null);
    }

    const tolerance: number = input.fairnessTolerance ?? DEFAULT_FAIRNESS_TOLERANCE;
    const random: () => number = input.random ?? Math.random;
    const analysis = computeLoadProfiles(input.history, tolerance);
    const constraints: Array<RosterConstraint> = [];
    const records: Array<Omit<import("@model:rosters").RosterRecord, "id">> = [];
    const punches: Array<PendingPunch> = [];
    const previousDate: string = addDays(input.date, -1);
    const targetDay: string = dayOf(input.date);
    const isHoliday: boolean = input.isHoliday ?? false;

    const dayShifts: Array<Shift> = input.shifts.filter(
        (shift): boolean => shift.day === targetDay && shift.isHoliday === isHoliday
    );
    const shifts: Array<Shift> = dayShifts.length !== 0 ? dayShifts : input.shifts;

    const previousByStaff: Map<string, Shift> = new Map<string, Shift>();

    for (const record of input.previousRecords) {
        if (record.date === previousDate) {
            previousByStaff.set(record.staffID, record.shift);
        }
    }

    const seenStaff: Set<string> = new Set<string>();

    for (const availability of input.availabilities) {
        if (availability.date !== input.date || seenStaff.has(availability.staffID)) {
            continue;
        }

        seenStaff.add(availability.staffID);

        constraints.push(...checkAvailabilityConstraints(availability));

        const relationConstraints: Array<RosterConstraint> = input.shiftRelations
            .filter((relation): boolean => relation.staffID === availability.staffID)
            .flatMap((relation): Array<RosterConstraint> => checkShiftRelationConstraints(relation));

        constraints.push(...relationConstraints);

        const previousShift: Option<Shift> = previousByStaff.get(availability.staffID);
        const consecutiveDays: number = consecutiveWorkedDays(input, availability.staffID, previousDate);
        const candidates: Array<Shift> = eligibleShifts(
            availability,
            { ...input, shifts: shifts },
            previousShift,
            previousDate,
            consecutiveDays,
            constraints
        );

        if (candidates.length === 0) {
            constraints.push({
                code   : "incomplete-availability",
                message: "No eligible shift exists for this staff member on the requested date.",
                staffID: availability.staffID
            });
            continue;
        }

        const direction = analysis.directions.get(availability.staffID) ?? { physical: 0, mental: 0, risk: 0, hours: 0 };

        let bestShift: Shift = candidates[0];
        let bestScore: number = Number.NEGATIVE_INFINITY;

        for (const shift of candidates) {
            const score: number = scoreShift(shift, availability, input, direction, random);

            if (score > bestScore) {
                bestScore = score;
                bestShift = shift;
            }
        }

        const recordKey: string = rosterRecordKey(input.date, availability.staffID);

        records.push({
            date   : input.date,
            staffID: availability.staffID,
            shiftID: bestShift.id
        });

        punches.push(...planPunches(recordKey, input.date, bestShift, availability));
    }

    const output: RosterGenerationOutput = {
        records     : records,
        punches     : punches,
        loadProfiles: analysis.profiles,
        constraints : constraints
    };

    return new Result<RosterGenerationOutput>(true, output);
}
