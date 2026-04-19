import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { Button, Dropdown, Flex, FlexItem, __experimentalText as Text, __experimentalVStack as VStack, TextControl } from '@wordpress/components';
import { closeSmall, pencil, plus, seen, trash, unseen } from '@wordpress/icons';
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import StyleControls from './style-controls';
import SubselectorDropdownContent from './subselector-dropdown-content';
import { generateClassSelector, getEntityTitle, isValidCssClass, removeClassById } from '../utils';

const CLASS_POST_TYPE = 'blockish-classes';

const EMPTY_STYLE = {};
const EMPTY_ARRAY = [];

const getEntityContent = (content) => {
    if (typeof content === 'string') {
        return content;
    }

    if (content && typeof content === 'object') {
        if (typeof content.raw === 'string') {
            return content.raw;
        }
        if (typeof content.rendered === 'string') {
            return content.rendered;
        }
    }

    return '';
};

const parseStyleContent = (content) => {
    const raw = getEntityContent(content);
    if (!raw) {
        return EMPTY_STYLE;
    }

    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            return parsed;
        }
    } catch (error) {
        // Fall through to empty object when legacy/non-JSON content is stored.
    }

    return EMPTY_STYLE;
};

const ControlsDropdownContent = ({
    selectedClass,
    setSelectedClass,
    selectedSubSelector,
    setSelectedSubSelector,
    attributes,
    setAttributes,
}) => {
    const classId = selectedClass?.id;
    const subSelectorId = selectedSubSelector?.id;
    const selectCacheRef = useRef({
        key: '',
        value: {
            selectedClassRecord: null,
            selectedClassEdited: null,
            subSelectorsRaw: EMPTY_ARRAY,
            subSelectorsEditedById: {},
            subSelectorEdited: null,
        },
    });

    const { selectedClassRecord, selectedClassEdited, subSelectorsRaw, subSelectorsEditedById, subSelectorEdited } = useSelect(
        (select) => {
            const core = select('core');
            const subSelectors = classId
                ? (core.getEntityRecords('postType', CLASS_POST_TYPE, { per_page: -1, parent: classId }) || EMPTY_ARRAY)
                : EMPTY_ARRAY;

            const subSelectorsEdited = subSelectors.reduce((acc, item) => {
                const id = item?.id;
                if (!id) {
                    return acc;
                }

                acc[id] = core.getEditedEntityRecord('postType', CLASS_POST_TYPE, id) || null;
                return acc;
            }, {});

            const nextValue = {
                selectedClassRecord: classId ? core.getEntityRecord('postType', CLASS_POST_TYPE, classId) : null,
                selectedClassEdited: classId ? core.getEditedEntityRecord('postType', CLASS_POST_TYPE, classId) : null,
                subSelectorsRaw: subSelectors,
                subSelectorsEditedById: subSelectorsEdited,
                subSelectorEdited: subSelectorId
                    ? core.getEditedEntityRecord('postType', CLASS_POST_TYPE, subSelectorId)
                    : null,
            };

            const cacheKey = JSON.stringify({
                classId,
                subSelectorId,
                selectedClassRecordId: nextValue.selectedClassRecord?.id || null,
                selectedClassEditedContent: getEntityContent(nextValue.selectedClassEdited?.content),
                subSelectorsRawIds: subSelectors.map((item) => item?.id).filter(Boolean),
                subSelectorsEditedContent: Object.entries(subSelectorsEdited).map(([id, entity]) => [
                    id,
                    entity?.parent || null,
                    getEntityTitle(entity?.title || ''),
                    getEntityContent(entity?.content),
                ]),
                subSelectorEditedContent: getEntityContent(nextValue.subSelectorEdited?.content),
            });

            if (selectCacheRef.current.key === cacheKey) {
                return selectCacheRef.current.value;
            }

            selectCacheRef.current.key = cacheKey;
            selectCacheRef.current.value = nextValue;
            return nextValue;
        },
        [classId, subSelectorId]
    );

    const { editEntityRecord, deleteEntityRecord } = useDispatch('core');
    const { __unstableMarkNextChangeAsNotPersistent: markNextChangeAsNotPersistent } = useDispatch('core/block-editor');

    const mergedSubSelectors = useMemo(() => {
        return subSelectorsRaw.map((item) => ({
            id: item?.id,
            parent: subSelectorsEditedById[item?.id]?.parent ?? item?.parent,
            title: getEntityTitle(subSelectorsEditedById[item?.id]?.title || item?.title),
        }));
    }, [subSelectorsRaw, subSelectorsEditedById]);

    const selectedClassTitle = getEntityTitle(selectedClassEdited?.title || selectedClassRecord?.title || selectedClass?.title);
    const selectedSubSelectorTitle = getEntityTitle(selectedSubSelector?.title);
    const panelTitle = selectedSubSelectorTitle || selectedClassTitle;
    const [editInput, setEditInput] = useState(panelTitle);

    useEffect(() => {
        setEditInput(panelTitle || '');
    }, [panelTitle]);

    const currentEntityId = subSelectorId || classId;
    const currentSelector = subSelectorId
        ? generateClassSelector(subSelectorId, selectedSubSelectorTitle, selectedClassTitle)
        : generateClassSelector(classId, selectedClassTitle);
    const currentStyle = parseStyleContent(
        subSelectorId
            ? subSelectorEdited?.content
            : (selectedClassEdited?.content || selectedClassRecord?.content)
    );

    const updateClassManager = (next) => {
        setAttributes({ classManager: next });
    };

    const updateSubselectors = (next) => {
        setAttributes({ classManagerSubselector: next });
    };

    const onDelete = async () => {
        if (!currentEntityId) {
            return;
        }

        await deleteEntityRecord('postType', CLASS_POST_TYPE, currentEntityId, { force: true });

        if (subSelectorId) {
            const nextSubSelectors = (attributes?.classManagerSubselector || []).filter((item) => item?.id !== subSelectorId);
            updateSubselectors(nextSubSelectors);
            setSelectedSubSelector(null);
            return;
        }

        const nextClasses = removeClassById(attributes?.classManager || [], classId);
        const nextSubSelectors = (attributes?.classManagerSubselector || []).filter((item) => item?.parent !== classId);
        updateClassManager(nextClasses);
        updateSubselectors(nextSubSelectors);
        setSelectedClass(null);
        setSelectedSubSelector(null);
    };

    const unseenTitle = subSelectorId ? attributes?.unseenSelector : attributes?.unseenClass;

    const toggleVisibility = () => {
        markNextChangeAsNotPersistent();

        if (subSelectorId) {
            setAttributes({
                unseenSelector: unseenTitle === selectedSubSelectorTitle ? '' : selectedSubSelectorTitle,
            });
            return;
        }

        setAttributes({
            unseenClass: unseenTitle === selectedClassTitle ? '' : selectedClassTitle,
        });
    };

    const renameCurrent = () => {
        if (!currentEntityId || !editInput.trim()) {
            return;
        }

        const normalized = editInput.trim();
        editEntityRecord('postType', CLASS_POST_TYPE, currentEntityId, { title: normalized });

        if (subSelectorId) {
            const nextSubSelectors = (attributes?.classManagerSubselector || []).map((item) =>
                item?.id === subSelectorId ? { ...item, title: normalized } : item
            );
            updateSubselectors(nextSubSelectors);
            setSelectedSubSelector((prev) => ({ ...prev, title: normalized }));
            return;
        }

        if (!isValidCssClass(normalized)) {
            return;
        }

        const nextClasses = (attributes?.classManager || []).map((item) =>
            item?.id === classId ? { ...item, title: normalized } : item
        );
        updateClassManager(nextClasses);
        setSelectedClass((prev) => ({ ...prev, title: normalized }));
    };

    return (
        <div className="controls-dropdown-content">
            <VStack className="controls-dropdown-content-header">
                <Flex>
                    <FlexItem className="controls-dropdown-content-header-title">
                        <Text>{panelTitle?.length > 20 ? `${panelTitle.slice(0, 20)}...` : panelTitle}</Text>
                    </FlexItem>

                    <FlexItem className="controls-dropdown-content-header-controls">
                        <Dropdown
                            contentClassName="controls-dropdown-content-header-edit-dropdown-content"
                            popoverProps={{ placement: 'left-start' }}
                            renderToggle={({ isOpen, onToggle }) => (
                                <Button
                                    className="controls-dropdown-content-header-controls-button"
                                    variant="secondary"
                                    size="small"
                                    icon={pencil}
                                    label={__('Edit', 'blockish')}
                                    showTooltip
                                    onClick={onToggle}
                                    aria-expanded={isOpen}
                                />
                            )}
                            renderContent={({ onClose }) => (
                                <VStack>
                                    <form
                                        className="controls-dropdown-content-header-edit-form"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            renameCurrent();
                                            onClose();
                                        }}
                                    >
                                        <Flex align="end" className="controls-dropdown-content-header-edit-form-row">
                                            <FlexItem isBlock className="controls-dropdown-content-header-edit-form-input">
                                                <TextControl
                                                    label={__('Edit Class Name', 'blockish')}
                                                    hideLabelFromVision
                                                    value={editInput}
                                                    onChange={setEditInput}
                                                />
                                            </FlexItem>
                                            <FlexItem>
                                                <Button
                                                    className="controls-dropdown-content-header-edit-form-button"
                                                    type="submit"
                                                    disabled={!subSelectorId && !isValidCssClass(editInput)}
                                                    variant="primary"
                                                    size="small"
                                                    label={__('Save', 'blockish')}
                                                    showTooltip
                                                >
                                                    {__('Save', 'blockish')}
                                                </Button>
                                            </FlexItem>
                                        </Flex>
                                    </form>
                                </VStack>
                            )}
                        />

                        <Button
                            className="controls-dropdown-content-header-controls-button"
                            variant="secondary"
                            size="small"
                            icon={unseenTitle === panelTitle ? unseen : seen}
                            label={unseenTitle === panelTitle ? __('Show', 'blockish') : __('Hide', 'blockish')}
                            showTooltip
                            onClick={toggleVisibility}
                        />

                        <Button
                            className="controls-dropdown-content-header-controls-button"
                            variant="secondary"
                            size="small"
                            icon={trash}
                            label={__('Delete', 'blockish')}
                            showTooltip
                            onClick={onDelete}
                        />
                    </FlexItem>
                </Flex>

                <div className="controls-dropdown-content-subselectors">
                    {mergedSubSelectors
                        .filter((item) => item?.parent === classId)
                        .map((item) => (
                            <Button
                                key={item?.id}
                                variant="secondary"
                                size="small"
                                className={clsx('controls-dropdown-content-subselector', {
                                    'subselector-selected': subSelectorId === item?.id,
                                })}
                                showTooltip
                                onClick={() => {
                                    if (subSelectorId === item?.id) {
                                        setSelectedSubSelector(null);
                                        setEditInput(selectedClassTitle);
                                        return;
                                    }

                                    setSelectedSubSelector(item);
                                    setEditInput(item?.title);
                                }}
                            >
                                <Text>{item?.title}</Text>
                                <span
                                    className="controls-dropdown-content-subselector-close"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        const nextSubSelectors = (attributes?.classManagerSubselector || []).filter(
                                            (subSelector) => subSelector?.id !== item?.id
                                        );
                                        updateSubselectors(nextSubSelectors);
                                        if (subSelectorId === item?.id) {
                                            setSelectedSubSelector(null);
                                        }
                                    }}
                                >
                                    {closeSmall}
                                </span>
                            </Button>
                        ))}

                    <Dropdown
                        className="blockish-class-manager-subselector-input-dropdown"
                        contentClassName="blockish-class-manager-input-dropdown-content"
                        popoverProps={{ placement: 'bottom-end' }}
                        renderToggle={({ isOpen, onToggle }) => (
                            <Button
                                className="controls-dropdown-content-subselector"
                                icon={plus}
                                variant="secondary"
                                size="small"
                                label={__('Add Subselector', 'blockish')}
                                showTooltip
                                onClick={onToggle}
                                aria-expanded={isOpen}
                            />
                        )}
                        renderContent={({ onClose }) => (
                            <SubselectorDropdownContent
                                subSelectors={mergedSubSelectors}
                                parent={selectedClass}
                                attributes={attributes}
                                setAttributes={setAttributes}
                                onClose={onClose}
                            />
                        )}
                    />
                </div>
            </VStack>

            <div className="controls-dropdown-content-body">
                <StyleControls
                    value={currentStyle}
                    currentSelector={currentSelector}
                    onChange={(value) => {
                        if (!currentEntityId) {
                            return;
                        }
                        editEntityRecord('postType', CLASS_POST_TYPE, currentEntityId, { content: JSON.stringify(value || EMPTY_STYLE) });
                    }}
                />
            </div>
        </div>
    );
};

export default ControlsDropdownContent;
