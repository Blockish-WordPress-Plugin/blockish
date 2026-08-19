import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

const CustomCss = ({ name }) => {
    const { BlockishControl } = window?.blockish?.controls;
    const customCssExcludes = applyFilters('blockish.advancedControl.customCss.exclude', new Set([]));

    if (customCssExcludes.has(name)) return null;

    return (
        <BlockishControl type="BlockishPanelBody" title={__('Custom CSS', 'blockish')} initialOpen={false} indicatorSlugs={['customCss']} indicatorDefaults={{ customCss: '{{SELECTOR}}{}' }}>
            <BlockishControl
                type="BlockishCodeEditor"
                label={__('Custom CSS', 'blockish')}
                slug="customCss"
                help={__('Use {{SELECTOR}} to target this block wrapper.', 'blockish')}
                rows={10}
                settings={{ mode: 'css', lineWrapping: true }}
            />
        </BlockishControl>
    );
};

export default CustomCss;
