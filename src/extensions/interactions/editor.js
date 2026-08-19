import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import InteractionsBuilder from './components/InteractionsBuilder';
import withInteractionsToolbar from './toolbar';
import './editor.scss';
import './settings-tab';

const InteractionsPanel = ({ clientId }) => {
	const { useExtensionsAttributes } = window?.blockish?.helpers || {};
	const BlockishControl = window?.blockish?.controls?.BlockishControl;
	const [isModalOpen, setIsModalOpen] = useState(false);

	if (!BlockishControl || !useExtensionsAttributes) return null;

	const { attributes, setAttributes } = useExtensionsAttributes(clientId);
	const interactions = attributes?.interactionData || [];
	const hasInteractions = interactions.length > 0;

	return (
		<>
			<BlockishControl
				type="BlockishPanelBody"
				title={__('Interactions', 'blockish')}
				initialOpen={false}
			indicatorSlugs={['interactionData']}>
				<div className="blockish-interactions-panel">
					<p className="blockish-interactions-panel__desc">
						{__(
							'Animate this block, react to clicks, or connect blocks with simple signals.',
							'blockish'
						)}
					</p>
					<button
						type="button"
						className="components-button is-primary is-blockish-primary"
						onClick={() => setIsModalOpen(true)}
						style={{ width: '100%', justifyContent: 'center' }}
					>
						{hasInteractions
							? __('Manage interactions', 'blockish')
							: __('Add interaction', 'blockish')}
					</button>
					{hasInteractions && (
						<p className="blockish-interactions-panel__status">
							✓{' '}
							{interactions.length === 1
								? __('1 active on this block', 'blockish')
								: `${interactions.length} ${__(
										'active on this block',
										'blockish'
								  )}`}
						</p>
					)}
				</div>
			</BlockishControl>

			{isModalOpen && (
				<InteractionsBuilder
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			)}
		</>
	);
};

const Inspector = createHigherOrderComponent((WrappedComponent) => {
	return (props) => {
		const { tabName, blockName, clientId } = props;

		if (tabName !== 'advanced' || !blockName || !blockName.startsWith('blockish')) {
			return <WrappedComponent {...props} />;
		}

		return (
			<>
				<WrappedComponent {...props} />
				<InteractionsPanel clientId={clientId} />
			</>
		);
	};
}, 'withInteractionsInspector');

addFilter(
	'blockish.tabs.after-tab-content',
	'blockish/interactions-inspector',
	Inspector,
	20
);

addFilter(
	'editor.BlockEdit',
	'blockish/interactions-toolbar',
	withInteractionsToolbar,
	20
);
