export enum YearFormat {
    FULL,
    SHORT
}

export enum MonthFormat {
    NUMERIC,
    ZERO_PADDED,
    NARROW,
    SHORT,
    FULL
}

export enum WeekdayFormat {
    NUMERIC,
    ZERO_PADDED,
    NARROW,
    SHORT,
    FULL
}

export enum DateFormat {
    NUMERIC,
    ZERO_PADDED
}

export enum TimeUnitFormat {
    NUMERIC,
    ZERO_PADDED
}

export enum TimeHoursNotation {
    TWELVE_HOUR,
    TWENTY_FOUR_HOUR
}

export class DateTime {
    private readonly date: Date;

    public constructor (date: Date = new Date()) {
        this.date = date;
    }

    public getYear(format: YearFormat): string {
        const fullYear: number = this.date.getFullYear();

        if (format === YearFormat.SHORT) {
            return String(fullYear).slice(-2);
        }

        return String(fullYear);
    }

    public getMonth(format: MonthFormat): string {
        const monthNum: number = this.date.getMonth() + 1;

        switch (format) {
            case MonthFormat.NUMERIC:
                return String(monthNum);

            case MonthFormat.ZERO_PADDED:
                return String(monthNum).padStart(2, '0');

            case MonthFormat.NARROW:
                const narrowMonths: Array<string> = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

                return narrowMonths[monthNum - 1];

            case MonthFormat.SHORT:
                const shortMonths: Array<string> = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                return shortMonths[monthNum - 1];

            case MonthFormat.FULL:
                const fullMonths: Array<string> = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                return fullMonths[monthNum - 1];
        }
    }

    public getWeekday(format: WeekdayFormat): string {
        const dayNum: number = this.date.getDay();

        switch (format) {
            case WeekdayFormat.NUMERIC:
                return String(dayNum);

            case WeekdayFormat.ZERO_PADDED:
                return String(dayNum).padStart(2, '0');

            case WeekdayFormat.NARROW:
                const narrowDays: Array<string> = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

                return narrowDays[dayNum];

            case WeekdayFormat.SHORT:
                const shortDays: Array<string> = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

                return shortDays[dayNum];

            case WeekdayFormat.FULL:
                const fullDays: Array<string> = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                return fullDays[dayNum];
        }
    }

    public getDate(format: DateFormat): string {
        const dateNum: number = this.date.getDate();

        if (format === DateFormat.ZERO_PADDED) {
            return String(dateNum).padStart(2, '0');
        }

        return String(dateNum);
    }

    private roundTo12Hour(hour: number): number {
        return (hour % 12) || 12;
    }

    public getHours(format   : TimeUnitFormat,    hourRound: TimeHoursNotation
    ): string {
        const hours: number = hourRound === TimeHoursNotation.TWENTY_FOUR_HOUR
            ? this.date.getHours()
            : this.roundTo12Hour(this.date.getHours()) ;

        if (format === TimeUnitFormat.ZERO_PADDED) {
            return String(hours).padStart(2, '0');
        }

        return String(hours);
    }

    public getMinutes(format: TimeUnitFormat): string {
        const minutes: number = this.date.getMinutes();

        if (format === TimeUnitFormat.ZERO_PADDED) {
            return String(minutes).padStart(2, '0');
        }

        return String(minutes);
    }

    public getSeconds(format: TimeUnitFormat): string {
        const seconds: number = this.date.getSeconds();

        if (format === TimeUnitFormat.ZERO_PADDED) {
            return String(seconds).padStart(2, '0');
        }

        return String(seconds);
    }

    public getMilliseconds(format: TimeUnitFormat, decimalPoints: number): string {
        let milliStr: string;

        if (decimalPoints <= 3) {
            const milliNum: number = this.date.getMilliseconds();

            milliStr = String(milliNum).padStart(3, "0");
            milliStr = milliStr.slice(0, decimalPoints);
        }
        else {
            const timestampNanoseconds : bigint = BigInt(Math.round((performance.timeOrigin + performance.now()) * 1_000_000));
            const fractionalNanoseconds: bigint = timestampNanoseconds % 1_000_000_000n;

            milliStr = fractionalNanoseconds
                .toString()
                .padStart(9, "0")
                .slice(0, decimalPoints);
        }

        if (format === TimeUnitFormat.NUMERIC) {
            return String(Number(milliStr));
        }

        return milliStr;
    }

    public getMeridiemIndicator(): string {
        return this.date.getHours() >= 12 ? "PM" : "AM";
    }
}