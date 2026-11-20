import type { Fn }     from "@lib:types/fn";
import type { Option } from "@lib:types/option";

export function normaliseOption<T>(optionValue: unknown, parserFunction: Fn<[string], T>): Option<T> {
    if (
        optionValue === undefined
    ||  (typeof optionValue === "string" && optionValue.trim() === "")
    ) {
        return undefined;
    }

    try {
        return parserFunction(String(optionValue));
    }
    catch {
        return undefined;
    }
}