import domReady from '@wordpress/dom-ready';
import { setCategories, getCategories, updateCategory } from '@wordpress/blocks';

domReady(() => {
    setCategories([
        {
            slug: 'blockish',
            title: 'Blockish',
        },
        ...getCategories(),
    ]);
});