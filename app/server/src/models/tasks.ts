import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import { compileSchema, DescriptionSchema, PositiveIntegerSchema } from "@model:common";
import { DaySchema } from "@model:datetime";

export const TaskSchema = Type.Object({
    id                    : PositiveIntegerSchema,
    day                   : DaySchema,
    isHoliday             : Type.Boolean(),
    name                  : Type.String({ minLength: 1, maxLength: 50 }),
    description           : DescriptionSchema,
    responsibleUnitID     : Type.Union([PositiveIntegerSchema, Type.Null()]),
    responsiblePositionID : Type.Union([PositiveIntegerSchema, Type.Null()])
});

export type Task = Static<typeof TaskSchema>;

const checkTask = compileSchema(TaskSchema);

export const validateTask = (value: unknown): value is Task => {
    if (!checkTask.Check(value)) {
        return false;
    }

    return !(value.responsibleUnitID !== null && value.responsiblePositionID !== null);
};
