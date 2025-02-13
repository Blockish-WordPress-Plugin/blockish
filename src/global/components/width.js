import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
const Width = ({ name, attributes }) => {
    const { BlockishControl, BlockishResponsiveControl  } = window?.blockish?.controls;
    const { useDeviceType } = window?.blockish?.helpers;
    const device = useDeviceType();
    const widthExcludes = applyFilters('blockish.advancedControl.width.exclude', new Set([]));
    const minWidthExcludes = applyFilters('blockish.advancedControl.width.minWidth.exclude', new Set([]));
    const maxWidthExcludes = applyFilters('blockish.advancedControl.width.maxWidth.exclude', new Set([]));
    const customWidthExcludes = applyFilters('blockish.advancedControl.width.customWidth.exclude', new Set([]));

    if (widthExcludes.has(name)) return null;
    
    return (
        <BlockishControl type='BlockishPanelBody' title={__('Width', 'blockish')} initialOpen={false}>
            {
                !minWidthExcludes.has(name) && (
                    <BlockishResponsiveControl
                        type='BlockishRangeUnit'
                        label={__('Minimum Width', 'blockish')}
                        slug='minWidth'
                        left="95px"
                    />
                )
            }

            {
                !maxWidthExcludes.has(name) && (
                    <BlockishResponsiveControl
                        type='BlockishRangeUnit'
                        label={__('Maximum Width', 'blockish')}
                        slug='maxWidth'
                        left="99px"
                    />
                )
            }

            {
                !customWidthExcludes.has(name) && (
                    <>
                        <BlockishResponsiveControl
                            type='BlockishSelect'
                            label={__('Width', 'blockish')}
                            slug='widthType'
                            left="40px"
                            options={[
                                { value: 'auto', label: __('Auto', 'blockish') },
                                { value: '100%', label: __('Full', 'blockish') },
                                { value: 'custom', label: __('Custom', 'blockish') },
                            ]}
                        />
                        {
                            attributes?.widthType?.[device]?.value === 'custom' && (
                                <BlockishResponsiveControl
                                    type='BlockishRangeUnit'
                                    label={__('Custom Width', 'blockish')}
                                    slug='customWidth'
                                    left="95px"
                                />
                            )
                        }
                    </>
                )
            }
        </BlockishControl>
    );
}
export default Width;