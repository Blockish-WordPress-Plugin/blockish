import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import './editor.scss';

/**
 * Hard limit — no Container (it would unlock every block).
 * Pair items (icon-list-item / social-icon-item) are only insertable via their parents.
 */
export const SLIDE_ALLOWED_BLOCKS = [
	'blockish/heading',
	'blockish/paragraph',
	'blockish/button',
	'blockish/image',
	'blockish/icon',
	'blockish/icon-list',
	'blockish/rating',
	'blockish/counter',
	'blockish/social-icons',
];

const TEMPLATE = [
	[
		'blockish/heading',
		{
			content: __( 'Craft something beautiful', 'blockish' ),
			tag: { label: 'H2', value: 'h2' },
			color: '#f8fafc',
			alignment: { Desktop: 'center' },
			typography:
				'{"fontWeight":"700","fontSize":{"Desktop":"2rem","Tablet":"1.75rem","Mobile":"1.5rem"},"lineHeight":{"Desktop":"1.2"}}',
		},
	],
	[
		'blockish/paragraph',
		{
			content: __(
				'A short line that supports the headline. Swap the background, then add a button when you’re ready.',
				'blockish'
			),
			color: '#cbd5e1',
			alignment: { Desktop: 'center' },
			typography:
				'{"fontSize":{"Desktop":"1.05rem","Mobile":"0.95rem"},"lineHeight":{"Desktop":"1.6"}}',
		},
	],
	[
		'blockish/button',
		{
			text: __( 'Get started', 'blockish' ),
			url: { url: '#', newTab: false, noFollow: false },
			buttonPlacement: {
				Desktop: { label: 'Center', value: 'center' },
			},
			buttonTextColor: '#0f172a',
			buttonBackground:
				'{"backgroundType":"classic","backgroundColor":"#f8fafc"}',
			buttonPadding: {
				Desktop: {
					top: '12px',
					right: '22px',
					bottom: '12px',
					left: '22px',
				},
			},
			buttonBorderRadius: {
				Desktop: {
					topLeft: '999px',
					topRight: '999px',
					bottomRight: '999px',
					bottomLeft: '999px',
				},
			},
		},
	],
];

function parseOverlay( value ) {
	if ( ! value ) {
		return null;
	}
	if ( typeof value === 'object' ) {
		return value;
	}
	try {
		return JSON.parse( value );
	} catch ( e ) {
		return null;
	}
}

export default function Edit( { attributes, advancedControls } ) {
	const overlay = parseOverlay( attributes?.slideBackgroundOverlay );

	const blockProps = useBlockProps( {
		className: clsx( 'blockish-carousel__slide', 'is-default-styled', {
			'has-background-overlay': !! overlay?.enabled,
		} ),
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'blockish-carousel__slide-inner',
		},
		{
			allowedBlocks: SLIDE_ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
		}
	);

	return (
		<>
			<Inspector advancedControls={ advancedControls } />
			<div { ...blockProps }>
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
