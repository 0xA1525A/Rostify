import { Type, Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

import { type RosterRecord } from "@model:rosters";

export const SchedulePositionSchema = Type.Object({
    rosterRecordID: Type.Integer(),
    dateTime      : Type.String({ format: "date-time" }),
    positionID    : Type.Union([Type.Integer(), Type.Null()]) // null represents a break
});

export const ScheduleTaskSchema = Type.Object({
    rosterRecordID: Type.Integer(),
    dateTime      : Type.String({ format: "date-time" }),
    taskID        : Type.Integer()
});

export type SchedulePosition = Static<typeof SchedulePositionSchema>;
export type ScheduleTask     = Static<typeof ScheduleTaskSchema>;

export type Schedule = {
    record  : RosterRecord,
    positions: Array<SchedulePosition>,
    tasks   : Array<ScheduleTask>
};

const checkSchedulePosition = TypeCompiler.Compile(SchedulePositionSchema);
const checkScheduleTask     = TypeCompiler.Compile(ScheduleTaskSchema);

export const validateSchedulePosition: (v: unknown) => v is SchedulePosition = (v: unknown): v is SchedulePosition => checkSchedulePosition.Check(v);
export const validateScheduleTask    : (v: unknown) => v is ScheduleTask     = (v: unknown): v is ScheduleTask     => checkScheduleTask.Check(v);
