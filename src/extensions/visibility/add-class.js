import clsx from 'clsx';

const DEVICE_CLASS = {
	Desktop: 'blockish-visibility-preview-desktop',
	Tablet: 'blockish-visibility-preview-tablet',
	Mobile: 'blockish-visibility-preview-mobile',
};

/**
 * Editor preview classes — dim only on the device preview that is hidden.
 *
 * @param {Object} wrapperProps
 * @param {Object} attributes
 * @param {Object} extra
 * @return {Object}
 */
export default function withVisibilityWrapperProp(
	wrapperProps = {},
	attributes = {},
	extra = {}
) {
	const hideOn =
		attributes?.hideOn && typeof attributes.hideOn === 'object'
			? attributes.hideOn
			: {};

	const deviceType = extra.deviceType || 'Desktop';
	const previewClass = DEVICE_CLASS[ deviceType ];

	if ( ! previewClass || ! hideOn[ deviceType ] ) {
		return wrapperProps;
	}

	return {
		...wrapperProps,
		className: clsx( wrapperProps.className, previewClass ),
	};
}
