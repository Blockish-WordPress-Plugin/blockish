import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
const Background = ({ name }) => {
    const { BlockishControl, BlockishGroupControl } = window?.blockish?.controls;
    const backgroundExcludes = applyFilters('blockish.advancedControl.background.exclude', new Set([]));

    if (backgroundExcludes.has(name)) return null;

    return (
        <BlockishControl type="BlockishPanelBody" title={__('Background', 'blockish')} indicatorSlugs={['background', 'backgroundHover', 'backgroundHoverTransition']}>
            <BlockishControl
                type="BlockishTab"
                tabs={[
                    {
                        name: 'normal',
                        title: 'Normal'
                    },
                    {
                        name: 'hover',
                        title: 'Hover'
                    }
                ]}
            >
                {
                    ({ name: tabName }) => {
                        switch (tabName) {
                            case 'normal':
                                return (
                                    <BlockishGroupControl
                                        label={__('Background', 'blockish')}
                                        type="BlockishBackground"
                                        slug="background"
                                    />
                                )
                            case 'hover':
                                return (
                                    <>
                                        <BlockishGroupControl
                                            label={__('Hover Background', 'blockish')}
                                            type="BlockishBackground"
                                            slug="backgroundHover"
                                        />
                                        <BlockishControl
                                            type="BlockishRangeControl"
                                            label={__('Hover Transition (s)', 'blockish')}
                                            slug="backgroundHoverTransition"
                                            min="0"
                                            max="3"
                                            step="0.1"
                                        />
                                    </>
                                )
                        }
                    }
                }
            </BlockishControl>
        </BlockishControl>
    );
}
export default Background;