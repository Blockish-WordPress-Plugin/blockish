import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import Inspector from './inspector';
import './editor.scss';

const TEMPLATE = [ [ 'core/paragraph', {} ] ];

export default function Edit({ clientId, attributes, advancedControls }) {
	const { index, activeTab } = useSelect(
		(select) => {
			const { getBlockRootClientId, getBlockIndex, getBlockAttributes } =
				select(blockEditorStore);
			const rootClientId = getBlockRootClientId(clientId);

			return {
				index: getBlockIndex(clientId, rootClientId),
				activeTab: getBlockAttributes(rootClientId)?.activeTab || 0,
			};
		},
		[clientId]
	);

	const blockProps = useBlockProps({
		className: clsx('blockish-block-tab-item'),
		hidden: index !== activeTab,
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			...blockProps,
			className: clsx(
				blockProps.className,
				'blockish-block-tab-item-panel-inner'
			),
		},
		{
			template: TEMPLATE,
		}
	);

	return (
		<>
			<Inspector
				clientId={clientId}
				attributes={attributes}
				advancedControls={advancedControls}
			/>
			<div {...innerBlocksProps} />
		</>
	);
}
