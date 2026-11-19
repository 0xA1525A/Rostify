import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";

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

type F = Fn<[unknown], unknown>;

export const authRoutes = new Elysia({ prefix: "/auth" })
    .get("/who-am-i", handleGetStaffByToken as F)

    .post("/login",    handleLogin    as F)
    .post("/register", handleRegister as F)
    .post("/logout",   handleLogout   as F)

    .post("/password-reset", handlePasswordReset as F)

    .get("/accounts",          handleGetAllLoginAccounts      as F)
    .get("/accounts/:staffID", handleGetLoginAccountByStaffID as F)

    .patch("/accounts/:staffID", handleUpdateLoginAccountByStaffID as F)

    .delete("/accounts",          handleDeleteAllLoginAccounts      as F)
    .delete("/accounts/:staffID", handleDeleteLoginAccountByStaffID as F)