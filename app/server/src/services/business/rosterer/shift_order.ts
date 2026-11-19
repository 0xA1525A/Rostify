import type { ShiftName } from "@model:shifts";

export const SHIFT_ORDER: ReadonlyArray<ShiftName> = ["open", "early", "mid", "late", "close"];

export function shiftIndex(name: ShiftName): number {
    const index: number = SHIFT_ORDER.indexOf(name);

    return index === -1 ? SHIFT_ORDER.length : index;
}

export function stepsTowardOpen(from: ShiftName, to: ShiftName): number {
    return shiftIndex(from) - shiftIndex(to);
}
