export interface ContentAreaProps {
    children: Array<React.JSX.Element> | React.JSX.Element;
}

export default function ContentArea({ children }: ContentAreaProps): React.JSX.Element {
    return (
        <main className="bg-gray-100 h-full w-full rounded-3xl shadow-2xl shadow-gray-500" >
            { children }
        </main>
    );
}