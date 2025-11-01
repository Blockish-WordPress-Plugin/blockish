import { BaseControl, Button, Modal } from '@wordpress/components';
import clsx from 'clsx';
import { trash } from '@wordpress/icons';
import { useState, useMemo, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useProgressiveJSON } from './use-progressive-fethcher';
import ModalBody from './modal-body';

const BlockishIconPicker = ({ label, value, onChange }) => {
    const [openLibrary, setOpenLibrary] = useState(false);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');

    const solidIcons = useProgressiveJSON(
        new URL('./font-awesome/solid.json', import.meta.url).href,
        500,
        500
    );
    const regularIcons = useProgressiveJSON(
        new URL('./font-awesome/regular.json', import.meta.url).href,
        500,
        500
    );
    const brandIcons = useProgressiveJSON(
        new URL('./font-awesome/brands.json', import.meta.url).href,
        300,
        300
    );

    const icons = useMemo(() => {
        const allIcons = [...solidIcons, ...regularIcons, ...brandIcons];

        return allIcons.filter((icon) => {
            // Check search against label and terms
            const matchesSearch =
                !search ||
                icon.label.toLowerCase().includes(search.toLowerCase()) ||
                icon.terms?.some((term) =>
                    term.toLowerCase().includes(search.toLowerCase())
                );

            // Check category
            const matchesCategory =
                category === 'all' || icon.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [solidIcons, regularIcons, brandIcons, search, category]);

    const [selectedIcon, setSelectedIcon] = useState();

    return (
        <div className="blockish-icon-picker blockish-control">
            <BaseControl
                label={label}
                __nextHasNoMarginBottom={true}
            >
                <div
                    className="blockish-icon-picker-preview"
                    role="group"
                    aria-labelledby="blockish-icon-picker-group-label"
                >
                    <span id="blockish-icon-picker-group-label" className="screen-reader-text">
                        {__('Icon selection controls', 'blockish')}
                    </span>
                    {
                        !!value && (
                            <Button
                                className="blockish-icon-picker-preview-remove"
                                aria-label={__('Remove selected icon', 'blockish')}
                                onClick={() => {
                                    onChange(null);
                                }}
                                icon={trash}
                            />
                        )
                    }
                    <div className={clsx('blockish-icon-picker-preview-icon', { 'has-preview-icon': !!value })}>
                        <Button
                            className="blockish-icon-picker-preview-icon-button"
                            aria-label={__('Preview current icon', 'blockish')}
                        >
                            {
                                !!value?.path && (
                                    <svg viewBox={value?.viewBox?.join(' ')} height={value?.viewBox?.[3]} width={value?.viewBox?.[2]}>
                                        <path d={value?.path} />
                                    </svg>
                                )
                            }
                        </Button>
                    </div>
                    <div
                        className="blockish-icon-picker-preview-action"
                        role="group"
                        aria-label={__('Icon source options', 'blockish')}
                    >
                        <Button
                            onClick={() => {
                                setOpenLibrary(true);
                                setSelectedIcon(null);
                            }}
                            aria-label={__('Choose icon from library', 'blockish')}
                        >
                            {__('Icon Library', 'blockish')}
                        </Button>
                        <Button
                            aria-label={__('Upload your own SVG icon', 'blockish')}
                        >
                            {__('Upload SVG', 'blockish')}
                        </Button>
                    </div>
                </div>
            </BaseControl>
            {
                openLibrary && (
                    <Modal
                        onRequestClose={() => setOpenLibrary(false)}
                        size='fill'
                        className="blockish-icon-picker-modal"
                        overlayClassName="blockish-icon-picker-modal-overlay"
                        title={__('Icon Library', 'blockish')}
                    >
                        <ModalBody
                            icons={icons}
                            selectedIcon={selectedIcon}
                            category={category}
                            setCategory={setCategory}
                            search={search}
                            setSearch={setSearch}
                            setSelectedIcon={setSelectedIcon}
                            value={value}
                        />
                        <div className="blockish-icon-picker-modal-footer">
                            <Button
                                onClick={() => {
                                    onChange(selectedIcon?.icon);
                                    setCategory('all');
                                    setSearch('');
                                    setOpenLibrary(false);
                                }}
                                className="blockish-icon-picker-insert-btn"
                                aria-label={__('insert icon and Close icon library', 'blockish')}
                                disabled={!selectedIcon}
                            >
                                {__('Insert', 'blockish')}
                            </Button>
                        </div>
                    </Modal>
                )
            }
        </div>
    );
};

export default BlockishIconPicker;
