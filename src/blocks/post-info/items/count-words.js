/**
 * Count words from HTML/post content (editor + shared helpers).
 *
 * @param {string} content Raw post content / HTML.
 * @return {number} Word count.
 */
export function countWords( content = '' ) {
	const text = String( content )
		.replace( /<!--[\s\S]*?-->/g, ' ' )
		.replace( /<[^>]+>/g, ' ' )
		.replace( /&nbsp;/gi, ' ' )
		.replace( /\s+/g, ' ' )
		.trim();

	if ( ! text ) {
		return 0;
	}

	return text.split( ' ' ).filter( Boolean ).length;
}

/**
 * Estimate reading time in minutes (minimum 1 when there is content).
 *
 * @param {number} wordCount
 * @param {number} wordsPerMinute
 * @return {number}
 */
export function getReadingMinutes( wordCount, wordsPerMinute = 200 ) {
	const wpm = Math.max( 1, wordsPerMinute || 200 );
	if ( wordCount < 1 ) {
		return 0;
	}
	return Math.max( 1, Math.ceil( wordCount / wpm ) );
}
