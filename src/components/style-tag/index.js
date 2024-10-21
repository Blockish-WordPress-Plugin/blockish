import { memo, useMemo } from '@wordpress/element';
import { getBlockType } from '@wordpress/blocks';

const BoilerplateStyleTag = ({ attributes, hash, name }) => {
    const { useDeviceList, replaceCssPlaceholders, replaceString, generateCssString, isResponsiveValue } = window.boilerplateBlocks.helpers;

    const deviceList = useDeviceList();
    const schemaAttributes = getBlockType(name)?.attributes || {}; // Fallback to empty object to avoid errors

    // Memoized styles to avoid unnecessary recalculations
    const styles = useMemo(() => {
        const cssRules = {};

        // Initialize `cssRules` for each device, including 'Desktop'
        deviceList.forEach(device => {
            cssRules[device.slug] = {};
        });
        cssRules['Desktop'] = {};

        for (const key in attributes) {
            const attributeValue = attributes[key];
            const metaAttribute = schemaAttributes[key];

            if (metaAttribute && metaAttribute['selectors']) {
                for (let selector in metaAttribute['selectors']) {
                    const css = metaAttribute['selectors'][selector];
                    selector = replaceString(selector, '{{WRAPPER}}', `bb-${hash}`);

                    // Concatenate value for 'Desktop' if not responsive or single value
                    if (typeof attributeValue !== 'object' || !isResponsiveValue(attributeValue, deviceList)) {
                        cssRules['Desktop'][selector] = (cssRules['Desktop'][selector] || '') + replaceCssPlaceholders(css, attributeValue);
                    } else {
                        // Handle responsive values for specific devices
                        for (const device of deviceList) {
                            const deviceSlug = device.slug;
                            if (attributeValue[deviceSlug]) {
                                cssRules[deviceSlug][selector] = (cssRules[deviceSlug][selector] || '') + replaceCssPlaceholders(css, attributeValue[deviceSlug]);
                            }
                        }
                    }
                }
            }
        }
        return generateCssString(cssRules, deviceList);

    }, [attributes, hash, deviceList]);

    return (
        <style>{styles}</style>
    );
};

export default memo(BoilerplateStyleTag);
