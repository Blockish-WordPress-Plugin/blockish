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
                                    <BlockishControl type="BlockishPanelBody" title={__('Heading', 'blockish')} initialOpen={true}>
                                        <BlockishControl
                                            type="BlockishSelect"
                                            label={__('HTML Tag', 'blockish')}
                                            slug="tag"
                                            options={[
                                                { value: 'h1', label: __('H1', 'blockish') },
                                                { value: 'h2', label: __('H2', 'blockish') },
                                                { value: 'h3', label: __('H3', 'blockish') },
                                                { value: 'h4', label: __('H4', 'blockish') },
                                                { value: 'h5', label: __('H5', 'blockish') },
                                                { value: 'h6', label: __('H6', 'blockish') },
                                                { value: 'p', label: __('P', 'blockish') },
                                                { value: 'span', label: __('Span', 'blockish') },
                                                { value: 'div', label: __('Div', 'blockish') },
                                            ]}
                                            __nextHasNoMarginBottom={true}
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
