import BlockInteractionsBuilder from './BlockInteractionsBuilder';
import GlobalInteractionsBuilder from './GlobalInteractionsBuilder';

/**
 * Thin entry: block modal vs Settings (global/page).
 */
export default function InteractionsBuilder({
	isOpen,
	onClose,
	attributes,
	setAttributes,
	isEmbedded,
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
		/>
	);
}
