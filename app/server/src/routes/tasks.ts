import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";

import {
    handleCreateTask,
    handleDeleteAllTasks,
    handleDeleteTaskByID,
    handleGetAllTasks,
    handleGetAllTasksInDay,
    handleGetTaskByID,
    handleSearchTasksByName,
    handleUpdateTaskByID
} from "@service:business/tasks";

export const taskRoutes = new Elysia({ prefix: "/task" })
    .get("/", handleGetAllTasks as Fn<[any], any>)
    .get("/search/:taskName", handleSearchTasksByName as Fn<[any], any>)
    .get("/day/:taskDay", handleGetAllTasksInDay as Fn<[any], any>)
    .get("/:taskID", handleGetTaskByID as Fn<[any], any>)

    .post("/", handleCreateTask as Fn<[any], any>)

    .patch("/:taskID", handleUpdateTaskByID as Fn<[any], any>)

    .delete("/", handleDeleteAllTasks as Fn<[any], any>)
    .delete("/:taskID", handleDeleteTaskByID as Fn<[any], any>);