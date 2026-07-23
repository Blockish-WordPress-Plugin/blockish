/**
 * Replace {count} {start} {end} {total} tokens in a label format.
 *
 * @param {string} template
 * @param {Object} tokens
 * @return {string}
 */
export function applyLabelFormat( template, tokens ) {
	return String( template || '' ).replace(
		/\{(count|start|end|total)\}/g,
		( _, key ) =>
			tokens[ key ] !== undefined && tokens[ key ] !== null
				? String( tokens[ key ] )
				: ''
	);
}

export const DEFAULT_TOTAL_FORMAT = '{count} results found';
export const DEFAULT_TOTAL_FORMAT_SINGULAR = '{count} result found';
export const DEFAULT_RANGE_FORMAT = 'Displaying {start} – {end} of {total}';
export const DEFAULT_RANGE_FORMAT_SINGLE = 'Displaying {start} of {total}';

/**
 * Build the visible Query Total label from attributes + numbers.
 *
 * @param {Object} options
 * @return {string}
 */
export function buildQueryTotalLabel( {
	displayType = 'total-results',
	foundPosts = 0,
	postsPerPage = 10,
	currentPage = 1,
	totalFormat = DEFAULT_TOTAL_FORMAT,
	totalFormatSingular = DEFAULT_TOTAL_FORMAT_SINGULAR,
	rangeFormat = DEFAULT_RANGE_FORMAT,
	rangeFormatSingle = DEFAULT_RANGE_FORMAT_SINGLE,
} ) {
	const total = Math.max( 0, Number( foundPosts ) || 0 );
	const perPage = Math.max( 1, Number( postsPerPage ) || 10 );
	const page = Math.max( 1, Number( currentPage ) || 1 );
	const start = total < 1 ? 0 : ( page - 1 ) * perPage + 1;
	const end = Math.min( start + perPage - 1, total );

	const tokens = {
		count: total,
		start,
		end,
		total,
	};

	if ( displayType === 'range-display' ) {
		const template =
			start === end
				? rangeFormatSingle || DEFAULT_RANGE_FORMAT_SINGLE
				: rangeFormat || DEFAULT_RANGE_FORMAT;
		return applyLabelFormat( template, tokens );
	}

	const template =
		1 === total
			? totalFormatSingular || DEFAULT_TOTAL_FORMAT_SINGULAR
			: totalFormat || DEFAULT_TOTAL_FORMAT;

	return applyLabelFormat( template, tokens );
}
