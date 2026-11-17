import { Type, Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

export const SessionSchema = Type.Object({
    token    : Type.String({ format: "uuid" }),
    staffID  : Type.String({ format: "uuid" }),
    createdAt: Type.String({ format: "date-time" })
});

export type Session = Static<typeof SessionSchema>;

const checkSession = TypeCompiler.Compile(SessionSchema);

export const validateSession: (v: unknown) => v is Session = (v: unknown): v is Session => checkSession.Check(v);