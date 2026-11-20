import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import { compileSchema, DescriptionSchema, PositiveIntegerSchema } from "@model:common";

export const UnitWorkingAreaSchema = Type.Union([
    Type.Literal("boh"),
    Type.Literal("foh"),
    Type.Literal("office"),
    Type.Literal("out")
]);

export const UnitSchema = Type.Object({
    id          : PositiveIntegerSchema,
    name        : Type.String({ minLength: 1, maxLength: 25 }),
    description : DescriptionSchema,
    workingArea : UnitWorkingAreaSchema
});

export type UnitWorkingArea = Static<typeof UnitWorkingAreaSchema>;
export type Unit            = Static<typeof UnitSchema>;

const checkUnitWorkingArea = compileSchema(UnitWorkingAreaSchema);
const checkUnit            = compileSchema(UnitSchema);

export const validateUnitWorkingArea = (value: unknown): value is UnitWorkingArea => checkUnitWorkingArea.Check(value);
export const validateUnit            = (value: unknown): value is Unit            => checkUnit.Check(value);
