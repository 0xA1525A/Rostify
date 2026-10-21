
import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import "./styles/style.css";
import App from "./App.tsx";

// import { Server } from "./server/connection.ts";

const root: Root = createRoot(document.getElementById("root")!);
const SERVER_URL: string = import.meta.env.VITE_API_BASE_URL;

async function app(): Promise<void> {
    try {
        const response: Response = await fetch(
            new URL("/", SERVER_URL),
            {
                signal: AbortSignal.timeout(5000),
            },
        );

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        root.render(
            <StrictMode>
                <App />
            </StrictMode>,
        );
    } catch (error: unknown) {
        console.error("Server connection failed:", error);
        root.render(<span>ERROR CONNECTING TO SERVER</span>);
    }
}

void app();