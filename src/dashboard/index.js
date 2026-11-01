import { createRoot } from '@wordpress/element';
import App from './components/app';
import { RouterProvider } from './routes';
import './store/store';
import './styles/style.scss';
import BlockishSelect from '../components/select';

// Blockish controls for dashboard settings modals, add-ons included.
window.blockishDashboardComponents = { BlockishSelect };

window.addEventListener('load', () => {
	const root = document.getElementById('blockish-dashboard-root');

	if (root) {
		createRoot(root).render(
			<RouterProvider>
				<App />
			</RouterProvider>
		);
	}
});
