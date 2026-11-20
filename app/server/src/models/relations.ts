import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import {
    compileSchema,
    DateSchema,
    DateTimeSchema,
    PositiveIntegerSchema,
    RatingSchema,
    UUIDSchema
} from "@model:common";
import { AccountStatusSchema } from "@model:logins";
import { StaffPrivilegeSchema } from "@model:staff";

export const StaffShiftRelationSchema = Type.Object({
    staffID   : UUIDSchema,
    shiftID   : PositiveIntegerSchema,
    preference: RatingSchema,
    proficiency: RatingSchema
});

export const StaffPositionRelationSchema = Type.Object({
    staffID   : UUIDSchema,
    positionID: PositiveIntegerSchema,
    preference: RatingSchema,
    proficiency: RatingSchema
});

export const StaffPeerRelationSchema = Type.Object({
    staffAID  : UUIDSchema,
    staffBID  : UUIDSchema,
    preference: RatingSchema
});

export const LoginPreviewSchema = Type.Object({
    staffID: UUIDSchema,
    username: Type.String({ minLength: 1, maxLength: 20, pattern: "^[a-z0-9._\\-]+$" }),
    status : AccountStatusSchema
});

export const SessionPrincipalSchema = Type.Object({
    id       : UUIDSchema,
    privilege: StaffPrivilegeSchema
});

export const StaffWorkInfoSchema = Type.Object({
    id        : UUIDSchema,
    isFullTime: Type.Boolean()
});

export const StaffNameSchema = Type.Object({
    firstName: Type.String({ minLength: 1, maxLength: 25 }),
    lastName : Type.String({ minLength: 1, maxLength: 50 })
});

export const HistoricalLoadRowSchema = Type.Object({
    staffID     : UUIDSchema,
    date        : DateSchema,
    physicalLoad: RatingSchema,
    mentalLoad  : RatingSchema,
    riskLevel   : RatingSchema,
    hours       : Type.Number({ minimum: 0 })
});

export const HistoricalPositionRowSchema = Type.Object({
    staffID   : UUIDSchema,
    dateTime  : DateTimeSchema,
    positionID: PositiveIntegerSchema
});

export type StaffShiftRelation    = Static<typeof StaffShiftRelationSchema>;
export type StaffPositionRelation = Static<typeof StaffPositionRelationSchema>;
export type StaffPeerRelation     = Static<typeof StaffPeerRelationSchema>;
export type LoginPreview          = Static<typeof LoginPreviewSchema>;
export type SessionPrincipal      = Static<typeof SessionPrincipalSchema>;
export type StaffWorkInfo         = Static<typeof StaffWorkInfoSchema>;
export type StaffName             = Static<typeof StaffNameSchema>;
export type HistoricalLoadRow     = Static<typeof HistoricalLoadRowSchema>;
export type HistoricalPositionRow = Static<typeof HistoricalPositionRowSchema>;

const checkStaffShiftRelation    = compileSchema(StaffShiftRelationSchema);
const checkStaffPositionRelation = compileSchema(StaffPositionRelationSchema);
const checkStaffPeerRelation     = compileSchema(StaffPeerRelationSchema);
const checkLoginPreview          = compileSchema(LoginPreviewSchema);
const checkSessionPrincipal      = compileSchema(SessionPrincipalSchema);
const checkStaffWorkInfo         = compileSchema(StaffWorkInfoSchema);
const checkStaffName             = compileSchema(StaffNameSchema);
const checkHistoricalLoadRow     = compileSchema(HistoricalLoadRowSchema);
const checkHistoricalPositionRow = compileSchema(HistoricalPositionRowSchema);

export const validateStaffShiftRelation = (value: unknown): value is StaffShiftRelation => checkStaffShiftRelation.Check(value);
export const validateStaffPositionRelation = (value: unknown): value is StaffPositionRelation => checkStaffPositionRelation.Check(value);

export const validateStaffPeerRelation = (value: unknown): value is StaffPeerRelation => {
    if (!checkStaffPeerRelation.Check(value)) {
        return false;
    }

    return value.staffAID !== value.staffBID;
};

export const validateLoginPreview     = (value: unknown): value is LoginPreview     => checkLoginPreview.Check(value);
export const validateSessionPrincipal = (value: unknown): value is SessionPrincipal => checkSessionPrincipal.Check(value);
export const validateStaffWorkInfo    = (value: unknown): value is StaffWorkInfo    => checkStaffWorkInfo.Check(value);
export const validateStaffName        = (value: unknown): value is StaffName        => checkStaffName.Check(value);
export const validateHistoricalLoadRow = (value: unknown): value is HistoricalLoadRow => checkHistoricalLoadRow.Check(value);
export const validateHistoricalPositionRow = (value: unknown): value is HistoricalPositionRow => checkHistoricalPositionRow.Check(value);
