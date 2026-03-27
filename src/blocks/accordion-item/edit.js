import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from '@wordpress/block-editor';
import { useEffect, useState } from '@wordpress/element';
import Inspector from './inspector';
import { DEFAULT_CLOSED_ICON, DEFAULT_OPEN_ICON } from '../accordion/shared';
import './editor.scss';

const TEMPLATE = [
	[
		'blockish/container',
		{
			isVariationPicked: true,
			containerWidth: 'alignfull',
		},
	],
];

export default function Edit( {
	attributes,
	setAttributes,
	advancedControls,
	clientId,
	isSelected,
} ) {
	const { BlockishIcon } = window.blockish.helpers;
	const [ isPreviewOpen, setIsPreviewOpen ] = useState(
		!! attributes?.defaultOpen
	);

	useEffect( () => {
		if ( ! attributes?.itemId ) {
			setAttributes( {
				itemId: `blockish-accordion-item-${ clientId.slice( -6 ) }`,
			} );
		}
	}, [ attributes?.itemId, clientId, setAttributes ] );

	useEffect( () => {
		setIsPreviewOpen( !! attributes?.defaultOpen );
	}, [ attributes?.defaultOpen ] );

	const closedIcon = attributes?.expandIcon || DEFAULT_CLOSED_ICON;
	const openIcon = attributes?.collapseIcon || DEFAULT_OPEN_ICON;
	const blockProps = useBlockProps( {
		className: 'blockish-accordion-item',
	} );
	const contentProps = useInnerBlocksProps(
		{
			className: 'blockish-accordion-item-content-inner',
		},
		{
			template: TEMPLATE,
		}
	);

	const TitleTag = attributes?.titleTag?.value || 'h3';

	const handleTogglePreview = ( event ) => {
		event.preventDefault();
		if ( ! isSelected ) {
			return;
		}
		setIsPreviewOpen( ( prev ) => ! prev );
	};

	return (
		<>
			<Inspector advancedControls={ advancedControls } />
			<div { ...blockProps }>
				<details
					className="blockish-accordion-item-details"
					open={ isPreviewOpen }
				>
					<summary
						className="blockish-accordion-item-trigger"
						onClick={ handleTogglePreview }
					>
						<span className="blockish-accordion-item-icons">
							<span
								className="blockish-accordion-item-icon"
								data-icon-state="closed"
								aria-hidden="true"
								style={ {
									display: isPreviewOpen ? 'none' : 'inline-flex',
								} }
							>
								<BlockishIcon
									icon={ closedIcon }
									width={ 18 }
									height={ 18 }
									fill="currentColor"
								/>
							</span>
							<span
								className="blockish-accordion-item-icon"
								data-icon-state="open"
								aria-hidden="true"
								style={ {
									display: isPreviewOpen ? 'inline-flex' : 'none',
								} }
							>
								<BlockishIcon
									icon={ openIcon }
									width={ 18 }
									height={ 18 }
									fill="currentColor"
								/>
							</span>
						</span>
						<TitleTag className="blockish-accordion-item-heading">
							<RichText
								tagName="span"
								className="blockish-accordion-item-title-text"
								value={ attributes?.title }
								style={ {
									color: isPreviewOpen ? '#111827' : undefined,
								} }
								allowedFormats={ [] }
								placeholder="Accordion title"
								onChange={ ( value ) =>
									setAttributes( { title: value } )
								}
							/>
						</TitleTag>
					</summary>
				</details>
				<div className="blockish-accordion-item-panel">
					<div { ...contentProps } />
				</div>
			</div>
		</>
	);
}
