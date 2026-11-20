import { Elysia } from "elysia";

import { toRouteHandler } from "@lib:templates/route_handler";

import { handleLogin }    from "@service:auth/login";
import { handleRegister } from "@service:auth/register";
import { handleLogout }   from "@service:auth/logout";
import {
    handleDeleteAllLoginAccounts,
    handleDeleteLoginAccountByStaffID,
    handleGetAllLoginAccounts,
    handleGetLoginAccountByStaffID,
    handlePasswordReset,
    handleUpdateLoginAccountByStaffID
} from "@service:auth/accounts";
import { handleGetStaffByToken } from "@service:auth/sessions";

export const authRoutes = new Elysia({ prefix: "/auth" })
    .get("/who-am-i", toRouteHandler(handleGetStaffByToken))

    .post("/login",    toRouteHandler(handleLogin))
    .post("/register", toRouteHandler(handleRegister))
    .post("/logout",   toRouteHandler(handleLogout))

    .post("/password-reset", toRouteHandler(handlePasswordReset))

    .get("/accounts",          toRouteHandler(handleGetAllLoginAccounts))
    .get("/accounts/:staffID", toRouteHandler(handleGetLoginAccountByStaffID))

    .patch("/accounts/:staffID", toRouteHandler(handleUpdateLoginAccountByStaffID))

    .delete("/accounts",          toRouteHandler(handleDeleteAllLoginAccounts))
    .delete("/accounts/:staffID", toRouteHandler(handleDeleteLoginAccountByStaffID))