import { dateI18n, getSettings as getDateSettings } from '@wordpress/date';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import MetaIcon from './meta-icon';

export default function DateItem( { item, postId, postType, field = 'date' } ) {
	const { dateValue, link } = useSelect(
		( select ) => {
			const post = select( coreStore ).getEditedEntityRecord(
				'postType',
				postType,
				postId
			);
			return {
				dateValue: post?.[ field ],
				link: post?.link,
			};
		},
		[ postId, postType, field ]
	);

	const formatValue =
		item?.dateFormat?.value || item?.dateFormat || 'default';
	const siteFormat = getDateSettings()?.formats?.date || 'F j, Y';
	const format = formatValue === 'default' ? siteFormat : formatValue;
	const label = dateValue
		? dateI18n( format, dateValue )
		: __( 'Date', 'blockish' );

	const typeClass =
		field === 'modified' ? 'is-type-modified' : 'is-type-date';
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
				className={ `blockish-post-info__item ${ typeClass }` }
				href={ link }
				onClick={ ( event ) => event.preventDefault() }
			>
				{ content }
			</a>
		);
	}

	return (
		<span className={ `blockish-post-info__item ${ typeClass }` }>
			{ content }
		</span>
	);
}
