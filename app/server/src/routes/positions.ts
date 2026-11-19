import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";
import { handleCreatePosition, handleDeleteAllPositions, handleDeletePositionByPositionID, handleGetAllPositionPreviews, handleGetPositionByPositionID, handleUpdatePositionByPositionID } from "@service:business/positions";

type F = Fn<[unknown], unknown>;

export const positionRoutes = new Elysia({ prefix: "/positions" })
    .get("/",            handleGetAllPositionPreviews  as F)
    .get("/:positionID", handleGetPositionByPositionID as F)

    .post("/", handleCreatePosition as F)

    .patch("/:positionID", handleUpdatePositionByPositionID as F)

    .delete("/",            handleDeleteAllPositions         as F)
    .delete("/:positionID", handleDeletePositionByPositionID as F)