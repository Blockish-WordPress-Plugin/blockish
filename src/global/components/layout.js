import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
const Layout = ({ name }) => {
    const { BlockishControl, BlockishResponsiveControl  } = window?.blockish?.controls;
    const layoutMarginExcludes = applyFilters('blockish.advancedControl.layout.margin.exclude', new Set([]));
    const layoutPaddingExcludes = applyFilters('blockish.advancedControl.layout.padding.exclude', new Set([]));
    return (
        <BlockishControl type='BlockishPanelBody' title={__('Layout', 'blockish')}>
            {
                !layoutPaddingExcludes.has(name) && (
                    <BlockishResponsiveControl
                        type='BlockishSpacingSizes'
                        label={__('Padding', 'blockish')}
                        slug='padding'
                    />
                )
            }
            {
                !layoutMarginExcludes.has(name) && (
                    <BlockishResponsiveControl
                        type='BlockishSpacingSizes'
                        label={__('Margin', 'blockish')}
                        slug='margin'
                    />
                )
            }
        </BlockishControl>
    );
}
export default Layout;