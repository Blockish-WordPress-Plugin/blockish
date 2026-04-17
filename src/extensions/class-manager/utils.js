import { useMemo } from '@wordpress/element';
import { useEntityRecords } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

const EMPTY_ARRAY = [];
const CLASS_POST_TYPE = 'blockish-classes';

export const DISPLAY_OPTIONS = [
    { label: 'Block', value: 'block' },
    { label: 'Inline Block', value: 'inline-block' },
    { label: 'Flex', value: 'flex' },
    { label: 'Inline Flex', value: 'inline-flex' },
    { label: 'Grid', value: 'grid' },
    { label: 'Inline Grid', value: 'inline-grid' },
    { label: 'None', value: 'none' },
];

export const FLEX_DIRECTION_OPTIONS = [
    { label: 'Row', value: 'row' },
    { label: 'Column', value: 'column' },
    { label: 'Row Reverse', value: 'row-reverse' },
    { label: 'Column Reverse', value: 'column-reverse' },
];

export const FLEX_WRAP_OPTIONS = [
    { label: 'No Wrap', value: 'nowrap' },
    { label: 'Wrap', value: 'wrap' },
    { label: 'Wrap Reverse', value: 'wrap-reverse' },
];

export const JUSTIFY_CONTENT_OPTIONS = [
    { label: 'Start', value: 'flex-start' },
    { label: 'End', value: 'flex-end' },
    { label: 'Center', value: 'center' },
    { label: 'Space Between', value: 'space-between' },
    { label: 'Space Around', value: 'space-around' },
    { label: 'Space Evenly', value: 'space-evenly' },
];

export const ALIGN_ITEMS_OPTIONS = [
    { label: 'Start', value: 'flex-start' },
    { label: 'End', value: 'flex-end' },
    { label: 'Center', value: 'center' },
    { label: 'Stretch', value: 'stretch' },
    { label: 'Baseline', value: 'baseline' },
];

export const GRID_LAYOUT_OPTIONS = [
    { label: 'Auto', value: 'auto' },
    { label: 'Fixed', value: 'fixed' },
];

export const POSITION_OPTIONS = [
    { label: 'Static', value: 'static' },
    { label: 'Relative', value: 'relative' },
    { label: 'Absolute', value: 'absolute' },
    { label: 'Fixed', value: 'fixed' },
    { label: 'Sticky', value: 'sticky' },
];

export const OVERFLOW_OPTIONS = [
    { label: 'Visible', value: 'visible' },
    { label: 'Hidden', value: 'hidden' },
    { label: 'Auto', value: 'auto' },
    { label: 'Scroll', value: 'scroll' },
];

export const OBJECT_FIT_OPTIONS = [
    { label: 'Fill', value: 'fill' },
    { label: 'Contain', value: 'contain' },
    { label: 'Cover', value: 'cover' },
    { label: 'None', value: 'none' },
    { label: 'Scale Down', value: 'scale-down' },
];

export const ASPECT_RATIO_OPTIONS = [
    { label: 'Auto', value: 'auto' },
    { label: '1 / 1', value: '1 / 1' },
    { label: '4 / 3', value: '4 / 3' },
    { label: '3 / 2', value: '3 / 2' },
    { label: '16 / 9', value: '16 / 9' },
    { label: '21 / 9', value: '21 / 9' },
];

export const FONT_WEIGHT_OPTIONS = [
    { label: 'Default', value: '' },
    { label: '100', value: '100' },
    { label: '200', value: '200' },
    { label: '300', value: '300' },
    { label: '400', value: '400' },
    { label: '500', value: '500' },
    { label: '600', value: '600' },
    { label: '700', value: '700' },
    { label: '800', value: '800' },
    { label: '900', value: '900' },
];

export const TEXT_ALIGN_OPTIONS = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
    { label: 'Justify', value: 'justify' },
    { label: 'Start', value: 'start' },
    { label: 'End', value: 'end' },
];

export const TEXT_DECORATION_OPTIONS = [
    { label: 'None', value: 'none' },
    { label: 'Underline', value: 'underline' },
    { label: 'Overline', value: 'overline' },
    { label: 'Line Through', value: 'line-through' },
];

export const TEXT_TRANSFORM_OPTIONS = [
    { label: 'None', value: 'none' },
    { label: 'Uppercase', value: 'uppercase' },
    { label: 'Lowercase', value: 'lowercase' },
    { label: 'Capitalize', value: 'capitalize' },
];

export const DIRECTION_OPTIONS = [
    { label: 'LTR', value: 'ltr' },
    { label: 'RTL', value: 'rtl' },
];

export const FONT_STYLE_OPTIONS = [
    { label: 'Normal', value: 'normal' },
    { label: 'Italic', value: 'italic' },
    { label: 'Oblique', value: 'oblique' },
];

export const TEXT_OVERFLOW_OPTIONS = [
    { label: 'Clip', value: 'clip' },
    { label: 'Ellipsis', value: 'ellipsis' },
];

export const BACKGROUND_CLIP_OPTIONS = [
    { label: 'Border Box', value: 'border-box' },
    { label: 'Padding Box', value: 'padding-box' },
    { label: 'Content Box', value: 'content-box' },
    { label: 'Text', value: 'text' },
];

export const BLEND_MODE_OPTIONS = [
    { label: 'Normal', value: 'normal' },
    { label: 'Multiply', value: 'multiply' },
    { label: 'Screen', value: 'screen' },
    { label: 'Overlay', value: 'overlay' },
    { label: 'Darken', value: 'darken' },
    { label: 'Lighten', value: 'lighten' },
    { label: 'Color Dodge', value: 'color-dodge' },
    { label: 'Color Burn', value: 'color-burn' },
    { label: 'Hard Light', value: 'hard-light' },
    { label: 'Soft Light', value: 'soft-light' },
    { label: 'Difference', value: 'difference' },
    { label: 'Exclusion', value: 'exclusion' },
    { label: 'Hue', value: 'hue' },
    { label: 'Saturation', value: 'saturation' },
    { label: 'Color', value: 'color' },
    { label: 'Luminosity', value: 'luminosity' },
];

export const TRANSITION_TIMING_OPTIONS = [
    { label: 'Ease', value: 'ease' },
    { label: 'Linear', value: 'linear' },
    { label: 'Ease In', value: 'ease-in' },
    { label: 'Ease Out', value: 'ease-out' },
    { label: 'Ease In Out', value: 'ease-in-out' },
];

export const TRANSFORM_ORIGIN_OPTIONS = [
    { label: 'Top Left', value: 'top left' },
    { label: 'Top Center', value: 'top center' },
    { label: 'Top Right', value: 'top right' },
    { label: 'Center Left', value: 'center left' },
    { label: 'Center', value: 'center center' },
    { label: 'Center Right', value: 'center right' },
    { label: 'Bottom Left', value: 'bottom left' },
    { label: 'Bottom Center', value: 'bottom center' },
    { label: 'Bottom Right', value: 'bottom right' },
    { label: 'Custom', value: 'custom' },
];

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
            const classData = editedData || savedData;

            if (!classData) {
                return null;
            }

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

export const generateClassSelector = (id, title, parent) => {
    if (!title) return '';

    if (!parent) return `.${title}`;

    return title?.startsWith(':') ? `.${parent}.blockish-cm-${id}${title}` : `.${parent}.blockish-cm-${id} ${title}`;
};
