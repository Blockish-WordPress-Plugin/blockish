import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';

export default function Edit( props ) {
	const { attributes } = props;
	const Tag = attributes.tag?.value || 'div';
	const blockProps = useBlockProps( {
		className: 'blockish-post-content',
	} );

	return (
		<>
			<Inspector { ...props } />
			<Tag { ...blockProps }>
				<p>
					{ __(
						'This is the Post Content block. On the frontend, it will display all the blocks from the current post or page.',
						'blockish'
					) }
				</p>
				<p>
					{ __(
						'That content might be a simple series of paragraphs, or a richer layout containing images, galleries, videos, tables, columns, and other blocks.',
						'blockish'
					) }
				</p>
				<p>
					{ __(
						'It also works with custom post types and will be replaced by the current entry content on the frontend.',
						'blockish'
					) }
				</p>
			</Tag>
		</>
	);
}
