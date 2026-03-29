import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import './editor.scss';

const ALLOWED_BLOCKS = ['blockish/tab-item'];
const TEMPLATE = [
	['blockish/tab-item', { title: __('Tab 1', 'blockish') }],
	['blockish/tab-item', { title: __('Tab 2', 'blockish') }],
];

export default function Edit({
	attributes,
	clientId,
	setAttributes,
	advancedControls,
}) {
	const { BlockishIcon } = window?.blockish?.helpers || {};
	const {
		insertBlock,
		updateBlockAttributes,
		__unstableMarkNextChangeAsNotPersistent,
	} = useDispatch(blockEditorStore);

	const { items, activeTab } = useSelect(
		(select) => {
			const store = select(blockEditorStore);
			return {
				items: store.getBlocks(clientId),
				activeTab: store.getBlockAttributes(clientId)?.activeTab || 0,
			};
		},
		[clientId]
	);

	const directionClass = `is-direction-${attributes?.direction?.Desktop || 'column'}`;

	const blockProps = useBlockProps({
		className: clsx('blockish-block-tab'),
		style: {
			'--blockish-tab-gap': `${attributes?.navGap?.Desktop || '10px'}`,
		},
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'blockish-block-tab-items',
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			renderAppender: false,
		}
	);

	const handleAddItem = () => {
		insertBlock(
			createBlock('blockish/tab-item', {
				title: __('New Tab', 'blockish'),
			}),
			undefined,
			clientId
		);
	};

	const handleActivate = (index) => {
		__unstableMarkNextChangeAsNotPersistent();
		setAttributes({ activeTab: index });
	};

	const handleTitleChange = (childClientId, title) => {
		updateBlockAttributes(childClientId, { title });
	};

	return (
		<div {...blockProps}>
			<Inspector advancedControls={advancedControls} />
			<div className={clsx('blockish-block-tab-layout', directionClass)}>
				<div className="blockish-block-tab-nav" role="tablist" aria-label="Tabs">
					{items.map((item, index) => {
						const isActive = index === activeTab;
						return (
							<button
								key={item.clientId}
								type="button"
								className="blockish-block-tab-trigger"
								role="tab"
								aria-selected={isActive ? 'true' : 'false'}
								tabIndex={isActive ? 0 : -1}
								onClick={() => handleActivate(index)}
							>
								{item.attributes?.tabIcon?.path && BlockishIcon && (
									<span
										className="blockish-block-tab-trigger-icon"
										aria-hidden="true"
									>
										<BlockishIcon
											icon={item.attributes?.tabIcon}
											width={16}
											height={16}
											fill="currentColor"
										/>
									</span>
								)}
								<RichText
									tagName="span"
									className="blockish-block-tab-trigger-title"
									value={item.attributes?.title}
									allowedFormats={[]}
									placeholder="Tab title"
									onChange={(value) =>
										handleTitleChange(item.clientId, value)
									}
								/>
							</button>
						);
					})}
				</div>
				<div {...innerBlocksProps} />
			</div>
			<div className="blockish-block-tab-editor__appender">
				<Button variant="secondary" icon="plus-alt2" onClick={handleAddItem}>
					{__('Add Tab', 'blockish')}
				</Button>
			</div>
		</div>
	);
}
