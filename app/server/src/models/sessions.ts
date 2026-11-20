import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import { compileSchema, DateTimeSchema, UUIDSchema } from "@model:common";

export const SessionSchema = Type.Object({
    token     : UUIDSchema,
    staffID   : UUIDSchema,
    createdAt : DateTimeSchema
});

export type Session = Static<typeof SessionSchema>;

const checkSession = compileSchema(SessionSchema);

export const validateSession = (value: unknown): value is Session => checkSession.Check(value);
