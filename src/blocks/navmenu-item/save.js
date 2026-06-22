import { InnerBlocks } from '@wordpress/block-editor';

export default function Save() {
	// Static output is unused — render.php re-renders the item dynamically.
	// We still need to render the InnerBlocks placeholder here so the
	// navmenu-submenu child block actually gets serialized into the saved
	// post content; otherwise nested submenus would be silently dropped.
	return <InnerBlocks.Content />;
}
