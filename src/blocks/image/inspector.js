import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

const Inspector = ({ attributes, setAttributes, advancedControls }) => {
    const {
        BlockishControl,
        BlockishResponsiveControl,
        BlockishGroupControl
    } = window?.blockish?.controls;
    const { useDeviceType } = window?.blockish?.helpers;

    const device = useDeviceType();

    const { imageSizes } = useSelect((select) => {
        const settings = select('core/block-editor').getSettings();
        return {
            imageSizes: Object.entries(settings?.imageSizes || {}).map(([key, value]) => {
                return {
                    value: value?.slug,
                    label: value?.name
                }
            })
        }
    }, []);

    return (
        <InspectorControls>
            <BlockishControl
                type="BlockishTab"
                tabType="top-level"
                tabs={[
                    {
                        name: 'content',
                        title: 'Content'
                    },
                    {
                        name: 'style',
                        title: 'Style'
                    },
                    {
                        name: 'advanced',
                        title: 'Advanced'
                    }
                ]}
            >
                {({ name: tabName }) => (
                    <>
                        {
                            tabName === 'content' && (
                                <>
                                    <BlockishControl type="BlockishPanelBody" title={__('Content', 'blockish')} initialOpen={true}>
                                        {
                                            attributes?.image?.id && (
                                                <>
                                                    <BlockishControl
                                                        type="BlockishMediaUploader"
                                                        label={__('Image', 'blockish')}
                                                        slug="image"
                                                    />
                                                    <BlockishControl
                                                        label={__('Image Size', 'blockish')}
                                                        slug="imageSize"
                                                        type="BlockishSelect"
                                                        options={imageSizes}
                                                        value={attributes?.imageSize}
                                                        onChange={(newValue) => {
                                                            setAttributes({ imageSize: newValue });
                                                        }}
                                                    />
                                                </>
                                            )
                                        }
                                        {
                                            !attributes?.image?.id && attributes?.image?.url && (
                                                <BlockishControl
                                                    label={__('Image URL', 'blockish')}
                                                    slug="imageURL"
                                                    type="TextControl"
                                                    value={attributes?.image?.url}
                                                    onChange={(newValue) => {
                                                        setAttributes({ image: { url: newValue } });
                                                    }}
                                                />
                                            )
                                        }

                                        {
                                            attributes?.image?.url && (
                                                <>
                                                    <BlockishControl
                                                        label={__('Alt Text', 'blockish')}
                                                        slug="altText"
                                                        type="TextControl"
                                                        value={attributes?.alt || attributes?.image?.alt}
                                                        onChange={(newValue) => {
                                                            setAttributes({
                                                                alt: newValue
                                                            });
                                                        }}
                                                    />
                                                    <BlockishControl
                                                        label={__('Title', 'blockish')}
                                                        slug="title"
                                                        type="TextControl"
                                                        value={attributes?.title || attributes?.image?.title}
                                                        onChange={(newValue) => {
                                                            setAttributes({
                                                                title: newValue
                                                            });
                                                        }}
                                                    />
                                                    <BlockishControl
                                                        label={__('Caption Type', 'blockish')}
                                                        slug="captionType"
                                                        type="SelectControl"
                                                        options={[
                                                            { label: __('None', 'blockish'), value: 'none' },
                                                            { label: __('Attachment Caption', 'blockish'), value: 'attachment' },
                                                            { label: __('Custom Caption', 'blockish'), value: 'custom' },
                                                        ]}
                                                    />
                                                    {
                                                        attributes?.captionType === 'custom' && (
                                                            <BlockishControl
                                                                label={__('Caption', 'blockish')}
                                                                slug="customCaption"
                                                                type="TextControl"
                                                            />
                                                        )
                                                    }
                                                </>
                                            )
                                        }
                                    </BlockishControl>
                                </>
                            )
                        }
                        {
                            tabName === 'style' && (
                                <>
                                    <BlockishControl type="BlockishPanelBody" title={__('Image', 'blockish')} initialOpen={true}>
                                        <BlockishResponsiveControl
                                            left='66px'
                                            type="BlockishToggleGroup"
                                            label={__('Alignment', 'blockish')}
                                            slug="alignment"
                                            options={[
                                                { label: __('Left', 'blockish'), value: 'left' },
                                                { label: __('Center', 'blockish'), value: 'center' },
                                                { label: __('Right', 'blockish'), value: 'right' },
                                            ]}
                                        />
                                        <BlockishResponsiveControl
                                            left='39px'
                                            type="BlockishRangeUnit"
                                            label={__('Width', 'blockish')}
                                            slug="imageWidth"
                                        />
                                        <BlockishResponsiveControl
                                            left='66px'
                                            type="BlockishRangeUnit"
                                            label={__('Max Width', 'blockish')}
                                            slug="imageMaxWidth"
                                        />
                                        <BlockishResponsiveControl
                                            left='42px'
                                            type="BlockishRangeUnit"
                                            label={__('Height', 'blockish')}
                                            slug="imageHeight"
                                        />
                                        {
                                            attributes?.imageHeight?.[device] && (
                                                <BlockishResponsiveControl
                                                    left='64px'
                                                    type="BlockishSelect"
                                                    label={__('Object Fit', 'blockish')}
                                                    slug="objectFit"
                                                    options={[
                                                        { label: __('None', 'blockish'), value: 'none' },
                                                        { label: __('Fill', 'blockish'), value: 'fill' },
                                                        { label: __('Cover', 'blockish'), value: 'cover' },
                                                        { label: __('Contain', 'blockish'), value: 'contain' },
                                                    ]}
                                                />
                                            )
                                        }
                                        <BlockishControl
                                            type="BlockishTab"
                                            tabType="normal"
                                            tabs={[
                                                {
                                                    name: 'imageNormal',
                                                    title: 'Normal'
                                                },
                                                {
                                                    name: 'imageHover',
                                                    title: 'Hover'
                                                }
                                            ]}
                                        >
                                            {({ name: imageTab }) => (
                                                <>
                                                    {
                                                        imageTab === 'imageNormal' && (
                                                            <>
                                                                <BlockishControl
                                                                    type="BlockishRangeControl"
                                                                    label={__('Opacity', 'blockish')}
                                                                    slug="imageOpacityNormal"
                                                                />
                                                                <BlockishGroupControl
                                                                    type="BlockishBorder"
                                                                    label={__('Border', 'blockish')}
                                                                    slug="imageBorderNormal"
                                                                />
                                                                <BlockishResponsiveControl
                                                                    type="BlockishBorderRadius"
                                                                    label={__('Border Radius', 'blockish')}
                                                                    slug="imageBorderRadiusNormal"
                                                                    left="44px"
                                                                />
                                                                <BlockishGroupControl
                                                                    type="BlockishBoxShadow"
                                                                    label={__('Box Shadow', 'blockish')}
                                                                    slug="imageBoxShadowNormal"
                                                                />
                                                                <BlockishGroupControl
                                                                    type="BlockishCSSFilters"
                                                                    label={__('CSS Filters', 'blockish')}
                                                                    slug="imageCSSFiltersNormal"
                                                                />
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        imageTab === 'imageHover' && (
                                                            <>
                                                                <BlockishControl
                                                                    type="BlockishRangeControl"
                                                                    label={__('Opacity', 'blockish')}
                                                                    slug="imageOpacityHover"
                                                                />
                                                                <BlockishGroupControl
                                                                    type="BlockishBorder"
                                                                    label={__('Border', 'blockish')}
                                                                    slug="imageBorderHover"
                                                                />
                                                                <BlockishResponsiveControl
                                                                    type="BlockishBorderRadius"
                                                                    label={__('Border Radius', 'blockish')}
                                                                    slug="imageBorderRadiusHover"
                                                                    left="44px"
                                                                />
                                                                <BlockishGroupControl
                                                                    type="BlockishBoxShadow"
                                                                    label={__('Box Shadow', 'blockish')}
                                                                    slug="imageBoxShadowHover"
                                                                />
                                                                <BlockishGroupControl
                                                                    type="BlockishCSSFilters"
                                                                    label={__('CSS Filters', 'blockish')}
                                                                    slug="imageCSSFiltersHover"
                                                                />
                                                            </>
                                                        )
                                                    }
                                                </>
                                            )}
                                        </BlockishControl>
                                    </BlockishControl>
                                    <BlockishControl type="BlockishPanelBody" title={__('Caption', 'blockish')}>
                                        <BlockishResponsiveControl
                                            left="8ch"
                                            type="BlockishToggleGroup"
                                            label={__('Alignment', 'blockish')}
                                            slug="captionAlignment"
                                            options={[
                                                {
                                                    label: __('Left', 'blockish'),
                                                    value: 'left',
                                                },
                                                {
                                                    label: __('Center', 'blockish'),
                                                    value: 'center',
                                                },
                                                {
                                                    label: __('Right', 'blockish'),
                                                    value: 'right',
                                                },
                                            ]}
                                        />
                                        <BlockishControl 
                                            type="BlockishColor"
                                            label={__('Color', 'blockish')}
                                            slug="captionColor"
                                        />
                                        <BlockishControl 
                                            type="BlockishColor"
                                            label={__('Background Color', 'blockish')}
                                            slug="captionBackgroundColor"
                                        />
                                        <BlockishGroupControl 
                                            type="BlockishTypography"
                                            label={__('Typography', 'blockish')}
                                            slug="captionTypography"
                                        />
                                        <BlockishGroupControl 
                                            type="BlockishBoxShadow"
                                            label={__('Text Shadow', 'blockish')}
                                            slug="captionTextShadow"
                                            exclude={['inset', 'spread']}
                                        />
                                        <BlockishResponsiveControl
                                            left="6ch"
                                            type="BlockishRangeUnit"
                                            label={__('Spacing', 'blockish')}
                                            slug="captionSpacing"
                                        />
                                    </BlockishControl>
                                </>
                            )
                        }
                        {
                            tabName === 'advanced' && (
                                advancedControls
                            )
                        }
                    </>
                )}
            </BlockishControl>
        </InspectorControls>
    )
}
export default memo(Inspector);
