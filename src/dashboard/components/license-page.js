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
				id: '77651',
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
					__('Visual Query Builder & Post Loop', 'blockish'),
					__('Complete Form Builder (12+ Fields & Entries)', 'blockish'),
					__('Advanced Interactions (GSAP)', 'blockish'),
					__('Interactive Cursor Effects', 'blockish'),
					__('Smart Display Conditions', 'blockish'),
				],
			},
			{
				id: '77652',
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
					__('Visual Query Builder & Post Loop', 'blockish'),
					__('Complete Form Builder (12+ Fields & Entries)', 'blockish'),
					__('Advanced Interactions (GSAP)', 'blockish'),
					__('Interactive Cursor Effects', 'blockish'),
					__('Smart Display Conditions', 'blockish'),
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

		const productId = String(proData?.freemius_id || '40382');
		const planId = String(plan.id || (plan.key === 'agency' ? '77652' : '77651'));
		const publicKey = proData?.public_key || 'pk_844c5e5f9d06b95ab047217ee6d31';
		const logoImage = window.blockishDashboardData?.logoUrl || 'https://blockish.wowdevs.com/wp-content/plugins/blockish/assets/logo.png';

		let licKey = '';

		try {
			const context = await apiFetch({
				path: `${addonsApiPath}/checkout-context?slug=blockish-pro`,
				method: 'GET',
			});

			if (context?.license_key) licKey = context.license_key;
		} catch (err) {
			// Fallback to defaults
		} finally {
			setCheckoutBusy(null);
		}

		const onPurchaseSuccess = async (response) => {
			const receivedKey = response?.license?.key || licKey;
			if (receivedKey) {
				setNotice({
					type: 'success',
					message: __('Payment confirmed! Activating your Blockish Pro license…', 'blockish'),
				});

				try {
					await apiFetch({
						path: `${addonsApiPath}/license/activate`,
						method: 'POST',
						data: {
							slug: 'blockish-pro',
							license_key: receivedKey,
						},
					});

					setNotice({
						type: 'success',
						message: __('License activated successfully! Reloading…', 'blockish'),
					});
				} catch (err) {
					setNotice({
						type: 'success',
						message: sprintf(
							/* translators: %s: license key */
							__('Purchase completed! Your license key is %s. Please activate it below.', 'blockish'),
							receivedKey
						),
					});
				}
			} else {
				setNotice({
					type: 'success',
					message: __('Purchase complete! Reloading…', 'blockish'),
				});
			}

			window.setTimeout(() => {
				window.location.reload();
			}, 1500);
		};

		const isTrialEligible = billingCycle !== 'lifetime';

		const FS = window.FS;
		if (FS && FS.Checkout) {
			try {
				let handler;
				if (typeof FS.Checkout === 'function') {
					handler = new FS.Checkout({
						product_id: productId,
						plan_id: planId,
						public_key: publicKey,
						image: logoImage,
						trial: isTrialEligible,
					});
				} else if (typeof FS.Checkout.configure === 'function') {
					handler = FS.Checkout.configure({
						plugin_id: productId,
						plan_id: planId,
						public_key: publicKey,
						image: logoImage,
						trial: isTrialEligible,
					});
				}

				if (handler && typeof handler.open === 'function') {
					handler.open({
						name: 'Blockish Pro',
						licenses: plan.licenses || undefined,
						cycle: billingCycle,
						trial: isTrialEligible,
						purchaseCompleted: (response) => {
							onPurchaseSuccess(response);
						},
						success: (response) => {
							onPurchaseSuccess(response);
						},
					});
					return;
				}
			} catch (checkoutErr) {
				console.error('Freemius checkout error:', checkoutErr);
			}
		}

		// Fallback to website pricing
		window.open('https://blockish.wowdevs.com/pricing/', '_blank');
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
				<div
					style={{
						background: '#ffffff',
						border: '1px solid #e2e8f0',
						borderRadius: '16px',
						padding: '28px 32px',
						boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
					}}
				>
					<div style={{ maxWidth: '680px' }}>
						<div style={{ marginBottom: '18px' }}>
							<h3
								style={{
									margin: '0 0 6px 0',
									fontSize: '18px',
									fontWeight: 700,
									color: '#0f172a',
									letterSpacing: '-0.01em',
								}}
							>
								{__('Activate License Key', 'blockish')}
							</h3>
							<p
								style={{
									margin: 0,
									fontSize: '14px',
									color: '#64748b',
									lineHeight: 1.5,
								}}
							>
								{__(
									'Already purchased Blockish Pro? Enter your license key below to activate all Pro features on this site.',
									'blockish'
								)}
							</p>
						</div>

						<form onSubmit={handleActivate} style={{ width: '100%' }}>
							<label
								htmlFor="blockish-license-key-input"
								style={{
									display: 'block',
									fontSize: '12px',
									fontWeight: 600,
									color: '#475569',
									textTransform: 'uppercase',
									letterSpacing: '0.04em',
									marginBottom: '8px',
								}}
							>
								{__('License Key', 'blockish')}
							</label>

							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '10px',
									width: '100%',
								}}
							>
								<div
									style={{
										position: 'relative',
										flex: 1,
										display: 'flex',
										alignItems: 'center',
									}}
								>
									<span
										style={{
											position: 'absolute',
											left: '14px',
											color: '#94a3b8',
											display: 'inline-flex',
											alignItems: 'center',
											pointerEvents: 'none',
										}}
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5L13 7l-1.5-1.5L9 8l-2-2-4 4a5.66 5.66 0 0 0 8 8l2-2 1.5 1.5L16 16l1.5-1.5L19 16l2-2-3.5-3.5" />
											<circle cx="7.5" cy="15.5" r="1.5" />
										</svg>
									</span>
									<input
										id="blockish-license-key-input"
										type="text"
										value={licenseKey}
										onChange={(e) => setLicenseKey(e.target.value)}
										disabled={isActivating}
										placeholder={__('Enter your license key (e.g. 656e01fa…)', 'blockish')}
										style={{
											width: '100%',
											height: '46px',
											paddingLeft: '40px',
											paddingRight: '14px',
											fontSize: '14px',
											fontFamily: 'inherit',
											color: '#0f172a',
											background: '#ffffff',
											border: '1px solid #cbd5e1',
											borderRadius: '10px',
											boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
											outline: 'none',
											transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
										}}
										onFocus={(e) => {
											e.target.style.borderColor = '#2563eb';
											e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
										}}
										onBlur={(e) => {
											e.target.style.borderColor = '#cbd5e1';
											e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
										}}
									/>
								</div>

								<button
									type="submit"
									disabled={isActivating || !licenseKey.trim()}
									style={{
										height: '46px',
										padding: '0 24px',
										fontSize: '14px',
										fontWeight: 600,
										borderRadius: '10px',
										border: 'none',
										background: isActivating || !licenseKey.trim() ? '#94a3b8' : '#2563eb',
										color: '#ffffff',
										cursor: isActivating || !licenseKey.trim() ? 'not-allowed' : 'pointer',
										display: 'inline-flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '8px',
										whiteSpace: 'nowrap',
										boxShadow: isActivating || !licenseKey.trim() ? 'none' : '0 2px 8px rgba(37, 99, 235, 0.25)',
										transition: 'background-color 0.15s ease',
									}}
								>
									{isActivating ? <Spinner /> : __('Activate License', 'blockish')}
								</button>
							</div>
						</form>

						<div style={{ marginTop: '14px' }}>
							<span style={{ fontSize: '13px', color: '#64748b' }}>
								{__('Lost your license key?', 'blockish')}{' '}
							</span>
							<button
								type="button"
								onClick={() => {
									setRecoverNotice(null);
									setIsRecoverOpen(true);
								}}
								style={{
									background: 'none',
									border: 'none',
									padding: 0,
									margin: 0,
									color: '#2563eb',
									fontSize: '13px',
									fontWeight: 600,
									cursor: 'pointer',
									textDecoration: 'underline',
									textUnderlineOffset: '2px',
								}}
							>
								{__('Click here to recover', 'blockish')}
							</button>
						</div>
					</div>
				</div>
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
								borderRadius: '10px',
								border: '1px solid #e2e8f0',
								gap: '4px',
							}}
						>
							<button
								type="button"
								onClick={() => setBillingCycle('annual')}
								style={{
									padding: '6px 14px',
									fontSize: '13px',
									fontWeight: 600,
									borderRadius: '7px',
									border: 'none',
									cursor: 'pointer',
									background: billingCycle === 'annual' ? '#ffffff' : 'transparent',
									color: billingCycle === 'annual' ? '#0f172a' : '#64748b',
									boxShadow: billingCycle === 'annual' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
									transition: 'all 0.15s ease',
								}}
							>
								{__('Annual (Save ~45%)', 'blockish')}
							</button>
							<button
								type="button"
								onClick={() => setBillingCycle('monthly')}
								style={{
									padding: '6px 14px',
									fontSize: '13px',
									fontWeight: 600,
									borderRadius: '7px',
									border: 'none',
									cursor: 'pointer',
									background: billingCycle === 'monthly' ? '#ffffff' : 'transparent',
									color: billingCycle === 'monthly' ? '#0f172a' : '#64748b',
									boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
									transition: 'all 0.15s ease',
								}}
							>
								{__('Monthly', 'blockish')}
							</button>
							<button
								type="button"
								onClick={() => setBillingCycle('lifetime')}
								style={{
									padding: '6px 14px',
									fontSize: '13px',
									fontWeight: 600,
									borderRadius: '7px',
									border: 'none',
									cursor: 'pointer',
									background: billingCycle === 'lifetime' ? '#ffffff' : 'transparent',
									color: billingCycle === 'lifetime' ? '#0f172a' : '#64748b',
									boxShadow: billingCycle === 'lifetime' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
									transition: 'all 0.15s ease',
								}}
							>
								{__('Lifetime (Best Value)', 'blockish')}
							</button>
						</div>
					</FlexItem>
				</Flex>

				{/* 2 Packages Grid: Personal & Agency */}
				<div
					className="blockish-pricing-grid"
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
						gap: '24px',
						alignItems: 'stretch',
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
							<div
								key={plan.key}
								className={`blockish-plan-card ${isFeatured ? 'is-featured' : ''}`}
								style={{
									position: 'relative',
									display: 'flex',
									flexDirection: 'column',
									background: '#ffffff',
									border: isFeatured ? '2px solid #2563eb' : '1px solid #e2e8f0',
									borderRadius: '16px',
									boxShadow: isFeatured ? '0 10px 25px -4px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
									padding: '32px 28px',
								}}
							>
								{isFeatured && (
									<div
										style={{
											position: 'absolute',
											top: '-12px',
											right: '24px',
											background: '#2563eb',
											color: '#ffffff',
											fontSize: '11px',
											fontWeight: 700,
											letterSpacing: '0.06em',
											textTransform: 'uppercase',
											padding: '4px 14px',
											borderRadius: '999px',
											boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
										}}
									>
										{__('Most Popular', 'blockish')}
									</div>
								)}

								<div style={{ marginBottom: '20px' }}>
									<h3 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
										{plan.title}
									</h3>
									<div style={{ fontSize: '13px', fontWeight: 600, color: isFeatured ? '#2563eb' : '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
										{plan.tagline}
									</div>
									<p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
										{plan.description}
									</p>
								</div>

								{/* Price display */}
								<div style={{ paddingBottom: '20px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
									<div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
										<span style={{ fontSize: '42px', fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>
											{price}
										</span>
										<span style={{ fontSize: '15px', fontWeight: 500, color: '#64748b' }}>
											{getCycleSuffix()}
										</span>
									</div>
									{billingCycle === 'annual' && (
										<div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
											<span>●</span> {__('Billed annually · Cancel anytime', 'blockish')}
										</div>
									)}
									{billingCycle === 'monthly' && (
										<div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '8px' }}>
											{__('Billed monthly · Cancel anytime', 'blockish')}
										</div>
									)}
									{billingCycle === 'lifetime' && (
										<div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginTop: '8px' }}>
											{__('One-time payment · Lifetime access', 'blockish')}
										</div>
									)}
								</div>

								{/* Feature Checklist */}
								<div style={{ flex: 1, marginBottom: '28px' }}>
									<ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
										{plan.features.map((feature, idx) => (
											<li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
												<span
													style={{
														display: 'inline-flex',
														alignItems: 'center',
														justifyContent: 'center',
														width: '20px',
														height: '20px',
														borderRadius: '50%',
														background: '#ecfdf5',
														color: '#059669',
														flexShrink: 0,
														marginTop: '1px',
													}}
													aria-hidden="true"
												>
													<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
														<path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
													</svg>
												</span>
												<span style={{ fontSize: '14px', color: '#334155', lineHeight: 1.45, fontWeight: 500 }}>
													{feature}
												</span>
											</li>
										))}
									</ul>
								</div>

								{/* CTA Button */}
								<div style={{ marginTop: 'auto' }}>
									<button
										type="button"
										disabled={isBusy || isCurrent}
										onClick={() => handleBuyOrUpgrade(plan)}
										style={{
											width: '100%',
											minHeight: '46px',
											padding: '12px 20px',
											fontSize: '15px',
											fontWeight: 600,
											borderRadius: '10px',
											border: isFeatured ? 'none' : '1px solid #cbd5e1',
											cursor: isBusy || isCurrent ? 'default' : 'pointer',
											background: isFeatured ? '#2563eb' : '#ffffff',
											color: isFeatured ? '#ffffff' : '#0f172a',
											boxShadow: isFeatured ? '0 4px 12px rgba(37, 99, 235, 0.25)' : '0 1px 2px rgba(0,0,0,0.05)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											gap: '8px',
											transition: 'all 0.15s ease',
										}}
									>
										{isBusy ? (
											<Spinner />
										) : isCurrent ? (
											__('Current Plan', 'blockish')
										) : isLicensed ? (
											sprintf(__('Upgrade to %s', 'blockish'), plan.title)
										) : billingCycle === 'lifetime' ? (
											sprintf(__('Get %s', 'blockish'), plan.title)
										) : (
											sprintf(__('Start 30-Day Free Trial', 'blockish'))
										)}
									</button>
								</div>
							</div>
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
