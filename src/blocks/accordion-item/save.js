import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from '@wordpress/block-editor';
import clsx from 'clsx';
import { DEFAULT_CLOSED_ICON, DEFAULT_OPEN_ICON } from '../accordion/shared';

const IconGroup = ( { openIcon, closeIcon } ) => {
	const { BlockishIcon } = window.blockish.helpers;

	return (
		<span className="blockish-accordion-item-icons">
			<span
				className="blockish-accordion-item-icon"
				data-icon-state="closed"
				aria-hidden="true"
			>
				<BlockishIcon
					icon={ closeIcon }
					width={ 18 }
					height={ 18 }
					fill="currentColor"
				/>
			</span>
			<span
				className="blockish-accordion-item-icon"
				data-icon-state="open"
				aria-hidden="true"
			>
				<BlockishIcon
					icon={ openIcon }
					width={ 18 }
					height={ 18 }
					fill="currentColor"
				/>
			</span>
		</span>
	);
};

export default function Save( { attributes, context } ) {
	const titleTag =
		attributes?.titleTag?.value ||
		context?.[ 'blockish/accordionTitleTag' ] ||
		'h3';
	const openIcon =
		attributes?.collapseIcon ||
		context?.[ 'blockish/accordionOpenIcon' ] ||
		DEFAULT_OPEN_ICON;
	const closeIcon =
		attributes?.expandIcon ||
		context?.[ 'blockish/accordionCloseIcon' ] ||
		DEFAULT_CLOSED_ICON;
	const TitleTag = titleTag;
	const blockProps = useBlockProps.save( {
		className: clsx( 'blockish-accordion-item' ),
	} );
	const contentProps = useInnerBlocksProps.save( {
		className: 'blockish-accordion-item-content-inner',
	} );

	return (
		<div { ...blockProps }>
			<details
				className="blockish-accordion-item-details"
				open={ !! attributes?.defaultOpen }
			>
				<summary className="blockish-accordion-item-trigger">
					<IconGroup openIcon={ openIcon } closeIcon={ closeIcon } />
					<TitleTag className="blockish-accordion-item-heading">
						<RichText.Content
							tagName="span"
							className="blockish-accordion-item-title-text"
							value={ attributes?.title }
						/>
					</TitleTag>
				</summary>
			</details>
			<div className="blockish-accordion-item-panel">
				<div { ...contentProps } />
			</div>
		</div>
	);
}
