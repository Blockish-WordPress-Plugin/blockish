import { __ } from '@wordpress/i18n';
import { schemaToMarkup } from '../../extensions/theme-builder/schema/schemaToMarkup';

export const MEGAMENU_PRESETS = [
	{
		id: 'blank',
		title: __( 'Blank Canvas', 'blockish' ),
		description: __(
			'Start from scratch with an empty container.',
			'blockish'
		),
		suggestedTitle: __( 'Custom Mega Menu', 'blockish' ),
		schema: [
			{
				name: 'blockish/container',
				attributes: {
					isVariationPicked: true,
					flexDirection: { Desktop: 'column' },
				},
				innerBlocks: [
					{
						name: 'blockish/paragraph',
						attributes: {
							content: __( 'Add mega menu content…', 'blockish' ),
						},
					},
				],
			},
		],
		get content() {
			return schemaToMarkup( this.schema );
		},
	},
	{
		id: 'three-column',
		title: __( 'Three Columns', 'blockish' ),
		description: __(
			'A simple three-column layout for featured links.',
			'blockish'
		),
		suggestedTitle: __( 'Featured Links', 'blockish' ),
		schema: [
			{
				name: 'blockish/container',
				attributes: {
					isVariationPicked: true,
					flexDirection: { Desktop: 'row' },
					flexWrap: { Desktop: 'wrap' },
					customCss: '.{{WRAPPER}}{gap:24px;}',
				},
				innerBlocks: [
					{
						name: 'blockish/container',
						attributes: {
							isVariationPicked: true,
							flexDirection: { Desktop: 'column' },
							customCss:
								'.{{WRAPPER}}{flex:1 1 200px;min-width:180px;}',
						},
						innerBlocks: [
							{
								name: 'blockish/heading',
								attributes: {
									content: __( 'Column one', 'blockish' ),
									tag: { label: 'H4', value: 'h4' },
								},
							},
							{
								name: 'blockish/paragraph',
								attributes: {
									content: __(
										'Short description.',
										'blockish'
									),
								},
							},
						],
					},
					{
						name: 'blockish/container',
						attributes: {
							isVariationPicked: true,
							flexDirection: { Desktop: 'column' },
							customCss:
								'.{{WRAPPER}}{flex:1 1 200px;min-width:180px;}',
						},
						innerBlocks: [
							{
								name: 'blockish/heading',
								attributes: {
									content: __( 'Column two', 'blockish' ),
									tag: { label: 'H4', value: 'h4' },
								},
							},
							{
								name: 'blockish/paragraph',
								attributes: {
									content: __(
										'Short description.',
										'blockish'
									),
								},
							},
						],
					},
					{
						name: 'blockish/container',
						attributes: {
							isVariationPicked: true,
							flexDirection: { Desktop: 'column' },
							customCss:
								'.{{WRAPPER}}{flex:1 1 200px;min-width:180px;}',
						},
						innerBlocks: [
							{
								name: 'blockish/heading',
								attributes: {
									content: __( 'Column three', 'blockish' ),
									tag: { label: 'H4', value: 'h4' },
								},
							},
							{
								name: 'blockish/paragraph',
								attributes: {
									content: __(
										'Short description.',
										'blockish'
									),
								},
							},
						],
					},
				],
			},
		],
		get content() {
			return schemaToMarkup( this.schema );
		},
	},
];

export function getPresetById( id ) {
	const preset = MEGAMENU_PRESETS.find( ( p ) => p.id === id ) || null;
	if ( ! preset ) {
		return null;
	}
	return {
		...preset,
		content: preset.content || schemaToMarkup( preset.schema || [] ),
	};
}
