import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';
import {  useEntityRecords } from '@wordpress/core-data';
import { __experimentalGrid as Grid, Flex, FlexBlock, Button, Spinner } from '@wordpress/components';
import { cloudDownload } from '@wordpress/icons';
import FontModal from './components/font-modal';

const BlockishFontFamily = ({ value, onChange, label = __('Font Family', 'blockish'), weight, onWeightChange }) => {
    const { BlockishSelect } = window.blockish.components;
    
    // Detect if a block theme is being used
    const isBlockTheme = useSelect(select => {
        const { getCurrentTheme } = select('core');
        return getCurrentTheme()?.is_block_theme;
    }, []);


    const [open, setOpen] = useState(false)

    // Get classic theme fonts
    const { records: classicFontRecords, isResolving, hasResolved } = useEntityRecords('postType', 'blockish-fonts', {
        per_page: 100
    })

    
    // Get font families from block theme settings
    const { settings } = useSelect(select => {
        const { getSettings } = select(blockEditorStore);
        return {
            settings: getSettings()?.__experimentalFeatures,
        };
    }, []);
    
    const fontFamilies = settings?.typography?.fontFamilies?.theme || [];
    const customFontFamilies = settings?.typography?.fontFamilies?.custom || [];
    const defaultFontFamilies = settings?.typography?.fontFamilies?.default || [];
    
    // Use theme fonts if in block theme, otherwise use classic theme fonts
    const options = isBlockTheme
    ? [...fontFamilies, ...customFontFamilies, ...defaultFontFamilies].map(font => ({
        value: font.fontFamily,
        label: font.name,
        fontFace: font.fontFace || []
    }))
    : classicFontRecords?.map(font => ({
        value: font?.slug,
        label: font?.title?.rendered,
        fontFace: font?.meta?.font_faces || []
    })) || [];


    const getWeightOptions = useMemo(() => {
        const selectedFont = options.find(font => font.value === value?.value);

        if (!selectedFont?.fontFace) return [];

        const weights = new Set();
        selectedFont.fontFace.forEach(face => {
            if (face.fontWeight) {
                if (face.fontWeight.includes(' ')) {
                    const [min, max] = face.fontWeight.split(' ').map(Number);
                    for (let i = min; i <= max; i += 100) {
                        weights.add(i.toString());
                    }
                } else {
                    weights.add(face.fontWeight);
                }
            }
        });

        return Array.from(weights).map(weight => ({
            value: weight,
            label: weight === '400' ? __('Regular', 'blockish') : weight
        }));
    }, [value, options]);
    
    const weightOptions = getWeightOptions.length > 0 ? getWeightOptions : [];

    return (
        <div className="blockish-font-family-control blockish-control">
            <Grid columns={weightOptions.length > 0 ? 2 : 1} align='center'>
                <BlockishSelect
                    label={
                        <Flex>
                            <FlexBlock>
                                <legend>{label}</legend>
                            </FlexBlock>
                            {
                                !isBlockTheme && (
                                    <Button 
                                        size='small' 
                                        className='blockish-font-family-install-btn' 
                                        icon={cloudDownload} 
                                        label={__('Install Fonts', 'blockish')} 
                                        onClick={() => { setOpen(!open) }}
                                    />
                                )
                            }
                        </Flex>
                    }
                    value={value}
                    onChange={onChange}
                    options={options}
                    placeholder={__('Default', 'blockish')}
                />
                {weightOptions.length > 0 && onWeightChange && (
                    <BlockishSelect
                        label={__('Font Weight', 'blockish')}
                        value={weight}
                        onChange={onWeightChange}
                        options={weightOptions}
                        placeholder={__('Regular', 'blockish')}
                    />
                )}
            </Grid>
            <FontModal isOpen={open} onClose={() => { setOpen(false) }}/>
        </div>
    );
};

export default BlockishFontFamily;
