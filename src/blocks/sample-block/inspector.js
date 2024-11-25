import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { memo } from '@wordpress/element';
import BoilerplateTextareaControl from '../../components/textarea-control';
const Inspector = ({ advancedControls }) => {
    const {
        BoilerplateControl,
        BoilerplateResponsiveControl,
    } = window?.boilerplateBlocks?.controls;

    return (
        <InspectorControls>
            <BoilerplateControl
                type="BoilerplateTab"
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
                                <BoilerplateControl type="BoilerplatePanelBody" title={__('Content', 'boilerplate-blocks')}>
                                    <BoilerplateTextareaControl/>
                                    <BoilerplateControl
                                        type="SelectControl"
                                        label={__('Tag', 'boilerplate-blocks')}
                                        slug="tag"
                                        options={[
                                            {
                                                label: 'H1',
                                                value: 'h1'
                                            },
                                            {
                                                label: 'H2',
                                                value: 'h2'
                                            },
                                            {
                                                label: 'H3',
                                                value: 'h3'
                                            },
                                            {
                                                label: 'H4',
                                                value: 'h4'
                                            },
                                            {
                                                label: 'H5',
                                                value: 'h5'
                                            },
                                            {
                                                label: 'H6',
                                                value: 'h6'
                                            },
                                            {
                                                label: 'P',
                                                value: 'p'
                                            }
                                        ]}
                                    />
                                    <BoilerplateResponsiveControl
                                        type="BoilerplateToggleGroup"
                                        slug="alignment"
                                        label={__('Alignment', 'boilerplate-blocks')}
                                        options={[
                                            {
                                                label: 'Left',
                                                value: 'left'
                                            },
                                            {
                                                label: 'Center',
                                                value: 'center'
                                            },
                                            {
                                                label: 'Right',
                                                value: 'right'
                                            }
                                        ]}
                                    />
                                </BoilerplateControl>
                            )
                        }
                        {
                            tabName === 'style' && (
                                <BoilerplateControl type="BoilerplatePanelBody" title={__('Style', 'boilerplate-blocks')}>
                                    <BoilerplateControl
                                        type="BoilerplateColor"
                                        slug="textColor"
                                        label={__('Text Color', 'boilerplate-blocks')}
                                    />
                                    <BoilerplateControl
                                        type="BoilerplateFontSizePicker"
                                        slug="fontSize"
                                        label={__('Font Size', 'boilerplate-blocks')}
                                    />
                                </BoilerplateControl>
                            )
                        }
                         {
                            tabName === 'advanced' && (
                                advancedControls
                            )
                        }
                    </>
                )}
            </BoilerplateControl>
        </InspectorControls>
    )
}
export default memo(Inspector);