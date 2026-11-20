import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import { compileSchema, UUIDSchema } from "@model:common";

export const AccountStatusSchema = Type.Union([
    Type.Literal("active"),
    Type.Literal("pending"),
    Type.Literal("disabled")
]);

export const LoginCredentialsSchema = Type.Object({
    staffID     : UUIDSchema,
    username    : Type.String({ minLength: 1, maxLength: 20, pattern: "^[a-z0-9._\\-]+$" }),
    passwordHash: Type.String({ minLength: 1, maxLength: 255 }),
    status      : AccountStatusSchema
});

export type Login         = Static<typeof LoginCredentialsSchema>;
export type AccountStatus = Static<typeof AccountStatusSchema>;

const checkLoginCredentials = compileSchema(LoginCredentialsSchema);
const checkAccountStatus    = compileSchema(AccountStatusSchema);

export const validateLoginCredentials = (value: unknown): value is Login => checkLoginCredentials.Check(value);
export const validateAccountStatus    = (value: unknown): value is AccountStatus => checkAccountStatus.Check(value);
