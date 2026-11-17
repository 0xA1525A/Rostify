export class Result<S, E> {
    private result:
        | { success: true;  data: S }
        | { success: false; data: E };

    public constructor (success: true,  data: S);
    public constructor (success: false, data: E);

    public constructor (success: boolean, data: S | E) {
        this.result = success
            ? { success: true,  data: data as S }
            : { success: false, data: data as E };
    }

    public isSuccess(): boolean {
        return this.result.success;
    }

    public getData(): S | E {
        return this.result.data;
    }
}