import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import NavBar      from "./components/layouts/NavBar"
import ContentArea from "./components/layouts/ContentArea";

import "./styles/style.css";

import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { getItem } from "./utils/storage";

export default function App(): React.JSX.Element {
    const [userPrivilege, setUserPrivilege] = useState<string>("");

    useEffect(() => {
        const sessionToken: string | undefined = getItem("x-rostify-session-token");

        if (!sessionToken) return;

        async function fetchUserInfo() {
            try {
                const response = await fetch("http://localhost:3000/api/auth/login", {
                    headers: {
                        "x-rostify-session-token": sessionToken as string,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserPrivilege(data.privilege || "");
                }
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            }
        }

        fetchUserInfo();
    }, []);

    return (
        <>
            <NavBar userPrivilege={userPrivilege} />
            <ContentArea>
                <Routes>
                    <Route path="/" element={<></>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </ContentArea>
        </>
    );
}