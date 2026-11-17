import type { Option } from "@lib:types/option";
import      { Result } from "@lib:templates/result";
import      { normaliseEnv } from "@service:env/env";

export function validateUsername(username: Option<string>): Result<string> {
    if (typeof username !== "string") {
        return new Result<string>(false, "Username must be string.");
    }

    const MIN_USERNAME_LENGTH = normaliseEnv<number>(Bun.env.MIN_USERNAME_LENGTH, Number) ?? 3;
    const MAX_USERNAME_LENGTH = normaliseEnv<number>(Bun.env.MAX_USERNAME_LENGTH, Number) ?? 20;

    if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
        return new Result<string>(false, `Username must be between ${ MIN_USERNAME_LENGTH }-${ MAX_USERNAME_LENGTH } characters long.`);
    }

    if (!(/^[a-z0-9._\-]+$/.test(String(username)))) {
        return new Result<string>(false, "Username can contain a-z (lower-case), 0-9, . (period), _ (underscore), and - (hyphen).");
    }

    return new Result<string>(true, null);
}

export function validatePassword(
    password       : Option<string>,
    confirmPassword: Option<string>
): Result<string> {
    if (typeof password !== "string" || typeof confirmPassword !== "string") {
        return new Result<string>(false, "Password and password confirmation must be string.");
    }

    const MIN_PASSWORD_LENGTH = normaliseEnv<number>(Bun.env.MIN_PASSWORD_LENGTH, Number) ?? 8;

    if (password.length < MIN_PASSWORD_LENGTH) {
        return new Result<string>(false, `Password must be at least ${ MIN_PASSWORD_LENGTH } characters long.`);
    }

    if (password !== confirmPassword) {
        return new Result<string>(false, "Password and password confirmation aren't the same.");
    }
``
    if (password !== password.trim()) {
        return new Result<string>(false, "Password cannot contain whitespace before and after the password itself.");
    }

    return new Result<string>(true, null);
}

export function validateLoginInfo(
    body: any
): Result<string>
{
    if (body === undefined || body === null) {
        return new Result<string>(false, "Malformed request body. Body is undefined or null.");
    }

    if (typeof body.username !== "string" || typeof body.password !== "string") {
        return new Result<string>(false, "Malformed request body. `username` and `password` must be string.");
    }

    if (body.username === undefined || body.username === null) {
        return new Result<string>(false, "Malformed request body. `username` is undefined or null.");
    }

    if (body.password === undefined || body.password === null) {
        return new Result<string>(false, "Malformed request body. `password` is undefined or null.");
    }

    return new Result<string>(true, null);
}