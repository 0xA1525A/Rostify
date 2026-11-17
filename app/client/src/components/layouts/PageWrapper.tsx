export interface PageWrapperProps {
    readonly layoutType: "centered" | "scroll";
    readonly children: Array<React.JSX.Element> | React.JSX.Element;
}

export default function PageWrapper({ layoutType, children }: PageWrapperProps): React.JSX.Element {
    let wrapperClassNames = "w-full h-full flex";

    switch (layoutType) {
        case "centered":
            wrapperClassNames += " justify-center items-center";
            break;
        case "scroll":
            wrapperClassNames += " justify-start items-start";
            break;
    }

    return (
        <div className={ wrapperClassNames }>
            { children }
        </div>
    );
}