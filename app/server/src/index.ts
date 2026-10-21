import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const PORT: number = Number(Bun.env.PORT) ?? 3000;

const App: any = new Elysia()
    .use(cors({ origin: true }))
    .get("/", (): string => "Hello Elysia")
    .listen(PORT);

console.log(`Rostify server on Elysia is running at ${App.server?.hostname}:${App.server?.port}`);