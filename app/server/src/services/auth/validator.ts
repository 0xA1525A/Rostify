import type { Option } from "@lib:types/option";
import      { Result } from "@lib:templates/result";

import { normaliseOption } from "@service:normaliser/normaliser";

const FALLBACK_MIN_USERNAME_LENGTH: number = 3;
const FALLBACK_MAX_USERNAME_LENGTH: number = 20;

export function validateUsername(username: Option<string>): Result<string> {
    if (typeof username !== "string") {
        return new Result<string>(false, "Username must be string.");
    }

    const MIN_USERNAME_LENGTH = normaliseOption<number>(Bun.env.MIN_USERNAME_LENGTH, Number) ?? FALLBACK_MIN_USERNAME_LENGTH;
    const MAX_USERNAME_LENGTH = normaliseOption<number>(Bun.env.MAX_USERNAME_LENGTH, Number) ?? FALLBACK_MAX_USERNAME_LENGTH;

    if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
        return new Result<string>(false, `Username must be between ${ MIN_USERNAME_LENGTH }-${ MAX_USERNAME_LENGTH } characters long.`);
    }

    const REGEX_VALID_USERNAME: RegExp = /^[a-z0-9._\-]+$/;

    if (!(REGEX_VALID_USERNAME.test(String(username)))) {
        return new Result<string>(false, "Username can contain a-z (lower-case), 0-9, . (period), _ (underscore), and - (hyphen).");
    }

    return new Result<string>(true, null);
}

export function validatePassword(password: Option<string>, confirmPassword: Option<string>): Result<string> {
    if (typeof password !== "string" || typeof confirmPassword !== "string") {
        return new Result<string>(false, "Password and password confirmation must be string.");
    }

    const MIN_PASSWORD_LENGTH = normaliseOption<number>(Bun.env.MIN_PASSWORD_LENGTH, Number) ?? 8;

    if (password.length < MIN_PASSWORD_LENGTH) {
        return new Result<string>(false, `Password must be at least ${ MIN_PASSWORD_LENGTH } characters long.`);
    }

    if (password !== confirmPassword) {
        return new Result<string>(false, "Password and password confirmation aren't the same.");
    }

    if (password !== password.trim()) {
        return new Result<string>(false, "Password cannot contain whitespace before and after the password itself.");
    }

    return new Result<string>(true, null);
}

export function validateLoginInfo(body: unknown): Result<string> {
    if (body === undefined || body === null) {
        return new Result<string>(false, "Malformed request body. Body is undefined or null.");
    }

    if (typeof body !== "object") {
        return new Result<string>(false, "Malformed request body. Body must be an object.");
    }

    if (!("username" in body) || !("password" in body)) {
        return new Result<string>(false, "Malformed request body. `username` and `password` are required.");
    }

    const username: unknown = Reflect.get(body, "username");
    const password: unknown = Reflect.get(body, "password");

    if (typeof username !== "string" || typeof password !== "string") {
        return new Result<string>(false, "Malformed request body. `username` and `password` must be string.");
    }

    return new Result<string>(true, null);
}