import clsx from "clsx";
const BlockishIcon = ({ icon, className, ...props }) => {
    if(!icon || !icon?.viewBox || !icon?.path) return null;
    return (
        <svg
            width={props?.width || icon?.viewBox[2]} 
            height={props?.height || icon?.viewBox[3]} 
            viewBox={icon?.viewBox?.join(' ')}
            xmlns="http://www.w3.org/2000/svg" 
            className={clsx('blockish-icon', className)}
            focusable={false}
            aria-hidden={true}
            {...props}
        >
            <path d={icon?.path} />
        </svg>
    )
}

export default BlockishIcon;