import { dateI18n, getSettings as getDateSettings } from '@wordpress/date';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import MetaIcon from './meta-icon';

export default function TimeItem( { item, postId, postType } ) {
	const dateValue = useSelect(
		( select ) =>
			select( coreStore ).getEditedEntityRecord(
				'postType',
				postType,
				postId
			)?.date,
		[ postId, postType ]
	);

	const formatValue =
		item?.timeFormat?.value || item?.timeFormat || 'default';
	const siteFormat = getDateSettings()?.formats?.time || 'g:i a';
	const format = formatValue === 'default' ? siteFormat : formatValue;
	const label = dateValue
		? dateI18n( format, dateValue )
		: __( 'Time', 'blockish' );

	return (
		<span className="blockish-post-info__item is-type-time">
			<MetaIcon item={ item } />
			<span className="blockish-post-info__text">
				{ item.beforeText }
				{ label }
			</span>
		</span>
	);
}
