import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { _n, sprintf } from '@wordpress/i18n';
import MetaIcon from './meta-icon';
import { countWords, getReadingMinutes } from './count-words';

export default function ReadingTimeItem( { item, postId, postType } ) {
	const content = useSelect(
		( select ) => {
			const post = select( coreStore ).getEditedEntityRecord(
				'postType',
				postType,
				postId
			);
			return post?.content?.raw ?? post?.content ?? '';
		},
		[ postId, postType ]
	);

	const wordsPerMinute = item.wordsPerMinute || 200;
	const minutes = getReadingMinutes( countWords( content ), wordsPerMinute );
	const label = sprintf(
		/* translators: %d: estimated reading time in minutes */
		_n( '%d min read', '%d min read', minutes, 'blockish' ),
		minutes
	);

	return (
		<span className="blockish-post-info__item is-type-reading-time">
			<MetaIcon item={ item } />
			<span className="blockish-post-info__text">
				{ item.beforeText }
				{ label }
			</span>
		</span>
	);
}
