import { withFilters } from '@wordpress/components';
const BeforeTab = ({children}) => {
    return children;
}

export default withFilters('blockish.tabs.before-tab')(BeforeTab);