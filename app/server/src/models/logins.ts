import { Type, Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

export const AccountStatusSchema = Type.Union([
    Type.Literal("active"),
    Type.Literal("pending"),
    Type.Literal("recovery"),
    Type.Literal("disabled")
]);

export const LoginCredentialsSchema = Type.Object({
    staffID     : Type.String({ format: "uuid" }),
    username    : Type.String({ minLength: 1, maxLength: 20 }),
    passwordHash: Type.String(),
    status      : AccountStatusSchema
});

export type LoginCredentials = Static<typeof LoginCredentialsSchema>;
export type AccountStatus    = Static<typeof AccountStatusSchema>;

const checkLoginCredentials = TypeCompiler.Compile(LoginCredentialsSchema);
const checkAccountStatus    = TypeCompiler.Compile(AccountStatusSchema);

export const validateLoginCredentials = (v: unknown): v is LoginCredentials => checkLoginCredentials.Check(v);
export const validateAccountStatus    = (v: unknown): v is AccountStatus    => checkAccountStatus.Check(v);