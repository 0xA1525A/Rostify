import { Type, Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

export const BasicPositionInfo = {
    id          : Type.Number(),
    unitID      : Type.Number(),
    unitName    : Type.Optional(Type.String()),
    name        : Type.String({ minLength: 1, maxLength: 25 }),
    description : Type.String({ minLength: 0, maxLength: 200 }),
};

export const PositionPreviewSchema = Type.Object(BasicPositionInfo);

export const PositionSchema = Type.Object({
    ...BasicPositionInfo,
    physicalLoad: Type.Integer({ minimum: 0, maximum: 5 }),
    mentalLoad  : Type.Integer({ minimum: 0, maximum: 5 }),
    riskLevel   : Type.Integer({ minimum: 0, maximum: 5 }),
    minimumStaff: Type.Integer({ minimum: 0 }),
    targetStaff : Type.Integer({ minimum: 0 }),
    maximumStaff: Type.Integer({ minimum: 0 }),
    minimumSumProficiency: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    targetSumProficiency : Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    maximumSumProficiency: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    isPrioritisingStaffAmount: Type.Boolean()
});

export type PositionPreview = Static<typeof PositionPreviewSchema>
export type Position        = Static<typeof PositionSchema>;

const checkPositionPreview = TypeCompiler.Compile(PositionPreviewSchema);
const checkPosition        = TypeCompiler.Compile(PositionSchema);

export const validatePositionPreview: (v: unknown) => v is PositionPreview = (v: unknown): v is PositionPreview => checkPositionPreview.Check(v);
export const validatePosition       : (v: unknown) => v is Position        = (v: unknown): v is Position        => checkPosition.Check(v);