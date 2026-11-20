import { useId } from "react";

export interface AuthInputProps {
    readonly inputType     : "text" | "password" | "selection";
    readonly name          : string;
    readonly label         : string;
    readonly placeholder?  : string;
    readonly value?        : string;
    readonly selectOptions?: Array<{ label: string, value: string }>;
}

export default function AuthInput({ inputType, name, label, placeholder, value, selectOptions }: AuthInputProps): React.JSX.Element {
    const id = useId();

    if (["text", "password"].includes(inputType)) return (
        <>
            <label
                htmlFor={ id }
                className="block w-full mt-2 text-sm p-1"
            >{ label }</label>
            <input
                id={ id }
                type={ inputType }
                name={ name }
                placeholder={ placeholder }
                className="
                    w-full rounded-xl bg-gray-100 p-3
                    border border-transparent
                    hover:bg-gray-50
                    focus:border-blue-500
                    user-invalid:border-red-500
                    user-valid:border-green-500
                "
                defaultValue={ value ?? "" }
                required
            />
        </>
    );

    if (inputType === "selection") return (
        <>
            <label htmlFor={ id } className="block w-full mt-2 text-sm p-1">{ label }</label>
            <select
                id={ id }
                name={ name }
                defaultValue={ value ?? "" }
                className="block h-auto bg-gray-100 w-full p-3 text-md rounded-xl hover:bg-gray-50 overflow-visible"
            >
                {
                    selectOptions?.map((option) => (
                        <option key={ String(option.value) } className="overflow-visible h-auto" value={ option.value }>
                            { option.label }
                        </option>
                    ))
                }
            </select>
        </>
    );

    return (<></>);
}