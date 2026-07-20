import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import apiFetch from '@wordpress/api-fetch';
import { 
	Button, 
	Modal, 
	TextControl, 
	SelectControl, 
	Notice,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	SearchControl,
	DropdownMenu,
	MenuGroup,
	MenuItem
} from '@wordpress/components';
import { Icon, grid, list, moreVertical, chevronLeft, layout, filter, cog, wordpress, check } from '@wordpress/icons';

export default function TemplateBuilderPage() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [newTemplateName, setNewTemplateName] = useState('');
	const [newTemplateType, setNewTemplateType] = useState('header');
	const [newTemplateCondition, setNewTemplateCondition] = useState('entire_site');
	const [isCreating, setIsCreating] = useState(false);
	
	const [templates, setTemplates] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isNoticeVisible, setIsNoticeVisible] = useState(true);
	const [viewMode, setViewMode] = useState('grid');
	const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	
	const { onNavigateToEntityRecord } = useSelect( ( select ) => {
		// Fallback to empty object if blockEditorStore is not registered yet
		const getSettings = select(blockEditorStore)?.getSettings;
		return {
			onNavigateToEntityRecord: getSettings ? getSettings().onNavigateToEntityRecord : null,
		};
	}, [] );

	const isBlockTheme = window.blockishDashboardData?.isBlockTheme;
	const siteUrl = window.blockishDashboardData?.siteUrl || '/wp-admin/';
	const wizardPostId = parseInt(window.blockishDashboardData?.wizardPostId, 10);
	
	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				const response = await apiFetch({ path: '/wp/v2/blockish_template?per_page=100' });
				// Filter out the wizard post itself and format for display
				const formatted = response
					.filter(post => post.id !== wizardPostId)
					.map(post => ({
						id: post.id,
						name: post.title.rendered || __('Untitled', 'blockish'),
						type: post.meta?.template_type || 'single',
						description: post.meta?.display_condition || '',
						author: post._embedded?.author?.[0]?.name || 'Admin', // requires _embed in query ideally, but we'll use fallback
						status: post.status
					}));
				setTemplates(formatted);
			} catch (error) {
				console.error('Error fetching templates:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTemplates();
	}, [wizardPostId]);

	const filteredTemplates = templates.filter(t => 
		t.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleCreateTemplate = async () => {
		let finalName = newTemplateName;
		if (newTemplateType !== 'custom') {
			// Auto-generate name based on type
			const typeLabels = {
				header: __('Header', 'blockish'),
				footer: __('Footer', 'blockish'),
				single: __('Single Post', 'blockish'),
				archive: __('Archive', 'blockish'),
				404: __('404 Page', 'blockish'),
			};
			finalName = typeLabels[newTemplateType] + ' - ' + new Date().toLocaleDateString();
		}

		if (newTemplateType === 'custom' && !finalName.trim()) {
			return;
		}

		setIsCreating(true);

		try {
			const response = await apiFetch({
				path: '/wp/v2/blockish_template',
				method: 'POST',
				data: {
					title: finalName,
					status: 'publish',
					meta: {
						template_type: newTemplateType,
						display_condition: newTemplateCondition,
					},
				},
			});

			if (response && response.id) {
				setIsCreating(false);
				setIsModalOpen(false);
				// We use a hard redirect because the Gutenberg UI is removed from the DOM,
				// so onNavigateToEntityRecord won't trigger a visual transition.
				window.location.href = `${siteUrl}post.php?post=${response.id}&action=edit`;
			}
		} catch (error) {
			console.error('Error creating template:', error);
			setIsCreating(false);
		}
	};

	const handleEditTemplate = (templateId) => {
		window.location.href = `${siteUrl}post.php?post=${templateId}&action=edit`;
	};

	const handleDeleteTemplate = async (templateId) => {
		if (!window.confirm(__('Are you sure you want to delete this template?', 'blockish'))) return;
		try {
			await apiFetch({
				path: `/wp/v2/blockish_template/${templateId}?force=true`,
				method: 'DELETE',
			});
			setTemplates(prev => prev.filter(t => t.id !== templateId));
		} catch (error) {
			console.error('Error deleting template:', error);
		}
	};

	const handleUpdateCondition = async () => {
		if (!selectedTemplate) return;
		try {
			await apiFetch({
				path: `/wp/v2/blockish_template/${selectedTemplate.id}`,
				method: 'POST',
				data: {
					meta: { display_condition: newTemplateCondition }
				}
			});
			setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? { ...t, description: newTemplateCondition } : t));
			setIsConditionModalOpen(false);
		} catch (error) {
			console.error('Error updating condition:', error);
		}
	};

	return (
		<div className="blockish-dashboard-page blockish-template-builder" style={{ width: '100%', background: '#fff', minHeight: '100vh' }}>
			{isBlockTheme && isNoticeVisible && (
				<Notice 
					status="warning" 
					isDismissible={true} 
					onRemove={() => setIsNoticeVisible(false)}
					style={{ margin: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0 }}
				>
					{__('Your active theme is a Block Theme (Full Site Editing). Using this Template Builder will override the full site templates.', 'blockish')}
				</Notice>
			)}

			<div className="blockish-sticky-header-container" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e0e0e0' }}>
				<div className="blockish-page-header" style={{ padding: '16px 32px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
						<Button 
							variant="tertiary" 
							icon={chevronLeft} 
							onClick={() => window.location.href = `${siteUrl}admin.php?page=blockish-dashboard`}
							style={{ minWidth: 'auto', padding: '4px' }}
						/>
						<Heading level={1} style={{ fontSize: '24px', fontWeight: '500', margin: 0, color: '#1e1e1e' }}>
							{__('Templates', 'blockish')}
						</Heading>
					</div>
					
					<Button variant="primary" onClick={() => setIsModalOpen(true)} style={{ padding: '6px 16px' }}>
						{__('Add Template', 'blockish')}
					</Button>
				</div>
				
				<div className="blockish-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 32px' }}>
					<div style={{ width: '320px' }}>
						<SearchControl
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder={__('Search', 'blockish')}
						/>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						<DropdownMenu
							icon={viewMode === 'list' ? list : grid}
							label={__('View', 'blockish')}
							popoverProps={{ position: 'bottom left' }}
						>
							{({ onClose }) => (
								<MenuGroup>
									<MenuItem 
										onClick={() => { setViewMode('grid'); onClose(); }}
										isSelected={viewMode === 'grid'}
										icon={viewMode === 'grid' ? check : undefined}
									>
										{__('Grid', 'blockish')}
									</MenuItem>
									<MenuItem 
										onClick={() => { setViewMode('list'); onClose(); }}
										isSelected={viewMode === 'list'}
										icon={viewMode === 'list' ? check : undefined}
									>
										{__('List', 'blockish')}
									</MenuItem>
								</MenuGroup>
							)}
						</DropdownMenu>
					</div>
				</div>
			</div>
			
			<div className="blockish-page-content" style={{ padding: '32px' }}>
				<div className={`blockish-template-${viewMode}`} style={
					viewMode === 'grid' 
					? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '48px 32px' } 
					: { display: 'flex', flexDirection: 'column' }
				}>
					{isLoading ? (
						<div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#757575' }}>
							{__('Loading templates...', 'blockish')}
						</div>
					) : filteredTemplates.length > 0 ? (
						filteredTemplates.map((template) => (
							<div key={template.id} className={`blockish-template-card ${viewMode === 'list' ? 'is-list-view' : ''}`} style={
								viewMode === 'grid'
								? { display: 'flex', flexDirection: 'column' }
								: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #e0e0e0', cursor: 'pointer' }
							}>
								{viewMode === 'grid' && (
									<div className="blockish-template-thumbnail" style={{ 
										backgroundColor: '#1e1e1e', 
										aspectRatio: '4/3', 
										borderRadius: '4px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										overflow: 'hidden',
										position: 'relative',
										cursor: 'pointer'
									}}
									onClick={() => handleEditTemplate(template.id)}
									>
										
										{/* Visual Wireframe Preview instead of BlockPreview */}
										<div style={{ width: '80%', height: '80%', display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.8 }}>
											{template.type === 'header' && (
												<div style={{ height: '30px', background: '#333', width: '100%', borderRadius: '4px' }}></div>
											)}
											{template.type === 'archive' && (
												<>
													<div style={{ height: '40px', background: '#333', width: '60%', borderRadius: '4px', margin: '10px 0' }}></div>
													<div style={{ display: 'flex', gap: '10px', height: '100px' }}>
														<div style={{ flex: 1, background: '#333', borderRadius: '4px' }}></div>
														<div style={{ flex: 1, background: '#333', borderRadius: '4px' }}></div>
														<div style={{ flex: 1, background: '#333', borderRadius: '4px' }}></div>
													</div>
												</>
											)}
											{template.type === 'single' && (
												<>
													<div style={{ height: '60px', background: '#333', width: '80%', borderRadius: '4px', margin: '20px auto' }}></div>
													<div style={{ height: '100px', background: '#333', width: '100%', borderRadius: '4px' }}></div>
													<div style={{ height: '40px', background: '#333', width: '70%', borderRadius: '4px' }}></div>
												</>
											)}
											{template.type === '404' && (
												<div style={{ margin: 'auto', textAlign: 'center', color: '#666', fontSize: '24px', fontWeight: 'bold' }}>404</div>
											)}
										</div>
									</div>
								)}
								
								<div className="blockish-template-info" style={viewMode === 'list' ? { flex: 1, paddingRight: '16px' } : { paddingTop: '16px' }} onClick={viewMode === 'list' ? () => handleEditTemplate(template.id) : undefined}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
										<Heading level={3} style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#1e1e1e' }}>
											{template.name}
										</Heading>
									</div>
									<Text style={{ fontSize: '13px', color: '#757575', display: 'block', marginBottom: '16px', lineHeight: '1.5' }}>
										{template.description || __('No specific display condition set. Serves as a fallback for the site.', 'blockish')}
									</Text>
									<div style={{ display: 'flex', justifyContent: viewMode === 'grid' ? 'space-between' : 'flex-start', alignItems: 'center', fontSize: '12px', color: '#757575' }}>
										{viewMode === 'list' ? <Icon icon={layout} size={16} style={{ marginRight: '8px' }} /> : <span>{__('Author', 'blockish')}</span>}
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
											{viewMode === 'grid' && <Icon icon={wordpress} size={16} />}
											<span style={{ fontSize: '12px', color: viewMode === 'list' ? '#757575' : '#1e1e1e' }}>
												{template.author}
											</span>
										</div>
									</div>
								</div>

								{viewMode === 'list' && (
									<div onClick={(e) => e.stopPropagation()}>
										<DropdownMenu
											icon={moreVertical}
											label={__('Options', 'blockish')}
											popoverProps={{ position: 'bottom left' }}
										>
											{({ onClose }) => (
												<MenuGroup>
													<MenuItem onClick={() => { handleEditTemplate(template.id); onClose(); }}>
														{__('Edit', 'blockish')}
													</MenuItem>
													<MenuItem onClick={() => { setSelectedTemplate(template); setNewTemplateCondition(template.description); setIsConditionModalOpen(true); onClose(); }}>
														{__('Change Condition', 'blockish')}
													</MenuItem>
													<MenuItem isDestructive onClick={() => { handleDeleteTemplate(template.id); onClose(); }}>
														{__('Delete', 'blockish')}
													</MenuItem>
												</MenuGroup>
											)}
										</DropdownMenu>
									</div>
								)}
							</div>
						))
					) : (
						<div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#f9f9f9', borderRadius: '4px', border: '1px dashed #ccc' }}>
							<Heading level={3}>{__('No templates found', 'blockish')}</Heading>
							<Text style={{ color: '#757575' }}>{__('Try adjusting your search query.', 'blockish')}</Text>
						</div>
					)}
				</div>
			</div>

			{isModalOpen && (
				<Modal
					title={__('Add New Template', 'blockish')}
					onRequestClose={() => setIsModalOpen(false)}
					style={{ width: '400px' }}
				>
					<VStack spacing={4}>
						{newTemplateType === 'custom' && (
							<TextControl
								label={__('Template Name', 'blockish')}
								placeholder={__('e.g., Custom Header', 'blockish')}
								value={newTemplateName}
								onChange={setNewTemplateName}
							/>
						)}
						<SelectControl
							label={__('Template Type', 'blockish')}
							value={newTemplateType}
							onChange={setNewTemplateType}
							options={[
								{ label: __('Header', 'blockish'), value: 'header' },
								{ label: __('Footer', 'blockish'), value: 'footer' },
								{ label: __('Single Post', 'blockish'), value: 'single' },
								{ label: __('Archive', 'blockish'), value: 'archive' },
								{ label: __('404 Page', 'blockish'), value: '404' },
								{ label: __('Custom', 'blockish'), value: 'custom' },
							]}
						/>
						<SelectControl
							label={__('Display Condition', 'blockish')}
							value={newTemplateCondition}
							onChange={setNewTemplateCondition}
							options={[
								{ label: __('Entire Site', 'blockish'), value: 'entire_site' },
								{ label: __('All Posts', 'blockish'), value: 'all_posts' },
								{ label: __('All Pages', 'blockish'), value: 'all_pages' },
								{ label: __('Specific Category', 'blockish'), value: 'category' },
							]}
						/>
						<HStack justify="flex-end" spacing={2} style={{ marginTop: '10px' }}>
							<Button variant="tertiary" onClick={() => setIsModalOpen(false)} disabled={isCreating}>
								{__('Cancel', 'blockish')}
							</Button>
							<Button variant="primary" onClick={handleCreateTemplate} isBusy={isCreating} disabled={isCreating || (newTemplateType === 'custom' && !newTemplateName.trim())}>
								{isCreating ? __('Creating...', 'blockish') : __('Create', 'blockish')}
							</Button>
						</HStack>
					</VStack>
				</Modal>
			)}

			{isConditionModalOpen && (
				<Modal
					title={__('Change Condition', 'blockish')}
					onRequestClose={() => setIsConditionModalOpen(false)}
					style={{ width: '400px' }}
				>
					<VStack spacing={4}>
						<SelectControl
							label={__('Display Condition', 'blockish')}
							value={newTemplateCondition}
							onChange={setNewTemplateCondition}
							options={[
								{ label: __('Entire Site', 'blockish'), value: 'entire_site' },
								{ label: __('All Posts', 'blockish'), value: 'all_posts' },
								{ label: __('All Pages', 'blockish'), value: 'all_pages' },
								{ label: __('Specific Category', 'blockish'), value: 'category' },
							]}
						/>
						<HStack justify="flex-end" spacing={2} style={{ marginTop: '10px' }}>
							<Button variant="tertiary" onClick={() => setIsConditionModalOpen(false)}>
								{__('Cancel', 'blockish')}
							</Button>
							<Button variant="primary" onClick={handleUpdateCondition}>
								{__('Update', 'blockish')}
							</Button>
						</HStack>
					</VStack>
				</Modal>
			)}
		</div>
	);
}
