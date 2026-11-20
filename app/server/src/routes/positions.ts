import { Elysia } from "elysia";

import { toRouteHandler } from "@lib:templates/route_handler";
import { handleCreatePosition, handleDeleteAllPositions, handleDeletePositionByPositionID, handleGetAllPositionPreviews, handleGetPositionByPositionID, handleUpdatePositionByPositionID } from "@service:business/positions";

export const positionRoutes = new Elysia({ prefix: "/positions" })
    .get("/",            toRouteHandler(handleGetAllPositionPreviews))
    .get("/:positionID", toRouteHandler(handleGetPositionByPositionID))

    .post("/", toRouteHandler(handleCreatePosition))

    .patch("/:positionID", toRouteHandler(handleUpdatePositionByPositionID))

    .delete("/",            toRouteHandler(handleDeleteAllPositions))
    .delete("/:positionID", toRouteHandler(handleDeletePositionByPositionID))