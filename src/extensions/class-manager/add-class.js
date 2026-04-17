import clsx from 'clsx';
import { getEntityTitle } from './utils';

const withClassManagerWrapperProp = (wrapperProps = {}, attributes = {}) => {
    const allClasses = Array.isArray(attributes?.classManager) ? attributes.classManager : [];
    const allSelectors = Array.isArray(attributes?.classManagerSubselector) ? attributes.classManagerSubselector : [];

    const classes = [];

    allClasses.forEach((classItem) => {
        const title = getEntityTitle(classItem?.title);
        if (title && attributes?.unseenClass !== title) {
            classes.push(title);
        }
    });

    allSelectors.forEach((selectorItem) => {
        const title = getEntityTitle(selectorItem?.title);
        if (selectorItem?.id && attributes?.unseenSelector !== title) {
            classes.push(`blockish-cm-${selectorItem.id}`);
        }
    });

    return {
        ...wrapperProps,
        className: clsx(wrapperProps.className, classes),
    };
};

export default withClassManagerWrapperProp;
