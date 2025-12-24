import { __ } from '@wordpress/i18n';
import { memo } from '@wordpress/element';

const Transform = ({ attributes, setAttributes }) => {
    const { BlockishControl, BlockishResponsiveControl } = window?.blockish?.controls;
    const { BlockishToolsPanel } = window.blockish.components;

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
                                                    <BlockishResponsiveControl
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
                                                                type="RangeControl"
                                                                slug="rotateX"
                                                                min={-360}
                                                                max={360}
                                                                step={1}
                                                            />
                                                            <BlockishResponsiveControl
                                                                label={__('Rotate Y', 'blockish')}
                                                                type="RangeControl"
                                                                slug="rotateY"
                                                                min={-360}
                                                                max={360}
                                                                step={1}
                                                            />
                                                        </>
                                                    )}
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
                                                <>
                                                    <BlockishResponsiveControl
                                                        label={__('Scale', 'blockish')}
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
                                                                type="RangeControl"
                                                                slug="scaleX"
                                                                min={0.1}
                                                                max={3}
                                                                step={0.1}
                                                            />
                                                            <BlockishResponsiveControl
                                                                label={__('Scale Y', 'blockish')}
                                                                type="RangeControl"
                                                                slug="scaleY"
                                                                min={0.1}
                                                                max={3}
                                                                step={0.1}
                                                            />
                                                        </>
                                                    )}
                                                </>
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
                                                <>
                                                    <BlockishResponsiveControl
                                                        label={__('Translate X', 'blockish')}
                                                        type="RangeControl"
                                                        slug="translateX"
                                                        units={['px', '%', 'em', 'rem']}
                                                    />
                                                    <BlockishResponsiveControl
                                                        label={__('Translate Y', 'blockish')}
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
                                                            type="RangeControl"
                                                            slug="translateZ"
                                                            units={['px', 'em', 'rem']}
                                                        />
                                                    )}
                                                </>
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
                                                <>
                                                    <BlockishResponsiveControl
                                                        label={__('Skew X', 'blockish')}
                                                        type="RangeControl"
                                                        slug="skewX"
                                                        min={-60}
                                                        max={60}
                                                        step={1}
                                                    />
                                                    <BlockishResponsiveControl
                                                        label={__('Skew Y', 'blockish')}
                                                        type="RangeControl"
                                                        slug="skewY"
                                                        min={-60}
                                                        max={60}
                                                        step={1}
                                                    />
                                                </>
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
                                                <>
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
                                                                type="RangeControl"
                                                                slug="transformOriginX"
                                                                units={['px', '%', 'em', 'rem']}
                                                            />
                                                            <BlockishResponsiveControl
                                                                label={__('Origin Y', 'blockish')}
                                                                type="RangeControl"
                                                                slug="transformOriginY"
                                                                units={['px', '%', 'em', 'rem']}
                                                            />
                                                        </>
                                                    )}
                                                </>
                                            )
                                        },
                                        {
                                            slug: 'perspective',
                                            label: __('Perspective', 'blockish'),
                                            hasValue: () => hasValue('perspective'),
                                            onDeselect: () => setAttributes({ perspective: undefined }),
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishResponsiveControl
                                                    label={__('Perspective', 'blockish')}
                                                    type="RangeControl"
                                                    slug="perspective"
                                                    min={0}
                                                    max={2000}
                                                    step={10}
                                                    help={__('Adds depth to 3D transforms', 'blockish')}
                                                />
                                            )
                                        },
                                        {
                                            slug: 'transformTransitionDuration',
                                            label: __('Transition Duration', 'blockish'),
                                            hasValue: () => hasValue('transformTransitionDuration'),
                                            onDeselect: () => setAttributes({ transformTransitionDuration: undefined }),
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishControl
                                                    label={__('Transition Duration', 'blockish')}
                                                    type="RangeControl"
                                                    slug="transformTransitionDuration"
                                                    min={0}
                                                    max={5}
                                                    step={0.1}
                                                    help={__('Smooth animation speed (seconds)', 'blockish')}
                                                />
                                            )
                                        },
                                    ]}
                                />
                            </>
                        )}

                        {tabName === 'transform-hover' && (
                            <>
                                <BlockishToolsPanel
                                    label={__('Transform', 'blockish')}
                                    resetAll={resetAllHover}
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
                                                <>
                                                    <BlockishResponsiveControl
                                                        label={__('Rotate', 'blockish')}
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
                                                                type="RangeControl"
                                                                slug="rotateXHover"
                                                                min={-360}
                                                                max={360}
                                                                step={1}
                                                            />
                                                            <BlockishResponsiveControl
                                                                label={__('Rotate Y', 'blockish')}
                                                                type="RangeControl"
                                                                slug="rotateYHover"
                                                                min={-360}
                                                                max={360}
                                                                step={1}
                                                            />
                                                        </>
                                                    )}
                                                </>
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
                                                <>
                                                    <BlockishResponsiveControl
                                                        label={__('Scale', 'blockish')}
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
                                                                type="RangeControl"
                                                                slug="scaleXHover"
                                                                min={0.1}
                                                                max={3}
                                                                step={0.1}
                                                            />
                                                            <BlockishResponsiveControl
                                                                label={__('Scale Y', 'blockish')}
                                                                type="RangeControl"
                                                                slug="scaleYHover"
                                                                min={0.1}
                                                                max={3}
                                                                step={0.1}
                                                            />
                                                        </>
                                                    )}
                                                </>
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
                                                <>
                                                    <BlockishResponsiveControl
                                                        label={__('Translate X', 'blockish')}
                                                        type="RangeControl"
                                                        slug="translateXHover"
                                                        units={['px', '%', 'em', 'rem']}
                                                    />
                                                    <BlockishResponsiveControl
                                                        label={__('Translate Y', 'blockish')}
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
                                                            type="RangeControl"
                                                            slug="translateZHover"
                                                            units={['px', 'em', 'rem']}
                                                        />
                                                    )}
                                                </>
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
                                                <>
                                                    <BlockishResponsiveControl
                                                        label={__('Skew X', 'blockish')}
                                                        type="RangeControl"
                                                        slug="skewXHover"
                                                        min={-60}
                                                        max={60}
                                                        step={1}
                                                    />
                                                    <BlockishResponsiveControl
                                                        label={__('Skew Y', 'blockish')}
                                                        type="RangeControl"
                                                        slug="skewYHover"
                                                        min={-60}
                                                        max={60}
                                                        step={1}
                                                    />
                                                </>
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
                                                <>
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
                                                                type="RangeControl"
                                                                slug="transformOriginXHover"
                                                                units={['px', '%', 'em', 'rem']}
                                                            />
                                                            <BlockishResponsiveControl
                                                                label={__('Origin Y', 'blockish')}
                                                                type="RangeControl"
                                                                slug="transformOriginYHover"
                                                                units={['px', '%', 'em', 'rem']}
                                                            />
                                                        </>
                                                    )}
                                                </>
                                            )
                                        },
                                        {
                                            slug: 'perspectiveHover',
                                            label: __('Perspective', 'blockish'),
                                            hasValue: () => hasValue('perspectiveHover'),
                                            onDeselect: () => setAttributes({ perspectiveHover: undefined }),
                                            isShownByDefault: false,
                                            children: (
                                                <BlockishResponsiveControl
                                                    label={__('Perspective', 'blockish')}
                                                    type="RangeControl"
                                                    slug="perspectiveHover"
                                                    min={0}
                                                    max={2000}
                                                    step={10}
                                                    help={__('Adds depth to 3D transforms', 'blockish')}
                                                />
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