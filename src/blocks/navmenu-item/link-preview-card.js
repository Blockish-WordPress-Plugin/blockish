import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { Icon, VisuallyHidden } from '@wordpress/components';
import { useRef } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import { chevronDown, check } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

const STATUS_LABELS = {
	publish: __( 'Published', 'blockish' ),
	draft: __( 'Draft', 'blockish' ),
	pending: __( 'Pending', 'blockish' ),
	private: __( 'Private', 'blockish' ),
	future: __( 'Scheduled', 'blockish' ),
};

const getDisplayPath = ( link ) => {
	let path;
	try {
		path = new URL( link ).pathname;
	} catch ( e ) {
		path = link;
	}
	return path && path !== '/' ? path : null;
};

export default function LinkPreviewCard( {
	url,
	label,
	linkId,
	linkType,
	record,
	onClick,
} ) {
	const postType = useSelect(
		( select ) => ( linkType ? select( coreStore ).getPostType( linkType ) : null ),
		[ linkType ]
	);
	const onNavigateToEntityRecord = useSelect(
		( select ) =>
			select( blockEditorStore ).getSettings().onNavigateToEntityRecord,
		[]
	);
	const buttonRef = useRef( null );

	const title = decodeEntities( record?.title?.rendered || label || url );
	const path = getDisplayPath( record?.link || url );
	const statusLabel = record?.status && STATUS_LABELS[ record.status ];
	const showActions = !! linkId && !! record;

	return (
		<div className="blockish-link-preview-card">
			<button
				ref={ buttonRef }
				type="button"
				className="blockish-link-preview-card__trigger"
				onClick={ () => onClick( buttonRef.current ) }
			>
				<span className="blockish-link-preview-card__main">
					<span className="blockish-link-preview-card__title">{ title }</span>
					{ path && (
						<span className="blockish-link-preview-card__url">{ path }</span>
					) }
					{ ( postType || statusLabel ) && (
						<span className="blockish-link-preview-card__badges">
							{ postType && (
								<span className="blockish-link-preview-card__badge">
									{ postType.labels.singular_name }
								</span>
							) }
							{ statusLabel && (
								<span className="blockish-link-preview-card__badge blockish-link-preview-card__badge--status">
									{ record.status === 'publish' && (
										<Icon icon={ check } size={ 14 } />
									) }
									{ statusLabel }
								</span>
							) }
						</span>
					) }
				</span>
				<Icon icon={ chevronDown } />
			</button>
			{ showActions && (
				<div className="blockish-link-preview-card__actions">
					{ onNavigateToEntityRecord ? (
						<button
							type="button"
							className="blockish-link-preview-card__action"
							onClick={ () =>
								onNavigateToEntityRecord( {
									postId: linkId,
									postType: linkType,
								} )
							}
						>
							{ __( 'Edit', 'blockish' ) }
						</button>
					) : (
						<a
							href={ addQueryArgs( 'post.php', { post: linkId, action: 'edit' } ) }
							className="blockish-link-preview-card__action"
						>
							{ __( 'Edit', 'blockish' ) }
						</a>
					) }
					<a
						href={ record.link }
						target="_blank"
						rel="noopener noreferrer"
						className="blockish-link-preview-card__action"
					>
						{ __( 'View', 'blockish' ) }
						<VisuallyHidden as="span">
							{ __( ' (opens in a new tab)', 'blockish' ) }
						</VisuallyHidden>
					</a>
				</div>
			) }
		</div>
	);
}
