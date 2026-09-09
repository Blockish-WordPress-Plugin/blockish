import { useEffect, useRef, useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import { Button, Modal, Icon } from '@wordpress/components';
import { chevronLeft, plus, columns, layout } from '@wordpress/icons';
import { MEGAMENU_PRESETS, getPresetById } from './presets';

const PRESET_ICONS = {
	blank: plus,
	'three-column': columns,
};

export default function CreateMegamenuFlow( { onCancel, onSuccess } ) {
	const [ step, setStep ] = useState( 'presets' );
	const [ presetId, setPresetId ] = useState( null );
	const [ title, setTitle ] = useState( '' );
	const [ isCreating, setIsCreating ] = useState( false );
	const [ error, setError ] = useState( '' );
	const titleInputRef = useRef( null );
	const { saveEntityRecord } = useDispatch( coreStore );

	const selectedPreset = presetId ? getPresetById( presetId ) : null;

	useEffect( () => {
		if ( step === 'title' && titleInputRef.current ) {
			titleInputRef.current.focus();
			titleInputRef.current.select();
		}
	}, [ step ] );

	const handleSelectPreset = ( id ) => {
		const preset = getPresetById( id );
		setPresetId( id );
		setTitle( preset?.suggestedTitle || '' );
		setError( '' );
		setStep( 'title' );
	};

	const handleCreate = async ( event ) => {
		event?.preventDefault?.();

		const trimmed = title.trim();
		if ( ! trimmed ) {
			setError( __( 'Please enter a mega menu title.', 'blockish' ) );
			titleInputRef.current?.focus();
			return;
		}

		setIsCreating( true );
		setError( '' );

		try {
			const preset = getPresetById( presetId );
			const megamenu = await saveEntityRecord(
				'postType',
				'blockish_megamenu',
				{
					title: trimmed,
					content: preset?.content || '',
					status: 'publish',
				}
			);

			if ( typeof onSuccess === 'function' ) {
				onSuccess( megamenu );
			}
		} catch ( err ) {
			// eslint-disable-next-line no-console
			console.error( err );
			setError(
				__(
					'Could not create the mega menu. Please try again.',
					'blockish'
				)
			);
			setIsCreating( false );
		}
	};

	const handleRequestClose = () => {
		if ( isCreating ) {
			return;
		}
		onCancel();
	};

	return (
		<Modal
			title={
				step === 'presets'
					? __( 'Add Mega Menu', 'blockish' )
					: __( 'Name your mega menu', 'blockish' )
			}
			onRequestClose={ handleRequestClose }
			className={ `create-megamenu-modal create-megamenu-modal--${ step }` }
			size={ step === 'presets' ? 'large' : 'medium' }
		>
			{ step === 'presets' ? (
				<div className="create-megamenu-modal__presets">
					<p className="create-megamenu-modal__lead">
						{ __(
							'Choose a starting point. You can customize the layout after creating the mega menu.',
							'blockish'
						) }
					</p>
					<div className="preset-grid">
						{ MEGAMENU_PRESETS.map( ( preset ) => (
							<button
								key={ preset.id }
								type="button"
								className={ `preset-card${
									preset.id === 'blank'
										? ' preset-card--blank'
										: ''
								}` }
								onClick={ () =>
									handleSelectPreset( preset.id )
								}
							>
								<span className="preset-card__icon">
									<Icon
										icon={
											PRESET_ICONS[ preset.id ] || layout
										}
									/>
								</span>
								<span className="preset-card__body">
									<span className="preset-card__title">
										{ preset.title }
									</span>
									<span className="preset-card__description">
										{ preset.description }
									</span>
								</span>
							</button>
						) ) }
					</div>
				</div>
			) : (
				<form
					className="create-megamenu-modal__name"
					onSubmit={ handleCreate }
				>
					<Button
						className="create-megamenu-modal__back"
						icon={ chevronLeft }
						variant="tertiary"
						onClick={ () => setStep( 'presets' ) }
						disabled={ isCreating }
					>
						{ __( 'Change preset', 'blockish' ) }
					</Button>

					{ selectedPreset ? (
						<div className="create-megamenu-modal__selected">
							<span className="create-megamenu-modal__selected-icon">
								<Icon
									icon={
										PRESET_ICONS[ selectedPreset.id ] ||
										layout
									}
								/>
							</span>
							<div className="create-megamenu-modal__selected-copy">
								<span className="create-megamenu-modal__selected-label">
									{ __(
										'Selected preset',
										'blockish'
									) }
								</span>
								<strong>{ selectedPreset.title }</strong>
							</div>
						</div>
					) : null }

					<label
						className="create-megamenu-modal__field"
						htmlFor="blockish-new-megamenu-title"
					>
						<span className="create-megamenu-modal__field-label">
							{ __( 'Mega menu title', 'blockish' ) }
						</span>
						<input
							ref={ titleInputRef }
							id="blockish-new-megamenu-title"
							className="create-megamenu-modal__input"
							type="text"
							value={ title }
							onChange={ ( event ) => {
								setTitle( event.target.value );
								if ( error ) {
									setError( '' );
								}
							} }
							placeholder={ __(
								'e.g. Shop Mega Menu',
								'blockish'
							) }
							disabled={ isCreating }
							aria-invalid={ !! error }
						/>
					</label>

					{ error ? (
						<p
							className="create-megamenu-modal__error"
							role="alert"
						>
							{ error }
						</p>
					) : (
						<p className="create-megamenu-modal__help">
							{ __(
								'You can rename this anytime later.',
								'blockish'
							) }
						</p>
					) }

					<div className="create-megamenu-modal__footer">
						<Button
							variant="tertiary"
							onClick={ onCancel }
							disabled={ isCreating }
						>
							{ __( 'Cancel', 'blockish' ) }
						</Button>
						<Button
							variant="primary"
							type="submit"
							isBusy={ isCreating }
							disabled={ isCreating || ! title.trim() }
						>
							{ __( 'Create mega menu', 'blockish' ) }
						</Button>
					</div>
				</form>
			) }
		</Modal>
	);
}
