import { registerBlockType } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import { collectTerms, parseTerms } from './shared';

registerBlockType( metadata.name, {
	icon: () => window?.blockish?.components?.blockIcons?.filterContainer,
	edit: Edit,
	save: Save,
} );

/**
 * "Filter and search" panel on every Blockish block inside a Filter Container:
 * filter terms (buttons) and search keywords (search box).
 * Terms already used in that container are offered as one-click chips, so
 * blocks share the same spelling. Rendered only once Blockish's controls and
 * helpers are loaded (see the filter below).
 *
 * @param {Object} props          Component props.
 * @param {string} props.clientId Block client id.
 */
function FilterTermsPanel( { clientId } ) {
	const { useExtensionsAttributes } = window.blockish.helpers;
	const BlockishControl = window.blockish.controls.BlockishControl;

	const { containerId, usedTerms } = useSelect(
		( select ) => {
			const { getBlockParentsByBlockName, getClientIdsOfDescendants, getBlockAttributes } =
				select( blockEditorStore );
			const parents = getBlockParentsByBlockName( clientId, metadata.name );
			const container = parents[ parents.length - 1 ];
			return {
				containerId: container,
				usedTerms: container
					? collectTerms(
						getClientIdsOfDescendants( [ container ] ).map(
							( id ) => getBlockAttributes( id )?.filterTerms
						)
					)
					: [],
			};
		},
		[ clientId ]
	);
	const { attributes, setAttributes } = useExtensionsAttributes( clientId );

	if ( ! containerId ) {
		return null;
	}

	const own = parseTerms( attributes?.filterTerms );
	const ownKeys = own.map( ( term ) => term.toLowerCase() );
	const suggestions = usedTerms.filter( ( term ) => ! ownKeys.includes( term.toLowerCase() ) );

	return (
		<BlockishControl
			type="BlockishPanelBody"
			title={ __( 'Filter and search', 'blockish' ) }
			initialOpen={ true }
			indicatorSlugs={ [ 'filterTerms', 'searchKeywords' ] }
		>
			<BlockishControl
				type="TextControl"
				label={ __( 'Filter terms', 'blockish' ) }
				help={ __(
					'Comma-separated, e.g. Design, Branding. Blocks without terms are not filtered.',
					'blockish'
				) }
				value={ attributes?.filterTerms || '' }
				onChange={ ( filterTerms ) => setAttributes( { filterTerms } ) }
			/>
			{ suggestions.length > 0 && (
				<div className="blockish-filter-suggestions">
					{ suggestions.map( ( term ) => (
						<button
							key={ term }
							type="button"
							className="blockish-filter-suggestion"
							onClick={ () => setAttributes( { filterTerms: [ ...own, term ].join( ', ' ) } ) }
						>
							+ { term }
						</button>
					) ) }
				</div>
			) }
			<BlockishControl
				type="TextControl"
				label={ __( 'Search keywords', 'blockish' ) }
				help={ __(
					'Words this block is found by in the search box, comma-separated. Filter terms are searched too.',
					'blockish'
				) }
				value={ attributes?.searchKeywords || '' }
				onChange={ ( searchKeywords ) => setAttributes( { searchKeywords } ) }
			/>
		</BlockishControl>
	);
}

addFilter(
	'blockish.tabs.after-tab-content',
	'blockish/filter-terms-panel',
	createHigherOrderComponent(
		( WrappedComponent ) => ( props ) => {
			const { tabName, blockName, clientId } = props;
			const ready = window?.blockish?.helpers?.useExtensionsAttributes && window?.blockish?.controls?.BlockishControl;
			// First tab: "content" on most blocks, "layout" on Container.
			const firstTab = tabName === 'content' || tabName === 'layout';
			if ( ! ready || ! firstTab || ! blockName?.startsWith( 'blockish' ) || blockName === metadata.name ) {
				return <WrappedComponent { ...props } />;
			}
			return (
				<>
					<WrappedComponent { ...props } />
					<FilterTermsPanel clientId={ clientId } />
				</>
			);
		},
		'withFilterTermsPanel'
	)
);
