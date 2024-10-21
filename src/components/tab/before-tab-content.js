import { withFilters } from '@wordpress/components';
const BeforeTabContent = ({children}) => {
    return children;
}

export default withFilters('boilerplate.tabs.before-tab')(BeforeTabContent);