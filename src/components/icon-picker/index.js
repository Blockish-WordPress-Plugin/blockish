import { BaseControl, Button, Modal, FormFileUpload } from '@wordpress/components';
import clsx from 'clsx';
import { trash, upload } from '@wordpress/icons';
import { useState, useMemo, useEffect } from '@wordpress/element';
import { store as noticesStore } from '@wordpress/notices';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useProgressiveJSON } from './use-progressive-fethcher';
import ModalBody from './modal-body';
import { useCustomSVGIcons } from './use-custom-svg-icons';
import parse from "html-react-parser";
import cleanMarkup from './clean-markup';

const BlockishIconPicker = ({ label, value, onChange }) => {
    const [openLibrary, setOpenLibrary] = useState(false);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const { createNotice } = useDispatch(noticesStore);

    // Debounced values
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [debouncedCategory, setDebouncedCategory] = useState('all');

    const {
        icons: customIcons = [],
        createIcon,
        deleteIcon,
    } = useCustomSVGIcons();

    // Debounce: search
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    // Debounce: category
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedCategory(category);
        }, 200);
        return () => clearTimeout(timeout);
    }, [category]);

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
        const allIcons = [...customIcons, ...solidIcons, ...regularIcons, ...brandIcons];

        return allIcons.filter((icon) => {
            const matchesSearch =
                !debouncedSearch ||
                icon.label.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                icon.terms?.some((term) =>
                    term.toLowerCase().includes(debouncedSearch.toLowerCase())
                );

            const matchesCategory =
                debouncedCategory === 'all' || icon.category === debouncedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [
        solidIcons,
        regularIcons,
        brandIcons,
        debouncedSearch,
        debouncedCategory,
        customIcons
    ]);

    const [selectedIcon, setSelectedIcon] = useState();

    const uploadFile = async (e) => {
        const file = e.target.files[0];
        try {
            const response = await createIcon(file);
            createNotice(
                'success',
                response.message,
                {
                    type: 'snackbar',
                    isDismissible: true,
                    explicitDismiss: true
                }
            );

            setCategory('custom');
            setSelectedIcon(response.data);
        } catch (err) {
            createNotice(
                'error',
                __('Icon upload failed', 'blockish'),
                {
                    type: 'snackbar',
                    isDismissible: true,
                    explicitDismiss: true
                }
            );
        }

    };

    return (
        <div className="blockish-icon-picker blockish-control">
            <BaseControl label={label} __nextHasNoMarginBottom={true}>
                <div
                    className="blockish-icon-picker-preview"
                    role="group"
                    aria-labelledby="blockish-icon-picker-group-label"
                >
                    <span
                        id="blockish-icon-picker-group-label"
                        className="screen-reader-text"
                    >
                        {__('Icon selection controls', 'blockish')}
                    </span>
                    {!!value && (
                        <Button
                            className="blockish-icon-picker-preview-remove"
                            aria-label={__('Remove selected icon', 'blockish')}
                            onClick={() => {
                                onChange(null);
                            }}
                            icon={trash}
                        />
                    )}
                    <div
                        className={clsx(
                            'blockish-icon-picker-preview-icon',
                            { 'has-preview-icon': !!value }
                        )}
                    >
                        <Button
                            className="blockish-icon-picker-preview-icon-button"
                            aria-label={__('Preview current icon', 'blockish')}
                        >
                            {!!value?.path && value?.viewBox != 'custom' && (
                                <svg
                                    viewBox={value?.viewBox?.join(' ')}
                                    height={value?.viewBox?.[3]}
                                    width={value?.viewBox?.[2]}
                                >
                                    <path d={value?.path} />
                                </svg>
                            )}

                            {
                                !!value?.path && value?.viewBox == 'custom' && parse(cleanMarkup(value?.svg))
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
                    </div>
                </div>
            </BaseControl>

            {openLibrary && (
                <Modal
                    onRequestClose={() => setOpenLibrary(false)}
                    size="fill"
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
                        deleteIcon={deleteIcon}
                        onUploadFile={uploadFile}
                    />

                    <div className="blockish-icon-picker-modal-footer">
                        <FormFileUpload
                            __next40pxDefaultSize
                            icon={upload}
                            accept="image/svg+xml"
                            className='blockish-icon-picker-footer-btn'
                            onChange={(value) => {
                                uploadFile(value);
                            }}
                        >
                            {__('Upload', 'blockish')}
                        </FormFileUpload>

                        <Button
                            onClick={() => {
                                onChange(selectedIcon?.icon);
                                setCategory('all');
                                setSearch('');
                                setOpenLibrary(false);
                            }}
                            className="blockish-icon-picker-footer-btn"
                            aria-label={__('insert icon and Close icon library', 'blockish')}
                            disabled={!selectedIcon}
                        >
                            {__('Insert', 'blockish')}
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default BlockishIconPicker;
