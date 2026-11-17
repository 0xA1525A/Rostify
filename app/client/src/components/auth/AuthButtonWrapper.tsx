export interface AuthButtonWrapperProps {
    children: Array<React.JSX.Element> | React.JSX.Element;
}

export default function AuthButtonWrapper({ children }: AuthButtonWrapperProps): React.JSX.Element {
    return (
        <div className="flex flex-row justify-end items-center gap-4">
            { children }
        </div>
    );
}