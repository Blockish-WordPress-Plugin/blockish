import { __ } from '@wordpress/i18n';

/**
 * Common container tags suitable for html-wrapper.
 */
export const COMMON_WRAPPER_TAGS = [
	'div',
	'section',
	'article',
	'header',
	'footer',
	'nav',
	'main',
	'aside',
	'form',
	'ul',
	'ol',
	'li',
	'figure',
	'figcaption',
	'details',
	'summary',
	'fieldset',
];

/**
 * Tag options for inspector BlockishSelect control.
 */
export const TAG_OPTIONS = [
	...COMMON_WRAPPER_TAGS.map( ( tag ) => ( { label: tag, value: tag } ) ),
	{ label: __( 'Custom…', 'blockish' ), value: 'custom' },
];

/**
 * Void HTML elements that cannot have any child nodes (self-closing).
 */
export const VOID_TAGS = new Set( [
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr',
] );

/**
 * HTML tags that must never be rendered (XSS / page-hijack vectors).
 * Applied to dropdown selections, custom tags, and staged schemas.
 */
export const BLOCKED_TAGS = new Set( [
	'applet',
	'base',
	'body',
	'embed',
	'frame',
	'frameset',
	'head',
	'html',
	'iframe',
	'link',
	'math',
	'meta',
	'noscript',
	'object',
	'script',
	'style',
	'svg',
	'template',
	'title',
] );

/**
 * Sanitize an HTML tag name for wrapper.
 * Always ensures it is a non-void container tag.
 *
 * @param {string} tag
 * @param {string} fallback
 * @return {string}
 */
export function sanitizeTagName( tag, fallback = 'div' ) {
	if ( typeof tag !== 'string' ) {
		return fallback;
	}
	const cleaned = tag
		.trim()
		.toLowerCase()
		.replace( /[^a-z0-9-]/g, '' );

	if (
		! cleaned ||
		VOID_TAGS.has( cleaned ) ||
		BLOCKED_TAGS.has( cleaned )
	) {
		return fallback;
	}
	return cleaned;
}

/**
 * Extract tag string from either an object ({ label, value }) or string.
 *
 * @param {string|{label?: string, value?: string}} tag
 * @param {string} fallback
 * @return {string}
 */
export function getTagValue( tag, fallback = 'div' ) {
	if ( ! tag ) {
		return fallback;
	}
	if ( typeof tag === 'object' && tag !== null ) {
		return sanitizeTagName( tag.value || tag.label, fallback );
	}
	if ( typeof tag === 'string' ) {
		return sanitizeTagName( tag, fallback );
	}
	return fallback;
}

/**
 * Parse a CSS style string (e.g. "color: red; margin: 10px") into a React style object.
 *
 * @param {string} styleStr
 * @return {Record<string, string>|undefined}
 */
export function parseStyleString( styleStr ) {
	if ( ! styleStr || typeof styleStr !== 'string' ) {
		return undefined;
	}
	const styles = {};
	styleStr.split( ';' ).forEach( ( rule ) => {
		const colonIndex = rule.indexOf( ':' );
		if ( colonIndex > -1 ) {
			const rawProp = rule.slice( 0, colonIndex ).trim();
			const rawVal = rule.slice( colonIndex + 1 ).trim();
			if ( rawProp && rawVal ) {
				const prop = rawProp.startsWith( '--' )
					? rawProp
					: rawProp.replace( /-([a-z])/g, ( _, c ) =>
							c.toUpperCase()
					  );
				styles[ prop ] = rawVal;
			}
		}
	} );
	return Object.keys( styles ).length > 0 ? styles : undefined;
}

/**
 * Attributes whose values browsers resolve as URLs.
 */
const URL_PROPS = new Set( [
	'action',
	'background',
	'cite',
	'formaction',
	'href',
	'ping',
	'poster',
	'src',
	'srcset',
	'usemap',
	'xlink:href',
] );

/**
 * Schemes allowed in URL-bearing attribute values. Relative URLs (no
 * scheme) are always allowed; data: is limited to script-safe raster
 * image types (SVG excluded because it can carry script).
 */
const SAFE_URL_SCHEMES =
	/^(?:https?|ftps?|mailto|tel|sms|data:image\/(?:png|jpe?g|gif|webp|avif|bmp);)/i;

/**
 * Check a URL attribute value for dangerous schemes such as javascript:.
 * Browsers ignore whitespace and control characters when parsing the
 * scheme, so they are stripped before matching.
 *
 * @param {string} value
 * @return {boolean} True when the value is safe or not a scheme URL.
 */
function isSafeUrlValue( value ) {
	if ( typeof value !== 'string' || ! value ) {
		return true;
	}
	const cleaned = value.replace( /[\s\x00-\x1f]+/g, '' ).toLowerCase();
	if ( ! /^[a-z][a-z0-9+.-]*:/.test( cleaned ) ) {
		return true;
	}
	return SAFE_URL_SCHEMES.test( cleaned );
}

/**
 * Convert an array of { key, value } objects to a plain object.
 * Event-handler keys (on*) and dangerouslySetInnerHTML are dropped, and
 * URL-bearing values are scheme-checked, so stored markup cannot execute
 * script even when attributes are injected through saved block JSON.
 *
 * @param {Array<{ key: string, value: string }>} props
 * @return {Record<string, string>} Plain object of sanitized attributes.
 */
export function propsArrayToObject( props ) {
	if ( ! Array.isArray( props ) ) {
		return {};
	}
	const result = {};
	props.forEach( ( item ) => {
		const key = ( item?.key || '' ).trim();
		if ( ! key ) {
			return;
		}
		if ( /^on/i.test( key ) || key === 'dangerouslySetInnerHTML' ) {
			return;
		}
		const value = item?.value ?? '';
		if ( URL_PROPS.has( key.toLowerCase() ) && ! isSafeUrlValue( value ) ) {
			return;
		}
		result[ key ] = value;
	} );
	return result;
}
