import { registerPlugin } from '@wordpress/plugins';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef, useMemo } from '@wordpress/element';
import generateClassManagerStyles from './style';
const POST_TYPE = 'blockish-classes';
const META_KEY = 'blockishClassManagerStyles';


const RenderClassManagerStyles = () => {
    const { updateEditorSettings } = useDispatch('core/editor');
    const { editEntityRecord } = useDispatch('core');
    const { useDeviceList } = window.blockish.helpers;
    const breakpoints = useDeviceList();

    const editorSettings = useSelect((select) => {
        const { getEditorSettings } = select('core/editor');
        return getEditorSettings();
    }, []);

    const classStylesCacheRef = useRef({ key: '[]', value: [] });
    const classStyles = useSelect((select) => {
        const { getEntityRecords, getEditedEntityRecord } = select('core');
        const classes = getEntityRecords('postType', POST_TYPE, { per_page: -1 }) || [];
        let nextValue = [];

        if (classes.length > 0) {
            const editedClasses = classes.map((item) => getEditedEntityRecord('postType', POST_TYPE, item?.id));
            nextValue = editedClasses.map((item) => {
                const parent = getEditedEntityRecord('postType', POST_TYPE, item?.parent);
                return {
                    id: item?.id,
                    title: item?.title,
                    style: item?.content,
                    parent: parent?.title,
                };
            }).filter((item) => item?.id);
        }

        const nextKey = JSON.stringify(nextValue);
        if (classStylesCacheRef.current.key === nextKey) {
            return classStylesCacheRef.current.value;
        }

        classStylesCacheRef.current = {
            key: nextKey,
            value: nextValue,
        };
        return nextValue;
    }, []);

    const cssByClassId = useMemo(() => {
        const byId = {};
        classStyles.forEach((item) => {
            let css = '';

            breakpoints.forEach((device) => {
                const value = device?.value;
                const slug = device?.slug || 'Desktop';
                const deviceCss = generateClassManagerStyles([item], slug)?.[slug] || '';
                if (!deviceCss) return;

                if (value === 'base') {
                    css += deviceCss;
                } else {
                    css += `@media (max-width: ${value}) { ${deviceCss} }`;
                }
            });

            byId[item.id] = css;
        });

        return byId;
    }, [breakpoints, classStyles]);

    const generateStyles = useMemo(() => {
        let styles = '';
        Object.values(cssByClassId).forEach((css) => {
            styles += css || '';
        });

        return styles;
    }, [cssByClassId]);

    const updateStyles = async (nextCssByClassId) => {
        for (let item of classStyles) {
            if (!item?.id) continue;
            const css = nextCssByClassId?.[item.id] || '';
            await editEntityRecord('postType', POST_TYPE, item?.id, {
                meta: {
                    [META_KEY]: css
                }
            });
        }
    };

    const classStylesRef = useRef({});
    useEffect(() => {
        const styleIndex = editorSettings?.styles?.findIndex((style) => style?.__unstableType === 'blockish-classes-styles');
        if (styleIndex === -1) {
            updateEditorSettings({
                ...editorSettings,
                styles: [
                    ...editorSettings?.styles,
                    {
                        isGlobalStyles: true,
                        __unstableType: 'blockish-classes-styles',
                        css: generateStyles || ''
                    }
                ]
            })
        } else {
            updateEditorSettings({
                ...editorSettings,
                styles: editorSettings?.styles?.map((style, index) => {
                    if (index === styleIndex) {
                        return {
                            ...style,
                            css: generateStyles || ''
                        }
                    }
                    return style;
                })
            })
        }

        const nextMap = JSON.stringify(cssByClassId);
        const prevMap = JSON.stringify(classStylesRef.current);
        if (nextMap !== prevMap) {
            updateStyles(cssByClassId);
            classStylesRef.current = cssByClassId;
        }

    }, [generateStyles, cssByClassId, classStyles]);

    return <></>;
};

registerPlugin('blockish-class-manager', {
    render: RenderClassManagerStyles,
});
