import { useState, type SubmitEvent, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";

import PageWrapper from "../../components/layouts/PageWrapper";
import AuthForm from "../../components/auth/AuthForm";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthButtonWrapper from "../../components/auth/AuthButtonWrapper";
import AuthErrorMessage from "../../components/auth/AuthErrorMessage";
import { setItem } from "../../utils/storage";

export default function Login(): React.JSX.Element {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const username = String(formData.get("username") ?? '');
        const password = String(formData.get("password") ?? '');

        try {
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const result: unknown = await response.json().catch(() => null);

            const success = typeof result === "object" && result !== null && "success" in result
                ? Boolean((result as { success?: unknown }).success)
                : false;

            if (!response.ok || !success) {
                const data = typeof result === "object" && result !== null && "data" in result
                    ? (result as { data?: unknown }).data
                    : null;
                const message = typeof data === "string" ? data : "เข้าสู่ระบบไม่สำเร็จ";
                setErrorMessage(message);
                return;
            }

            const data = (result as { data?: { token?: unknown } }).data;
            if (data && typeof data.token === "string") {
                setItem("x-rostify-session-token", data.token);
            }

            navigate("/");
        }
        catch {
            setErrorMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        }
        finally {
            setIsSubmitting(false);
        }
    }

    function handleReset(_: SyntheticEvent<HTMLFormElement>): void {
        setErrorMessage(null);
    }

    return (
        <PageWrapper layoutType="centered">
            <AuthForm
                title="เข้าสู่ระบบ"
                description="กรอกยูเซอร์เนม และรหัสผ่านของท่านเพื่อเข้าสู่ระบบ"
                action={ handleSubmit }
                onReset={ handleReset }
            >
                { errorMessage ? <AuthErrorMessage message={ errorMessage } /> : <></> }
                <AuthInput inputType="text" name="username" label="ยูเซอร์เนม" placeholder="username" />
                <AuthInput inputType="password" name="password" label="รหัสผ่าน" placeholder="********" />
                <AuthButtonWrapper>
                    <AuthButton buttonType="reset" label="เคลียร์ข้อมูล" />
                    <AuthButton buttonType="submit" label={ isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ" } />
                </AuthButtonWrapper>
            </AuthForm>
        </PageWrapper>
    );
}