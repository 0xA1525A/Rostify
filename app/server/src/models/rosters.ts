import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import { compileSchema, DateSchema, DateTimeSchema, PositiveIntegerSchema, UUIDSchema } from "@model:common";

export const ClockEventSchema = Type.Union([
    Type.Literal("in"),
    Type.Literal("out")
]);

export const RosterRecordSchema = Type.Object({
    id     : PositiveIntegerSchema,
    date   : DateSchema,
    staffID: UUIDSchema,
    shiftID: PositiveIntegerSchema
});

export const RosterPunchSchema = Type.Object({
    rosterRecordID: PositiveIntegerSchema,
    dateTime      : DateTimeSchema,
    clockEvent    : ClockEventSchema
});

export const DailyRosterEntrySchema = Type.Object({
    id       : PositiveIntegerSchema,
    date     : DateSchema,
    staff_id : UUIDSchema,
    shift    : Type.String({ minLength: 1 })
});

export type ClockEvent       = Static<typeof ClockEventSchema>;
export type RosterRecord     = Static<typeof RosterRecordSchema>;
export type RosterPunch      = Static<typeof RosterPunchSchema>;
export type DailyRosterEntry = Static<typeof DailyRosterEntrySchema>;

const checkClockEvent       = compileSchema(ClockEventSchema);
const checkRosterRecord     = compileSchema(RosterRecordSchema);
const checkRosterPunch      = compileSchema(RosterPunchSchema);
const checkDailyRosterEntry = compileSchema(DailyRosterEntrySchema);

export const validateClockEvent       = (value: unknown): value is ClockEvent       => checkClockEvent.Check(value);
export const validateRosterRecord     = (value: unknown): value is RosterRecord     => checkRosterRecord.Check(value);
export const validateRosterPunch      = (value: unknown): value is RosterPunch      => checkRosterPunch.Check(value);
export const validateDailyRosterEntry = (value: unknown): value is DailyRosterEntry => checkDailyRosterEntry.Check(value);
