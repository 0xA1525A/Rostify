import type { SQL } from "bun";

export interface ServiceDependencies {
    sql    : SQL;
    set    : any;
    headers: any;
    body   : any;
    params : any;
    query  : any;
}