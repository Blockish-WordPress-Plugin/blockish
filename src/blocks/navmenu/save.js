import { useInnerBlocksProps } from '@wordpress/block-editor';

export default function Save() {
	const { children } = useInnerBlocksProps.save();
	return children;
}
