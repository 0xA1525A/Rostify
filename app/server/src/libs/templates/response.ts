import type { HTTPStatus } from "@lib:enums/http_status";
import type { Nullable }   from "@lib:types/nullable";

export type ResponseData     = Nullable<unknown>;
export type RFServerResponse = {
    success: boolean,
    status : HTTPStatus,
    data   : ResponseData
};

export class Response {
    private readonly success: boolean;
    private readonly status : HTTPStatus;
    private readonly data   : ResponseData;

    public constructor (
        success: boolean,
        status : HTTPStatus,
        data   : ResponseData
    ) {
        this.status  = status;
        this.success = success;
        this.data    = data;
    }

    public unwrap(set: unknown): RFServerResponse {
        if (typeof set === "object" && set !== null) {
            Reflect.set(set, "status", Number(this.status));
        }

        return {
            success: this.success,
            status : this.status,
            data   : this.data
        };
    }
}
