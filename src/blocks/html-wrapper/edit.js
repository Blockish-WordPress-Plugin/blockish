import {
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { pencil } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import Placeholder from './placeholder';
import { getTagValue, propsArrayToObject, parseStyleString } from './helpers';
import './editor.scss';

export default function Edit( {
	attributes,
	setAttributes,
	advancedControls,
} ) {
	const { tag, props = [], isVariationPicked = false } = attributes;

	const [ isEditing, setIsEditing ] = useState( false );

	const tagVal = getTagValue( tag, 'div' );
	const isConfigured = Boolean( isVariationPicked || tagVal );
	const showPlaceholder = ! isConfigured || isEditing;

	const sanitizedTag = tagVal;
	const Tag = sanitizedTag;

	const htmlProps = propsArrayToObject( props );
	const {
		class: customClass,
		className: customClassName,
		style: customStyle,
		...filteredHtmlProps
	} = htmlProps;

	const parsedStyle = parseStyleString( customStyle );

	const blockProps = useBlockProps( {
		...( ! showPlaceholder ? filteredHtmlProps : {} ),
		style: ! showPlaceholder ? parsedStyle : undefined,
		className: clsx(
			'blockish-html-wrapper',
			`blockish-html-wrapper--${ sanitizedTag }`,
			{
				'blockish-html-wrapper--unconfigured': showPlaceholder,
			},
			! showPlaceholder ? customClass : null,
			! showPlaceholder ? customClassName : null
		),
	} );

	const innerBlockProps = useInnerBlocksProps( blockProps );

	const handleApply = ( config ) => {
		setAttributes( {
			tag: { label: config.tag, value: config.tag },
			props: config.props,
			isVariationPicked: true,
		} );
		setIsEditing( false );
	};

	let content = null;

	if ( ! showPlaceholder ) {
		content = (
			<>
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
					advancedControls={ advancedControls }
				/>
				<BlockControls>
					<ToolbarGroup>
						<div className="blockish-html-toolbar-tag">
							<span className="blockish-html-tag-badge">
								&lt;{ sanitizedTag }&gt;
							</span>
						</div>
						<ToolbarButton
							icon={ pencil }
							label={ __(
								'Reconfigure Tag & Props',
								'blockish'
							) }
							onClick={ () => setIsEditing( true ) }
						/>
					</ToolbarGroup>
				</BlockControls>
				<Tag { ...innerBlockProps }>{ innerBlockProps.children }</Tag>
			</>
		);
	} else {
		content = (
			<div { ...blockProps }>
				<Placeholder
					initialTag={ tagVal }
					initialProps={ props }
					onApply={ handleApply }
					onCancel={
						isConfigured ? () => setIsEditing( false ) : undefined
					}
				/>
			</div>
		);
	}

	return content;
}
