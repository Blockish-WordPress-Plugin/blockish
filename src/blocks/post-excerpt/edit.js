import { useBlockProps } from '@wordpress/block-editor';
import { useEntityProp } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';

export default function Edit( props ) {
	const { attributes, context } = props;
	const { excerptLength, moreText, showMoreOnNewLine } = attributes;
	const postId = context.postId;
	const postType = context.postType || 'post';
	const [ excerpt ] = useEntityProp(
		'postType',
		postType,
		'excerpt',
		postId
	);
	const words = ( excerpt || '' ).trim().split( /\s+/ ).filter( Boolean );
	const preview = words.slice( 0, excerptLength ).join( ' ' );
	const blockProps = useBlockProps( {
		className: 'blockish-post-excerpt',
	} );

	return (
		<>
			<Inspector { ...props } />
			<div { ...blockProps }>
				<p className="blockish-post-excerpt__text">
					{ preview ||
						__( 'Post excerpt will appear here.', 'blockish' ) }
					{ moreText && ! showMoreOnNewLine && (
						<>
							{ ' ' }
							<a
								className="blockish-post-excerpt__more-link"
								href="#"
								onClick={ ( event ) => event.preventDefault() }
							>
								{ moreText }
							</a>
						</>
					) }
				</p>
				{ moreText && showMoreOnNewLine && (
					<p className="blockish-post-excerpt__more-text">
						<a
							className="blockish-post-excerpt__more-link"
							href="#"
							onClick={ ( event ) => event.preventDefault() }
						>
							{ moreText }
						</a>
					</p>
				) }
			</div>
		</>
	);
}
