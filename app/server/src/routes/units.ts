import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";
import { handleCreateUnit, handleDeleteAllUnits, handleDeleteUnitByUnitID, handleGetAllUnits, handleGetUnitByUnitID, handleUpdateUnitByUnitID } from "@service:business/units";
import { handleGetAllPositionPreviewsInUnitByUnitID } from "@service:business/positions";

type F = Fn<[unknown], unknown>;

export const unitRoutes = new Elysia({ prefix: "/units" })
    .get("/",                  handleGetAllUnits as F)
    .get("/:unitID",           handleGetUnitByUnitID as F)
    .get("/:unitID/positions", handleGetAllPositionPreviewsInUnitByUnitID as F)

    .post("/", handleCreateUnit as F)

    .patch("/:unitID", handleUpdateUnitByUnitID as F)

    .delete("/",        handleDeleteAllUnits as F)
    .delete("/:unitID", handleDeleteUnitByUnitID as F)