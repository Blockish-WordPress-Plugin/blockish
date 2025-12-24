import { __ } from '@wordpress/i18n';
import { memo } from '@wordpress/element';

const Transform = ({ attributes, setAttributes }) => {
    const { BlockishControl, BlockishResponsiveControl } = window?.blockish?.controls;
    const { BlockishToolsPanel, BlockishDropdown } = window.blockish.components;

    // Helper function to check if attribute has value (fixed to handle 0)
    const hasValue = (slug) => {
        const value = attributes?.[slug];
        return value !== undefined && value !== null;
    };

    // Reset all normal transform attributes
    const resetAllNormal = () => {
        setAttributes({
            rotateZ: undefined,
            rotate3D: undefined,
            rotateX: undefined,
            rotateY: undefined,
            scale: undefined,
            scaleSeparate: undefined,
            scaleX: undefined,
            scaleY: undefined,
            translateX: undefined,
            translateY: undefined,
            translate3D: undefined,
            translateZ: undefined,
            skewX: undefined,
            skewY: undefined,
            transformOrigin: undefined,
            transformOriginX: undefined,
            transformOriginY: undefined,
            perspective: undefined,
            transformTransitionDuration: undefined,
        });
    };

    // Reset all hover transform attributes
    const resetAllHover = () => {
        setAttributes({
            rotateZHover: undefined,
            rotate3DHover: undefined,
            rotateXHover: undefined,
            rotateYHover: undefined,
            scaleHover: undefined,
            scaleSeparateHover: undefined,
            scaleXHover: undefined,
            scaleYHover: undefined,
            translateXHover: undefined,
            translateYHover: undefined,
            translate3DHover: undefined,
            translateZHover: undefined,
            skewXHover: undefined,
            skewYHover: undefined,
            transformOriginHover: undefined,
            transformOriginXHover: undefined,
            transformOriginYHover: undefined,
            perspectiveHover: undefined,
        });
    };

    return (
        <BlockishControl type='BlockishPanelBody' title={__('Transform', 'blockish')}>
            <BlockishControl
                type="BlockishTab"
                tabs={[
                    {
                        name: 'transform-normal',
                        title: 'Normal'
                    },
                    {
                        name: 'transform-hover',
                        title: 'Hover'
                    }
                ]}
            >
                {({ name: tabName }) => (
                    <>
                        {tabName === 'transform-normal' && (
                            <>
                                <BlockishToolsPanel
                                    label={__('Transform', 'blockish')}
                                    resetAll={resetAllNormal}
                                    dropdownMenuProps={{
                                        popoverProps: {
                                            placement: 'left-center',
                                            shift: true,
                                            offset: 230
                                        }
                                    }}
                                    items={[
                                        {
                                            slug: 'rotate',
                                            label: __('Rotate', 'blockish'),
                                            hasValue: () => hasValue('rotateZ') || hasValue('rotate3D') || hasValue('rotateX') || hasValue('rotateY'),
                                            onDeselect: () => {
                                                setAttributes({
                                                    rotateZ: undefined,
                                                    rotate3D: undefined,
                                                    rotateX: undefined,
                                                    rotateY: undefined,
                                                });
                                            },
                                            isShownByDefault: false,
                                            children: (
                                                <>
                                                    <BlockishDropdown
                                                        label={__('Rotate', 'blockish')}
                                                    >
                                                        <BlockishResponsiveControl
                                                            left='44px'
                                                            label={__('Rotate', 'blockish')}
                                                            type="RangeControl"
                                                            slug="rotateZ"
                                                            min={-360}
                                                            max={360}
                                                            step={1}
                                                        />

                                                        <BlockishControl
                                                            label={__('3D Rotation', 'blockish')}
                                                            type="BlockishToggle"
                                                            slug="rotate3D"
                                                        />

                                                        {attributes?.rotate3D && (
                                                            <>
                                                                <BlockishResponsiveControl
                                                                    label={__('Rotate X', 'blockish')}
                                                                    left='55px'
                                                                    type="RangeControl"
                                                                    slug="rotateX"
                                                                    min={-360}
                                                                    max={360}
                                                                    step={1}
                                                                />
                                                                <BlockishResponsiveControl
                                                                    label={__('Rotate Y', 'blockish')}
                                                                    left='55px'
                                                                    type="RangeControl"
                                                                    slug="rotateY"
                                                                    min={-360}
                                                                    max={360}
                                                                    step={1}
                                                                />
                                                            </>
                                                        )}
                                                    </BlockishDropdown>
                                                </>
                                            )
                                        },
                                        {
                                            slug: 'scale',
                                            label: __('Scale', 'blockish'),
                                            hasValue: () => hasValue('scale') || hasValue('scaleSeparate') || hasValue('scaleX') || hasValue('scaleY'),
                                            onDeselect: () => {
                                                setAttributes({
                                                    scale: undefined,
                                                    scaleSeparate: undefined,
                                                    scaleX: undefined,
                                                    scaleY: undefined,
                                                });
                                            },
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Scale', 'blockish')}>
                                                    <BlockishResponsiveControl
                                                        label={__('Scale', 'blockish')}
                                                        left='36px'
                                                        type="RangeControl"
                                                        slug="scale"
                                                        min={0.1}
                                                        max={3}
                                                        step={0.1}
                                                    />

                                                    <BlockishControl
                                                        label={__('Separate X & Y Scale', 'blockish')}
                                                        type="BlockishToggle"
                                                        slug="scaleSeparate"
                                                    />

                                                    {attributes?.scaleSeparate && (
                                                        <>
                                                            <BlockishResponsiveControl
                                                                label={__('Scale X', 'blockish')}
                                                                left='48px'
                                                                type="RangeControl"
                                                                slug="scaleX"
                                                                min={0.1}
                                                                max={3}
                                                                step={0.1}
                                                            />
                                                            <BlockishResponsiveControl
                                                                label={__('Scale Y', 'blockish')}
                                                                left='48px'
                                                                type="RangeControl"
                                                                slug="scaleY"
                                                                min={0.1}
                                                                max={3}
                                                                step={0.1}
                                                            />
                                                        </>
                                                    )}
                                                </BlockishDropdown>
                                            )
                                        },
                                        {
                                            slug: 'translate',
                                            label: __('Translate', 'blockish'),
                                            hasValue: () => hasValue('translateX') || hasValue('translateY') || hasValue('translate3D') || hasValue('translateZ'),
                                            onDeselect: () => {
                                                setAttributes({
                                                    translateX: undefined,
                                                    translateY: undefined,
                                                    translate3D: undefined,
                                                    translateZ: undefined,
                                                });
                                            },
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Translate', 'blockish')}>
                                                    <BlockishResponsiveControl
                                                        label={__('Translate X', 'blockish')}
                                                        left='77px'
                                                        type="RangeControl"
                                                        slug="translateX"
                                                        units={['px', '%', 'em', 'rem']}
                                                    />
                                                    <BlockishResponsiveControl
                                                        label={__('Translate Y', 'blockish')}
                                                        left='77px'
                                                        type="RangeControl"
                                                        slug="translateY"
                                                        units={['px', '%', 'em', 'rem']}
                                                    />

                                                    <BlockishControl
                                                        label={__('3D Translate', 'blockish')}
                                                        type="BlockishToggle"
                                                        slug="translate3D"
                                                    />

                                                    {attributes?.translate3D && (
                                                        <BlockishResponsiveControl
                                                            label={__('Translate Z', 'blockish')}
                                                            left='77px'
                                                            type="RangeControl"
                                                            slug="translateZ"
                                                            units={['px', 'em', 'rem']}
                                                        />
                                                    )}
                                                </BlockishDropdown>
                                            )
                                        },
                                        {
                                            slug: 'skew',
                                            label: __('Skew', 'blockish'),
                                            hasValue: () => hasValue('skewX') || hasValue('skewY'),
                                            onDeselect: () => {
                                                setAttributes({
                                                    skewX: undefined,
                                                    skewY: undefined,
                                                });
                                            },
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Skew', 'blockish')}>
                                                    <BlockishResponsiveControl
                                                        label={__('Skew X', 'blockish')}
                                                        left='45px'
                                                        type="RangeControl"
                                                        slug="skewX"
                                                        min={-60}
                                                        max={60}
                                                        step={1}
                                                    />
                                                    <BlockishResponsiveControl
                                                        label={__('Skew Y', 'blockish')}
                                                        left='45px'
                                                        type="RangeControl"
                                                        slug="skewY"
                                                        min={-60}
                                                        max={60}
                                                        step={1}
                                                    />
                                                </BlockishDropdown>
                                            )
                                        },
                                        {
                                            slug: 'transformOrigin',
                                            label: __('Transform Origin', 'blockish'),
                                            hasValue: () => hasValue('transformOrigin') || hasValue('transformOriginX') || hasValue('transformOriginY'),
                                            onDeselect: () => {
                                                setAttributes({
                                                    transformOrigin: undefined,
                                                    transformOriginX: undefined,
                                                    transformOriginY: undefined,
                                                });
                                            },
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Transform Origin', 'blockish')}>
                                                    <BlockishControl
                                                        label={__('Transform Origin', 'blockish')}
                                                        type="SelectControl"
                                                        slug="transformOrigin"
                                                        options={[
                                                            { label: __('Top Left', 'blockish'), value: 'top left' },
                                                            { label: __('Top Center', 'blockish'), value: 'top center' },
                                                            { label: __('Top Right', 'blockish'), value: 'top right' },
                                                            { label: __('Center Left', 'blockish'), value: 'center left' },
                                                            { label: __('Center', 'blockish'), value: 'center center' },
                                                            { label: __('Center Right', 'blockish'), value: 'center right' },
                                                            { label: __('Bottom Left', 'blockish'), value: 'bottom left' },
                                                            { label: __('Bottom Center', 'blockish'), value: 'bottom center' },
                                                            { label: __('Bottom Right', 'blockish'), value: 'bottom right' },
                                                            { label: __('Custom', 'blockish'), value: 'custom' },
                                                        ]}
                                                    />

                                                    {attributes?.transformOrigin === 'custom' && (
                                                        <>
                                                            <BlockishResponsiveControl
                                                                label={__('Origin X', 'blockish')}
                                                                left='52px'
                                                                type="RangeControl"
                                                                slug="transformOriginX"
                                                                units={['px', '%', 'em', 'rem']}
                                                            />
                                                            <BlockishResponsiveControl
                                                                label={__('Origin Y', 'blockish')}
                                                                left='52px'
                                                                type="RangeControl"
                                                                slug="transformOriginY"
                                                                units={['px', '%', 'em', 'rem']}
                                                            />
                                                        </>
                                                    )}
                                                </BlockishDropdown>
                                            )
                                        },
                                        {
                                            slug: 'perspective',
                                            label: __('Perspective', 'blockish'),
                                            hasValue: () => hasValue('perspective'),
                                            onDeselect: () => setAttributes({ perspective: undefined }),
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Perspective', 'blockish')}>
                                                    <BlockishResponsiveControl
                                                        label={__('Perspective', 'blockish')}
                                                        left='76px'
                                                        type="RangeControl"
                                                        slug="perspective"
                                                        min={0}
                                                        max={2000}
                                                        step={10}
                                                        help={__('Adds depth to 3D transforms', 'blockish')}
                                                    />
                                                </BlockishDropdown>
                                            )
                                        }
                                    ]}
                                />
                            </>
                        )}

                        {tabName === 'transform-hover' && (
                            <>
                                <BlockishToolsPanel
                                    label={__('Transform', 'blockish')}
                                    resetAll={resetAllHover}
                                    dropdownMenuProps={{
                                        popoverProps: {
                                            placement: 'left-center',
                                            shift: true,
                                            offset: 230
                                        }
                                    }}
                                    items={[
                                        {
                                            slug: 'rotateHover',
                                            label: __('Rotate', 'blockish'),
                                            hasValue: () => hasValue('rotateZHover') || hasValue('rotate3DHover') || hasValue('rotateXHover') || hasValue('rotateYHover'),
                                            onDeselect: () => {
                                                setAttributes({
                                                    rotateZHover: undefined,
                                                    rotate3DHover: undefined,
                                                    rotateXHover: undefined,
                                                    rotateYHover: undefined,
                                                });
                                            },
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Rotate', 'blockish')}>
                                                    <BlockishResponsiveControl
                                                        label={__('Rotate', 'blockish')}
                                                        left='44px'
                                                        type="RangeControl"
                                                        slug="rotateZHover"
                                                        min={-360}
                                                        max={360}
                                                        step={1}
                                                    />

                                                    <BlockishControl
                                                        label={__('3D Rotation', 'blockish')}
                                                        type="BlockishToggle"
                                                        slug="rotate3DHover"
                                                    />

                                                    {attributes?.rotate3DHover && (
                                                        <>
                                                            <BlockishResponsiveControl
                                                                label={__('Rotate X', 'blockish')}
                                                                left='55px'
                                                                type="RangeControl"
                                                                slug="rotateXHover"
                                                                min={-360}
                                                                max={360}
                                                                step={1}
                                                            />
                                                            <BlockishResponsiveControl
                                                                label={__('Rotate Y', 'blockish')}
                                                                left='55px'
                                                                type="RangeControl"
                                                                slug="rotateYHover"
                                                                min={-360}
                                                                max={360}
                                                                step={1}
                                                            />
                                                        </>
                                                    )}
                                                </BlockishDropdown>
                                            )
                                        },
                                        {
                                            slug: 'scaleHover',
                                            label: __('Scale', 'blockish'),
                                            hasValue: () => hasValue('scaleHover') || hasValue('scaleSeparateHover') || hasValue('scaleXHover') || hasValue('scaleYHover'),
                                            onDeselect: () => {
                                                setAttributes({
                                                    scaleHover: undefined,
                                                    scaleSeparateHover: undefined,
                                                    scaleXHover: undefined,
                                                    scaleYHover: undefined,
                                                });
                                            },
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Scale', 'blockish')}>
                                                    <BlockishResponsiveControl
                                                        label={__('Scale', 'blockish')}
                                                        left='36px'
                                                        type="RangeControl"
                                                        slug="scaleHover"
                                                        min={0.1}
                                                        max={3}
                                                        step={0.1}
                                                    />

                                                    <BlockishControl
                                                        label={__('Separate X & Y Scale', 'blockish')}
                                                        type="BlockishToggle"
                                                        slug="scaleSeparateHover"
                                                    />

                                                    {attributes?.scaleSeparateHover && (
                                                        <>
                                                            <BlockishResponsiveControl
                                                                label={__('Scale X', 'blockish')}
                                                                left='48px'
                                                                type="RangeControl"
                                                                slug="scaleXHover"
                                                                min={0.1}
                                                                max={3}
                                                                step={0.1}
                                                            />
                                                            <BlockishResponsiveControl
                                                                label={__('Scale Y', 'blockish')}
                                                                left='48px'
                                                                type="RangeControl"
                                                                slug="scaleYHover"
                                                                min={0.1}
                                                                max={3}
                                                                step={0.1}
                                                            />
                                                        </>
                                                    )}
                                                </BlockishDropdown>
                                            )
                                        },
                                        {
                                            slug: 'translateHover',
                                            label: __('Translate', 'blockish'),
                                            hasValue: () => hasValue('translateXHover') || hasValue('translateYHover') || hasValue('translate3DHover') || hasValue('translateZHover'),
                                            onDeselect: () => {
                                                setAttributes({
                                                    translateXHover: undefined,
                                                    translateYHover: undefined,
                                                    translate3DHover: undefined,
                                                    translateZHover: undefined,
                                                });
                                            },
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Translate', 'blockish')}>
                                                    <BlockishResponsiveControl
                                                        label={__('Translate X', 'blockish')}
                                                        left='77px'
                                                        type="RangeControl"
                                                        slug="translateXHover"
                                                        units={['px', '%', 'em', 'rem']}
                                                    />
                                                    <BlockishResponsiveControl
                                                        label={__('Translate Y', 'blockish')}
                                                        left='77px'
                                                        type="RangeControl"
                                                        slug="translateYHover"
                                                        units={['px', '%', 'em', 'rem']}
                                                    />

                                                    <BlockishControl
                                                        label={__('3D Translate', 'blockish')}
                                                        type="BlockishToggle"
                                                        slug="translate3DHover"
                                                    />

                                                    {attributes?.translate3DHover && (
                                                        <BlockishResponsiveControl
                                                            label={__('Translate Z', 'blockish')}
                                                            left='77px'
                                                            type="RangeControl"
                                                            slug="translateZHover"
                                                            units={['px', 'em', 'rem']}
                                                        />
                                                    )}
                                                </BlockishDropdown>
                                            )
                                        },
                                        {
                                            slug: 'skewHover',
                                            label: __('Skew', 'blockish'),
                                            hasValue: () => hasValue('skewXHover') || hasValue('skewYHover'),
                                            onDeselect: () => {
                                                setAttributes({
                                                    skewXHover: undefined,
                                                    skewYHover: undefined,
                                                });
                                            },
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Skew', 'blockish')}>
                                                    <BlockishResponsiveControl
                                                        label={__('Skew X', 'blockish')}
                                                        left='45px'
                                                        type="RangeControl"
                                                        slug="skewXHover"
                                                        min={-60}
                                                        max={60}
                                                        step={1}
                                                    />
                                                    <BlockishResponsiveControl
                                                        label={__('Skew Y', 'blockish')}
                                                        left='45px'
                                                        type="RangeControl"
                                                        slug="skewYHover"
                                                        min={-60}
                                                        max={60}
                                                        step={1}
                                                    />
                                                </BlockishDropdown>
                                            )
                                        },
                                        {
                                            slug: 'transformOriginHover',
                                            label: __('Transform Origin', 'blockish'),
                                            hasValue: () => hasValue('transformOriginHover') || hasValue('transformOriginXHover') || hasValue('transformOriginYHover'),
                                            onDeselect: () => {
                                                setAttributes({
                                                    transformOriginHover: undefined,
                                                    transformOriginXHover: undefined,
                                                    transformOriginYHover: undefined,
                                                });
                                            },
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Transform Origin', 'blockish')}>
                                                    <BlockishControl
                                                        label={__('Transform Origin', 'blockish')}
                                                        type="SelectControl"
                                                        slug="transformOriginHover"
                                                        options={[
                                                            { label: __('Top Left', 'blockish'), value: 'top left' },
                                                            { label: __('Top Center', 'blockish'), value: 'top center' },
                                                            { label: __('Top Right', 'blockish'), value: 'top right' },
                                                            { label: __('Center Left', 'blockish'), value: 'center left' },
                                                            { label: __('Center', 'blockish'), value: 'center center' },
                                                            { label: __('Center Right', 'blockish'), value: 'center right' },
                                                            { label: __('Bottom Left', 'blockish'), value: 'bottom left' },
                                                            { label: __('Bottom Center', 'blockish'), value: 'bottom center' },
                                                            { label: __('Bottom Right', 'blockish'), value: 'bottom right' },
                                                            { label: __('Custom', 'blockish'), value: 'custom' },
                                                        ]}
                                                    />

                                                    {attributes?.transformOriginHover === 'custom' && (
                                                        <>
                                                            <BlockishResponsiveControl
                                                                label={__('Origin X', 'blockish')}
                                                                left='52px'
                                                                type="RangeControl"
                                                                slug="transformOriginXHover"
                                                                units={['px', '%', 'em', 'rem']}
                                                            />
                                                            <BlockishResponsiveControl
                                                                label={__('Origin Y', 'blockish')}
                                                                left='52px'
                                                                type="RangeControl"
                                                                slug="transformOriginYHover"
                                                                units={['px', '%', 'em', 'rem']}
                                                            />
                                                        </>
                                                    )}
                                                </BlockishDropdown>
                                            )
                                        },
                                        {
                                            slug: 'perspectiveHover',
                                            label: __('Perspective', 'blockish'),
                                            hasValue: () => hasValue('perspectiveHover'),
                                            onDeselect: () => setAttributes({ perspectiveHover: undefined }),
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Perspective', 'blockish')}>
                                                    <BlockishResponsiveControl
                                                        label={__('Perspective', 'blockish')}
                                                        left='76px'
                                                        type="RangeControl"
                                                        slug="perspectiveHover"
                                                        min={0}
                                                        max={2000}
                                                        step={10}
                                                        help={__('Adds depth to 3D transforms', 'blockish')}
                                                    />
                                                </BlockishDropdown>
                                            )
                                        },
                                        {
                                            slug: 'transformTransitionDuration',
                                            label: __('Transition Duration', 'blockish'),
                                            hasValue: () => hasValue('transformTransitionDuration'),
                                            onDeselect: () => setAttributes({ transformTransitionDuration: undefined }),
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishDropdown label={__('Transition Duration', 'blockish')}>
                                                    <BlockishControl
                                                        label={__('Transition Duration', 'blockish')}
                                                        type="RangeControl"
                                                        slug="transformTransitionDuration"
                                                        min="0"
                                                        max="3"
                                                        step="0.1"
                                                        help={__('Smooth animation speed (seconds)', 'blockish')}
                                                    />
                                                </BlockishDropdown>
                                            )
                                        },
                                    ]}
                                />
                            </>
                        )}
                    </>
                )}
            </BlockishControl>
        </BlockishControl>
    );
};

export default memo(Transform);