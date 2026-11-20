import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import { compileSchema, PositiveIntegerSchema, RatingSchema } from "@model:common";

export const PositionConflictSchema = Type.Object({
    positionAID       : PositiveIntegerSchema,
    positionBID       : PositiveIntegerSchema,
    conflictDurationHr: PositiveIntegerSchema,
    severity          : RatingSchema
});

export type PositionConflict = Static<typeof PositionConflictSchema>;

const checkPositionConflict = compileSchema(PositionConflictSchema);

export const validatePositionConflict = (value: unknown): value is PositionConflict => {
    if (!checkPositionConflict.Check(value)) {
        return false;
    }

    return value.positionAID !== value.positionBID;
};
