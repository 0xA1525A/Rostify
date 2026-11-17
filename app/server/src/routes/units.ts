import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";

import {
    handleCreateUnit,
    handleDeleteAllUnits,
    handleDeleteUnitByID,
    handleGetAllUnits,
    handleGetUnitByID,
    handleSearchUnitsByName,
    handleUpdateUnitByID
} from "@service:business/units";

import { handleGetAllPositionPreviewsInUnitByID } from "@service:business/positions";

export const unitRoutes = new Elysia({ prefix: "/unit" })
    .get("/", handleGetAllUnits as Fn<[any], any>)
    .get("/:unitID", handleGetUnitByID as Fn<[any], any>)
    .get("/:unitID/positions", handleGetAllPositionPreviewsInUnitByID as Fn<[any], any>)
    .get("/search/:unitName", handleSearchUnitsByName as Fn<[any], any>)

    .post("/", handleCreateUnit as Fn<[any], any>)

    .patch("/:unitID", handleUpdateUnitByID as Fn<[any], any>)

    .delete("/", handleDeleteAllUnits as Fn<[any], any>)
    .delete("/:unitID", handleDeleteUnitByID as Fn<[any], any>);