export default function BrandContainer(): React.JSX.Element {
    return (
        <div className="bg-white w-full flex flex-row gap-2 p-2 rounded-xl sticky top-0 shadow-sm">
            <img
                className="w-1/7 rounded-lg"
                src="/Rostify.png"
            />
            <div className="h-full flex flex-col justify-center items-center gap-1 overflow-visible">
                <h1 className="w-full text-blue-500 font-extrabold leading-4">Rostify</h1>
                <span className="w-full text-green-700 font-bold text-xs leading-4">Sizzler Special เดอะมอลล์งามวงศ์วาน</span>
            </div>
        </div>
    );
}