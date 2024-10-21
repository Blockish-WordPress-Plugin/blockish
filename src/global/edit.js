import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useMemo, memo } from '@wordpress/element';
import BoilerplateBlocksWrapperProps from './blocks-wrapper-props';
import Layout from './components/layout';
import * as previews from './preview';

const BoilerplateBlocksAdvancedControls = createHigherOrderComponent(
    (BlockEdit) =>
        memo((props) => {
            if (props?.name?.includes('boilerplate-blocks/')) {

                // Preview mode
                if (props?.attributes?.preview) {
                    const { blockNameCamelcase } = window?.boilerplateBlocks?.helpers;
                    const name = blockNameCamelcase(props?.name);
                    const Preview = previews[name];
                    return Preview;
                }

                const { BoilerplateStyleTag } = window?.boilerplateBlocks?.components;
                const hash = useMemo(() => {
                    return props?.clientId?.slice(-6);
                }, [props?.clientId]);

                const wrappedProps = {
                    ...props,
                    advancedControls: (
                        <>
                            <Layout {...props} />
                        </>
                    )
                };
                return (
                    <>
                        <BoilerplateStyleTag {...props} hash={hash} />
                        <BlockEdit {...props} />
                    </>
                )
            }

            return <BlockEdit {...props} />;
        }), 'BoilerplateBlocksAdvancedControls');

addFilter(
    'editor.BlockEdit',
    'boilerplate-blocks/addAdvancedControls',
    BoilerplateBlocksAdvancedControls
);

addFilter(
    'editor.BlockListBlock',
    'boilerplate-blocks/blockWrapper',
    BoilerplateBlocksWrapperProps
);