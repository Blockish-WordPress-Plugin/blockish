import { __ } from '@wordpress/i18n';
const Flex = ({ attributes }) => {
    const { BlockishControl, BlockishResponsiveControl } = window?.blockish?.controls;
    const { useDeviceType, getResponsiveValue } = window?.blockish?.helpers;
    const device = useDeviceType();
    return (
        <BlockishControl type='BlockishPanelBody' title={__('Flex', 'blockish')}>
            <BlockishResponsiveControl
                type='BlockishToggleGroup'
                label={__('Align Self', 'blockish')}
                slug='alignSelf'
                left="64px"
                options={[
                    { value: 'flex-start', label: __('Start', 'blockish') },
                    { value: 'center', label: __('Center', 'blockish') },
                    { value: 'flex-end', label: __('End', 'blockish') },
                    { value: 'stretch', label: __('Stretch', 'blockish') },
                ]}
                help={__('This control will affect contained elements only.', 'blockish')}
            />
            <BlockishResponsiveControl
                type='BlockishToggleGroup'
                label={__('Order', 'blockish')}
                slug='flexOrder'
                left="40px"
                options={[
                    { value: '-99999', label: __('Start', 'blockish') },
                    { value: '99999', label: __('End', 'blockish') },
                    { value: 'custom', label: __('Custom', 'blockish') },
                ]}
                help={__('This control will affect contained elements only.', 'blockish')}
            />
            {
                getResponsiveValue(attributes, 'flexOrder', device) === 'custom' && (
                    <BlockishResponsiveControl
                        type='BlockishNumber'
                        label={__('Custom Order', 'blockish')}
                        slug='flexCustomOrder'
                        left="89px"
                        min="-99999"
                        max="99999"
                        help={__('This control will affect contained elements only.', 'blockish')}
                    />
                )
            }
            <BlockishResponsiveControl
                type='BlockishNumber'
                label={__('Grow', 'blockish')}
                slug='flexGrow'
                left="36px"
                min="0"
                max="99"
                help={__('This control will affect contained elements only.', 'blockish')}
            />
            <BlockishResponsiveControl
                type='BlockishNumber'
                label={__('Shrink', 'blockish')}
                slug='flexShrink'
                left="42px"
                min="0"
                max="99"
                help={__('This control will affect contained elements only.', 'blockish')}
            />
        </BlockishControl>
    )
}
export default Flex;