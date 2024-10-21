import { withFilters } from '@wordpress/components';
const AfterTabContent = ({ children }) => {
    return children;
}

export default withFilters('boilerplate.tabs.after-tab')(AfterTabContent)