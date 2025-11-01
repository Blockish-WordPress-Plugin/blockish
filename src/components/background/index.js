import getValue from "./get-value";
import createValue from "./create-value";
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __ } from "@wordpress/i18n";

const BlockishBackground = ({ value, onChange, label = __('Background', 'blockish'), ...props }) => {
    const { BlockishColor, BlockishMediaUploader, BlockishToggleGroup, BlockishSelect, BlockishRangeUnit, BlockishResponsive } = window.blockish.components;
    const { useDeviceType, useInheritResponsiveValue } = window.blockish.helpers;
    const device = useDeviceType();
    const inheritResponsiveValue = useInheritResponsiveValue(getValue(value, 'backgroundImage'));
    const backgrounControlValue = getValue(value, 'backgroundImage')?.[device] || inheritResponsiveValue;
    const getBackgroundImageSizes = () => {
        const sizes = backgrounControlValue?.sizes;

        if (!sizes) {
            return [];
        }

        return Object.keys(sizes).map((size) => ({
            value: size,
            label: size?.charAt(0).toUpperCase() + size.slice(1),
            url: sizes[size].url
        }));
    }



    return (
        <div className="blockish-control blockish-group-control blockish-background-control">
            <BlockishToggleGroup
                label={label}
                value={getValue(value, 'backgroundType') || 'classic'}
                onChange={(nextValue) => onChange(createValue(value, { backgroundType: nextValue }))}
                options={[
                    { value: 'classic', label: __('Classic', 'blockish') },
                    { value: 'gradient', label: __('Gradient', 'blockish') },
                ]}
            />
            {
                getValue(value, 'backgroundType') === 'gradient' ? (
                    <BlockishColor
                        label={__('Gradient', 'blockish')}
                        value={getValue(value, 'gradient')}
                        onChange={(nextValue) => onChange(createValue(value, { gradient: nextValue }))}
                        isGradient={true}
                    />
                ) : (
                    <ToolsPanel
                        label={__('Background Controls', 'blockish')}
                        resetAll={() => onChange('')}
                        __experimentalFirstVisibleItemClass="first"
                        __experimentalLastVisibleItemClass="last"
                        dropdownMenuProps={{
                            popoverProps: {
                                placement: 'left-center',
                                shift: true,
                                offset: 230
                            }
                        }}
                    >
                        <ToolsPanelItem
                            label={__('Color', 'blockish')}
                            hasValue={() => !!getValue(value, 'backgroundColor')}
                        >
                            <BlockishColor
                                label={__('Color', 'blockish')}
                                value={getValue(value, 'backgroundColor')}
                                onChange={(nextValue) => onChange(createValue(value, { backgroundColor: nextValue }))}
                                clearable={true}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            label={__('Image', 'blockish')}
                            hasValue={() => !!getValue(value, 'backgroundImage')}
                        >
                            <div className="blockish-background-image-section">
                                <BlockishResponsive left="40px">
                                    <BlockishMediaUploader
                                        label={__('Image', 'blockish')}
                                        placeholder={__('Upload Image', 'blockish')}
                                        value={backgrounControlValue}
                                        onChange={(image) => {
                                            onChange(
                                                createValue(
                                                    value,
                                                    {
                                                        backgroundImage: {
                                                            ...getValue(value, 'backgroundImage'),
                                                            [device]: image
                                                        }
                                                    }
                                                )
                                            );
                                        }}
                                        isInheritedValue={!getValue(value, 'backgroundImage')?.[device]?.url && inheritResponsiveValue?.url ? true : false}
                                    />
                                </BlockishResponsive>
                                {
                                    backgrounControlValue?.sizes && (
                                        <BlockishResponsive left="110px">
                                            <BlockishSelect
                                                label={__('Image Resolution', 'blockish')}
                                                value={getValue(value, 'backgroundImageResolution')?.[device]}
                                                onChange={(nextValue) => onChange(
                                                    createValue(value, { backgroundImageResolution: { ...getValue(value, 'backgroundImageResolution'), [device]: nextValue } }))
                                                }
                                                options={getBackgroundImageSizes()}
                                                isSearchable
                                                isClearable
                                                placeholder={__('Full', 'blockish')}
                                            />
                                        </BlockishResponsive>
                                    )
                                }
                                {
                                    backgrounControlValue?.url && (
                                        <>
                                            <BlockishResponsive left="55px">
                                                <BlockishSelect
                                                    label={__('Position', 'blockish')}
                                                    value={getValue(value, 'backgroundImagePosition')?.[device]}
                                                    onChange={(nextValue) => onChange(createValue(value, { backgroundImagePosition: { ...getValue(value, 'backgroundImagePosition'), [device]: nextValue } }))}
                                                    options={[
                                                        { value: 'top left', label: __('Top Left', 'blockish') },
                                                        { value: 'top center', label: __('Top Center', 'blockish') },
                                                        { value: 'top right', label: __('Top Right', 'blockish') },
                                                        { value: 'center left', label: __('Center Left', 'blockish') },
                                                        { value: 'center center', label: __('Center Center', 'blockish') },
                                                        { value: 'center right', label: __('Center Right', 'blockish') },
                                                        { value: 'bottom left', label: __('Bottom Left', 'blockish') },
                                                        { value: 'bottom center', label: __('Bottom Center', 'blockish') },
                                                        { value: 'bottom right', label: __('Bottom Right', 'blockish') },
                                                        { value: 'custom', label: __('Custom', 'blockish') },
                                                    ]}
                                                    placeholder={__('Top Left', 'blockish')}
                                                />
                                            </BlockishResponsive>
                                            {
                                                getValue(value, 'backgroundImagePosition')?.[device]?.value == 'custom' && (
                                                    <>
                                                        <BlockishResponsive left="38px">
                                                            <BlockishRangeUnit
                                                                label={__('X Axis', 'blockish')}
                                                                value={getValue(value, 'backgroundImagePositionHorizontal')?.[device]}
                                                                onChange={(nextValue) => onChange(createValue(value, {
                                                                    backgroundImagePositionHorizontal: {
                                                                        ...getValue(value, 'backgroundImagePositionHorizontal'),
                                                                        [device]: nextValue
                                                                    }
                                                                }))}
                                                                placeholder={__('0', 'blockish')}
                                                            />
                                                        </BlockishResponsive>
                                                        <BlockishResponsive left="38px">
                                                            <BlockishRangeUnit
                                                                label={__('Y Axis', 'blockish')}
                                                                value={getValue(value, 'backgroundImagePositionVertical')?.[device]}
                                                                onChange={(nextValue) => onChange(createValue(value, {
                                                                    backgroundImagePositionVertical: {
                                                                        ...getValue(value, 'backgroundImagePositionVertical'),
                                                                        [device]: nextValue
                                                                    }
                                                                }))}
                                                                placeholder={__('0', 'blockish')}
                                                            />
                                                        </BlockishResponsive>
                                                    </>
                                                )
                                            }
                                            <BlockishSelect
                                                label={__('Attachment', 'blockish')}
                                                value={getValue(value, 'backgroundImageAttachment')}
                                                onChange={(nextValue) => onChange(createValue(value, { backgroundImageAttachment: nextValue }))}
                                                options={[
                                                    { value: 'scroll', label: __('Scroll', 'blockish') },
                                                    { value: 'fixed', label: __('Fixed', 'blockish') },
                                                ]}
                                                placeholder={__('Scroll', 'blockish')}
                                            />
                                            <BlockishResponsive left="42px">
                                                <BlockishSelect
                                                    label={__('Repeat', 'blockish')}
                                                    value={getValue(value, 'backgroundImageRepeat')?.[device]}
                                                    onChange={(nextValue) => onChange(createValue(value, { backgroundImageRepeat: { ...getValue(value, 'backgroundImageRepeat'), [device]: nextValue } }))}
                                                    options={[
                                                        { value: 'repeat', label: __('Repeat', 'blockish') },
                                                        { value: 'repeat-x', label: __('Repeat X', 'blockish') },
                                                        { value: 'repeat-y', label: __('Repeat Y', 'blockish') },
                                                        { value: 'no-repeat', label: __('No Repeat', 'blockish') },
                                                    ]}
                                                    placeholder={__('Repeat', 'blockish')}
                                                />
                                            </BlockishResponsive>
                                            <BlockishResponsive left="42px">
                                                <BlockishSelect
                                                    label={__('Size', 'blockish')}
                                                    value={getValue(value, 'backgroundImageSize')?.[device]}
                                                    onChange={(nextValue) => onChange(createValue(value, { backgroundImageSize: { ...getValue(value, 'backgroundImageSize'), [device]: nextValue } }))}
                                                    options={[
                                                        { value: 'auto', label: __('Auto', 'blockish') },
                                                        { value: 'cover', label: __('Cover', 'blockish') },
                                                        { value: 'contain', label: __('Contain', 'blockish') },
                                                        { value: 'custom', label: __('Custom', 'blockish') },
                                                    ]}
                                                    placeholder={__('Auto', 'blockish')}
                                                />
                                            </BlockishResponsive>
                                            {
                                                getValue(value, 'backgroundImageSize')?.[device]?.value == 'custom' && (
                                                    <BlockishResponsive left="38px">
                                                        <BlockishRangeUnit
                                                            label={__('Width', 'blockish')}
                                                            value={getValue(value, 'backgroundImageSizeWidth')?.[device]}
                                                            onChange={(nextValue) => onChange(createValue(value, {
                                                                backgroundImageSizeWidth: {
                                                                    ...getValue(value, 'backgroundImageSizeWidth'),
                                                                    [device]: nextValue
                                                                }
                                                            }))}
                                                            placeholder={__('0', 'blockish')}
                                                        />
                                                    </BlockishResponsive>
                                                )
                                            }
                                            <BlockishSelect
                                                label={__('Blend Mode', 'blockish')}
                                                value={getValue(value, 'backgroundImageBlendMode')}
                                                onChange={(nextValue) => onChange(createValue(value, { backgroundImageBlendMode: nextValue }))}
                                                options={[
                                                    { value: 'normal', label: __('Normal', 'blockish') },
                                                    { value: 'multiply', label: __('Multiply', 'blockish') },
                                                    { value: 'screen', label: __('Screen', 'blockish') },
                                                    { value: 'overlay', label: __('Overlay', 'blockish') },
                                                    { value: 'darken', label: __('Darken', 'blockish') },
                                                    { value: 'lighten', label: __('Lighten', 'blockish') },
                                                    { value: 'color-dodge', label: __('Color Dodge', 'blockish') },
                                                    { value: 'color-burn', label: __('Color Burn', 'blockish') },
                                                    { value: 'hard-light', label: __('Hard Light', 'blockish') },
                                                    { value: 'soft-light', label: __('Soft Light', 'blockish') },
                                                    { value: 'difference', label: __('Difference', 'blockish') },
                                                    { value: 'exclusion', label: __('Exclusion', 'blockish') },
                                                    { value: 'hue', label: __('Hue', 'blockish') },
                                                    { value: 'saturation', label: __('Saturation', 'blockish') },
                                                    { value: 'color', label: __('Color', 'blockish') },
                                                    { value: 'luminosity', label: __('Luminosity', 'blockish') },
                                                ]}
                                                placeholder={__('Normal', 'blockish')}
                                            />
                                        </>
                                    )
                                }
                            </div>
                        </ToolsPanelItem>
                    </ToolsPanel>
                )
            }
        </div>
    )
}

export default BlockishBackground