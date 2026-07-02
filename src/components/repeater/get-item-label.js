const getItemLabel = (item, itemLabelName, index, defaultLabel) => {
    if (itemLabelName && item[itemLabelName] && item[itemLabelName].trim().length > 0 && item[itemLabelName].length > 22) {
        return item[itemLabelName].substring(0, 22);
    } else if (itemLabelName && item[itemLabelName] && item[itemLabelName].trim().length > 0 && item[itemLabelName].length <= 22) {
        return item[itemLabelName];
    } else {
        return `${defaultLabel} #${index + 1}`;
    }
};

export default getItemLabel;
