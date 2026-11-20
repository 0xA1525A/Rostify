import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import { compileSchema, DateTimeSchema, PositiveIntegerSchema } from "@model:common";
import { RosterRecordSchema } from "@model:rosters";

export const SchedulePositionSchema = Type.Object({
    rosterRecordID: PositiveIntegerSchema,
    dateTime      : DateTimeSchema,
    positionID    : Type.Union([PositiveIntegerSchema, Type.Null()])
});

export const ScheduleTaskSchema = Type.Object({
    rosterRecordID: PositiveIntegerSchema,
    dateTime      : DateTimeSchema,
    taskID        : PositiveIntegerSchema
});

export const ScheduleSchema = Type.Object({
    record    : RosterRecordSchema,
    positions : Type.Array(SchedulePositionSchema),
    tasks     : Type.Array(ScheduleTaskSchema)
});

export type SchedulePosition = Static<typeof SchedulePositionSchema>;
export type ScheduleTask     = Static<typeof ScheduleTaskSchema>;
export type Schedule         = Static<typeof ScheduleSchema>;

const checkSchedulePosition = compileSchema(SchedulePositionSchema);
const checkScheduleTask     = compileSchema(ScheduleTaskSchema);
const checkSchedule         = compileSchema(ScheduleSchema);

export const validateSchedulePosition = (value: unknown): value is SchedulePosition => checkSchedulePosition.Check(value);
export const validateScheduleTask     = (value: unknown): value is ScheduleTask     => checkScheduleTask.Check(value);
export const validateSchedule         = (value: unknown): value is Schedule         => checkSchedule.Check(value);
