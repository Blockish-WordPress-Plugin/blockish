import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';


const BlockishInteractions = createHigherOrderComponent(
    (TabContent) => (props) => {
        if(props?.blockName?.includes('blockish') && props?.tabName === 'advanced') {
            const { BlockishPanelBody } = window?.blockish?.components;
            return (
                <TabContent {...props}>
                    {props.children}
                    <BlockishPanelBody title={__('Test', 'blockish')} >
                        <h4>Bangdsfjsdj</h4>
                    </BlockishPanelBody>
                </TabContent>
            )
        }

        return (
            <TabContent {...props} />
        )
    },
    'BlockishInteractions'
);

addFilter(
    'blockish.tabs.after-tab',
    'blockish/interactions/controls',
    BlockishInteractions
);