import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

const Inspector = ({ attributes, advancedControls }) => {
    const {
        BlockishControl,
        BlockishResponsiveControl,
        BlockishGroupControl
    } = window?.blockish?.controls;

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
                                    <BlockishControl type="BlockishPanelBody" title={__('Icon', 'blockish')} initialOpen={true}>
                                        <BlockishGroupControl
                                            type="BlockishTypography"
                                            label={__('Typography', 'blockish')}
                                            slug="text"
                                        />
                                        <BlockishControl
                                            type="BlockishIconPicker"
                                            label={__('Icon', 'blockish')}
                                            slug="icon"
                                        />
                                        <BlockishControl
                                            type="BlockishLink"
                                            label={__('Link', 'blockish')}
                                            slug="link"
                                        />
                                        <BlockishResponsiveControl
                                            type="BlockishToggleGroup"
                                            label={__('Alignment', 'blockish')}
                                            slug="alignment"
                                            left="65px"
                                            options={[
                                                { value: 'left', label: __('Left', 'blockish') },
                                                { value: 'center', label: __('Center', 'blockish') },
                                                { value: 'right', label: __('Right', 'blockish') },
                                            ]}
                                        />
                                    </BlockishControl>
                                </>
                            )
                        }
                        {
                            tabName === 'style' && (
                                <>
                                    <BlockishControl type="BlockishPanelBody" title={__('Icon', 'blockish')} initialOpen={true}>
                                        <BlockishResponsiveControl
                                            type="BlockishRangeUnit"
                                            label={__('Size', 'blockish')}
                                            slug="size"
                                            left="25px"
                                            units={{
                                                "px": {
                                                    min: 0,
                                                    max: 200
                                                },
                                                "rem": {
                                                    min: 0,
                                                    max: 50
                                                },
                                                "em": {
                                                    min: 0,
                                                    max: 50
                                                },
                                            }}
                                        />

                                        <BlockishControl
                                            type="BlockishTab"
                                            tabs={[
                                                {
                                                    name: 'icon-normal',
                                                    title: 'Normal'
                                                },
                                                {
                                                    name: 'icon-hover',
                                                    title: 'Hover'
                                                }
                                            ]}
                                        >
                                            {({ name }) => (
                                                <>
                                                    {
                                                        name === 'icon-normal' && (
                                                            <>
                                                                <BlockishControl
                                                                    type="BlockishColor"
                                                                    label={__('Color', 'blockish')}
                                                                    slug="color"
                                                                />
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        name === 'icon-hover' && (
                                                            <>
                                                                <BlockishControl
                                                                    type="BlockishColor"
                                                                    label={__('Hover Color', 'blockish')}
                                                                    slug="hoverColor"
                                                                />
                                                            </>
                                                        )
                                                    }
                                                </>
                                            )}
                                        </BlockishControl>
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