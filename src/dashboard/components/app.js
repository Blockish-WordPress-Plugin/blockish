import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { Flex, FlexBlock, Spinner, __experimentalText as Text } from '@wordpress/components';
import { STORE_NAME } from '../store/store';
import { useHistory, useLocation } from '../routes';
import { isValidMenu } from '../utils';
import DashboardSidebar from './dashboard-sidebar';
import ContentArea from './content-area';

const THEME_BUILDER_SLUG = 'theme-builder';

function isBlockThemeSite() {
	return Boolean(window.blockishDashboardData?.isBlockTheme);
}

/**
 * Theme Builder is classic-theme only — never bulk-enable on block themes.
 */
function filterBulkEnableSlugs(status, slugs, extensions = {}) {
	const targets =
		Array.isArray(slugs) && slugs.length > 0
			? slugs
			: Object.keys(extensions || {});

	if (status !== 'active' || !isBlockThemeSite()) {
		return targets;
	}

	return targets.filter((slug) => slug !== THEME_BUILDER_SLUG);
}

export default function App() {
	const { setActiveMenu, loadDashboard, saveDashboard, updateModuleStatus, updateModuleSettings } = useDispatch(STORE_NAME);
	const history = useHistory();
	const location = useLocation();
	const autoSaveTimeout = useRef(null);
	const hasLoadedRef = useRef(false);
	const pendingSaveRef = useRef(false);
	const wasSavingRef = useRef(false);
	const toastTimeout = useRef(null);
	const [toast, setToast] = useState(null);
	const { activeMenu, isLoading, isSaving, error, data } = useSelect((select) => {
		const store = select(STORE_NAME);
		return {
			activeMenu: store.getActiveMenu(),
			isLoading: store.isLoading(),
			isSaving: store.isSaving(),
			error: store.getError(),
			data: store.getDashboardData(),
		};
	}, []);

	useEffect(() => {
		loadDashboard();
	}, [loadDashboard]);

	useEffect(() => {
		if (!isLoading) {
			hasLoadedRef.current = true;
		}
	}, [isLoading]);

	useEffect(() => {
		const rawRoute = location?.params?.route;
		const routeMenu = rawRoute === 'addons' ? 'license' : rawRoute;
		if (!routeMenu) {
			return;
		}

		if (isValidMenu(routeMenu, data?.extensions) && routeMenu !== activeMenu) {
			setActiveMenu(routeMenu);
		}
	}, [location, activeMenu, setActiveMenu, data?.extensions]);

	const handleSave = () =>
		saveDashboard({
			blocks: data?.blocks || {},
			extensions: data?.extensions || {},
		});

	const handleMenuClick = (menuKey) => {
		setActiveMenu(menuKey);
		history.push({ route: menuKey });
	};

	const handleToggleBlock = (slug, enabled) => {
		pendingSaveRef.current = true;
		updateModuleStatus('blocks', slug, enabled ? 'active' : 'inactive');
	};

	const handleSetAllBlockStatus = (status, slugs = null) => {
		pendingSaveRef.current = true;
		if (Array.isArray(slugs) && slugs.length > 0) {
			slugs.forEach((slug) => {
				updateModuleStatus('blocks', slug, status);
			});
			return;
		}

		Object.entries(data?.blocks || {}).forEach(([slug, item]) => {
			if (!item?.parent) {
				updateModuleStatus('blocks', slug, status);
			}
		});
	};

	const handleToggleExtension = (slug, enabled) => {
		const extension = data?.extensions?.[slug];
		if (enabled && (extension?.unavailable || (slug === THEME_BUILDER_SLUG && isBlockThemeSite()))) {
			return;
		}
		pendingSaveRef.current = true;
		updateModuleStatus('extensions', slug, enabled ? 'active' : 'inactive');
	};

	const handleSetAllExtensionStatus = (status, slugs = null) => {
		pendingSaveRef.current = true;
		const targets = filterBulkEnableSlugs(status, slugs, data?.extensions);
		targets.forEach((slug) => {
			updateModuleStatus('extensions', slug, status);
		});
	};

	const handleSaveExtensionSettings = (slug, settings) => {
		pendingSaveRef.current = true;
		updateModuleSettings('extensions', slug, settings);
	};

	const showToast = (title, message, tone = 'default', duration = 2000) => {
		if (toastTimeout.current) {
			clearTimeout(toastTimeout.current);
		}

		setToast({ title, message, tone });

		if (duration > 0) {
			toastTimeout.current = setTimeout(() => {
				setToast(null);
			}, duration);
		}
	};

	useEffect(() => {
		if (!hasLoadedRef.current) {
			return;
		}

		if (isSaving) {
			wasSavingRef.current = true;
			return;
		}

		if (wasSavingRef.current) {
			wasSavingRef.current = false;
			showToast(
				__('All changes saved', 'blockish'),
				__('Your updates are safely stored and live.', 'blockish'),
				'success',
				2000
			);
		}
	}, [isSaving]);

	useEffect(() => {
		if (error) {
			showToast(__('Save failed', 'blockish'), error, 'error', 4000);
		}
	}, [error]);

	useEffect(() => {
		if (!hasLoadedRef.current || isLoading || isSaving || !pendingSaveRef.current) {
			return;
		}

		if (autoSaveTimeout.current) {
			clearTimeout(autoSaveTimeout.current);
		}

		pendingSaveRef.current = false;
		autoSaveTimeout.current = setTimeout(() => {
			handleSave();
		}, 500);

		return () => {
			if (autoSaveTimeout.current) {
				clearTimeout(autoSaveTimeout.current);
			}
		};
	}, [data?.blocks, data?.extensions, isLoading, isSaving]);

	return (
		<Flex className="blockish-dashboard-layout" justify="flex-start" align="stretch">
			{toast && (
				<div className="blockish-toast-container">
					<div className={`blockish-toast blockish-toast--${toast.tone || 'default'}`}>
						<div className="blockish-toast-icon" aria-hidden="true">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<circle cx="12" cy="12" r="10" />
								<path d="M9 12l2 2 4-4" />
							</svg>
						</div>
						<div className="blockish-toast-body">
							<div className="blockish-toast-title">{toast.title}</div>
							<Text className="blockish-toast-message">{toast.message}</Text>
						</div>
						<button
							type="button"
							className="blockish-toast-close"
							onClick={() => setToast(null)}
							aria-label={__('Dismiss notification', 'blockish')}
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M18 6L6 18" />
								<path d="M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>
			)}
			<DashboardSidebar
				activeMenu={activeMenu}
				onMenuClick={handleMenuClick}
				extensions={data?.extensions}
			/>

			<FlexBlock as="main" className="blockish-main-content">
				{isLoading && (
					<div className="blockish-loader">
						<Spinner />
					</div>
				)}
				{!isLoading && (
					<ContentArea
						activeMenu={activeMenu}
						data={data}
						isSaving={isSaving}
						onNavigate={handleMenuClick}
						onToggleBlock={handleToggleBlock}
						onSetAllBlockStatus={handleSetAllBlockStatus}
						onToggleExtension={handleToggleExtension}
						onSetAllExtensionStatus={handleSetAllExtensionStatus}
						onSaveExtensionSettings={handleSaveExtensionSettings}
					/>
				)}
				{error && <Text className="blockish-error">{error}</Text>}
			</FlexBlock>
		</Flex>
	);
}
