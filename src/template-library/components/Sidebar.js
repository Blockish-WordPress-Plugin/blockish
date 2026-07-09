import { __ } from '@wordpress/i18n';
import { useTemplateLibrary } from '../context';

const formatSlugToTitle = (slug) => {
	if (!slug) return '';
	return slug
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

const SidebarItem = ({ label, count, isSelected, onClick }) => (
	<button
		onClick={onClick}
		className={`sidebar-item ${isSelected ? 'active' : ''}`}
	>
		<span>{label}</span>
		{count !== undefined && (
			<span className="count">{count}</span>
		)}
	</button>
);

const PackageItem = ({ label, isSelected, onClick }) => (
	<button
		onClick={onClick}
		className={`sidebar-package-item ${isSelected ? 'active' : ''}`}
	>
		{label}
	</button>
);

const SidebarPatterns = () => {
	const { 
		tags, packages, 
		selectedTag, setSelectedTag, 
		selectedPackage, setSelectedPackage 
	} = useTemplateLibrary();

	const patternTags = tags.filter(tag => tag.taxonomy === 'blockish_pattern_tag');

	return (
		<>
			{packages.length > 0 && (
				<div className="sidebar-section">
					<div className="sidebar-package-list">
						{packages.map(pkg => (
							<PackageItem 
								key={pkg.package_name}
								label={formatSlugToTitle(pkg.package_name)} 
								isSelected={selectedPackage === pkg.package_name} 
								onClick={() => setSelectedPackage(selectedPackage === pkg.package_name ? 'All' : pkg.package_name)} 
							/>
						))}
					</div>
				</div>
			)}

			<div className="sidebar-section">
				<h3>{__('Tags', 'blockish')}</h3>
				<div className="sidebar-list">
					<SidebarItem 
						label={__('All', 'blockish')} 
						isSelected={selectedTag === 'All' || !selectedTag} 
						onClick={() => setSelectedTag('All')} 
					/>
					{patternTags.map(tag => (
						<SidebarItem 
							key={tag.id}
							label={tag.name} 
							count={tag.count} 
							isSelected={selectedTag === tag.slug} 
							onClick={() => setSelectedTag(tag.slug)} 
						/>
					))}
				</div>
			</div>
		</>
	);
};

const SidebarPages = () => {
	const { 
		tags, categories,
		selectedTag, setSelectedTag, 
		selectedCategory, setSelectedCategory
	} = useTemplateLibrary();

	const pageTags = tags.filter(tag => tag.taxonomy === 'blockish_page_tag');

	return (
		<>
			<div className="sidebar-section">
				<h3>{__('Tags', 'blockish')}</h3>
				<div className="sidebar-package-list">
					{pageTags.map(tag => (
						<PackageItem 
							key={tag.id}
							label={tag.name} 
							isSelected={selectedTag === tag.slug} 
							onClick={() => setSelectedTag(selectedTag === tag.slug ? 'All' : tag.slug)} 
						/>
					))}
				</div>
			</div>

			<div className="sidebar-section">
				<h3>{__('Categories', 'blockish')}</h3>
				<div className="sidebar-list">
					<SidebarItem 
						label={__('All', 'blockish')} 
						isSelected={selectedCategory === 'All' || !selectedCategory} 
						onClick={() => setSelectedCategory('All')} 
					/>
					{categories.map(cat => (
						<SidebarItem 
							key={cat.id}
							label={cat.name} 
							count={cat.count} 
							isSelected={selectedCategory === cat.slug} 
							onClick={() => setSelectedCategory(cat.slug)} 
						/>
					))}
				</div>
			</div>
		</>
	);
};

const Sidebar = () => {
	const { activeTab } = useTemplateLibrary();

	return (
		<div className="blockish-template-library-sidebar">
			{activeTab === 'Patterns' ? <SidebarPatterns /> : <SidebarPages />}
		</div>
	);
};

export default Sidebar;
