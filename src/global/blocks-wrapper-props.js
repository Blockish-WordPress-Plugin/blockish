import { createHigherOrderComponent } from '@wordpress/compose';
import { applyFilters } from '@wordpress/hooks';
import clsx from 'clsx';
import { useMemo } from '@wordpress/element';

const BoilerplateBlocksWrapperProps = createHigherOrderComponent(
    (BlockListBlock) => (props) => {
        const { attributes, name, clientId } = props;

        if (name?.includes('boilerplate-blocks/')) {
            const hash = useMemo(() => {
                return clientId?.slice(-6);
            }, [clientId]);

            const globalWrapperProps = {
                ...props.wrapperProps,
                className: clsx(
                    `bb-${hash}`,
                )
            }

            const wrapperProps = applyFilters('boilerplateBlocks.blockWrapper.attributes', globalWrapperProps, attributes);
            return <BlockListBlock {...props} wrapperProps={wrapperProps} />
        }
        return (
            <BlockListBlock {...props} />
        )
    },
    'BoilerplateBlocksWrapperProps'
);
export default BoilerplateBlocksWrapperProps