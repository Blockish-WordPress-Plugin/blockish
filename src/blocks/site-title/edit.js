import { useBlockProps } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';
import './editor.scss';

export default function Edit( props ) {
	const { attributes } = props;
	const { linkToHome, openInNewTab, tag } = attributes;
	const Tag = tag?.value || 'h1';
	const { title, homeUrl } = useSelect( ( select ) => {
		const { canUser, getEntityRecord, getEditedEntityRecord } =
			select( coreStore );
		const canEdit = canUser( 'update', {
			kind: 'root',
			name: 'site',
		} );
		const settings = canEdit ? getEditedEntityRecord( 'root', 'site' ) : {};
		const readOnlySettings = getEntityRecord( 'root', '__unstableBase' );

		return {
			title: canEdit ? settings?.title : readOnlySettings?.name,
			homeUrl: readOnlySettings?.home || readOnlySettings?.url,
		};
	}, [] );
	const blockProps = useBlockProps( {
		className: 'blockish-site-title',
	} );
	const displayTitle =
		decodeEntities( title ) || __( 'Site Title', 'blockish' );

	return (
		<>
			<Inspector { ...props } />
			<Tag { ...blockProps }>
				{ linkToHome ? (
					<a
						href={ homeUrl }
						target={ openInNewTab ? '_blank' : undefined }
						rel={
							openInNewTab ? 'home noreferrer noopener' : 'home'
						}
						onClick={ ( event ) => event.preventDefault() }
					>
						{ displayTitle }
					</a>
				) : (
					displayTitle
				) }
			</Tag>
		</>
	);
}
