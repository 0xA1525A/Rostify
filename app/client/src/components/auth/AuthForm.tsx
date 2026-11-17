export interface AuthFormProps {
    readonly title: string;
    readonly description: string;
    readonly action: (..._: any) => any;
    readonly children: Array<React.JSX.Element> | React.JSX.Element;
}

export default function AuthForm({ title, description, action, children }: AuthFormProps): React.JSX.Element {

    return (
        <form className="w-1/3 h-auto p-4 rounded-2xl shadow-lg shadow-gray-400 bg-white" onSubmit={ action }>
            <h1 className="text-xl text-blue-500 font-extrabold">{ title }</h1>
            <span className="text-gray-600">{ description }</span>
            { children }
        </form>
    );
}