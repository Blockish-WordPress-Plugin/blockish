import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus, rotateRight } from '@wordpress/icons';
import BlockishBoxShadowItem from './item';

const DEFAULT_SHADOW = {
	x: 0,
	y: 0,
	blur: 0,
	spread: 0,
	color: 'rgba(0, 0, 0, 0.2)',
};

const getDefaultShadow = () => ( { ...DEFAULT_SHADOW } );

const hasValue = ( value ) => {
	if ( ! value || value === '' ) {
		return false;
	}

	try {
		const parsedValue = JSON.parse( value );

		return Array.isArray( parsedValue ) && parsedValue.length > 0;
	} catch ( e ) {
		return false;
	}
};

const createPreviewBoxShadow = ( boxShadows ) =>
	boxShadows
		.map( ( shadowObject ) => {
			const x = shadowObject?.x ?? 0;
			const y = shadowObject?.y ?? 0;
			const blur = shadowObject?.blur ?? 0;
			const spread = shadowObject?.spread ?? 0;
			const color = shadowObject?.color || DEFAULT_SHADOW.color;
			const inset = shadowObject?.inset ? `${ shadowObject.inset } ` : '';

			return `${ inset }${ x } ${ y } ${ blur } ${ spread } ${ color }`;
		} )
		.join( ', ' );

const BlockishBoxShadow = ( {
	value,
	onChange,
	label = __( 'Drop Shadow', 'blockish' ),
	exclude = [],
	showReset = true,
} ) => {
	// Safely parse the value - handle empty strings and undefined
	let usableBoxShadow;
	try {
		usableBoxShadow =
			value && value !== ''
				? JSON.parse( value )
				: [ getDefaultShadow() ];
	} catch ( e ) {
		usableBoxShadow = [ getDefaultShadow() ];
	}

	const previewBoxShadow = hasValue( value )
		? createPreviewBoxShadow( usableBoxShadow )
		: 'none';

	return (
		<div className="blockish-box-shadow blockish-control blockish-group-control">
			<div className="blockish-box-shadow-preview-wrapper">
				<div className="blockish-box-shadow-header">
					<h5 className="blockish-box-shadow-title">{ label }</h5>
					<div className="blockish-box-shadow-actions">
						{ showReset && (
							<div className="blockish-box-shadow-reset-button-wrapper">
								<Button
									className="blockish-box-shadow-reset-button"
									onClick={ () => onChange( '' ) }
									size="small"
									icon={ rotateRight }
									label={ __( 'Reset Shadow', 'blockish' ) }
									showTooltip
									disabled={ ! hasValue( value ) }
								/>
							</div>
						) }
						<div className="blockish-box-shadow-add-button-wrapper">
							<Button
								className="blockish-box-shadow-add-button"
								onClick={ () => {
									const newBoxShadow = [
										...usableBoxShadow,
										getDefaultShadow(),
									];
									onChange( JSON.stringify( newBoxShadow ) );
								} }
								size="small"
								label={ __( 'Add Shadow', 'blockish' ) }
								showTooltip
							>
								<Icon icon={ plus } />
							</Button>
						</div>
					</div>
				</div>
				<div className="blockish-box-shadow-preview">
					<div
						className="blockish-box-shadow-preview-sample"
						style={ { boxShadow: previewBoxShadow } }
					/>
				</div>
			</div>
			<div className="components-tools-panel blockish-box-shadow-panel">
				{ usableBoxShadow.length > 0 ? (
					<div className="blockish-box-shadow-item-group">
						{ usableBoxShadow.map(
							( shadowObject, index, array ) => {
								return (
									<BlockishBoxShadowItem
										key={ index }
										currentBoxShadow={ shadowObject }
										onChange={ onChange }
										itemIndex={ index }
										itemArray={ array }
										exclude={ exclude }
									/>
								);
							}
						) }
					</div>
				) : null }
			</div>
		</div>
	);
};

export default BlockishBoxShadow;
