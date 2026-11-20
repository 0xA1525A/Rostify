import type { SQL } from "bun";

import type { Nullable } from "@lib:types/nullable";
import      { Result }   from "@lib:templates/result";

import { getTokenPrincipalByToken } from "@data:sessions";

import { getClientSessionToken } from "@service:auth/sessions";

import type { StaffPrivilege } from "@model:staff";

export type InAppPermission = StaffPrivilege | "anonymous";

export type AccessPrincipal = {
    id        : string,
    privilege : StaffPrivilege
};

const PERMISSION_MAP: Record<InAppPermission, number> = {
    "admin"    : 5,
    "manager"  : 4,
    "head"     : 3,
    "staff"    : 2,
    "anonymous": 0
};

export async function getAccessPrincipal(
    sql             : SQL,
    headers         : unknown,
    minimumPrivilege: InAppPermission,
    allowSelf       : boolean,
    staffID         : Nullable<string> = null
): Promise<Result<AccessPrincipal>> {
    if (minimumPrivilege === "anonymous") {
        return new Result<AccessPrincipal>(true, null);
    }

    let token: Nullable<string>;

    try {
        token = getClientSessionToken(headers);

        if (token === null) {
            throw new Error("Session token must be specified.");
        }

        if (token.trim() === "") {
            throw new Error("Session token cannot empty string.");
        }
    }
    catch (error: unknown) {
        return new Result<AccessPrincipal>(false, null);
    }

    type R = {
        id: string,
        privilege: StaffPrivilege
    };

    const getPrincipalResult: Result<R>   = await getTokenPrincipalByToken(sql, token);
    const principal         : Nullable<R> = getPrincipalResult.getData();

    if (!getPrincipalResult.isSuccess() || principal === null) {
        return new Result<AccessPrincipal>(false, null);
    }

    const requiredPermission: number = PERMISSION_MAP[minimumPrivilege];
    const tokensPermission  : number = PERMISSION_MAP[principal.privilege];

    if (!((allowSelf && (staffID === principal.id)) || tokensPermission >= requiredPermission)) {
        return new Result<AccessPrincipal>(false, null);
    }

    return new Result<AccessPrincipal>(true, principal);
}

export async function validateAccessPermission(
    sql             : SQL,
    headers         : unknown,
    minimumPrivilege: InAppPermission,
    allowSelf       : boolean,
    staffID         : Nullable<string> = null
): Promise<Result<string>> {
    const principalResult: Result<AccessPrincipal> = await getAccessPrincipal(
        sql,
        headers,
        minimumPrivilege,
        allowSelf,
        staffID
    );

    return new Result<string>(principalResult.isSuccess(), null);
}
