import { Elysia } from "elysia";

import { toRouteHandler } from "@lib:templates/route_handler";
import { handleCreateTask, handleDeleteAllTasks, handleDeleteTaskByTaskID, handleGetAllTasks, handleGetTaskByTaskID, handleUpdateTaskByTaskID } from "@service:business/tasks";

export const taskRoutes = new Elysia({ prefix: "/tasks" })
    .get("/", toRouteHandler(handleGetAllTasks))
    .get("/:taskID", toRouteHandler(handleGetTaskByTaskID))

    .post("/", toRouteHandler(handleCreateTask))

    .patch("/:taskID", toRouteHandler(handleUpdateTaskByTaskID))

    .delete("/", toRouteHandler(handleDeleteAllTasks))
    .delete("/:taskID", toRouteHandler(handleDeleteTaskByTaskID));