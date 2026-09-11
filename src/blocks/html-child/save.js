import { useBlockProps, RichText } from '@wordpress/block-editor';
import clsx from 'clsx';
import {
	getTagValue,
	isVoidTag,
	propsArrayToObject,
	parseStyleString,
} from './helpers';

export default function Save( { attributes } ) {
	const { tag, props = [], content = '' } = attributes;
	const sanitizedTag = getTagValue( tag, 'span' );
	const isVoid = isVoidTag( sanitizedTag );
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
			'blockish-html-child',
			`blockish-html-child--${ sanitizedTag }`,
			customClass,
			customClassName
		),
	} );

	if ( isVoid ) {
		return <Tag { ...blockProps } />;
	}

	return (
		<RichText.Content
			tagName={ sanitizedTag }
			value={ content }
			{ ...blockProps }
		/>
	);
}
