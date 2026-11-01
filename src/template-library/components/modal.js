import { useEffect } from '@wordpress/element';
import { createPortal } from '@wordpress/element';
import Header from './header';
import Sidebar from './sidebar';
import DesignGrid from './design-grid';
import { TemplateLibraryProvider } from '../context';

const Modal = ({ isOpen, onClose }) => {
	// Prevent body scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return createPortal(
		<div className="blockish-template-library-modal-overlay" onClick={onClose}>
			<div className="blockish-template-library-modal" onClick={(e) => e.stopPropagation()}>
				<TemplateLibraryProvider>
					<Header onClose={onClose} />
					<div className="blockish-template-library-content">
						<Sidebar />
						<DesignGrid onClose={onClose} />
					</div>
				</TemplateLibraryProvider>
			</div>
		</div>,
		document.body
	);
};

export default Modal;
