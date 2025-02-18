import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
const Position = ({ name, attributes }) => {
    const { BlockishControl, BlockishResponsiveControl } = window?.blockish?.controls;
    const positionExcludes = applyFilters('blockish.advancedControl.position.exclude', new Set([]));
    const layoutZIndexExcludes = applyFilters('blockish.advancedControl.layout.zIndex.exclude', new Set([]));

    if (positionExcludes.has(name)) return null;
    return (
        <BlockishControl type='BlockishPanelBody' title={__('Position', 'blockish')}>
            <BlockishControl
                type='BlockishSelect'
                label={__('Position', 'blockish')}
                slug='position'
                options={[
                    { value: 'relative', label: __('Relative', 'blockish') },
                    { value: 'absolute', label: __('Absolute', 'blockish') },
                    { value: 'fixed', label: __('Fixed', 'blockish') },
                    { value: 'sticky', label: __('Sticky', 'blockish') },
                ]}
            />

            {
                attributes?.position?.value && (
                    <>
                        <BlockishResponsiveControl
                            type='BlockishRangeUnit'
                            label={__('Top', 'blockish')}
                            slug='positionTop'
                            left="25px"
                            splitOnAxis={true}
                            min="-2000"
                            max="2000"
                            step="1"
                        />
                        <BlockishResponsiveControl
                            type='BlockishRangeUnit'
                            label={__('Left', 'blockish')}
                            slug='positionLeft'
                            left="28px"
                            splitOnAxis={true}
                            min="-2000"
                            max="2000"
                            step="1"
                        />
                        <BlockishResponsiveControl
                            type='BlockishRangeUnit'
                            label={__('Right', 'blockish')}
                            slug='positionRight'
                            left="35px"
                            splitOnAxis={true}
                            min="-2000"
                            max="2000"
                            step="1"
                        />
                        <BlockishResponsiveControl
                            type='BlockishRangeUnit'
                            label={__('Bottom', 'blockish')}
                            slug='positionBottom'
                            left="48px"
                            splitOnAxis={true}
                            min="-2000"
                            max="2000"
                            step="1"
                        />
                    </>
                )
            }

            {
                !layoutZIndexExcludes.has(name) && (
                    <BlockishResponsiveControl
                        type='BlockishRangeControl'
                        label={__('Z-Index', 'blockish')}
                        slug='zIndex'
                        left="48px"
                        min="-999"
                        max="999"
                        step="1"
                    />
                )
            }
        </BlockishControl>
    );
}
export default Position;