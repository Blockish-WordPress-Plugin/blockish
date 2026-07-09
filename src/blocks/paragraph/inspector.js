import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ({ advancedControls }) => {
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
                                    <BlockishControl type="BlockishPanelBody" title={__('Paragraph', 'blockish')} initialOpen={true}>
                                        <BlockishControl
                                            type="BlockishLink"
                                            label={__('Link', 'blockish')}
                                            slug="url"
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
                                    <BlockishControl type="BlockishPanelBody" title={__('Heading', 'blockish')} initialOpen={true}>
                                        <BlockishControl
                                            type="BlockishTypography"
                                            label={__('Typography', 'blockish')}
                                            slug="typography"
                                        />

                                        <BlockishControl
                                            type="BlockishTab"
                                            tabs={[
                                                {
                                                    name: 'heading-normal',
                                                    title: 'Normal'
                                                },
                                                {
                                                    name: 'heading-hover',
                                                    title: 'Hover'
                                                }
                                            ]}
                                        >
                                            {({ name }) => (
                                                <>
                                                    {
                                                        name === 'heading-normal' && (
                                                            <>
                                                                <BlockishControl
                                                                    type="BlockishColor"
                                                                    label={__('Color', 'blockish')}
                                                                    slug="color"
                                                                />
                                                                <BlockishGroupControl
                                                                    type="BlockishBoxShadow"
                                                                    label={__('Text Shadow', 'blockish')}
                                                                    slug="textShadow"
                                                                    exclude={['inset', 'spread']}
                                                                />
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        name === 'heading-hover' && (
                                                            <>
                                                                <BlockishControl
                                                                    type="BlockishColor"
                                                                    label={__('Hover Color', 'blockish')}
                                                                    slug="hoverColor"
                                                                />
                                                                <BlockishGroupControl
                                                                    type="BlockishBoxShadow"
                                                                    label={__('Text Shadow', 'blockish')}
                                                                    slug="textShadowHover"
                                                                    exclude={['inset', 'spread']}
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
