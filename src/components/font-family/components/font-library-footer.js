import {
    Flex,
    Button,
    __experimentalText as Text,
    SelectControl
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { useEntityRecords } from '@wordpress/core-data';

const FontLibraryFooter = ({
    fontsCollection,
    currentPage,
    setCurrentPage,
    currentPath,
    selectedFont,
    selectedFontFaces = [],
    setSelectedFontFaces,
    setNotice,
}) => {
    const { saveEntityRecord, saveEditedEntityRecord, editEntityRecord } = useDispatch('core');
    const { records: existingFonts, isResolving } = useEntityRecords(
        'postType', 
        'blockish-fonts',
        { 
            per_page: 1, 
            slug: selectedFont?.font_family_settings?.slug 
        }
    );

    return (
        <Flex className="blockish-fonts-library-footer" justify={currentPath === '/' ? 'center' : 'flex-end'}>
            {
                currentPath === '/' && (
                    <>
                        <Button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={parseInt(currentPage) === 1}
                            icon='arrow-left-alt2'
                            label={__('Previous', 'blockish')}
                            showTooltip
                            tooltipPosition='top'
                        />
                        <SelectControl
                            __nextHasNoMarginBottom
                            value={currentPage}
                            onChange={setCurrentPage}
                            options={
                                Array.from({ length: fontsCollection?.total_pages || 1 }, (_, index) => ({
                                    label: index + 1,
                                    value: index + 1
                                }))
                            }
                        />
                        <Text>{`of ${fontsCollection?.total_pages || 1}`}</Text>
                        <Button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={parseInt(currentPage) === fontsCollection?.total_pages}
                            icon='arrow-right-alt2'
                            label={__('Next', 'blockish')}
                            showTooltip
                            tooltipPosition='top'
                        />
                    </>
                )
            }
            {
                currentPath === '/font' && (
                    <Button
                        variant='primary'
                        disabled={!selectedFontFaces?.length}
                        onClick={async () => {
                            const settings = selectedFont?.font_family_settings;
                            const title = settings?.name;
                            const font_faces = selectedFontFaces;
                            const preview = settings?.preview;
                            const slug = settings?.slug;
                            const total_variants = settings?.fontFace?.length;
                            

                            if (!slug) return; // Ensure slug exists
                            
                            if (existingFonts?.length) {
                                const existingFont = existingFonts[0];

                                // Update meta fields only if they have changed
                                editEntityRecord('postType', 'blockish-fonts', existingFont.id, {
                                    meta: { preview, font_faces }
                                });

                                await saveEditedEntityRecord('postType', 'blockish-fonts', existingFont.id);
                            } else if (title && font_faces?.length) {
                                // Create new font if not exists
                                await saveEntityRecord('postType', 'blockish-fonts', {
                                    title,
                                    slug,
                                    status: 'publish',
                                    meta: { preview, font_faces, total_variants }
                                });
                            }
                            setSelectedFontFaces([]);
                            setNotice(true);
                        }}
                    >
                        {__('Install', 'blockish')}
                    </Button>
                )
            }
        </Flex>
    )
};

export default FontLibraryFooter;