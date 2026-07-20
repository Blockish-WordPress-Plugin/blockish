import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

addFilter('blockish.advancedControl.width.exclude', 'blockish/container/exclude-width', (list, props) => {
    if (props?.name === 'blockish/container') {
        const parents = select(blockEditorStore).getBlockParentsByBlockName(props.clientId, 'blockish/container');
        const hasParent = parents.length > 0;
        if (!hasParent) {
            list.add('blockish/container');
        }
    }
    return list;
});

addFilter('blockish.advancedControl.width.maxWidth.exclude', 'blockish/container/exclude-max-width', (list, props) => {
    if (props?.name === 'blockish/container') {
        const parents = select(blockEditorStore).getBlockParentsByBlockName(props.clientId, 'blockish/container');
        const hasParent = parents.length > 0;
        if (hasParent) {
            list.add('blockish/container');
        }
    }
    return list;
});

addFilter('blockish.advancedControl.background.exclude', 'blockish/container/exclude-background', (list) => {
    return list.add('blockish/container');
});

addFilter('blockish.advancedControl.border.exclude', 'blockish/container/exclude-border', (list) => {
    return list.add('blockish/container');
});
