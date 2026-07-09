import { __ } from '@wordpress/i18n';
import { update, closeSmall, search as searchIcon } from '@wordpress/icons';
import { Button, Icon, TextControl } from '@wordpress/components';
import { useTemplateLibrary } from '../context';

const Header = ({ onClose }) => {
	const { activeTab, setActiveTab, searchQuery, setSearchQuery, refresh } = useTemplateLibrary();

	const tabs = ['Patterns', 'Pages'];



	return (
		<div className="blockish-template-library-header">
			<div className="header-title-container">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3b82f6" />
					<path d="M2 17L12 22L22 17" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					<path d="M2 12L12 17L22 12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
				<h2>{__('Template Library', 'blockish')}</h2>
			</div>

			<div className="header-tabs">
				{tabs.map(tab => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={activeTab === tab ? 'active' : ''}
					>
						{tab}
					</button>
				))}
			</div>

			<div className="header-actions">
				<div className="search-container">
					<TextControl
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder={__('Search templates...', 'blockish')}
					/>
					<div className="search-icon">
						<Icon icon={searchIcon} size={16} />
					</div>
				</div>
				<Button icon={update} onClick={refresh} label={__('Refresh', 'blockish')} />
				<Button icon={closeSmall} onClick={onClose} label={__('Close', 'blockish')} />
			</div>
		</div>
	);
};

export default Header;
