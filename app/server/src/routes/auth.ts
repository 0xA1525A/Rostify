import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";

import { handleLogin }    from "@service:auth/login";
import { handleLogout }   from "@service:auth/logout";
import { handleRegister } from "@service:auth/register";
import {
    handleDeleteAllLoginAccounts,
    handleDeleteLoginAccountByID,
    handleGetAllLoginAccounts,
    handleGetLoginAccountByID,
    handlePendingLoginAccountByID
} from "@service:auth/accounts";

export const authRoutes = new Elysia({ prefix: "/auth" })
    .post("/login",    handleLogin    as Fn<[any], any>)
    .post("/register", handleRegister as Fn<[any], any>)
    .post("/logout",   handleLogout   as Fn<[any], any>)

    .get("/", handleGetAllLoginAccounts as Fn<[any], any>)
    .get("/:staffID", handleGetLoginAccountByID as Fn<[any], any>)

    .post("/pending/:staffID/:action", handlePendingLoginAccountByID as Fn<[any], any>)

    .delete("/", handleDeleteAllLoginAccounts as Fn<[any], any>)
    .delete("/:staffID", handleDeleteLoginAccountByID as Fn<[any], any>)