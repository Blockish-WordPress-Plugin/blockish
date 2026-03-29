import { InspectorControls, store as blockEditorStore } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

const Inspector = ({ clientId, attributes, advancedControls }) => {
	const { BlockishControl } = window?.blockish?.controls;
	const { updateBlockAttributes } = useDispatch(blockEditorStore);

	const { rootClientId, siblingIds, index, parentDefaultActiveTab } = useSelect(
		(select) => {
			const store = select(blockEditorStore);
			const parentId = store.getBlockRootClientId(clientId);
			return {
				rootClientId: parentId,
				siblingIds: store.getBlockOrder(parentId) || [],
				index: store.getBlockIndex(clientId, parentId),
				parentDefaultActiveTab:
					store.getBlockAttributes(parentId)?.defaultActiveTab || 0,
			};
		},
		[clientId]
	);

	const handleDefaultActiveChange = (value) => {
		const isDefaultActive = !!value;
		updateBlockAttributes(clientId, { defaultActive: isDefaultActive });

		if (!rootClientId) {
			return;
		}

		if (isDefaultActive) {
			siblingIds.forEach((id) => {
				if (id !== clientId) {
					updateBlockAttributes(id, { defaultActive: false });
				}
			});
			updateBlockAttributes(rootClientId, {
				defaultActiveTab: index,
				activeTab: index,
			});
		} else if (parentDefaultActiveTab === index) {
			updateBlockAttributes(rootClientId, { defaultActiveTab: 0 });
		}
	};

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={[
					{ name: 'content', title: 'Content' },
					{ name: 'advanced', title: 'Advanced' },
				]}
			>
				{({ name: tabName }) => (
					<>
						{tabName === 'content' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={__('Tab Item', 'blockish')}
								initialOpen={true}
							>
								<BlockishControl
									type="TextControl"
									label={__('Tab Title', 'blockish')}
									slug="title"
								/>
								<BlockishControl
									type="BlockishIconPicker"
									label={__('Tab Icon', 'blockish')}
									slug="tabIcon"
								/>
								<BlockishControl
									type="ToggleControl"
									label={__('Default Active', 'blockish')}
									slug="defaultActive"
									checked={!!attributes?.defaultActive}
									onChange={handleDefaultActiveChange}
								/>
							</BlockishControl>
						)}
						{tabName === 'advanced' && advancedControls}
					</>
				)}
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo(Inspector);
