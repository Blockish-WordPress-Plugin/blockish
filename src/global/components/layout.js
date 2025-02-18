import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
const Layout = ({ name }) => {
    const { BlockishControl, BlockishResponsiveControl } = window?.blockish?.controls;
    const layoutExcludes = applyFilters('blockish.advancedControl.layout.exclude', new Set([]));
    const layoutMarginExcludes = applyFilters('blockish.advancedControl.layout.margin.exclude', new Set([]));
    const layoutPaddingExcludes = applyFilters('blockish.advancedControl.layout.padding.exclude', new Set([]));

    if (layoutExcludes.has(name)) return null;
    
    return (
        <BlockishControl type='BlockishPanelBody' title={__('Layout', 'blockish')}>
            {
                !layoutMarginExcludes.has(name) && (
                    <BlockishResponsiveControl
                        type='BlockishSpacingSizes'
                        label={__('Margin', 'blockish')}
                        slug='margin'
                        left="46px"
                    />
                )
            }

            {
                !layoutPaddingExcludes.has(name) && (
                    <BlockishResponsiveControl
                        type='BlockishSpacingSizes'
                        label={__('Padding', 'blockish')}
                        slug='padding'
                        left="52px"
                    />
                )
            }
        </BlockishControl>
    );
}
export default Layout;