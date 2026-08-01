import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';

export default function Edit( props ) {
	const { attributes } = props;
	const Tag = attributes.tag?.value || 'div';
	const blockProps = useBlockProps( {
		className: 'blockish-archive-description',
	} );

	return (
		<>
			<Inspector { ...props } />
			<Tag { ...blockProps }>
				{ __( 'Archive description will appear here.', 'blockish' ) }
			</Tag>
		</>
	);
}
