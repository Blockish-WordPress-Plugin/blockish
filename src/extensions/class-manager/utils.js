import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { useEntityRecords } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

const EMPTY_ARRAY = [];
const CLASS_POST_TYPE = 'blockish-classes';
export const fontWeightOptions = [
    { label: __('Default', 'blockish'), value: '' },
    { label: __('100', 'blockish'), value: '100' },
    { label: __('200', 'blockish'), value: '200' },
    { label: __('300', 'blockish'), value: '300' },
    { label: __('400', 'blockish'), value: '400' },
    { label: __('500', 'blockish'), value: '500' },
    { label: __('600', 'blockish'), value: '600' },
    { label: __('700', 'blockish'), value: '700' },
    { label: __('800', 'blockish'), value: '800' },
    { label: __('900', 'blockish'), value: '900' },
];

export const borderStyles = [
    { label: __('None', 'blockish'), value: 'none' },
    { label: __('Solid', 'blockish'), value: 'solid' },
    { label: __('Dotted', 'blockish'), value: 'dotted' },
    { label: __('Dashed', 'blockish'), value: 'dashed' },
    { label: __('Double', 'blockish'), value: 'double' },
    { label: __('Groove', 'blockish'), value: 'groove' },
    { label: __('Ridge', 'blockish'), value: 'ridge' },
    { label: __('Inset', 'blockish'), value: 'inset' },
    { label: __('Outset', 'blockish'), value: 'outset' },
];

export const overflowOptions = [
    { label: __('Visible', 'blockish'), value: 'visible' },
    { label: __('Hidden', 'blockish'), value: 'hidden' },
    { label: __('Scroll', 'blockish'), value: 'scroll' },
    { label: __('Auto', 'blockish'), value: 'auto' },
];

export const backgroundTypes = [
    { label: __('Color', 'blockish'), value: 'color' },
    { label: __('Gradient', 'blockish'), value: 'gradient' },
    { label: __('Image', 'blockish'), value: 'image' },
];

export const whiteSpaceOptions = [
    { label: __('Normal', 'blockish'), value: 'normal' },
    { label: __('Nowrap', 'blockish'), value: 'nowrap' },
    { label: __('Pre', 'blockish'), value: 'pre' },
    { label: __('Pre Line', 'blockish'), value: 'pre-line' },
    { label: __('Pre Wrap', 'blockish'), value: 'pre-wrap' },
    { label: __('Break Spaces', 'blockish'), value: 'break-spaces' },
];

export const displayOptions = [
    { label: __('Block', 'blockish'), value: 'block' },
    { label: __('Inline', 'blockish'), value: 'inline' },
    { label: __('Flex', 'blockish'), value: 'flex' },
    { label: __('Grid', 'blockish'), value: 'grid' },
];

export const positionOptions = [
    { label: __('Static', 'blockish'), value: 'static' },
    { label: __('Relative', 'blockish'), value: 'relative' },
    { label: __('Absolute', 'blockish'), value: 'absolute' },
    { label: __('Fixed', 'blockish'), value: 'fixed' },
    { label: __('Sticky', 'blockish'), value: 'sticky' },
];

export const floatOptions = [
    { label: __('Left', 'blockish'), value: 'left' },
    { label: __('Right', 'blockish'), value: 'right' },
];

export const clearOptions = [
    { label: __('Left', 'blockish'), value: 'left' },
    { label: __('Right', 'blockish'), value: 'right' },
    { label: __('Both', 'blockish'), value: 'both' },
];

export const verticalAlignOptions = [
    { label: __('Baseline', 'blockish'), value: 'baseline' },
    { label: __('Top', 'blockish'), value: 'top' },
    { label: __('Middle', 'blockish'), value: 'middle' },
    { label: __('Bottom', 'blockish'), value: 'bottom' },
    { label: __('Text Top', 'blockish'), value: 'text-top' },
    { label: __('Text Bottom', 'blockish'), value: 'text-bottom' },
];

export const gridLayoutTypeOptions = [
    { label: __('Auto', 'blockish'), value: 'auto' },
    { label: __('Manual', 'blockish'), value: 'manual' }
];

export function minifyCSS(css) {
    if (!css) return '';
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
        .replace(/\s+/g, ' ')             // collapse whitespace
        .replace(/\s*([{}:;,])\s*/g, '$1')// trim around tokens
        .replace(/;}/g, '}')              // optional micro-opt
        .trim();
}

export function getEntityTitle(title) {
    if (typeof title === 'string') {
        return title;
    }

    if (title && typeof title === 'object') {
        if (typeof title.rendered === 'string' && title.rendered) {
            return title.rendered;
        }

        if (typeof title.raw === 'string' && title.raw) {
            return title.raw;
        }
    }

    return '';
}

export function removeClassById(classes = [], classId) {
    return classes.filter((item) => item?.id !== classId);
}

export function addClassItem(classes = [], item) {
    if (!item?.id) {
        return classes;
    }

    if (classes.some((classItem) => classItem?.id === item.id)) {
        return classes;
    }

    return [
        ...classes,
        {
            id: item.id,
            title: getEntityTitle(item?.title),
        },
    ];
}


export const useClasses = (classes = [], searchInput = '', parent = null) => {
    const classIds = useMemo(
        () => classes.map((item) => item?.id).filter(Boolean),
        [classes]
    );

    const query = useMemo(() => ({
        per_page: -1,
        search: searchInput,
        parent: parent || 0,
        include: classIds.length ? classIds : undefined,
    }), [searchInput, parent, classIds]);

    const { records: savedClasses } = useEntityRecords('postType', CLASS_POST_TYPE, query);
    const editedClassesById = useSelect(
        (select) => {
            if (!classIds.length) {
                return {};
            }

            const store = select('core');
            return classIds.reduce((acc, id) => {
                acc[id] = store.getEditedEntityRecord('postType', CLASS_POST_TYPE, id) || null;
                return acc;
            }, {});
        },
        [classIds.join(',')]
    );

    return useMemo(() => {
        if (!classes.length) {
            return EMPTY_ARRAY;
        }

        const savedClassMap = new Map(
            (savedClasses || []).map((item) => [item?.id, item])
        );

        return classes.map((item) => {
            const classId = item?.id;
            if (!classId) {
                return null;
            }

            const editedData = editedClassesById[classId];
            const savedData = savedClassMap.get(classId);
            const classData = editedData || savedData || item;

            return {
                id: classId,
                title: getEntityTitle(classData?.title),
            };
        }).filter(Boolean);
    }, [classes, editedClassesById, savedClasses]);
}

export function isValidCssClass(className) {
    if (typeof className !== 'string') return false;

    const regex = /^[a-zA-Z_-][a-zA-Z0-9_-]*$/;
    return regex.test(className.trim());
}
