const getItemLabel = ( item, itemLabelName, index, defaultLabel, getLabel ) => {
	if ( typeof getLabel === 'function' ) {
		const custom = getLabel( item, index );
		if ( custom ) {
			return custom;
		}
	}

	if ( itemLabelName && item?.[ itemLabelName ] != null ) {
		const raw = item[ itemLabelName ];
		const label =
			typeof raw === 'object'
				? raw.label || raw.value || ''
				: String( raw );

		if ( typeof label === 'string' && label.trim().length > 0 ) {
			return label.length > 22 ? label.substring( 0, 22 ) : label;
		}
	}

	return `${ defaultLabel } #${ index + 1 }`;
};

export default getItemLabel;
