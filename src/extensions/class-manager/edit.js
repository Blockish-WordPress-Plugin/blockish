import { registerPlugin } from '@wordpress/plugins';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useMemo, useRef } from '@wordpress/element';
import generateClassManagerStyles from './style';
import { generateClassManagerItemStyle, getEntityTitle } from './utils';

const CLASS_POST_TYPE = 'blockish-classes';
const STYLE_TYPE = 'blockish-class-manager';
const CSS_META_KEY = 'blockishClassManagerStyles';

const normalizeEntity = (entity) => {
    if (!entity) {
        return null;
    }

    return {
        ...entity,
        title: getEntityTitle(entity?.title),
        content:
            typeof entity?.content === 'string'
                ? entity.content
                : (entity?.content?.raw || entity?.content?.rendered || ''),
    };
};

const RenderClassManagerStyles = () => {
    const editorSettings = useSelect((select) => select('core/editor').getEditorSettings(), []);
    const classRecords = useSelect(
        (select) => select('core').getEntityRecords('postType', CLASS_POST_TYPE, { per_page: -1 }) || [],
        []
    );

    const classStyles = useSelect(
        (select) => {
            const core = select('core');

            return (classRecords || [])
                .map((savedClass) => {
                    const edited = core.getEditedEntityRecord('postType', CLASS_POST_TYPE, savedClass?.id);
                    const item = normalizeEntity(edited || savedClass);

                    if (!item?.id) {
                        return null;
                    }

                    const parentId = item?.parent || savedClass?.parent;
                    const parentSaved = parentId ? core.getEntityRecord('postType', CLASS_POST_TYPE, parentId) : null;
                    const parentEdited = parentId
                        ? core.getEditedEntityRecord('postType', CLASS_POST_TYPE, parentId)
                        : null;
                    const parent = normalizeEntity(parentEdited || parentSaved);

                    return {
                        id: item.id,
                        style: generateClassManagerItemStyle({
                            item,
                            parent,
                            generateStyles: generateClassManagerStyles,
                        }) || '',
                    };
                })
                .filter((item) => item?.id);
        },
        [classRecords]
    );

    const { updateEditorSettings } = useDispatch('core/editor');
    const { editEntityRecord } = useDispatch('core');

    const styleMap = useMemo(() => {
        return classStyles.reduce((acc, item) => {
            acc[item.id] = item.style || '';
            return acc;
        }, {});
    }, [classStyles]);

    const css = useMemo(
        () => classStyles.map((item) => item.style).filter(Boolean).join(''),
        [classStyles]
    );
    const cssRef = useRef('');
    const styleMapRef = useRef({});

    useEffect(() => {
        const previousStyleMap = styleMapRef.current;
        Object.entries(styleMap).forEach(([id, style]) => {
            if (previousStyleMap[id] === style) {
                return;
            }

            editEntityRecord('postType', CLASS_POST_TYPE, Number(id), {
                meta: {
                    [CSS_META_KEY]: style,
                },
            });
        });

        styleMapRef.current = styleMap;

        if (!editorSettings?.styles || cssRef.current === css) {
            return;
        }

        const styleIndex = editorSettings.styles.findIndex((style) => style?.__unstableType === STYLE_TYPE);

        if (styleIndex === -1) {
            updateEditorSettings({
                ...editorSettings,
                styles: [
                    ...editorSettings.styles,
                    {
                        isGlobalStyles: true,
                        __unstableType: STYLE_TYPE,
                        css,
                    },
                ],
            });
        } else {
            updateEditorSettings({
                ...editorSettings,
                styles: editorSettings.styles.map((style, index) => {
                    if (index !== styleIndex) {
                        return style;
                    }

                    return {
                        ...style,
                        css,
                    };
                }),
            });
        }

        cssRef.current = css;
    }, [styleMap, css, editorSettings, editEntityRecord, updateEditorSettings]);

    return null;
};

registerPlugin('blockish-class-manager', {
    render: RenderClassManagerStyles,
});
