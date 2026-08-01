import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import MetaIcon from './meta-icon';

export default function AuthorItem( { item, postId, postType } ) {
	const { authorId, author } = useSelect(
		( select ) => {
			const post = select( coreStore ).getEditedEntityRecord(
				'postType',
				postType,
				postId
			);
			const id = post?.author;
			return {
				authorId: id,
				author: id
					? select( coreStore ).getEntityRecord( 'root', 'user', id )
					: null,
			};
		},
		[ postId, postType ]
	);

	const name = author?.name || author?.nickname || __( 'Author', 'blockish' );
	const href = author?.link;
	const avatarSize = item.avatarSize || 16;
	const content = (
		<>
			{ item.showAvatar && authorId ? (
				<img
					className="blockish-post-info__avatar"
					src={
						author?.avatar_urls?.[ '96' ] ||
						author?.avatar_urls?.[ '48' ]
					}
					alt=""
					width={ avatarSize }
					height={ avatarSize }
					style={ {
						width: avatarSize,
						height: avatarSize,
					} }
				/>
			) : (
				<MetaIcon item={ item } />
			) }
			<span className="blockish-post-info__text">
				{ item.beforeText }
				{ name }
			</span>
		</>
	);

	if ( item.link && href ) {
		return (
			<a
				className="blockish-post-info__item is-type-author"
				href={ href }
				onClick={ ( event ) => event.preventDefault() }
			>
				{ content }
			</a>
		);
	}

	return (
		<span className="blockish-post-info__item is-type-author">
			{ content }
		</span>
	);
}
