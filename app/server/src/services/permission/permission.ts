import type { SQL } from "bun";

import type { Nullable } from "@lib:types/nullable";
import      { Result }   from "@lib:templates/result";

import { getTokenPrincipalByToken } from "@data:sessions";

import { getClientSessionToken } from "@service:auth/sessions";

import type { StaffPrivilege } from "@model:staff";

export type InAppPermission = StaffPrivilege | "anonymous";

const PERMISSION_MAP: Record<InAppPermission, number> = {
    "admin"    : 5,
    "manager"  : 4,
    "head"     : 3,
    "staff"    : 2,
    "anonymous": 0
};

export async function validateAccessPermission(
    sql             : SQL,
    headers         : any,
    minimumPrivilege: InAppPermission,
    allowSelf       : boolean,
    staffID         : Nullable<string> = null
): Promise<Result<string>> {
    if (minimumPrivilege === "anonymous") {
        return new Result<string>(true, null);
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
        return new Result<string>(false, `Missing or invalid session token: ${ String(error) }.`);
    }

    type R = {
        id: string,
        privilege: StaffPrivilege
    };

    const getPrincipalResult: Result<R>   = await getTokenPrincipalByToken(sql, token);
    const principal         : Nullable<R> = getPrincipalResult.getData()

    if (!getPrincipalResult.isSuccess() || principal === null) {
        return new Result<string>(false, "Unable to find token's owner's information.");
    }

    const requiredPermission: number = PERMISSION_MAP[minimumPrivilege];
    const tokensPermission  : number = PERMISSION_MAP[principal.privilege];

    if (!((allowSelf && (staffID === principal.id)) || tokensPermission >= requiredPermission)) {
        return new Result<string>(false, "Permission error. You don't belong here. :(");
    }

    return new Result<string>(true, null);
}