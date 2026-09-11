import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	COMMON_CHILD_TAGS,
	TAG_OPTIONS,
	sanitizeTagName,
	getTagValue,
} from './helpers';

const Inspector = ( { attributes, setAttributes, advancedControls } ) => {
	const { BlockishControl } = window?.blockish?.controls || {};
	const { BlockishRepeater } = window?.blockish?.components || {};

	if ( ! BlockishControl ) {
		return null;
	}

	const tagVal = getTagValue( attributes?.tag, 'span' );
	const isKnownTag = COMMON_CHILD_TAGS.includes( tagVal );
	const isCustom = ! isKnownTag || attributes?.tag?.value === 'custom';

	// BlockishSelect uses react-select and expects an object { label, value }
	const selectValue = isCustom
		? {
				label: isKnownTag ? __( 'Custom…', 'blockish' ) : tagVal,
				value: tagVal,
		  }
		: typeof attributes?.tag === 'object' && attributes?.tag !== null
		? attributes.tag
		: { label: tagVal, value: tagVal };

	const handleSelectChange = ( selectedOption ) => {
		if ( ! selectedOption ) {
			setAttributes( { tag: { label: 'span', value: 'span' } } );
			return;
		}
		if ( selectedOption.value === 'custom' ) {
			setAttributes( {
				tag: { label: 'custom-element', value: 'custom-element' },
			} );
		} else {
			setAttributes( {
				tag: {
					label: selectedOption.label || selectedOption.value,
					value: sanitizeTagName( selectedOption.value, 'span' ),
				},
			} );
		}
	};

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'content', title: __( 'Content', 'blockish' ) },
					{ name: 'advanced', title: __( 'Advanced', 'blockish' ) },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'HTML Tag', 'blockish' ) }
									initialOpen={ true }
								>
									<BlockishControl
										type="BlockishSelect"
										label={ __( 'Tag', 'blockish' ) }
										value={ selectValue }
										onChange={ handleSelectChange }
										options={ TAG_OPTIONS }
									/>
									{ isCustom && (
										<BlockishControl
											type="TextControl"
											label={ __(
												'Custom Tag Name',
												'blockish'
											) }
											value={ tagVal }
											onChange={ ( nextVal ) => {
												const clean = sanitizeTagName(
													nextVal,
													''
												);
												if ( clean ) {
													setAttributes( {
														tag: {
															label: clean,
															value: clean,
														},
													} );
												}
											} }
											placeholder="e.g. badge, icon-tag"
											__nextHasNoMarginBottom
											__next40pxDefaultSize
										/>
									) }
								</BlockishControl>

								{ BlockishRepeater && (
									<BlockishControl
										type="BlockishPanelBody"
										title={ __(
											'Attributes (Props)',
											'blockish'
										) }
										initialOpen={ true }
									>
										<BlockishRepeater
											repeaterItems={
												attributes.props || []
											}
											onChange={ ( props ) =>
												setAttributes( { props } )
											}
											newItem={ () => ( {
												key: '',
												value: '',
											} ) }
											addLabel={ __(
												'Add Prop',
												'blockish'
											) }
											defaultLabel={ __(
												'Prop',
												'blockish'
											) }
											itemLabelName="key"
											sortable={ true }
										>
											<BlockishControl
												type="TextControl"
												name="key"
												label={ __(
													'Key',
													'blockish'
												) }
												placeholder={ __(
													'e.g. id, class, data-*',
													'blockish'
												) }
												__nextHasNoMarginBottom
												__next40pxDefaultSize
											/>
											<BlockishControl
												type="TextControl"
												name="value"
												label={ __(
													'Value',
													'blockish'
												) }
												placeholder={ __(
													'e.g. my-id, active',
													'blockish'
												) }
												__nextHasNoMarginBottom
												__next40pxDefaultSize
											/>
										</BlockishRepeater>
									</BlockishControl>
								) }
							</>
						) }
						{ tabName === 'advanced' && advancedControls }
					</>
				) }
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo( Inspector );
