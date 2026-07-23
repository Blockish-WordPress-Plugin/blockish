import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { _n, sprintf } from '@wordpress/i18n';
import MetaIcon from './meta-icon';
import { countWords } from './count-words';

export default function WordCountItem( { item, postId, postType } ) {
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

	const count = countWords( content );
	const label = sprintf(
		/* translators: %d: number of words */
		_n( '%d word', '%d words', count, 'blockish' ),
		count
	);

	return (
		<span className="blockish-post-info__item is-type-word-count">
			<MetaIcon item={ item } />
			<span className="blockish-post-info__text">
				{ item.beforeText }
				{ label }
			</span>
		</span>
	);
}
