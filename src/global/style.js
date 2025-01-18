import { addFilter } from '@wordpress/hooks';

addFilter('blockish.modifyCssRules', 'blockish/modifyCssRules', (rules) => {
    console.log(rules);
    
    return rules;
});
