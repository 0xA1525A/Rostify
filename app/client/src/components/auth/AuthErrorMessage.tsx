export interface AuthErrorMessageProps {
    message: string;
}

export default function AuthErrorMessage({ message }: AuthErrorMessageProps): React.JSX.Element {
    return (
        <div className="bg-red-100 border-1 border-red-500 p-3 mt-3 rounded-xl text-red-900 text-md">
            { message }
        </div>
    );
}