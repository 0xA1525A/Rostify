import type { ReactNode, SubmitEventHandler, SyntheticEvent } from "react";

export interface AuthFormProps {
    readonly title: string;
    readonly description: string;
    readonly action: SubmitEventHandler<HTMLFormElement>;
    readonly onReset?: (e: SyntheticEvent<HTMLFormElement>) => void;
    readonly children: ReactNode;
}

export default function AuthForm({ title, description, action, onReset, children }: AuthFormProps): React.JSX.Element {
    return (
        <form className="w-1/3 h-auto p-4 rounded-2xl shadow-lg shadow-gray-400 bg-white" onSubmit={ action } onReset={ onReset }>
            <h1 className="text-xl text-blue-500 font-extrabold">{ title }</h1>
            <span className="text-gray-600">{ description }</span>
            { children }
        </form>
    );
}