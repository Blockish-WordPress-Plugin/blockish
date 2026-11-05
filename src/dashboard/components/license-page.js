import { __, sprintf } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Card,
	CardBody,
	Flex,
	FlexItem,
	Modal,
	Notice,
	Spinner,
	TextControl,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';

const CheckIcon = () => (
	<span className="blockish-addon-feature-check" aria-hidden="true">
		<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	</span>
);

export default function LicensePage() {
	const proData = window.blockishDashboardData?.pro || {};
	const addonsApiPath = window.blockishDashboardData?.addonsApiPath || '/blockish/v1/addons';

	const license = proData?.license || {};
	const isLicensed = Boolean(license?.is_active);
	const activePlanTitle = license?.plan_title || '';
	const maskedKey = license?.masked_key || '';

	const [licenseKey, setLicenseKey] = useState('');
	const [billingCycle, setBillingCycle] = useState('annual'); // 'annual', 'monthly', 'lifetime'
	const [notice, setNotice] = useState(null);
	const [isActivating, setIsActivating] = useState(false);
	const [isDeactivating, setIsDeactivating] = useState(false);
	const [checkoutBusy, setCheckoutBusy] = useState(null);

	// Recover modal state
	const [isRecoverOpen, setIsRecoverOpen] = useState(false);
	const [recoverEmail, setRecoverEmail] = useState(
		() => window.blockishDashboardData?.userEmail || ''
	);
	const [recoverNotice, setRecoverNotice] = useState(null);
	const [isResending, setIsResending] = useState(false);

	const plans = useMemo(() => {
		if (Array.isArray(proData?.plans) && proData.plans.length > 0) {
			return proData.plans;
		}
		return [
			{
				id: '58654',
				key: 'personal',
				title: __('Personal', 'blockish'),
				tagline: __('Single Site License', 'blockish'),
				description: __('Perfect for solo creators, bloggers, and single site owners.', 'blockish'),
				licenses: 1,
				pricing: {
					monthly: 3.99,
					annual: 24.99,
					lifetime: 59.99,
				},
				features: [
					__('1 Site License', 'blockish'),
					__('Visual Form Builder & 12 Field Blocks', 'blockish'),
					__('Visual Query Builder & Post Loop', 'blockish'),
					__('Dynamic Data & Custom Fields (ACF, Meta)', 'blockish'),
					__('Display Conditions & Visibility Rules', 'blockish'),
					__('Advanced GSAP ScrollTrigger Animations', 'blockish'),
					__('Interactive Custom Cursor Effects', 'blockish'),
					__('Full AI MCP Assistant Integration', 'blockish'),
					__('1 Year Automatic Updates & Support', 'blockish'),
				],
			},
			{
				id: '58656',
				key: 'agency',
				title: __('Agency', 'blockish'),
				tagline: __('Unlimited Sites License', 'blockish'),
				description: __('Ideal for agencies, freelancers, and multiple client projects.', 'blockish'),
				licenses: null,
				featured: true,
				pricing: {
					monthly: 9.99,
					annual: 79.99,
					lifetime: 149.99,
				},
				features: [
					__('Unlimited Sites License', 'blockish'),
					__('Visual Form Builder & 12 Field Blocks', 'blockish'),
					__('Visual Query Builder & Post Loop', 'blockish'),
					__('Dynamic Data & Custom Fields (ACF, Meta)', 'blockish'),
					__('Display Conditions & Visibility Rules', 'blockish'),
					__('Advanced GSAP ScrollTrigger Animations', 'blockish'),
					__('Interactive Custom Cursor Effects', 'blockish'),
					__('Full AI MCP Assistant Integration', 'blockish'),
					__('Priority VIP Support & Updates', 'blockish'),
					__('Unlimited Client Projects', 'blockish'),
				],
			},
		];
	}, [proData?.plans]);

	const handleActivate = async (e) => {
		if (e) e.preventDefault();
		const key = licenseKey.trim();
		if (!key) {
			setNotice({
				type: 'error',
				message: __('Please enter your license key.', 'blockish'),
			});
			return;
		}

		setIsActivating(true);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: `${addonsApiPath}/license/activate`,
				method: 'POST',
				data: {
					slug: 'blockish-pro',
					license_key: key,
				},
			});

			setNotice({
				type: 'success',
				message: response?.message || __('License activated successfully! Reloading…', 'blockish'),
			});

			window.setTimeout(() => {
				window.location.reload();
			}, 1200);
		} catch (error) {
			setNotice({
				type: 'error',
				message: error?.message || __('Failed to activate license. Please verify your key.', 'blockish'),
			});
			setIsActivating(false);
		}
	};

	const handleDeactivate = async () => {
		if (
			!window.confirm(
				__('Are you sure you want to deactivate your Blockish Pro license on this site?', 'blockish')
			)
		) {
			return;
		}

		setIsDeactivating(true);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: `${addonsApiPath}/license/deactivate`,
				method: 'POST',
				data: {
					slug: 'blockish-pro',
				},
			});

			setNotice({
				type: 'success',
				message: response?.message || __('License deactivated successfully.', 'blockish'),
			});

			window.setTimeout(() => {
				window.location.reload();
			}, 1200);
		} catch (error) {
			setNotice({
				type: 'error',
				message: error?.message || __('Failed to deactivate license.', 'blockish'),
			});
			setIsDeactivating(false);
		}
	};

	const handleBuyOrUpgrade = async (plan) => {
		setCheckoutBusy(plan.key);

		let checkoutOptions = {
			plugin_id: proData?.freemius_id || 40382,
			public_key: proData?.public_key || 'pk_844c5e5f9d06b95ab047217ee6d31',
			name: 'Blockish Pro',
			plan_id: String(plan.id),
			cycle: billingCycle,
		};

		try {
			const context = await apiFetch({
				path: `${addonsApiPath}/checkout-context?slug=blockish-pro`,
				method: 'GET',
			});

			if (context?.plugin_id) checkoutOptions.plugin_id = context.plugin_id;
			if (context?.public_key) checkoutOptions.public_key = context.public_key;
			if (context?.name) checkoutOptions.name = context.name;
			if (context?.license_key) checkoutOptions.license_key = context.license_key;
		} catch (err) {
			// Fallback to defaults
		} finally {
			setCheckoutBusy(null);
		}

		if (window.FS?.Checkout?.configure) {
			const { name, license_key: licKey, ...config } = checkoutOptions;
			const handler = window.FS.Checkout.configure(config);
			handler.open({
				name,
				licenses: plan.licenses,
				cycle: billingCycle,
				purchaseCompleted: () => {
					setNotice({
						type: 'success',
						message: licKey
							? __('Plan upgraded successfully! Reloading…', 'blockish')
							: __('Purchase complete! Please paste your license key if it did not sync automatically.', 'blockish'),
					});
					window.setTimeout(() => {
						window.location.reload();
					}, 1500);
				},
			});
		} else {
			window.open('https://blockish.wowdevs.com/pricing/', '_blank');
		}
	};

	const handleResend = async (e) => {
		if (e) e.preventDefault();
		const email = recoverEmail.trim();
		if (!email) {
			setRecoverNotice({
				type: 'error',
				message: __('Please enter your purchase email address.', 'blockish'),
			});
			return;
		}

		setIsResending(true);
		setRecoverNotice(null);

		try {
			const response = await apiFetch({
				path: `${addonsApiPath}/license/resend`,
				method: 'POST',
				data: {
					slug: 'blockish-pro',
					email,
				},
			});

			setRecoverNotice({
				type: 'success',
				message:
					response?.message ||
					__(
						'If a purchase was found, your license key has been emailed to you. Check your inbox and spam folder.',
						'blockish'
					),
			});
		} catch (error) {
			setRecoverNotice({
				type: 'error',
				message: error?.message || __('Failed to resend license key. Please check the email.', 'blockish'),
			});
		} finally {
			setIsResending(false);
		}
	};

	const formatPrice = (plan) => {
		const pr = plan.pricing?.[billingCycle];
		if (!pr) return '';
		return `$${pr.toFixed(2)}`;
	};

	const getCycleSuffix = () => {
		if (billingCycle === 'monthly') return __('/ month', 'blockish');
		if (billingCycle === 'lifetime') return __('one-time', 'blockish');
		return __('/ year', 'blockish');
	};

	return (
		<VStack className="blockish-blocks-page blockish-addons-page" spacing={5}>
			<header className="blockish-page-header">
				<Heading className="blockish-heading-primary" level={1}>
					{__('Blockish Pro License & Plans', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{__(
						'Activate your license key to unlock all premium features, or choose a plan below.',
						'blockish'
					)}
				</Text>
			</header>

			{notice && (
				<Notice
					status={notice.type === 'error' ? 'error' : 'success'}
					isDismissible
					onRemove={() => setNotice(null)}
				>
					{notice.message}
				</Notice>
			)}

			{/* Active License Banner or Activation Card */}
			{isLicensed ? (
				<Card className="blockish-block-card is-licensed">
					<CardBody>
						<HStack alignment="center" justify="space-between" wrap>
							<VStack spacing={1}>
								<HStack spacing={2} alignment="center">
									<span className="blockish-addon-licensed-dot" />
									<Heading level={3} style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#15803d' }}>
										{__('License Active', 'blockish')}
									</Heading>
									{activePlanTitle && (
										<span className="blockish-addon-plan-current-badge">
											{activePlanTitle}
										</span>
									)}
								</HStack>
								<Text className="blockish-text-muted">
									{maskedKey
										? sprintf(__('Active Key: %s', 'blockish'), maskedKey)
										: __('Blockish Pro features are active and licensed on this site.', 'blockish')}
								</Text>
							</VStack>

							<HStack spacing={2}>
								<Button
									isDestructive
									variant="secondary"
									onClick={handleDeactivate}
									disabled={isDeactivating}
								>
									{isDeactivating ? <Spinner /> : __('Deactivate License', 'blockish')}
								</Button>
							</HStack>
						</HStack>
					</CardBody>
				</Card>
			) : (
				<Card className="blockish-block-card">
					<CardBody>
						<VStack spacing={4}>
							<div>
								<Heading level={3} style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
									{__('Activate License Key', 'blockish')}
								</Heading>
								<Text className="blockish-text-muted">
									{__(
										'Already purchased Blockish Pro? Enter your license key below to activate all Pro features on this site.',
										'blockish'
									)}
								</Text>
							</div>

							<form onSubmit={handleActivate} style={{ width: '100%' }}>
								<HStack alignment="bottom" spacing={3} wrap>
									<FlexItem style={{ flex: '1 1 320px' }}>
										<TextControl
											label={__('License Key', 'blockish')}
											placeholder={__('Enter your license key (e.g. 656e01fa…)', 'blockish')}
											value={licenseKey}
											onChange={setLicenseKey}
											disabled={isActivating}
											hideLabelFromVision={false}
										/>
									</FlexItem>
									<FlexItem>
										<Button
											variant="primary"
											type="submit"
											disabled={isActivating || !licenseKey.trim()}
											style={{ minHeight: '36px' }}
										>
											{isActivating ? <Spinner /> : __('Activate License', 'blockish')}
										</Button>
									</FlexItem>
								</HStack>
							</form>

							<HStack justify="flex-start">
								<button
									type="button"
									className="blockish-license-recover-link"
									onClick={() => {
										setRecoverNotice(null);
										setIsRecoverOpen(true);
									}}
								>
									{__('Lost your license key? Click here to recover.', 'blockish')}
								</button>
							</HStack>
						</VStack>
					</CardBody>
				</Card>
			)}

			{/* Pricing / Packages Section */}
			<VStack spacing={4} style={{ marginTop: '16px' }}>
				<Flex justify="space-between" align="center" wrap>
					<FlexItem>
						<Heading level={2} style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
							{__('Available Plans', 'blockish')}
						</Heading>
						<Text className="blockish-text-muted">
							{__('Choose the plan that best fits your workflow. 30-day money-back guarantee.', 'blockish')}
						</Text>
					</FlexItem>

					{/* Billing Cycle Switcher */}
					<FlexItem>
						<div
							style={{
								display: 'inline-flex',
								background: '#f1f5f9',
								padding: '4px',
								borderRadius: '8px',
								gap: '4px',
							}}
						>
							<Button
								size="small"
								variant={billingCycle === 'annual' ? 'primary' : 'tertiary'}
								onClick={() => setBillingCycle('annual')}
							>
								{__('Annual (Save ~45%)', 'blockish')}
							</Button>
							<Button
								size="small"
								variant={billingCycle === 'monthly' ? 'primary' : 'tertiary'}
								onClick={() => setBillingCycle('monthly')}
							>
								{__('Monthly', 'blockish')}
							</Button>
							<Button
								size="small"
								variant={billingCycle === 'lifetime' ? 'primary' : 'tertiary'}
								onClick={() => setBillingCycle('lifetime')}
							>
								{__('Lifetime (Best Value)', 'blockish')}
							</Button>
						</div>
					</FlexItem>
				</Flex>

				{/* 2 Packages Grid: Personal & Agency */}
				<div
					className="blockish-block-grid"
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
						gap: '24px',
					}}
				>
					{plans.map((plan) => {
						const isFeatured = Boolean(plan.featured);
						const isCurrent =
							isLicensed &&
							activePlanTitle &&
							activePlanTitle.toLowerCase().includes(plan.key.toLowerCase());
						const price = formatPrice(plan);
						const isBusy = checkoutBusy === plan.key;

						return (
							<Card
								key={plan.key}
								className={`blockish-block-card blockish-addon-card ${isFeatured ? 'is-bundle' : ''}`}
								style={{
									position: 'relative',
									border: isFeatured ? '2px solid #3b82f6' : '1px solid #e2e8f0',
									borderRadius: '12px',
									boxShadow: isFeatured ? '0 10px 25px -5px rgba(59, 130, 246, 0.15)' : 'none',
								}}
							>
								{isFeatured && (
									<div className="blockish-addon-ribbon">
										{__('Most Popular', 'blockish')}
									</div>
								)}

								<CardBody style={{ padding: '32px 24px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
									<VStack spacing={4} style={{ flex: 1 }}>
										<div>
											<Heading level={3} style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>
												{plan.title}
											</Heading>
											<Text style={{ fontSize: '13px', fontWeight: 600, color: '#3b82f6', marginTop: '2px' }}>
												{plan.tagline}
											</Text>
											<Text className="blockish-text-muted" style={{ marginTop: '8px', fontSize: '14px' }}>
												{plan.description}
											</Text>
										</div>

										{/* Price display */}
										<div style={{ margin: '8px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
											<div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
												<span style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a' }}>
													{price}
												</span>
												<span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>
													{getCycleSuffix()}
												</span>
											</div>
											{billingCycle === 'annual' && (
												<Text style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
													{__('Billed annually · Cancel anytime', 'blockish')}
												</Text>
											)}
										</div>

										{/* Feature Checklist */}
										<ul className="blockish-addon-features" style={{ margin: 0, padding: 0 }}>
											{plan.features.map((feature, idx) => (
												<li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
													<CheckIcon />
													<span style={{ fontSize: '14px', color: '#334155' }}>
														{feature}
													</span>
												</li>
											))}
										</ul>

										{/* CTA Button */}
										<div style={{ marginTop: 'auto', paddingTop: '16px' }}>
											<Button
												variant={isFeatured ? 'primary' : 'secondary'}
												style={{
													width: '100%',
													justifyContent: 'center',
													minHeight: '44px',
													fontSize: '15px',
													fontWeight: 600,
													borderRadius: '8px',
												}}
												disabled={isBusy || isCurrent}
												onClick={() => handleBuyOrUpgrade(plan)}
											>
												{isBusy ? (
													<Spinner />
												) : isCurrent ? (
													__('Current Plan', 'blockish')
												) : isLicensed ? (
													sprintf(__('Upgrade to %s', 'blockish'), plan.title)
												) : (
													sprintf(__('Get %s', 'blockish'), plan.title)
												)}
											</Button>
										</div>
									</VStack>
								</CardBody>
							</Card>
						);
					})}
				</div>
			</VStack>

			{/* Recover License Key Modal */}
			{isRecoverOpen && (
				<Modal
					title={__('Email My License Key', 'blockish')}
					onRequestClose={() => {
						if (!isResending) setIsRecoverOpen(false);
					}}
					className="blockish-configure-modal blockish-license-modal"
				>
					<form onSubmit={handleResend}>
						<VStack spacing={4} className="blockish-license-modal-content">
							<Text className="blockish-schemas-modal-description">
								{__(
									'Enter the email address you used at checkout. We will email your license key if a matching purchase is found.',
									'blockish'
								)}
							</Text>

							{recoverNotice && (
								<Notice
									status={recoverNotice.type === 'error' ? 'error' : 'success'}
									isDismissible
									onRemove={() => setRecoverNotice(null)}
								>
									{recoverNotice.message}
								</Notice>
							)}

							<TextControl
								label={__('Purchase Email Address', 'blockish')}
								type="email"
								placeholder="you@example.com"
								value={recoverEmail}
								onChange={setRecoverEmail}
								disabled={isResending}
							/>

							<HStack justify="flex-end" spacing={2} style={{ marginTop: '8px' }}>
								<Button
									variant="tertiary"
									onClick={() => setIsRecoverOpen(false)}
									disabled={isResending}
								>
									{__('Close', 'blockish')}
								</Button>
								<Button
									variant="primary"
									type="submit"
									disabled={isResending || !recoverEmail.trim()}
								>
									{isResending ? <Spinner /> : __('Send License Key', 'blockish')}
								</Button>
							</HStack>
						</VStack>
					</form>
				</Modal>
			)}
		</VStack>
	);
}
