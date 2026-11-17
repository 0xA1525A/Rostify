import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";

import {
    handleCreateStaff,
    handleSearchStaffPreviewsByNames,
    handleGetStaffByID,
    handleGetAllStaffPreviews,
    handleUpdateStaffByID,
    handleDeleteStaffByID,
    handleDeleteAllStaff,
    handleAddEmailToStaffWithID,
    handleAddTelToStaffWithID,
    handleGetEmailsByStaffID,
    handleGetTelsByStaffID,
    handleUpdateEmailByEmail,
    handleUpdateTelByTel,
    handleDeleteEmailByEmail
} from "@service:business/staff";

export const staffRoutes = new Elysia({ prefix: "/staff" })
    .get("/"   , handleGetAllStaffPreviews as Fn<[any], any>)
    .get("/:staffID", handleGetStaffByID as Fn<[any], any>)
    .get("/search/:names", handleSearchStaffPreviewsByNames as Fn<[any], any>)

    .post("/", handleCreateStaff as Fn<[any], any>)

    .post("/:staffID/email", handleAddEmailToStaffWithID as Fn<[any], any>)
    .post("/:staffID/tel", handleAddTelToStaffWithID as Fn<[any], any>)

    .get("/:staffID/email", handleGetEmailsByStaffID as Fn<[any], any>)
    .get("/:staffID/tel", handleGetTelsByStaffID as Fn<[any], any>)

    .patch("/:staffID/email/:email", handleUpdateEmailByEmail as Fn<[any], any>)
    .patch("/:staffID/tel/:tel", handleUpdateTelByTel as Fn<[any], any>)

    .delete("/:staffID/email/:email", handleDeleteEmailByEmail as Fn<[any], any>)

    .patch("/:staffID", handleUpdateStaffByID as Fn<[any], any>)

    .delete("/", handleDeleteAllStaff as Fn<[any], any>)
    .delete("/:staffID", handleDeleteStaffByID as Fn<[any], any>);