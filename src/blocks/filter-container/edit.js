import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import Inspector from './inspector';
import Controls from './controls';
import { collectTerms } from './shared';
import './editor.scss';

const card = ( tone, title, text, filterTerms, searchKeywords ) => [
	'blockish/container',
	{ className: `blockish-filter-card is-tone-${ tone }`, filterTerms, searchKeywords, isVariationPicked: true },
	[
		[ 'blockish/paragraph', { content: filterTerms.split( ',' ).join( ' ·' ), className: 'blockish-filter-card-label' } ],
		[ 'blockish/heading', { content: title, tag: { label: 'H3', value: 'h3' } } ],
		[ 'blockish/paragraph', { content: text } ],
	],
];

// Starter items: colored cards with filter terms and search keywords, so the
// buttons and the search box work right away.
const TEMPLATE = [
	card( 'violet', 'Brand identity', 'Logo, colors and type for a new studio.', 'Design, Branding', 'brand identity, logo, studio' ),
	card( 'mint', 'Online store', 'A fast WooCommerce shop with custom checkout.', 'Development', 'online store, shop, woocommerce, checkout' ),
	card( 'peach', 'Poster series', 'Five posters for a summer music festival.', 'Design', 'poster, festival, music' ),
	card( 'sky', 'Booking app', 'Web app for a chain of yoga studios.', 'Development', 'booking app, web app, yoga' ),
	card( 'rose', 'Packaging', 'Labels and boxes for a coffee roaster.', 'Design, Branding', 'packaging, labels, coffee' ),
	card( 'lemon', 'Marketing site', 'A landing page with motion and forms.', 'Development, Design', 'marketing site, landing page, forms' ),
];

export default function Edit( { attributes, advancedControls, clientId } ) {
	const { itemsLayout } = attributes;

	// Buttons preview: the terms given to blocks anywhere inside.
	const terms = useSelect(
		( select ) => {
			const { getClientIdsOfDescendants, getBlockAttributes } =
				select( blockEditorStore );
			return collectTerms(
				getClientIdsOfDescendants( [ clientId ] ).map(
					( id ) => getBlockAttributes( id )?.filterTerms
				)
			);
		},
		[ clientId ]
	);

	const blockProps = useBlockProps( {
		className: 'blockish-filter-container',
	} );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: `blockish-filter-items is-layout-${ itemsLayout === 'stack' ? 'stack' : 'grid' }` },
		{ template: TEMPLATE }
	);

	return (
		<>
			<Inspector attributes={ attributes } advancedControls={ advancedControls } />
			<div { ...blockProps }>
				<Controls attributes={ attributes } buttons={ terms } preview />
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
