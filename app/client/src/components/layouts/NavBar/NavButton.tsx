import { useNavigate } from "react-router-dom";

export interface NavButtonProps {
    readonly mode?      : "danger" | "current";
    readonly label      : string;
    readonly iconPath   : string;
    readonly destination: string;
}

export default function NavButton({ mode, label, iconPath, destination }: NavButtonProps): React.JSX.Element {
    const navigate = useNavigate();

    function handleClick(): void {
        navigate(destination);
    }

    return (
        <button
            data-button-mode={ mode }
            className="
                bg-transparent flex flex-row justify-start items-center gap-2 p-2 rounded-xl
                hover:bg-white/10
                data-[button-mode=current]:bg-linear-to-r
                data-[button-mode=current]:from-white/20
                data-[button-mode=current]:to-white/0
                data-[button-mode=danger]:bg-red-500/0
                data-[button-mode=danger]:hover:bg-red-500/10"
            onClick={ handleClick }
        >
            <img className="w-1/7 rounded-lg" src={ iconPath } />
            <span data-button-mode={ mode } className="font-bold text-white data-[button-mode=danger]:text-red-200">{ label }</span>
        </button>
    );
};