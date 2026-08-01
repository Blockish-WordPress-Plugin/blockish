import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { _n, sprintf } from '@wordpress/i18n';
import MetaIcon from './meta-icon';

export default function CommentsItem( { item, postId, postType } ) {
	const { count, link } = useSelect(
		( select ) => {
			const post = select( coreStore ).getEditedEntityRecord(
				'postType',
				postType,
				postId
			);
			return {
				count: post?.comment_count
					? parseInt( post.comment_count, 10 )
					: 0,
				link: post?.link ? `${ post.link }#comments` : undefined,
			};
		},
		[ postId, postType ]
	);

	const label = sprintf(
		/* translators: %d: number of comments */
		_n( '%d Comment', '%d Comments', count, 'blockish' ),
		count
	);

	const content = (
		<>
			<MetaIcon item={ item } />
			<span className="blockish-post-info__text">
				{ item.beforeText }
				{ label }
			</span>
		</>
	);

	if ( item.link && link ) {
		return (
			<a
				className="blockish-post-info__item is-type-comments"
				href={ link }
				onClick={ ( event ) => event.preventDefault() }
			>
				{ content }
			</a>
		);
	}

	return (
		<span className="blockish-post-info__item is-type-comments">
			{ content }
		</span>
	);
}
