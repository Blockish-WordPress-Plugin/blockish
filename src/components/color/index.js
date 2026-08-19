import { __ } from '@wordpress/i18n';
import { PanelColorSettings, __experimentalPanelColorGradientSettings as PanelColorGradientSettings, store as blockEditorStore } from '@wordpress/block-editor';
import { BaseControl } from '@wordpress/components';
import { createColorValue, getColorValue, useColorsPerOrigin, useGradientsPerOrigin } from './utils';
import { useSelect } from '@wordpress/data';
import BlockishResetButton from '../reset-button';

const BlockishColor = ({ label, value, onChange, alpha, labelBlock = 'inline', isGradient = false, showReset = true, ...props }) => {
    const { settings } = useSelect( select => {
        const { getSettings } = select( blockEditorStore );
        return {
            settings: getSettings()?.__experimentalFeatures,
        };
    }, []);
    const gradientColors = useGradientsPerOrigin(settings);
    const colors = useColorsPerOrigin(settings);
    const hasValue = !!getColorValue(value);

    return (
        <div className="blockish-color-control blockish-control">
            {label && (
                <BaseControl.VisualLabel as="legend" __nextHasNoMarginBottom={true}>
                    {label}
                </BaseControl.VisualLabel>
            )}
            <div className="blockish-color-control__picker">
                {
                    isGradient ? (
                        <PanelColorGradientSettings
                            __experimentalIsRenderedInSidebar
                            settings={[
                                {
                                    gradientValue: getColorValue(value),
                                    label: '',
                                    onGradientChange: (value) => onChange(createColorValue(gradientColors, value, 'gradient')),
                                }
                            ]}
                            {...props}
                        />
                    ) : (
                        <PanelColorSettings
                            __experimentalIsRenderedInSidebar
                            title={""}
                            enableAlpha={alpha ? alpha : true}
                            colorSettings={[
                                {
                                    value: getColorValue(value),
                                    onChange: (value) => onChange(createColorValue(colors, value)),
                                    label: '',
                                }
                            ]}
                            {...props}
                        />
                    )
                }
                {showReset && (
                    <BlockishResetButton
                        className="blockish-color-control__reset"
                        onClick={() => onChange('')}
                        disabled={!hasValue}
                        label={__('Reset color', 'blockish')}
                    />
                )}
            </div>
        </div>
    );
}

export default BlockishColor;
