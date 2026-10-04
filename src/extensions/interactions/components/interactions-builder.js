import BlockInteractionsBuilder from './block-interactions-builder';
import GlobalInteractionsBuilder from './global-interactions-builder';

/**
 * Thin entry: block modal vs Settings (global/page).
 */
export default function InteractionsBuilder({
	isOpen,
	onClose,
	attributes,
	setAttributes,
	isEmbedded,
	clientId,
}) {
	if (isEmbedded) {
		return <GlobalInteractionsBuilder onClose={onClose} />;
	}

	return (
		<BlockInteractionsBuilder
			isOpen={isOpen}
			onClose={onClose}
			attributes={attributes}
			setAttributes={setAttributes}
			clientId={clientId}
		/>
	);
}
