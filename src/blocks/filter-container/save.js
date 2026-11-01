import { useInnerBlocksProps } from '@wordpress/block-editor';

export default function Save() {
	// Dynamic block — render.php outputs the wrapper, search box, filter
	// buttons and empty message. save() only serializes the inner blocks.
	const { children } = useInnerBlocksProps.save();
	return children;
}
