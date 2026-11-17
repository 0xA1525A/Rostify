import { ShiftNameSchema } from "@model:shifts";
import { Type, Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

const StaffBasicInfo = {
    id: Type.String({ format: "uuid" }),
    nickname: Type.String({
        minLength: 1,
        maxLength: 15
    }),
    firstName: Type.String({
        minLength: 1,
        maxLength: 25
    }),
    middleName: Type.Union([
        Type.String({
            minLength: 1,
            maxLength: 25
        }),
        Type.Null()
    ]),
    lastName: Type.String({
        minLength: 1,
        maxLength: 50
    })
};

export const StaffPrivilegeSchema = Type.Union([
    Type.Literal("admin"),
    Type.Literal("manager"),
    Type.Literal("head"),
    Type.Literal("staff")
]);

export const StaffSchema = Type.Object({
    ...StaffBasicInfo,
    dateOfBirth: Type.String({ format: "date" }),
    isFullTime : Type.Boolean(),
    privilege  : StaffPrivilegeSchema
});

export const StaffContactsSchema = Type.Object({
    tels  : Type.Array(Type.String()),
    emails: Type.Array(Type.String({ format: "email" }))
});

export const StaffEmailSchema = Type.Object({
    id     : Type.Integer(),
    staffID: Type.String({ format: "uuid" }),
    email  : Type.String({ format: "email", maxLength: 255 })
});

export const StaffTelSchema = Type.Object({
    id     : Type.Integer(),
    staffID: Type.String({ format: "uuid" }),
    tel    : Type.String({ maxLength: 16 })
});

export const StaffPreviewSchema = Type.Object(StaffBasicInfo);

export const StaffAvailabilitySchema = Type.Object({
    date: Type.String({ format: "date" }),
    staffID: Type.String({ format: "uuid" }),
    fromTime: Type.Union([Type.String({ format: "time" }), Type.Null()]),
    toTime: Type.Union([Type.String({ format: "time" }), Type.Null()]),
    toDate: Type.Union([Type.String({ format: "date" }), Type.Null()]),
    isFlexible: Type.Boolean(),
    okOvertime: Type.Boolean(),
    okMultipleBreak: Type.Boolean(),
    okLongBreak: Type.Boolean(),
    preferredHour: Type.Integer({ minimum: 1 }),
    preferredBreakHour: Type.Integer({ minimum: 0 }),
    preferredShift: ShiftNameSchema
});

export type Staff          = Static<typeof StaffSchema>;
export type StaffPreview   = Static<typeof StaffPreviewSchema>;
export type StaffContacts  = Static<typeof StaffContactsSchema>;
export type StaffPrivilege = Static<typeof StaffPrivilegeSchema>;
export type StaffEmail     = Static<typeof StaffEmailSchema>;
export type StaffTel       = Static<typeof StaffTelSchema>;
export type StaffAvailability = Static<typeof StaffAvailabilitySchema>;

const checkStaff          = TypeCompiler.Compile(StaffSchema);
const checkStaffPreview   = TypeCompiler.Compile(StaffPreviewSchema);
const checkStaffContacts  = TypeCompiler.Compile(StaffContactsSchema);
const checkStaffPrivilege = TypeCompiler.Compile(StaffPrivilegeSchema);
const checkStaffEmail     = TypeCompiler.Compile(StaffEmailSchema);
const checkStaffTel       = TypeCompiler.Compile(StaffTelSchema);
const checkStaffAvailability = TypeCompiler.Compile(StaffAvailabilitySchema);

export const validateStaff         : (v: unknown) => v is Staff          = (v: unknown): v is Staff          => checkStaff.Check(v);
export const validateStaffPreview  : (v: unknown) => v is StaffPreview   = (v: unknown): v is StaffPreview   => checkStaffPreview.Check(v);
export const validateStaffContacts : (v: unknown) => v is StaffContacts  = (v: unknown): v is StaffContacts  => checkStaffContacts.Check(v);
export const validateStaffPrivilege: (v: unknown) => v is StaffPrivilege = (v: unknown): v is StaffPrivilege => checkStaffPrivilege.Check(v);
export const validateStaffEmail    : (v: unknown) => v is StaffEmail     = (v: unknown): v is StaffEmail     => checkStaffEmail.Check(v);
export const validateStaffTel      : (v: unknown) => v is StaffTel       = (v: unknown): v is StaffTel       => checkStaffTel.Check(v);
export const validateStaffAvailability: (v: unknown) => v is StaffAvailability = (v: unknown): v is StaffAvailability => checkStaffAvailability.Check(v);