import { useMemo, useState } from '@wordpress/element';
import { SearchControl, MenuItem, MenuGroup, Button, __experimentalText as Text } from '@wordpress/components';
import { plus, trash } from '@wordpress/icons';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { getEntityTitle, removeClassById } from '../utils';

const CLASS_POST_TYPE = 'blockish-classes';

const SubselectorDropdownContent = ({ subSelectors = [], parent, attributes, setAttributes, onClose }) => {
    const [searchInput, setSearchInput] = useState('');
    const { saveEntityRecord, deleteEntityRecord } = useDispatch('core');
    const normalizedSearchInput = searchInput.trim();

    if (!parent?.id) {
        return null;
    }

    const normalizedSubSelectors = useMemo(() => {
        return subSelectors
            .filter((item) => item?.parent === parent?.id)
            .map((item) => ({
                ...item,
                title: getEntityTitle(item?.title),
            }));
    }, [subSelectors, parent?.id]);

    const hasClassExists = useMemo(() => {
        return normalizedSubSelectors.some((item) => item?.title === normalizedSearchInput);
    }, [normalizedSubSelectors, normalizedSearchInput]);

    const modifiedRecords = useMemo(() => {
        const selectedSubSelectors = Array.isArray(attributes?.classManagerSubselector)
            ? attributes.classManagerSubselector
            : [];
        const excludeIds = new Set(selectedSubSelectors.map((item) => item.id));

        return normalizedSubSelectors.map((item) => ({
            ...item,
            isSelected: excludeIds.has(item.id),
        }));
    }, [normalizedSubSelectors, attributes?.classManagerSubselector]);

    const visibleRecords = useMemo(() => {
        if (!normalizedSearchInput) {
            return modifiedRecords;
        }

        const searchLower = normalizedSearchInput.toLowerCase();
        return modifiedRecords.filter((item) => item?.title?.toLowerCase().includes(searchLower));
    }, [modifiedRecords, normalizedSearchInput]);

    const toggleSelection = (item) => {
        const current = Array.isArray(attributes?.classManagerSubselector)
            ? attributes.classManagerSubselector
            : [];

        if (item?.isSelected) {
            setAttributes({
                classManagerSubselector: removeClassById(current, item?.id),
            });
            return;
        }

        const exists = current.some((entry) => entry?.id === item?.id);
        const next = exists
            ? current.map((entry) => (
                entry?.id === item?.id
                    ? { ...entry, title: item?.title, parent: parent?.id }
                    : entry
            ))
            : [
                ...current,
                {
                    id: item?.id,
                    title: item?.title,
                    parent: parent?.id,
                },
            ];

        setAttributes({ classManagerSubselector: next });
    };

    const addSubSelector = async () => {
        if (!normalizedSearchInput || hasClassExists) {
            return;
        }

        const created = await saveEntityRecord('postType', CLASS_POST_TYPE, {
            title: normalizedSearchInput,
            status: 'publish',
            parent: parent?.id,
        });

        if (!created?.id) {
            return;
        }

        const current = Array.isArray(attributes?.classManagerSubselector)
            ? attributes.classManagerSubselector
            : [];

        if (!current.some((item) => item?.id === created.id)) {
            setAttributes({
                classManagerSubselector: [
                    ...current,
                    {
                        id: created.id,
                        title: getEntityTitle(created?.title) || normalizedSearchInput,
                        parent: parent?.id,
                    },
                ],
            });
        }

        setSearchInput('');
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className="blockish-input-dropdown-content">
            <SearchControl
                __nextHasNoMarginBottom
                className="blockish-class-manager-search"
                placeholder={__('Write css selector...', 'blockish')}
                value={searchInput}
                onChange={setSearchInput}
            />
            <Text className="blockish-class-manager-search-info">
                {__('Use a selector that targets something inside the current block.', 'blockish')}
            </Text>

            <MenuGroup title={__('Classes', 'blockish')} className="blockish-class-manager-classes">
                {visibleRecords.length > 0 && visibleRecords.map((item) => (
                    <MenuItem
                        key={item?.id}
                        className={clsx('blockish-class-manager-class', {
                            'blockish-class-manager-class-selected': item?.isSelected || false,
                        })}
                        onClick={() => toggleSelection(item)}
                        showTooltip={item?.title?.length > 20}
                    >
                        <Text>{item?.title?.length > 20 ? `${item.title.slice(0, 20)}...` : item?.title}</Text>
                        <span
                            className="blockish-class-manager-delete"
                            role="button"
                            tabIndex={0}
                            onClick={async (event) => {
                                event.stopPropagation();
                                const current = Array.isArray(attributes?.classManagerSubselector)
                                    ? attributes.classManagerSubselector
                                    : [];
                                setAttributes({
                                    classManagerSubselector: removeClassById(current, item?.id),
                                });
                                await deleteEntityRecord('postType', CLASS_POST_TYPE, item?.id, { force: true });
                            }}
                        >
                            {trash}
                        </span>
                    </MenuItem>
                ))}
            </MenuGroup>

            {normalizedSearchInput.length > 0 && (
                <Button
                    disabled={hasClassExists}
                    variant="primary"
                    className="blockish-class-manager-input-dropdown-add"
                    icon={plus}
                    onClick={addSubSelector}
                >
                    {__('Add Selector', 'blockish')}
                </Button>
            )}
        </div>
    );
};

export default SubselectorDropdownContent;
