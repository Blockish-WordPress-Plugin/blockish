import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { Button, Card, CardBody, Flex, __experimentalHeading as Heading, __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { check } from '@wordpress/icons';

export default function AddonsPage() {
	const addons = useMemo(() => {
		const list = window.blockishDashboardData?.addonsList || {};
		// Convert to array and sort: Bundle first, then alphabetical
		return Object.entries(list).map(([slug, item]) => ({
			slug,
			...item
		})).sort((a, b) => {
			if (a.is_bundle) return -1;
			if (b.is_bundle) return 1;
			return a.name.localeCompare(b.name);
		});
	}, []);

	const openFreemiusCheckout = (addon) => {
		if (typeof window.FS === 'undefined') {
			alert(__('Checkout is currently unavailable.', 'blockish'));
			return;
		}
		
		const handler = window.FS.Checkout.configure({
			plugin_id: addon.freemius_id,
			public_key: addon.public_key,
			// Additional options can be passed here (e.g., plan_id, billing_cycle)
		});
		
		handler.open({
			name: addon.name,
			// For a bundle we might open a specific plan
		});
	};

	return (
		<VStack className="blockish-blocks-page blockish-addons-page" spacing={5}>
			{/* Hero Section */}
			<div className="blockish-addons-hero" style={{ 
				background: 'linear-gradient(135deg, #0f172a, #3b82f6)', 
				color: 'white', 
				padding: '48px 32px', 
				borderRadius: '16px', 
				marginBottom: '24px', 
				textAlign: 'center',
				boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)'
			}}>
				<Heading level={1} style={{ color: 'white', marginBottom: '16px', fontSize: '2.5rem', fontWeight: 800 }}>
					{__('Unlock the Full Potential of Blockish', 'blockish')}
				</Heading>
				<Text style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: '650px', margin: '0 auto', display: 'block', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.9)' }}>
					{__('Supercharge your website building experience with our premium addons. Add advanced features, dynamic data, and professional tools to your workflow.', 'blockish')}
				</Text>
			</div>

			<div className="blockish-block-grid blockish-addons-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
				{addons.map((addon) => (
					<Card 
						key={addon.slug} 
						className={`blockish-block-card ${addon.is_bundle ? 'is-bundle' : ''}`} 
						size="small"
						style={{ 
							border: addon.is_bundle ? '2px solid var(--color-blue-600)' : '1px solid var(--color-gray-200)', 
							position: 'relative', 
							overflow: 'visible',
							display: 'flex',
							flexDirection: 'column'
						}}
					>
						{addon.is_bundle && (
							<div style={{ 
								position: 'absolute', 
								top: '-14px', 
								right: '24px', 
								background: 'linear-gradient(90deg, #f59e0b, #ef4444)', 
								color: 'white', 
								padding: '6px 16px', 
								borderRadius: '20px', 
								fontWeight: 'bold', 
								fontSize: '11px', 
								textTransform: 'uppercase', 
								letterSpacing: '0.5px',
								boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
								zIndex: 2
							}}>
								{__('Best Value', 'blockish')}
							</div>
						)}
						<CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px 28px' }}>
							<VStack spacing={5} style={{ flexGrow: 1 }}>
								<Heading className="blockish-block-card-title" level={3} style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
									{addon.name}
								</Heading>
								<Text className="blockish-block-card-description blockish-text-muted" style={{ lineHeight: 1.6 }}>
									{addon.description}
								</Text>
								
								{addon.features && addon.features.length > 0 && (
									<ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
										{addon.features.map(feature => (
											<li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
												<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--color-green-600)', flexShrink: 0, marginTop: '2px' }}>
													<path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
												</svg>
												<span style={{ color: 'var(--color-gray-700)', fontSize: '0.95rem', fontWeight: 500 }}>{feature}</span>
											</li>
										))}
									</ul>
								)}
							</VStack>
							
							<div style={{ marginTop: '32px' }}>
								{addon.is_available ? (
									<div style={{ background: 'var(--color-green-50)', color: 'var(--color-green-700)', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', border: '1px solid var(--color-green-100)' }}>
										{__('Installed & Active', 'blockish')}
									</div>
								) : (
									<Button
										variant={addon.is_bundle ? 'primary' : 'secondary'}
										onClick={() => openFreemiusCheckout(addon)}
										style={addon.is_bundle ? { 
											width: '100%', 
											justifyContent: 'center', 
											background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', 
											border: 'none', 
											padding: '24px 16px', 
											fontSize: '16px', 
											fontWeight: 'bold',
											borderRadius: '8px'
										} : { 
											width: '100%', 
											justifyContent: 'center', 
											padding: '24px 16px', 
											fontSize: '16px', 
											fontWeight: 'bold',
											borderRadius: '8px',
											color: 'var(--color-gray-900)',
											borderColor: 'var(--color-gray-300)'
										}}
									>
										{addon.is_bundle ? __('Get Pro Bundle Now', 'blockish') : __('Buy Now', 'blockish')}
									</Button>
								)}
							</div>
						</CardBody>
					</Card>
				))}
			</div>
		</VStack>
	);
}
