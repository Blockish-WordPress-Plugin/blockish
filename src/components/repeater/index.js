import { cloneElement } from '@wordpress/element';
import { Button } from '@wordpress/components';
import BlockishPanelBody from '../panelbody';
import { Children } from '@wordpress/element';
import generateUniqueHash from './generate-unique-hash';
import getItemLabel from './get-item-label';
import { __ } from '@wordpress/i18n';
import { copy, plus, trash } from '@wordpress/icons';
import { ReactSortable } from 'react-sortablejs';

const BlockishRepeater = ({ repeaterItems = [], children, onChange, itemLabelName = '', defaultLabel = 'Item', addUniqueId = false, sortable = false, newItem, addLabel }) => {
    const defaultAddLabel = addLabel || __('Add Item', 'blockish');
    const handleAdd = () => {
        let newItemObj = newItem ? newItem() : {};

        if (addUniqueId && !newItemObj.id) {
            newItemObj.id = generateUniqueHash();
        }

        if (!newItem) {
            // Convert children to array to ensure consistency
            const childrenArray = Children.toArray(children);

            childrenArray.forEach((child) => {
                if (child.props.name) {
                    newItemObj[child.props.name] = child.props.default || '';
                }
            });
        }

        onChange([...repeaterItems, newItemObj]);
    };

    const handleRemove = (index) => {
        const newItems = [...repeaterItems];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const handleClone = (index) => {
        const newItems = [...repeaterItems];
        const clonedItem = { ...newItems[index] }; // Clone the item
        if (addUniqueId) {
            clonedItem.id = generateUniqueHash(); // Assign a new unique ID to the cloned item
        }
        newItems.splice(index + 1, 0, clonedItem); // Insert the cloned item
        onChange(newItems);
    };

    const handleItemChange = (index, name, value) => {
        const newItems = JSON.parse(JSON.stringify(repeaterItems));
        newItems[index][name] = value;
        onChange(newItems);
    };

    const itemsList = repeaterItems || [];
    const RepeaterItemsWrapper = sortable ? ReactSortable : 'div';
    const wrapperProps = sortable ? {
        list: itemsList,
        setList: onChange,
        animation: 200,
        className: "blockish-repeater-items-wrapper"
    } : {
        className: "blockish-repeater-items-wrapper"
    };

    return (
        <div className="blockish-repeater-container">
            <RepeaterItemsWrapper {...wrapperProps}>
                {itemsList.map((item, index) => {
                    let itemLabel = getItemLabel(item, itemLabelName, index, defaultLabel);
                    return (
                        <div key={item.id || index} className="blockish-repeater-item">
                            <div className="blockish-repeater-item-header-actions">
                                <Button
                                    className="blockish-repeater-action-button"
                                    icon={copy}
                                    label={__('Clone Item', 'blockish')}
                                    onClick={(e) => { e.stopPropagation(); handleClone(index); }}
                                />
                                <Button
                                    className="blockish-repeater-action-button is-destructive"
                                    icon={trash}
                                    label={__('Delete Item', 'blockish')}
                                    onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                                />
                            </div>
                            <BlockishPanelBody title={itemLabel} initialOpen={false} className="blockish-repeater-item-body">
                                <div className="blockish-repeater-item-content">
                                    {typeof children === 'function' ? (
                                        children(item, index, (partial) => {
                                            const newItems = JSON.parse(JSON.stringify(repeaterItems));
                                            newItems[index] = { ...newItems[index], ...partial };
                                            onChange(newItems);
                                        })
                                    ) : Children.toArray(children).map((child, i) => {
                                        const childName = child?.props?.name;
                                        return cloneElement(child, {
                                            key: i,
                                            ...(childName
                                                ? {
                                                      value: item[childName],
                                                      values: item[childName],
                                                      checked: item[childName],
                                                      onChange: (value) => handleItemChange(index, childName, value),
                                                      onSelect: (value) => handleItemChange(index, childName, value),
                                                  }
                                                : {
                                                      id: item.id,
                                                  }),
                                        });
                                    })}
                                </div>
                            </BlockishPanelBody>
                        </div>
                    );
                })}
            </RepeaterItemsWrapper>
            <Button className="blockish-repeater-add" icon={plus} variant="secondary" onClick={handleAdd}>
                {defaultAddLabel}
            </Button>
        </div>
    );
};

export default BlockishRepeater;
