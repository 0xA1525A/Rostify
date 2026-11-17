import { Fn } from "@lib:types/fn";
import { Option } from "@lib:types/option";

export function normaliseEnv<T>(
    env   : Option<string>,
    parser: Fn<[Option<string>], T>
): Option<T> {
    if (env === undefined || env.trim() === "") {
        return undefined;
    }

    try {
        return parser(env.trim());
    }
    catch {
        return undefined;
    }
}