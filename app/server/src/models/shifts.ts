import { Type, Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

import { DaySchema } from "@model:datetime";

export const ShiftNameSchema = Type.Union([
    Type.Literal("open"),
    Type.Literal("early"),
    Type.Literal("mid"),
    Type.Literal("late"),
    Type.Literal("close")
]);

export const ShfitSchema = Type.Object({
    id         : Type.Number(),
    day        : DaySchema,
    isHoliday  : Type.Boolean(),
    name       : ShiftNameSchema,
    description: Type.String({ minLength: 0, maxLength: 200 }),
    fromTime   : Type.String({ format: "time" }),
    toTime     : Type.String({ format: "time" }),
    isOvernight: Type.Boolean()
});

export const ShiftSchema = ShfitSchema;

export type ShiftName = Static<typeof ShiftNameSchema>;
export type Shift = Static<typeof ShiftSchema>;

const checkShiftName = TypeCompiler.Compile(ShiftNameSchema);
const checkShift = TypeCompiler.Compile(ShfitSchema);

export const validateShiftName: (v: unknown) => v is ShiftName = (v: unknown): v is ShiftName => checkShiftName.Check(v);
export const validateShift           : (v: unknown) => v is Shift            = (v: unknown): v is Shift            => checkShift.Check(v);