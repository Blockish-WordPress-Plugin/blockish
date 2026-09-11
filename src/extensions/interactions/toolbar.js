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
			d="M6.4 3.6v16.4l3.8-3.4 2.4 5.5 2.3-1-2.4-5.5H19L6.4 3.6z"
			fill="currentColor"
		/>
	</SVG>
);

const InteractionsToolbar = ({ attributes, setAttributes, clientId }) => {
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
					clientId={clientId}
				/>
			)}
		</>
	);
};

const withInteractionsToolbar = createHigherOrderComponent((WrappedComponent) => {
	return (props) => {
		const { name, attributes, setAttributes, clientId } = props;

		if (!name || !name.startsWith('blockish')) {
			return <WrappedComponent {...props} />;
		}

		return (
			<>
				<WrappedComponent {...props} />
				<InteractionsToolbar
					attributes={attributes}
					setAttributes={setAttributes}
					clientId={clientId}
				/>
			</>
		);
	};
}, 'withInteractionsToolbar');

export default withInteractionsToolbar;
