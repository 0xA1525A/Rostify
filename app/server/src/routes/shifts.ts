import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";
import { handleCreateShift, handleDeleteAllShifts, handleDeleteShiftByShiftID, handleGetAllShifts, handleGetShiftByID, handleUpdateShiftByShiftID } from "@service:business/shifts";

type F = Fn<[unknown], unknown>;

export const shiftRoutes = new Elysia({ prefix: "/shifts" })
    .get("/",      handleGetAllShifts as F)
    .get("/:shiftID", handleGetShiftByID as F)

    .post("/", handleCreateShift as F)

    .patch("/:shiftID", handleUpdateShiftByShiftID as F)

    .delete("/",         handleDeleteAllShifts as F)
    .delete("/:shiftID", handleDeleteShiftByShiftID as F)