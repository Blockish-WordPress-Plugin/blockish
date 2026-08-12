import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Card,
	CardBody,
	Flex,
	Modal,
	Notice,
	Spinner,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';

function sortAddons(entries) {
	return entries.sort((a, b) => {
		if (a.is_bundle) return -1;
		if (b.is_bundle) return 1;
		return a.name.localeCompare(b.name);
	});
}

function getAddonPlans(addon) {
	if (!Array.isArray(addon?.plans)) {
		return [];
	}
	return addon.plans.filter((plan) => plan?.id);
}

function normalizePlanLabel(value) {
	return String(value || '')
		.trim()
		.toLowerCase();
}

function getCurrentPlanKey(addon) {
	const planTitle = normalizePlanLabel(addon?.license?.plan_title);
	if (!planTitle) {
		return '';
	}

	const match = getAddonPlans(addon).find((plan) => {
		const title = normalizePlanLabel(plan.title);
		const key = normalizePlanLabel(plan.key);
		return planTitle === title || planTitle === key || planTitle.includes(title) || title.includes(planTitle);
	});

	return match?.key || '';
}

function getDefaultPlanKey(addon) {
	const plans = getAddonPlans(addon);
	if (!plans.length) {
		return 'personal';
	}

	const currentKey = getCurrentPlanKey(addon);
	if (currentKey) {
		const upgrade = plans.find((plan) => plan.key !== currentKey);
		if (upgrade) {
			return upgrade.key;
		}
	}

	return plans[0].key;
}

function getInitialAddons() {
	const list = window.blockishDashboardData?.addonsList || {};
	return sortAddons(
		Object.entries(list).map(([slug, item]) => ({
			slug,
			...item,
		}))
	);
}

