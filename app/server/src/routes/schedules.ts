import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";
import {
    handleCreateSchedule,
    handleDeleteAllSchedules,
    handleDeleteAllSchedulesOnDate,
    handleDeleteAllStaffSchedules,
    handleDeleteStaffScheduleOnDateByID,
    handleGetAllSchedulePreviews,
    handleGetAllSchedulesOnDate,
    handleGetAllStaffSchedules,
    handleGetStaffScheduleOnDateByID,
    handleUpdateStaffScheduleOnDateByID
} from "@service:business/schedules";

type F = Fn<[unknown], unknown>;

export const scheduleRoutes = new Elysia({ prefix: "/schedules" })
    .get("/", handleGetAllSchedulePreviews as F)
    .get("/date/:date", handleGetAllSchedulesOnDate as F)
    .get("/date/:date/:staffID", handleGetStaffScheduleOnDateByID as F)
    .get("/staff/:staffID", handleGetAllStaffSchedules as F)

    .post("/date/:date/:staffID", handleCreateSchedule as F)

    .patch("/date/:date/:staffID", handleUpdateStaffScheduleOnDateByID as F)

    .delete("/", handleDeleteAllSchedules as F)
    .delete("/date/:date", handleDeleteAllSchedulesOnDate as F)
    .delete("/date/:date/:staffID", handleDeleteStaffScheduleOnDateByID as F)
    .delete("/staff/:staffID", handleDeleteAllStaffSchedules as F);
