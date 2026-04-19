import { __ } from '@wordpress/i18n';
import { rotateRight } from '@wordpress/icons';
import {
    ALIGN_ITEMS_OPTIONS,
    ASPECT_RATIO_OPTIONS,
    BLEND_MODE_OPTIONS,
    BACKGROUND_CLIP_OPTIONS,
    DISPLAY_OPTIONS,
    DIRECTION_OPTIONS,
    FONT_STYLE_OPTIONS,
    FONT_WEIGHT_OPTIONS,
    FLEX_DIRECTION_OPTIONS,
    FLEX_WRAP_OPTIONS,
    GRID_LAYOUT_OPTIONS,
    JUSTIFY_CONTENT_OPTIONS,
    OBJECT_FIT_OPTIONS,
    OVERFLOW_OPTIONS,
    POSITION_OPTIONS,
    TEXT_ALIGN_OPTIONS,
    TEXT_DECORATION_OPTIONS,
    TEXT_OVERFLOW_OPTIONS,
    TEXT_TRANSFORM_OPTIONS,
    TRANSFORM_ORIGIN_OPTIONS,
    TRANSITION_TIMING_OPTIONS,
} from '../utils';

const StyleControls = ({ value = {}, onChange, currentSelector = '' }) => {
    const {
        BlockishPanelBody,
        BlockishResponsive,
        BlockishSpacingSizes,
        BlockishSelect,
        BlockishRangeUnit,
        BlockishDropdown,
        BlockishFontFamily,
        BlockishBorder,
        BlockishBorderRadius,
        BlockishBoxShadow,
        BlockishTextStroke,
        BlockishColor,
        BlockishBackground,
        BlockishCSSFilters,
        BlockishCodeEditor,
        Button,
        TextControl,
        RangeControl,
        __experimentalHStack: HStack,
        __experimentalText: Text,
    } = window.blockish.components;
    const { useDeviceType } = window.blockish.helpers;

    const device = useDeviceType();
    const displayValue = value?.display?.[device]?.value;
    const isFlexDisplay = displayValue === 'flex' || displayValue === 'inline-flex';
    const isGridDisplay = displayValue === 'grid' || displayValue === 'inline-grid';
    const onChangeResponsiveValue = (key, nextValue) => {
        onChange({
            ...value,
            [key]: {
                ...(value?.[key] || {}),
                [device]: nextValue,
            },
        });
    };

    const resetTransforms = () => {
        onChange({
            ...value,
            translateX: undefined,
            translateY: undefined,
            translateZ: undefined,
            rotate: undefined,
            rotateX: undefined,
            rotateY: undefined,
            rotateZ: undefined,
            scale: undefined,
            scale3DX: undefined,
            scale3DY: undefined,
            scale3DZ: undefined,
            skewX: undefined,
            skewY: undefined,
            perspective: undefined,
            transformOrigin: undefined,
            transformOriginX: undefined,
            transformOriginY: undefined,
        });
    };

    const customCssExample = `{{SELECTOR}} {}`;

    return (
        <>
        <BlockishPanelBody title={__('Layout', 'blockish')} initialOpen>
            <BlockishResponsive left="46px">
                <BlockishSelect
                    label={__('Display', 'blockish')}
                    options={DISPLAY_OPTIONS}
                    value={value?.display?.[device]}
                    onChange={(next) => onChangeResponsiveValue('display', next)}
                />
            </BlockishResponsive>

            {isFlexDisplay && (
                <>
                    <BlockishResponsive left="92px">
                        <BlockishSelect
                            label={__('Flex Direction', 'blockish')}
                            options={FLEX_DIRECTION_OPTIONS}
                            value={value?.flexDirection?.[device]}
                            onChange={(next) => onChangeResponsiveValue('flexDirection', next)}
                        />
                    </BlockishResponsive>

                    <BlockishResponsive left="66px">
                        <BlockishSelect
                            label={__('Flex Wrap', 'blockish')}
                            options={FLEX_WRAP_OPTIONS}
                            value={value?.flexWrap?.[device]}
                            onChange={(next) => onChangeResponsiveValue('flexWrap', next)}
                        />
                    </BlockishResponsive>

                    <BlockishResponsive left="105px">
                        <BlockishSelect
                            label={__('Justify Content', 'blockish')}
                            options={JUSTIFY_CONTENT_OPTIONS}
                            value={value?.justifyContent?.[device]}
                            onChange={(next) => onChangeResponsiveValue('justifyContent', next)}
                        />
                    </BlockishResponsive>

                    <BlockishResponsive left="75px">
                        <BlockishSelect
                            label={__('Align Items', 'blockish')}
                            options={ALIGN_ITEMS_OPTIONS}
                            value={value?.alignItems?.[device]}
                            onChange={(next) => onChangeResponsiveValue('alignItems', next)}
                        />
                    </BlockishResponsive>

                </>
            )}

            {isGridDisplay && (
                <>
                    <BlockishResponsive left="75px">
                        <BlockishSelect
                            label={__('Grid Layout', 'blockish')}
                            options={GRID_LAYOUT_OPTIONS}
                            value={value?.gridLayoutType?.[device]}
                            onChange={(next) => onChangeResponsiveValue('gridLayoutType', next)}
                        />
                    </BlockishResponsive>

                    {value?.gridLayoutType?.[device] === 'fixed' && (
                        <>
                            <BlockishResponsive left="92px">
                                <BlockishRangeUnit
                                    label={__('Columns', 'blockish')}
                                    value={value?.gridColumns?.[device]}
                                    onChange={(next) => onChangeResponsiveValue('gridColumns', next)}
                                    units={{
                                        px: { min: 1, max: 12, step: 1 },
                                    }}
                                />
                            </BlockishResponsive>
                            <BlockishResponsive left="75px">
                                <BlockishRangeUnit
                                    label={__('Rows', 'blockish')}
                                    value={value?.gridRows?.[device]}
                                    onChange={(next) => onChangeResponsiveValue('gridRows', next)}
                                    units={{
                                        px: { min: 1, max: 12, step: 1 },
                                    }}
                                />
                            </BlockishResponsive>
                        </>
                    )}

                    {value?.gridLayoutType?.[device] === 'auto' && (
                        <>
                            <BlockishResponsive left="70px">
                                <BlockishRangeUnit
                                    label={__('Grid Width', 'blockish')}
                                    value={value?.autoGridWidth?.[device]}
                                    onChange={(next) => onChangeResponsiveValue('autoGridWidth', next)}
                                />
                            </BlockishResponsive>
                            <BlockishResponsive left="72px">
                                <BlockishRangeUnit
                                    label={__('Grid Height', 'blockish')}
                                    value={value?.autoGridHeight?.[device]}
                                    onChange={(next) => onChangeResponsiveValue('autoGridHeight', next)}
                                />
                            </BlockishResponsive>
                        </>
                    )}
                </>
            )}

            {(isFlexDisplay || isGridDisplay) && (
                <>
                    <BlockishResponsive left="77px">
                        <BlockishRangeUnit
                            label={__('Column Gap', 'blockish')}
                            value={value?.columnGap?.[device]}
                            onChange={(next) => onChangeResponsiveValue('columnGap', next)}
                        />
                    </BlockishResponsive>
                    <BlockishResponsive left="54px">
                        <BlockishRangeUnit
                            label={__('Row Gap', 'blockish')}
                            value={value?.rowGap?.[device]}
                            onChange={(next) => onChangeResponsiveValue('rowGap', next)}
                        />
                    </BlockishResponsive>
                </>
            )}
        </BlockishPanelBody>

        <BlockishPanelBody title={__('Spacing', 'blockish')} initialOpen={false}>
            <BlockishResponsive left="52px">
                <BlockishSpacingSizes
                    label={__('Padding', 'blockish')}
                    value={value?.padding?.[device]}
                    onChange={(next) => onChangeResponsiveValue('padding', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="46px">
                <BlockishSpacingSizes
                    label={__('Margin', 'blockish')}
                    value={value?.margin?.[device]}
                    onChange={(next) => onChangeResponsiveValue('margin', next)}
                />
            </BlockishResponsive>
        </BlockishPanelBody>

        <BlockishPanelBody title={__('Size', 'blockish')} initialOpen={false}>
            <BlockishResponsive left="40px">
                <BlockishRangeUnit
                    label={__('Width', 'blockish')}
                    value={value?.width?.[device]}
                    onChange={(next) => onChangeResponsiveValue('width', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="43px">
                <BlockishRangeUnit
                    label={__('Height', 'blockish')}
                    value={value?.height?.[device]}
                    onChange={(next) => onChangeResponsiveValue('height', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="63px">
                <BlockishRangeUnit
                    label={__('Min Width', 'blockish')}
                    value={value?.minWidth?.[device]}
                    onChange={(next) => onChangeResponsiveValue('minWidth', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="68px">
                <BlockishRangeUnit
                    label={__('Min Height', 'blockish')}
                    value={value?.minHeight?.[device]}
                    onChange={(next) => onChangeResponsiveValue('minHeight', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="68px">
                <BlockishRangeUnit
                    label={__('Max Width', 'blockish')}
                    value={value?.maxWidth?.[device]}
                    onChange={(next) => onChangeResponsiveValue('maxWidth', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="70px">
                <BlockishRangeUnit
                    label={__('Max Height', 'blockish')}
                    value={value?.maxHeight?.[device]}
                    onChange={(next) => onChangeResponsiveValue('maxHeight', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="62px">
                <BlockishSelect
                    label={__('Overflow', 'blockish')}
                    options={OVERFLOW_OPTIONS}
                    value={value?.overflow?.[device]}
                    onChange={(next) => onChangeResponsiveValue('overflow', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="82px">
                <BlockishSelect
                    label={__('Aspect Ratio', 'blockish')}
                    options={ASPECT_RATIO_OPTIONS}
                    value={value?.aspectRatio?.[device]}
                    onChange={(next) => onChangeResponsiveValue('aspectRatio', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="66px">
                <BlockishSelect
                    label={__('Object Fit', 'blockish')}
                    options={OBJECT_FIT_OPTIONS}
                    value={value?.objectFit?.[device]}
                    onChange={(next) => onChangeResponsiveValue('objectFit', next)}
                />
            </BlockishResponsive>
        </BlockishPanelBody>

        <BlockishPanelBody title={__('Position', 'blockish')} initialOpen={false}>
            <BlockishResponsive left="56px">
                <BlockishSelect
                    label={__('Position', 'blockish')}
                    options={POSITION_OPTIONS}
                    value={value?.position?.[device]}
                    onChange={(next) => onChangeResponsiveValue('position', next)}
                />
            </BlockishResponsive>

            {value?.position?.[device] && value?.position?.[device] !== 'static' && (
                <>
                    <BlockishResponsive left="25px">
                        <BlockishRangeUnit
                            label={__('Top', 'blockish')}
                            value={value?.top?.[device]}
                            onChange={(next) => onChangeResponsiveValue('top', next)}
                            units={{
                                px: { min: -2000, max: 2000, step: 1 },
                                '%': { min: -100, max: 100, step: 1 },
                                em: { min: -200, max: 200, step: 0.1 },
                                rem: { min: -200, max: 200, step: 0.1 },
                                vh: { min: -100, max: 100, step: 1 },
                                vw: { min: -100, max: 100, step: 1 },
                            }}
                        />
                    </BlockishResponsive>
                    <BlockishResponsive left="28px">
                        <BlockishRangeUnit
                            label={__('Left', 'blockish')}
                            value={value?.left?.[device]}
                            onChange={(next) => onChangeResponsiveValue('left', next)}
                            units={{
                                px: { min: -2000, max: 2000, step: 1 },
                                '%': { min: -100, max: 100, step: 1 },
                                em: { min: -200, max: 200, step: 0.1 },
                                rem: { min: -200, max: 200, step: 0.1 },
                                vh: { min: -100, max: 100, step: 1 },
                                vw: { min: -100, max: 100, step: 1 },
                            }}
                        />
                    </BlockishResponsive>
                    <BlockishResponsive left="35px">
                        <BlockishRangeUnit
                            label={__('Right', 'blockish')}
                            value={value?.right?.[device]}
                            onChange={(next) => onChangeResponsiveValue('right', next)}
                            units={{
                                px: { min: -2000, max: 2000, step: 1 },
                                '%': { min: -100, max: 100, step: 1 },
                                em: { min: -200, max: 200, step: 0.1 },
                                rem: { min: -200, max: 200, step: 0.1 },
                                vh: { min: -100, max: 100, step: 1 },
                                vw: { min: -100, max: 100, step: 1 },
                            }}
                        />
                    </BlockishResponsive>
                    <BlockishResponsive left="48px">
                        <BlockishRangeUnit
                            label={__('Bottom', 'blockish')}
                            value={value?.bottom?.[device]}
                            onChange={(next) => onChangeResponsiveValue('bottom', next)}
                            units={{
                                px: { min: -2000, max: 2000, step: 1 },
                                '%': { min: -100, max: 100, step: 1 },
                                em: { min: -200, max: 200, step: 0.1 },
                                rem: { min: -200, max: 200, step: 0.1 },
                                vh: { min: -100, max: 100, step: 1 },
                                vw: { min: -100, max: 100, step: 1 },
                            }}
                        />
                    </BlockishResponsive>
                </>
            )}

            <BlockishResponsive left="48px">
                <BlockishRangeUnit
                    label={__('Z-Index', 'blockish')}
                    value={value?.zIndex?.[device]}
                    onChange={(next) => onChangeResponsiveValue('zIndex', next)}
                    units={{
                        px: { min: -999, max: 999, step: 1 },
                    }}
                />
            </BlockishResponsive>

            <BlockishResponsive left="92px">
                <BlockishRangeUnit
                    label={__('Anchor Offset', 'blockish')}
                    value={value?.anchorOffset?.[device]}
                    onChange={(next) => onChangeResponsiveValue('anchorOffset', next)}
                    units={{
                        px: { min: -2000, max: 2000, step: 1 },
                        '%': { min: -100, max: 100, step: 1 },
                        em: { min: -200, max: 200, step: 0.1 },
                        rem: { min: -200, max: 200, step: 0.1 },
                        vh: { min: -100, max: 100, step: 1 },
                        vw: { min: -100, max: 100, step: 1 },
                    }}
                />
            </BlockishResponsive>
        </BlockishPanelBody>

        <BlockishPanelBody title={__('Typography', 'blockish')} initialOpen={false}>
            <BlockishFontFamily
                label={__('Font Family', 'blockish')}
                value={value?.fontFamily}
                onChange={(next) => onChange({ ...value, fontFamily: next })}
            />

            <BlockishSelect
                label={__('Font Weight', 'blockish')}
                options={FONT_WEIGHT_OPTIONS}
                value={value?.fontWeight?.[device]}
                onChange={(next) => onChangeResponsiveValue('fontWeight', next)}
            />

            <BlockishColor
                label={__('Text Color', 'blockish')}
                value={value?.color}
                onChange={(next) => onChange({ ...value, color: next })}
            />

            <BlockishResponsive left="60px">
                <BlockishRangeUnit
                    label={__('Font Size', 'blockish')}
                    value={value?.fontSize?.[device]}
                    onChange={(next) => onChangeResponsiveValue('fontSize', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="66px">
                <BlockishSelect
                    label={__('Text Align', 'blockish')}
                    options={TEXT_ALIGN_OPTIONS}
                    value={value?.textAlign?.[device]}
                    onChange={(next) => onChangeResponsiveValue('textAlign', next)}
                />
            </BlockishResponsive>

            <BlockishSelect
                label={__('Text Decoration', 'blockish')}
                options={TEXT_DECORATION_OPTIONS}
                value={value?.textDecoration?.[device]}
                onChange={(next) => onChangeResponsiveValue('textDecoration', next)}
            />

            <BlockishSelect
                label={__('Text Transform', 'blockish')}
                options={TEXT_TRANSFORM_OPTIONS}
                value={value?.textTransform?.[device]}
                onChange={(next) => onChangeResponsiveValue('textTransform', next)}
            />

            <BlockishSelect
                label={__('Direction', 'blockish')}
                options={DIRECTION_OPTIONS}
                value={value?.direction?.[device]}
                onChange={(next) => onChangeResponsiveValue('direction', next)}
            />

            <BlockishSelect
                label={__('Font Style', 'blockish')}
                options={FONT_STYLE_OPTIONS}
                value={value?.fontStyle?.[device]}
                onChange={(next) => onChangeResponsiveValue('fontStyle', next)}
            />

            <BlockishSelect
                label={__('Text Overflow', 'blockish')}
                options={TEXT_OVERFLOW_OPTIONS}
                value={value?.textOverflow?.[device]}
                onChange={(next) => onChangeResponsiveValue('textOverflow', next)}
            />

            <BlockishResponsive left="72px">
                <BlockishRangeUnit
                    label={__('Line Height', 'blockish')}
                    value={value?.lineHeight?.[device]}
                    onChange={(next) => onChangeResponsiveValue('lineHeight', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="95px">
                <BlockishRangeUnit
                    label={__('Letter Spacing', 'blockish')}
                    value={value?.letterSpacing?.[device]}
                    onChange={(next) => onChangeResponsiveValue('letterSpacing', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="88px">
                <BlockishRangeUnit
                    label={__('Word Spacing', 'blockish')}
                    value={value?.wordSpacing?.[device]}
                    onChange={(next) => onChangeResponsiveValue('wordSpacing', next)}
                />
            </BlockishResponsive>

            <BlockishResponsive left="50px">
                <BlockishRangeUnit
                    label={__('Column', 'blockish')}
                    value={value?.columnCount?.[device]}
                    onChange={(next) => onChangeResponsiveValue('columnCount', next)}
                    units={{
                        px: { min: 1, max: 12, step: 1 },
                    }}
                />
            </BlockishResponsive>

            <BlockishBoxShadow
                label={__('Text Shadow', 'blockish')}
                value={value?.textShadow || ''}
                onChange={(next) => onChange({ ...value, textShadow: next })}
                exclude={['inset', 'spread']}
            />

            <BlockishTextStroke
                label={__('Text Stroke', 'blockish')}
                value={value?.textStroke || ''}
                onChange={(next) => onChange({ ...value, textStroke: next })}
            />
        </BlockishPanelBody>

        <BlockishPanelBody title={__('Border', 'blockish')} initialOpen={false}>
            <BlockishBorder
                label={__('Border', 'blockish')}
                value={value?.border}
                onChange={(next) => onChange({ ...value, border: next })}
            />

            <BlockishResponsive left="44px">
                <BlockishBorderRadius
                    label={__('Border Radius', 'blockish')}
                    value={value?.borderRadius}
                    onChange={(next) => onChange({ ...value, borderRadius: next })}
                />
            </BlockishResponsive>
        </BlockishPanelBody>

        <BlockishPanelBody title={__('Background', 'blockish')} initialOpen={false}>
            <BlockishBackground
                value={value?.background}
                onChange={(next) => onChange({ ...value, background: next })}
            />
            <BlockishResponsive left="75px">
                <BlockishSelect
                    label={__('Blend Mode', 'blockish')}
                    options={BLEND_MODE_OPTIONS}
                    value={value?.blendMode?.[device]}
                    onChange={(next) => onChangeResponsiveValue('blendMode', next)}
                />
            </BlockishResponsive>
            <BlockishResponsive left="108px">
                <BlockishSelect
                    label={__('Background Clip', 'blockish')}
                    options={BACKGROUND_CLIP_OPTIONS}
                    value={value?.backgroundClip?.[device]}
                    onChange={(next) => onChangeResponsiveValue('backgroundClip', next)}
                />
            </BlockishResponsive>
            <BlockishCSSFilters
                label={__('Background Filters', 'blockish')}
                value={value?.backgroundFilters || ''}
                onChange={(next) => onChange({ ...value, backgroundFilters: next })}
            />
        </BlockishPanelBody>

        <BlockishPanelBody title={__('Effect', 'blockish')} initialOpen={false}>
            <div className="blockish-class-manager-effect-panel">
            <BlockishResponsive left="50px">
                <RangeControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    label={__('Opacity', 'blockish')}
                    value={typeof value?.opacity?.[device] === 'number' ? value?.opacity?.[device] : 1}
                    onChange={(next) => onChangeResponsiveValue('opacity', next)}
                    min={0}
                    max={1}
                    step={0.01}
                />
            </BlockishResponsive>

            <BlockishBoxShadow
                label={__('Box Shadow', 'blockish')}
                value={value?.boxShadow || ''}
                onChange={(next) => onChange({ ...value, boxShadow: next })}
            />

            <HStack justify="space-between" className="blockish-class-manager-effect-actions">
                <BlockishDropdown className="blockish-class-manager-effect-dropdown" label={__('Transform', 'blockish')}>
                    <div className="blockish-transform-dropdown">
                        <BlockishResponsive left="77px">
                            <BlockishRangeUnit
                                label={__('Translate X', 'blockish')}
                                value={value?.translateX?.[device]}
                                onChange={(next) => onChangeResponsiveValue('translateX', next)}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="77px">
                            <BlockishRangeUnit
                                label={__('Translate Y', 'blockish')}
                                value={value?.translateY?.[device]}
                                onChange={(next) => onChangeResponsiveValue('translateY', next)}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="77px">
                            <BlockishRangeUnit
                                label={__('Translate Z', 'blockish')}
                                value={value?.translateZ?.[device]}
                                onChange={(next) => onChangeResponsiveValue('translateZ', next)}
                                units={{
                                    px: { min: -1000, max: 1000, step: 1 },
                                    em: { min: -50, max: 50, step: 0.1 },
                                    rem: { min: -50, max: 50, step: 0.1 },
                                }}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="44px">
                            <RangeControl
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                label={__('Rotate', 'blockish')}
                                value={typeof value?.rotate?.[device] === 'number' ? value?.rotate?.[device] : 0}
                                onChange={(next) => onChangeResponsiveValue('rotate', next)}
                                min={-360}
                                max={360}
                                step={1}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="55px">
                            <RangeControl
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                label={__('Rotate X', 'blockish')}
                                value={typeof value?.rotateX?.[device] === 'number' ? value?.rotateX?.[device] : 0}
                                onChange={(next) => onChangeResponsiveValue('rotateX', next)}
                                min={-360}
                                max={360}
                                step={1}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="55px">
                            <RangeControl
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                label={__('Rotate Y', 'blockish')}
                                value={typeof value?.rotateY?.[device] === 'number' ? value?.rotateY?.[device] : 0}
                                onChange={(next) => onChangeResponsiveValue('rotateY', next)}
                                min={-360}
                                max={360}
                                step={1}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="55px">
                            <RangeControl
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                label={__('Rotate Z', 'blockish')}
                                value={typeof value?.rotateZ?.[device] === 'number' ? value?.rotateZ?.[device] : 0}
                                onChange={(next) => onChangeResponsiveValue('rotateZ', next)}
                                min={-360}
                                max={360}
                                step={1}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="44px">
                            <RangeControl
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                label={__('Scale', 'blockish')}
                                value={typeof value?.scale?.[device] === 'number' ? value?.scale?.[device] : 1}
                                onChange={(next) => onChangeResponsiveValue('scale', next)}
                                min={0}
                                max={3}
                                step={0.01}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="80px">
                            <RangeControl
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                label={__('Scale X (3D)', 'blockish')}
                                value={typeof value?.scale3DX?.[device] === 'number' ? value?.scale3DX?.[device] : 1}
                                onChange={(next) => onChangeResponsiveValue('scale3DX', next)}
                                min={0.1}
                                max={3}
                                step={0.01}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="80px">
                            <RangeControl
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                label={__('Scale Y (3D)', 'blockish')}
                                value={typeof value?.scale3DY?.[device] === 'number' ? value?.scale3DY?.[device] : 1}
                                onChange={(next) => onChangeResponsiveValue('scale3DY', next)}
                                min={0.1}
                                max={3}
                                step={0.01}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="80px">
                            <RangeControl
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                label={__('Scale Z (3D)', 'blockish')}
                                value={typeof value?.scale3DZ?.[device] === 'number' ? value?.scale3DZ?.[device] : 1}
                                onChange={(next) => onChangeResponsiveValue('scale3DZ', next)}
                                min={0.1}
                                max={3}
                                step={0.01}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="45px">
                            <RangeControl
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                label={__('Skew X', 'blockish')}
                                value={typeof value?.skewX?.[device] === 'number' ? value?.skewX?.[device] : 0}
                                onChange={(next) => onChangeResponsiveValue('skewX', next)}
                                min={-60}
                                max={60}
                                step={1}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="45px">
                            <RangeControl
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                label={__('Skew Y', 'blockish')}
                                value={typeof value?.skewY?.[device] === 'number' ? value?.skewY?.[device] : 0}
                                onChange={(next) => onChangeResponsiveValue('skewY', next)}
                                min={-60}
                                max={60}
                                step={1}
                            />
                        </BlockishResponsive>
                        <BlockishResponsive left="76px">
                            <BlockishRangeUnit
                                label={__('Perspective', 'blockish')}
                                value={value?.perspective?.[device]}
                                onChange={(next) => onChangeResponsiveValue('perspective', next)}
                                units={{
                                    px: { min: 0, max: 2000, step: 10 },
                                }}
                            />
                        </BlockishResponsive>

                        <BlockishSelect
                            label={__('Transform Origin', 'blockish')}
                            options={TRANSFORM_ORIGIN_OPTIONS}
                            value={value?.transformOrigin?.[device]}
                            onChange={(next) => onChangeResponsiveValue('transformOrigin', next)}
                        />

                        {value?.transformOrigin?.[device] === 'custom' && (
                            <>
                                <BlockishResponsive left="52px">
                                    <BlockishRangeUnit
                                        label={__('Origin X', 'blockish')}
                                        value={value?.transformOriginX?.[device]}
                                        onChange={(next) => onChangeResponsiveValue('transformOriginX', next)}
                                    />
                                </BlockishResponsive>
                                <BlockishResponsive left="52px">
                                    <BlockishRangeUnit
                                        label={__('Origin Y', 'blockish')}
                                        value={value?.transformOriginY?.[device]}
                                        onChange={(next) => onChangeResponsiveValue('transformOriginY', next)}
                                    />
                                </BlockishResponsive>
                            </>
                        )}
                    </div>
                </BlockishDropdown>
                <Button
                    className="blockish-class-manager-effect-reset"
                    variant="secondary"
                    icon={rotateRight}
                    label={__('Reset Transform', 'blockish')}
                    onClick={resetTransforms}
                    showTooltip
                >
                    <Text>{__('Reset', 'blockish')}</Text>
                </Button>
            </HStack>

            <BlockishDropdown className="blockish-class-manager-effect-dropdown" label={__('Transition', 'blockish')}>
                <div className="blockish-transform-dropdown">
                    <TextControl
                        label={__('Transition Property', 'blockish')}
                        value={value?.transitionProperty?.[device] || 'all'}
                        onChange={(next) => onChangeResponsiveValue('transitionProperty', next)}
                        help={__('Example: all, opacity, transform', 'blockish')}
                    />
                    <BlockishResponsive left="148px">
                        <RangeControl
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                            label={__('Transition Duration (s)', 'blockish')}
                            value={typeof value?.transitionDuration?.[device] === 'number' ? value?.transitionDuration?.[device] : 0.2}
                            onChange={(next) => onChangeResponsiveValue('transitionDuration', next)}
                            min={0}
                            max={10}
                            step={0.1}
                        />
                    </BlockishResponsive>
                    <BlockishResponsive left="126px">
                        <RangeControl
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                            label={__('Transition Delay (s)', 'blockish')}
                            value={typeof value?.transitionDelay?.[device] === 'number' ? value?.transitionDelay?.[device] : 0}
                            onChange={(next) => onChangeResponsiveValue('transitionDelay', next)}
                            min={0}
                            max={10}
                            step={0.1}
                        />
                    </BlockishResponsive>
                    <BlockishResponsive left="112px">
                        <BlockishSelect
                            label={__('Transition Timing', 'blockish')}
                            options={TRANSITION_TIMING_OPTIONS}
                            value={value?.transitionTimingFunction?.[device]}
                            onChange={(next) => onChangeResponsiveValue('transitionTimingFunction', next)}
                        />
                    </BlockishResponsive>
                </div>
            </BlockishDropdown>

            <BlockishCSSFilters
                label={__('Filters', 'blockish')}
                value={value?.filters || ''}
                onChange={(next) => onChange({ ...value, filters: next })}
            />
            </div>
        </BlockishPanelBody>

        <BlockishPanelBody title={__('Custom CSS', 'blockish')} initialOpen={false}>
            <BlockishCodeEditor
                label={__('Custom CSS', 'blockish')}
                value={value?.customCss || customCssExample}
                onChange={(next) => onChange({ ...value, customCss: next })}
                settings={{ mode: 'css', lineWrapping: true }}
                rows={10}
                help={__('Use {{SELECTOR}} to target the current class selector.', 'blockish')}
            />
            <Text className="components-base-control__help">
                {`${__('Current selector:', 'blockish')} ${currentSelector || '{{SELECTOR}}'}`}
            </Text>
        </BlockishPanelBody>
        </>
    );
};

export default StyleControls;
