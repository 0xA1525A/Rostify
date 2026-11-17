import { Type, Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

export const DaySchema = Type.Union([
    Type.Literal("sun"),
    Type.Literal("mon"),
    Type.Literal("tue"),
    Type.Literal("wed"),
    Type.Literal("thu"),
    Type.Literal("fri"),
    Type.Literal("sat")
]);

export type Day = Static<typeof DaySchema>;

const checkDay = TypeCompiler.Compile(DaySchema);

export const validateDay  = (v: unknown): v is Day  => checkDay.Check(v);