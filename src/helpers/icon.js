import clsx from "clsx";
import parse from "html-react-parser";
import cleanMarkup from "../components/icon-picker/clean-markup";
import { cloneElement } from "@wordpress/element";

const BlockishIcon = ({ icon, className, ...props }) => {
    if(!icon || !icon?.viewBox || !icon?.path) return null;
    const viewBox = Array.isArray(icon.viewBox) ? icon.viewBox.join(' ') : icon.viewBox;
    
    let Markup = <svg
        width={props?.width || icon?.viewBox[2]}
        height={props?.height || icon?.viewBox[3]}
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        className={clsx('blockish-icon', className)}
        focusable={false}
        aria-hidden={true}
        {...props}
    >
        <path d={icon?.path} />
    </svg>
    
    if(typeof viewBox === 'string' && viewBox == 'custom') {
        Markup = cloneElement(parse(cleanMarkup(icon.svg)), {
            className: clsx('blockish-icon', className),
            width: props?.width || 48,
            height: props?.height || 48,
            focusable: false,
            'aria-hidden': true,
            ...props
        })    
    }
    return Markup;
}

export default BlockishIcon;