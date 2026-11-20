import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import { compileSchema, DescriptionSchema, PositiveIntegerSchema, TimeSchema } from "@model:common";
import { DaySchema } from "@model:datetime";

export const ShiftNameSchema = Type.Union([
    Type.Literal("open"),
    Type.Literal("early"),
    Type.Literal("mid"),
    Type.Literal("late"),
    Type.Literal("close")
]);

export const ShiftSchema = Type.Object({
    id          : PositiveIntegerSchema,
    day         : DaySchema,
    isHoliday   : Type.Boolean(),
    name        : ShiftNameSchema,
    description : DescriptionSchema,
    fromTime    : TimeSchema,
    toTime      : TimeSchema,
    isOvernight : Type.Boolean()
});

export type ShiftName = Static<typeof ShiftNameSchema>;
export type Shift     = Static<typeof ShiftSchema>;

const checkShiftName = compileSchema(ShiftNameSchema);
const checkShift     = compileSchema(ShiftSchema);

function normaliseTime(time: string): string {
    const parts: Array<string> = time.split(":");

    if (parts.length === 2) {
        return `${ parts[0] }:${ parts[1] }:00`;
    }

    return time;
}

export const validateShiftName = (value: unknown): value is ShiftName => checkShiftName.Check(value);

export const validateShift = (value: unknown): value is Shift => {
    if (!checkShift.Check(value)) {
        return false;
    }

    if (value.isOvernight) {
        return true;
    }

    return normaliseTime(value.toTime) > normaliseTime(value.fromTime);
};
