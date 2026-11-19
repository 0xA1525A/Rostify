import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";
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

type F = Fn<[unknown], unknown>;

export const positionConflictRoutes = new Elysia({ prefix: "/position-conflicts" })
    .get("/", handleGetAllPositionConflicts as F)
    .get("/from/:positionAID", handleGetConflictsFromPosition as F)
    .get("/to/:positionBID", handleGetConflictsToPosition as F)
    .get("/:positionAID/:positionBID", handleGetPositionConflictByIDs as F)

    .post("/", handleCreatePositionConflict as F)

    .patch("/:positionAID/:positionBID", handleUpdatePositionConflict as F)

    .delete("/", handleDeleteAllPositionConflicts as F)
    .delete("/:positionAID/:positionBID", handleDeletePositionConflictByIDs as F);
