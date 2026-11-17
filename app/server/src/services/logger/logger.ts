import process from "node:process";

import { DateTime }        from "@service:datetime/datetime";
import { getLogTimestamp } from "@service:logger/log_timestamp";

export class Logger {
    private readonly dateTimeService      : DateTime;
    private readonly LOG_MS_DECIMAL_POINTS: number = 6;

    public constructor (dateTimeService: DateTime = new DateTime()) {
        this.dateTimeService = dateTimeService;
    }

    private log(message: string): void {
        const logTime   : string = getLogTimestamp(this.dateTimeService, this.LOG_MS_DECIMAL_POINTS);
        const logMessage: string = `${ logTime } ${ process.pid }/${ message }`;

        console.log(logMessage);
    }

    public debug(message: string): void {
        if (Bun.env.NODE_ENV === undefined || Bun.env.NODE_ENV !== "development")
            return;

        this.log(`debug > ${ message }`);
    }

    public info(message: string): void {
        this.log(`info  > ${ message }`);
    }

    public warn(message: string): void {
        this.log(`warn  > ${ message }`);
    }

    public error(message: string): void {
        this.log(`error > ${ message }`);
    }
}