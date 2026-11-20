import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import {
    compileSchema,
    DescriptionSchema,
    PositiveIntegerSchema,
    RatingSchema
} from "@model:common";
import { Nullable } from "@lib:types/nullable";

export const BasicPositionInfo = {
    id          : PositiveIntegerSchema,
    unitID      : PositiveIntegerSchema,
    unitName    : Type.Optional(Type.String({ minLength: 1, maxLength: 25 })),
    name        : Type.String({ minLength: 1, maxLength: 25 }),
    description : DescriptionSchema
};

export const PositionPreviewSchema = Type.Object(BasicPositionInfo);

export const PositionSchema = Type.Object({
    ...BasicPositionInfo,
    physicalLoad              : RatingSchema,
    mentalLoad                : RatingSchema,
    riskLevel                 : RatingSchema,
    minimumStaff              : Type.Integer({ minimum: 0 }),
    targetStaff               : Type.Integer({ minimum: 0 }),
    maximumStaff              : Type.Integer({ minimum: 0 }),
    minimumSumProficiency     : Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    targetSumProficiency      : Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    maximumSumProficiency     : Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    isPrioritisingStaffAmount : Type.Boolean()
});

export type PositionPreview = Static<typeof PositionPreviewSchema>;
export type Position        = Static<typeof PositionSchema>;

const checkPositionPreview = compileSchema(PositionPreviewSchema);
const checkPosition        = compileSchema(PositionSchema);

export const validatePositionPreview = (value: unknown): value is PositionPreview => checkPositionPreview.Check(value);

export const validatePosition = (value: unknown): value is Position => {
    if (!checkPosition.Check(value)) {
        return false;
    }

    if (value.targetStaff < value.minimumStaff || value.maximumStaff < value.targetStaff) {
        return false;
    }

    const minimum: Nullable<number> = value.minimumSumProficiency;
    const target : Nullable<number> = value.targetSumProficiency;
    const maximum: Nullable<number> = value.maximumSumProficiency;

    if (minimum !== null && maximum === null) {
        return false;
    }

    if (minimum !== null && maximum !== null && minimum > maximum) {
        return false;
    }

    if (target !== null && minimum !== null && target < minimum) {
        return false;
    }

    if (target !== null && maximum !== null && target > maximum) {
        return false;
    }

    return true;
};