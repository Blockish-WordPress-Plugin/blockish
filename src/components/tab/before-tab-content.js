import { withFilters } from '@wordpress/components';
const BeforeTabContent = ({children}) => {
    return children;
}

export default withFilters('blockish.tabs.before-tab-content')(BeforeTabContent);