import { Type, Static } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

import { DaySchema } from "@model:datetime";

export const TaskSchema = Type.Object({
    id: Type.Integer(),
    day: DaySchema,
    isHoliday: Type.Boolean(),
    name: Type.String({ minLength: 1, maxLength: 50 }),
    description: Type.String({ minLength: 0, maxLength: 200 }),
    responsibleUnitID: Type.Union([Type.Integer(), Type.Null()]),
    responsiblePositionID: Type.Union([Type.Integer(), Type.Null()])
});

export type Task = Static<typeof TaskSchema>;

const checkTask = TypeCompiler.Compile(TaskSchema);

export const validateTask = (v: unknown): v is Task => checkTask.Check(v);