export default function AddonsPage() {
	const [addons, setAddons] = useState(getInitialAddons);
	const [licenseKey, setLicenseKey] = useState('');
	const [recoverEmail, setRecoverEmail] = useState(
		() => window.blockishDashboardData?.userEmail || ''
	);
	const [busySlug, setBusySlug] = useState(null);
	const [busyAction, setBusyAction] = useState(null);
	const [feedback, setFeedback] = useState(null);
	const [modalAddon, setModalAddon] = useState(null);
	const [modalFeedback, setModalFeedback] = useState(null);
	const [recoverOpen, setRecoverOpen] = useState(false);
	const [recoverFeedback, setRecoverFeedback] = useState(null);
	const [selectedPlans, setSelectedPlans] = useState(() => {
		const initial = {};
		getInitialAddons().forEach((addon) => {
			initial[addon.slug] = getDefaultPlanKey(addon);
		});
		return initial;
	});

	const addonsApiPath = window.blockishDashboardData?.addonsApiPath || '/blockish/v1/addons';

	const startBusy = (slug, action) => {
		setBusySlug(slug);
		setBusyAction(action);
	};

	const clearBusy = () => {
		setBusySlug(null);
		setBusyAction(null);
	};

	const selectPlan = (slug, planKey) => {
		setSelectedPlans((prev) => ({
			...prev,
			[slug]: planKey,
		}));
	};

	const applyAddonsPayload = useCallback((payload) => {
		if (!payload || typeof payload !== 'object') {
			return;
		}

		const next = sortAddons(
			Object.entries(payload).map(([slug, item]) => ({
				slug,
				...item,
			}))
		);

		setAddons(next);
		setSelectedPlans((prev) => {
			const nextPlans = { ...prev };
			next.forEach((addon) => {
				const plans = getAddonPlans(addon);
				if (!plans.length) {
					return;
				}
				const current = nextPlans[addon.slug];
				if (!plans.some((plan) => plan.key === current)) {
					nextPlans[addon.slug] = plans[0].key;
				}
			});
			return nextPlans;
		});
		window.blockishDashboardData = {
			...(window.blockishDashboardData || {}),
			addonsList: payload,
		};
	}, []);

	const closeLicenseModal = () => {
		if (busySlug) {
			return;
		}
		setModalAddon(null);
		setLicenseKey('');
		setModalFeedback(null);
		setRecoverOpen(false);
		setRecoverFeedback(null);
	};

	const openRecoverModal = (event) => {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		setModalFeedback(null);
		setRecoverFeedback(null);
		setRecoverEmail((prev) => prev || window.blockishDashboardData?.userEmail || '');
		setRecoverOpen(true);
	};

	const closeRecoverModal = () => {
		if (busyAction === 'resend') {
			return;
		}
		setRecoverOpen(false);
		setRecoverFeedback(null);
	};

	const resendLicenseKey = async () => {
		if (!modalAddon) {
			return;
		}

		const email = recoverEmail.trim();
		if (!email) {
			setRecoverFeedback({
				status: 'error',
				message: __('Please enter the email you used at purchase.', 'blockish'),
			});
			return;
		}

		startBusy(modalAddon.slug, 'resend');
		setRecoverFeedback(null);

		try {
			const response = await apiFetch({
				path: `${addonsApiPath}/license/resend`,
				method: 'POST',
				data: {
					slug: modalAddon.slug,
					email,
				},
			});

			setRecoverFeedback({
				status: 'success',
				message:
					response?.message ||
					__(
						'If we find a purchase for that email, we will send the license key shortly. Check your inbox and spam folder.',
						'blockish'
					),
			});
			clearBusy();
		} catch (error) {
			setRecoverFeedback({
				status: 'error',
				message: error?.message || __('Could not send the license key. Please try again.', 'blockish'),
			});
			clearBusy();
		}
	};

	const openLicenseModal = async (addon) => {
		setFeedback(null);
		setModalFeedback(null);
		setLicenseKey('');
		setRecoverOpen(false);
		setRecoverFeedback(null);
		setModalAddon(addon);
		startBusy(addon.slug, 'refresh');

		try {
			const response = await apiFetch({
				path: addonsApiPath,
				method: 'GET',
			});
			if (response?.addons) {
				applyAddonsPayload(response.addons);
				const fresh = response.addons?.[addon.slug];
				if (fresh) {
					setModalAddon({ slug: addon.slug, ...fresh });
				}
			}
		} catch (error) {
			// Keep the card payload if refresh fails.
		} finally {
			clearBusy();
		}
	};

	const openFreemiusCheckout = async (addon) => {
		if (typeof window.FS === 'undefined' || !window.FS.Checkout) {
			setFeedback({
				status: 'error',
				message: __('Checkout is currently unavailable.', 'blockish'),
			});
			return;
		}

		if (
			!addon.freemius_id ||
			addon.public_key === 'pk_placeholder' ||
			String(addon.freemius_id) === '12345' ||
			String(addon.freemius_id) === '23456'
		) {
			setFeedback({
				status: 'error',
				message: __('Checkout is not configured for this product yet.', 'blockish'),
			});
			return;
		}

		const plans = getAddonPlans(addon);
		const selectedKey = selectedPlans[addon.slug] || getDefaultPlanKey(addon);
		const selectedPlan = plans.find((plan) => plan.key === selectedKey) || plans[0];
		const currentPlanKey = getCurrentPlanKey(addon);

		if (plans.length && !selectedPlan?.id) {
			setFeedback({
				status: 'error',
				message: __('Select a plan before buying.', 'blockish'),
			});
			return;
		}

		if (currentPlanKey && selectedPlan?.key === currentPlanKey) {
			setFeedback({
				status: 'error',
				message: __('This is already your active plan. Choose a different plan to upgrade.', 'blockish'),
			});
			return;
		}

		startBusy(addon.slug, 'checkout');

		let checkoutOptions = {
			plugin_id: addon.freemius_id,
			public_key: addon.public_key,
			name: addon.name,
		};

		if (selectedPlan?.id) {
			checkoutOptions.plan_id = String(selectedPlan.id);
		}

		try {
			const context = await apiFetch({
				path: `${addonsApiPath}/checkout-context?slug=${encodeURIComponent(addon.slug)}`,
				method: 'GET',
			});

			if (context?.plugin_id) {
				checkoutOptions.plugin_id = context.plugin_id;
			}
			if (context?.public_key) {
				checkoutOptions.public_key = context.public_key;
			}
			if (context?.name) {
				checkoutOptions.name = context.name;
			}
			if (context?.license_key) {
				checkoutOptions.license_key = context.license_key;
			}
		} catch (error) {
			// Fall back to a fresh purchase checkout if context lookup fails.
		} finally {
			clearBusy();
		}

		const { name, license_key: licenseKeyForCheckout, ...configureOptions } = checkoutOptions;

		const handler = window.FS.Checkout.configure(configureOptions);

		const openPayload = {
			name,
			purchaseCompleted: () => {
				setFeedback({
					status: 'success',
					message: licenseKeyForCheckout
						? __('Upgrade / renewal complete. Your license will refresh on this site.', 'blockish')
						: __(
								'Purchase complete. Click Activate License and paste your key if it did not sync automatically.',
								'blockish'
						  ),
				});
				if (licenseKeyForCheckout) {
					window.setTimeout(() => {
						window.location.reload();
					}, 1200);
				}
			},
		};

		if (selectedPlan?.id) {
			openPayload.plan_id = String(selectedPlan.id);
		}

		// Agency = unlimited sites pricing on Freemius.
		if (selectedPlan?.key === 'agency') {
			openPayload.licenses = null;
		} else if (selectedPlan?.key === 'personal') {
			openPayload.licenses = 1;
		}

		if (licenseKeyForCheckout) {
			openPayload.license_key = licenseKeyForCheckout;
		}

		handler.open(openPayload);
	};

	const activateLicense = async (addon) => {
		const key = licenseKey.trim();
		if (!key) {
			setModalFeedback({
				status: 'error',
				message: __('Please enter a license key.', 'blockish'),
			});
			return;
		}

		startBusy(addon.slug, 'activate');
		setModalFeedback(null);

		try {
			const response = await apiFetch({
				path: `${addonsApiPath}/license/activate`,
				method: 'POST',
				data: {
					slug: addon.slug,
					license_key: key,
				},
			});

			if (response?.addons) {
				applyAddonsPayload(response.addons);
			}

			setModalFeedback({
				status: 'success',
				message: response?.message || __('License activated successfully.', 'blockish'),
			});

			setFeedback({
				status: 'success',
				message: response?.message || __('License activated successfully.', 'blockish'),
			});

			if (response?.addons?.[addon.slug]) {
				setModalAddon({ slug: addon.slug, ...response.addons[addon.slug] });
			}

			if (response?.reload) {
				setBusyAction('reloading');
				window.setTimeout(() => {
					window.location.reload();
				}, 900);
				return;
			}

			clearBusy();
			closeLicenseModal();
		} catch (error) {
			setModalFeedback({
				status: 'error',
				message: error?.message || __('License activation failed.', 'blockish'),
			});
			clearBusy();
		}
	};

	const deactivateLicense = async (addon) => {
		startBusy(addon.slug, 'deactivate');
		setModalFeedback(null);

		try {
			const response = await apiFetch({
				path: `${addonsApiPath}/license/deactivate`,
				method: 'POST',
				data: {
					slug: addon.slug,
				},
			});

			if (response?.addons) {
				applyAddonsPayload(response.addons);
			}

			setModalFeedback({
				status: 'success',
				message: response?.message || __('License deactivated.', 'blockish'),
			});

			if (response?.reload) {
				setBusyAction('reloading');
				window.setTimeout(() => {
					window.location.reload();
				}, 900);
				return;
			}

			clearBusy();
			closeLicenseModal();
		} catch (error) {
			setModalFeedback({
				status: 'error',
				message: error?.message || __('License deactivation failed.', 'blockish'),
			});
			clearBusy();
		}
	};

	const cards = useMemo(() => addons, [addons]);
	const isModalBusy = modalAddon ? busySlug === modalAddon.slug : false;
	const modalLicense = modalAddon?.license || {};
	const isModalLicensed = Boolean(modalLicense.is_active);
	const isActivating = isModalBusy && (busyAction === 'activate' || busyAction === 'reloading');
	const isDeactivating = isModalBusy && busyAction === 'deactivate';

	const processingLabel = (() => {
		switch (busyAction) {
			case 'activate':
				return __('Activating license…', 'blockish');
			case 'deactivate':
				return __('Deactivating license…', 'blockish');
			case 'reloading':
				return __('License updated. Reloading…', 'blockish');
			case 'refresh':
				return __('Loading license status…', 'blockish');
			case 'checkout':
				return __('Opening checkout…', 'blockish');
			case 'resend':
				return __('Sending license key…', 'blockish');
			default:
				return __('Please wait…', 'blockish');
		}
	})();

	return (
		<VStack className="blockish-blocks-page blockish-addons-page" spacing={5}>
			<header className="blockish-page-header">
				<Heading className="blockish-heading-primary" level={1}>
					{__('Addons & License', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{__(
						'Buy Forms or Dynamicity here, then activate your license key on this site.',
						'blockish'
					)}
				</Text>
			</header>

			{feedback && (
				<Notice
					status={feedback.status === 'error' ? 'error' : 'success'}
					isDismissible
					onRemove={() => setFeedback(null)}
				>
					{feedback.message}
				</Notice>
			)}

			<div className="blockish-block-grid blockish-addons-grid">
				{cards.map((addon) => {
					const license = addon.license || {};
					const isLicenseActive = Boolean(license.is_active);
					const showLicenseButton = Boolean(addon.supports_license_key);
					const isCardBusy = busySlug === addon.slug;
					const isCardCheckoutBusy = isCardBusy && busyAction === 'checkout';
					const isCardLicenseBusy = isCardBusy && (busyAction === 'refresh' || busyAction === 'activate');
					const plans = getAddonPlans(addon);
					const currentPlanKey = getCurrentPlanKey(addon);
					const selectedPlanKey = selectedPlans[addon.slug] || getDefaultPlanKey(addon);
					const selectedPlan = plans.find((plan) => plan.key === selectedPlanKey) || plans[0];
					const isSelectedCurrentPlan =
						Boolean(isLicenseActive && currentPlanKey && selectedPlan?.key === currentPlanKey);
					const buyLabel = selectedPlan?.title
						? sprintf(__('Buy %s', 'blockish'), selectedPlan.title)
						: __('Buy Now', 'blockish');
					const upgradeLabel = isSelectedCurrentPlan
						? __('Current plan', 'blockish')
						: selectedPlan?.title
							? sprintf(__('Upgrade to %s', 'blockish'), selectedPlan.title)
							: __('Upgrade', 'blockish');

					return (
						<Card
							key={addon.slug}
							className={`blockish-block-card blockish-addon-card ${addon.is_bundle ? 'is-bundle' : ''} ${
								isLicenseActive ? 'is-licensed' : ''
							}`}
							size="small"
						>
							{addon.is_bundle ? (
								<div className="blockish-addon-ribbon">{__('Best Value', 'blockish')}</div>
							) : (
								<div
									className={`blockish-status-badge ${
										!addon.is_installed
											? 'is-inactive'
											: isLicenseActive
												? 'is-active'
												: 'is-inactive'
									}`}
								>
									{!addon.is_installed
										? __('Not Installed', 'blockish')
										: isLicenseActive
											? __('Licensed', 'blockish')
											: __('Unlicensed', 'blockish')}
								</div>
							)}

							<CardBody>
								<VStack spacing={4}>
									<Heading className="blockish-block-card-title blockish-heading-tertiary" level={3}>
										{addon.name}
									</Heading>
									<Text className="blockish-block-card-description blockish-text-muted">
										{addon.description}
									</Text>

									{addon.features?.length > 0 && (
										<ul className="blockish-addon-features">
											{addon.features.map((feature) => (
												<li key={feature}>
													<span className="blockish-addon-feature-check" aria-hidden="true">
														<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
															<path
																d="M20 6L9 17L4 12"
																stroke="currentColor"
																strokeWidth="2.5"
																strokeLinecap="round"
																strokeLinejoin="round"
															/>
														</svg>
													</span>
													<span>{feature}</span>
												</li>
											))}
										</ul>
									)}

									<div className="blockish-addon-actions">
										{plans.length > 0 && (
											<div
												className="blockish-addon-plan-tabs"
												role="tablist"
												aria-label={__('Choose a plan', 'blockish')}
											>
												{plans.map((plan) => {
													const isSelected = plan.key === selectedPlanKey;
													const isCurrent = Boolean(
														isLicenseActive && currentPlanKey && plan.key === currentPlanKey
													);
													return (
														<button
															key={plan.key}
															type="button"
															role="tab"
															aria-selected={isSelected}
															className={`blockish-addon-plan-tab ${
																isSelected ? 'is-selected' : ''
															} ${isCurrent ? 'is-current' : ''}`}
															onClick={() => selectPlan(addon.slug, plan.key)}
															disabled={isCardBusy}
														>
															<span className="blockish-addon-plan-tab-title">
																{plan.title}
																{isCurrent ? (
																	<span className="blockish-addon-plan-current-badge">
																		{__('Current', 'blockish')}
																	</span>
																) : null}
															</span>
															{plan.description && (
																<span className="blockish-addon-plan-tab-meta">
																	{plan.description}
																</span>
															)}
														</button>
													);
												})}
											</div>
										)}

										{isLicenseActive && (
											<div className="blockish-addon-licensed-status">
												<span className="blockish-addon-licensed-dot" aria-hidden="true" />
												<span>
													{license.plan_title
														? sprintf(__('Licensed — %s', 'blockish'), license.plan_title)
														: __('License active on this site', 'blockish')}
												</span>
											</div>
										)}

										{addon.is_bundle ? (
											<Button
												className="blockish-action-button is-primary"
												variant="primary"
												onClick={() => openFreemiusCheckout(addon)}
												isBusy={isCardCheckoutBusy}
												disabled={isCardBusy}
											>
												{isCardCheckoutBusy
													? __('Opening…', 'blockish')
													: __('Get Pro Bundle', 'blockish')}
											</Button>
										) : (
											<Flex className="blockish-addon-action-row" gap={2}>
												{isLicenseActive ? (
													<>
														<Button
															className="blockish-action-button is-primary"
															variant="primary"
															onClick={() => openLicenseModal(addon)}
															isBusy={isCardLicenseBusy}
															disabled={isCardBusy}
														>
															{isCardLicenseBusy
																? __('Loading…', 'blockish')
																: __('Manage License', 'blockish')}
														</Button>
														<Button
															className="blockish-action-button is-secondary"
															variant="secondary"
															onClick={() => openFreemiusCheckout(addon)}
															isBusy={isCardCheckoutBusy}
															disabled={isCardBusy || isSelectedCurrentPlan}
														>
															{isCardCheckoutBusy ? __('Opening…', 'blockish') : upgradeLabel}
														</Button>
													</>
												) : (
													<>
														<Button
															className="blockish-action-button is-primary"
															variant="primary"
															onClick={() => openFreemiusCheckout(addon)}
															isBusy={isCardCheckoutBusy}
															disabled={isCardBusy}
														>
															{isCardCheckoutBusy ? __('Opening…', 'blockish') : buyLabel}
														</Button>
														{showLicenseButton && (
															<Button
																className="blockish-action-button is-secondary"
																variant="secondary"
																onClick={() => openLicenseModal(addon)}
																isBusy={isCardLicenseBusy}
																disabled={isCardBusy}
															>
																{isCardLicenseBusy
																	? __('Loading…', 'blockish')
																	: __('Activate License', 'blockish')}
															</Button>
														)}
													</>
												)}
											</Flex>
										)}
									</div>
								</VStack>
							</CardBody>
						</Card>
					);
				})}
			</div>

			{modalAddon && (
				<Modal
					title={
						recoverOpen
							? __('Email my license key', 'blockish')
							: isModalLicensed
								? sprintf(__('Manage %s License', 'blockish'), modalAddon.name)
								: sprintf(__('Activate %s License', 'blockish'), modalAddon.name)
					}
					onRequestClose={closeLicenseModal}
					shouldCloseOnClickOutside={!isModalBusy}
					shouldCloseOnEsc={!isModalBusy}
					isDismissible={!isModalBusy}
					className="blockish-configure-modal blockish-license-modal"
				>
					{recoverOpen ? (
						<VStack spacing={4} className="blockish-license-modal-content">
							<Text className="blockish-schemas-modal-description">
								{__(
									'Enter the email address you used at checkout. We’ll send your license key if we find a matching purchase.',
									'blockish'
								)}
							</Text>

							{isModalBusy && busyAction === 'resend' && (
								<div className="blockish-license-processing" role="status" aria-live="polite">
									<Spinner />
									<span>{processingLabel}</span>
								</div>
							)}

							{recoverFeedback && (
								<Notice
									status={recoverFeedback.status === 'error' ? 'error' : 'success'}
									isDismissible={busyAction !== 'resend'}
									onRemove={() => setRecoverFeedback(null)}
								>
									{recoverFeedback.message}
								</Notice>
							)}

							<div className="blockish-license-key-field">
								<label className="blockish-license-key-label" htmlFor="blockish-license-recover-email">
									{__('Purchase email', 'blockish')}
								</label>
								<input
									id="blockish-license-recover-email"
									className="blockish-license-key-input"
									type="email"
									autoComplete="email"
									placeholder={__('you@example.com', 'blockish')}
									value={recoverEmail}
									onChange={(event) => setRecoverEmail(event.target.value)}
									disabled={busyAction === 'resend'}
									autoFocus
								/>
							</div>

							<Flex className="blockish-license-modal-actions" justify="flex-end" gap={2}>
								<Button
									variant="secondary"
									className="blockish-action-button is-secondary"
									onClick={closeRecoverModal}
									disabled={busyAction === 'resend'}
								>
									{__('Back', 'blockish')}
								</Button>
								<Button
									variant="primary"
									className="blockish-action-button is-primary"
									onClick={resendLicenseKey}
									isBusy={busyAction === 'resend'}
									disabled={busyAction === 'resend' || !recoverEmail.trim()}
								>
									{busyAction === 'resend'
										? __('Sending…', 'blockish')
										: __('Email my key', 'blockish')}
								</Button>
							</Flex>
						</VStack>
					) : (
					<VStack spacing={4} className="blockish-license-modal-content">
						<Text className="blockish-schemas-modal-description">
							{isModalLicensed
								? __(
										'This add-on is licensed on this site. You can deactivate the key to free a seat, or keep using it.',
										'blockish'
								  )
								: __(
										'Paste the license key from your purchase email to unlock this add-on on this site.',
										'blockish'
								  )}
						</Text>

						{isModalBusy && (
							<div className="blockish-license-processing" role="status" aria-live="polite">
								<Spinner />
								<span>{processingLabel}</span>
							</div>
						)}

						{modalFeedback && !isActivating && (
							<Notice
								status={modalFeedback.status === 'error' ? 'error' : 'success'}
								isDismissible={!isModalBusy}
								onRemove={() => setModalFeedback(null)}
							>
								{modalFeedback.message}
							</Notice>
						)}

						{isModalLicensed ? (
							<>
								<div className="blockish-license-active-card">
									<Text className="blockish-license-active-label">
										{modalLicense.plan_title
											? sprintf(__('Active plan: %s', 'blockish'), modalLicense.plan_title)
											: __('License active', 'blockish')}
									</Text>
									{modalLicense.masked_key ? (
										<code className="blockish-license-masked-key">{modalLicense.masked_key}</code>
									) : null}
								</div>

								{!modalAddon.is_installed && (
									<Notice status="warning" isDismissible={false}>
										{__('Install the add-on plugin to use premium features after licensing.', 'blockish')}
									</Notice>
								)}

								<Flex className="blockish-license-modal-actions" justify="flex-end" gap={2}>
									<Button
										className="blockish-action-button is-secondary"
										variant="secondary"
										onClick={closeLicenseModal}
										disabled={isModalBusy}
									>
										{__('Close', 'blockish')}
									</Button>
									<Button
										className="blockish-action-button is-secondary"
										variant="secondary"
										isDestructive
										onClick={() => deactivateLicense(modalAddon)}
										isBusy={isDeactivating || busyAction === 'reloading'}
										disabled={isModalBusy}
									>
										{isDeactivating
											? __('Deactivating…', 'blockish')
											: busyAction === 'reloading'
												? __('Reloading…', 'blockish')
												: __('Deactivate License', 'blockish')}
									</Button>
								</Flex>
							</>
						) : (
							<>
								{!modalAddon.is_installed && (
									<Notice status="warning" isDismissible={false}>
										{__('Install this add-on plugin first, then activate your license key.', 'blockish')}
									</Notice>
								)}

								{modalAddon.is_installed && !modalLicense.fs_ready && (
									<Notice status="warning" isDismissible={false}>
										{__('License service is not ready for this add-on yet. Try again in a moment.', 'blockish')}
									</Notice>
								)}

								<div className="blockish-license-key-field">
									<label className="blockish-license-key-label" htmlFor="blockish-license-key-input">
										{__('License key', 'blockish')}
									</label>
									<input
										id="blockish-license-key-input"
										className="blockish-license-key-input"
										type="text"
										autoComplete="off"
										spellCheck="false"
										placeholder={__('Paste your license key', 'blockish')}
										value={licenseKey}
										onChange={(event) => setLicenseKey(event.target.value)}
										disabled={isModalBusy}
										autoFocus
									/>
									<button
										type="button"
										className="blockish-license-recover-link"
										onClick={openRecoverModal}
										disabled={isModalBusy}
									>
										{__('Lost your license key?', 'blockish')}
									</button>
								</div>

								<Flex className="blockish-license-modal-actions" justify="flex-end" gap={2}>
									<Button
										className="blockish-action-button is-secondary"
										variant="secondary"
										onClick={closeLicenseModal}
										disabled={isModalBusy}
									>
										{__('Cancel', 'blockish')}
									</Button>
									<Button
										className="blockish-action-button is-primary"
										variant="primary"
										onClick={() => activateLicense(modalAddon)}
										isBusy={isActivating}
										disabled={isModalBusy || !licenseKey.trim()}
									>
										{busyAction === 'activate'
											? __('Activating…', 'blockish')
											: busyAction === 'reloading'
												? __('Reloading…', 'blockish')
												: __('Activate License', 'blockish')}
									</Button>
								</Flex>
							</>
						)}
					</VStack>
					)}
				</Modal>
			)}
		</VStack>
	);
}
