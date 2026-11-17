import {
    type DateTime,
    DateFormat,
    MonthFormat,
    TimeUnitFormat,
    YearFormat,
    TimeHoursNotation
} from "@service:datetime/datetime";

export function getLogTimestamp(dateTime: DateTime, milliSecDecimalPoints: Readonly<number>): string {
    const year : string = dateTime.getYear(YearFormat.FULL);
    const month: string = dateTime.getMonth(MonthFormat.ZERO_PADDED);
    const date : string = dateTime.getDate(DateFormat.ZERO_PADDED);

    const hour: string = dateTime.getHours(
        TimeUnitFormat.ZERO_PADDED,
        TimeHoursNotation.TWENTY_FOUR_HOUR
    );
    const minute     : string = dateTime.getMinutes(TimeUnitFormat.ZERO_PADDED);
    const second     : string = dateTime.getSeconds(TimeUnitFormat.ZERO_PADDED);
    const milliSecond: string = dateTime.getMilliseconds(
        TimeUnitFormat.ZERO_PADDED,
        milliSecDecimalPoints
    );

    return `${ year }-${ month }-${ date } ${ hour }:${ minute }:${ second }.${ milliSecond }`;
}