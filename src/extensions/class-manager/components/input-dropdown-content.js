import { useState, useMemo } from '@wordpress/element';
import { SearchControl, MenuItem, MenuGroup, Button, __experimentalText as Text } from '@wordpress/components';
import { useEntityRecords } from '@wordpress/core-data';
import { plus, trash } from '@wordpress/icons';
import clsx from 'clsx';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addClassItem, getEntityTitle, isValidCssClass, removeClassById, useClasses } from '../utils';

const CLASS_POST_TYPE = 'blockish-classes';

const InputDropdownContent = ({ attributes, setAttributes }) => {
    const [ searchInput, setSearchInput ] = useState('');
    const selectedClasses = attributes?.classManager || [];
    const normalizedSearchInput = searchInput.trim();
    const searchQuery = useMemo(() => ({
        per_page: -1,
        search: searchInput,
        parent: 0,
    }), [searchInput]);
    const { records: rawRecords, hasResolved } = useEntityRecords('postType', CLASS_POST_TYPE, searchQuery);
    const records = useClasses(rawRecords || []);
    const { saveEntityRecord, deleteEntityRecord } = useDispatch('core');
   
    const hasClassExists = useMemo(() => {
        return records.some((item) => getEntityTitle(item?.title) === normalizedSearchInput);
    }, [records, normalizedSearchInput]);

    const modifiedRecords = useMemo(() => {
        const excludeIds = new Set(selectedClasses.map(item => item.id));
        return records.map((item) => {
            return {
                ...item,
                isSelected: excludeIds.has(item.id)
            }
        });
    }, [records, selectedClasses]);

    const toggleClassSelection = (item) => {
        setAttributes({
            classManager: item?.isSelected
                ? removeClassById(selectedClasses, item?.id)
                : addClassItem(selectedClasses, item),
        });
    };

    return (
        <div className="blockish-input-dropdown-content">
            <SearchControl
                className='blockish-class-manager-search'
                __nextHasNoMarginBottom
                placeholder={__('Write class name...', 'blockish')}
                value={searchInput}
                onChange={(value) => setSearchInput(value)}
            />
            <MenuGroup title={__('Classes', 'blockish')} className='blockish-class-manager-classes'>
                {
                    hasResolved && modifiedRecords.length > 0 && (
                        modifiedRecords.map((item) => {
                            return (
                                <MenuItem
                                    className={clsx('blockish-class-manager-class', { 'blockish-class-manager-class-selected': item?.isSelected || false })}
                                    key={item?.id}
                                    onClick={() => toggleClassSelection(item)}
                                >
                                    <Text>{getEntityTitle(item?.title)}</Text>
                                    <span
                                        className='blockish-class-manager-delete'
                                        role='button'
                                        tabIndex={0}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const nextClasses = removeClassById(selectedClasses, item?.id);
                                            const nextSubSelectors = (attributes?.classManagerSubselector || []).filter(
                                                (selectorItem) => selectorItem?.parent !== item?.id
                                            );
                                            setAttributes({
                                                classManager: nextClasses,
                                                classManagerSubselector: nextSubSelectors,
                                            });
                                            await deleteEntityRecord('postType', CLASS_POST_TYPE, item?.id, { force: true });
                                        }}
                                    >
                                        {trash}
                                    </span>
                                </MenuItem>
                            )
                        })
                    )
                }
            </MenuGroup>
            {
                normalizedSearchInput.length > 2 && (
                    <Button
                        disabled={hasClassExists || !isValidCssClass(normalizedSearchInput)}
                        variant='primary'
                        className='blockish-class-manager-input-dropdown-add'
                        icon={plus}
                        onClick={async () => {
                            const createdClass = await saveEntityRecord('postType', CLASS_POST_TYPE, {
                                title: normalizedSearchInput,
                                status: 'publish'
                            });

                            if (createdClass?.id) {
                                setAttributes({
                                    classManager: addClassItem(selectedClasses, createdClass),
                                });
                            }

                            setSearchInput('');
                        }}
                    >
                        {__('Add Class', 'blockish')}
                    </Button>
                )
            }
        </div>
    )
};

export default InputDropdownContent
