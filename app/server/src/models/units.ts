import { Type, Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

export const UnitWorkingAreaSchema = Type.Union([
    Type.Literal("boh"),
    Type.Literal("foh"),
    Type.Literal("office"),
    Type.Literal("out")
]);

export const UnitSchema = Type.Object({
    id          : Type.Number(),
    name        : Type.String({ minLength: 1, maxLength: 25 }),
    description : Type.String({ minLength: 0, maxLength: 200 }),
    workingArea : UnitWorkingAreaSchema
});

export type UnitWorkingArea = Static<typeof UnitWorkingAreaSchema>;
export type Unit = Static<typeof UnitSchema>;

const checkUnitWorkingArea = TypeCompiler.Compile(UnitWorkingAreaSchema);
const checkUnit = TypeCompiler.Compile(UnitSchema);

export const validateUnitWorkingArea: (v: unknown) => v is UnitWorkingArea = (v: unknown): v is UnitWorkingArea => checkUnitWorkingArea.Check(v);
export const validateUnit           : (v: unknown) => v is Unit            = (v: unknown): v is Unit            => checkUnit.Check(v);