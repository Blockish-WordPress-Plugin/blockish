import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';


const BoilerplateInteractions = createHigherOrderComponent(
    (TabContent) => (props) => {
        if(props?.blockName?.includes('boilerplate-blocks') && props?.tabName === 'advanced') {
            const { BoilerplatePanelBody } = window?.boilerplateBlocks?.components;
            return (
                <TabContent {...props}>
                    {props.children}
                    <BoilerplatePanelBody title={__('Test', 'boilerplate-blocks')} >
                        <h4>Bangdsfjsdj</h4>
                    </BoilerplatePanelBody>
                </TabContent>
            )
        }

        return (
            <TabContent {...props} />
        )
    },
    'BoilerplateInteractions'
);

addFilter(
    'boilerplate.tabs.after-tab',
    'boilerplate/interactions/controls',
    BoilerplateInteractions
);