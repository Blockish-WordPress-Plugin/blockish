import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, useInnerBlocksProps } from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	parseSchemaAttr,
	schemaNodeToTemplate,
} from './schema-to-blocks';

registerBlockType( 'blockish/ai-preview', {
	title: __( 'AI Preview Wrapper', 'blockish' ),
	apiVersion: 3,
	category: 'design',
	icon: 'admin-appearance',
	supports: {
		inserter: false,
		html: false,
		reusable: false,
	},
	attributes: {
		previousSchema: {
			type: 'string',
			default: '',
		},
		pendingSchema: {
			type: 'string',
			default: '',
		},
	},
	edit: ( props ) => {
		const {
			attributes: { pendingSchema },
		} = props;

		const template = useMemo( () => {
			return parseSchemaAttr( pendingSchema )
				.map( schemaNodeToTemplate )
				.filter( Boolean );
		}, [ pendingSchema ] );

		const innerBlockProps = useInnerBlocksProps(
			{
				className:
					'blockish-ai-preview-inner-blocks is-root-container is-layout-constrained',
			},
			{
				template,
				templateLock: false,
			}
		);

		return (
			<div className="blockish-ai-preview-wrapper alignfull">
				<div { ...innerBlockProps }></div>
			</div>
		);
	},
	// Children persist for PHP render_callback after Settings/magic resolve.
	save: () => <InnerBlocks.Content />,
} );
