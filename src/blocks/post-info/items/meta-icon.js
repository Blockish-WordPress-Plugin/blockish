import { DEFAULT_ICONS, getItemType, getIconStyle } from '../icons';

export default function MetaIcon( { item } ) {
	const { BlockishIcon } = window?.blockish?.helpers || {};
	const type = getItemType( item );
	const iconStyle = getIconStyle( item );

	if ( iconStyle === 'none' || ! BlockishIcon ) {
		return null;
	}

	if ( item.showAvatar && type === 'author' ) {
		return null;
	}

	const icon =
		iconStyle === 'custom' && item.customIcon
			? item.customIcon
			: DEFAULT_ICONS[ type ];

	if ( ! icon ) {
		return null;
	}

	return (
		<span className="blockish-post-info__icon">
			<BlockishIcon icon={ icon } fill="currentColor" />
		</span>
	);
}
