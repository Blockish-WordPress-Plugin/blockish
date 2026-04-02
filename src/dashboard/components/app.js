import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { Flex, FlexBlock, Spinner, __experimentalText as Text } from '@wordpress/components';
import { STORE_NAME } from '../store/store';
import { useHistory, useLocation } from '../routes';
import { isValidMenu } from '../utils';
import DashboardSidebar from './dashboard-sidebar';
import ContentArea from './content-area';

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
		const routeMenu = location?.params?.route;
		if (!routeMenu) {
			return;
		}

		if (isValidMenu(routeMenu) && routeMenu !== activeMenu) {
			setActiveMenu(routeMenu);
		}
	}, [location, activeMenu, setActiveMenu]);

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

	const handleSetAllBlockStatus = (status) => {
		pendingSaveRef.current = true;
		Object.entries(data?.blocks || {}).forEach(([slug, item]) => {
			if (item?.parent) {
				return;
			}
			updateModuleStatus('blocks', slug, status);
		});
	};

	const handleToggleExtension = (slug, enabled) => {
		pendingSaveRef.current = true;
		updateModuleStatus('extensions', slug, enabled ? 'active' : 'inactive');
	};

	const handleSetAllExtensionStatus = (status) => {
		pendingSaveRef.current = true;
		Object.keys(data?.extensions || {}).forEach((slug) => {
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
			<DashboardSidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />

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
