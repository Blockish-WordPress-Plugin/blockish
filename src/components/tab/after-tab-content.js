import { withFilters } from '@wordpress/components';
const AfterTabContent = ({ children }) => {
    return children;
}

export default withFilters('blockish.tabs.after-tab-content')(AfterTabContent)