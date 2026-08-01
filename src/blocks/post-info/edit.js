import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';
import AuthorItem from './items/author';
import DateItem from './items/date';
import TimeItem from './items/time';
import CommentsItem from './items/comments';
import TermsItem from './items/terms';
import ReadingTimeItem from './items/reading-time';
import WordCountItem from './items/word-count';
import { getItemType } from './icons';
import './editor.scss';

const SEPARATOR_CHARS = {
	dot: '·',
	pipe: '|',
};

function renderItem( item, postId, postType ) {
	const type = getItemType( item );
	const shared = { item, postId, postType };

	switch ( type ) {
		case 'author':
			return <AuthorItem { ...shared } />;
		case 'date':
			return <DateItem { ...shared } field="date" />;
		case 'modified':
			return <DateItem { ...shared } field="modified" />;
		case 'time':
			return <TimeItem { ...shared } />;
		case 'comments':
			return <CommentsItem { ...shared } />;
		case 'terms':
			return <TermsItem { ...shared } />;
		case 'reading-time':
			return <ReadingTimeItem { ...shared } />;
		case 'word-count':
			return <WordCountItem { ...shared } />;
		default:
			return null;
	}
}

export default function Edit( props ) {
	const { attributes, context } = props;
	const { items = [], layout, separator } = attributes;
	const postId = context.postId;
	const postType = context.postType || 'post';
	const layoutValue = layout?.value || 'row';
	const separatorValue = separator?.value || 'none';

	const blockProps = useBlockProps( {
		className: `blockish-post-info is-layout-${ layoutValue } is-separator-${ separatorValue }`,
	} );

	if ( ! postId ) {
		return (
			<>
				<Inspector { ...props } />
				<ul { ...blockProps }>
					<li className="blockish-post-info__item">
						{ __(
							'Post info will appear here for the current post.',
							'blockish'
						) }
					</li>
				</ul>
			</>
		);
	}

	const char = SEPARATOR_CHARS[ separatorValue ];

	return (
		<>
			<Inspector { ...props } />
			<ul { ...blockProps }>
				{ items.map( ( item, index ) => (
					<li
						key={ item.id || index }
						className="blockish-post-info__entry"
					>
						{ renderItem( item, postId, postType ) }
						{ char && index < items.length - 1 && (
							<span
								className="blockish-post-info__separator"
								aria-hidden="true"
							>
								{ char }
							</span>
						) }
					</li>
				) ) }
			</ul>
		</>
	);
}
