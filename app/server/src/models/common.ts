import { FormatRegistry, Type } from "@sinclair/typebox";
import type { TSchema }         from "@sinclair/typebox";
import { TypeCompiler }         from "@sinclair/typebox/compiler";
import type { TypeCheck }       from "@sinclair/typebox/compiler";

FormatRegistry.Set("uuid", (value: string): boolean => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));
FormatRegistry.Set("date", (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)));
FormatRegistry.Set("date-time", (value: string): boolean => !Number.isNaN(Date.parse(value)));
FormatRegistry.Set("time", (value: string): boolean => /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value));
FormatRegistry.Set("email", (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));

export const UUIDSchema            = Type.String({ format: "uuid" });
export const DateSchema            = Type.String({ format: "date" });
export const TimeSchema            = Type.String({ format: "time" });
export const DateTimeSchema        = Type.String({ format: "date-time" });
export const PositiveIntegerSchema = Type.Integer({ minimum: 1 });
export const RatingSchema          = Type.Integer({ minimum: 0, maximum: 5 });
export const NonEmptyTextSchema    = Type.String({ minLength: 1 });
export const DescriptionSchema     = Type.String({ minLength: 0, maxLength: 200 });

export function compileSchema<T extends TSchema>(schema: T): TypeCheck<T> {
    return TypeCompiler.Compile(schema);
}
