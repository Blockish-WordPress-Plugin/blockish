import { createHigherOrderComponent } from '@wordpress/compose';
import { useState, useRef, useEffect, useCallback } from '@wordpress/element';
import { Popover, Dropdown, MenuGroup, MenuItem, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus, close } from '@wordpress/icons';
import clsx from 'clsx';
import InputDropdownContent from './components/input-dropdown-content';
import ControlsDropdownContent from './components/controls-dropdown-content';
import { getEntityTitle, removeClassById, useClasses } from './utils';
import { focusPopupNode } from './focus-popup';

const Inspector = createHigherOrderComponent((WrappedComponent) => {
    return (props) => {
        const { useExtensionsAttributes } = window.blockish.helpers;
        const { attributes, setAttributes } = useExtensionsAttributes(props?.clientId);
        const selectedClasses = attributes?.classManager || [];
        const [selectedClass, setSelectedClass] = useState(null);
        const [selectedSubSelector, setSelectedSubSelector] = useState(null);
        const listRef = useRef(null);
        const popoverRef = useRef(null);
        const classes = useClasses(attributes?.classManager);
        const classIdsKey = (classes || []).map((item) => item?.id).filter(Boolean).join(',');

        const closePopover = useCallback(() => {
            setSelectedClass(null);
            setSelectedSubSelector(null);
        }, []);

        useEffect(() => {
            if (!selectedClass?.id) {
                return;
            }

            if (!classes.some((item) => item?.id === selectedClass.id)) {
                closePopover();
            }
        }, [classIdsKey, selectedClass?.id, classes, closePopover]);

        // Refocus only when the class list changes (add/delete), not on style edits.
        useEffect(() => {
            if (!selectedClass?.id) {
                return;
            }

            focusPopupNode(popoverRef.current);
        }, [classIdsKey, selectedClass?.id]);

        const closeIfFocusOutside = (event) => {
            const nextTarget = event?.relatedTarget || event?.target;
            const popover = popoverRef.current;
            const list = listRef.current;

            if (popover?.contains(nextTarget) || list?.contains(nextTarget)) {
                return;
            }

            const dialog = nextTarget?.closest?.('[role="dialog"]');
            if (dialog && popover && dialog.contains(popover)) {
                return;
            }

            closePopover();
        };

        const renderAddClassContent = useCallback(() => (
            <InputDropdownContent
                attributes={attributes}
                setAttributes={setAttributes}
            />
        ), [attributes, setAttributes]);

        return (
            <>
                <WrappedComponent {...props}>
                    <div ref={listRef} className="blockish-class-manager-list">
                    <MenuGroup title={__('Classes', 'blockish')} className='blockish-class-manager'>
                        {
                            classes?.map((item, index) => {
                                return (
                                    <MenuItem
                                        key={item?.id || index}
                                        className={clsx('blockish-class-manager-class-item', { 'blockish-class-manager-class-item-selected': item?.id === selectedClass?.id })}
                                        onClick={() => {
                                            if (selectedClass?.id === item?.id) {
                                                closePopover();
                                            } else {
                                                setSelectedClass({
                                                    ...item,
                                                    title: getEntityTitle(item?.title),
                                                });
                                            }
                                        }}
                                    >
                                        <div
                                            variant="secondary"
                                            className="blockish-class-manager-style-dropdown-btn"
                                            title={__('Select Class', 'blockish')}
                                        >
                                            <Text>{getEntityTitle(item?.title)}</Text>
                                            <span
                                                className='blockish-class-manager-class-item-remove'
                                                role='button'
                                                tabIndex={0}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAttributes({
                                                        classManager: removeClassById(selectedClasses, item?.id),
                                                    });
                                                    if (selectedClass?.id === item?.id) {
                                                        closePopover();
                                                    }
                                                }}>
                                                {close}
                                            </span>
                                        </div>
                                    </MenuItem>
                                )
                            })
                        }
                        <MenuItem className='blockish-class-manager-class-item blockish-class-manager-class-item-add'>
                            <Dropdown
                                className="blockish-class-manager-input-dropdown"
                                contentClassName="blockish-class-manager-input-dropdown-content"
                                popoverProps={{ placement: 'bottom-end', focusOnMount: 'container' }}
                                renderToggle={({ isOpen, onToggle }) => (
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className="blockish-class-manager-add-btn"
                                        onClick={onToggle}
                                        aria-expanded={isOpen}
                                    >
                                        {plus}
                                    </div>
                                )}
                                renderContent={renderAddClassContent}
                            />
                        </MenuItem>
                    </MenuGroup>
                    </div>
                    {
                        selectedClass && (
                            <Popover
                                className="blockish-class-manager-popover"
                                placement='left-start'
                                offset={34}
                                focusOnMount="container"
                                onFocusOutside={closeIfFocusOutside}
                                onClose={closePopover}
                            >
                                <div
                                    ref={popoverRef}
                                    tabIndex={-1}
                                    className="blockish-class-manager-popover-focus"
                                >
                                    <ControlsDropdownContent
                                        selectedClass={selectedClass}
                                        setSelectedClass={setSelectedClass}
                                        selectedSubSelector={selectedSubSelector}
                                        setSelectedSubSelector={setSelectedSubSelector}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                    />
                                </div>
                            </Popover>
                        )
                    }
                </WrappedComponent>
            </>
        );
    };
});

export default Inspector;
