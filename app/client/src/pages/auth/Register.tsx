import PageWrapper from "../../components/layouts/PageWrapper";
import AuthForm    from "../../components/auth/AuthForm";
import AuthInput   from "../../components/auth/AuthInput";
import AuthButton  from "../../components/auth/AuthButton";
import AuthButtonWrapper from "../../components/auth/AuthButtonWrapper";
import AuthErrorMessage from "../../components/auth/AuthErrorMessage";

export default function Register(): React.JSX.Element {
    function handleSubmit(e: React.SubmitEvent<HTMLInputElement>): void {
        e.preventDefault();

        const formData = new FormData(e.target);

        type T = FormDataEntryValue;

        const username: T = formData.get("username");
        const password: T = formData.get("password");

        console.log({ username, password });
    }

    let error = false;
    let staffList = [{ label: "Natthakit Thawaichai", value: "1" }, { label: "1", value: "1" }];

    return (
        <PageWrapper layoutType="centered">
            <AuthForm title="ส่งคำขอเปิดบัญชี" description="กรอกยูเซอร์เนม และรหัสผ่านของท่านเพื่อเข้าสู่ระบบ" action={ handleSubmit }>
                { error ? <AuthErrorMessage message="ยูเซอร์เนม หรือรหัสผ่านไม่ถูกต้อง"/> : <></> }
                <AuthInput inputType="selection" name="staff" label="คุณคือใคร" selectOptions={ staffList } />
                <AuthInput inputType="text" name="username" label="ยูเซอร์เนม" placeholder="username" value='' />
                <AuthInput inputType="password" name="password" label="รหัสผ่าน" placeholder="********" value='' />
                <AuthInput inputType="password" name="confirmmPassword" label="ยืนยันรหัสผ่าน" placeholder="********" value='' />
                <AuthButtonWrapper>
                    <AuthButton buttonType="reset" label="เคลียร์ข้อมูล" />
                    <AuthButton buttonType="submit" label="ส่งคำขอ" />
                </AuthButtonWrapper>
            </AuthForm>
        </PageWrapper>
    );
}