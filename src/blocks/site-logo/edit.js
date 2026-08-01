import {
	BlockControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	useBlockProps,
} from '@wordpress/block-editor';
import { isBlobURL } from '@wordpress/blob';
import { Button, Placeholder, Spinner } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { upload } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import Inspector from './inspector';
import './editor.scss';

const ALLOWED_MEDIA_TYPES = [ 'image' ];

export default function Edit( props ) {
	const { attributes, setAttributes } = props;
	const { linkToHome, openInNewTab } = attributes;
	const [ temporaryURL, setTemporaryURL ] = useState();
	const { createErrorNotice } = useDispatch( noticesStore );
	const { editEntityRecord } = useDispatch( coreStore );

	const { canUserEdit, siteLogoId, media, homeUrl, siteName } = useSelect(
		( select ) => {
			const {
				canUser,
				getEntityRecord,
				getEditedEntityRecord,
				getMedia,
			} = select( coreStore );
			const canEdit = !! canUser( 'update', {
				kind: 'root',
				name: 'site',
			} );
			const siteSettings = canEdit
				? getEditedEntityRecord( 'root', 'site' )
				: null;
			const siteData = getEntityRecord( 'root', '__unstableBase' );
			const logoId = canEdit
				? siteSettings?.site_logo
				: siteData?.site_logo;

			return {
				canUserEdit: canEdit,
				siteLogoId: logoId,
				media: logoId ? getMedia( logoId ) : null,
				homeUrl: siteData?.home || siteData?.url,
				siteName: canEdit ? siteSettings?.title : siteData?.name,
			};
		},
		[]
	);

	const logoUrl = media?.source_url;
	const blockProps = useBlockProps( {
		className: `blockish-site-logo${ temporaryURL ? ' is-transient' : '' }`,
	} );

	useEffect( () => {
		if ( logoUrl && temporaryURL ) {
			setTemporaryURL();
		}
	}, [ logoUrl, temporaryURL ] );

	const setLogo = ( newValue ) => {
		editEntityRecord( 'root', 'site', undefined, {
			site_logo: newValue,
		} );
	};

	const onSelectImage = ( value ) => {
		if ( ! value ) {
			return;
		}

		if ( ! value.id && value.url ) {
			setTemporaryURL( value.url );
			setLogo( undefined );
			return;
		}

		if ( value.id ) {
			setLogo( value.id );
		}

		if ( value.url && isBlobURL( value.url ) ) {
			setTemporaryURL( value.url );
		}
	};

	const onResetImage = () => {
		setLogo( null );
		setAttributes( {
			linkToHome: true,
			openInNewTab: false,
		} );
	};

	const onUploadError = ( message ) => {
		createErrorNotice( message, { type: 'snackbar' } );
		setTemporaryURL();
	};

	const placeholder = ( content ) => (
		<Placeholder
			className="block-editor-media-placeholder"
			withIllustration
		>
			{ content }
		</Placeholder>
	);

	const label = __( 'Add a site logo', 'blockish' );
	let image;

	if ( ! canUserEdit && ! siteLogoId ) {
		image = placeholder();
	} else if ( ! siteLogoId && ! temporaryURL ) {
		image = (
			<MediaPlaceholder
				onSelect={ onSelectImage }
				accept="image/*"
				allowedTypes={ ALLOWED_MEDIA_TYPES }
				onError={ onUploadError }
				placeholder={ placeholder }
				mediaLibraryButton={ ( { open } ) => (
					<Button
						__next40pxDefaultSize
						icon={ upload }
						variant="primary"
						label={ label }
						showTooltip
						tooltipPosition="top center"
						onClick={ open }
					/>
				) }
			/>
		);
	} else if ( ! media && ! temporaryURL ) {
		image = placeholder();
	} else {
		const img = (
			<>
				<img
					className="blockish-site-logo__image custom-logo"
					src={ temporaryURL || logoUrl }
					alt={ media?.alt_text || siteName || '' }
				/>
				{ temporaryURL && <Spinner /> }
			</>
		);

		image = linkToHome ? (
			<a
				href={ homeUrl }
				className="custom-logo-link"
				rel={ openInNewTab ? 'home noreferrer noopener' : 'home' }
				target={ openInNewTab ? '_blank' : undefined }
				onClick={ ( event ) => event.preventDefault() }
			>
				{ img }
			</a>
		) : (
			img
		);
	}

	return (
		<>
			{ ! temporaryURL && <Inspector { ...props } /> }
			{ !! media && canUserEdit && (
				<BlockControls group="other">
					<MediaReplaceFlow
						mediaId={ siteLogoId }
						mediaURL={ logoUrl }
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						accept="image/*"
						onSelect={ onSelectImage }
						onError={ onUploadError }
						onReset={ onResetImage }
					/>
				</BlockControls>
			) }
			<figure { ...blockProps }>{ image }</figure>
		</>
	);
}
