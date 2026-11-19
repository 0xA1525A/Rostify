import { Type, Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

export const PositionConflictSchema = Type.Object({
    positionAID       : Type.Integer({ minimum: 1 }),
    positionBID       : Type.Integer({ minimum: 1 }),
    conflictDurationHr: Type.Integer({ minimum: 1 }),
    severity          : Type.Integer({ minimum: 0, maximum: 5 })
});

export type PositionConflict = Static<typeof PositionConflictSchema>;

const checkPositionConflict = TypeCompiler.Compile(PositionConflictSchema);

export const validatePositionConflict: (v: unknown) => v is PositionConflict = (v: unknown): v is PositionConflict => checkPositionConflict.Check(v);
