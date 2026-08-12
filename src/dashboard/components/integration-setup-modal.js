import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import {
	Button,
	Modal,
	Notice,
	Spinner,
	TextControl,
	SelectControl,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

/**
 * Setup / edit modal for a single integration connection.
 *
 * @param {Object}   props
 * @param {Object}   props.item
 * @param {Function} props.onClose
 * @param {Function} props.onSaved
 * @param {Function} props.onDisconnected
 */
export default function IntegrationSetupModal( {
	item,
	onClose,
	onSaved,
	onDisconnected,
} ) {
	const [ values, setValues ] = useState( {} );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ isDisconnecting, setIsDisconnecting ] = useState( false );
	const [ notice, setNotice ] = useState( null );
	const [ fieldErrors, setFieldErrors ] = useState( {} );

	const isConnected = item?.status === 'connected';
	const apiPath =
		window.blockishDashboardData?.integrationsApiPath ||
		'/blockish/v1/integrations';

	useEffect( () => {
		if ( ! item ) {
			return;
		}
		const next = {};
		( item.fields || [] ).forEach( ( field ) => {
			if ( field.type === 'password' ) {
				next[ field.key ] = '';
				return;
			}
			if (
				item.config &&
				typeof item.config[ field.key ] !== 'undefined' &&
				item.config[ field.key ] !== ''
			) {
				next[ field.key ] = item.config[ field.key ];
				return;
			}
			next[ field.key ] =
				typeof field.default !== 'undefined' ? field.default : '';
		} );
		setValues( next );
		setFieldErrors( {} );
		setNotice( null );
	}, [ item ] );

	const title = useMemo( () => {
		if ( ! item ) {
			return '';
		}
		return isConnected
			? sprintf(
					/* translators: %s: integration name */
					__( 'Configure %s', 'blockish' ),
					item.name
			  )
			: sprintf(
					/* translators: %s: integration name */
					__( 'Connect %s', 'blockish' ),
					item.name
			  );
	}, [ item, isConnected ] );

	if ( ! item ) {
		return null;
	}

	const setField = ( key, value ) => {
		setValues( ( prev ) => ( { ...prev, [ key ]: value } ) );
		if ( fieldErrors[ key ] ) {
			setFieldErrors( ( prev ) => {
				const next = { ...prev };
				delete next[ key ];
				return next;
			} );
		}
	};

	const handleSave = async () => {
		setIsSaving( true );
		setNotice( null );
		setFieldErrors( {} );

		try {
			const response = await apiFetch( {
				path: `${ apiPath }/${ item.key }`,
				method: 'POST',
				data: { config: values },
			} );
			if ( response?.item && typeof onSaved === 'function' ) {
				onSaved( response.item );
			}
			setNotice( {
				status: 'success',
				message:
					response?.message ||
					__( 'Integration saved.', 'blockish' ),
			} );
		} catch ( error ) {
			const data = error?.data || {};
			if ( data.errors && typeof data.errors === 'object' ) {
				setFieldErrors( data.errors );
			}
			setNotice( {
				status: 'error',
				message:
					error?.message ||
					__( 'Could not save integration.', 'blockish' ),
			} );
		} finally {
			setIsSaving( false );
		}
	};

	const handleDisconnect = async () => {
		if (
			! window.confirm(
				sprintf(
					/* translators: %s: integration name */
					__(
						'Disconnect %s? Saved keys for this integration will be removed.',
						'blockish'
					),
					item.name
				)
			)
		) {
			return;
		}

		setIsDisconnecting( true );
		setNotice( null );

		try {
			const response = await apiFetch( {
				path: `${ apiPath }/${ item.key }`,
				method: 'DELETE',
			} );
			if ( response?.item && typeof onDisconnected === 'function' ) {
				onDisconnected( response.item );
			}
		} catch ( error ) {
			setNotice( {
				status: 'error',
				message:
					error?.message ||
					__( 'Could not disconnect.', 'blockish' ),
			} );
			setIsDisconnecting( false );
		}
	};

	const busy = isSaving || isDisconnecting;

	return (
		<Modal
			title={ title }
			onRequestClose={ () => {
				if ( ! busy ) {
					onClose();
				}
			} }
			className="blockish-integration-modal"
			size="medium"
		>
			<VStack spacing={ 4 }>
				<div className="blockish-integration-modal__intro">
					<span
						className="blockish-integration-icon"
						aria-hidden="true"
					>
						{ item.icon || item.initials || '🔌' }
					</span>
					<div>
						<Text className="blockish-integration-modal__lead">
							{ item.description }
						</Text>
						{ isConnected ? (
							<span className="blockish-integration-badge is-inline">
								{ __( 'Connected', 'blockish' ) }
							</span>
						) : null }
					</div>
				</div>

				{ notice ? (
					<Notice
						status={ notice.status }
						isDismissible
						onRemove={ () => setNotice( null ) }
					>
						{ notice.message }
					</Notice>
				) : null }

				<div className="blockish-integration-modal__fields">
					{ ( item.fields || [] ).map( ( field ) => {
						const helpExtra =
							field.type === 'password' &&
							item.has_secrets?.[ field.key ]
								? __(
										'A value is already saved. Leave blank to keep it.',
										'blockish'
								  )
								: '';
						const help = [ field.help, helpExtra ]
							.filter( Boolean )
							.join( ' ' );

						if ( field.type === 'select' ) {
							return (
								<SelectControl
									key={ field.key }
									label={ field.label }
									help={ help || undefined }
									value={ values[ field.key ] || '' }
									options={ ( field.options || [] ).map(
										( opt ) => ( {
											label: opt.label,
											value: opt.value,
										} )
									) }
									onChange={ ( value ) =>
										setField( field.key, value )
									}
									disabled={ busy }
									className={
										fieldErrors[ field.key ]
											? 'has-error'
											: undefined
									}
									__nextHasNoMarginBottom
									__next40pxDefaultSize
								/>
							);
						}

						return (
							<div key={ field.key }>
								<TextControl
									label={ field.label }
									help={ help || undefined }
									type={
										field.type === 'password'
											? 'password'
											: field.type === 'url'
											? 'url'
											: 'text'
									}
									value={ values[ field.key ] || '' }
									placeholder={ field.placeholder || '' }
									onChange={ ( value ) =>
										setField( field.key, value )
									}
									disabled={ busy }
									autoComplete={
										field.type === 'password'
											? 'new-password'
											: 'off'
									}
									__nextHasNoMarginBottom
									__next40pxDefaultSize
								/>
								{ fieldErrors[ field.key ] ? (
									<p
										className="blockish-integration-field-error"
										role="alert"
									>
										{ fieldErrors[ field.key ] }
									</p>
								) : null }
							</div>
						);
					} ) }
				</div>

				{ item.settings_url ? (
					<p className="blockish-integration-modal__docs">
						<a
							href={ item.settings_url }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ __(
								'Open API key / credentials page',
								'blockish'
							) }
						</a>
					</p>
				) : null }

				<div className="blockish-integration-modal__footer">
					{ isConnected ? (
						<Button
							variant="tertiary"
							isDestructive
							onClick={ handleDisconnect }
							disabled={ busy }
							isBusy={ isDisconnecting }
						>
							{ __( 'Disconnect', 'blockish' ) }
						</Button>
					) : (
						<span />
					) }
					<div className="blockish-integration-modal__footer-right">
						<Button
							variant="tertiary"
							onClick={ onClose }
							disabled={ busy }
						>
							{ __( 'Cancel', 'blockish' ) }
						</Button>
						<Button
							variant="primary"
							className="blockish-button-base blockish-button-primary"
							onClick={ handleSave }
							disabled={ busy }
							isBusy={ isSaving }
						>
							{ isConnected
								? __( 'Save changes', 'blockish' )
								: __( 'Connect', 'blockish' ) }
						</Button>
					</div>
				</div>
			</VStack>
		</Modal>
	);
}
