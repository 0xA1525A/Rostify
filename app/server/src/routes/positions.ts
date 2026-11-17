import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";

import {
    handleGetPositionByID,
    handleCreatePosition,
    handleDeleteAllPositions,
    handleDeletePositionByID,
    handleGetAllPositionPreviews,
    handleUpdatePositionByID,
    handleSearchPositionPreviewsByName
} from "@service:business/positions";

export const positionRoutes = new Elysia({ prefix: "/position" })
    .get("/", handleGetAllPositionPreviews as Fn<[any], any>)
    .post("/", handleCreatePosition as Fn<[any], any>)
    .delete("/", handleDeleteAllPositions as Fn<[any], any>)

    .get("/:positionID", handleGetPositionByID as Fn<[any], any>)
    .patch("/:positionID", handleUpdatePositionByID as Fn<[any], any>)
    .delete("/:positionID", handleDeletePositionByID as Fn<[any], any>)

    .get("/search/:positionName", handleSearchPositionPreviewsByName as Fn<[any], any>);