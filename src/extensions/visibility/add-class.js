import clsx from 'clsx';

/**
 * Editor preview classes — dim hidden blocks instead of removing them.
 *
 * @param {Object} wrapperProps
 * @param {Object} attributes
 * @return {Object}
 */
export default function withVisibilityWrapperProp(
	wrapperProps = {},
	attributes = {}
) {
	const hideOn =
		attributes?.hideOn && typeof attributes.hideOn === 'object'
			? attributes.hideOn
			: {};

	const classes = [];
	if ( hideOn.Desktop ) {
		classes.push( 'blockish-visibility-preview-desktop' );
	}
	if ( hideOn.Tablet ) {
		classes.push( 'blockish-visibility-preview-tablet' );
	}
	if ( hideOn.Mobile ) {
		classes.push( 'blockish-visibility-preview-mobile' );
	}

	if ( ! classes.length ) {
		return wrapperProps;
	}

	return {
		...wrapperProps,
		className: clsx( wrapperProps.className, classes ),
	};
}
