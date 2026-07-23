import { useBlockProps } from '@wordpress/block-editor';
import { useEntityProp } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';
import './editor.scss';

export default function Edit( props ) {
	const { attributes, context } = props;
	const { linkToPost, openInNewTab, tag } = attributes;
	const postId = context.postId;
	const postType = context.postType || 'post';
	const Tag = tag?.value || 'h2';
	const [ title ] = useEntityProp( 'postType', postType, 'title', postId );
	const [ link ] = useEntityProp( 'postType', postType, 'link', postId );
	const blockProps = useBlockProps( {
		className: 'blockish-post-title',
	} );
	const displayTitle = title || __( 'Post Title', 'blockish' );

	return (
		<>
			<Inspector { ...props } />
			<Tag { ...blockProps }>
				{ linkToPost ? (
					<a
						href={ link || '#' }
						target={ openInNewTab ? '_blank' : undefined }
						rel={ openInNewTab ? 'noreferrer noopener' : undefined }
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
