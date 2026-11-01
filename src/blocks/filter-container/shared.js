/**
 * Split a block's filter terms ("Design, Branding") into unique, trimmed
 * terms. Matching is case-insensitive; the first spelling is kept for labels.
 *
 * @param {string} value Comma-separated terms.
 * @return {string[]} Terms.
 */
export const parseTerms = ( value ) => {
	const seen = new Set();
	return String( value || '' )
		.split( ',' )
		.map( ( term ) => term.trim() )
		.filter( ( term ) => {
			const key = term.toLowerCase();
			if ( ! term || seen.has( key ) ) {
				return false;
			}
			seen.add( key );
			return true;
		} );
};

/**
 * Unique terms across several blocks, in order of first appearance.
 *
 * @param {string[]} values Each block's comma-separated terms.
 * @return {string[]} Terms.
 */
export const collectTerms = ( values ) =>
	parseTerms( values.filter( Boolean ).join( ',' ) );

export const ALIGN_OPTIONS = [
	{ value: 'flex-start', label: 'Start' },
	{ value: 'center', label: 'Center' },
	{ value: 'flex-end', label: 'End' },
	{ value: 'space-between', label: 'Between' },
];
