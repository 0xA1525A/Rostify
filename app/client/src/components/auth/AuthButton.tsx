export interface AuthButtonProps {
    buttonType: "submit" | "reset" | "button";
    label: string;
    action?: () => any;
}

export default function AuthButton({ buttonType, label, action }: AuthButtonProps): React.JSX.Element {
    let buttonClassNames = "p-4 rounded-xl mt-4";

    switch (buttonType) {
        case "submit":
            buttonClassNames += " bg-blue-500 text-white font-bold hover:bg-blue-400";
            break;
        case "button":
        case "reset":
            buttonClassNames += " bg-gray-100 hover:bg-gray-50"
            break;
    }

    return (
        <button className={ buttonClassNames } type={ buttonType } onClick={ void action }>
            { label }
        </button>
    );
}