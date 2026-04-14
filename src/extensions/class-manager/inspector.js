import { createHigherOrderComponent } from '@wordpress/compose';
import { useState, useRef } from '@wordpress/element';
import { Popover, Dropdown, MenuGroup, MenuItem, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus, close } from '@wordpress/icons';
import clsx from 'clsx';
import InputDropdownContent from './components/input-dropdown-content';
import ControlsDropdownContent from './components/controls-dropdown-content';
import { getEntityTitle, removeClassById, useClasses } from './utils';

const Inspector = createHigherOrderComponent((WrappedComponent) => {
    return (props) => {
        const { useExtensionsAttributes } = window.blockish.helpers;
        const { attributes, setAttributes } = useExtensionsAttributes(props?.clientId);
        const selectedClasses = attributes?.classManager || [];
        const [selectedClass, setSelectedClass] = useState(null);
        const [selectedSubSelector, setSelectedSubSelector] = useState(null);
        const containerRef = useRef(null);
        const classes = useClasses(attributes?.classManager);

        const closePopover = () => {
            setSelectedClass(null);
            setSelectedSubSelector(null);
        };

        function closeIfFocusOutside() {
            if (!containerRef.current) {
                return;
            }

            const { ownerDocument } = containerRef.current;
            const dialog =
                ownerDocument?.activeElement?.closest('[role="dialog"]');
            if (
                !containerRef.current.contains(ownerDocument.activeElement) &&
                (!dialog || dialog.contains(containerRef.current))
            ) {
                closePopover();
            }
        }

        return (
            <>
                <WrappedComponent {...props}>
                    <MenuGroup title={__('Classes', 'blockish')} className='blockish-class-manager'>
                        {
                            classes?.map((item, index) => {
                                return (
                                    <MenuItem
                                        key={index}
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
                                        ref={containerRef}
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
                                popoverProps={{ placement: 'bottom-end' }}
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
                                renderContent={() => {
                                    return (
                                        <InputDropdownContent
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                        />
                                    )
                                }}
                            />
                        </MenuItem>
                    </MenuGroup>
                    {
                        selectedClass && (
                            <Popover
                                className="blockish-class-manager-popover"
                                placement='left-start'
                                offset={34}
                                onFocusOutside={closeIfFocusOutside}
                                onClose={closePopover}
                            >
                                <ControlsDropdownContent
                                    selectedClass={selectedClass}
                                    setSelectedClass={setSelectedClass}
                                    selectedSubSelector={selectedSubSelector}
                                    setSelectedSubSelector={setSelectedSubSelector}
                                    attributes={attributes}
                                    setAttributes={setAttributes}
                                />
                            </Popover>
                        )
                    }
                </WrappedComponent>
            </>
        );
    };
});

export default Inspector;
