import { useInnerBlocksProps } from '@wordpress/block-editor';

export default function Save() {
	// Static output is unused — render.php re-renders the item dynamically.
	// We still need to render the inner blocks placeholder here so the
	// navmenu-submenu child block actually gets serialized into the saved
	// post content; otherwise nested submenus would be silently dropped.
	const { children } = useInnerBlocksProps.save();
	return children;
}
