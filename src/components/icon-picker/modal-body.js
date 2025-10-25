import { Button, Flex, FlexItem, SearchControl, SelectControl } from '@wordpress/components';
import { copySmall } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useEffect } from 'react';


const categoryLists = [
    {
        label: 'All',
        value: 'all',
    },
    {
        label: 'Font Awesome Solid',
        value: 'solid',
    },
    {
        label: 'Font Awesome Brand',
        value: 'brands',
    },
    {
        label: 'Font Awesome Regular',
        value: 'regular',
    }
];

const ModalBody = ({ icons, selectedIcon, category, setCategory, search, setSearch, setSelectedIcon, value }) => {
    const { isDev } = window?.blockishComponentsUtils;
    const { useScrollIntoView } = window?.blockish?.helpers;

    useEffect(() => {
        if (!value) return;

        if (!selectedIcon && value) {
            const icon = icons.find(icon => icon?.icon?.path === value?.path);
            setSelectedIcon(icon);
        }
    }, [value]);

    // Scroll into view
    useScrollIntoView('.blockish-icon-picker-grid-item-selected', {
        delay: 300, // 300ms delay before scroll
        containerSelector: '.blockish-icon-picker-modal-body-content', // optional
        behavior: 'smooth',
        block: 'nearest',
    });


    return (
        <div className="blockish-icon-picker-modal-body">
            <Flex className="blockish-icon-picker-modal-body-header">
                <FlexItem className="blockish-icon-picker-modal-body-header-filter">
                    <SelectControl
                        options={categoryLists}
                        value={category}
                        onChange={setCategory}
                    />
                </FlexItem>
                <FlexItem className="blockish-icon-picker-modal-body-header-search">
                    <SearchControl
                        value={search}
                        onChange={setSearch}
                    />
                </FlexItem>
            </Flex>
            <div className="blockish-icon-picker-modal-body-content">
                <div className="blockish-icon-picker-grid">
                    {
                        icons.map((icon, index) => {
                            const viewBoxArr = icon?.icon?.viewBox;
                            const viewBox = viewBoxArr?.join(' ');
                            const width = viewBoxArr[2];
                            const height = viewBoxArr[3];
                            const path = icon?.icon?.path;
                            const isSelected = path === selectedIcon?.icon?.path;

                            return (
                                <div
                                    key={index}
                                    className={clsx('blockish-icon-picker-grid-item', { 'blockish-icon-picker-grid-item-selected': isSelected })}
                                    aria-label={icon?.label}
                                    role='button'
                                    tabIndex={0}
                                    onClick={() => setSelectedIcon(icon)}
                                >
                                    {
                                        isDev && (
                                            <Button
                                                className="blockish-icon-picker-grid-item-copy"
                                                aria-label={__('Copy icon to clipboard', 'blockish')}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(JSON.stringify(icon?.icon));
                                                }}
                                                icon={copySmall}
                                            />
                                        )
                                    }
                                    <svg width={width} height={height} viewBox={viewBox}>
                                        <path d={path} />
                                    </svg>
                                    <span className='blockish-icon-picker-grid-item-label'>{icon?.label}</span>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}
export default ModalBody