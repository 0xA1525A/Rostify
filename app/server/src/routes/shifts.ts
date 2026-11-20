import { Elysia } from "elysia";

import { toRouteHandler } from "@lib:templates/route_handler";
import { handleCreateShift, handleDeleteAllShifts, handleDeleteShiftByShiftID, handleGetAllShifts, handleGetShiftByID, handleUpdateShiftByShiftID } from "@service:business/shifts";

export const shiftRoutes = new Elysia({ prefix: "/shifts" })
    .get("/",      toRouteHandler(handleGetAllShifts))
    .get("/:shiftID", toRouteHandler(handleGetShiftByID))

    .post("/", toRouteHandler(handleCreateShift))

    .patch("/:shiftID", toRouteHandler(handleUpdateShiftByShiftID))

    .delete("/",         toRouteHandler(handleDeleteAllShifts))
    .delete("/:shiftID", toRouteHandler(handleDeleteShiftByShiftID))