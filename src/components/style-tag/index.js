import { memo, useMemo } from '@wordpress/element';
import { getBlockType } from '@wordpress/blocks';

const BlockishStyleTag = ({ attributes, hash, name, additionalStyles = '' }) => {
    const { useDeviceList, replaceCssPlaceholders, replaceString, generateCssString, isResponsiveValue, generateBackgroundControlStyles, generateBorderControlStyles, generateBoxShadowControlStyles, generateTypographyControlStyles } = window.blockish.helpers;

    const deviceList = useDeviceList();
    const schemaAttributes = getBlockType(name)?.attributes || {};

    const styles = useMemo(() => {
        const cssRules = Object.fromEntries(deviceList.map(device => [device.slug, {}]));

        for (const metaKey in schemaAttributes) {
            const metaAttribute = schemaAttributes[metaKey];
            
            if ((!metaAttribute?.selectors && !metaAttribute?.groupSelector) || !attributes[metaKey]) continue;

            const attributeValue = attributes[metaKey];
            const applyCss = (deviceSlug, value) => {
                for (const selectorKey in metaAttribute.selectors) {
                    const selector = replaceString(selectorKey, '{{WRAPPER}}', `bb-${hash}`);
                    cssRules[deviceSlug][selector] = (cssRules[deviceSlug][selector] || '') + replaceCssPlaceholders(metaAttribute.selectors[selectorKey], value);
                }

                if (metaAttribute?.groupSelector && metaAttribute?.groupSelector?.type) {
                    const type = metaAttribute?.groupSelector?.type;
                    const selector = replaceString(metaAttribute?.groupSelector?.selector, '{{WRAPPER}}', `bb-${hash}`);
                    switch (type) {
                        case 'BlockishBackground':
                            let styles = generateBackgroundControlStyles(value, deviceSlug);
                            cssRules[deviceSlug][selector] = (cssRules[deviceSlug][selector] || '') + styles;
                            break;
                        case 'BlockishBorder':
                            let borderStyles = generateBorderControlStyles(value, deviceSlug);
                            cssRules[deviceSlug][selector] = (cssRules[deviceSlug][selector] || '') + borderStyles;
                            break;
                        case 'BlockishBoxShadow':
                            let boxShadowStyles = generateBoxShadowControlStyles(value, deviceSlug);
                            cssRules[deviceSlug][selector] = (cssRules[deviceSlug][selector] || '') + boxShadowStyles;
                            break;
                        case 'BlockishTypography':
                            let typographyStyles = generateTypographyControlStyles(value, deviceSlug);
                            cssRules[deviceSlug][selector] = (cssRules[deviceSlug][selector] || '') + typographyStyles;
                        case 'BlockishTextShadow':
                            let textShadowStyles = generateBoxShadowControlStyles(value, deviceSlug, 'text');
                            cssRules[deviceSlug][selector] = (cssRules[deviceSlug][selector] || '') + textShadowStyles;
                            break;
                            
                    }
                }
            };

            if (metaAttribute.condition?.rules?.length) {
                for (const device of deviceList) {
                    const deviceSlug = device.slug;
                    const processedValue = processAttributeValue(isResponsiveValue(attributeValue, deviceList) ? attributeValue[deviceSlug] : attributeValue);

                    if (!processedValue) continue;

                    const relation = metaAttribute.condition.relation || "AND";
                    let allConditionsMet = relation === "AND";

                    for (const rule of metaAttribute.condition.rules) {
                        const conditionValue = attributes[rule.key];
                        const processedConditionValue = processAttributeValue(isResponsiveValue(conditionValue, deviceList) ? conditionValue[deviceSlug] : conditionValue);

                        let conditionMet = false;
                        switch (rule.condition) {
                            case '==':
                                conditionMet = processedConditionValue == rule.value;
                                break;
                            case '!=':
                                conditionMet = processedConditionValue != rule.value;
                                break;
                            case 'empty': 
                                conditionMet = !processedConditionValue;
                                break;
                            case 'not_empty': 
                                conditionMet = !!processedConditionValue;
                                break;
                        }

                        if (relation === "AND" && !conditionMet) {
                            allConditionsMet = false;
                            break;
                        } else if (relation === "OR" && conditionMet) {
                            allConditionsMet = true;
                            break;
                        }
                    }

                    if (allConditionsMet) {
                        applyCss(deviceSlug, processedValue);
                    }
                }
            } else {
                if ((typeof attributeValue !== 'object' || !isResponsiveValue(attributeValue, deviceList)) && !metaAttribute?.groupSelector) {
                    applyCss('Desktop', attributeValue);
                } else if (metaAttribute?.groupSelector) {
                    for (const device of deviceList) {
                        if (attributeValue) applyCss(device?.slug, attributeValue);
                    }
                }else {
                    for (const device of deviceList) {
                        if (attributeValue[device.slug]) applyCss(device.slug, attributeValue[device.slug]);
                    }
                }
            }
        }

        return generateCssString(cssRules, deviceList);
    }, [attributes, hash, deviceList]);

    return <style>{styles + additionalStyles}</style>;
};

const processAttributeValue = (attr) => (typeof attr === 'object' && attr?.value) ? attr.value : attr ?? '';

export default memo(BlockishStyleTag);
