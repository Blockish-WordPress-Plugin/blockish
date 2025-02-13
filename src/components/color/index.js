import { __ } from '@wordpress/i18n';
import { PanelColorSettings, __experimentalPanelColorGradientSettings as PanelColorGradientSettings, store as blockEditorStore } from '@wordpress/block-editor';
import { createColorValue, getColorValue, useColorsPerOrigin, useGradientsPerOrigin } from './utils';
import { useSelect } from '@wordpress/data';

const BlockishColor = ({ label, value, onChange, alpha, labelBlock = 'inline', isGradient = false, ...props }) => {
    const { settings } = useSelect( select => {
        const { getSettings } = select( blockEditorStore );
        return {
            settings: getSettings()?.__experimentalFeatures,
        };
    }, []);
    const gradientColors = useGradientsPerOrigin(settings);
    const colors = useColorsPerOrigin(settings);
    
    return (
        <>
            <div className="blockish-color-control blockish-control">
                {
                    isGradient ? (
                        <PanelColorGradientSettings
                            __experimentalIsRenderedInSidebar
                            settings={[
                                {
                                    gradientValue: getColorValue(value),
                                    label: label,
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
                                    label: label,
                                }
                            ]}
                            {...props}
                        />
                    )
                }

            </div>
        </>
    );
}

export default BlockishColor;