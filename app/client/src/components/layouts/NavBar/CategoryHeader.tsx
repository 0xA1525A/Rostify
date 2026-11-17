export interface CategoryHeaderProps {
    readonly label: string;
}

export default function CategoryHeader({ label }: CategoryHeaderProps): React.JSX.Element {
    return (
        <h3 className="w-full text-sm text-white font-bold mt-2">{ label }</h3>
    );
}