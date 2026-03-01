import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { getValidColorMode, getValidShape } from './shared';

export default function Save( { attributes } ) {
	const shape = getValidShape( attributes?.shape );
	const colorMode = getValidColorMode( attributes?.iconColorMode );

	const blockProps = useBlockProps.save( {
		className: `blockish-social-icons shape-${ shape } is-color-${ colorMode }`,
	} );
	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <ul { ...innerBlocksProps } />;
}
