import { useBlockProps } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';

export default function Edit( props ) {
	const { attributes } = props;
	const { tag } = attributes;
	const Tag = tag?.value || 'p';
	const { description } = useSelect( ( select ) => {
		const { canUser, getEntityRecord, getEditedEntityRecord } =
			select( coreStore );
		const canEdit = canUser( 'update', {
			kind: 'root',
			name: 'site',
		} );
		const settings = canEdit ? getEditedEntityRecord( 'root', 'site' ) : {};
		const readOnlySettings = getEntityRecord( 'root', '__unstableBase' );

		return {
			description: canEdit
				? settings?.description
				: readOnlySettings?.description,
		};
	}, [] );
	const blockProps = useBlockProps( {
		className: 'blockish-site-tagline',
	} );
	const displayTagline =
		decodeEntities( description ) || __( 'Site Tagline', 'blockish' );

	return (
		<>
			<Inspector { ...props } />
			<Tag { ...blockProps }>{ displayTagline }</Tag>
		</>
	);
}
