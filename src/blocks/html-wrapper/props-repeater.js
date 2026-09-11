import { Button, TextControl, Tooltip } from '@wordpress/components';
import { plus, trash } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

export default function PropsRepeater( {
	props = [],
	onChange,
	title = __( 'HTML Attributes (Props)', 'blockish' ),
	description,
} ) {
	const items = Array.isArray( props ) ? props : [];

	const handleAdd = () => {
		if ( typeof onChange === 'function' ) {
			onChange( [ ...items, { key: '', value: '' } ] );
		}
	};

	const handleUpdate = ( index, field, val ) => {
		if ( typeof onChange === 'function' ) {
			const next = items.map( ( item, i ) => {
				if ( i === index ) {
					return { ...item, [ field ]: val };
				}
				return item;
			} );
			onChange( next );
		}
	};

	const handleRemove = ( index ) => {
		if ( typeof onChange === 'function' ) {
			const next = items.filter( ( _, i ) => i !== index );
			onChange( next );
		}
	};

	return (
		<div className="blockish-props-repeater">
			<div className="blockish-props-repeater__header">
				<div className="blockish-props-repeater__header-text">
					{ title && (
						<span className="blockish-props-repeater__title">
							{ title }
						</span>
					) }
					{ description && (
						<p className="blockish-props-repeater__description">
							{ description }
						</p>
					) }
				</div>
				<Button
					variant="secondary"
					size="small"
					icon={ plus }
					onClick={ handleAdd }
				>
					{ __( 'Add Prop', 'blockish' ) }
				</Button>
			</div>

			{ items.length === 0 ? (
				<div className="blockish-props-repeater__empty">
					<p>{ __( 'No attributes added yet.', 'blockish' ) }</p>
					<Button
						variant="tertiary"
						size="small"
						icon={ plus }
						onClick={ handleAdd }
					>
						{ __( 'Add first attribute', 'blockish' ) }
					</Button>
				</div>
			) : (
				<div className="blockish-props-repeater__list">
					{ items.map( ( item, index ) => (
						<div
							key={ index }
							className="blockish-props-repeater__row"
						>
							<div className="blockish-props-repeater__cell blockish-props-repeater__cell--key">
								<TextControl
									label={
										index === 0
											? __( 'Key', 'blockish' )
											: undefined
									}
									hideLabelFromVision={ index !== 0 }
									value={ item.key }
									onChange={ ( val ) =>
										handleUpdate( index, 'key', val )
									}
									placeholder={ __(
										'e.g. id, class, data-*',
										'blockish'
									) }
									__nextHasNoMarginBottom
									__next40pxDefaultSize
								/>
							</div>
							<div className="blockish-props-repeater__cell blockish-props-repeater__cell--value">
								<TextControl
									label={
										index === 0
											? __( 'Value', 'blockish' )
											: undefined
									}
									hideLabelFromVision={ index !== 0 }
									value={ item.value }
									onChange={ ( val ) =>
										handleUpdate( index, 'value', val )
									}
									placeholder={ __(
										'e.g. my-id, active',
										'blockish'
									) }
									__nextHasNoMarginBottom
									__next40pxDefaultSize
								/>
							</div>
							<div className="blockish-props-repeater__cell blockish-props-repeater__cell--action">
								<Tooltip
									text={ __(
										'Delete attribute',
										'blockish'
									) }
								>
									<Button
										icon={ trash }
										isDestructive
										label={ __(
											'Delete attribute',
											'blockish'
										) }
										onClick={ () => handleRemove( index ) }
										size="small"
									/>
								</Tooltip>
							</div>
						</div>
					) ) }
				</div>
			) }
		</div>
	);
}
