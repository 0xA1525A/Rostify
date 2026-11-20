import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import {
    compileSchema,
    DateSchema,
    PositiveIntegerSchema,
    TimeSchema,
    UUIDSchema
} from "@model:common";
import { ShiftNameSchema } from "@model:shifts";

export const StaffPrivilegeSchema = Type.Union([
    Type.Literal("admin"),
    Type.Literal("manager"),
    Type.Literal("head"),
    Type.Literal("staff")
]);

export const StaffBasicInfo = {
    id         : UUIDSchema,
    nickname   : Type.String({ minLength: 1, maxLength: 15 }),
    firstName  : Type.String({ minLength: 1, maxLength: 25 }),
    middleName : Type.Union([Type.String({ minLength: 1, maxLength: 25 }), Type.Null()]),
    lastName   : Type.String({ minLength: 1, maxLength: 50 })
};

export const StaffBasicInfoSchema = Type.Object(StaffBasicInfo);

export const StaffSchema = Type.Object({
    ...StaffBasicInfo,
    dateOfBirth: DateSchema,
    isFullTime : Type.Boolean(),
    privilege  : StaffPrivilegeSchema
});

export const StaffPreviewSchema = StaffBasicInfoSchema;

export const StaffContactsSchema = Type.Object({
    tels  : Type.Array(Type.String({ minLength: 1, maxLength: 16, pattern: "^\\+[1-9]\\d{1,14}$" })),
    emails: Type.Array(Type.String({ maxLength: 255, format: "email" }))
});

export const StaffEmailSchema = Type.Object({
    id     : PositiveIntegerSchema,
    staffID: UUIDSchema,
    email  : Type.String({ maxLength: 255, format: "email" })
});

export const StaffTelSchema = Type.Object({
    id     : PositiveIntegerSchema,
    staffID: UUIDSchema,
    tel    : Type.String({ minLength: 1, maxLength: 16, pattern: "^\\+[1-9]\\d{1,14}$" })
});

export const StaffAvailabilitySchema = Type.Object({
    date             : DateSchema,
    staffID          : UUIDSchema,
    fromTime         : Type.Union([TimeSchema, Type.Null()]),
    toTime           : Type.Union([TimeSchema, Type.Null()]),
    toDate           : Type.Union([DateSchema, Type.Null()]),
    isFlexible       : Type.Boolean(),
    okOvertime       : Type.Boolean(),
    okMultipleBreak  : Type.Boolean(),
    okLongBreak      : Type.Boolean(),
    preferredHour    : Type.Union([PositiveIntegerSchema, Type.Null()]),
    preferredBreakHour: Type.Union([PositiveIntegerSchema, Type.Null()]),
    preferredShift   : Type.Union([ShiftNameSchema, Type.Null()])
});

export type Staff            = Static<typeof StaffSchema>;
export type StaffPreview     = Static<typeof StaffPreviewSchema>;
export type StaffBasicInfo   = Static<typeof StaffBasicInfoSchema>;
export type StaffContacts    = Static<typeof StaffContactsSchema>;
export type StaffPrivilege   = Static<typeof StaffPrivilegeSchema>;
export type StaffEmail       = Static<typeof StaffEmailSchema>;
export type StaffTel         = Static<typeof StaffTelSchema>;
export type StaffAvailability = Static<typeof StaffAvailabilitySchema>;

const checkStaff              = compileSchema(StaffSchema);
const checkStaffPreview       = compileSchema(StaffPreviewSchema);
const checkStaffContacts      = compileSchema(StaffContactsSchema);
const checkStaffPrivilege     = compileSchema(StaffPrivilegeSchema);
const checkStaffEmail         = compileSchema(StaffEmailSchema);
const checkStaffTel           = compileSchema(StaffTelSchema);
const checkStaffAvailability  = compileSchema(StaffAvailabilitySchema);

export const validateStaff          = (value: unknown): value is Staff          => checkStaff.Check(value);
export const validateStaffPreview   = (value: unknown): value is StaffPreview   => checkStaffPreview.Check(value);
export const validateStaffPrivilege = (value: unknown): value is StaffPrivilege => checkStaffPrivilege.Check(value);

export const validateStaffContacts = (value: unknown): value is StaffContacts => {
    if (!checkStaffContacts.Check(value)) {
        return false;
    }

    return value.emails.every((email: string): boolean => email === email.toLowerCase());
};

export const validateStaffEmail = (value: unknown): value is StaffEmail => {
    if (!checkStaffEmail.Check(value)) {
        return false;
    }

    return value.email === value.email.toLowerCase();
};

export const validateStaffTel = (value: unknown): value is StaffTel => checkStaffTel.Check(value);

function normaliseTime(time: string): string {
    const parts: Array<string> = time.split(":");

    if (parts.length === 2) {
        return `${ parts[0] }:${ parts[1] }:00`;
    }

    return time;
}

export const validateStaffAvailability = (value: unknown): value is StaffAvailability => {
    if (!checkStaffAvailability.Check(value)) {
        return false;
    }

    const hasFromTime: boolean = value.fromTime !== null;
    const hasToTime  : boolean = value.toTime   !== null;
    const hasToDate  : boolean = value.toDate   !== null;

    if (value.isFlexible && (hasFromTime || hasToTime || hasToDate)) {
        return false;
    }

    if (!value.isFlexible && !hasFromTime && !hasToTime && !hasToDate) {
        return false;
    }

    if (value.toDate === null) {
        return true;
    }

    if (value.toTime === null) {
        return false;
    }

    const dateTime: number = Date.parse(value.date);
    const toDateTime: number = Date.parse(value.toDate);
    const oneDayInMilliseconds: number = 86_400_000;

    if (toDateTime < dateTime || toDateTime > dateTime + oneDayInMilliseconds) {
        return false;
    }

    if (value.fromTime !== null && normaliseTime(value.toTime) <= normaliseTime(value.fromTime) && toDateTime <= dateTime) {
        return false;
    }

    return true;
};
