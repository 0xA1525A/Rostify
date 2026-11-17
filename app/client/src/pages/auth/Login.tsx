import PageWrapper from "../../components/layouts/PageWrapper";
import AuthForm    from "../../components/auth/AuthForm";
import AuthInput   from "../../components/auth/AuthInput";
import AuthButton  from "../../components/auth/AuthButton";
import AuthButtonWrapper from "../../components/auth/AuthButtonWrapper";
import AuthErrorMessage from "../../components/auth/AuthErrorMessage";

export default function Login(): React.JSX.Element {
    function handleSubmit(e: React.SubmitEvent<HTMLInputElement>): void {
        e.preventDefault();

        const formData = new FormData(e.target);

        type T = FormDataEntryValue;

        const username: T = formData.get("username");
        const password: T = formData.get("password");

        console.log({ username, password });
    }

    let error = false;

    return (
        <PageWrapper layoutType="centered">
            <AuthForm title="เข้าสู่ระบบ" description="กรอกยูเซอร์เนม และรหัสผ่านของท่านเพื่อเข้าสู่ระบบ" action={ handleSubmit }>
                { error ? <AuthErrorMessage message="ยูเซอร์เนม หรือรหัสผ่านไม่ถูกต้อง"/> : <></> }
                <AuthInput inputType="text" name="username" label="ยูเซอร์เนม" placeholder="username" value='' />
                <AuthInput inputType="password" name="password" label="รหัสผ่าน" placeholder="********" value='' />
                <AuthButtonWrapper>
                    <AuthButton buttonType="reset" label="เคลียร์ข้อมูล" />
                    <AuthButton buttonType="submit" label="เข้าสู่ระบบ" />
                </AuthButtonWrapper>
            </AuthForm>
        </PageWrapper>
    );
}