import { createHigherOrderComponent } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, Icon } from '@wordpress/components';
import { SVG, Path } from '@wordpress/primitives';
import InteractionsBuilder from './components/InteractionsBuilder';

const interactionsIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path
			d="M12 3.5c-1.1 0-2 .9-2 2v5.2L6.8 8.5a1.5 1.5 0 1 0-1.6 2.5l4.8 3.1V19a2 2 0 1 0 2 0v-4.9l4.8-3.1a1.5 1.5 0 1 0-1.6-2.5L14 10.7V5.5c0-1.1-.9-2-2-2z"
			fill="currentColor"
		/>
	</SVG>
);

const InteractionsToolbar = ({ attributes, setAttributes }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const hasInteractions = attributes?.interactionData?.length > 0;

	if (!hasInteractions) {
		return null;
	}

	return (
		<>
			<BlockControls group="other">
				<ToolbarGroup>
					<ToolbarButton
						icon={<Icon icon={interactionsIcon} />}
						label={__('Edit Interactions', 'blockish')}
						onClick={() => setIsModalOpen(true)}
						className="blockish-interactions-toolbar-btn"
						isPressed={isModalOpen}
					/>
				</ToolbarGroup>
			</BlockControls>
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

const withInteractionsToolbar = createHigherOrderComponent((WrappedComponent) => {
	return (props) => {
		const { name, attributes, setAttributes } = props;

		if (!name || !name.startsWith('blockish')) {
			return <WrappedComponent {...props} />;
		}

		return (
			<>
				<WrappedComponent {...props} />
				<InteractionsToolbar
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</>
		);
	};
}, 'withInteractionsToolbar');

export default withInteractionsToolbar;
