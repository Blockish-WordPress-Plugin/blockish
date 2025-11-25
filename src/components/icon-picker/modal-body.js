import {
    Button,
    Flex,
    FlexBlock,
    FlexItem,
    SearchControl,
    MenuGroup,
    MenuItem
} from '@wordpress/components';
import { closeSmall, copySmall, trash } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useEffect } from '@wordpress/element';
import parse from "html-react-parser";
import cleanMarkup from './clean-markup';

const categoryLists = [
    { label: 'All', value: 'all' },
    { label: 'Font Awesome Solid', value: 'solid' },
    { label: 'Font Awesome Brand', value: 'brands' },
    { label: 'Font Awesome Regular', value: 'regular' },
    { label: 'Custom Upload', value: 'custom' }
];

const ModalBody = ({
    icons,
    selectedIcon,
    category,
    setCategory,
    search,
    setSearch,
    setSelectedIcon,
    value,
    deleteIcon
}) => {
    const { isDev } = window?.blockishComponentsUtils;
    const { useScrollIntoView } = window?.blockish?.helpers;

    useEffect(() => {
        if (!value) return;

        if (!selectedIcon && value) {
            const icon = icons.find(icon => icon?.icon?.path === value?.path);

            if (!icon && value?.category === 'custom') {
                setSelectedIcon(value);
                return;
            }

            if (icon) {
                setSelectedIcon(icon);
            }
        }
    }, [value]);

    useScrollIntoView('.blockish-icon-picker-grid-item-selected', {
        delay: 300,
        containerSelector: '.blockish-icon-picker-modal-body-content',
        behavior: 'smooth',
        block: 'nearest',
    });

    return (
        <Flex className="blockish-icon-picker-modal-body" align="start">
            <FlexItem>
                <Flex
                    className="blockish-icon-picker-modal-body-header"
                    direction="column"
                >
                    <FlexItem className="blockish-icon-picker-modal-body-header-search">
                        <SearchControl
                            value={search}
                            onChange={setSearch}
                        />
                    </FlexItem>

                    <FlexItem className="blockish-icon-picker-modal-body-header-filter">
                        <MenuGroup label={__('Categories', 'blockish')} className='blockish-icon-picker-category-list'>
                            {categoryLists.map((cat) => (
                                <MenuItem
                                    key={cat.value}
                                    isSelected={category === cat.value}
                                    onClick={() => setCategory(cat.value)}
                                    className={clsx('blockish-icon-picker-category-item', {
                                        'is-selected': category === cat.value,
                                    })}
                                    variant="secondary"
                                >
                                    {cat.label}
                                </MenuItem>
                            ))}
                        </MenuGroup>
                    </FlexItem>
                </Flex>
            </FlexItem>

            <FlexBlock>
                <div className="blockish-icon-picker-modal-body-content">
                    <div className="blockish-icon-picker-grid">
                        {icons.map((icon, index) => {
                            const viewBoxArr = icon?.icon?.viewBox;
                            const viewBox = Array.isArray(viewBoxArr) ? viewBoxArr?.join(' ') : viewBoxArr;
                            const width = viewBoxArr?.[2];
                            const height = viewBoxArr?.[3];
                            const path = icon?.icon?.path;
                            const isSelected = path === selectedIcon?.icon?.path;
                            const isCustom = icon?.category === 'custom';

                            return (
                                <div
                                    key={index}
                                    className={clsx(
                                        'blockish-icon-picker-grid-item',
                                        { 'blockish-icon-picker-grid-item-selected': isSelected }
                                    )}
                                    aria-label={icon?.label}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedIcon(icon)}
                                >
                                    {isDev && !isCustom && (
                                        <Button
                                            className="blockish-icon-picker-grid-item-copy"
                                            aria-label={__('Copy icon to clipboard', 'blockish')}
                                            onClick={() => {
                                                navigator.clipboard.writeText(JSON.stringify(icon?.icon));
                                            }}
                                            icon={copySmall}
                                        />
                                    )}

                                    {
                                        !isCustom && (
                                            <svg width={width} height={height} viewBox={viewBox}>
                                                <path d={path} />
                                            </svg>
                                        )
                                    }

                                    {
                                        isCustom && icon?.icon?.svg && (
                                            <>
                                                {parse(cleanMarkup(icon.icon?.svg))}
                                                <Button
                                                    className="blockish-icon-picker-custom-svg-remove"
                                                    aria-label={__('Remove icon', 'blockish')}
                                                    onClick={() => {
                                                        deleteIcon(icon.slug);
                                                    }}
                                                    icon={closeSmall}
                                                />
                                            </>
                                        )
                                    }

                                    <span className="blockish-icon-picker-grid-item-label">
                                        {icon?.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </FlexBlock>
        </Flex>
    );
};

export default ModalBody;
