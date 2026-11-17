import { useId, useState } from "react";

export interface AuthInputProps {
    readonly inputType     : "text" | "password" | "selection";
    readonly name          : string;
    readonly label         : string;
    readonly placeholder?  : string;
    readonly value?        : any;
    readonly selectOptions?: Array<{ label: string, value: any }>;
}

export default function AuthInput({ inputType, name, label, placeholder, value, selectOptions }: AuthInputProps): React.JSX.Element {
    const id = useId();

    const [fieldValue, setFieldValue] = useState<string | typeof value>(value ?? '');

    function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
        setFieldValue(e.target.value);
    }

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
                    border-1 border-transparent
                    hover:bg-gray-50
                    focus:border-blue-500
                    user-invalid:border-red-500
                    user-valid:border-green-500
                "
                value={ fieldValue }
                onChange={ handleChange }
                required
            />
        </>
    );

    if (inputType === "selection") return (
        <>
            <label htmlFor={ id } className="block w-full mt-2 text-sm p-1">{ label }</label>
            <select id={ id } name={ name } className="block bg-gray-100 w-full p-3 text-md rounded-xl hover:bg-gray-50">
                {
                    selectOptions.map((option: { label: string, value: any }) => (
                        <option value={ option.value }>{ option.label }</option>
                    ))
                }
            </select>
        </>
    );
}