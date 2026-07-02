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

    const editedClassIds = useSelect((select) => {
        const { hasEditsForEntityRecord } = select('core');
        return classStyles
            .map((item) => item?.id)
            .filter((id) => id && hasEditsForEntityRecord('postType', POST_TYPE, id));
    }, [classStyles]);

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

    const updateStyles = async (nextCssByClassId, idsToUpdate = []) => {
        const idsSet = new Set(idsToUpdate);
        for (let item of classStyles) {
            if (!item?.id) continue;
            if (!idsSet.has(item.id)) continue;
            const css = nextCssByClassId?.[item.id] || '';
            await editEntityRecord('postType', POST_TYPE, item?.id, {
                meta: {
                    [META_KEY]: css
                }
            });
        }
    };

    const classStylesRef = useRef({});
    const hasClassStylesInitialized = useRef(false);
    const styleLength = editorSettings?.styles?.length || 0;

    useEffect(() => {
        if(!editorSettings?.styles) return;

        const stylesArray = editorSettings?.styles || [];
        const styleIndex = stylesArray.findIndex((style) => style?.__unstableType === 'blockish-classes-styles');

        if (!generateStyles) return;

        if (styleIndex === -1) {
            
            updateEditorSettings({
                ...editorSettings,
                styles: [
                    ...stylesArray,
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
                styles: stylesArray.map((style, index) => {
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

        // Skip initial update to avoid marking entities as dirty on page load.
        if (!hasClassStylesInitialized.current) {
            classStylesRef.current = cssByClassId;
            hasClassStylesInitialized.current = true;
            return;
        }

        if (nextMap !== prevMap && editedClassIds.length > 0) {
            updateStyles(cssByClassId, editedClassIds);
            classStylesRef.current = cssByClassId;
        }

    }, [generateStyles, cssByClassId, classStyles, editedClassIds, styleLength]);

    return <></>;
};

registerPlugin('blockish-class-manager', {
    render: RenderClassManagerStyles,
});
