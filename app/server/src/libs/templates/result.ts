import type { Nullable } from "@lib:types/nullable";

export class Result<T> {
    private readonly success: boolean;
    private readonly data   : Nullable<T>;

    public constructor (
        success: boolean,
        data   : Nullable<T>
    ) {
        this.success = success;
        this.data    = data;
    }

    public isSuccess(): boolean {
        return this.success;
    }

    public getData(): Nullable<T> {
        return this.data;
    }
}