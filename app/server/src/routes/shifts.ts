import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";
import {
    handleCreateShift,
    handleDeleteAllShifts,
    handleDeleteShiftByID,
    handleGetAllShifts,
    handleGetShiftByID,
    handleSearchShiftsByName,
    handleUpdateShiftByID
} from "@service:business/shifts";

export const shiftRoutes = new Elysia({ prefix: "/shift" })
    .get("/", handleGetAllShifts as Fn<[any], any>)
    .get("/search/:shiftName", handleSearchShiftsByName as Fn<[any], any>)

    .get("/:shiftID", handleGetShiftByID as Fn<[any], any>)
    .post("/", handleCreateShift as Fn<[any], any>)

    .patch("/:shiftID", handleUpdateShiftByID as Fn<[any], any>)

    .delete("/", handleDeleteAllShifts as Fn<[any], any>)
    .delete("/:shiftID", handleDeleteShiftByID as Fn<[any], any>);