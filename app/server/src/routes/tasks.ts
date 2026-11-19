import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";
import { handleCreateTask, handleDeleteAllTasks, handleDeleteTaskByTaskID, handleGetAllTasks, handleGetTaskByTaskID, handleUpdateTaskByTaskID } from "@service:business/tasks";

type F = Fn<[unknown], unknown>;

export const taskRoutes = new Elysia({ prefix: "/tasks" })
    .get("/", handleGetAllTasks as F)
    .get("/:taskID", handleGetTaskByTaskID as F)

    .post("/", handleCreateTask as F)

    .patch("/:taskID", handleUpdateTaskByTaskID as F)

    .delete("/", handleDeleteAllTasks as F)
    .delete("/:taskID", handleDeleteTaskByTaskID as F);