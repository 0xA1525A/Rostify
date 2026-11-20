import { Elysia } from "elysia";

import { toRouteHandler } from "@lib:templates/route_handler";
import {
    handleCreatePositionConflict,
    handleDeleteAllPositionConflicts,
    handleDeletePositionConflictByIDs,
    handleGetAllPositionConflicts,
    handleGetConflictsFromPosition,
    handleGetConflictsToPosition,
    handleGetPositionConflictByIDs,
    handleUpdatePositionConflict
} from "@service:business/position_conflicts";

export const positionConflictRoutes = new Elysia({ prefix: "/position-conflicts" })
    .get("/", toRouteHandler(handleGetAllPositionConflicts))
    .get("/from/:positionAID", toRouteHandler(handleGetConflictsFromPosition))
    .get("/to/:positionBID", toRouteHandler(handleGetConflictsToPosition))
    .get("/:positionAID/:positionBID", toRouteHandler(handleGetPositionConflictByIDs))

    .post("/", toRouteHandler(handleCreatePositionConflict))

    .patch("/:positionAID/:positionBID", toRouteHandler(handleUpdatePositionConflict))

    .delete("/", toRouteHandler(handleDeleteAllPositionConflicts))
    .delete("/:positionAID/:positionBID", toRouteHandler(handleDeletePositionConflictByIDs));
