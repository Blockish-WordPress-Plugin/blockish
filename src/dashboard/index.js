import { createRoot } from '@wordpress/element';
import App from './components/app';
import { RouterProvider } from './routes';
import './store/store';
import './styles/style.scss';

import TemplateBuilderPage from './components/template-builder/template-builder-page';

window.addEventListener('load', () => {
	// If we are in the Template Wizard screen (Gutenberg overridden), mount the builder.
	if (window.isBlockishTemplateWizard) {
		const wpwrap = document.getElementById('wpwrap');
		if (wpwrap) {
			createRoot(wpwrap).render(<TemplateBuilderPage />);
		}
		return;
	}

	const root = document.getElementById('blockish-dashboard-root');

	if (root) {
		createRoot(root).render(
			<RouterProvider>
				<App />
			</RouterProvider>
		);
	}
});
