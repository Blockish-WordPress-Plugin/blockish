import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import clsx from 'clsx';
import { getTagValue, propsArrayToObject, parseStyleString } from './helpers';

export default function Save( { attributes } ) {
	const { tag, props = [] } = attributes;
	const sanitizedTag = getTagValue( tag, 'div' );
	const Tag = sanitizedTag;

	const htmlProps = propsArrayToObject( props );
	const {
		class: customClass,
		className: customClassName,
		style: customStyle,
		...filteredHtmlProps
	} = htmlProps;

	const parsedStyle = parseStyleString( customStyle );

	const blockProps = useBlockProps.save( {
		...filteredHtmlProps,
		style: parsedStyle,
		className: clsx(
			'blockish-html-wrapper',
			`blockish-html-wrapper--${ sanitizedTag }`,
			customClass,
			customClassName
		),
	} );

	const innerBlockProps = useInnerBlocksProps.save( blockProps );

	return <Tag { ...innerBlockProps }>{ innerBlockProps.children }</Tag>;
}
