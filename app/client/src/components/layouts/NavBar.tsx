import BrandContainer from "./NavBar/BrandContainer";
import CategoryHeader from "./NavBar/CategoryHeader";
import NavButton      from "./NavBar/NavButton";

import { getItem }    from "../../utils/storage";

function NavBar_Home(): React.JSX.Element {
    return (
        <>
            <CategoryHeader label="&nbsp;" />
            <NavButton mode="current" label="หนัาหลัก" iconPath="/Rostify.png" destination="/" />
        </>
    );
}

function NavBar_StoreStructure(): React.JSX.Element {
    return (
        <>
            <CategoryHeader label="ข้อมูลภายใน" />
            <NavButton label="พนักงาน" iconPath="/Rostify.png" destination="/" />
            <NavButton label="แผนก" iconPath="/Rostify.png" destination="/" />
            <NavButton label="กะงาน" iconPath="/Rostify.png" destination="/" />
            <NavButton label="ตำแหน่ง" iconPath="/Rostify.png" destination="/" />
            <NavButton label="งานก่อนกลับบ้าน" iconPath="/Rostify.png" destination="/" />
        </>
    );
}

function NavBar_RostersAndSchedules(): React.JSX.Element {
    return (
        <>
            <CategoryHeader label="ตารางงาน" />
            <NavButton label="ลงวัน-เวลาทำงาน" iconPath="/Rostify.png" destination="/" />
            <NavButton label="ตารางเวลาเข้า-ออกงาน" iconPath="/Rostify.png" destination="/" />
            <NavButton label="ตารางหน้าที่" iconPath="/Rostify.png" destination="/" />
        </>
    );
}

function NavBar_Authentication(): React.JSX.Element {
    return (
        <>
            <CategoryHeader label="เริ่มต้นใช้งาน" />
            <NavButton label="เข้าสู่ระบบ" iconPath="/Rostify.png" destination="/login" />
            <NavButton label="ส่งคำขอเปิดบัญชี" iconPath="/Rostify.png" destination="/register" />
        </>
    );
}

function NavBar_AboutMe(): React.JSX.Element {
    return (
        <>
            <CategoryHeader label="เกี่ยวกับฉัน" />
            <NavButton label="โปรไฟล์พนักงาน" iconPath="/Rostify.png" destination="/" />
            <NavButton label="ข้อมูลติดต่อ" iconPath="/Rostify.png" destination="/" />
            <NavButton label="บัญชี Rostify" iconPath="/Rostify.png" destination="/" />
        </>
    );
}

function NavBar_More(): React.JSX.Element {
    return (
        <>
            <CategoryHeader label="อื่นๆ" />
            <NavButton label="ศูนย์ช่วยเหลือ" iconPath="/Rostify.png" destination="/" />
            <NavButton label="เกี่ยวกับ Rostify" iconPath="/Rostify.png" destination="/" />
            <NavButton label="เงื่อนไขการให้บริการ" iconPath="/Rostify.png" destination="/" />
            <NavButton label="นโยบายความเป็นส่วนตัว" iconPath="/Rostify.png" destination="/" />
        </>
    );
}

function NavBar_SystemSettings(): React.JSX.Element {
    return (
        <>
            <CategoryHeader label="ตั้งค่าระบบ Rostify" />
            <NavButton label="ตัวแปรอัลกอริทึม" iconPath="/Rostify.png" destination="/" />
            <NavButton label="แก้ไขสิทธิ์ผู้ใช้" iconPath="/Rostify.png" destination="/" />
            <NavButton label="ฐานข้อมูล" iconPath="/Rostify.png" destination="/" />
        </>
    );
}

export interface NavBarProps {
    readonly userPrivilege?: string;
}

export default function NavBar({ userPrivilege }: NavBarProps): React.JSX.Element {
    return (
        <aside className="bg-linear-to-b from-blue-400 to-blue-600 h-full w-[20dvw] rounded-3xl shadow-blue-600 shadow-2xl p-4 overflow-scroll">
            <BrandContainer />

            <NavBar_Home />
            <NavBar_SystemSettings />
            <NavBar_Authentication />
            <NavBar_AboutMe />
            <NavBar_RostersAndSchedules />
            <NavBar_StoreStructure />
            <NavBar_More />
        </aside>
    );
}