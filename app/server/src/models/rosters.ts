import { Type, Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

export const ClockEventSchema = Type.Union([
    Type.Literal("in"),
    Type.Literal("out")
]);

export const RosterRecordSchema = Type.Object({
    id     : Type.Integer(),
    date   : Type.String({ format: "date" }),
    staffID: Type.String({ format: "uuid" }),
    shiftID: Type.Integer()
});

export const RosterPunchSchema = Type.Object({
    rosterRecordID: Type.Integer(),
    dateTime      : Type.String({ format: "date-time" }),
    clockEvent    : ClockEventSchema
});

export const DailyRosterEntrySchema = Type.Object({
    id       : Type.Integer(),
    date     : Type.String({ format: "date" }),
    staff_id : Type.String({ format: "uuid" }),
    shift    : Type.String({ minLength: 1 })
});

export type ClockEvent       = Static<typeof ClockEventSchema>;
export type RosterRecord     = Static<typeof RosterRecordSchema>;
export type RosterPunch      = Static<typeof RosterPunchSchema>;
export type DailyRosterEntry = Static<typeof DailyRosterEntrySchema>;

const checkRosterRecord = TypeCompiler.Compile(RosterRecordSchema);
const checkRosterPunch  = TypeCompiler.Compile(RosterPunchSchema);

export const validateRosterRecord: (v: unknown) => v is RosterRecord = (v: unknown): v is RosterRecord => checkRosterRecord.Check(v);
export const validateRosterPunch : (v: unknown) => v is RosterPunch  = (v: unknown): v is RosterPunch  => checkRosterPunch.Check(v);
