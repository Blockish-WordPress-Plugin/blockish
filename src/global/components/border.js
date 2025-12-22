import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
const Border = ({ name }) => {
    const { BlockishControl, BlockishGroupControl, BlockishResponsiveControl } = window?.blockish?.controls;
    const borderExcludes = applyFilters('blockish.advancedControl.border.exclude', new Set([]));
    const borderBorderExcludes = applyFilters('blockish.advancedControl.border.border.exclude', new Set([]));
    const borderBorderRadiusExcludes = applyFilters('blockish.advancedControl.border.borderRadius.exclude', new Set([]));
    const borderBoxShadowExcludes = applyFilters('blockish.advancedControl.border.boxShadow.exclude', new Set([]));

    if (borderExcludes.has(name)) return null;

    return (
        <BlockishControl type="BlockishPanelBody" title={__('Border', 'blockish')}>
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
                                    <>
                                        {
                                            !borderBorderExcludes.has(name) && (
                                                <BlockishGroupControl
                                                    type="BlockishBorder"
                                                    label={__('Border', 'blockish')}
                                                    slug="border"
                                                />
                                            )
                                        }
                                        {
                                            !borderBorderRadiusExcludes.has(name) && (
                                                <BlockishResponsiveControl
                                                    type="BlockishBorderRadius"
                                                    label={__('Border Radius', 'blockish')}
                                                    slug="borderRadius"
                                                    left="44px"
                                                />
                                            )
                                        }
                                        {
                                            !borderBoxShadowExcludes.has(name) && (
                                                <BlockishGroupControl
                                                    type="BlockishBoxShadow"
                                                    label={__('Box Shadow', 'blockish')}
                                                    slug="boxShadow"
                                                />
                                            )
                                        }
                                    </>
                                )
                            case 'hover':
                                return (
                                    <>
                                        {
                                            !borderBorderExcludes.has(name) && (
                                                <BlockishGroupControl
                                                    type="BlockishBorder"
                                                    label={__('Border', 'blockish')}
                                                    slug="border"
                                                />
                                            )
                                        }
                                        {
                                            !borderBorderRadiusExcludes.has(name) && (
                                                <BlockishResponsiveControl
                                                    type="BlockishBorderRadius"
                                                    label={__('Border Radius', 'blockish')}
                                                    slug="borderRadius"
                                                    left="44px"
                                                />
                                            )
                                        }
                                        {
                                            !borderBoxShadowExcludes.has(name) && (
                                                <BlockishGroupControl
                                                    type="BlockishBoxShadow"
                                                    label={__('Box Shadow', 'blockish')}
                                                    slug="boxShadow"
                                                />
                                            )
                                        }
                                        <BlockishControl
                                            type="BlockishRangeControl"
                                            label={__('Hover Transition (s)', 'blockish')}
                                            slug="borderHoverTransition"
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
export default Border;