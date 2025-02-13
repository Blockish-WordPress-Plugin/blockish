import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useMemo, memo } from '@wordpress/element';
import BlockishBlocksWrapperProps from './blocks-wrapper-props';
import Layout from './components/layout';
import Width from './components/width';
import * as previews from './preview';
import Position from './components/position';

const BlockishBlocksAdvancedControls = createHigherOrderComponent(
    (BlockEdit) =>
        memo((props) => {
            if (props?.name?.includes('blockish/')) {

                // Preview mode
                if (props?.attributes?.preview) {
                    const { blockNameCamelcase } = window?.blockish?.helpers;
                    const name = blockNameCamelcase(props?.name);
                    const Preview = previews[name];
                    return Preview;
                }
                const { BlockishStyleTag } = window?.blockish?.components;
                const hash = useMemo(() => {
                    return props?.clientId?.slice(-6);
                }, [props?.clientId]);

                const wrappedProps = {
                    ...props,
                    advancedControls: (
                        <>
                            <Layout {...props} />
                            <Width {...props} />
                            <Position {...props} />
                        </>
                    )
                };
                return (
                    <>
                        <BlockishStyleTag {...props} hash={hash} />
                        <BlockEdit {...wrappedProps} />
                    </>
                )
            }

            return <BlockEdit {...props} />;
        }), 'BlockishBlocksAdvancedControls');

addFilter(
    'editor.BlockEdit',
    'blockish/addAdvancedControls',
    BlockishBlocksAdvancedControls
);

addFilter(
    'editor.BlockListBlock',
    'blockish/blockWrapper',
    BlockishBlocksWrapperProps
);