import { Elysia } from "elysia";

import { toRouteHandler } from "@lib:templates/route_handler";
import { handleCreateUnit, handleDeleteAllUnits, handleDeleteUnitByUnitID, handleGetAllUnits, handleGetUnitByUnitID, handleUpdateUnitByUnitID } from "@service:business/units";
import { handleGetAllPositionPreviewsInUnitByUnitID } from "@service:business/positions";

export const unitRoutes = new Elysia({ prefix: "/units" })
    .get("/",                  toRouteHandler(handleGetAllUnits))
    .get("/:unitID",           toRouteHandler(handleGetUnitByUnitID))
    .get("/:unitID/positions", toRouteHandler(handleGetAllPositionPreviewsInUnitByUnitID))

    .post("/", toRouteHandler(handleCreateUnit))

    .patch("/:unitID", toRouteHandler(handleUpdateUnitByUnitID))

    .delete("/",        toRouteHandler(handleDeleteAllUnits))
    .delete("/:unitID", toRouteHandler(handleDeleteUnitByUnitID))