import { useState } from '@wordpress/element';
import {
	Placeholder,
	Button,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { check } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import PropsRepeater from './props-repeater';
import { COMMON_WRAPPER_TAGS, sanitizeTagName } from './helpers';

export default function HtmlWrapperPlaceholder( {
	initialTag = 'div',
	initialProps = [],
	onApply,
	onCancel,
} ) {
	const currentTag = ( initialTag || 'div' ).toLowerCase().trim();
	const isCustomInitial = ! COMMON_WRAPPER_TAGS.includes( currentTag );

	const [ selectedOption, setSelectedOption ] = useState(
		isCustomInitial ? '__custom__' : currentTag
	);
	const [ customInput, setCustomInput ] = useState(
		isCustomInitial ? currentTag : ''
	);
	const [ localProps, setLocalProps ] = useState( initialProps || [] );

	const tagOptions = [
		...COMMON_WRAPPER_TAGS.map( ( t ) => ( {
			label: `<${ t }>`,
			value: t,
		} ) ),
		{ label: __( 'Custom tag…', 'blockish' ), value: '__custom__' },
	];

	const handleApply = () => {
		const raw =
			selectedOption === '__custom__' ? customInput : selectedOption;
		const appliedTag = sanitizeTagName( raw, 'div' );
		if ( typeof onApply === 'function' ) {
			onApply( {
				tag: appliedTag,
				props: localProps,
			} );
		}
	};

	return (
		<Placeholder
			icon="layout"
			label={ __( 'HTML Wrapper', 'blockish' ) }
			instructions={ __(
				'Choose a container tag (e.g. section, article, div) and configure HTML attributes (props).',
				'blockish'
			) }
			className="blockish-html-placeholder"
		>
			<div className="blockish-html-placeholder__content">
				<div className="blockish-html-placeholder__section">
					<SelectControl
						label={ __( 'Container HTML Tag', 'blockish' ) }
						value={ selectedOption }
						options={ tagOptions }
						onChange={ setSelectedOption }
						help={ __(
							'Select the HTML container tag for this wrapper.',
							'blockish'
						) }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					{ selectedOption === '__custom__' && (
						<div style={ { marginTop: '8px' } }>
							<TextControl
								label={ __( 'Custom Tag Name', 'blockish' ) }
								value={ customInput }
								onChange={ setCustomInput }
								placeholder={ __(
									'e.g. custom-section, custom-wrapper',
									'blockish'
								) }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
						</div>
					) }
				</div>

				<div className="blockish-html-placeholder__section">
					<PropsRepeater
						props={ localProps }
						onChange={ setLocalProps }
						title={ __( 'Initial Attributes (Props)', 'blockish' ) }
						description={ __(
							'Add initial attributes such as id, class, role, or data-* attributes.',
							'blockish'
						) }
					/>
				</div>

				<div className="blockish-html-placeholder__footer">
					{ onCancel && (
						<Button
							variant="tertiary"
							onClick={ onCancel }
							style={ { marginRight: '8px' } }
						>
							{ __( 'Cancel', 'blockish' ) }
						</Button>
					) }
					<Button
						variant="primary"
						icon={ check }
						onClick={ handleApply }
					>
						{ __( 'Apply & Build', 'blockish' ) }
					</Button>
				</div>
			</div>
		</Placeholder>
	);
}
