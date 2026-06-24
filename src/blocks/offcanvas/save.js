import { useInnerBlocksProps } from '@wordpress/block-editor';

export default function Save() {
	// Dynamic block — render.php builds the hamburger/overlay/panel/header
	// chrome (and the live site branding). save() only needs to preserve the
	// inner navmenu-item blocks so they serialize into post content.
	const { children } = useInnerBlocksProps.save();
	return children;
}
