import { useBlockProps } from '@wordpress/block-editor';
import { createContext, useContext } from '@wordpress/element';
import Inspector from './inspector';
import { buildQueryTotalLabel } from './format-label';

const FallbackQueryContext = createContext( {
	posts: null,
	isLoading: true,
	foundPosts: null,
	postsPerPage: null,
} );

export default function Edit( props ) {
	const { attributes } = props;
	const Tag = attributes.tag?.value || 'p';
	const displayType = attributes.displayType?.value || 'total-results';
	const QueryContext =
		window.BlockishDynamicityQueryContext || FallbackQueryContext;
	const queryCtx = useContext( QueryContext );

	const hasLiveTotal =
		queryCtx &&
		typeof queryCtx.foundPosts === 'number' &&
		! queryCtx.isLoading;

	const label = buildQueryTotalLabel( {
		displayType,
		foundPosts: hasLiveTotal ? queryCtx.foundPosts : 42,
		postsPerPage: hasLiveTotal ? queryCtx.postsPerPage : 10,
		currentPage: 1,
		totalFormat: attributes.totalFormat,
		totalFormatSingular: attributes.totalFormatSingular,
		rangeFormat: attributes.rangeFormat,
		rangeFormatSingle: attributes.rangeFormatSingle,
	} );

	const blockProps = useBlockProps( {
		className: 'blockish-query-total',
	} );

	return (
		<>
			<Inspector { ...props } />
			<Tag { ...blockProps }>{ label }</Tag>
		</>
	);
}
