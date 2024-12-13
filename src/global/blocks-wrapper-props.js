import { createHigherOrderComponent } from '@wordpress/compose';
import { applyFilters } from '@wordpress/hooks';
import clsx from 'clsx';
import { useMemo } from '@wordpress/element';

const BlockishBlocksWrapperProps = createHigherOrderComponent(
    (BlockListBlock) => (props) => {
        const { attributes, name, clientId } = props;

        if (name?.includes('blockish/')) {
            const hash = useMemo(() => {
                return clientId?.slice(-6);
            }, [clientId]);

            const globalWrapperProps = {
                ...props.wrapperProps,
                className: clsx(
                    `bb-${hash}`,
                )
            }

            const wrapperProps = applyFilters('blockish.blockWrapper.attributes', globalWrapperProps, attributes);
            return <BlockListBlock {...props} wrapperProps={wrapperProps} />
        }
        return (
            <BlockListBlock {...props} />
        )
    },
    'BlockishBlocksWrapperProps'
);
export default BlockishBlocksWrapperProps