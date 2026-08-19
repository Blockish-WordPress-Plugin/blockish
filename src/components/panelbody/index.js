import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { collectIndicatorWhenSlugs, hasPanelChanges } from './has-panel-changes';

const BlockishPanelBody = ({
    title = 'Blockish Panel Body',
    children,
    indicatorSlugs,
    indicatorDefaults,
    indicatorValues,
    indicatorWhen,
    label: _label,
    value: _value,
    checked: _checked,
    onChange: _onChange,
    ...props
}) => {
    const slugs = Array.isArray(indicatorSlugs) ? indicatorSlugs : [];
    const defaults = indicatorDefaults && typeof indicatorDefaults === 'object' ? indicatorDefaults : {};
    const when = indicatorWhen && typeof indicatorWhen === 'object' ? indicatorWhen : {};
    const slugKey = slugs.join(',');
    const defaultsKey = JSON.stringify(defaults);
    const whenKey = JSON.stringify(when);
    const whenSlugsKey = collectIndicatorWhenSlugs(when).join(',');
    const useBlockAttributes = slugs.length > 0 && indicatorValues === undefined;

    const tracked = useSelect(
        (select) => {
            if (!useBlockAttributes) {
                return { attributes: null, typeDefaults: {} };
            }

            const block = select('core/block-editor').getSelectedBlock();
            const attributes = block?.attributes || {};
            const type = block?.name
                ? select('core/blocks').getBlockType(block.name)
                : null;
            const readSlugs = [...new Set([...slugs, ...collectIndicatorWhenSlugs(when)])];
            const next = {};
            const typeDefaults = {};
            readSlugs.forEach((slug) => {
                next[slug] = attributes[slug];
                if (Object.prototype.hasOwnProperty.call(defaults, slug)) {
                    return;
                }
                const typeDefault = type?.attributes?.[slug]?.default;
                if (typeDefault !== undefined) {
                    typeDefaults[slug] = typeDefault;
                }
            });
            return { attributes: next, typeDefaults };
        },
        [slugKey, whenSlugsKey, useBlockAttributes, defaultsKey]
    );

    const source = indicatorValues !== undefined ? indicatorValues : tracked?.attributes;
    const mergedDefaults = useMemo(
        () => ({ ...(tracked?.typeDefaults || {}), ...defaults }),
        [tracked?.typeDefaults, defaultsKey]
    );
    const hasChanges = useMemo(
        () => hasPanelChanges(source, slugs, mergedDefaults, when),
        [source, slugKey, mergedDefaults, whenKey]
    );

    const titleNode = (
        <span className="blockish-panel-body-title">
            <span className="blockish-panel-body-title-text">{title}</span>
            {hasChanges && (
                <span className="blockish-panel-body-dot" aria-hidden="true" />
            )}
        </span>
    );

    return (
        <PanelBody title={titleNode} initialOpen={props?.initialOpen || false} {...props}>
            <div className="blockish-panel-body-content">
                {children ? children : <p>{__('Add your content here.', 'blockish')}</p>}
            </div>
        </PanelBody>
    );
};

export default BlockishPanelBody;
