import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
const Layout = ({ name }) => {
    const { BoilerplateControl } = window?.boilerplateBlocks?.controls;
    const layoutMarginExcludes = applyFilters('boilerplateBlocks.advancedControl.layout.margin.exclude', new Set([]));
    const layoutPaddingExcludes = applyFilters('boilerplateBlocks.advancedControl.layout.padding.exclude', new Set([]));
    return (
        <BoilerplateControl type='BoilerplatePanelBody' title={__('Layout', 'boilerplate-blocks')}>
            {
                !layoutPaddingExcludes.has(name) && (
                    <BoilerplateControl
                        type='BoilerplateSpacingSizes'
                        label={__('Padding', 'boilerplate-blocks')}
                        slug='padding'
                        isResponsive={true}
                        selectors = {{
                            '.{{WRAPPER}}': 'padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};'
                        }}
                    />
                )
            }
            {
                !layoutMarginExcludes.has(name) && (
                    <BoilerplateControl
                        type='BoilerplateSpacingSizes'
                        label={__('Margin', 'boilerplate-blocks')}
                        slug='margin'
                        isResponsive={true}
                        selectors = {{
                            '.{{WRAPPER}}': 'margin: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};'
                        }}
                    />
                )
            }
        </BoilerplateControl>
    );
}
export default Layout;