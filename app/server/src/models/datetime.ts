import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import { compileSchema } from "@model:common";

export const DaySchema = Type.Union([
    Type.Literal("mon"),
    Type.Literal("tue"),
    Type.Literal("wed"),
    Type.Literal("thu"),
    Type.Literal("fri"),
    Type.Literal("sat"),
    Type.Literal("sun")
]);

export type Day = Static<typeof DaySchema>;

const checkDay = compileSchema(DaySchema);

export const validateDay = (value: unknown): value is Day => checkDay.Check(value);
